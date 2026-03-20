import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

// 바우처별 서식 템플릿
const voucherTemplates: Record<string, {
  sections: string[];
  format: string;
  requiredFields: string[];
  officialName: string;
}> = {
  "언어발달지원": {
    sections: [
      "기본정보 (이름, 날짜, 시간)",
      "목표설정 및 활동계획",
      "실시한 활동 내용",
      "아동의 반응 및 참여도",
      "언어발달 성과",
      "가정연계 활동 제안",
      "다음 회기 계획"
    ],
    format: "정부바우처 표준양식",
    requiredFields: ["출석확인", "활동시간", "진도체크", "평가의견"],
    officialName: "언어발달지원 서비스 제공기록지"
  },
  
  "발달재활서비스": {
    sections: [
      "서비스 제공 일시 및 장소",
      "개별화계획 목표",
      "제공한 서비스 내용",
      "이용자 반응 및 변화",
      "목표달성도 평가",
      "보호자 상담 내용",
      "향후 계획 및 과제"
    ],
    format: "보건복지부 양식",
    requiredFields: ["서비스시간", "목표달성도", "가족상담", "특이사항"],
    officialName: "발달재활서비스 제공기록지"
  },

  "교육청서비스": {
    sections: [
      "학습자 기본정보",
      "개별화교육계획(IEP) 목표",
      "교육활동 실시 내용", 
      "학습자 참여도 및 성취도",
      "행동특성 관찰 기록",
      "교육환경 및 지원사항",
      "학부모 연계 및 피드백",
      "차시 교육계획"
    ],
    format: "교육청 개별화교육 양식",
    requiredFields: ["수업시수", "IEP목표", "성취수준", "행동관찰", "연계활동"],
    officialName: "개별화교육 실시 보고서"
  },

  "지역사회서비스": {
    sections: [
      "서비스 이용자 정보",
      "서비스 제공 계획",
      "실시한 프로그램 내용",
      "이용자 만족도 및 반응",
      "사회적응능력 변화",
      "지역사회 연계 활동",
      "서비스 효과성 평가",
      "개선방안 및 제언"
    ],
    format: "지역사회서비스투자사업 양식",
    requiredFields: ["서비스시간", "만족도조사", "사회적응도", "연계기관"],
    officialName: "지역사회서비스 제공기록지"
  },

  "주간활동서비스": {
    sections: [
      "이용자 기본정보 및 출석",
      "일일 활동 계획 및 목표",
      "오전 활동 프로그램",
      "점심시간 및 휴식",
      "오후 활동 프로그램", 
      "개별 지원 및 상담",
      "건강상태 및 안전관리",
      "일일 평가 및 소감",
      "보호자 전달사항"
    ],
    format: "장애인활동지원 표준양식",
    requiredFields: ["출석체크", "활동참여도", "건강상태", "안전점검", "보호자소통"],
    officialName: "주간활동서비스 일일보고서"
  },

  "키즈노트일지": {
    sections: [
      "오늘의 활동 주제",
      "자유선택활동 기록",
      "대소집단 활동 참여",
      "급식 및 간식 시간",
      "낮잠 및 휴식시간",
      "놀이활동 관찰 기록",
      "또래관계 및 사회성",
      "특별활동 및 행사",
      "안전 및 건강상태",
      "가정통신 사항"
    ],
    format: "키즈노트 앱 연동형식",
    requiredFields: ["사진첨부", "활동시간", "건강체크", "알림장", "준비물"],
    officialName: "어린이집 일일보육일지"
  }
};

interface VoucherReportRequest {
  voucherType: string;
  sessionData?: any[];
  periodStart?: string;
  periodEnd?: string;
  clientInfo?: {
    name: string;
    age?: number;
    diagnosis?: string;
    goals?: string[];
  };
  customNotes?: string;
  enhancedPrompt?: boolean;
}

