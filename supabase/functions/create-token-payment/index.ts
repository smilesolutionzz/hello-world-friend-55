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
    const { packageId, paymentType = 'token' } = await req.json();
    
    // 토스페이먼츠 키 확인
    const tossClientKey = Deno.env.get("TOSS_CLIENT_KEY");
    const tossSecretKey = Deno.env.get("TOSS_SECRET_KEY");
    
    console.log('TossPayments keys check:', {
      clientKeyExists: !!tossClientKey,
      secretKeyExists: !!tossSecretKey,
      clientKeyPrefix: tossClientKey?.substring(0, 10) + '...',
    });
    
    if (!tossClientKey || !tossSecretKey) {
      throw new Error("토스페이먼츠 API 키가 설정되지 않았습니다.");
    }

    // packageId가 'temp'인 경우 clientKey만 반환
    if (packageId === 'temp') {
      console.log('Client key request only');
      return new Response(JSON.stringify({ 
        success: true,
        clientKey: tossClientKey
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
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

    console.log('Token payment request for package:', packageId);

    // 토큰 패키지 정보 가져오기
    const { data: tokenPackage, error: packageError } = await supabaseAdmin
      .from('token_packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single();

    if (packageError || !tokenPackage) {
      throw new Error("토큰 패키지를 찾을 수 없습니다.");
    }

    // 결제 금액은 토큰 패키지의 가격
    const amount = tokenPackage.price_krw;
    
    // 주문 ID 생성
    const orderId = `token_${user.id}_${Date.now()}`;

    // 토스페이먼츠 결제 요청 준비
    const paymentData = {
      amount,
      orderId,
      orderName: `${tokenPackage.name} (${tokenPackage.token_count}토큰)`,
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
        plan_id: null, // 토큰 패키지는 plan_id 없음
        subscription_type: 'token',
        status: 'pending',
        token_package_id: packageId,
        token_amount: tokenPackage.token_count
      });

    if (paymentError) throw paymentError;

    console.log('Token payment request created:', paymentData);

    return new Response(JSON.stringify({ 
      success: true, 
      paymentData,
      clientKey: tossClientKey
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error('Token payment creation error:', error);
    const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error');
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});