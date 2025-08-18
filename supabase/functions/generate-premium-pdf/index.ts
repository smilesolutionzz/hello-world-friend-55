import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// PDF 생성을 위한 HTML 템플릿
const generatePDFHTML = (data: any) => {
  const { assessmentType, results, assessmentInfo, aiAnalysis, timestamp } = data;
  
  const scoresHTML = Object.entries(results)
    .map(([category, score]: [string, any]) => {
      const percentage = (score / 7) * 100;
      const level = score >= 6 ? '높음' : score >= 5 ? '중상' : score >= 4 ? '보통' : score >= 3 ? '중하' : '낮음';
      return `
        <div class="score-item">
          <div class="score-header">
            <span class="category">${category.replace(/_/g, ' ')}</span>
            <span class="score-value">${score.toFixed(1)}/7.0</span>
          </div>
          <div class="score-bar">
            <div class="score-fill" style="width: ${percentage}%"></div>
          </div>
          <div class="score-level">${level}</div>
        </div>
      `;
    }).join('');

  const averageScore = Object.values(results).reduce((sum: number, score: any) => sum + score, 0) / Object.keys(results).length;

  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${assessmentInfo.title} 결과보고서</title>
      <style>
        body {
          font-family: 'Noto Sans KR', 'Malgun Gothic', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #6366f1;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 5px;
        }
        .date {
          font-size: 14px;
          color: #9ca3af;
        }
        .summary-box {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 30px;
        }
        .average-score {
          font-size: 36px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 10px;
        }
        .score-section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 15px;
          border-left: 4px solid #6366f1;
          padding-left: 10px;
        }
        .score-item {
          margin-bottom: 15px;
          padding: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        .score-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .category {
          font-weight: bold;
          text-transform: capitalize;
        }
        .score-value {
          font-weight: bold;
          color: #6366f1;
        }
        .score-bar {
          width: 100%;
          height: 8px;
          background-color: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 5px;
        }
        .score-fill {
          height: 100%;
          background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981, #3b82f6, #6366f1);
          transition: width 0.3s ease;
        }
        .score-level {
          font-size: 12px;
          color: #6b7280;
        }
        .analysis-section {
          margin-top: 30px;
        }
        .analysis-content {
          background: #f9fafb;
          padding: 20px;
          border-radius: 10px;
          border-left: 4px solid #10b981;
          white-space: pre-wrap;
        }
        .disclaimer {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 15px;
          margin-top: 30px;
          font-size: 12px;
          color: #92400e;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 12px;
        }
        @media print {
          body { padding: 10px; }
          .header { page-break-after: avoid; }
          .analysis-section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${assessmentInfo.title}</div>
        <div class="subtitle">${assessmentInfo.subtitle}</div>
        <div class="date">검사일: ${new Date(timestamp).toLocaleDateString('ko-KR')}</div>
      </div>

      <div class="summary-box">
        <div class="average-score">${averageScore.toFixed(1)}</div>
        <div style="text-align: center;">평균 점수 (7점 만점)</div>
      </div>

      <div class="score-section">
        <div class="section-title">영역별 상세 점수</div>
        ${scoresHTML}
      </div>

      <div class="analysis-section">
        <div class="section-title">AI 전문가 심층 분석</div>
        <div class="analysis-content">${aiAnalysis}</div>
      </div>

      <div class="disclaimer">
        <strong>※ 중요 안내</strong><br>
        ${assessmentInfo.disclaimer}<br>
        본 검사 결과는 AI 기반 분석을 통한 참고 자료이며, 정확한 진단이나 치료가 필요한 경우 반드시 전문가와 상담하시기 바랍니다.
      </div>

      <div class="footer">
        생성일: ${new Date().toLocaleString('ko-KR')}<br>
        이 보고서는 프리미엄 심리검사 결과를 바탕으로 생성되었습니다.
      </div>
    </body>
    </html>
  `;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await req.json();
    console.log('Generating PDF for assessment:', data.assessmentType);

    // HTML 생성
    const htmlContent = generatePDFHTML(data);

    // PDF 생성을 위한 외부 서비스 사용 (예: Puppeteer 대안)
    // 실제 환경에서는 PDF 생성 서비스나 라이브러리를 사용해야 함
    // 여기서는 HTML을 base64로 인코딩하여 반환 (임시 구현)
    
    const encoder = new TextEncoder();
    const htmlBytes = encoder.encode(htmlContent);
    
    // 실제로는 PDF 생성 라이브러리나 서비스를 사용해야 함
    // 현재는 HTML을 반환하여 브라우저에서 인쇄하도록 안내
    
    return new Response(JSON.stringify({ 
      success: true,
      htmlContent: htmlContent,
      message: "PDF 생성을 위해 브라우저의 인쇄 기능을 사용하세요."
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-premium-pdf function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});