// 전문적인 바우처 일지 HTML 생성
function generateVoucherHTML(content: string, request: VoucherReportRequest): string {
  const template = voucherTemplates[request.voucherType];
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${template?.officialName || '서비스 제공기록지'}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Noto Sans KR', sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #fff;
      font-size: 12px;
    }
    
    .document {
      max-width: 210mm;
      margin: 0 auto;
      padding: 15mm;
      background: white;
    }
    
    /* 공식 문서 헤더 */
    .doc-header {
      text-align: center;
      border-bottom: 3px double #1a1a1a;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    
    .doc-title {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 4px;
      margin-bottom: 8px;
    }
    
    .doc-subtitle {
      font-size: 14px;
      color: #4b5563;
    }
    
    /* 기본정보 테이블 */
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      border: 2px solid #1a1a1a;
    }
    
    .info-table th,
    .info-table td {
      border: 1px solid #4b5563;
      padding: 10px 12px;
      text-align: left;
    }
    
    .info-table th {
      background: #f3f4f6;
      font-weight: 600;
      width: 120px;
      font-size: 11px;
    }
    
    .info-table td {
      font-size: 12px;
    }
    
    /* 섹션 */
    .section {
      margin-bottom: 20px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .section-header {
      background: linear-gradient(to right, #1e40af, #3b82f6);
      color: white;
      padding: 10px 16px;
      font-weight: 600;
      font-size: 13px;
    }
    
    .section-content {
      padding: 16px;
      background: #fafafa;
      min-height: 80px;
    }
    
    .section-content p {
      margin-bottom: 10px;
      line-height: 1.8;
    }
    
    .section-content ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    
    .section-content li {
      margin-bottom: 6px;
    }
    
    /* 평가 체크박스 */
    .evaluation-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      margin: 15px 0;
    }
    
    .eval-item {
      text-align: center;
      padding: 8px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 11px;
    }
    
    .eval-item.selected {
      background: #dbeafe;
      border-color: #3b82f6;
    }
    
    /* 서명란 */
    .signature-section {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #1a1a1a;
    }
    
    .signature-box {
      width: 30%;
      text-align: center;
    }
    
    .signature-line {
      border-bottom: 1px solid #1a1a1a;
      height: 50px;
      margin-bottom: 8px;
    }
    
    .signature-label {
      font-size: 11px;
      color: #4b5563;
    }
    
    /* 결재란 */
    .approval-box {
      position: absolute;
      top: 15mm;
      right: 15mm;
      border: 2px solid #1a1a1a;
    }
    
    .approval-row {
      display: flex;
    }
    
    .approval-cell {
      width: 60px;
      height: 35px;
      border: 1px solid #1a1a1a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
    }
    
    .approval-cell.header {
      background: #f3f4f6;
      font-weight: 600;
      height: 25px;
    }
    
    /* 푸터 */
    .doc-footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #d1d5db;
      text-align: center;
      font-size: 10px;
      color: #6b7280;
    }
    
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      
      .document {
        padding: 10mm;
      }
      
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="document">
    <!-- 결재란 -->
    <div class="approval-box">
      <div class="approval-row">
        <div class="approval-cell header">담당</div>
        <div class="approval-cell header">팀장</div>
        <div class="approval-cell header">센터장</div>
      </div>
      <div class="approval-row">
        <div class="approval-cell"></div>
        <div class="approval-cell"></div>
        <div class="approval-cell"></div>
      </div>
    </div>
    
    <!-- 헤더 -->
    <div class="doc-header">
      <h1 class="doc-title">${template?.officialName || '서비스 제공기록지'}</h1>
      <div class="doc-subtitle">${template?.format || '표준 양식'}</div>
    </div>
    
    <!-- 기본정보 -->
    <table class="info-table">
      <tr>
        <th>이용자명</th>
        <td>${request.clientInfo?.name || '_______________'}</td>
        <th>연령</th>
        <td>${request.clientInfo?.age ? request.clientInfo.age + '세' : '______세'}</td>
        <th>작성일</th>
        <td>${today}</td>
      </tr>
      <tr>
        <th>서비스 유형</th>
        <td>${request.voucherType}</td>
        <th>서비스 기간</th>
        <td colspan="3">${request.periodStart || '____.__.__'} ~ ${request.periodEnd || '____.__.__'}</td>
      </tr>
      ${request.clientInfo?.diagnosis ? `
      <tr>
        <th>진단명/소견</th>
        <td colspan="5">${request.clientInfo.diagnosis}</td>
      </tr>
      ` : ''}
      ${request.clientInfo?.goals?.length ? `
      <tr>
        <th>서비스 목표</th>
        <td colspan="5">${request.clientInfo.goals.join(' / ')}</td>
      </tr>
      ` : ''}
    </table>
    
    <!-- AI 생성 콘텐츠 -->
    ${content}
    
    <!-- 종합평가 -->
    <div class="section">
      <div class="section-header">📊 종합 평가</div>
      <div class="section-content">
        <div class="evaluation-grid">
          <div class="eval-item">매우 우수</div>
          <div class="eval-item">우수</div>
          <div class="eval-item selected">양호</div>
          <div class="eval-item">보통</div>
          <div class="eval-item">미흡</div>
        </div>
      </div>
    </div>
    
    <!-- 서명란 -->
    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">담당 치료사 (인)</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">보호자 확인 (인)</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">센터장 확인 (인)</div>
      </div>
    </div>
    
    <!-- 푸터 -->
    <div class="doc-footer">
      본 기록지는 ${request.voucherType} 서비스 제공 기록을 위해 작성되었습니다.
    </div>
  </div>
