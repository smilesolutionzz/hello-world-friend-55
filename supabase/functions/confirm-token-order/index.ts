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
    console.log('=== Confirm Token Payment Started ===');
    
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("세션 ID가 필요합니다");
    }

    // Stripe 초기화
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe 설정이 완료되지 않았습니다");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Supabase Admin 클라이언트
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Stripe 세션 정보 가져오기
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session || session.payment_status !== 'paid') {
      throw new Error("결제가 완료되지 않았습니다");
    }

    const { orderId, packageId, userId, tokenCount } = session.metadata || {};
    
    if (!orderId || !packageId || !userId || !tokenCount) {
      throw new Error("결제 메타데이터가 누락되었습니다");
    }

    console.log('Payment confirmed for order:', orderId);

    // 주문 상태 업데이트
    const { error: orderUpdateError } = await supabaseAdmin
      .from('token_orders')
      .update({
        status: 'completed',
        payment_key: sessionId,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId)
      .eq('status', 'pending');

    if (orderUpdateError) {
      console.error('Order update error:', orderUpdateError);
      throw new Error("주문 상태 업데이트에 실패했습니다");
    }

    // 사용자 토큰 업데이트
    const { data: existingTokens, error: fetchError } = await supabaseAdmin
      .from('user_tokens')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Token fetch error:', fetchError);
      throw new Error("토큰 정보 조회에 실패했습니다");
    }

    const tokensToAdd = parseInt(tokenCount);

    if (existingTokens) {
      // 기존 토큰 업데이트 - total_purchased는 실제 구매한 토큰만 추가
      const { error: updateError } = await supabaseAdmin
        .from('user_tokens')
        .update({
          current_tokens: existingTokens.current_tokens + tokensToAdd,
          total_purchased: (existingTokens.total_purchased || 0) + tokensToAdd,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Token update error:', updateError);
        throw new Error("토큰 업데이트에 실패했습니다");
      }
    } else {
      // 새 토큰 레코드 생성
      const { error: insertError } = await supabaseAdmin
        .from('user_tokens')
        .insert({
          user_id: userId,
          current_tokens: tokensToAdd,
          total_purchased: tokensToAdd,
          total_used: 0,
          last_daily_bonus_date: new Date().toISOString().split('T')[0]
        });

      if (insertError) {
        console.error('Token insert error:', insertError);
        throw new Error("토큰 생성에 실패했습니다");
      }
    }

    console.log('=== Token Payment Confirmed Successfully ===');
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "토큰이 성공적으로 지급되었습니다",
      tokensAdded: tokensToAdd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error('=== Confirm Payment Error ===');
    console.error(error);
    const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error');
    return new Response(JSON.stringify({ 
      error: message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});