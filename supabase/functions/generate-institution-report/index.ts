import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

interface MemberData {
  id: string;
  member_name: string;
  birth_date?: string;
  tests_count: number;
  observations_count: number;
  latest_test_date?: string;
  risk_level?: string;
  progress_rate?: number;
}

interface InstitutionReportRequest {
  reportType: 'member' | 'period' | 'dashboard' | 'voucher';
  institutionId: string;
  institutionName: string;
  memberId?: string;
  memberData?: MemberData;
  periodStart?: string;
  periodEnd?: string;
  allMembersData?: MemberData[];
  voucherType?: string;
  includeCharts?: boolean;
  customNotes?: string;
}

// HTML 리포트 템플릿 생성
function generateProfessionalHTML(reportContent: any, request: InstitutionReportRequest): string {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const reportTitle = getReportTitle(request.reportType);
  
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Noto Sans KR', sans-serif;
      line-height: 1.8;
      color: #1a1a1a;
      background: #fff;
    }
    
    .report-container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 20mm;
      background: white;
    }
    
    /* 헤더 */
    .report-header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .header-left {
      flex: 1;
    }
    
    .institution-name {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    .report-title {
      font-size: 28px;
      font-weight: 700;
      color: #1e3a5f;
      margin-bottom: 8px;
    }
    
    .report-subtitle {
      font-size: 14px;
      color: #6b7280;
    }
    
    .header-right {
      text-align: right;
    }
    
    .report-date {
      font-size: 13px;
      color: #6b7280;
    }
    
    .report-id {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 4px;
    }
    
    /* 기본정보 박스 */
    .info-box {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 1px solid #bae6fd;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 30px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    
    .info-item {
      text-align: center;
    }
    
    .info-label {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 6px;
      font-weight: 500;
    }
    
    .info-value {
      font-size: 18px;
      font-weight: 700;
      color: #0369a1;
    }
    
    /* 섹션 */
    .section {
      margin-bottom: 32px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #1e3a5f;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .section-icon {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
    }
    
    .section-content {
      font-size: 14px;
      color: #374151;
      line-height: 1.9;
    }
    
    .section-content p {
      margin-bottom: 12px;
    }
    
    .section-content ul {
      margin: 12px 0;
      padding-left: 24px;
    }
    
    .section-content li {
      margin-bottom: 8px;
    }
    
    /* 요약 카드 */
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 30px;
    }
    
    .summary-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
    }
    
    .summary-card-title {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    .summary-card-value {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }
    
    .summary-card-change {
      font-size: 12px;
      margin-top: 6px;
    }
    
    .positive { color: #059669; }
    .negative { color: #dc2626; }
    .neutral { color: #6b7280; }
    
    /* 테이블 */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 13px;
    }
    
    .data-table th {
      background: #f1f5f9;
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .data-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #e2e8f0;
      color: #374151;
    }
    
    .data-table tr:hover td {
      background: #f8fafc;
    }
    
    /* 강조 박스 */
    .highlight-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-left: 4px solid #f59e0b;
      padding: 16px 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    
    .highlight-box-title {
      font-weight: 700;
      color: #92400e;
      margin-bottom: 8px;
    }
    
    .highlight-box-content {
      font-size: 14px;
      color: #78350f;
    }
    
    /* 권고사항 */
    .recommendations {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    
    .recommendations-title {
      font-size: 16px;
      font-weight: 700;
      color: #166534;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .recommendation-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .recommendation-number {
      width: 24px;
      height: 24px;
      background: #22c55e;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }
    
    .recommendation-text {
      font-size: 14px;
      color: #166534;
      line-height: 1.6;
    }
    
    /* 푸터 */
    .report-footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
    }
    
    .footer-text {
      font-size: 11px;
      color: #9ca3af;
      margin-bottom: 8px;
    }
    
    .footer-disclaimer {
      font-size: 10px;
      color: #d1d5db;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }
    
    /* 서명란 */
    .signature-section {
      display: flex;
      justify-content: space-between;
      margin-top: 50px;
      padding-top: 30px;
    }
    
    .signature-box {
      width: 45%;
      text-align: center;
    }
    
    .signature-line {
      border-bottom: 1px solid #374151;
      margin-bottom: 8px;
      height: 40px;
    }
    
    .signature-label {
      font-size: 12px;
      color: #6b7280;
    }
    
    /* 인쇄 최적화 */
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      
      .report-container {
        padding: 15mm;
      }
      
      .section {
        page-break-inside: avoid;
      }
      
      .page-break {
        page-break-before: always;
      }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <!-- 헤더 -->
    <div class="report-header">
      <div class="header-left">
        <div class="institution-name">${request.institutionName}</div>
        <h1 class="report-title">${reportTitle}</h1>
        <div class="report-subtitle">${getReportSubtitle(request)}</div>
      </div>
      <div class="header-right">
        <div class="report-date">작성일: ${today}</div>
        <div class="report-id">문서번호: ${generateReportId()}</div>
      </div>
    </div>
    
    ${reportContent.html}
    
    <!-- 푸터 -->
    <div class="report-footer">
      <div class="footer-text">
        본 리포트는 AI 기반 분석 시스템에 의해 생성되었습니다.
      </div>
      <div class="footer-disclaimer">
        이 문서의 내용은 참고 목적으로만 사용되어야 하며, 전문가의 직접 평가를 대체할 수 없습니다.
        © ${new Date().getFullYear()} ${request.institutionName}. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function getReportTitle(reportType: string): string {
  const titles: Record<string, string> = {
    'member': '개별 아동 종합 발달 리포트',
    'period': '기간별 운영 현황 보고서',
    'dashboard': '기관 종합 대시보드 리포트',
    'voucher': '바우처 서비스 제공 일지'
  };
  return titles[reportType] || '종합 분석 리포트';
}

function getReportSubtitle(request: InstitutionReportRequest): string {
  if (request.reportType === 'member' && request.memberData) {
    return `대상: ${request.memberData.member_name}`;
  }
  if (request.periodStart && request.periodEnd) {
    return `기간: ${request.periodStart} ~ ${request.periodEnd}`;
  }
  return '';
}

function generateReportId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RPT-${year}${month}${day}-${random}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: InstitutionReportRequest = await req.json();
    
    console.log('기관 리포트 생성 요청:', {
      reportType: request.reportType,
      institutionId: request.institutionId,
      memberId: request.memberId
    });

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // 리포트 타입별 프롬프트 생성
    const { systemPrompt, userPrompt } = generatePrompts(request);

    // AI 호출
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 6000,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API 오류:', errorText);
      throw new Error(`AI API 오류: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';

    // HTML 형식으로 변환
    const reportHtml = processAIContent(content);
    
    // 전문적인 PDF HTML 생성
    const fullHtml = generateProfessionalHTML({ html: reportHtml }, request);

    return new Response(
      JSON.stringify({
        success: true,
        report: {
          html: fullHtml,
          content: content,
          metadata: {
            reportType: request.reportType,
            generatedAt: new Date().toISOString(),
            institutionId: request.institutionId
          }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('리포트 생성 오류:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '리포트 생성 중 오류가 발생했습니다.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generatePrompts(request: InstitutionReportRequest): { systemPrompt: string; userPrompt: string } {
  let systemPrompt = '';
  let userPrompt = '';

  switch (request.reportType) {
    case 'member':
      systemPrompt = `당신은 아동 발달 전문가이며 기관용 공식 리포트를 작성하는 전문가입니다.
개별 아동의 발달 상태, 검사 결과, 관찰 기록을 종합 분석하여 전문적인 보고서를 작성합니다.

반드시 다음 섹션을 포함하세요:
1. 기본정보 요약 (이름, 나이, 등록일 등)
2. 발달 현황 종합 평가
3. 영역별 세부 분석 (인지, 언어, 사회성, 운동)
4. 강점 및 발전 가능성
5. 주의 관찰 영역
6. 맞춤 지원 전략 제안
7. 가정 연계 활동 권고
8. 다음 평가 일정 및 목표

HTML 태그를 사용하여 구조화된 형식으로 응답하세요.`;

      userPrompt = `다음 아동의 종합 발달 리포트를 작성해주세요:

아동 정보:
- 이름: ${request.memberData?.member_name || '미제공'}
- 생년월일: ${request.memberData?.birth_date || '미제공'}
- 총 검사 횟수: ${request.memberData?.tests_count || 0}회
- 관찰 기록 수: ${request.memberData?.observations_count || 0}건
- 최근 검사일: ${request.memberData?.latest_test_date || '없음'}
- 위험도 평가: ${request.memberData?.risk_level || '미평가'}
- 진전율: ${request.memberData?.progress_rate || 0}%

${request.customNotes ? `추가 메모: ${request.customNotes}` : ''}

전문적이고 공식적인 어조로 작성하되, 보호자가 이해하기 쉽게 작성해주세요.`;
      break;

    case 'dashboard':
      systemPrompt = `당신은 기관 운영 분석 전문가입니다.
기관의 전체 운영 현황, 회원 통계, 서비스 품질을 분석하여 대시보드 리포트를 작성합니다.

반드시 다음 섹션을 포함하세요:
1. 기관 현황 요약 (총 회원 수, 활성 회원, 서비스 현황)
2. 핵심 성과 지표 (KPI)
3. 회원 분포 분석
4. 서비스 이용 통계
5. 위험군 관리 현황
6. 월별/분기별 추이 분석
7. 개선 권고사항
8. 다음 분기 목표 제안

HTML 태그를 사용하여 구조화된 형식으로 응답하세요.`;

      const totalMembers = request.allMembersData?.length || 0;
      const activeMembers = request.allMembersData?.filter(m => (m.tests_count || 0) > 0).length || 0;
      const avgTests = totalMembers > 0 
        ? (request.allMembersData?.reduce((sum, m) => sum + (m.tests_count || 0), 0) || 0) / totalMembers 
        : 0;

      userPrompt = `다음 기관의 종합 대시보드 리포트를 작성해주세요:

기관명: ${request.institutionName}
분석 기간: ${request.periodStart || '전체'} ~ ${request.periodEnd || '현재'}

현황 데이터:
- 총 등록 회원: ${totalMembers}명
- 활성 회원 (검사 1회 이상): ${activeMembers}명
- 평균 검사 횟수: ${avgTests.toFixed(1)}회
- 총 검사 횟수: ${request.allMembersData?.reduce((sum, m) => sum + (m.tests_count || 0), 0) || 0}회
- 총 관찰 기록: ${request.allMembersData?.reduce((sum, m) => sum + (m.observations_count || 0), 0) || 0}건

${request.customNotes ? `추가 사항: ${request.customNotes}` : ''}

공식 보고서 형식으로 작성해주세요.`;
      break;

    case 'period':
      systemPrompt = `당신은 기관 운영 보고서 작성 전문가입니다.
특정 기간 동안의 기관 운영 현황을 분석하여 기간별 보고서를 작성합니다.

반드시 다음 섹션을 포함하세요:
1. 기간 개요
2. 서비스 제공 현황
3. 신규 등록 및 이탈 현황
4. 주요 성과
5. 이슈 및 대응
6. 다음 기간 계획

HTML 태그를 사용하여 구조화된 형식으로 응답하세요.`;

      userPrompt = `다음 기간의 운영 현황 보고서를 작성해주세요:

기관명: ${request.institutionName}
분석 기간: ${request.periodStart} ~ ${request.periodEnd}

기간 내 데이터:
- 총 회원 수: ${request.allMembersData?.length || 0}명
- 서비스 제공 건수: ${request.allMembersData?.reduce((sum, m) => sum + (m.tests_count || 0) + (m.observations_count || 0), 0) || 0}건

${request.customNotes ? `추가 사항: ${request.customNotes}` : ''}`;
      break;

    default:
      systemPrompt = '기관용 전문 리포트를 작성합니다.';
      userPrompt = `기관명: ${request.institutionName}\n${request.customNotes || '리포트 생성 요청'}`;
  }

  return { systemPrompt, userPrompt };
}

function processAIContent(content: string): string {
  // AI 응답을 HTML 섹션으로 변환
  let html = content;
  
  // 마크다운 헤더를 HTML로 변환
  html = html.replace(/^### (.+)$/gm, '<h4 class="section-subtitle">$1</h4>');
  html = html.replace(/^## (.+)$/gm, '</div><div class="section"><h3 class="section-title"><span class="section-icon">📋</span>$1</h3><div class="section-content">');
  html = html.replace(/^# (.+)$/gm, '<h2 class="main-title">$1</h2>');
  
  // 볼드 텍스트
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // 리스트
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  
  // 숫자 리스트
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  
  // 줄바꿈을 단락으로
  html = html.replace(/\n\n/g, '</p><p>');
  
  // 첫 섹션 시작
  if (!html.startsWith('<div class="section">')) {
    html = '<div class="section"><div class="section-content">' + html;
  }
  
  // 마지막 섹션 닫기
  html = html + '</div></div>';
  
  return html;
}
