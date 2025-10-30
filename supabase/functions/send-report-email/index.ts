import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendReportEmailRequest {
  reportUrl: string;
  reportData: {
    childName: string;
    reportType: string;
    aiAnalysis?: {
      strengths?: string[];
      concerns?: string[];
      recommendations?: string[];
    };
    riskLevel?: string;
  };
  recipientEmail: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 사용자 인증
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("인증이 필요합니다.");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("유효하지 않은 인증 정보입니다.");
    }

    // 토큰 차감 (5토큰)
    const REQUIRED_TOKENS = 5;
    
    const { data: tokenData, error: tokenError } = await supabase
      .from("user_tokens")
      .select("current_tokens")
      .eq("user_id", user.id)
      .single();

    if (tokenError || !tokenData) {
      throw new Error("토큰 정보를 가져올 수 없습니다.");
    }

    if (tokenData.current_tokens < REQUIRED_TOKENS) {
      return new Response(
        JSON.stringify({ error: "토큰이 부족합니다. 5토큰이 필요합니다." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 토큰 차감
    const { error: deductError } = await supabase
      .from("user_tokens")
      .update({ 
        current_tokens: tokenData.current_tokens - REQUIRED_TOKENS,
        total_used: supabase.sql`total_used + ${REQUIRED_TOKENS}`
      })
      .eq("user_id", user.id);

    if (deductError) {
      throw new Error("토큰 차감 중 오류가 발생했습니다.");
    }

    // 사용량 추적
    await supabase.from("usage_tracking").insert({
      user_id: user.id,
      feature_type: "email_report",
      usage_date: new Date().toISOString().split('T')[0],
      count: REQUIRED_TOKENS
    });

    const { reportUrl, reportData, recipientEmail }: SendReportEmailRequest = await req.json();

    // 이메일 HTML 생성
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .risk-badge { display: inline-block; padding: 6px 12px; border-radius: 4px; font-weight: bold; }
            .risk-low { background: #d1fae5; color: #065f46; }
            .risk-medium { background: #fef3c7; color: #92400e; }
            .risk-high { background: #fee2e2; color: #991b1b; }
            .list-item { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .list-item:last-child { border-bottom: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🧠 심리 분석 리포트</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">${reportData.childName}님의 ${reportData.reportType}</p>
            </div>
            <div class="content">
              <div class="section">
                <h2 style="margin-top: 0; color: #667eea;">📋 리포트 정보</h2>
                <p><strong>이름:</strong> ${reportData.childName}</p>
                <p><strong>리포트 유형:</strong> ${reportData.reportType}</p>
                ${reportData.riskLevel ? `
                  <p>
                    <strong>위험도:</strong> 
                    <span class="risk-badge risk-${reportData.riskLevel === '높음' ? 'high' : reportData.riskLevel === '중간' ? 'medium' : 'low'}">
                      ${reportData.riskLevel}
                    </span>
                  </p>
                ` : ''}
              </div>

              ${reportData.aiAnalysis?.strengths && reportData.aiAnalysis.strengths.length > 0 ? `
                <div class="section">
                  <h2 style="margin-top: 0; color: #10b981;">✨ 강점</h2>
                  ${reportData.aiAnalysis.strengths.map(item => `<div class="list-item">• ${item}</div>`).join('')}
                </div>
              ` : ''}

              ${reportData.aiAnalysis?.concerns && reportData.aiAnalysis.concerns.length > 0 ? `
                <div class="section">
                  <h2 style="margin-top: 0; color: #f59e0b;">⚠️ 주의사항</h2>
                  ${reportData.aiAnalysis.concerns.map(item => `<div class="list-item">• ${item}</div>`).join('')}
                </div>
              ` : ''}

              ${reportData.aiAnalysis?.recommendations && reportData.aiAnalysis.recommendations.length > 0 ? `
                <div class="section">
                  <h2 style="margin-top: 0; color: #667eea;">💡 권장사항</h2>
                  ${reportData.aiAnalysis.recommendations.map(item => `<div class="list-item">• ${item}</div>`).join('')}
                </div>
              ` : ''}

              <div class="section" style="text-align: center;">
                <p>전체 리포트는 아래 링크에서 확인하실 수 있습니다.</p>
                <a href="${reportUrl}" class="button" style="color: white;">전체 리포트 보기</a>
              </div>

              <div style="margin-top: 20px; padding: 20px; background: white; border-radius: 8px; font-size: 12px; color: #6b7280;">
                <p style="margin: 0;"><strong>안내:</strong></p>
                <p style="margin: 5px 0 0 0;">본 리포트는 참고용이며, 전문가의 진단을 대체할 수 없습니다. 우려사항이 있으시면 전문가와 상담하시기 바랍니다.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Resend로 이메일 발송
    const { data, error } = await resend.emails.send({
      from: "심리분석 리포트 <onboarding@resend.dev>", // 도메인 인증 후 변경 필요
      to: [recipientEmail],
      subject: `[심리분석] ${reportData.childName}님의 ${reportData.reportType} 리포트`,
      html: emailHtml,
    });

    if (error) {
      console.error("이메일 발송 오류:", error);
      throw new Error("이메일 발송 중 오류가 발생했습니다.");
    }

    console.log("이메일 발송 성공:", data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "리포트가 이메일로 발송되었습니다.",
        emailId: data?.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "알 수 없는 오류가 발생했습니다." }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
