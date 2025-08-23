import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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
    console.log('=== Stripe 결제 확인 시작 ===');
    
    const { sessionId } = await req.json();
    console.log('세션 ID:', sessionId);
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Stripe 초기화
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Stripe 세션 조회
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Stripe 세션 상태:', session.payment_status);
    
    if (session.payment_status !== 'paid') {
      throw new Error("결제가 완료되지 않았습니다");
    }

    const metadata = session.metadata;
    if (!metadata?.user_id || !metadata?.plan_id) {
      throw new Error("결제 메타데이터가 없습니다");
    }

    const isTokenPackage = metadata.is_token_package === 'true';

    if (isTokenPackage) {
      // 토큰 패키지 결제 처리
      console.log('토큰 패키지 결제 처리 시작');

      // 토큰 패키지 정보 조회
      const { data: tokenPackage, error: packageError } = await supabaseAdmin
        .from('token_packages')
        .select('*')
        .eq('id', metadata.plan_id)
        .single();

      if (packageError || !tokenPackage) {
        throw new Error("토큰 패키지를 찾을 수 없습니다");
      }

      // 토큰 주문 상태 업데이트
      const { error: orderUpdateError } = await supabaseAdmin
        .from('token_orders')
        .update({
          status: 'completed',
          payment_key: session.payment_intent as string
        })
        .eq('user_id', metadata.user_id)
        .eq('order_id', metadata.order_id);

      if (orderUpdateError) {
        console.error('토큰 주문 업데이트 오류:', orderUpdateError);
      }

      // 사용자 토큰 잔액 업데이트
      const { data: currentTokens, error: tokenError } = await supabaseAdmin
        .from('user_tokens')
        .select('*')
        .eq('user_id', metadata.user_id)
        .maybeSingle();

      if (tokenError) {
        console.error('토큰 조회 오류:', tokenError);
        throw new Error("토큰 정보 조회에 실패했습니다");
      }

      if (currentTokens) {
        // 기존 토큰에 추가
        await supabaseAdmin
          .from('user_tokens')
          .update({
            current_tokens: currentTokens.current_tokens + tokenPackage.token_count,
            total_purchased: currentTokens.total_purchased + tokenPackage.token_count
          })
          .eq('user_id', metadata.user_id);
      } else {
        // 새 토큰 레코드 생성
        await supabaseAdmin
          .from('user_tokens')
          .insert({
            user_id: metadata.user_id,
            current_tokens: tokenPackage.token_count,
            total_purchased: tokenPackage.token_count
          });
      }

      console.log(`${tokenPackage.token_count}개 토큰 지급 완료`);

      return new Response(JSON.stringify({ 
        success: true,
        type: 'token',
        tokens_added: tokenPackage.token_count,
        payment_intent: session.payment_intent
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else {
      // 구독 결제 처리
      console.log('구독 결제 처리 시작');

      // 구독 정보 조회
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      console.log('구독 정보:', subscription.id);

      // 구독 플랜 조회
      const { data: plan, error: planError } = await supabaseAdmin
        .from('subscription_plans')
        .select('*')
        .eq('id', metadata.plan_id)
        .single();

      if (planError || !plan) {
        throw new Error("구독 플랜을 찾을 수 없습니다");
      }

      // 기존 활성 구독 취소
      const { error: cancelError } = await supabaseAdmin
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', metadata.user_id)
        .eq('status', 'active');

      if (cancelError) {
        console.error('기존 구독 취소 오류:', cancelError);
      }

      // 새 구독 생성
      const subscriptionEndDate = new Date(subscription.current_period_end * 1000);
      
      const { error: subscriptionError } = await supabaseAdmin
        .from('user_subscriptions')
        .insert({
          user_id: metadata.user_id,
          plan_id: metadata.plan_id,
          subscription_type: metadata.subscription_type || 'monthly',
          status: 'active',
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString().split('T')[0],
          current_period_end: subscriptionEndDate.toISOString().split('T')[0],
          payment_method: 'stripe'
        });

      if (subscriptionError) {
        console.error('구독 생성 오류:', subscriptionError);
        throw new Error("구독 생성에 실패했습니다");
      }

      // 결제 내역 업데이트
      const { error: paymentUpdateError } = await supabaseAdmin
        .from('payment_history')
        .update({
          status: 'completed',
          payment_key: session.payment_intent as string
        })
        .eq('user_id', metadata.user_id)
        .eq('toss_order_id', metadata.order_id);

      if (paymentUpdateError) {
        console.error('결제 내역 업데이트 오류:', paymentUpdateError);
      }

      // 월간 토큰 지급 (플랜에 따라)
      let tokensToAdd = 0;
      if (plan.name === '스타터 팩') tokensToAdd = 50;
      else if (plan.name === '프리미엄 팩') tokensToAdd = 200;
      else if (plan.name === '프로 팩') tokensToAdd = 1000;

      if (tokensToAdd > 0) {
        // 기존 토큰 잔액 조회
        const { data: currentTokens, error: tokenError } = await supabaseAdmin
          .from('user_tokens')
          .select('*')
          .eq('user_id', metadata.user_id)
          .maybeSingle();

        if (tokenError) {
          console.error('토큰 조회 오류:', tokenError);
        } else {
          if (currentTokens) {
            // 기존 토큰에 추가
            await supabaseAdmin
              .from('user_tokens')
              .update({
                current_tokens: currentTokens.current_tokens + tokensToAdd,
                total_purchased: currentTokens.total_purchased + tokensToAdd
              })
              .eq('user_id', metadata.user_id);
          } else {
            // 새 토큰 레코드 생성
            await supabaseAdmin
              .from('user_tokens')
              .insert({
                user_id: metadata.user_id,
                current_tokens: tokensToAdd,
                total_purchased: tokensToAdd
              });
          }
          
          console.log(`${tokensToAdd}개 토큰 지급 완료`);
        }
      }

      console.log('=== 구독 결제 확인 완료 ===');
      
      return new Response(JSON.stringify({ 
        success: true,
        type: 'subscription',
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_period_end: subscriptionEndDate,
          tokens_added: tokensToAdd
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (error) {
    console.error('=== Stripe 결제 확인 오류 ===');
    console.error(error);
    
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});