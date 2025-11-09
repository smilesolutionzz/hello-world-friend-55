import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SOCIAL_SHARE_REWARD = 200; // SNS 공유 시 200토큰
const DAILY_SHARE_LIMIT = 3; // 일일 공유 제한

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("❌ Authentication failed:", authError);
      return new Response(
        JSON.stringify({ error: "인증이 필요합니다" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const { platform } = await req.json();
    
    if (!platform || !['kakao', 'twitter', 'facebook'].includes(platform)) {
      return new Response(
        JSON.stringify({ error: "유효하지 않은 플랫폼입니다" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`📱 Processing social share for user ${user.id} on ${platform}`);

    // 오늘 공유 횟수 확인
    const today = new Date().toISOString().split('T')[0];
    const { data: todayShares, error: shareCheckError } = await supabaseClient
      .from("referral_rewards")
      .select("id")
      .eq("referrer_id", user.id)
      .eq("reward_type", "social_share")
      .gte("created_at", `${today}T00:00:00`);

    if (shareCheckError) {
      console.error("❌ Failed to check share count:", shareCheckError);
    }

    const shareCount = todayShares?.length || 0;
    if (shareCount >= DAILY_SHARE_LIMIT) {
      return new Response(
        JSON.stringify({ 
          error: `일일 공유 제한(${DAILY_SHARE_LIMIT}회)에 도달했습니다`,
          remainingShares: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`✅ Share count: ${shareCount}/${DAILY_SHARE_LIMIT}`);

    // 토큰 지급
    const { error: tokenError } = await supabaseClient
      .from("user_tokens")
      .update({
        current_tokens: supabaseClient.rpc("increment", { x: SOCIAL_SHARE_REWARD }),
        total_purchased: supabaseClient.rpc("increment", { x: SOCIAL_SHARE_REWARD }),
        referral_bonus: supabaseClient.rpc("increment", { x: SOCIAL_SHARE_REWARD }),
      })
      .eq("user_id", user.id);

    if (tokenError) {
      console.error("❌ Failed to reward tokens:", tokenError);
      throw new Error("토큰 지급에 실패했습니다");
    }

    console.log(`💰 Rewarded ${user.id} with ${SOCIAL_SHARE_REWARD} tokens for ${platform} share`);

    // 보상 기록 저장
    const { error: rewardError } = await supabaseClient
      .from("referral_rewards")
      .insert({
        referrer_id: user.id,
        reward_type: "social_share",
        tokens_awarded: SOCIAL_SHARE_REWARD,
        referral_code: platform,
      });

    if (rewardError) {
      console.error("❌ Failed to record reward:", rewardError);
    }

    // 통계 업데이트
    const { error: statsError } = await supabaseClient
      .from("user_referrals")
      .update({
        total_bonus_tokens: supabaseClient.rpc("increment", { x: SOCIAL_SHARE_REWARD }),
      })
      .eq("user_id", user.id);

    if (statsError) {
      console.error("❌ Failed to update stats:", statsError);
    }

    console.log(`🎉 Social share reward completed!`);

    return new Response(
      JSON.stringify({
        success: true,
        reward: SOCIAL_SHARE_REWARD,
        remainingShares: DAILY_SHARE_LIMIT - shareCount - 1,
        message: `🎉 ${SOCIAL_SHARE_REWARD}토큰을 받았습니다! (오늘 ${DAILY_SHARE_LIMIT - shareCount - 1}회 남음)`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("❌ Error processing social share:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
