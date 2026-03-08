import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { rateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

const ALLOWED_ORIGINS = [
  'https://hilightpro.lovable.app',
  'https://id-preview--c6429092-3613-4c6e-a945-22140ac09444.lovable.app',
  'http://localhost:3000',
  'http://localhost:5173',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// 구독 단일 상품 (프론트엔드와 동기화)
const PRODUCTS: Record<string, { type: string; name: string; price: number; duration: number }> = {
  subscription_monthly: { type: 'subscription', name: '월간 구독', price: 19900, duration: 30 },
  // 하위 호환성
  pass_30: { type: 'subscription', name: '월간 구독', price: 19900, duration: 30 },
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // 🔒 Rate Limiting (결제 API: 분당 10회)
  const { allowed, retryAfter } = rateLimit(req, 10);
  if (!allowed) {
    return rateLimitResponse(corsHeaders, retryAfter);
  }

  // 🔒 서비스 역할 클라이언트만 사용 (anon key 사용 금지)
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.json();
    const { action } = body;

    const tossClientKey = Deno.env.get("TOSS_CLIENT_KEY");
    const tossSecretKey = Deno.env.get("TOSS_SECRET_KEY");

    if (!tossClientKey || !tossSecretKey) {
      throw new Error("토스페이먼츠 API 키가 설정되지 않았습니다.");
    }

    // 🔒 모든 액션에 인증 필수
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "인증이 필요합니다." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
    const user = userData?.user;

    if (authError || !user) {
      console.error('❌ Auth failed:', authError);
      return new Response(
        JSON.stringify({ success: false, error: "사용자 인증 실패" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`✅ User authenticated: ${user.id} | Action: ${action}`);

    // Action: Client Key 반환 (🔒 인증 필수로 변경)
    if (action === 'get-client-key') {
      return new Response(JSON.stringify({ 
        success: true, 
        clientKey: tossClientKey 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: 결제 생성
    if (action === 'create-payment') {
      const { productId, amount } = body;
      
      const product = PRODUCTS[productId];
      if (!product) {
        return new Response(
          JSON.stringify({ success: false, error: "유효하지 않은 상품입니다." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 🔒 서버 측 금액 검증 (클라이언트 금액 무시, 서버 상품 가격 사용)
      const serverAmount = product.price;
      if (amount && amount !== serverAmount) {
        console.warn(`⚠️ Amount mismatch: client=${amount}, server=${serverAmount}. Using server amount.`);
      }

      const orderId = `sub_${user.id.slice(0, 8)}_${Date.now()}`;

      // 결제 내역 저장
      const { error: insertError } = await supabaseAdmin
        .from('payment_history')
        .insert({
          user_id: user.id,
          toss_order_id: orderId,
          amount: serverAmount,
          subscription_type: 'subscription',
          status: 'pending',
        });

      if (insertError) {
        console.error('❌ Payment insert error:', insertError);
        throw new Error('결제 준비 중 오류가 발생했습니다.');
      }

      const paymentData = {
        amount: serverAmount,
        orderId,
        orderName: product.name,
        customerEmail: user.email || '',
        customerName: user.user_metadata?.full_name || user.email?.split('@')[0] || '고객',
      };

      console.log('✅ Payment created:', { orderId, amount: serverAmount, userId: user.id });

      return new Response(JSON.stringify({ 
        success: true, 
        paymentData,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: 결제 확인 (Toss 콜백 후)
    if (action === 'confirm-payment') {
      const { paymentKey, orderId, amount } = body;

      if (!paymentKey || !orderId || !amount) {
        return new Response(
          JSON.stringify({ success: false, error: "필수 결제 정보가 누락되었습니다." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 🔒 주문 검증: 현재 사용자의 주문인지 + 금액 일치 확인
      const { data: payment, error: fetchError } = await supabaseAdmin
        .from('payment_history')
        .select('*')
        .eq('toss_order_id', orderId)
        .maybeSingle();

      if (fetchError || !payment) {
        console.error('❌ Payment not found:', orderId);
        return new Response(
          JSON.stringify({ success: false, error: "결제 내역을 찾을 수 없습니다." }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 🔒 소유권 검증
      if (payment.user_id !== user.id) {
        console.error('❌ Unauthorized: Payment does not belong to user', { paymentUserId: payment.user_id, requestUserId: user.id });
        return new Response(
          JSON.stringify({ success: false, error: "권한이 없습니다." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 🔒 금액 검증
      if (payment.amount !== amount) {
        console.error('❌ Amount mismatch:', { expected: payment.amount, received: amount });
        return new Response(
          JSON.stringify({ success: false, error: "결제 금액이 일치하지 않습니다." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 🔒 중복 결제 방지
      if (payment.status === 'completed') {
        console.warn('⚠️ Payment already completed:', orderId);
        return new Response(
          JSON.stringify({ success: true, message: "이미 처리된 결제입니다.", productType: payment.subscription_type }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 토스페이먼츠 결제 승인
      const encryptedSecretKey = btoa(tossSecretKey + ':');
      const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${encryptedSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      });

      const tossResult = await tossResponse.json();

      if (!tossResponse.ok) {
        console.error('❌ Toss API error:', tossResult);
        
        // 결제 실패 상태 업데이트
        await supabaseAdmin
          .from('payment_history')
          .update({ status: 'failed' })
          .eq('id', payment.id);

        throw new Error(tossResult.message || '결제 승인에 실패했습니다.');
      }

      // 결제 완료 처리
      await supabaseAdmin
        .from('payment_history')
        .update({
          payment_key: paymentKey,
          status: 'completed',
          payment_method: tossResult.method,
        })
        .eq('id', payment.id);

      // 구독 활성화
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);

      // 기존 구독 취소
      await supabaseAdmin
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', user.id)
        .eq('status', 'active');

      // 새 구독 생성
      await supabaseAdmin
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          subscription_type: 'premium',
          payment_method: 'toss',
          current_period_start: startDate.toISOString().split('T')[0],
          current_period_end: endDate.toISOString().split('T')[0],
          status: 'active',
        });

      console.log(`✅ Subscription activated for user ${user.id} until ${endDate.toISOString()}`);

      return new Response(JSON.stringify({ 
        success: true, 
        message: '결제가 완료되었습니다.',
        paymentResult: tossResult,
        productType: 'subscription',
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: false, error: "알 수 없는 액션입니다." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error('❌ Unified payment error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
