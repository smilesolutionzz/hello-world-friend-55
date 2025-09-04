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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
      error: authError
    } = await supabaseClient.auth.getUser();

    console.log('Auth check:', { user: user?.id, authError });

    if (!user || authError) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, referralCode } = await req.json();

    switch (action) {
      case 'generateCode':
        return await generateReferralCode(supabaseClient, user.id);
      case 'applyCode':
        return await applyReferralCode(supabaseClient, user.id, referralCode);
      case 'getReferralStats':
        return await getReferralStats(supabaseClient, user.id);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error in referral-system function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateReferralCode(supabaseClient: any, userId: string) {
  try {
    // 기존 추천 코드가 있는지 확인
    const { data: existingReferral } = await supabaseClient
      .from('referrals')
      .select('referral_code')
      .eq('referrer_id', userId)
      .eq('status', 'pending')
      .single();

    if (existingReferral) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          referralCode: existingReferral.referral_code 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 새 추천 코드 생성
    const { data: newCode } = await supabaseClient.rpc('generate_referral_code');
    
    if (!newCode) {
      throw new Error('Failed to generate referral code');
    }

    // 추천 기록 생성
    const { error: insertError } = await supabaseClient
      .from('referrals')
      .insert({
        referrer_id: userId,
        referral_code: newCode,
        status: 'pending'
      });

    if (insertError) {
      throw new Error(`Failed to create referral record: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        referralCode: newCode 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating referral code:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function applyReferralCode(supabaseClient: any, userId: string, referralCode: string) {
  try {
    // 클라이언트 IP 주소 가져오기 (간단한 구현)
    const clientIp = '127.0.0.1'; // 실제로는 request에서 추출해야 함
    
    // 개선된 추천 보상 처리 함수 호출
    const { data: result } = await supabaseClient.rpc('process_referral_reward_v2', {
      p_referral_code: referralCode,
      p_referee_id: userId,
      p_ip_address: clientIp,
      p_device_fingerprint: null
    });

    console.log('Referral processing result:', result);

    if (result && result.success) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: result.message,
          referee_bonus: result.referee_bonus,
          referrer_pending: result.referrer_pending
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result?.error || '추천 코드 처리 중 오류가 발생했습니다.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error applying referral code:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: '추천 코드 처리 중 오류가 발생했습니다.' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getReferralStats(supabaseClient: any, userId: string) {
  try {
    // 내가 추천한 사람들 수
    const { data: referralCount } = await supabaseClient
      .from('referrals')
      .select('id', { count: 'exact' })
      .eq('referrer_id', userId)
      .eq('status', 'completed');

    // 추천으로 받은 총 토큰
    const { data: totalRewards } = await supabaseClient
      .from('referrals')
      .select('tokens_awarded')
      .eq('referrer_id', userId)
      .eq('status', 'completed');

    const totalTokens = totalRewards?.reduce((sum, reward) => sum + reward.tokens_awarded, 0) || 0;

    // 내 추천 코드
    const { data: myReferralCode } = await supabaseClient
      .from('referrals')
      .select('referral_code')
      .eq('referrer_id', userId)
      .eq('status', 'pending')
      .single();

    return new Response(
      JSON.stringify({ 
        success: true,
        stats: {
          referralCount: referralCount?.length || 0,
          totalTokensEarned: totalTokens,
          myReferralCode: myReferralCode?.referral_code || null,
          pendingRewards: 0, // 7일 후 지급 예정인 보상 (추후 구현)
          dailyLimit: 3,
          todayUsed: 0 // 오늘 사용한 추천 횟수 (추후 구현)
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}