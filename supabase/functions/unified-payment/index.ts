import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 상품 정의 (프론트엔드와 동기화)
const PRODUCTS: Record<string, any> = {
  pass_30: { type: 'pass', name: '프리미엄 패스 30일', price: 29900, duration: 30 },
  pass_365: { type: 'pass', name: '프리미엄 패스 1년', price: 199000, duration: 365 },
  pass_lifetime: { type: 'pass', name: '평생이용권', price: 99000, duration: -1 },
  cash_5000: { type: 'cash', name: '5,000원 캐시', price: 5000, tokens: 50 },
  cash_10000: { type: 'cash', name: '11,000원 캐시', price: 10000, tokens: 110 },
  consult_30: { type: 'consult', name: '전문가 상담 30분', price: 35000 },
  consult_60: { type: 'consult', name: '전문가 상담 60분', price: 65000 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const body = await req.json();
    const { action } = body;

    const tossClientKey = Deno.env.get("TOSS_CLIENT_KEY");
    const tossSecretKey = Deno.env.get("TOSS_SECRET_KEY");

    if (!tossClientKey || !tossSecretKey) {
      throw new Error("토스페이먼츠 API 키가 설정되지 않았습니다.");
    }

    // Action: Client Key 반환
    if (action === 'get-client-key') {
      return new Response(JSON.stringify({ 
        success: true, 
        clientKey: tossClientKey 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 사용자 인증
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("인증이 필요합니다.");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseAuth.auth.getUser(token);
    const user = userData.user;
    
    if (!user) throw new Error("사용자 인증 실패");

    // Action: 결제 생성
    if (action === 'create-payment') {
      const { productId, productType, productName, amount, tokens } = body;
      
      const product = PRODUCTS[productId];
      const finalAmount = amount || product?.price;
      const finalName = productName || product?.name || '결제';
      const finalTokens = tokens || product?.tokens || 0;
      const finalType = productType || product?.type || 'custom';

      if (!finalAmount) throw new Error("결제 금액이 필요합니다.");

      const orderId = `${finalType}_${productId}_${user.id.slice(0, 8)}_${Date.now()}`;

      // 결제 내역 저장
      const { error: insertError } = await supabaseAdmin
        .from('payment_history')
        .insert({
          user_id: user.id,
          toss_order_id: orderId,
          amount: finalAmount,
          subscription_type: finalType,
          status: 'pending',
          token_amount: finalTokens > 0 ? finalTokens : null,
        });

      if (insertError) {
        console.error('Payment insert error:', insertError);
        throw new Error('결제 준비 중 오류가 발생했습니다.');
      }

      const paymentData = {
        amount: finalAmount,
        orderId,
        orderName: finalName,
        customerEmail: user.email || '',
        customerName: user.user_metadata?.full_name || user.email?.split('@')[0] || '고객',
      };

      console.log('✅ Payment created:', { orderId, amount: finalAmount, type: finalType });

      return new Response(JSON.stringify({ 
        success: true, 
        paymentData,
        clientKey: tossClientKey,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: 결제 확인
    if (action === 'confirm-payment') {
      const { paymentKey, orderId, amount } = body;

      console.log('Confirming payment:', { paymentKey, orderId, amount });

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
        console.error('Toss API error:', tossResult);
        throw new Error(tossResult.message || '결제 승인에 실패했습니다.');
      }

      // 결제 내역 조회 및 업데이트
      const { data: payment, error: fetchError } = await supabaseAdmin
        .from('payment_history')
        .select('*')
        .eq('toss_order_id', orderId)
        .maybeSingle();

      if (fetchError || !payment) {
        console.error('Payment not found:', orderId);
        throw new Error('결제 내역을 찾을 수 없습니다.');
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

      // 상품 유형별 처리
      const productType = payment.subscription_type;

      if (productType === 'cash' && payment.token_amount) {
        // 캐시(토큰) 충전
        const { data: tokenBalance } = await supabaseAdmin
          .from('user_tokens')
          .select('*')
          .eq('user_id', payment.user_id)
          .maybeSingle();

        const currentTokens = tokenBalance?.current_tokens || 0;
        const newTokens = currentTokens + payment.token_amount;

        if (tokenBalance) {
          await supabaseAdmin
            .from('user_tokens')
            .update({ 
              current_tokens: newTokens,
              total_purchased: (tokenBalance.total_purchased || 0) + payment.token_amount,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', payment.user_id);
        } else {
          await supabaseAdmin
            .from('user_tokens')
            .insert({
              user_id: payment.user_id,
              current_tokens: newTokens,
              total_purchased: payment.token_amount,
            });
        }

        console.log(`✅ Added ${payment.token_amount} tokens to user ${payment.user_id}`);

      } else if (productType === 'pass') {
        // 프리미엄 패스 처리
        const isLifetime = orderId.includes('pass_lifetime');
        const isYearly = orderId.includes('pass_365');

        const startDate = new Date();
        let endDate: Date | null = null;
        let subscriptionType = 'premium';

        if (isLifetime) {
          subscriptionType = 'lifetime';
          endDate = new Date('2099-12-31');
        } else if (isYearly) {
          endDate = new Date(startDate);
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 30);
        }

        // 기존 구독 취소
        await supabaseAdmin
          .from('user_subscriptions')
          .update({ status: 'cancelled' })
          .eq('user_id', payment.user_id)
          .eq('status', 'active');

        // 새 구독 생성
        await supabaseAdmin
          .from('user_subscriptions')
          .insert({
            user_id: payment.user_id,
            subscription_type: subscriptionType,
            payment_method: 'toss',
            current_period_start: startDate.toISOString().split('T')[0],
            current_period_end: endDate.toISOString().split('T')[0],
            status: 'active',
          });

        console.log(`✅ Created ${subscriptionType} subscription for user ${payment.user_id}`);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: '결제가 완료되었습니다.',
        paymentResult: tossResult,
        productType,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error('알 수 없는 액션입니다.');

  } catch (error: unknown) {
    console.error('Unified payment error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
