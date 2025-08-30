import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionData, reportType = 'comprehensive' } = await req.json();

    console.log('Generating PDF report for session:', sessionData.id);

    // Generate HTML content for the report
    const htmlContent = generateReportHTML(sessionData, reportType);

    const reportData = {
      success: true,
      reportData: {
        id: crypto.randomUUID(),
        sessionId: sessionData.id,
        reportType,
        title: `${getDomainDisplayName(sessionData.domain)} 관찰기록서`,
        html: htmlContent,
        summary: generateExecutiveSummary(sessionData),
        charts: generateChartData(sessionData),
        recommendations: sessionData.recommendations || []
      },
      generatedAt: new Date().toISOString()
    };

    console.log('Report generated successfully');

    return new Response(JSON.stringify(reportData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateReportHTML(sessionData: any, reportType: string): string {
  const domainName = getDomainDisplayName(sessionData.domain);
  const currentDate = new Date().toLocaleDateString('ko-KR');
  
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${domainName} 관찰기록서</title>
    <style>
        @page {
            margin: 2cm;
            size: A4;
        }
        
        body {
            font-family: 'Malgun Gothic', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #1e40af;
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .header .subtitle {
            color: #6b7280;
            font-size: 16px;
        }
        
        .info-section {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #3b82f6;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .info-item {
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
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
            margin-bottom: 40px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #1e40af;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        
        .summary-box {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 30px;
            border: 1px solid #bfdbfe;
        }
        
        .chart-container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        
        .score-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .score-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
            border-top: 4px solid #3b82f6;
        }
        
        .score-value {
            font-size: 32px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
        }
        
        .score-label {
            color: #6b7280;
            font-size: 14px;
        }
        
        .recommendation-list {
            list-style: none;
            padding: 0;
        }
        
        .recommendation-item {
            background: #f9fafb;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 6px;
            border-left: 4px solid #10b981;
        }
        
        .recommendation-title {
            font-weight: bold;
            color: #059669;
            margin-bottom: 5px;
        }
        
        .disclaimer {
            background: #fef3c7;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #f59e0b;
            margin-top: 40px;
            font-size: 14px;
            color: #92400e;
        }
        
        .disclaimer strong {
            color: #78350f;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .analysis-text {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            white-space: pre-line;
            line-height: 1.8;
        }
        
        .risk-indicator {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .risk-low { background: #d1fae5; color: #065f46; }
        .risk-medium { background: #fef3c7; color: #92400e; }
        .risk-high { background: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
    <div style="text-align: center; margin-bottom: 30px; padding: 20px 0; border-bottom: 2px solid #e2e8f0;">
        <div style="font-size: 24px; font-weight: bold; color: #3b82f6; margin-bottom: 5px;">AIHPRO.COM</div>
        <div style="font-size: 12px; color: #666;">AIH 기반 아동발달 관찰 전문 플랫폼</div>
    </div>
    
    <!-- Header -->
    <div class="header">
        <h1>${domainName} 종합 관찰기록서</h1>
        <div class="subtitle">Professional Observation Report</div>
        <div style="margin-top: 15px; color: #6b7280;">생성일: ${currentDate}</div>
    </div>

    <!-- Basic Information -->
    <div class="info-section">
        <h3 style="margin-top: 0; color: #1e40af;">기본 정보</h3>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">관찰명</div>
                <div class="info-value">${sessionData.session_name || '종합 관찰'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">관찰 영역</div>
                <div class="info-value">${domainName}</div>
            </div>
            <div class="info-item">
                <div class="info-label">관찰자</div>
                <div class="info-value">${sessionData.observer_name || '익명'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">관찰 기간</div>
                <div class="info-value">${formatDateRange(sessionData.observation_period_start, sessionData.observation_period_end)}</div>
            </div>
            <div class="info-item">
                <div class="info-label">위험도</div>
                <div class="info-value">
                    <span class="risk-indicator risk-${sessionData.analysis_data?.riskLevel || 'medium'}">
                        ${getRiskLevelText(sessionData.analysis_data?.riskLevel || 'medium')}
                    </span>
                </div>
            </div>
            <div class="info-item">
                <div class="info-label">분석 일시</div>
                <div class="info-value">${new Date(sessionData.updated_at).toLocaleString('ko-KR')}</div>
            </div>
        </div>
    </div>

    <!-- Executive Summary -->
    <div class="section">
        <h2 class="section-title">📋 요약</h2>
        <div class="summary-box">
            ${generateExecutiveSummary(sessionData)}
        </div>
    </div>

    <!-- Scores Overview -->
    <div class="section">
        <h2 class="section-title">📊 영역별 점수</h2>
        <div class="score-grid">
            ${generateScoreCards(sessionData.analysis_data?.scores || {})}
        </div>
    </div>

    <!-- Detailed Analysis -->
    <div class="section page-break">
        <h2 class="section-title">🔍 상세 분석</h2>
        <div class="analysis-text">
            ${sessionData.ai_analysis || '분석 데이터가 없습니다.'}
        </div>
    </div>

    <!-- Recommendations -->
    <div class="section">
        <h2 class="section-title">💡 권고사항</h2>
        <ul class="recommendation-list">
            ${generateRecommendationsList(sessionData.recommendations || [])}
        </ul>
    </div>

    <!-- Raw Data (if comprehensive report) -->
    ${reportType === 'comprehensive' ? generateRawDataSection(sessionData.raw_data) : ''}

    <!-- Legal Disclaimer -->
    <div class="disclaimer">
        <strong>중요 고지사항:</strong><br>
        본 관찰기록서는 체계적 관찰에 기반한 참고자료이며, 의학적 진단이나 전문적 평가를 대체하지 않습니다. 
        전문적 판단이 필요한 경우 해당 분야 전문가와 상담하시기 바랍니다. 
        응급상황이나 즉시 지원이 필요한 경우에는 관련 기관(119, 1577-0199 등)에 즉시 연락하시기 바랍니다.
    </div>
    
    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #666; font-size: 12px;">
        © 2024 AIHPRO.COM. All rights reserved.
    </div>
</body>
</html>
  `;
}

function generateExecutiveSummary(sessionData: any): string {
  const scores = sessionData.analysis_data?.scores || {};
  const riskLevel = sessionData.analysis_data?.riskLevel || 'medium';
  
  const avgScores = Object.values(scores).map((s: any) => s.average).filter(Boolean);
  const overallAvg = avgScores.length > 0 ? 
    (avgScores.reduce((a: number, b: number) => a + b, 0) / avgScores.length).toFixed(1) : 'N/A';

  return `
<strong>전체적 수준:</strong> ${overallAvg}/5.0점 (${getRiskLevelText(riskLevel)})<br><br>

<strong>주요 소견:</strong><br>
• 총 ${Object.keys(scores).length}개 영역에서 체계적 관찰 실시<br>
• 위험도 수준: ${getRiskLevelText(riskLevel)}<br>
• 강점 영역: ${getTopCategories(scores, true).join(', ')}<br>
• 관심 영역: ${getTopCategories(scores, false).join(', ')}<br><br>

<strong>권고사항 요약:</strong><br>
${(sessionData.recommendations || []).slice(0, 3).map((r: any) => `• ${r.title}`).join('<br>')}
  `;
}

function generateScoreCards(scores: any): string {
  return Object.entries(scores).map(([category, data]: [string, any]) => `
    <div class="score-card">
        <div class="score-value">${data.average.toFixed(1)}</div>
        <div class="score-label">${category}</div>
    </div>
  `).join('');
}

function generateRecommendationsList(recommendations: any[]): string {
  return recommendations.map(rec => `
    <li class="recommendation-item">
        <div class="recommendation-title">${rec.title}</div>
        <div>${rec.description}</div>
        ${rec.actions ? `<ul style="margin-top: 10px;">${rec.actions.map((action: string) => `<li>${action}</li>`).join('')}</ul>` : ''}
    </li>
  `).join('');
}

function generateRawDataSection(rawData: any): string {
  return `
    <div class="section page-break">
        <h2 class="section-title">📋 원본 관찰 데이터</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; font-family: monospace; font-size: 12px; overflow-x: auto;">
            <pre>${JSON.stringify(rawData, null, 2)}</pre>
        </div>
    </div>
  `;
}

function generateChartData(sessionData: any): any {
  const scores = sessionData.analysis_data?.scores || {};
  
  return {
    radar: {
      labels: Object.keys(scores),
      datasets: [{
        label: '관찰 점수',
        data: Object.values(scores).map((s: any) => s.average),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2
      }]
    },
    bar: {
      labels: Object.keys(scores),
      datasets: [{
        label: '영역별 점수',
        data: Object.values(scores).map((s: any) => s.average),
        backgroundColor: Object.keys(scores).map((_, i) => 
          `hsl(${220 + i * 30}, 70%, 60%)`
        )
      }]
    }
  };
}

function getDomainDisplayName(domain: string): string {
  const names = {
    child_development: '아동발달',
    psychology: '심리상담',
    elderly_care: '노인케어',
    workplace: '직장적응',
    learning: '학습능력',
    family: '가족상담',
    medical: '의료재활'
  };
  return names[domain as keyof typeof names] || '종합관찰';
}

function getRiskLevelText(level: string): string {
  const texts = {
    low: '양호',
    medium: '보통',
    high: '주의'
  };
  return texts[level as keyof typeof texts] || '보통';
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start).toLocaleDateString('ko-KR');
  const endDate = new Date(end).toLocaleDateString('ko-KR');
  return `${startDate} ~ ${endDate}`;
}

function getTopCategories(scores: any, isStrength: boolean): string[] {
  const sorted = Object.entries(scores)
    .sort(([,a]: [string, any], [,b]: [string, any]) => 
      isStrength ? b.average - a.average : a.average - b.average
    )
    .slice(0, 2)
    .map(([category]) => category);
  
  return sorted.length > 0 ? sorted : ['해당없음'];
}