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

    // 구독 플랜 정보 가져오기
    const { data: plan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      throw new Error("구독 플랜을 찾을 수 없습니다.");
    }

    // 무료 플랜인 경우 바로 구독 생성
    if (plan.price === 0) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + (subscriptionType === 'yearly' ? 12 : 1));

      const { error: subError } = await supabaseAdmin
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          subscription_type: subscriptionType,
          current_period_start: startDate.toISOString().split('T')[0],
          current_period_end: endDate.toISOString().split('T')[0],
          status: 'active'
        });

      if (subError) throw subError;

      return new Response(JSON.stringify({ success: true, message: "무료 구독이 활성화되었습니다." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========== 1개월 무료 체험 체크 (프리미엄 플랜 신규 가입자만) ==========
    let isFreeTrial = false;
    const isPremiumPlan = plan.type === 'premium' || plan.type === 'lifetime';

    if (isPremiumPlan) {
      // 1. 이전에 프리미엄 구독 이력이 있는지 확인
      const { data: previousSubs } = await supabaseAdmin
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .in('subscription_type', ['premium', 'lifetime'])
        .limit(1);

      // 2. 무료 체험 사용 이력 확인
      const { data: existingTrial } = await supabaseAdmin
        .from('user_free_trials')
        .select('id')
        .eq('user_id', user.id)
        .eq('plan_type', 'premium')
        .limit(1);

      // 이전 구독이 없고, 무료 체험을 사용한 적이 없으면 무료 체험 적용
      if ((!previousSubs || previousSubs.length === 0) && (!existingTrial || existingTrial.length === 0)) {
        isFreeTrial = true;
        console.log('Free trial eligible for user:', user.id);
      }
    }

    // 결제 금액 계산 (무료 체험인 경우 0원)
    let amount = subscriptionType === 'yearly' ? plan.yearly_price : plan.price;
    
    if (isFreeTrial) {
      amount = 0;
    }

    // 무료 체험인 경우 바로 구독 생성 (결제 없이)
    if (isFreeTrial && amount === 0) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1개월 무료

      // 무료 체험 기록 저장
      const { error: trialError } = await supabaseAdmin
        .from('user_free_trials')
        .insert({
          user_id: user.id,
          plan_type: 'premium',
          trial_started_at: startDate.toISOString(),
          trial_ends_at: endDate.toISOString(),
          is_converted: false
        });

      if (trialError) {
        console.error('Failed to save free trial record:', trialError);
      }

      // 구독 생성
      const { error: subError } = await supabaseAdmin
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          subscription_type: 'premium',
          current_period_start: startDate.toISOString().split('T')[0],
          current_period_end: endDate.toISOString().split('T')[0],
          status: 'active',
          payment_method: 'free_trial'
        });

      if (subError) throw subError;

      return new Response(JSON.stringify({ 
        success: true, 
        isFreeTrial: true,
        message: "🎉 1개월 무료 체험이 시작되었습니다!",
        trialEndsAt: endDate.toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // 주문 ID 생성
    const orderId = `order_${user.id}_${Date.now()}`;

    // 토스페이먼츠 결제 요청 준비
    const paymentData = {
      amount,
      orderId,
      orderName: `${plan.name} 구독 (${subscriptionType === 'yearly' ? '연간' : '월간'})`,
      customerEmail: user.email,
      customerName: user.email?.split('@')[0] || '사용자',
      successUrl: `${req.headers.get("origin")}/payment-success?orderId=${orderId}`,
      failUrl: `${req.headers.get("origin")}/payment-fail?orderId=${orderId}`,
    };

    // 결제 내역 저장 (Service Role 키 사용)
    const { error: paymentError } = await supabaseAdmin
      .from('payment_history')
      .insert({
        user_id: user.id,
        toss_order_id: orderId,
        amount,
        plan_id: planId,
        subscription_type: subscriptionType,
        status: 'pending'
      });

    if (paymentError) throw paymentError;

    // 토스페이먼츠 결제 요청
    const tossClientKey = Deno.env.get("TOSS_PAYMENTS_CLIENT_KEY");
    const tossSecretKey = Deno.env.get("TOSS_PAYMENTS_SECRET_KEY");
    
    console.log('TossPayments keys check:', {
      clientKeyExists: !!tossClientKey,
      secretKeyExists: !!tossSecretKey,
      clientKeyPrefix: tossClientKey?.substring(0, 10) + '...',
    });
    
    if (!tossClientKey || !tossSecretKey) {
      throw new Error("토스페이먼츠 API 키가 설정되지 않았습니다.");
    }

    console.log('Payment request created:', paymentData);

    return new Response(JSON.stringify({ 
      success: true, 
      paymentData,
      clientKey: tossClientKey,
      isFreeTrial: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error('Payment creation error:', error);
    const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error');
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
