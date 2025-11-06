import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingRequest {
  expertId: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string;   // HH:MM:SS
  durationMinutes: number;
  notes?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[Booking] Processing booking request');
    
    // Initialize Supabase client
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
      console.error('[Booking] Auth error:', authError);
      throw new Error('Unauthorized');
    }

    console.log('[Booking] User authenticated:', user.id);

    // Parse request body
    const { expertId, bookingDate, startTime, durationMinutes, notes }: BookingRequest = await req.json();

    if (!expertId || !bookingDate || !startTime || !durationMinutes) {
      throw new Error('Missing required fields');
    }

    console.log('[Booking] Request:', { expertId, bookingDate, startTime, durationMinutes });

    // Get expert info and hourly rate
    const { data: expert, error: expertError } = await supabase
      .from('experts')
      .select('id, hourly_rate, is_verified, is_available, user_id')
      .eq('id', expertId)
      .single();

    if (expertError || !expert) {
      console.error('[Booking] Expert not found:', expertError);
      throw new Error('Expert not found');
    }

    if (!expert.is_verified || !expert.is_available) {
      throw new Error('Expert is not available');
    }

    // Calculate end time and tokens required
    const endTime = calculateEndTime(startTime, durationMinutes);
    const tokensRequired = Math.ceil((expert.hourly_rate / 60) * durationMinutes);

    console.log('[Booking] Calculated:', { endTime, tokensRequired });

    // Check user tokens
    const { data: userTokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('current_tokens')
      .eq('user_id', user.id)
      .single();

    if (tokensError || !userTokens) {
      console.error('[Booking] Tokens check error:', tokensError);
      throw new Error('Cannot verify user tokens');
    }

    if (userTokens.current_tokens < tokensRequired) {
      throw new Error(`Insufficient tokens. Required: ${tokensRequired}, Available: ${userTokens.current_tokens}`);
    }

    console.log('[Booking] Token check passed');

    // Check for scheduling conflicts
    const { data: conflicts, error: conflictError } = await supabase
      .from('consultation_bookings')
      .select('id')
      .eq('expert_id', expertId)
      .eq('booking_date', bookingDate)
      .eq('start_time', startTime)
      .in('status', ['pending', 'confirmed'])
      .limit(1);

    if (conflictError) {
      console.error('[Booking] Conflict check error:', conflictError);
      throw new Error('Cannot check scheduling conflicts');
    }

    if (conflicts && conflicts.length > 0) {
      throw new Error('This time slot is already booked');
    }

    console.log('[Booking] No conflicts found');

    // Check if time is within expert's schedule
    const dayOfWeek = new Date(bookingDate).getDay();
    const { data: schedules, error: scheduleError } = await supabase
      .from('expert_schedules')
      .select('start_time, end_time')
      .eq('expert_id', expertId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true);

    if (scheduleError) {
      console.error('[Booking] Schedule check error:', scheduleError);
      throw new Error('Cannot verify expert schedule');
    }

    if (!schedules || schedules.length === 0) {
      throw new Error('Expert is not available on this day');
    }

    const isWithinSchedule = schedules.some(schedule => 
      startTime >= schedule.start_time && endTime <= schedule.end_time
    );

    if (!isWithinSchedule) {
      throw new Error('Selected time is outside expert availability');
    }

    console.log('[Booking] Schedule check passed');

    // Check for time off
    const { data: timeOff, error: timeOffError } = await supabase
      .from('expert_time_off')
      .select('id')
      .eq('expert_id', expertId)
      .lte('start_date', bookingDate)
      .gte('end_date', bookingDate)
      .limit(1);

    if (timeOffError) {
      console.error('[Booking] Time off check error:', timeOffError);
      throw new Error('Cannot verify expert availability');
    }

    if (timeOff && timeOff.length > 0) {
      throw new Error('Expert is on leave for this date');
    }

    console.log('[Booking] Creating booking...');

    // Create booking (transaction-like operation using RLS and unique constraint)
    const { data: booking, error: bookingError } = await supabase
      .from('consultation_bookings')
      .insert({
        user_id: user.id,
        expert_id: expertId,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: durationMinutes,
        status: 'pending',
        tokens_paid: tokensRequired,
        notes: notes || null
      })
      .select()
      .single();

    if (bookingError) {
      console.error('[Booking] Booking creation error:', bookingError);
      
      // Check if it's a uniqueness violation
      if (bookingError.code === '23505') {
        throw new Error('This time slot was just booked by someone else. Please select another time.');
      }
      
      throw new Error('Failed to create booking');
    }

    console.log('[Booking] Booking created:', booking.id);

    // Deduct tokens
    const { error: tokenDeductError } = await supabase
      .from('user_tokens')
      .update({ 
        current_tokens: userTokens.current_tokens - tokensRequired 
      })
      .eq('user_id', user.id);

    if (tokenDeductError) {
      console.error('[Booking] Token deduction error:', tokenDeductError);
      
      // Rollback: delete booking
      await supabase
        .from('consultation_bookings')
        .delete()
        .eq('id', booking.id);
      
      throw new Error('Failed to process payment');
    }

    console.log('[Booking] Tokens deducted');

    // Track usage
    await supabase
      .from('usage_tracking')
      .insert({
        user_id: user.id,
        feature_type: 'consultation_booking',
        usage_date: new Date().toISOString().split('T')[0],
        count: 1
      });

    console.log('[Booking] Success');

    return new Response(
      JSON.stringify({
        success: true,
        booking: {
          id: booking.id,
          expertId: booking.expert_id,
          bookingDate: booking.booking_date,
          startTime: booking.start_time,
          endTime: booking.end_time,
          status: booking.status,
          tokensPaid: booking.tokens_paid
        },
        remainingTokens: userTokens.current_tokens - tokensRequired
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('[Booking] Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create booking'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00`;
}
