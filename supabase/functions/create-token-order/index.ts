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

    // 주문 ID 생성
    const orderId = `order_${user.id}_${Date.now()}`;

    // 토스페이먼츠 결제 데이터 준비
    const paymentData = {
      amount: tokenPackage.price_krw,
      orderId,
      orderName: `${tokenPackage.name} (${tokenPackage.token_count}개 토큰)`,
      customerEmail: user.email,
      customerName: user.email?.split('@')[0] || '사용자',
    };

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

    // 토스페이먼츠 키 확인
    const tossClientKey = Deno.env.get("TOSS_PAYMENTS_CLIENT_KEY");
    const tossSecretKey = Deno.env.get("TOSS_PAYMENTS_SECRET_KEY");
    
    console.log('Toss keys check:', { 
      hasClient: !!tossClientKey, 
      hasSecret: !!tossSecretKey 
    });
    
    if (!tossClientKey || !tossSecretKey) {
      throw new Error("토스페이먼츠 설정이 완료되지 않았습니다");
    }

    console.log('=== Order Created Successfully ===');
    
    return new Response(JSON.stringify({ 
      success: true, 
      paymentData,
      clientKey: tossClientKey
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