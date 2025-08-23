import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Create Token Order Started ===');
    
    const { packageId } = await req.json();
    
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
    console.log('User authenticated:', user.id);

    // 토큰 패키지 조회
    const { data: tokenPackage, error: packageError } = await supabaseAdmin
      .from('token_packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single();

    if (packageError || !tokenPackage) {
      throw new Error("토큰 패키지를 찾을 수 없습니다");
    }
    
    console.log('Package found:', tokenPackage.name);

    // Stripe 초기화
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe 설정이 완료되지 않았습니다");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // 고객 확인/생성
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // 주문 ID 생성
    const orderId = `token_order_${user.id}_${Date.now()}`;

    // Stripe 체크아웃 세션 생성
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "krw",
            product_data: { 
              name: `${tokenPackage.name} (${tokenPackage.token_count}개 토큰)`,
              description: tokenPackage.description
            },
            unit_amount: tokenPackage.price_krw,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/token-payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/token-subscription`,
      metadata: {
        orderId,
        packageId,
        userId: user.id,
        tokenCount: tokenPackage.token_count.toString()
      }
    });

    // 주문 내역 저장
    const { error: orderError } = await supabaseAdmin
      .from('token_orders')
      .insert({
        user_id: user.id,
        package_id: packageId,
        order_id: orderId,
        amount: tokenPackage.price_krw,
        tokens_purchased: tokenPackage.token_count,
        status: 'pending'
      });

    if (orderError) {
      console.error('Order insert error:', orderError);
      throw new Error("주문 생성에 실패했습니다");
    }

    console.log('=== Stripe Session Created Successfully ===');
    
    return new Response(JSON.stringify({ 
      success: true, 
      url: session.url,
      sessionId: session.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('=== Create Order Error ===');
    console.error(error);
    
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});