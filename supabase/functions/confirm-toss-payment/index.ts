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
    
    console.log('Payment confirmation request:', { paymentKey, orderId, amount });
    
    // Supabase 클라이언트 생성 (서비스 롤)
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // 토스페이먼츠 결제 승인 API 호출
    const secretKey = Deno.env.get('TOSS_SECRET_KEY');
    if (!secretKey) {
      throw new Error('TOSS_SECRET_KEY is not configured');
    }
    const encryptedSecretKey = btoa(secretKey + ':');

    console.log('Calling TossPayments API with orderId:', orderId);

    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encryptedSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const result = await response.json();
    
    console.log('TossPayments API response:', {
      status: response.status,
      ok: response.ok,
      result: result
    });

    if (!response.ok) {
      console.error('TossPayments API error:', result);
      throw new Error(result.message || '결제 승인에 실패했습니다.');
    }

    // 결제 내역 업데이트
    const { data: payment, error: paymentUpdateError } = await supabaseService
      .from('payment_history')
      .update({
        payment_key: paymentKey,
        status: 'completed',
        payment_method: result.method
      })
      .eq('toss_order_id', orderId)  // 'order_id' 대신 'toss_order_id' 사용
      .select('*, user_id')
      .single();

    if (paymentUpdateError) {
      console.error('Payment update error:', paymentUpdateError);
      throw paymentUpdateError;
    }

    // 결제된 주문에서 플랜 ID 추출 (주문명에서 플랜 정보 추출 또는 별도 테이블 조회)
    // 여기서는 간단히 주문명 기반으로 플랜 결정
    const planName = result.orderName.includes('프로') ? '프로' : 
                     result.orderName.includes('프리미엄') ? '프리미엄' : '무료';
    const subscriptionType = result.orderName.includes('연간') ? 'yearly' : 'monthly';

    // 플랜 ID 조회
    const { data: plan, error: planError } = await supabaseService
      .from('subscription_plans')
      .select('*')
      .eq('name', planName)
      .single();

    if (planError || !plan) {
      throw new Error("구독 플랜을 찾을 수 없습니다.");
    }

    // 구독 생성 또는 업데이트
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + (subscriptionType === 'yearly' ? 12 : 1));

    // 기존 구독 취소
    await supabaseService
      .from('user_subscriptions')
      .update({ status: 'cancelled' })
      .eq('user_id', payment.user_id)
      .eq('status', 'active');

    // 새 구독 생성
    const { error: subError } = await supabaseService
      .from('user_subscriptions')
      .insert({
        user_id: payment.user_id,
        plan_id: plan.id,
        subscription_type: subscriptionType,
        payment_method: 'toss',
        current_period_start: startDate.toISOString().split('T')[0],
        current_period_end: endDate.toISOString().split('T')[0],
        status: 'active'
      });

    if (subError) throw subError;

    // 결제 내역에 구독 ID 업데이트
    const { data: subscription } = await supabaseService
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', payment.user_id)
      .eq('status', 'active')
      .single();

    if (subscription) {
      await supabaseService
        .from('payment_history')
        .update({ subscription_id: subscription.id })
        .eq('id', payment.id);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "결제가 완료되었습니다.",
      paymentResult: result 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error('Payment confirmation error:', error);
    const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error');
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});