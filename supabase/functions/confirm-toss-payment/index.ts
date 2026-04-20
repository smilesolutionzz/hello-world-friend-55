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
    // 1. 사용자 인증 확인
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: '인증이 필요합니다.' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    const { data: userData, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: '인증이 필요합니다.' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authenticatedUserId = userData.user.id;

    const { paymentKey, orderId, amount } = await req.json();
    
    console.log('Payment confirmation request:', { orderId, amount });
    
    // Supabase 클라이언트 생성 (서비스 롤)
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // 토스페이먼츠 결제 승인 API 호출
    const secretKey = Deno.env.get('TOSS_SECRET_KEY');
    if (!secretKey) {
      console.error('TOSS_SECRET_KEY is not configured');
      return new Response(JSON.stringify({ error: '결제 처리 중 오류가 발생했습니다.' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const encryptedSecretKey = btoa(secretKey + ':');

    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encryptedSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('TossPayments API error:', result);
      return new Response(JSON.stringify({ error: '결제 승인에 실패했습니다.' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 결제 내역 업데이트 - 사용자 소유권 확인 포함
    let payment: any = null;
    const { data: updatedPayment, error: paymentUpdateError } = await supabaseService
      .from('payment_history')
      .update({
        payment_key: paymentKey,
        status: 'completed',
        payment_method: result.method
      })
      .eq('toss_order_id', orderId)
      .eq('user_id', authenticatedUserId) // 소유권 확인
      .select('*, user_id')
      .maybeSingle();

    if (paymentUpdateError) {
      console.error('Payment update error:', paymentUpdateError);
      return new Response(JSON.stringify({ error: '결제 처리 중 오류가 발생했습니다.' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!updatedPayment) {
      // 사전 생성된 주문이 없을 때 복구 로직
      try {
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
            user_id: authenticatedUserId,
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
          return new Response(JSON.stringify({ error: '결제 처리 중 오류가 발생했습니다.' }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        payment = inserted;
      } catch (fallbackErr) {
        console.error('Payment fallback creation failed:', fallbackErr);
        return new Response(JSON.stringify({ error: '결제 처리 중 오류가 발생했습니다.' }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      payment = updatedPayment;
    }

    // 결제 유형 확인 (토큰 구매 vs 구독)
    if (payment.subscription_type === 'token' && payment.token_package_id) {
      console.log('Processing token purchase for user:', payment.user_id);
      
      const { data: tokenBalance, error: balanceError } = await supabaseService
        .from('user_tokens')
        .select('*')
        .eq('user_id', payment.user_id)
        .maybeSingle();

      if (balanceError) {
        console.error('Token balance error:', balanceError);
        return new Response(JSON.stringify({ error: '결제 처리 중 오류가 발생했습니다.' }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const currentTokens = tokenBalance?.current_tokens || 0;
      const newTokenAmount = currentTokens + payment.token_amount;

      if (tokenBalance) {
        const { error: updateError } = await supabaseService
          .from('user_tokens')
          .update({ 
            current_tokens: newTokenAmount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', payment.user_id);

        if (updateError) {
          console.error('Token update error:', updateError);
          return new Response(JSON.stringify({ error: '결제 처리 중 오류가 발생했습니다.' }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        const { error: insertError } = await supabaseService
          .from('user_tokens')
          .insert({
            user_id: payment.user_id,
            current_tokens: newTokenAmount,
            total_purchased: payment.token_amount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Token insert error:', insertError);
          return new Response(JSON.stringify({ error: '결제 처리 중 오류가 발생했습니다.' }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      console.log(`✅ Added ${payment.token_amount} tokens to user ${payment.user_id}`);
      
    } else {
      // 구독 결제 처리
      const planName = result.orderName.includes('프로') ? '프로' : 
                       result.orderName.includes('프리미엄') ? '프리미엄' : '무료';
      const subscriptionType = result.orderName.includes('연간') ? 'yearly' : 'monthly';

      const { data: plan, error: planError } = await supabaseService
        .from('subscription_plans')
        .select('*')
        .eq('name', planName)
        .single();

      if (planError || !plan) {
        console.error('Plan not found:', planError);
        return new Response(JSON.stringify({ error: '결제 처리 중 오류가 발생했습니다.' }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + (subscriptionType === 'yearly' ? 12 : 1));

      await supabaseService
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', payment.user_id)
        .eq('status', 'active');

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

      if (subError) {
        console.error('Subscription error:', subError);
        return new Response(JSON.stringify({ error: '결제 처리 중 오류가 발생했습니다.' }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

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

      // 🎁 구독자 무료 상담권 자동 지급 (월 1회)
      try {
        const { data: creditId } = await supabaseService.rpc('grant_subscriber_consultation_credit', {
          p_user_id: payment.user_id,
        });
        if (creditId) {
          console.log('✅ Subscriber consultation credit granted:', creditId);
        }
      } catch (e) {
        console.error('⚠️ Failed to grant consultation credit:', e);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "결제가 완료되었습니다.",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error('Payment confirmation error:', error);
    return new Response(JSON.stringify({ error: '결제 처리 중 오류가 발생했습니다.' }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
