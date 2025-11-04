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

    // 결제 내역 업데이트 시도 + 부족 시 복구 로직
    let payment: any = null;
    const { data: updatedPayment, error: paymentUpdateError } = await supabaseService
      .from('payment_history')
      .update({
        payment_key: paymentKey,
        status: 'completed',
        payment_method: result.method
      })
      .eq('toss_order_id', orderId)  // 'order_id' 대신 'toss_order_id' 사용
      .select('*, user_id')
      .maybeSingle();

    if (paymentUpdateError) {
      console.error('Payment update error:', paymentUpdateError);
      throw paymentUpdateError;
    }

    if (!updatedPayment) {
      // 사전 생성된 주문이 없을 때(과거 경로) 복구 로직: 인증된 사용자 기반으로 결제내역 생성 후 처리
      try {
        const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
        if (!authHeader) {
          throw new Error('Authorization 헤더가 없습니다.');
        }
        const token = authHeader.replace('Bearer ', '');
        const supabaseAuth = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        );
        const { data: userData, error: authError } = await supabaseAuth.auth.getUser(token);
        if (authError || !userData?.user) {
          console.error('Auth fallback failed:', authError);
          throw new Error('사용자 인증 실패로 결제내역 복구 불가');
        }

        const user = userData.user;

        // 금액 또는 주문명으로 토큰 패키지 매칭
        let tokenPackage: any = null;
        const { data: pkgByPrice } = await supabaseService
          .from('token_packages')
          .select('*')
          .eq('price_krw', result.totalAmount)
          .eq('is_active', true)
          .maybeSingle();
        if (pkgByPrice) tokenPackage = pkgByPrice;

        if (!tokenPackage && typeof result.orderName === 'string') {
          const match = result.orderName.match(/(\d+)\s*토큰|\((\d+)토큰\)/);
          const count = match ? parseInt(match[1] || match[2], 10) : null;
          if (count) {
            const { data: pkgByCount } = await supabaseService
              .from('token_packages')
              .select('*')
              .eq('token_count', count)
              .eq('is_active', true)
              .maybeSingle();
            if (pkgByCount) tokenPackage = pkgByCount;
          }
        }

        const { data: inserted, error: insertError } = await supabaseService
          .from('payment_history')
          .insert({
            user_id: user.id,
            toss_order_id: orderId,
            amount: result.totalAmount,
            plan_id: null,
            subscription_type: 'token',
            status: 'completed',
            token_package_id: tokenPackage?.id ?? null,
            token_amount: tokenPackage?.token_count ?? null,
            payment_key: paymentKey,
            payment_method: result.method
          })
          .select('*, user_id')
          .maybeSingle();

        if (insertError) {
          console.error('Fallback payment insert error:', insertError);
          throw insertError;
        }

        payment = inserted;
      } catch (fallbackErr) {
        console.error('Payment fallback creation failed:', fallbackErr);
        throw new Error('결제 내역을 찾을 수 없습니다. (사전 생성된 주문 없음)');
      }
    } else {
      payment = updatedPayment;
    }

    // 결제 유형 확인 (토큰 구매 vs 구독)
    if (payment.subscription_type === 'token' && payment.token_package_id) {
      // 토큰 구매 처리
      console.log('Processing token purchase for user:', payment.user_id);
      
      // 사용자의 현재 토큰 잔액 조회
      const { data: tokenBalance, error: balanceError } = await supabaseService
        .from('token_balances')
        .select('*')
        .eq('user_id', payment.user_id)
        .maybeSingle();

      if (balanceError) {
        throw balanceError;
      }

      const currentTokens = tokenBalance?.current_tokens || 0;
      const newTokenAmount = currentTokens + payment.token_amount;

      // 토큰 잔액 업데이트 또는 생성
      if (tokenBalance) {
        const { error: updateError } = await supabaseService
          .from('token_balances')
          .update({ 
            current_tokens: newTokenAmount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', payment.user_id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabaseService
          .from('token_balances')
          .insert({
            user_id: payment.user_id,
            current_tokens: newTokenAmount,
            total_purchased: payment.token_amount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      console.log(`✅ Added ${payment.token_amount} tokens to user ${payment.user_id}`);
      
    } else {
      // 구독 결제 처리 (기존 로직)
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