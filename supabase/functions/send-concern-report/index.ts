import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConcernReportEmailRequest {
  email: string;
  concernText: string;
  analysis: {
    type: string;
    severity: string;
    detailedAdvice: string;
    recommendations?: string[];
    nextSteps?: string[];
    confidence?: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 사용자 인증 확인
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('인증이 필요합니다.');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('사용자 인증에 실패했습니다.');
    }

    // 토큰 차감 (이메일 발송 비용: 5토큰)
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('user_tokens')
      .select('current_tokens')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData) {
      throw new Error('토큰 정보를 가져올 수 없습니다.');
    }

    if (tokenData.current_tokens < 5) {
      throw new Error('토큰이 부족합니다. (필요: 5토큰)');
    }

    // 토큰 차감
    const { error: deductError } = await supabaseClient
      .from('user_tokens')
      .update({ 
        current_tokens: tokenData.current_tokens - 5
      })
      .eq('user_id', user.id);

    if (deductError) {
      console.error('토큰 차감 오류:', deductError);
      throw new Error('토큰 차감에 실패했습니다.');
    }

    // 사용량 추적 - 기존 레코드 확인 후 업데이트 또는 생성
    const usageDate = new Date().toISOString().split('T')[0];
    const { data: existingUsage } = await supabaseClient
      .from('usage_tracking')
      .select('count')
      .eq('user_id', user.id)
      .eq('feature_type', 'concern_email')
      .eq('usage_date', usageDate)
      .single();

    if (existingUsage) {
      // 기존 레코드가 있으면 count 증가
      await supabaseClient
        .from('usage_tracking')
        .update({ count: existingUsage.count + 5 })
        .eq('user_id', user.id)
        .eq('feature_type', 'concern_email')
        .eq('usage_date', usageDate);
    } else {
      // 새 레코드 생성
      await supabaseClient
        .from('usage_tracking')
        .insert({
          user_id: user.id,
          feature_type: 'concern_email',
          usage_date: usageDate,
          count: 5
        });
    }

    const { email, concernText, analysis }: ConcernReportEmailRequest = await req.json();

    // HTML 이메일 생성
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .section {
              background: white;
              padding: 20px;
              margin-bottom: 20px;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #667eea;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .severity-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: bold;
            }
            .severity-high { background: #fee2e2; color: #dc2626; }
            .severity-medium { background: #fed7aa; color: #ea580c; }
            .severity-low { background: #d1fae5; color: #059669; }
            .list-item {
              background: #f3f4f6;
              padding: 12px;
              margin: 8px 0;
              border-radius: 6px;
              border-left: 3px solid #667eea;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0;">🧠 전문가 고민 분석 리포트</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">심리 건강 전문 분석 결과입니다</p>
          </div>
          
          <div class="content">
            <div class="section">
              <div class="section-title">💭 고민 내용</div>
              <p style="white-space: pre-wrap; line-height: 1.8;">${concernText}</p>
            </div>

            <div class="section">
              <div class="section-title">📊 분석 결과</div>
              <p><strong>유형:</strong> ${analysis.type}</p>
              <p>
                <strong>심각도:</strong> 
                <span class="severity-badge severity-${analysis.severity === '높음' ? 'high' : analysis.severity === '중간' ? 'medium' : 'low'}">
                  ${analysis.severity}
                </span>
              </p>
              ${analysis.confidence ? `<p><strong>신뢰도:</strong> ${analysis.confidence}%</p>` : ''}
            </div>

            <div class="section">
              <div class="section-title">💡 AI 상세 조언</div>
              <p style="white-space: pre-wrap; line-height: 1.8;">${analysis.detailedAdvice}</p>
            </div>

            ${analysis.recommendations && analysis.recommendations.length > 0 ? `
              <div class="section">
                <div class="section-title">✅ 추천 사항</div>
                ${analysis.recommendations.map((rec, idx) => `
                  <div class="list-item">
                    <strong>${idx + 1}.</strong> ${rec}
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${analysis.nextSteps && analysis.nextSteps.length > 0 ? `
              <div class="section">
                <div class="section-title">🎯 다음 단계</div>
                ${analysis.nextSteps.map((step, idx) => `
                  <div class="list-item">
                    <strong>${idx + 1}.</strong> ${step}
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <div class="footer">
              <p>본 분석 결과는 AI 기반으로 제공되며, 전문가의 진단을 대체할 수 없습니다.</p>
              <p>심각한 심리적 어려움이 있다면 전문가의 상담을 권장합니다.</p>
              <p style="margin-top: 15px; color: #9ca3af; font-size: 12px;">
                © 2025 AI 심리 분석 서비스. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "AI 심리 분석 <onboarding@resend.dev>",
      to: [email],
      subject: `🧠 AI 고민 분석 리포트 - ${analysis.type}`,
      html: htmlContent,
    });

    console.log("이메일 발송 성공:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "이메일이 성공적으로 발송되었습니다.",
        tokensDeducted: 5
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
    console.error("이메일 발송 오류:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "이메일 발송 중 오류가 발생했습니다." 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
