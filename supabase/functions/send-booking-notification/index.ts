import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  bookingId: string;
  notificationType: 'confirmation' | 'reminder' | 'cancellation' | 'rescheduled';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[Notification] Processing notification request');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { bookingId, notificationType }: NotificationRequest = await req.json();

    console.log('[Notification] Type:', notificationType, 'Booking:', bookingId);

    // Get booking details with user and expert info
    const { data: booking, error: bookingError } = await supabase
      .from('consultation_bookings')
      .select(`
        *,
        experts!inner (
          full_name,
          professional_title,
          user_id
        )
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      console.error('[Notification] Booking not found:', bookingError);
      throw new Error('Booking not found');
    }

    // Get user email
    const { data: { user: userAuth }, error: userError } = await supabase.auth.admin.getUserById(booking.user_id);
    if (userError || !userAuth?.email) {
      console.error('[Notification] User email not found:', userError);
      throw new Error('User email not found');
    }

    // Get expert email
    const { data: { user: expertAuth }, error: expertError } = await supabase.auth.admin.getUserById(booking.experts.user_id);
    if (expertError || !expertAuth?.email) {
      console.error('[Notification] Expert email not found:', expertError);
      throw new Error('Expert email not found');
    }

    console.log('[Notification] Sending to:', userAuth.email, 'and', expertAuth.email);

    // Format date and time
    const bookingDate = new Date(booking.booking_date);
    const dateStr = bookingDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
    const timeStr = booking.start_time.substring(0, 5);

    let subject = '';
    let userHtml = '';
    let expertHtml = '';

    switch (notificationType) {
      case 'confirmation':
        subject = '상담 예약이 확정되었습니다';
        userHtml = `
          <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px;">예약 확정 안내</h1>
            <p>안녕하세요,</p>
            <p>상담 예약이 확정되었습니다.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #1f2937;">예약 정보</h2>
              <p><strong>전문가:</strong> ${booking.experts.full_name} (${booking.experts.professional_title})</p>
              <p><strong>일시:</strong> ${dateStr} ${timeStr}</p>
              <p><strong>소요시간:</strong> ${booking.duration_minutes}분</p>
              <p><strong>결제:</strong> ${booking.tokens_paid}토큰</p>
            </div>
            ${booking.notes ? `<p><strong>상담 내용:</strong> ${booking.notes}</p>` : ''}
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              예약 시간 24시간 전까지 취소 가능합니다.
            </p>
          </div>
        `;
        
        expertHtml = `
          <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px;">새로운 예약</h1>
            <p>안녕하세요,</p>
            <p>새로운 상담 예약이 접수되었습니다.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #1f2937;">예약 정보</h2>
              <p><strong>일시:</strong> ${dateStr} ${timeStr}</p>
              <p><strong>소요시간:</strong> ${booking.duration_minutes}분</p>
              ${booking.notes ? `<p><strong>상담 내용:</strong> ${booking.notes}</p>` : ''}
            </div>
          </div>
        `;
        break;

      case 'reminder':
        subject = '내일 상담 예약 안내';
        userHtml = `
          <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #f59e0b; border-bottom: 3px solid #f59e0b; padding-bottom: 10px;">상담 리마인더</h1>
            <p>안녕하세요,</p>
            <p>내일 예정된 상담을 알려드립니다.</p>
            <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h2 style="margin-top: 0; color: #92400e;">예약 정보</h2>
              <p><strong>전문가:</strong> ${booking.experts.full_name}</p>
              <p><strong>일시:</strong> ${dateStr} ${timeStr}</p>
              <p><strong>소요시간:</strong> ${booking.duration_minutes}분</p>
            </div>
            <p>준비해 오시면 좋은 내용이 있다면 미리 정리해 주세요.</p>
          </div>
        `;
        
        expertHtml = `
          <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #f59e0b; border-bottom: 3px solid #f59e0b; padding-bottom: 10px;">상담 리마인더</h1>
            <p>안녕하세요,</p>
            <p>내일 예정된 상담을 알려드립니다.</p>
            <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>일시:</strong> ${dateStr} ${timeStr}</p>
              <p><strong>소요시간:</strong> ${booking.duration_minutes}분</p>
            </div>
          </div>
        `;
        break;

      case 'cancellation':
        subject = '상담 예약이 취소되었습니다';
        userHtml = `
          <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #dc2626; border-bottom: 3px solid #dc2626; padding-bottom: 10px;">예약 취소 안내</h1>
            <p>안녕하세요,</p>
            <p>상담 예약이 취소되었습니다.</p>
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>취소된 예약:</strong> ${dateStr} ${timeStr}</p>
              <p><strong>환불:</strong> ${booking.tokens_paid}토큰</p>
            </div>
            <p>다시 예약하실 수 있습니다.</p>
          </div>
        `;
        
        expertHtml = `
          <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #dc2626; border-bottom: 3px solid #dc2626; padding-bottom: 10px;">예약 취소 안내</h1>
            <p>안녕하세요,</p>
            <p>예약이 취소되었습니다.</p>
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>취소된 시간:</strong> ${dateStr} ${timeStr}</p>
            </div>
          </div>
        `;
        break;

      default:
        throw new Error('Invalid notification type');
    }

    // Send emails
    const [userEmailResponse, expertEmailResponse] = await Promise.all([
      resend.emails.send({
        from: "상담 플랫폼 <onboarding@resend.dev>",
        to: [userAuth.email],
        subject,
        html: userHtml,
      }),
      resend.emails.send({
        from: "상담 플랫폼 <onboarding@resend.dev>",
        to: [expertAuth.email],
        subject,
        html: expertHtml,
      })
    ]);

    console.log('[Notification] Emails sent:', userEmailResponse, expertEmailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        userEmailId: userEmailResponse.data?.id,
        expertEmailId: expertEmailResponse.data?.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('[Notification] Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to send notification'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
