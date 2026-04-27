import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ShareEmailRequest {
  email: string;
  type: 'report' | 'test_result' | 'analysis' | 'concern';
  title: string;
  recipientName?: string;
  senderName?: string;
  content: {
    summary?: string;
    sections?: Array<{ title: string; content: string }>;
    scores?: Record<string, number>;
    interpretation?: string;
    recommendations?: string[];
    metadata?: Record<string, any>;
  };
}

const getEmailTemplate = (data: ShareEmailRequest): string => {
  const { type, title, recipientName, senderName, content } = data;
  
  const typeLabels: Record<string, { icon: string; label: string; color: string }> = {
    report: { icon: '📊', label: 'AI 분석 리포트', color: '#667eea' },
    test_result: { icon: '✅', label: '심리검사 결과', color: '#10b981' },
    analysis: { icon: '🧠', label: 'AI 심층 분석', color: '#8b5cf6' },
    concern: { icon: '💭', label: '고민 분석 리포트', color: '#f59e0b' },
  };

  const typeInfo = typeLabels[type] || typeLabels.report;

  const sectionsHtml = content.sections?.map((section, idx) => `
    <div class="section">
      <div class="section-title">${idx + 1}. ${section.title}</div>
      <div style="white-space: pre-wrap; line-height: 1.8;">${section.content.replace(/<[^>]*>/g, '')}</div>
    </div>
  `).join('') || '';

  const scoresHtml = content.scores ? `
    <div class="section">
      <div class="section-title">📈 검사 점수</div>
      <div class="scores-grid">
        ${Object.entries(content.scores).map(([key, value]) => `
          <div class="score-item">
            <span class="score-label">${key}</span>
            <span class="score-value">${value}점</span>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const recommendationsHtml = content.recommendations?.length ? `
    <div class="section">
      <div class="section-title">✅ 추천 사항</div>
      ${content.recommendations.map((rec, idx) => `
        <div class="list-item">
          <strong>${idx + 1}.</strong> ${rec}
        </div>
      `).join('')}
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 650px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f3f4f6;
          }
          .container {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, ${typeInfo.color} 0%, ${typeInfo.color}dd 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
          }
          .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
          }
          .greeting {
            padding: 30px 30px 0 30px;
            font-size: 16px;
            color: #4b5563;
          }
          .content {
            padding: 20px 30px 30px 30px;
          }
          .section {
            background: #f9fafb;
            padding: 20px;
            margin-bottom: 16px;
            border-radius: 12px;
            border-left: 4px solid ${typeInfo.color};
          }
          .section-title {
            font-size: 16px;
            font-weight: 700;
            color: ${typeInfo.color};
            margin-bottom: 12px;
          }
          .summary-box {
            background: linear-gradient(135deg, ${typeInfo.color}10 0%, ${typeInfo.color}05 100%);
            border: 1px solid ${typeInfo.color}30;
            padding: 24px;
            border-radius: 12px;
            margin-bottom: 20px;
          }
          .summary-box h3 {
            margin: 0 0 12px 0;
            color: ${typeInfo.color};
            font-size: 18px;
          }
          .scores-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .score-item {
            background: white;
            padding: 12px 16px;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          .score-label {
            font-weight: 500;
            color: #4b5563;
          }
          .score-value {
            font-weight: 700;
            color: ${typeInfo.color};
          }
          .list-item {
            background: white;
            padding: 14px 16px;
            margin: 8px 0;
            border-radius: 8px;
            border-left: 3px solid ${typeInfo.color};
          }
          .cta-section {
            text-align: center;
            padding: 30px;
            background: #f9fafb;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, ${typeInfo.color} 0%, ${typeInfo.color}dd 100%);
            color: white;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
          }
          .footer {
            text-align: center;
            padding: 24px 30px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 13px;
          }
          .footer a {
            color: ${typeInfo.color};
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${typeInfo.icon} ${title}</h1>
            <p>${typeInfo.label}</p>
          </div>
          
          ${recipientName || senderName ? `
            <div class="greeting">
              ${recipientName ? `<strong>${recipientName}</strong>님께,<br>` : ''}
              ${senderName ? `<span style="color: #9ca3af;">${senderName}님이 공유한 분석 결과입니다.</span>` : ''}
            </div>
          ` : ''}
          
          <div class="content">
            ${content.summary ? `
              <div class="summary-box">
                <h3>📝 요약</h3>
                <p style="margin: 0; white-space: pre-wrap;">${content.summary.replace(/<[^>]*>/g, '').substring(0, 500)}${content.summary.length > 500 ? '...' : ''}</p>
              </div>
            ` : ''}
            
            ${scoresHtml}
            
            ${content.interpretation ? `
              <div class="section">
                <div class="section-title">📖 해석</div>
                <p style="white-space: pre-wrap; line-height: 1.8;">${content.interpretation.replace(/<[^>]*>/g, '')}</p>
              </div>
            ` : ''}
            
            ${sectionsHtml}
            
            ${recommendationsHtml}
          </div>
          
          <div class="cta-section">
            <p style="margin: 0 0 16px 0; color: #4b5563;">더 자세한 분석이 필요하신가요?</p>
            <a href="https://aihpro.app" class="cta-button">AIHPRO에서 무료 분석받기</a>
          </div>
          
          <div class="footer">
            <p>본 분석 결과는 AI 기반으로 제공되며, 전문가의 진단을 대체할 수 없습니다.</p>
            <p style="margin-top: 12px;">
              <a href="https://aihpro.app">AIHPRO</a> | AI 기반 심리·발달 케어 플랫폼
            </p>
            <p style="margin-top: 8px; color: #9ca3af; font-size: 11px;">
              © 2025 AIHPRO. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== send-share-email 함수 시작 ===');
    
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

    console.log('사용자 인증 성공:', user.id);

    // 토큰 차감 (이메일 발송 비용: 3토큰)
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('user_tokens')
      .select('current_tokens')
      .eq('user_id', user.id)
      .single();

    if (tokenError) {
      console.log('토큰 정보 조회 실패, 무료 발송 진행');
    } else if (tokenData && tokenData.current_tokens >= 3) {
      // 토큰 차감
      await supabaseClient
        .from('user_tokens')
        .update({ current_tokens: tokenData.current_tokens - 3 })
        .eq('user_id', user.id);
      console.log('토큰 3개 차감 완료');
    }

    const requestData: ShareEmailRequest = await req.json();
    console.log('요청 데이터:', { 
      email: requestData.email, 
      type: requestData.type, 
      title: requestData.title 
    });

    const htmlContent = getEmailTemplate(requestData);

    const typeLabels: Record<string, string> = {
      report: '📊 AI 분석 리포트',
      test_result: '✅ 심리검사 결과',
      analysis: '🧠 AI 심층 분석',
      concern: '💭 고민 분석 리포트',
    };

    const subjectPrefix = typeLabels[requestData.type] || '📊 분석 결과';

    // 검증된 도메인 사용 (aihpro.app)
    const fromAddress = "AIHPRO 리포트 <reports@aihpro.app>";
    
    console.log('이메일 발송 시도:', { from: fromAddress, to: requestData.email });
    
    const emailResponse = await resend.emails.send({
      from: fromAddress,
      to: [requestData.email],
      subject: `${subjectPrefix} - ${requestData.title}`,
      html: htmlContent,
    });

    console.log("이메일 발송 성공:", emailResponse);

    // 사용량 추적
    const usageDate = new Date().toISOString().split('T')[0];
    await supabaseClient
      .from('usage_tracking')
      .upsert({
        user_id: user.id,
        feature_type: `share_email_${requestData.type}`,
        usage_date: usageDate,
        count: 1
      }, { onConflict: 'user_id,feature_type,usage_date' });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "이메일이 성공적으로 발송되었습니다.",
        emailId: emailResponse.data?.id
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
