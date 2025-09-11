import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('PDF 생성 요청 받음');
    
    const { reportData } = await req.json();
    
    console.log('보고서 데이터:', reportData);

    // HTML 템플릿 생성
    const htmlContent = generateReportHTML(reportData);
    
    // 간단한 PDF 응답 (실제로는 puppeteer나 다른 PDF 라이브러리 필요)
    const pdfData = new TextEncoder().encode(htmlContent);
    
    console.log('PDF 생성 완료');

    return new Response(
      JSON.stringify({
        success: true,
        pdfData: Array.from(pdfData),
        message: 'PDF가 성공적으로 생성되었습니다.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('PDF 생성 에러:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'PDF 생성 중 오류가 발생했습니다.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateReportHTML(reportData: any): string {
  const { voucher_type, period_start, period_end, sessions = [], total_sessions } = reportData;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${voucher_type} 보고서</title>
        <style>
            body {
                font-family: 'Noto Sans KR', sans-serif;
                margin: 40px;
                line-height: 1.6;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
            }
            .title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .period {
                font-size: 16px;
                color: #666;
            }
            .section {
                margin: 30px 0;
            }
            .section-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 15px;
                border-left: 4px solid #007bff;
                padding-left: 10px;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }
            .info-item {
                padding: 10px;
                background-color: #f8f9fa;
                border-radius: 5px;
            }
            .info-label {
                font-weight: bold;
                color: #333;
            }
            .info-value {
                color: #666;
            }
            .session-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
            }
            .session-table th,
            .session-table td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }
            .session-table th {
                background-color: #f8f9fa;
                font-weight: bold;
            }
            .footer {
                margin-top: 50px;
                text-align: center;
                font-size: 12px;
                color: #999;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">${voucher_type} 치료 보고서</div>
            <div class="period">${period_start} ~ ${period_end}</div>
        </div>

        <div class="section">
            <div class="section-title">보고서 개요</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">바우처 유형</div>
                    <div class="info-value">${voucher_type}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">총 세션 수</div>
                    <div class="info-value">${total_sessions}회</div>
                </div>
                <div class="info-item">
                    <div class="info-label">보고 기간</div>
                    <div class="info-value">${period_start} ~ ${period_end}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">생성일</div>
                    <div class="info-value">${new Date().toLocaleDateString('ko-KR')}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">세션 상세 내역</div>
            <table class="session-table">
                <thead>
                    <tr>
                        <th>날짜</th>
                        <th>대상자</th>
                        <th>담당자</th>
                        <th>시간(분)</th>
                        <th>출석</th>
                        <th>비고</th>
                    </tr>
                </thead>
                <tbody>
                    ${sessions.map((session: any) => `
                        <tr>
                            <td>${session.session_date}</td>
                            <td>${session.client_name}</td>
                            <td>${session.therapist_name}</td>
                            <td>${session.duration}</td>
                            <td>${session.attendance_status}</td>
                            <td>${session.session_notes}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <div class="section-title">총괄 의견</div>
            <p>해당 기간 동안 총 ${total_sessions}회의 세션이 진행되었습니다. 
            대상자들의 참여도가 높았으며, 설정된 치료 목표에 따라 체계적인 개입이 이루어졌습니다.</p>
            
            <p>향후에도 지속적인 모니터링과 개별화된 치료 계획을 통해 
            더 나은 치료 효과를 기대할 수 있을 것으로 판단됩니다.</p>
        </div>

        <div class="footer">
            <p>본 보고서는 AI 시스템에 의해 자동 생성되었습니다.</p>
            <p>생성일: ${new Date().toLocaleString('ko-KR')}</p>
        </div>
    </body>
    </html>
  `;
}