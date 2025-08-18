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
    const { paymentKey, orderId, amount } = await req.json();

    // Service Role 키를 사용한 클라이언트
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // 토스페이먼츠 결제 승인
    const tossSecretKey = Deno.env.get("TOSS_PAYMENTS_SECRET_KEY");
    const authHeader = `Basic ${btoa(tossSecretKey + ':')}`;

    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const tossData = await tossResponse.json();

    if (!tossResponse.ok) {
      throw new Error(`토스페이먼츠 결제 승인 실패: ${tossData.message}`);
    }

    // 구매 내역 업데이트
    const { data: purchase, error: purchaseUpdateError } = await supabaseAdmin
      .from('token_purchases')
      .update({
        status: 'completed',
        payment_method: tossData.method
      })
      .eq('toss_order_id', orderId)
      .select('user_id, tokens_purchased')
      .single();

    if (purchaseUpdateError) throw purchaseUpdateError;

    // 사용자 토큰 잔액 업데이트
    const { error: tokenUpdateError } = await supabaseAdmin
      .from('user_tokens')
      .upsert({
        user_id: purchase.user_id,
        current_tokens: 0, // 기본값으로 설정, 실제로는 기존 값에 추가해야 함
        total_purchased: 0, // 기본값으로 설정, 실제로는 기존 값에 추가해야 함
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    // 현재 토큰 잔액을 가져와서 업데이트
    const { data: currentTokens } = await supabaseAdmin
      .from('user_tokens')
      .select('current_tokens, total_purchased')
      .eq('user_id', purchase.user_id)
      .single();

    await supabaseAdmin
      .from('user_tokens')
      .update({
        current_tokens: (currentTokens?.current_tokens || 0) + purchase.tokens_purchased,
        total_purchased: (currentTokens?.total_purchased || 0) + purchase.tokens_purchased,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', purchase.user_id);

    return new Response(JSON.stringify({
      success: true,
      message: '토큰 충전이 완료되었습니다',
      tokensAdded: purchase.tokens_purchased
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Token payment confirmation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});