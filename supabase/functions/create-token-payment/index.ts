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
    const { planId, subscriptionType = 'monthly' } = await req.json();
    
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
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseAuth.auth.getUser(token);
    const user = data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    // 토큰 구독 플랜 정보 가져오기
    const { data: plan, error: planError } = await supabaseAdmin
      .from('token_subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      throw new Error("토큰 구독 플랜을 찾을 수 없습니다.");
    }

    // 결제 금액 계산
    const amount = plan.price_krw;
    
    // 주문 ID 생성
    const orderId = `token_order_${user.id}_${Date.now()}`;

    // 토스페이먼츠 결제 요청 준비
    const paymentData = {
      amount,
      orderId,
      orderName: `${plan.name} 토큰 충전 (${subscriptionType === 'yearly' ? '연간' : '월간'})`,
      customerEmail: user.email,
      customerName: user.email?.split('@')[0] || '사용자',
      successUrl: `${req.headers.get("origin")}/payment-success?orderId=${orderId}`,
      failUrl: `${req.headers.get("origin")}/payment-fail?orderId=${orderId}`,
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

    if (purchaseError) throw purchaseError;

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

    return new Response(JSON.stringify({ 
      success: true, 
      paymentData,
      clientKey: tossClientKey
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Token payment creation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});