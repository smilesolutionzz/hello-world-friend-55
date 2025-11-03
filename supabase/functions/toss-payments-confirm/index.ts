import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    console.log('🎯 Confirming payment:', { orderId, amount });

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

    console.log('✅ Payment confirmed:', tossData);

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
