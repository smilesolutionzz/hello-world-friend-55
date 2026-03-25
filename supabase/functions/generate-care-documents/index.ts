import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface DocumentRequest {
  documentType: 'case_management' | 'program_log' | 'session_note';
  facilityType: string; // 주간보호센터, 노인복지시설, 지역아동센터, 발달클리닉
  clientInfo: {
    name: string;
    age?: number;
    serviceType?: string;
    disabilities?: string[];
    careLevel?: string;
  };
  sessionData?: {
    date: string;
    duration: number;
    activities: string;
    observations: string;
    staffName: string;
  }[];
  periodStart: string;
  periodEnd: string;
  staffNotes?: string;
  reportStyle?: 'detailed' | 'concise';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: DocumentRequest = await req.json();
    const { documentType, facilityType, clientInfo, sessionData, periodStart, periodEnd, staffNotes, reportStyle = 'detailed' } = body;

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    // 문서 유형별 프롬프트
    const documentPrompts: Record<string, string> = {
      case_management: `사례관리 기록지 양식으로 작성하세요:

**1. 대상자 기본 정보**
- 이름, 연령, 돌봄등급, 주요 서비스

**2. 사례관리 목표**
- 장기 목표 (6개월~1년)
- 단기 목표 (이번 분기)

**3. 서비스 제공 내용**
- 기간별 제공 서비스 요약
- 프로그램 참여 현황
- 특이사항 및 긴급 대응

**4. 이용자 상태 변화**
- 신체적 상태 변화
- 인지/정서 상태 변화
- 사회적 상호작용 변화
- 일상생활 수행능력(ADL) 변화

**5. 보호자 상담 내용**
- 보호자 요구사항
- 가정 내 돌봄 상황

**6. 사례회의 결과**
- 다학제 팀 의견
- 서비스 조정 사항

**7. 향후 계획**
- 다음 분기 목표
- 연계 서비스 필요사항
- 재사정 일정`,

      program_log: `프로그램 운영일지 양식으로 작성하세요:

**1. 프로그램 기본 정보**
- 프로그램명, 일시, 장소
- 담당 직원, 참여 인원

**2. 프로그램 목표**
- 이번 회기 목표
- 전체 프로그램 내 위치 (회기 번호)

**3. 진행 내용**
- 도입 (10분): 인사, 준비운동, 동기유발
- 전개 (30~40분): 주요 활동 상세
- 마무리 (10분): 정리, 소감 나누기

**4. 참여자 반응**
- 전체 참여도 및 분위기
- 개별 참여자 특이사항
- 긍정적 반응 / 어려움

**5. 준비물 및 활용 자료**
- 사용 재료/도구
- 활동지/교구

**6. 평가**
- 목표 달성도
- 개선 사항
- 다음 회기 계획

**7. 사진 기록**
- (사진 첨부 위치 표시)`,

      session_note: `상담/치료 세션 기록지 양식으로 작성하세요:

**1. 세션 기본 정보**
- 일시, 회기, 담당자

**2. 이용자 상태**
- 입실 시 상태 (기분, 컨디션)
- 전반적 태도

**3. 세션 내용**
- 주요 활동
- 이용자 반응
- 관찰 사항

**4. 평가**
- 목표 달성도
- 변화 사항

**5. 다음 계획**
- 다음 세션 방향`,
    };

    // 시설 유형별 맥락
    const facilityContexts: Record<string, string> = {
      '주간보호센터': '주간보호센터의 어르신 대상 서비스입니다. 치매 예방, 인지활동, 신체활동, 일상생활 지원이 주요 서비스입니다. 장기요양보험 관련 행정 서류 양식에 맞춰야 합니다.',
      '노인복지시설': '노인복지시설(요양원, 양로원 등)의 입소 어르신 대상입니다. 24시간 돌봄, 건강관리, 재활, 여가활동이 주요 서비스입니다.',
      '지역아동센터': '지역아동센터의 아동·청소년 대상입니다. 학습지원, 정서지원, 문화활동, 생활지원이 주요 프로그램입니다. 사회보장정보원 보고 양식을 참고합니다.',
      '발달클리닉': '아동발달센터/클리닉의 발달지연 아동 대상입니다. 발달재활서비스 바우처 양식에 맞춰 작성합니다.',
    };

    const docPrompt = documentPrompts[documentType] || documentPrompts['session_note'];
    const facilityContext = facilityContexts[facilityType] || '복지시설의 이용자 대상 서비스입니다.';

    // 세션 데이터 요약
    const sessionSummary = sessionData?.map(s => `
날짜: ${s.date}
시간: ${s.duration}분
활동: ${s.activities}
관찰: ${s.observations}
담당: ${s.staffName}
---`).join('\n') || '세션 데이터 없음';

    const systemPrompt = `당신은 20년 경력의 사회복지사이자 서류 작성 전문가입니다.
${facilityContext}

${docPrompt}

작성 원칙:
1. **구체성**: 모호한 표현 대신 구체적 행동과 반응 기술
2. **객관성**: 관찰 가능한 사실 중심, 수치와 빈도 포함
3. **전문성**: 해당 분야 전문 용어 적절히 사용
4. **행정 적합성**: 정부 감사, 실적 보고에 활용 가능한 수준
5. **연속성**: 이전 기록과의 연결, 변화 추이 서술
6. HTML 형식으로 구조화 (<h3>, <p>, <ul>, <li>, <strong>, <table> 사용)
7. 깔끔한 표 형식 적극 활용`;

    const userPrompt = `
# ${documentType === 'case_management' ? '사례관리 기록지' : documentType === 'program_log' ? '프로그램 운영일지' : '세션 기록지'} 작성 요청

**시설 유형**: ${facilityType}
**보고 기간**: ${periodStart} ~ ${periodEnd}
**이용자**: ${clientInfo.name} (${clientInfo.age ? clientInfo.age + '세' : '연령 미상'})
${clientInfo.careLevel ? `**돌봄등급**: ${clientInfo.careLevel}` : ''}
${clientInfo.serviceType ? `**서비스 유형**: ${clientInfo.serviceType}` : ''}
${clientInfo.disabilities?.length ? `**장애/질환**: ${clientInfo.disabilities.join(', ')}` : ''}

## 세션/활동 기록
${sessionSummary}

${staffNotes ? `## 직원 메모\n${staffNotes}` : ''}

위 데이터를 바탕으로 ${facilityType}의 공식 행정 서류 양식에 맞는 전문 문서를 작성하세요.
${reportStyle === 'concise' ? '간결하게 핵심만 작성하세요 (800~1000자).' : '상세하게 작성하세요 (1500~2000자).'}
모든 섹션을 HTML로 구조화하고, 필요시 표를 활용하세요.`;

    console.log(`[generate-care-documents] 문서 생성 시작: ${documentType} / ${facilityType}`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.content[0].text;

    console.log(`[generate-care-documents] 문서 생성 완료: ${generatedContent.length}자`);

    return new Response(
      JSON.stringify({
        success: true,
        htmlContent: generatedContent,
        metadata: {
          documentType,
          facilityType,
          clientName: clientInfo.name,
          periodStart,
          periodEnd,
          generatedAt: new Date().toISOString(),
          wordCount: generatedContent.length,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
