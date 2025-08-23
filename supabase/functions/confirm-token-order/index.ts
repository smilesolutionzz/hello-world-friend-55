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
    console.log('=== Confirm Token Payment Started ===');
    
    const { paymentKey, orderId, amount } = await req.json();
    
    if (!paymentKey || !orderId || !amount) {
      throw new Error("필수 파라미터가 누락되었습니다");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // 토스페이먼츠 결제 확인
    const tossSecretKey = Deno.env.get("TOSS_PAYMENTS_SECRET_KEY");
    const authHeader = `Basic ${btoa(`${tossSecretKey}:`)}`;

    const tossResponse = await fetch(
      `https://api.tosspayments.com/v1/payments/confirm`,
      {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      }
    );

    if (!tossResponse.ok) {
      const errorData = await tossResponse.json();
      throw new Error(`토스페이먼츠 확인 실패: ${errorData.message}`);
    }

    const paymentData = await tossResponse.json();
    console.log("Payment confirmed:", paymentData.method);

    // 주문 정보 업데이트 및 사용자 정보 가져오기
    const { data: order, error: updateError } = await supabaseAdmin
      .from('token_orders')
      .update({
        status: 'completed',
        payment_key: paymentKey,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId)
      .select('user_id, tokens_purchased')
      .single();

    if (updateError || !order) {
      throw new Error("주문 정보 업데이트에 실패했습니다");
    }

    console.log('Order updated:', order.tokens_purchased, 'tokens for user', order.user_id);

    // 사용자 토큰 잔액 업데이트
    const { data: currentTokens, error: fetchError } = await supabaseAdmin
      .from('user_tokens')
      .select('current_tokens, total_purchased')
      .eq('user_id', order.user_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error("토큰 정보 조회에 실패했습니다");
    }

    const newTokenCount = (currentTokens?.current_tokens || 0) + order.tokens_purchased;
    const newTotalPurchased = (currentTokens?.total_purchased || 0) + order.tokens_purchased;

    if (currentTokens) {
      // 기존 토큰 업데이트
      const { error: updateTokenError } = await supabaseAdmin
        .from('user_tokens')
        .update({
          current_tokens: newTokenCount,
          total_purchased: newTotalPurchased,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', order.user_id);

      if (updateTokenError) throw updateTokenError;
    } else {
      // 새 토큰 레코드 생성
      const { error: insertTokenError } = await supabaseAdmin
        .from('user_tokens')
        .insert({
          user_id: order.user_id,
          current_tokens: newTokenCount,
          total_purchased: newTotalPurchased,
          total_used: 0
        });

      if (insertTokenError) throw insertTokenError;
    }

    console.log('Tokens updated:', newTokenCount);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "토큰이 성공적으로 충전되었습니다",
      tokens_added: order.tokens_purchased,
      new_balance: newTokenCount
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('=== Confirm Payment Error ===');
    console.error(error);
    
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});