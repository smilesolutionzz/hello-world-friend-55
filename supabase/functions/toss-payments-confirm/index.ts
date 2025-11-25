import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
    // 🔒 보안 강화: 사용자 인증 확인
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: { message: 'Unauthorized: No authorization header' } 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Supabase 클라이언트 생성
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // 토큰에서 사용자 정보 추출
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Authentication failed:', authError);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: { message: 'Unauthorized: Invalid token' } 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ User authenticated:', user.id);

    const { paymentKey, orderId, amount } = await req.json();

    if (!paymentKey || !orderId || !amount) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: { message: 'Missing required fields' } 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 🔒 보안 강화: 주문이 현재 사용자의 것인지 확인
    const { data: order, error: orderError } = await supabaseClient
      .from('website_orders')
      .select('user_id, total_price, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('❌ Order not found:', orderError);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: { message: 'Order not found' } 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 주문 소유자 확인
    if (order.user_id !== user.id) {
      console.error('❌ Unauthorized: Order does not belong to user');
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: { message: 'Forbidden: Order does not belong to you' } 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 결제 금액 검증
    if (order.total_price !== amount) {
      console.error('❌ Amount mismatch:', { expected: order.total_price, received: amount });
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: { message: 'Payment amount does not match order' } 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 이미 처리된 주문인지 확인 (중복 결제 방지)
    if (order.status === 'paid' || order.status === 'completed') {
      console.warn('⚠️ Order already processed:', orderId);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: { message: 'Order already processed' } 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get Toss secret key from environment
    const secretKey = Deno.env.get('TOSS_SECRET_KEY');
    if (!secretKey) {
      console.error('❌ TOSS_SECRET_KEY not found in environment');
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: { message: 'Server configuration error' } 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Encode secret key for Basic Auth
    const encoder = new TextEncoder();
    const data = encoder.encode(`${secretKey}:`);
    const base64 = btoa(String.fromCharCode(...data));

    console.log('🎯 Confirming payment for user:', user.id, { orderId, amount });

    // Call Toss Payments confirm API
    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${base64}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ paymentKey, orderId, amount })
    });

    const tossData = await tossResponse.json();

    if (!tossResponse.ok) {
      console.error('❌ Toss confirm failed:', tossData);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: { 
            code: tossData.code, 
            message: tossData.message 
          } 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Payment confirmed for user:', user.id, tossData);

    // 결제 성공 시 주문 상태 업데이트
    await supabaseClient
      .from('website_orders')
      .update({ 
        status: 'paid',
        stripe_payment_id: tossData.paymentKey,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    return new Response(
      JSON.stringify({
        ok: true,
        orderId: tossData.orderId,
        amount: tossData.totalAmount ?? amount,
        method: tossData.method ?? (tossData.card ? 'CARD' : 'UNKNOWN'),
        approvedAt: tossData.approvedAt
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('❌ Server error:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: { message: error.message } 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
