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

    const { testType, results, analysis, testInfo } = await req.json();

    console.log('Generating PDF for test result:', { testType, userId: user.id });

    // PDF 생성 로직 (현재는 모의 구현)
    const pdfData = generatePDFContent(testType, results, analysis, testInfo);
    
    // 실제 PDF 생성은 추후 구현 (현재는 HTML 기반 레포트)
    const reportHtml = generateHTMLReport(testType, results, analysis, testInfo);

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

function generatePDFContent(testType: string, results: any, analysis: string, testInfo: any) {
  return {
    testType,
    results,
    analysis,
    testInfo,
    generatedAt: new Date().toISOString(),
    version: '1.0'
  };
}

function generateHTMLReport(testType: string, results: any, analysis: string, testInfo: any) {
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