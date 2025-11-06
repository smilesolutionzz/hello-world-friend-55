import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CancelRequest {
  bookingId: string;
  reason?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[Cancel] Processing cancellation request');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('[Cancel] Auth error:', authError);
      throw new Error('Unauthorized');
    }

    const { bookingId, reason }: CancelRequest = await req.json();

    console.log('[Cancel] Booking:', bookingId, 'User:', user.id);

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('consultation_bookings')
      .select('*, experts!inner(user_id)')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      console.error('[Cancel] Booking not found:', bookingError);
      throw new Error('Booking not found');
    }

    // Check authorization (user or expert can cancel)
    const isUser = booking.user_id === user.id;
    const isExpert = booking.experts.user_id === user.id;

    if (!isUser && !isExpert) {
      throw new Error('Not authorized to cancel this booking');
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled');
    }

    if (booking.status === 'completed') {
      throw new Error('Cannot cancel completed booking');
    }

    // Calculate refund based on cancellation policy
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
    const now = new Date();
    const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundAmount = 0;
    let refundPercentage = 0;

    if (hoursUntilBooking >= 24) {
      // 24시간 이상 전: 100% 환불
      refundAmount = booking.tokens_paid;
      refundPercentage = 100;
    } else if (hoursUntilBooking >= 12) {
      // 12-24시간 전: 50% 환불
      refundAmount = Math.floor(booking.tokens_paid * 0.5);
      refundPercentage = 50;
    } else if (hoursUntilBooking >= 0) {
      // 12시간 미만: 환불 없음
      refundAmount = 0;
      refundPercentage = 0;
    } else {
      throw new Error('Cannot cancel past bookings');
    }

    console.log('[Cancel] Refund:', refundAmount, 'tokens (', refundPercentage, '%)');

    // Update booking status
    const { error: updateError } = await supabase
      .from('consultation_bookings')
      .update({
        status: 'cancelled',
        cancelled_at: now.toISOString(),
        cancellation_reason: reason || null
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('[Cancel] Update error:', updateError);
      throw new Error('Failed to cancel booking');
    }

    // Process refund if applicable
    if (refundAmount > 0) {
      const { error: refundError } = await supabase
        .from('user_tokens')
        .update({
          current_tokens: supabase.rpc('increment', { x: refundAmount })
        })
        .eq('user_id', booking.user_id);

      if (refundError) {
        console.error('[Cancel] Refund error:', refundError);
        // Don't throw - booking is already cancelled
      } else {
        console.log('[Cancel] Refunded', refundAmount, 'tokens to user');
      }

      // Track refund
      await supabase
        .from('usage_tracking')
        .insert({
          user_id: booking.user_id,
          feature_type: 'booking_refund',
          usage_date: new Date().toISOString().split('T')[0],
          count: refundAmount
        });
    }

    // Send cancellation notification
    try {
      await supabase.functions.invoke('send-booking-notification', {
        body: {
          bookingId,
          notificationType: 'cancellation'
        }
      });
    } catch (notifError) {
      console.error('[Cancel] Notification error:', notifError);
      // Don't throw - cancellation is already done
    }

    console.log('[Cancel] Success');

    return new Response(
      JSON.stringify({
        success: true,
        refundAmount,
        refundPercentage,
        message: refundAmount > 0 
          ? `${refundAmount}토큰이 환불되었습니다 (${refundPercentage}%).`
          : '취소 시간이 너무 촉박하여 환불이 불가능합니다.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('[Cancel] Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to cancel booking'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
