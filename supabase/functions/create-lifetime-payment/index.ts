import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LIFETIME_PLAN_ID = "b30ec367-76d3-48cf-a07e-c6acb5f67795";
const LIFETIME_PRICE = 99000;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Starting lifetime payment creation...");

    // Supabase 클라이언트 생성
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
    const { data } = await supabaseAuth.auth.getUser(token);
    const user = data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    console.log("✅ User authenticated:", user.id);

    // 이미 평생이용권을 구매했는지 확인
    const { data: existingSubscription } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_lifetime', true)
      .eq('status', 'active')
      .maybeSingle();

    if (existingSubscription) {
      throw new Error("이미 평생이용권을 보유하고 있습니다.");
    }

    // 주문 ID 생성
    const orderId = `lifetime_${user.id.substring(0, 8)}_${Date.now()}`;

    // 토스페이먼츠 결제 데이터 준비
    const paymentData = {
      amount: LIFETIME_PRICE,
      orderId,
      orderName: "마음이음 평생이용권",
      customerEmail: user.email,
      customerName: user.email?.split('@')[0] || '사용자',
      successUrl: `${req.headers.get("origin")}/payment-success?orderId=${orderId}&type=lifetime`,
      failUrl: `${req.headers.get("origin")}/payment-fail?orderId=${orderId}&type=lifetime`,
    };

    // website_orders 테이블에 주문 기록
    const { error: orderError } = await supabaseAdmin
      .from('website_orders')
      .insert({
        id: orderId,
        user_id: user.id,
        total_price: LIFETIME_PRICE,
        status: 'pending_payment',
        order_data: {
          type: 'lifetime',
          plan_id: LIFETIME_PLAN_ID,
          plan_name: '평생이용권'
        }
      });

    if (orderError) {
      console.error("❌ Order creation error:", orderError);
      throw new Error("주문 생성 중 오류가 발생했습니다.");
    }

    console.log("✅ Order created:", orderId);

    // 토스페이먼츠 클라이언트 키 가져오기
    const tossClientKey = Deno.env.get("TOSS_PAYMENTS_CLIENT_KEY");
    
    if (!tossClientKey) {
      throw new Error("토스페이먼츠 API 키가 설정되지 않았습니다.");
    }

    console.log("✅ Payment data prepared successfully");

    return new Response(JSON.stringify({ 
      success: true, 
      paymentData,
      clientKey: tossClientKey
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error('❌ Lifetime payment creation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
