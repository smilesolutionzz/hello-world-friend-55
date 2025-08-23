import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentKey, orderId, amount } = await req.json();
    
    if (!paymentKey || !orderId || !amount) {
      throw new Error("필수 파라미터가 누락되었습니다.");
    }

    // Supabase 클라이언트 생성
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // 토스페이먼츠 API로 결제 확인
    const tossSecretKey = Deno.env.get("TOSS_PAYMENTS_SECRET_KEY");
    const authHeader = `Basic ${btoa(`${tossSecretKey}:`)}`;

    const tossResponse = await fetch(
      `https://api.tosspayments.com/v1/payments/confirm`,
      {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      }
    );

    if (!tossResponse.ok) {
      const errorData = await tossResponse.json();
      throw new Error(`토스페이먼츠 확인 실패: ${errorData.message}`);
    }

    const paymentData = await tossResponse.json();
    console.log("Payment confirmed:", paymentData);

    // 결제 내역 업데이트 및 플랜 정보 가져오기
    const { data: purchase, error: updateError } = await supabaseAdmin
      .from('token_purchases')
      .update({
        status: 'completed',
        toss_payment_key: paymentKey,
        payment_method: paymentData.method || 'card'
      })
      .eq('order_id', orderId)
      .select(`
        *,
        plan:token_subscription_plans(
          id,
          name,
          token_count,
          price_krw
        )
      `)
      .single();

    if (updateError) throw updateError;

    if (!purchase?.plan) {
      throw new Error("토큰 플랜 정보를 찾을 수 없습니다.");
    }

    // 사용자 토큰 잔액 업데이트
    const { data: currentTokens, error: tokenError } = await supabaseAdmin
      .from('user_tokens')
      .select('*')
      .eq('user_id', purchase.user_id)
      .single();

    if (tokenError && tokenError.code !== 'PGRST116') {
      throw tokenError;
    }

    const newTokenCount = (currentTokens?.current_tokens || 0) + purchase.plan.token_count;
    const newTotalPurchased = (currentTokens?.total_purchased || 0) + purchase.plan.token_count;

    if (currentTokens) {
      // 기존 토큰 업데이트
      const { error: updateTokenError } = await supabaseAdmin
        .from('user_tokens')
        .update({
          current_tokens: newTokenCount,
          total_purchased: newTotalPurchased,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', purchase.user_id);

      if (updateTokenError) throw updateTokenError;
    } else {
      // 새 토큰 레코드 생성
      const { error: insertTokenError } = await supabaseAdmin
        .from('user_tokens')
        .insert({
          user_id: purchase.user_id,
          current_tokens: newTokenCount,
          total_purchased: newTotalPurchased,
          total_used: 0,
          referral_bonus: 0,
          last_daily_bonus_date: new Date().toISOString().split('T')[0]
        });

      if (insertTokenError) throw insertTokenError;
    }

    // 사용량 추적 기록
    const { error: trackingError } = await supabaseAdmin
      .from('usage_tracking')
      .insert({
        user_id: purchase.user_id,
        feature_type: 'token_purchase',
        usage_date: new Date().toISOString().split('T')[0],
        count: purchase.plan.token_count
      });

    if (trackingError) console.error('Usage tracking error:', trackingError);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "토큰이 성공적으로 충전되었습니다.",
      tokens_added: purchase.plan.token_count,
      new_balance: newTokenCount
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Token payment confirmation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});