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
        @media print {
          * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
          body { font-size: 12px; margin: 0; padding: 15px; }
          .page-break { page-break-before: always; }
          .no-break { page-break-inside: avoid; }
        }
        body {
          font-family: 'Noto Sans KR', 'Malgun Gothic', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: white;
        }
        .brand-header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px 0;
          border-bottom: 2px solid #e5e7eb;
        }
        .brand-title {
          font-size: 24px;
          font-weight: bold;
          color: #6366f1;
          margin-bottom: 5px;
        }
        .brand-subtitle {
          font-size: 12px;
          color: #6b7280;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #6366f1;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .premium-badge {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 20px;
          text-align: center;
          font-weight: bold;
          font-size: 18px;
          letter-spacing: 1px;
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
          text-align: center;
        }
        .average-score {
          font-size: 36px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .score-description {
          font-size: 16px;
          opacity: 0.9;
        }
        .test-info {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          margin-bottom: 30px;
        }
        .test-info h3 {
          color: #1f2937;
          margin-top: 0;
          margin-bottom: 15px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        .info-item {
          display: flex;
          flex-direction: column;
        }
        .info-label {
          font-weight: bold;
          color: #374151;
          margin-bottom: 5px;
        }
        .info-value {
          color: #6b7280;
        }
        .score-section {
          margin-bottom: 30px;
          page-break-inside: avoid;
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
          padding: 15px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
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
          color: #374151;
        }
        .score-value {
          font-weight: bold;
          color: #6366f1;
          font-size: 18px;
        }
        .score-bar {
          width: 100%;
          height: 12px;
          background-color: #e5e7eb;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .score-fill {
          height: 100%;
          background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981, #3b82f6, #6366f1);
          border-radius: 6px;
          transition: width 0.3s ease;
        }
        .score-level {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }
        .score-interpretation {
          margin-top: 8px;
          padding: 10px;
          background: #f0f9ff;
          border-radius: 6px;
          font-size: 14px;
          color: #0369a1;
        }
        .analysis-section {
          margin-top: 30px;
          page-break-inside: avoid;
        }
        .analysis-content {
          background: #f9fafb;
          padding: 20px;
          border-radius: 10px;
          border-left: 4px solid #10b981;
          white-space: pre-wrap;
          line-height: 1.8;
        }
        .recommendations {
          background: #f0f9ff;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #0ea5e9;
          margin: 20px 0;
        }
        .recommendations h3 {
          color: #0369a1;
          margin-top: 0;
        }
        .recommendation-list {
          list-style: none;
          padding: 0;
        }
        .recommendation-list li {
          padding: 8px 0;
          border-bottom: 1px solid #e0f2fe;
          position: relative;
          padding-left: 20px;
        }
        .recommendation-list li:before {
          content: "•";
          color: #0ea5e9;
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        .disclaimer {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 15px;
          margin-top: 30px;
          font-size: 12px;
          color: #92400e;
          page-break-inside: avoid;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 12px;
          page-break-inside: avoid;
        }
      </style>
    </head>
    <body>
      <div class="brand-header">
        <div class="brand-title">AIHPRO.COM</div>
        <div class="brand-subtitle">AIH 기반 심리검사 전문 플랫폼</div>
      </div>
      
      <div class="header">
        <div class="premium-badge">AIHPRO 프리미엄분석결과</div>
        <div class="title">${assessmentInfo.title}</div>
        <div class="subtitle">${assessmentInfo.subtitle}</div>
        <div class="date">검사일: ${new Date(timestamp).toLocaleDateString('ko-KR')}</div>
      </div>

      <div class="summary-box">
        <div class="average-score">${averageScore.toFixed(1)}</div>
        <div class="score-description">평균 점수 (7점 만점)</div>
        <div style="margin-top: 10px; font-size: 14px; opacity: 0.9;">
          ${averageScore >= 6 ? '높음 수준' : averageScore >= 5 ? '중상 수준' : averageScore >= 4 ? '보통 수준' : averageScore >= 3 ? '중하 수준' : '낮음 수준'}
        </div>
      </div>

      ${assessmentInfo ? `
      <div class="test-info no-break">
        <h3>검사 정보</h3>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">검사명</div>
            <div class="info-value">${assessmentInfo.title}</div>
          </div>
          <div class="info-item">
            <div class="info-label">검사 유형</div>
            <div class="info-value">${assessmentType}</div>
          </div>
          <div class="info-item">
            <div class="info-label">평가 항목 수</div>
            <div class="info-value">${Object.keys(results).length}개 영역</div>
          </div>
          <div class="info-item">
            <div class="info-label">검사일</div>
            <div class="info-value">${new Date(timestamp).toLocaleDateString('ko-KR')}</div>
          </div>
        </div>
      </div>
      ` : ''}

      <div class="score-section">
        <div class="section-title">영역별 상세 점수</div>
        ${scoresHTML}
      </div>

      <div class="analysis-section page-break">
        <div class="section-title">AIH 전문가 심층 분석</div>
        <div class="analysis-content">${aiAnalysis}</div>
      </div>

      <div class="recommendations no-break">
        <h3>추천 사항 및 다음 단계</h3>
        <ul class="recommendation-list">
          <li>정기적인 자가 평가를 통해 변화를 모니터링하세요</li>
          <li>낮은 점수를 받은 영역에 대해 집중적인 관심을 기울이세요</li>
          <li>전문가와의 상담을 통해 개인별 맞춤 전략을 수립하세요</li>
          <li>필요시 추가적인 전문 평가나 검사를 고려해보세요</li>
          <li>가족이나 주변 지지체계와 결과를 공유하여 도움을 받으세요</li>
        </ul>
      </div>

      <div class="disclaimer">
        <strong>※ 중요 안내</strong><br>
        ${assessmentInfo.disclaimer}<br>
        본 검사 결과는 AIH 기반 분석을 통한 참고 자료이며, 정확한 진단이나 치료가 필요한 경우 반드시 전문가와 상담하시기 바랍니다.
      </div>

      <div class="footer">
        <p><strong>프리미엄 분석 리포트</strong></p>
        <p>생성일: ${new Date().toLocaleString('ko-KR')}</p>
        <p>이 보고서는 프리미엄 심리검사 결과를 바탕으로 생성되었습니다.</p>
        <p style="margin-top: 15px;">© 2024 AIHPRO.COM. All rights reserved.</p>
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