</body>
</html>
  `.trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: VoucherReportRequest = await req.json();
    
    console.log('바우처 보고서 생성 요청:', {
      voucherType: request.voucherType,
      clientName: request.clientInfo?.name,
      enhanced: request.enhancedPrompt
    });

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const template = voucherTemplates[request.voucherType];
    if (!template) {
      throw new Error(`지원되지 않는 바우처 유형: ${request.voucherType}`);
    }

    // 프롬프트 생성
    const systemPrompt = `당신은 ${request.voucherType} 바우처 서비스 전문 치료사입니다.
${template.format}에 맞는 공식 치료일지를 작성합니다.

반드시 다음 섹션을 포함하세요:
${template.sections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

필수 포함 항목: ${template.requiredFields.join(', ')}

각 섹션은 HTML <div class="section"> 형식으로 작성하세요:
<div class="section">
  <div class="section-header">섹션 제목</div>
  <div class="section-content">내용</div>
</div>

전문적이고 공식적인 문서 어조를 유지하세요.
구체적인 활동 내용과 관찰 결과를 상세히 기술하세요.`;

    const userPrompt = `다음 정보를 바탕으로 ${request.voucherType} 치료일지를 작성해주세요:

이용자 정보:
- 이름: ${request.clientInfo?.name || '미제공'}
- 연령: ${request.clientInfo?.age ? request.clientInfo.age + '세' : '미제공'}
- 진단명: ${request.clientInfo?.diagnosis || '미제공'}
- 서비스 목표: ${request.clientInfo?.goals?.join(', ') || '미제공'}

서비스 기간: ${request.periodStart || '미제공'} ~ ${request.periodEnd || '미제공'}

세션 데이터: ${request.sessionData?.length || 0}건

${request.customNotes ? `추가 메모: ${request.customNotes}` : ''}

${request.enhancedPrompt ? '상세하고 구체적인 내용으로 작성해주세요.' : ''}`;

    // AI 호출
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
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

    if (!content || content.trim().length === 0) {
      throw new Error('AI가 빈 응답을 반환했습니다.');
    }

    // HTML 형식으로 변환
    const fullHtml = generateVoucherHTML(content, request);

    return new Response(
      JSON.stringify({
        success: true,
        content: content,
        html: fullHtml,
        metadata: {
          voucherType: request.voucherType,
          format: template.format,
          sections: template.sections,
          requiredFields: template.requiredFields,
          generatedAt: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('바우처 보고서 생성 오류:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '보고서 생성 중 오류가 발생했습니다.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
