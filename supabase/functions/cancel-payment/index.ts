import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { paymentId, cancelReason } = await req.json();

    if (!paymentId) {
      throw new Error('Payment ID is required');
    }

    // Initialize Supabase client with service role
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check admin authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: userRole, error: roleError } = await supabaseService
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !userRole) {
      throw new Error('Admin access required');
    }

    console.log(`Admin ${user.id} canceling payment ${paymentId}`);

    // Fetch payment record
    const { data: payment, error: paymentError } = await supabaseService
      .from('payment_history')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      throw new Error('Payment not found');
    }

    // Check if already cancelled
    if (payment.status === 'cancelled' || payment.status === 'refunded') {
      throw new Error('Payment already cancelled or refunded');
    }

    // Get Toss payment details
    const tossPaymentKey = payment.payment_key;
    if (!tossPaymentKey) {
      throw new Error('Toss payment key not found');
    }

    // Call Toss Payments API to cancel
    const tossSecretKey = Deno.env.get('TOSS_SECRET_KEY');
    if (!tossSecretKey) {
      throw new Error('Toss secret key not configured');
    }

    const encodedKey = btoa(tossSecretKey + ':');
    
    console.log(`Calling Toss cancel API for payment key: ${tossPaymentKey}`);
    
    const cancelResponse = await fetch(
      `https://api.tosspayments.com/v1/payments/${tossPaymentKey}/cancel`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${encodedKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelReason: cancelReason || '관리자 요청에 의한 취소',
        }),
      }
    );

    if (!cancelResponse.ok) {
      const errorData = await cancelResponse.json();
      console.error('Toss cancel error:', errorData);
      throw new Error(`Toss cancel failed: ${errorData.message || 'Unknown error'}`);
    }

    const cancelData = await cancelResponse.json();
    console.log('Toss cancel success:', cancelData);

    // Update payment_history status
    const { error: updateError } = await supabaseService
      .from('payment_history')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    if (updateError) {
      console.error('Error updating payment status:', updateError);
      throw updateError;
    }

      // Deduct tokens if they were granted
    const tokensGranted = payment.token_amount || 0;
    if (tokensGranted > 0 && payment.user_id) {
      // Get current token balance
      const { data: tokenBalance, error: balanceError } = await supabaseService
        .from('user_tokens')
        .select('current_tokens')
        .eq('user_id', payment.user_id)
        .single();

      if (balanceError) {
        console.error('Error fetching token balance:', balanceError);
      } else {
        const newBalance = Math.max(0, (tokenBalance.current_tokens || 0) - tokensGranted);
        
        // Update user tokens
        const { error: tokenError } = await supabaseService
          .from('user_tokens')
          .update({
            current_tokens: newBalance,
            total_used: (tokenBalance.total_used || 0) - tokensGranted,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', payment.user_id);

        if (tokenError) {
          console.error('Error updating tokens:', tokenError);
        } else {
          console.log(`Deducted ${tokensGranted} tokens from user ${payment.user_id}`);

          // Log the cancellation in usage_tracking
          await supabaseService
            .from('usage_tracking')
            .insert({
              user_id: payment.user_id,
              feature_type: 'payment_cancelled',
              usage_date: new Date().toISOString().split('T')[0],
              count: tokensGranted,
            });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment cancelled successfully',
        tokensDeducted: tokensGranted,
        cancelData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Cancel payment error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
