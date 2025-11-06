import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingNotificationRequest {
  institutionName: string;
  institutionEmail: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  topic: string;
  bookingDate: string;
  bookingTime: string;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[BOOKING-NOTIFICATION] Function started");

    const {
      institutionName,
      institutionEmail,
      userName,
      userPhone,
      userEmail,
      topic,
      bookingDate,
      bookingTime,
      notes,
    }: BookingNotificationRequest = await req.json();

    console.log("[BOOKING-NOTIFICATION] Processing booking for:", institutionName);

    // 기관에게 보낼 이메일
    const institutionEmailResponse = await resend.emails.send({
      from: "AIHPRO <onboarding@resend.dev>",
      to: [institutionEmail],
      subject: `[AIHPRO] 새로운 상담 예약 신청 - ${userName}님`,
      html: `
        <div style="font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📋 새로운 상담 예약</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              안녕하세요, <strong>${institutionName}</strong> 담당자님!
            </p>
            
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              AIHPRO를 통해 새로운 상담 예약 신청이 접수되었습니다.
            </p>

            <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea;">
              <h2 style="color: #667eea; font-size: 18px; margin-top: 0;">📅 예약 정보</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; font-weight: 600;">신청자</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333;">${userName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; font-weight: 600;">연락처</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333;">${userPhone}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; font-weight: 600;">이메일</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333;">${userEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; font-weight: 600;">희망 날짜</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333; font-weight: 600;">${bookingDate}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; font-weight: 600;">희망 시간</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333; font-weight: 600;">${bookingTime}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #666; font-weight: 600;">상담 주제</td>
                  <td style="padding: 12px 0; color: #333;">${topic}</td>
                </tr>
              </table>
            </div>

            ${notes ? `
            <div style="background: #fff9e6; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #f57c00; font-size: 16px; margin-top: 0;">💬 추가 메모</h3>
              <p style="color: #555; line-height: 1.6; margin: 0; white-space: pre-wrap;">${notes}</p>
            </div>
            ` : ''}

            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <p style="color: #1565c0; margin: 0; font-size: 14px; line-height: 1.6;">
                ⏰ <strong>24시간 이내</strong>에 신청자에게 연락 주시기 바랍니다.<br>
                빠른 응대가 고객 만족도 향상에 도움이 됩니다.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 13px; margin: 5px 0;">
                본 메일은 AIHPRO 플랫폼을 통해 자동 발송되었습니다.
              </p>
              <p style="color: #999; font-size: 13px; margin: 5px 0;">
                문의사항이 있으시면 고객센터로 연락 주시기 바랍니다.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("[BOOKING-NOTIFICATION] Institution email sent:", institutionEmailResponse);

    // 사용자에게 확인 이메일 발송
    const userEmailResponse = await resend.emails.send({
      from: "AIHPRO <onboarding@resend.dev>",
      to: [userEmail],
      subject: `[AIHPRO] 상담 신청이 완료되었습니다 - ${institutionName}`,
      html: `
        <div style="font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ 상담 신청 완료</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              안녕하세요, <strong>${userName}</strong>님!
            </p>
            
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              <strong>${institutionName}</strong>에 상담 신청이 정상적으로 접수되었습니다.
            </p>

            <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4caf50;">
              <h2 style="color: #4caf50; font-size: 18px; margin-top: 0;">📋 신청 내역</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; font-weight: 600;">기관명</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333;">${institutionName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; font-weight: 600;">희망 날짜</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333; font-weight: 600;">${bookingDate}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; font-weight: 600;">희망 시간</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333; font-weight: 600;">${bookingTime}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #666; font-weight: 600;">상담 주제</td>
                  <td style="padding: 12px 0; color: #333;">${topic}</td>
                </tr>
              </table>
            </div>

            <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <p style="color: #2e7d32; margin: 0; font-size: 14px; line-height: 1.6;">
                ✅ 기관에서 확인 후 <strong>24시간 이내</strong>에 연락드릴 예정입니다.<br>
                📞 연락처: ${userPhone}<br>
                ✉️ 이메일: ${userEmail}
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; font-size: 14px; margin: 10px 0;">
                상담 일정은 예약 관리 페이지에서 확인하실 수 있습니다.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 13px; margin: 5px 0;">
                본 메일은 AIHPRO 플랫폼을 통해 자동 발송되었습니다.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("[BOOKING-NOTIFICATION] User confirmation email sent:", userEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        institutionEmailId: institutionEmailResponse.data?.id,
        userEmailId: userEmailResponse.data?.id
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("[BOOKING-NOTIFICATION] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
