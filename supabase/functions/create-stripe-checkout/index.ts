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
    console.log('=== Stripe Checkout 생성 시작 ===');
    
    const { planId, subscriptionType = 'monthly' } = await req.json();
    console.log('요청 데이터:', { planId, subscriptionType });
    
    // 토큰 패키지인지 구독 플랜인지 확인
    const isTokenPackage = subscriptionType === 'one-time';
    
    // 사용자 인증
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("인증이 필요합니다");
    
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !userData.user) {
      throw new Error("사용자 인증에 실패했습니다");
    }
    
    const user = userData.user;
    console.log('사용자 인증 완료:', user.id);

    let plan: any;
    let tableName: string;
    let orderIdPrefix: string;

    if (isTokenPackage) {
      // 토큰 패키지 조회
      const { data: tokenPackage, error: packageError } = await supabaseAdmin
        .from('token_packages')
        .select('*')
        .eq('id', planId)
        .eq('is_active', true)
        .single();

      if (packageError || !tokenPackage) {
        throw new Error("토큰 패키지를 찾을 수 없습니다");
      }
      
      plan = {
        ...tokenPackage,
        price: tokenPackage.price_krw
      };
      tableName = 'token_orders';
      orderIdPrefix = 'token';
      console.log('토큰 패키지 조회 완료:', plan.name);
    } else {
      // 구독 플랜 조회
      const { data: subscriptionPlan, error: planError } = await supabaseAdmin
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .eq('is_active', true)
        .single();

      if (planError || !subscriptionPlan) {
        throw new Error("구독 플랜을 찾을 수 없습니다");
      }
      
      plan = subscriptionPlan;
      tableName = 'payment_history';
      orderIdPrefix = 'sub';
      console.log('구독 플랜 조회 완료:', plan.name);
    }

    // Stripe 초기화
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // 기존 Stripe 고객 확인
    const customers = await stripe.customers.list({ 
      email: user.email!, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // 주문 ID 생성
    const orderId = `${orderIdPrefix}_${user.id}_${Date.now()}`;

    // 체크아웃 세션 생성
    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "krw",
            product_data: { 
              name: plan.name,
              description: plan.description 
            },
            unit_amount: plan.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        plan_id: planId,
        subscription_type: subscriptionType,
        order_id: orderId,
        is_token_package: isTokenPackage.toString()
      }
    };

    if (isTokenPackage) {
      // 토큰 패키지 - 일회성 결제
      sessionConfig.mode = "payment";
      sessionConfig.success_url = `${req.headers.get("origin")}/token-payment-success?session_id={CHECKOUT_SESSION_ID}`;
      sessionConfig.cancel_url = `${req.headers.get("origin")}/token-subscription`;
    } else {
      // 구독 플랜 - 정기 결제
      sessionConfig.line_items[0].price_data.recurring = { interval: "month" };
      sessionConfig.mode = "subscription";
      sessionConfig.success_url = `${req.headers.get("origin")}/subscription-success?session_id={CHECKOUT_SESSION_ID}`;
      sessionConfig.cancel_url = `${req.headers.get("origin")}/subscription`;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // 주문 내역 저장
    if (isTokenPackage) {
      // 토큰 주문 저장
      const { error: orderError } = await supabaseAdmin
        .from('token_orders')
        .insert({
          user_id: user.id,
          package_id: planId,
          order_id: orderId,
          amount: plan.price,
          tokens_purchased: plan.token_count,
          status: 'pending'
        });

      if (orderError) {
        console.error('토큰 주문 저장 오류:', orderError);
        throw new Error("토큰 주문 생성에 실패했습니다");
      }
    } else {
      // 구독 결제 내역 저장
      const { error: paymentError } = await supabaseAdmin
        .from('payment_history')
        .insert({
          user_id: user.id,
          plan_id: planId,
          toss_order_id: orderId,
          amount: plan.price,
          subscription_type: subscriptionType,
          status: 'pending'
        });

      if (paymentError) {
        console.error('결제 내역 저장 오류:', paymentError);
        throw new Error("결제 내역 저장에 실패했습니다");
      }
    }

    console.log('=== Stripe Checkout 세션 생성 완료 ===');
    
    return new Response(JSON.stringify({ 
      success: true, 
      url: session.url,
      sessionId: session.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('=== Stripe Checkout 생성 오류 ===');
    console.error(error);
    
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});