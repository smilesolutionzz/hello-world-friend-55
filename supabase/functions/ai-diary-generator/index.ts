import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SessionRecord {
  id: string;
  client_name: string;
  therapist_name: string;
  session_date: string;
  duration: number;
  voucher_type: string;
  session_notes: string;
  progress_notes: string;
  attendance_status: string;
  session_goals?: string;
  interventions?: string;
  observations?: string;
}

interface DiaryRequest {
  voucherType: string;
  sessionData: SessionRecord[];
  periodStart: string;
  periodEnd: string;
  reportStyle?: 'detailed' | 'concise' | 'professional';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      voucherType, 
      sessionData, 
      periodStart, 
      periodEnd,
      reportStyle = 'detailed' 
    }: DiaryRequest = await req.json();

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    // 바우처 유형별 실제 서식 기반 프롬프트
    const voucherPrompts: Record<string, string> = {
      "발달재활서비스": `발달재활서비스 제공기록지 형식으로 전문적으로 작성하세요:

**1. 대상자 및 회기 정보**
- 서비스 제공 일시, 회기 번호

**2. 치료 목표**
- 장기 목표 (전체 치료 방향)
- 단기 목표 (이번 회기 목표)

**3. 활동 내용**
- 도입 활동 (5분): 라포 형성 및 준비
- 전개 활동 (40분): 주요 치료 활동 및 방법
- 마무리 활동 (5분): 정리 및 피드백

**4. 아동 반응 및 수행도**
- 참여도, 집중도, 수행 수준
- 긍정적 반응 및 어려움

**5. 평가 및 특이사항**
- 치료 목표 달성도
- 다음 회기 계획`,

      "언어발달지원": `언어발달지원 서비스 일지를 SOAP 형식으로 작성하세요:

**S (Subjective - 주관적 정보)**
- 부모/보호자 보고 사항
- 아동의 의사소통 시도 및 태도

**O (Objective - 객관적 관찰)**
- 실시한 언어 활동 및 과제
- 수용언어: 이해력, 지시 따르기
- 표현언어: 어휘, 문장 구성, 발화 길이
- 음운: 조음 정확도
- 화용: 상호작용, 대화 차례 지키기

**A (Assessment - 평가)**
- 목표 달성 정도
- 강점 및 개선 필요 영역

**P (Plan - 계획)**
- 다음 회기 치료 방향
- 가정 연계 활동`,

      "미술심리치료": `미술심리치료 일지를 심리치료 관점에서 작성하세요:

**1. 내담자 상태**
- 입실 시 정서 상태 및 태도
- 전반적 기분 및 에너지 수준

**2. 미술 작업 과정**
- 선택한 미술 매체 (물감, 점토, 콜라주 등)
- 작업 주제 및 내용
- 작업 과정의 특징 (신중함, 충동성 등)

**3. 표현 분석**
- 색채, 구도, 형태의 특징
- 상징적 의미 해석
- 무의식적 표현 요소

**4. 치료적 개입**
- 치료사의 질문 및 반영
- 내담자 반응 및 통찰

**5. 심리적 변화**
- 정서 조절, 자기표현 변화
- 다음 회기 치료 초점`,

      "놀이심리치료": `놀이심리치료 일지를 Play Therapy 형식으로 작성하세요:

**1. 입실 및 정서 상태**
- 놀이실 입장 태도 (자발적/주저함/저항)
- 전반적 정서 (행복/불안/위축/흥분)

**2. 놀이 내용**
- 선택한 놀이감 및 순서
- 주요 놀이 주제 (가족, 공격성, 양육 등)
- 놀이 패턴 및 시퀀스

**3. 놀이 과정 관찰**
- 상징적 표현 및 의미
- 놀이의 강도 및 몰입도
- 상호작용 패턴

**4. 치료사 개입**
- 반영적 경청 및 공감
- 제한 설정 (필요시)
- 치료적 반응

**5. 평가 및 진전**
- 정서 표현 능력
- 자기 조절 능력 변화
- 다음 회기 방향`,

      "교육청서비스": `교육청 특수교육 지원 일지 형식으로 작성하세요:

**1. IEP 목표 및 진척도**
- 개별화 교육 목표
- 목표 달성 정도

**2. 수업 활동 내용**
- 교과 활동 및 방법
- 보조 기구 활용

**3. 학습 수행도**
- 과제 수행 능력
- 학습 태도 및 참여도

**4. 행동 관찰**
- 수업 중 행동 특성
- 또래 상호작용

**5. 향후 계획**
- 다음 단계 목표
- 필요한 지원`,

      "지역사회서비스": `지역사회 서비스 일지 형식으로 작성하세요:

**1. 서비스 제공 내용**
- 실시한 프로그램
- 참여 시간 및 방법

**2. 이용자 반응**
- 참여 태도 및 만족도
- 특이 사항

**3. 사회적응 관찰**
- 지역사회 적응 능력
- 대인관계 기술

**4. 서비스 효과**
- 긍정적 변화
- 개선 필요 영역

**5. 향후 계획**
- 지속 서비스 방향
- 연계 필요 사항`
    };

    const voucherTypePrompt = voucherPrompts[voucherType] || voucherPrompts["발달재활서비스"];

    // 세션 데이터 요약
    const sessionSummary = sessionData.map(session => `
날짜: ${session.session_date}
대상자: ${session.client_name}
담당자: ${session.therapist_name}
시간: ${session.duration}분
출석: ${session.attendance_status}
목표: ${session.session_goals || '미기록'}
활동: ${session.session_notes}
관찰: ${session.observations || '미기록'}
진전: ${session.progress_notes}
중재: ${session.interventions || '미기록'}
---
`).join('\n');

    // 스타일별 정확한 글자 수 제한
    const characterLimits: Record<string, { min: number; max: number }> = {
      'detailed': { min: 1500, max: 2000 },
      'concise': { min: 800, max: 1000 },
      'professional': { min: 1200, max: 1500 }
    };
    
    const targetLimit = characterLimits[reportStyle];

    const systemPrompt = `당신은 20년 경력의 전문 치료사이자 일지 작성 전문가입니다.
${voucherTypePrompt}

작성 스타일:
${reportStyle === 'detailed' ? '- 상세형: 모든 활동과 반응을 구체적으로 기록\n- 치료 과정의 세부 사항, 아동의 미묘한 반응 변화까지 포착' : ''}
${reportStyle === 'concise' ? '- 간결형: 핵심 내용만 명확하게 요약\n- 주요 활동, 반응, 평가를 간략하게 정리' : ''}
${reportStyle === 'professional' ? '- 전문형: 전문적이면서 읽기 쉽게 작성\n- 전문 용어와 일반 용어를 적절히 혼합하여 사용' : ''}

필수 작성 원칙:
1. **구체성**: 모호한 표현 대신 구체적 행동과 반응 기술
   - ❌ "아동이 잘 참여했다"
   - ✅ "아동은 15분간 집중하여 퍼즐 3개를 완성했다"

2. **객관성**: 관찰 가능한 사실 중심으로 기록
   - 감정 추론보다는 행동 묘사
   - 구체적인 발화나 행동 예시 포함

3. **전문성**: 해당 치료 영역의 전문 용어 적절히 사용
   - 발달 영역, 치료 기법 명칭 정확히 사용

4. **균형**: 진전과 개선점을 모두 포함
   - 긍정적 변화 강조하되, 과장하지 않기
   - 개선 필요 영역도 건설적으로 제시

5. **연계성**: 이전 목표와의 연결, 다음 계획 명시
   - 치료의 연속성이 드러나도록 작성`;

    const userPrompt = `
# 일지 생성 요청

**바우처 유형**: ${voucherType}
**보고 기간**: ${periodStart} ~ ${periodEnd}
**세션 수**: ${sessionData.length}회

## 세션 기록 데이터
${sessionSummary}

위 데이터를 바탕으로 ${voucherType}의 공식 서식에 맞는 전문 치료 일지를 작성해주세요.

**⚠️ 글자 수 제한 (매우 중요)**:
- 정확히 ${targetLimit.min}자 ~ ${targetLimit.max}자 사이로 작성해야 합니다
- 문장이 중간에 잘리면 안 됩니다 - 반드시 완전한 문장으로 끝내세요
- ${targetLimit.max}자에 근접하면, 새로운 내용을 추가하지 말고 마무리 문장으로 종료하세요
- 글자 수를 맞추기 위해 불필요한 내용을 반복하지 마세요

작성 시 주의사항:
- 제공된 세션 데이터의 구체적 내용을 인용하여 작성
- 각 섹션은 HTML 형식으로 구조화 (<h3>, <p>, <ul>, <li>, <strong> 사용)
- 객관적 관찰과 전문가 의견을 명확히 구분
- 긍정적 변화와 개선 필요 영역을 균형있게 서술
`;

    console.log('Claude API 호출 시작');

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
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ],
        system: systemPrompt
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API 오류:', response.status, errorText);
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.content[0].text;

    console.log('일지 생성 완료');

    // 메타데이터 생성
    const metadata = {
      voucherType,
      periodStart,
      periodEnd,
      totalSessions: sessionData.length,
      generatedAt: new Date().toISOString(),
      reportStyle,
      model: 'claude-sonnet-4-5',
      wordCount: generatedContent.length
    };

    return new Response(
      JSON.stringify({
        success: true,
        content: generatedContent,
        metadata,
        summary: {
          totalSessions: sessionData.length,
          period: `${periodStart} ~ ${periodEnd}`,
          attendanceRate: calculateAttendanceRate(sessionData),
          uniqueClients: getUniqueClients(sessionData).length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || '일지 생성 중 오류가 발생했습니다.' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function calculateAttendanceRate(sessions: SessionRecord[]): string {
  const attended = sessions.filter(s => s.attendance_status === '출석' || s.attendance_status === 'attended').length;
  const rate = (attended / sessions.length * 100).toFixed(1);
  return `${rate}%`;
}

function getUniqueClients(sessions: SessionRecord[]): string[] {
  return [...new Set(sessions.map(s => s.client_name))];
}
