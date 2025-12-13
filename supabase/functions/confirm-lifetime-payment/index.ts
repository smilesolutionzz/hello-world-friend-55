import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LIFETIME_PLAN_ID = "b30ec367-76d3-48cf-a07e-c6acb5f67795";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Starting lifetime payment confirmation...");

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // 사용자 인증 확인
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header missing");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseAuth.auth.getUser(token);
    const user = userData.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    console.log("✅ User authenticated:", user.id);

    const { paymentKey, orderId, amount } = await req.json();

    if (!paymentKey || !orderId || !amount) {
      throw new Error("Missing required payment fields");
    }

    // 주문 확인 및 검증
    const { data: order, error: orderError } = await supabaseAdmin
      .from('website_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error("주문을 찾을 수 없습니다.");
    }

    if (order.user_id !== user.id) {
      throw new Error("주문 권한이 없습니다.");
    }

    if (order.total_price !== amount) {
      throw new Error("결제 금액이 일치하지 않습니다.");
    }

    if (order.status === 'paid' || order.status === 'completed') {
      throw new Error("이미 처리된 주문입니다.");
    }

    // 토스페이먼츠 결제 승인
    const secretKey = Deno.env.get("TOSS_SECRET_KEY");
    if (!secretKey) {
      throw new Error("Server configuration error");
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(`${secretKey}:`);
    const base64 = btoa(String.fromCharCode(...data));

    console.log("🎯 Confirming payment with Toss...");

    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${base64}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ paymentKey, orderId, amount })
    });

    const tossData = await tossResponse.json();

    if (!tossResponse.ok) {
      console.error("❌ Toss confirm failed:", tossData);
      throw new Error(tossData.message || "결제 승인에 실패했습니다.");
    }

    console.log("✅ Payment confirmed with Toss");

    // 주문 상태 업데이트
    await supabaseAdmin
      .from('website_orders')
      .update({ 
        status: 'paid',
        stripe_payment_id: tossData.paymentKey,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    // 평생이용권 구독 생성
    const { error: subscriptionError } = await supabaseAdmin
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        plan_id: LIFETIME_PLAN_ID,
        subscription_type: 'lifetime',
        status: 'active',
        is_lifetime: true,
        current_period_start: new Date().toISOString().split('T')[0],
        current_period_end: '2099-12-31' // 평생이용권은 만료 없음
      });

    if (subscriptionError) {
      console.error("❌ Subscription creation error:", subscriptionError);
      // 결제는 성공했으니 수동 처리 필요 알림
      throw new Error("구독 생성 중 오류가 발생했습니다. 고객센터에 문의해주세요.");
    }

    console.log("✅ Lifetime subscription created for user:", user.id);

    // 결제 이력 기록
    await supabaseAdmin
      .from('payment_history')
      .insert({
        user_id: user.id,
        toss_order_id: orderId,
        amount: amount,
        plan_id: LIFETIME_PLAN_ID,
        subscription_type: 'lifetime',
        status: 'completed'
      });

    console.log("✅ Payment history recorded");

    return new Response(JSON.stringify({
      ok: true,
      orderId: tossData.orderId,
      amount: tossData.totalAmount ?? amount,
      method: tossData.method ?? 'CARD',
      approvedAt: tossData.approvedAt,
      message: "평생이용권이 성공적으로 활성화되었습니다!"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error('❌ Lifetime payment confirmation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      ok: false,
      error: { message } 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
