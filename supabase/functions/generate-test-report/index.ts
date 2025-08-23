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
        body {
            font-family: 'Malgun Gothic', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
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
        }
        .header p {
            margin: 10px 0 0 0;
            color: #666;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #1e40af;
            border-left: 4px solid #3b82f6;
            padding-left: 10px;
            margin-bottom: 15px;
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
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .result-item:last-child {
            border-bottom: none;
        }
        .analysis-content {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            white-space: pre-line;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        @media print {
            body { font-size: 12px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${testType} 검사 결과 리포트</h1>
        <p>생성일: ${currentDate}</p>
    </div>

    <div class="section">
        <h2>검사 결과 요약</h2>
        <div class="result-summary">
            ${Object.entries(results).map(([key, value]) => `
                <div class="result-item">
                    <span><strong>${key}:</strong></span>
                    <span>${typeof value === 'number' ? value.toFixed(1) : value}</span>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="section">
        <h2>전문가 분석</h2>
        <div class="analysis-content">
            ${analysis || '분석 내용이 없습니다.'}
        </div>
    </div>

    <div class="footer">
        <p>본 리포트는 참고용이며 의학적 진단이 아닙니다.</p>
        <p>정확한 진단과 치료를 위해서는 전문의와 상담하시기 바랍니다.</p>
        <p>© 2024 AI 심리검사 플랫폼. All rights reserved.</p>
    </div>
</body>
</html>
  `.trim();
}