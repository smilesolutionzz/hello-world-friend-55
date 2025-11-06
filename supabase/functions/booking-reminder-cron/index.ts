import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[Reminder] Running booking reminder cron job');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get bookings happening in 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    const { data: bookings, error: bookingsError } = await supabase
      .from('consultation_bookings')
      .select('id, booking_date, start_time, status')
      .eq('booking_date', tomorrowDate)
      .in('status', ['pending', 'confirmed']);

    if (bookingsError) {
      console.error('[Reminder] Error fetching bookings:', bookingsError);
      throw bookingsError;
    }

    console.log('[Reminder] Found', bookings?.length || 0, 'bookings for tomorrow');

    if (!bookings || bookings.length === 0) {
      return new Response(
        JSON.stringify({ success: true, remindersSent: 0 }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Send reminders for each booking
    const results = await Promise.allSettled(
      bookings.map(booking => 
        supabase.functions.invoke('send-booking-notification', {
          body: {
            bookingId: booking.id,
            notificationType: 'reminder'
          }
        })
      )
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    console.log('[Reminder] Sent', successCount, 'reminders,', failureCount, 'failed');

    return new Response(
      JSON.stringify({
        success: true,
        remindersSent: successCount,
        failed: failureCount,
        totalBookings: bookings.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('[Reminder] Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to send reminders'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
