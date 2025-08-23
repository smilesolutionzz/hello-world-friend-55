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
    console.log('=== Token Payment Request Started ===');
    
    const body = await req.json();
    const { planId, subscriptionType = 'one_time' } = body;
    
    console.log('Request body:', { planId, subscriptionType });
    
    // Supabase 클라이언트 생성 (인증용)
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Service Role 키를 사용한 클라이언트 (데이터베이스 작업용)
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
    const { data, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError) {
      console.error('Auth error:', authError);
      throw new Error("Authentication failed: " + authError.message);
    }
    
    const user = data.user;
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    console.log('User authenticated:', user.id);

    // 토큰 구독 플랜 정보 가져오기
    const { data: plan, error: planError } = await supabaseAdmin
      .from('token_subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError) {
      console.error('Plan fetch error:', planError);
      throw new Error("플랜 조회 실패: " + planError.message);
    }
    
    if (!plan) {
      throw new Error("토큰 구독 플랜을 찾을 수 없습니다.");
    }
    
    console.log('Plan found:', plan.name, plan.price_krw);

    // 결제 금액 계산
    const amount = plan.price_krw;
    
    // 주문 ID 생성
    const orderId = `token_order_${user.id}_${Date.now()}`;
    console.log('Order ID generated:', orderId);

    // 토스페이먼츠 결제 요청 준비
    const paymentData = {
      amount,
      orderId,
      orderName: `${plan.name} 토큰 충전`,
      customerEmail: user.email,
      customerName: user.email?.split('@')[0] || '사용자',
      successUrl: `${req.headers.get("origin") || 'https://c6429092-3613-4c6e-a945-22140ac09444.sandbox.lovable.dev'}/token-payment-success`,
      failUrl: `${req.headers.get("origin") || 'https://c6429092-3613-4c6e-a945-22140ac09444.sandbox.lovable.dev'}/token-payment-fail`,
    };

    // 토큰 구매 내역 저장 (Service Role 키 사용)
    const { error: purchaseError } = await supabaseAdmin
      .from('token_purchases')
      .insert({
        user_id: user.id,
        plan_id: planId,
        amount: amount,
        order_id: orderId,
        status: 'pending'
      });

    if (purchaseError) {
      console.error('Purchase insert error:', purchaseError);
      throw new Error("구매 내역 저장 실패: " + purchaseError.message);
    }
    
    console.log('Purchase record created');

    // 토스페이먼츠 결제 요청
    const tossClientKey = Deno.env.get("TOSS_PAYMENTS_CLIENT_KEY");
    const tossSecretKey = Deno.env.get("TOSS_PAYMENTS_SECRET_KEY");
    
    console.log('Toss Keys Check:', { 
      hasClientKey: !!tossClientKey, 
      hasSecretKey: !!tossSecretKey,
      clientKeyLength: tossClientKey?.length,
      secretKeyLength: tossSecretKey?.length
    });
    
    if (!tossClientKey || !tossSecretKey) {
      throw new Error(`토스페이먼츠 API 키가 설정되지 않았습니다. Client: ${!!tossClientKey}, Secret: ${!!tossSecretKey}`);
    }

    console.log('=== Token Payment Request Success ===');
    
    return new Response(JSON.stringify({ 
      success: true, 
      paymentData,
      clientKey: tossClientKey
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('=== Token Payment Error ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});