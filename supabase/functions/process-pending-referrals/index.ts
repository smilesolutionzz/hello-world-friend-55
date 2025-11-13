import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting process-pending-referrals cron job');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // 서비스 롤 키 사용
    );

    // 7일이 지난 pending_verification 상태의 추천 찾기
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: pendingReferrals, error: fetchError } = await supabaseClient
      .from('referrals')
      .select('*')
      .eq('status', 'pending_verification')
      .lte('completed_at', sevenDaysAgo.toISOString());

    if (fetchError) {
      console.error('Error fetching pending referrals:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingReferrals?.length || 0} pending referrals to process`);

    if (!pendingReferrals || pendingReferrals.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No pending referrals to process',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processedCount = 0;
    let errorCount = 0;

    // 각 추천에 대해 토큰 지급 처리
    for (const referral of pendingReferrals) {
      try {
        const referrerBonus = 3; // 추천인 보상

        // 추천인에게 토큰 지급
        const { error: tokenError } = await supabaseClient
          .from('user_tokens')
          .update({
            current_tokens: supabaseClient.rpc('increment', { x: referrerBonus }),
            referral_bonus: supabaseClient.rpc('increment', { x: referrerBonus }),
          })
          .eq('user_id', referral.referrer_id);

        if (tokenError) {
          console.error(`Error updating tokens for referrer ${referral.referrer_id}:`, tokenError);
          errorCount++;
          continue;
        }

        // 실제로는 increment를 직접 사용해야 함
        await supabaseClient.rpc('increment_user_tokens', {
          p_user_id: referral.referrer_id,
          p_amount: referrerBonus
        });

        // 추천 상태를 completed로 변경
        const { error: updateError } = await supabaseClient
          .from('referrals')
          .update({
            status: 'completed',
            is_verified: true,
            verified_at: new Date().toISOString(),
          })
          .eq('id', referral.id);

        if (updateError) {
          console.error(`Error updating referral status ${referral.id}:`, updateError);
          errorCount++;
          continue;
        }

        // 보상 기록 추가
        await supabaseClient
          .from('referral_rewards')
          .insert({
            referrer_id: referral.referrer_id,
            referee_id: referral.referee_id,
            reward_type: 'referrer_bonus',
            tokens_awarded: referrerBonus,
            referral_code: referral.referral_code,
          });

        console.log(`Successfully processed referral ${referral.id} - awarded ${referrerBonus} tokens to ${referral.referrer_id}`);
        processedCount++;

      } catch (error) {
        console.error(`Error processing referral ${referral.id}:`, error);
        errorCount++;
      }
    }

    console.log(`Completed processing: ${processedCount} successful, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${processedCount} referrals`,
        processed: processedCount,
        errors: errorCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-pending-referrals function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
