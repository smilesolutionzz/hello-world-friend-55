import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // 사용자 인증 확인
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { paymentKey, orderId, amount } = await req.json();

    if (!paymentKey || !orderId || !amount) {
      throw new Error('Missing required parameters');
    }

    console.log('토스페이먼츠 결제 승인 시작:', { orderId, amount, userId: user.id });

    // 토스페이먼츠 API로 결제 승인 요청
    const TOSS_SECRET_KEY = Deno.env.get('TOSS_SECRET_KEY');
    if (!TOSS_SECRET_KEY) {
      throw new Error('TOSS_SECRET_KEY not configured');
    }

    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(TOSS_SECRET_KEY + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    if (!tossResponse.ok) {
      const errorData = await tossResponse.json();
      console.error('토스페이먼츠 승인 실패:', errorData);
      throw new Error(errorData.message || '결제 승인에 실패했습니다');
    }

    const paymentData = await tossResponse.json();
    console.log('토스페이먼츠 승인 성공:', paymentData);

    // orderId에서 토큰 수량 추출 (TOKEN_150_...)
    const tokenMatch = orderId.match(/TOKEN_(\d+)_/);
    const tokensPurchased = tokenMatch ? parseInt(tokenMatch[1]) : 0;

    if (tokensPurchased === 0) {
      throw new Error('Invalid order ID format');
    }

    // 결제 기록 저장
    const { error: insertError } = await supabaseClient
      .from('toss_payments')
      .insert({
        user_id: user.id,
        payment_key: paymentKey,
        order_id: orderId,
        amount: amount,
        status: paymentData.status,
        approved_at: paymentData.approvedAt,
        method: paymentData.method,
      });

    if (insertError) {
      console.error('결제 기록 저장 실패:', insertError);
      throw insertError;
    }

    // 사용자 토큰 업데이트
    const { data: currentTokens, error: fetchError } = await supabaseClient
      .from('user_tokens')
      .select('current_tokens, total_purchased')
      .eq('user_id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (currentTokens) {
      // 기존 레코드 업데이트
      const { error: updateError } = await supabaseClient
        .from('user_tokens')
        .update({
          current_tokens: (currentTokens.current_tokens || 0) + tokensPurchased,
          total_purchased: (currentTokens.total_purchased || 0) + tokensPurchased,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }
    } else {
      // 새 레코드 생성
      const { error: insertTokenError } = await supabaseClient
        .from('user_tokens')
        .insert({
          user_id: user.id,
          current_tokens: tokensPurchased,
          total_purchased: tokensPurchased,
        });

      if (insertTokenError) {
        throw insertTokenError;
      }
    }

    console.log('토큰 충전 완료:', { userId: user.id, tokensPurchased });

    return new Response(
      JSON.stringify({
        success: true,
        tokensPurchased,
        paymentData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('결제 승인 오류:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
