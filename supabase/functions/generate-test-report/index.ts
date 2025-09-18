import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { testType, results, analysis, testInfo, chartData } = await req.json();

    console.log('Generating PDF for test result:', { testType, userId: user.id });

    const pdfData = generatePDFContent(testType, results, analysis, testInfo, chartData);
    
    // 실제 PDF 생성은 추후 구현 (현재는 HTML 기반 레포트)
    const reportHtml = generateHTMLReport(testType, results, analysis, testInfo, chartData);

    return new Response(JSON.stringify({
      success: true,
      message: 'PDF 리포트가 생성되었습니다.',
      reportData: {
        html: reportHtml,
        downloadUrl: null, // 실제 PDF 파일 URL (추후 구현)
        fileName: `${testType}_결과리포트_${new Date().toISOString().split('T')[0]}.pdf`
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating PDF report:', error);
    return new Response(
      JSON.stringify({ error: 'PDF 생성 중 오류가 발생했습니다.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generatePDFContent(testType: string, results: any, analysis: string, testInfo: any, chartData?: any) {
  return {
    testType,
    results,
    analysis,
    testInfo,
    chartData,
    generatedAt: new Date().toISOString(),
    version: '1.0'
  };
}

function generateHTMLReport(testType: string, results: any, analysis: string, testInfo: any, chartData?: any) {
  const currentDate = new Date().toLocaleDateString('ko-KR');
  
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${testType} 검사 결과 리포트</title>
    <style>
        @media print {
            * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
            body { font-size: 12px; margin: 0; padding: 15px; }
            .page-break { page-break-before: always; }
            .no-break { page-break-inside: avoid; }
        }
        body {
            font-family: 'Malgun Gothic', 'Noto Sans KR', sans-serif;
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
            border-bottom: 2px solid #e2e8f0;
        }
        .brand-title {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 5px;
        }
        .brand-subtitle {
            font-size: 12px;
            color: #666;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #3b82f6;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            margin: 10px 0 0 0;
            color: #666;
            font-size: 16px;
        }
        .test-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            margin-bottom: 30px;
        }
        .test-info h3 {
            color: #1e40af;
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
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .section h2 {
            color: #1e40af;
            border-left: 4px solid #3b82f6;
            padding-left: 10px;
            margin-bottom: 15px;
            font-size: 20px;
        }
        .result-summary {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        .result-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .result-item:last-child {
            border-bottom: none;
        }
        .result-label {
            font-weight: bold;
            color: #374151;
        }
        .result-value {
            font-weight: bold;
            color: #3b82f6;
            font-size: 16px;
        }
        .analysis-content {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            white-space: pre-line;
            line-height: 1.8;
        }
        .score-visualization {
            margin: 20px 0;
        }
        .score-bar {
            display: flex;
            align-items: center;
            margin: 10px 0;
        }
        .score-name {
            min-width: 120px;
            font-weight: bold;
            margin-right: 15px;
        }
        .bar-container {
            flex: 1;
            height: 20px;
            background: #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
            margin-right: 10px;
        }
        .bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981, #3b82f6, #6366f1);
            border-radius: 10px;
            transition: width 0.3s ease;
        }
        .score-number {
            min-width: 60px;
            text-align: right;
            font-weight: bold;
            color: #3b82f6;
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
        .chart-container {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            margin: 20px 0;
            page-break-inside: avoid;
        }
        .chart-svg {
            width: 100%;
            height: auto;
            max-height: 400px;
        }
        .radar-chart {
            display: flex;
            justify-content: center;
            margin: 20px 0;
        }
        .domain-bar {
            margin: 10px 0;
            padding: 10px;
            border-radius: 4px;
            background: #f9fafb;
        }
        .domain-name {
            font-weight: bold;
            margin-bottom: 5px;
            color: #374151;
        }
        .domain-score {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .score-bar-bg {
            flex: 1;
            height: 20px;
            background: #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
        }
        .score-bar-fill {
            height: 100%;
            border-radius: 10px;
            transition: width 0.3s ease;
        }
        .score-low { background: #ef4444; }
        .score-moderate { background: #f59e0b; }
        .score-high { background: #10b981; }
        .score-text {
            min-width: 60px;
            font-weight: bold;
            text-align: right;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 12px;
            color: #666;
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
        <h1>${testType} 검사 결과 리포트</h1>
        <p>생성일: ${currentDate}</p>
    </div>

    ${testInfo ? `
    <div class="test-info no-break">
        <h3>검사 정보</h3>
        <div class="info-grid">
            ${testInfo.title ? `
            <div class="info-item">
                <div class="info-label">검사명</div>
                <div class="info-value">${testInfo.title}</div>
            </div>
            ` : ''}
            ${testInfo.description ? `
            <div class="info-item">
                <div class="info-label">검사 설명</div>
                <div class="info-value">${testInfo.description}</div>
            </div>
            ` : ''}
            ${testInfo.duration ? `
            <div class="info-item">
                <div class="info-label">소요 시간</div>
                <div class="info-value">${testInfo.duration}</div>
            </div>
            ` : ''}
            ${testInfo.ageGroup ? `
            <div class="info-item">
                <div class="info-label">대상 연령</div>
                <div class="info-value">${testInfo.ageGroup}</div>
            </div>
            ` : ''}
        </div>
    </div>
    ` : ''}

    <div class="section no-break">
        <h2>검사 결과 요약</h2>
        <div class="result-summary">
            ${Object.entries(results).map(([key, value]) => `
                <div class="result-item">
                    <span class="result-label">${key}:</span>
                    <span class="result-value">${typeof value === 'number' ? value.toFixed(1) : value}</span>
                </div>
            `).join('')}
        </div>
        
        <div class="score-visualization">
            <h3>점수 시각화</h3>
            ${Object.entries(results).map(([key, value]) => {
                const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
                const percentage = Math.min((numValue / 100) * 100, 100);
                return `
                <div class="score-bar">
                    <div class="score-name">${key}</div>
                    <div class="bar-container">
                        <div class="bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="score-number">${numValue.toFixed(1)}</div>
                </div>
                `;
            }).join('')}
        </div>
    </div>

    <div class="section page-break">
        <h2>전문가 분석</h2>
        <div class="analysis-content">
            ${analysis || '분석 내용이 없습니다.'}
        </div>
    </div>

    ${analysis && analysis.includes('권고') || analysis.includes('추천') ? `
    <div class="recommendations no-break">
        <h3>권고사항 및 다음 단계</h3>
        <ul class="recommendation-list">
            <li>정기적인 추적 관찰을 통해 변화 양상을 모니터링하세요</li>
            <li>전문가와의 상담을 통해 개인별 맞춤 계획을 수립하세요</li>
            <li>가족이나 주변 지지체계와 결과를 공유하여 도움을 받으세요</li>
            <li>필요시 추가적인 전문 검사나 평가를 고려해보세요</li>
        </ul>
    </div>
    ` : ''}

    <div class="footer">
        <p><strong>중요 안내사항</strong></p>
        <p>본 리포트는 참고용이며 의학적 진단이 아닙니다.</p>
        <p>정확한 진단과 치료를 위해서는 전문의와 상담하시기 바랍니다.</p>
        <p style="margin-top: 15px;">© 2024 AIHPRO.COM. All rights reserved.</p>
        <p style="margin-top: 10px; font-size: 10px;">
            이 문서는 ${new Date().toLocaleString('ko-KR')}에 생성되었습니다.
        </p>
    </div>
</body>
</html>
  `.trim();
}

function generateChartsHTML(chartData: any, results: any) {
  const domains = chartData.domains || [];
  const radarData = chartData.radar || [];
  
  return `
    <div class="charts-section">
      ${domains.length > 0 ? `
        <h3>영역별 분석</h3>
        <div class="domain-bars">
          ${domains.map((domain: any) => {
            const score = domain.score || 0;
            const percentage = Math.min((score / 100) * 100, 100);
            const riskLevel = score >= 70 ? 'high' : score >= 40 ? 'moderate' : 'low';
            
            return `
              <div class="domain-bar">
                <div class="domain-name">${domain.name}</div>
                <div class="domain-score">
                  <div class="score-bar-bg">
                    <div class="score-bar-fill score-${riskLevel}" style="width: ${percentage}%"></div>
                  </div>
                  <div class="score-text">${score.toFixed(1)}점</div>
                </div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">
                  ${domain.description || ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}
      
      ${radarData.length > 0 ? `
        <h3 style="margin-top: 30px;">종합 프로필</h3>
        <div class="radar-chart">
          ${generateRadarChartSVG(radarData)}
        </div>
      ` : ''}
      
      <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; font-size: 12px; color: #92400e;">
          <strong>해석 안내:</strong> 낮은 점수는 해당 영역에서 어려움이 적음을, 높은 점수는 더 많은 관심과 지원이 필요함을 의미합니다.
        </p>
      </div>
    </div>
  `;
}

function generateRadarChartSVG(radarData: any[]) {
  const size = 300;
  const center = size / 2;
  const radius = 100;
  const maxScore = 100;
  
  // 각도 계산 (상단부터 시계방향)
  const angleStep = (2 * Math.PI) / radarData.length;
  
  // 배경 격자 생성
  const gridLines = [20, 40, 60, 80, 100].map(value => {
    const r = (value / maxScore) * radius;
    const points = radarData.map((_, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;
      return `${x},${y}`;
    }).join(' ');
    
    return `<polygon points="${points}" fill="none" stroke="#e5e7eb" stroke-width="1"/>`;
  }).join('');
  
  // 축 라인 생성
  const axisLines = radarData.map((_, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;
    return `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="#d1d5db" stroke-width="1"/>`;
  }).join('');
  
  // 데이터 폴리곤 생성
  const dataPoints = radarData.map((item, index) => {
    const score = Math.min(item.score || 0, maxScore);
    const angle = index * angleStep - Math.PI / 2;
    const r = (score / maxScore) * radius;
    const x = center + Math.cos(angle) * r;
    const y = center + Math.sin(angle) * r;
    return `${x},${y}`;
  }).join(' ');
  
  // 라벨 생성
  const labels = radarData.map((item, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const labelRadius = radius + 20;
    const x = center + Math.cos(angle) * labelRadius;
    const y = center + Math.sin(angle) * labelRadius;
    
    return `
      <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" 
            font-size="10" font-weight="bold" fill="#374151">
        ${item.name}
      </text>
      <text x="${x}" y="${y + 12}" text-anchor="middle" dominant-baseline="middle" 
            font-size="8" fill="#6b7280">
        ${(item.score || 0).toFixed(1)}
      </text>
    `;
  }).join('');
  
  return `
    <svg class="chart-svg" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- 배경 격자 -->
      ${gridLines}
      
      <!-- 축 라인 -->
      ${axisLines}
      
      <!-- 데이터 영역 -->
      <polygon points="${dataPoints}" fill="rgba(59, 130, 246, 0.3)" stroke="#3b82f6" stroke-width="2"/>
      
      <!-- 데이터 포인트 -->
      ${radarData.map((item, index) => {
        const score = Math.min(item.score || 0, maxScore);
        const angle = index * angleStep - Math.PI / 2;
        const r = (score / maxScore) * radius;
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        return `<circle cx="${x}" cy="${y}" r="4" fill="#3b82f6" stroke="white" stroke-width="2"/>`;
      }).join('')}
      
      <!-- 라벨 -->
      ${labels}
      
      <!-- 중심점 -->
      <circle cx="${center}" cy="${center}" r="2" fill="#374151"/>
    </svg>
  `;
}