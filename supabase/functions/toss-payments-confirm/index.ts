import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentKey, orderId, amount } = await req.json();
    
    console.log('Payment confirmation request:', { paymentKey, orderId, amount });

    // 입력 검증
    if (!paymentKey || !orderId || !amount) {
      throw new Error('필수 파라미터가 누락되었습니다');
    }

    // Supabase 클라이언트 생성
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 인증 확인
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('인증이 필요합니다');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('유효하지 않은 인증 정보입니다');
    }

    console.log('User authenticated:', user.id);

    // 토스페이먼츠 시크릿 키
    const tossSecretKey = Deno.env.get('TOSS_SECRET_KEY');
    if (!tossSecretKey) {
      throw new Error('토스페이먼츠 시크릿 키가 설정되지 않았습니다');
    }

    console.log('Using Toss Secret Key for payment confirmation');

    // 토스페이먼츠 결제 승인 API 호출
    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(tossSecretKey + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const tossData = await tossResponse.json();
    console.log('Toss response:', { status: tossResponse.status, data: tossData });

    if (!tossResponse.ok) {
      throw new Error(tossData.message || '결제 승인에 실패했습니다');
    }

    // orderId에서 토큰 정보 파싱 (형식: ORDER_TOKEN_{tokens}_{timestamp}_{userId})
    const orderParts = orderId.split('_');
    const tokensPurchased = parseInt(orderParts[2]) || 0;

    if (tokensPurchased <= 0) {
      throw new Error('유효하지 않은 주문 정보입니다');
    }

    // 결제 내역 저장
    const { error: insertError } = await supabase
      .from('toss_payments')
      .insert({
        user_id: user.id,
        payment_key: paymentKey,
        order_id: orderId,
        amount: tossData.totalAmount,
        tokens_purchased: tokensPurchased,
        status: 'completed',
        payment_method: tossData.method,
        approved_at: new Date(tossData.approvedAt).toISOString(),
        receipt_url: tossData.receipt?.url || null,
      });

    if (insertError) {
      console.error('Payment record insert error:', insertError);
      throw new Error('결제 내역 저장에 실패했습니다');
    }

    // 사용자 토큰 업데이트
    const { error: tokenError } = await supabase
      .from('user_tokens')
      .update({
        current_tokens: supabase.rpc('increment', { x: tokensPurchased }),
        total_purchased: supabase.rpc('increment', { x: tokensPurchased }),
      })
      .eq('user_id', user.id);

    if (tokenError) {
      console.error('Token update error:', tokenError);
      
      // 토큰 업데이트 실패 시 대체 방법
      const { data: currentTokens } = await supabase
        .from('user_tokens')
        .select('current_tokens, total_purchased')
        .eq('user_id', user.id)
        .single();

      if (currentTokens) {
        await supabase
          .from('user_tokens')
          .update({
            current_tokens: currentTokens.current_tokens + tokensPurchased,
            total_purchased: currentTokens.total_purchased + tokensPurchased,
          })
          .eq('user_id', user.id);
      }
    }

    console.log('Payment confirmed successfully:', { orderId, tokensPurchased });

    return new Response(
      JSON.stringify({
        success: true,
        payment: tossData,
        tokensPurchased,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Payment confirmation error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
