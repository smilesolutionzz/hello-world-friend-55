import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const REFERRAL_REWARDS = {
  inviter: 10,  // 추천인에게 10토큰
  invitee: 10,  // 피추천인에게 10토큰
};

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

    const { referralCode } = await req.json();
    
    if (!referralCode) {
      return new Response(
        JSON.stringify({ error: "추천 코드를 입력해주세요" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`🔍 Processing referral for user ${user.id} with code: ${referralCode}`);

    // 추천 코드로 추천인 찾기
    const { data: referrerData, error: referrerError } = await supabaseClient
      .from("user_referrals")
      .select("user_id")
      .eq("referral_code", referralCode)
      .single();

    if (referrerError || !referrerData) {
      console.error("❌ Invalid referral code:", referralCode);
      return new Response(
        JSON.stringify({ error: "유효하지 않은 추천 코드입니다" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const referrerId = referrerData.user_id;

    // 자기 자신 추천 방지
    if (referrerId === user.id) {
      return new Response(
        JSON.stringify({ error: "자신의 추천 코드는 사용할 수 없습니다" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // 이미 추천받은 적 있는지 확인
    const { data: existingReward } = await supabaseClient
      .from("referral_rewards")
      .select("id")
      .eq("referee_id", user.id)
      .eq("reward_type", "friend_invite")
      .single();

    if (existingReward) {
      return new Response(
        JSON.stringify({ error: "이미 추천 코드를 사용하셨습니다" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`✅ Valid referral: ${referrerId} -> ${user.id}`);

    // 추천인에게 토큰 지급
    const { error: referrerTokenError } = await supabaseClient
      .from("user_tokens")
      .update({
        current_tokens: supabaseClient.rpc("increment", { x: REFERRAL_REWARDS.inviter }),
        total_purchased: supabaseClient.rpc("increment", { x: REFERRAL_REWARDS.inviter }),
        referral_bonus: supabaseClient.rpc("increment", { x: REFERRAL_REWARDS.inviter }),
      })
      .eq("user_id", referrerId);

    if (referrerTokenError) {
      console.error("❌ Failed to reward referrer:", referrerTokenError);
    } else {
      console.log(`💰 Rewarded referrer ${referrerId} with ${REFERRAL_REWARDS.inviter} tokens`);
    }

    // 피추천인에게 토큰 지급
    const { error: refereeTokenError } = await supabaseClient
      .from("user_tokens")
      .update({
        current_tokens: supabaseClient.rpc("increment", { x: REFERRAL_REWARDS.invitee }),
        total_purchased: supabaseClient.rpc("increment", { x: REFERRAL_REWARDS.invitee }),
        referral_bonus: supabaseClient.rpc("increment", { x: REFERRAL_REWARDS.invitee }),
      })
      .eq("user_id", user.id);

    if (refereeTokenError) {
      console.error("❌ Failed to reward referee:", refereeTokenError);
    } else {
      console.log(`💰 Rewarded referee ${user.id} with ${REFERRAL_REWARDS.invitee} tokens`);
    }

    // 보상 기록 저장
    const { error: rewardError } = await supabaseClient
      .from("referral_rewards")
      .insert({
        referrer_id: referrerId,
        referee_id: user.id,
        reward_type: "friend_invite",
        tokens_awarded: REFERRAL_REWARDS.inviter + REFERRAL_REWARDS.invitee,
        referral_code: referralCode,
      });

    if (rewardError) {
      console.error("❌ Failed to record reward:", rewardError);
    }

    // 추천인 통계 업데이트
    const { error: statsError } = await supabaseClient
      .from("user_referrals")
      .update({
        total_invites: supabaseClient.rpc("increment", { x: 1 }),
        total_bonus_tokens: supabaseClient.rpc("increment", { x: REFERRAL_REWARDS.inviter }),
      })
      .eq("user_id", referrerId);

    if (statsError) {
      console.error("❌ Failed to update stats:", statsError);
    }

    console.log(`🎉 Referral process completed successfully!`);

    return new Response(
      JSON.stringify({
        success: true,
        inviterReward: REFERRAL_REWARDS.inviter,
        inviteeReward: REFERRAL_REWARDS.invitee,
        message: `🎉 친구도 10토큰, 나도 10토큰을 받았습니다!`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("❌ Error processing referral:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
