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
    // 1. 사용자 인증 확인
    const authorizationHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    if (!authorizationHeader) {
      return new Response(JSON.stringify({ error: '인증이 필요합니다.' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authorizationHeader.replace('Bearer ', '');
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    const { data: userData, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: '인증이 필요합니다.' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authenticatedUserId = userData.user.id;

    const { paymentKey, orderId, amount } = await req.json();
    
    // Service Role 키를 사용한 클라이언트
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // 토스페이먼츠 결제 확인 API 호출
    const tossSecretKey = Deno.env.get("TOSS_PAYMENTS_SECRET_KEY");
    if (!tossSecretKey) {
      console.error('TOSS_PAYMENTS_SECRET_KEY is not configured');
      return new Response(JSON.stringify({ error: '결제 처리 중 오류가 발생했습니다.' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const tossAuthHeader = `Basic ${btoa(tossSecretKey + ":")}`;
    
    const confirmResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        "Authorization": tossAuthHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const confirmData = await confirmResponse.json();
    
    if (!confirmResponse.ok) {
      console.error('TossPayments API error:', confirmData);
      return new Response(JSON.stringify({ error: '결제 승인에 실패했습니다.' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('토스페이먼츠 결제 확인 성공');

    // 결제 내역에서 해당 주문 찾기 - 사용자 소유권 확인
    const { data: paymentRecord, error: findError } = await supabaseAdmin
      .from('payment_history')
      .select('*')
      .eq('toss_order_id', orderId)
      .eq('user_id', authenticatedUserId) // 소유권 확인
      .single();

    if (findError || !paymentRecord) {
      console.error('Payment record not found or not owned by user:', findError);
      return new Response(JSON.stringify({ error: '결제 기록을 찾을 수 없습니다.' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 결제 상태 및 정보 업데이트
    const { error: updateError } = await supabaseAdmin
      .from('payment_history')
      .update({
        status: 'completed',
        toss_payment_key: paymentKey,
        toss_response: confirmData,
        completed_at: new Date().toISOString()
      })
      .eq('id', paymentRecord.id);

    if (updateError) {
      console.error('Payment update error:', updateError);
      return new Response(JSON.stringify({ error: '결제 처리 중 오류가 발생했습니다.' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 사용자에게 토큰 지급
    if (paymentRecord.token_amount && paymentRecord.token_amount > 0) {
      const { data: currentTokens, error: tokenError } = await supabaseAdmin
        .from('user_tokens')
        .select('*')
        .eq('user_id', paymentRecord.user_id)
        .single();

      if (tokenError && tokenError.code !== 'PGRST116') {
        console.error('Token query error:', tokenError);
        return new Response(JSON.stringify({ error: '결제 처리 중 오류가 발생했습니다.' }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (currentTokens) {
        const { error: updateTokenError } = await supabaseAdmin
          .from('user_tokens')
          .update({
            current_tokens: currentTokens.current_tokens + paymentRecord.token_amount,
            total_purchased: (currentTokens.total_purchased || 0) + paymentRecord.token_amount
          })
          .eq('user_id', paymentRecord.user_id);

        if (updateTokenError) {
          console.error('Token update error:', updateTokenError);
          return new Response(JSON.stringify({ error: '결제 처리 중 오류가 발생했습니다.' }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        const { error: insertTokenError } = await supabaseAdmin
          .from('user_tokens')
          .insert({
            user_id: paymentRecord.user_id,
            current_tokens: paymentRecord.token_amount,
            total_purchased: paymentRecord.token_amount,
            total_used: 0,
            referral_bonus: 0,
            last_daily_bonus_date: new Date().toISOString().split('T')[0]
          });

        if (insertTokenError) {
          console.error('Token insert error:', insertTokenError);
          return new Response(JSON.stringify({ error: '결제 처리 중 오류가 발생했습니다.' }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      await supabaseAdmin
        .from('usage_tracking')
        .insert({
          user_id: paymentRecord.user_id,
          feature_type: 'token_purchase',
          usage_date: new Date().toISOString().split('T')[0],
          count: paymentRecord.token_amount
        });
    }

    console.log(`토큰 결제 완료: 사용자에게 ${paymentRecord.token_amount}토큰 지급`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "토큰 결제가 완료되었습니다.",
      tokenAmount: paymentRecord.token_amount
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error('Token payment confirmation error:', error);
    return new Response(JSON.stringify({ error: '결제 처리 중 오류가 발생했습니다.' }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
