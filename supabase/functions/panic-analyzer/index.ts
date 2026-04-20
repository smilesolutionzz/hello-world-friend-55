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
    const { answers, totalScore, average, severity, ageGroup, maxScore } = await req.json();

    if (!answers || totalScore === undefined) {
      throw new Error('Missing required parameters');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const isToddler = answers.length === 12;
    const isChild = answers.length === 15;
    const targetLabel = isToddler ? '유아 (3-6세)' : isChild ? '아동 (7-12세)' : '성인';

    const prompt = isToddler
      ? `유아(3-6세) 불안 부모보고형 자가진단 결과에 대한 전문적인 분석을 제공해주세요.

테스트 결과:
- 대상: ${ageGroup || '유아 (3-6세)'}
- 총점: ${totalScore}점 (${maxScore || 36}점 만점)
- 평균: ${average.toFixed(1)}점
- 수준: ${severity}
- 개별 응답: [${answers.join(', ')}]

다음 구조로 2000자 이상의 상세한 분석을 제공해주세요:

**1. 유아 불안 상태 종합 평가**
- 전반적인 불안 수준과 발달적 의미
- 3-6세 연령 대비 불안 수준 해석
- 정상 발달 범위와의 비교

**2. 영역별 불안 분석**
- 분리불안: 부모/양육자와의 분리 시 반응
- 사회적 불안: 낯선 사람, 또래 관계에서의 불안
- 특정 공포: 동물, 어둠, 새로운 환경 등에 대한 공포
- 신체적 표현: 불안의 신체 증상 (복통, 두통 등)

**3. 발달적 관점에서의 해석**
- 3-6세 시기의 정상적인 불안과 과도한 불안의 경계
- 기질적 요인과 환경적 요인 분석
- 불안이 발달에 미치는 영향 (사회성, 자율성 발달)

**4. 부모/보호자를 위한 실천 가이드**
- 가정에서 즉시 실천할 수 있는 방법 (5가지)
- 유아기 안정 애착 형성을 위한 소통법
- 불안 상황에서의 적절한 대응 방법
- 놀이를 통한 불안 해소 및 정서 조절 훈련법

**5. 전문가 권고사항**
- 전문 상담/치료가 필요한 기준
- 추천 치료 유형 (놀이치료, 모래놀이치료, 부모-자녀 상호작용 치료 등)
- 어린이집/유치원과의 협력 방안

**6. 📋 요약 및 제언**
- 핵심 상태 요약
- 즉시 실행 권장사항
- 전문가 상담 필요성
- 희망적 전망과 격려`
      : isChild
      ? `아동(7-12세) 불안 자가진단 결과에 대한 전문적인 분석을 제공해주세요.

테스트 결과:
- 대상: ${ageGroup || '아동'}
- 총점: ${totalScore}점 (${maxScore || 45}점 만점)
- 평균: ${average.toFixed(1)}점
- 수준: ${severity}
- 개별 응답: [${answers.join(', ')}]

다음 구조로 2000자 이상의 상세한 분석을 제공해주세요:

**1. 아동 불안 상태 종합 평가**
- 전반적인 불안 수준과 발달적 의미
- 연령 대비 불안 수준 해석
- 정상 범위와의 비교

**2. 영역별 불안 분석**
- 학교/사회적 불안: 학교 적응, 또래 관계 불안
- 분리/공포 불안: 부모 분리불안, 새로운 환경 공포
- 신체/일반 불안: 신체 증상, 일반적 걱정

**3. 발달적 관점에서의 해석**
- 현재 연령에서 정상적인 불안 범위
- 과도한 불안의 신호
- 불안이 발달에 미치는 영향

**4. 부모/보호자를 위한 가이드**
- 가정에서 즉시 실천할 수 있는 방법 (5가지)
- 아이와의 소통 방법
- 안정감을 주는 환경 조성법
- 놀이를 통한 불안 해소법

**5. 전문가 권고사항**
- 전문가 상담이 필요한 기준
- 추천 치료/상담 유형 (놀이치료, 인지행동치료 등)
- 학교와의 협력 방안

**6. 📋 요약 및 제언**
- 핵심 상태 요약
- 즉시 실행 권장사항
- 전문가 상담 필요성
- 희망적 전망과 격려`
      : `성인 불안/공황장애 자가진단 결과에 대한 전문적인 분석을 제공해주세요.

테스트 결과:
- 대상: ${ageGroup || '성인'}
- 총점: ${totalScore}점 (${maxScore || 63}점 만점)
- 평균: ${average.toFixed(1)}점
- 수준: ${severity}
- 개별 응답: [${answers.join(', ')}]

다음 구조로 2000자 이상의 상세한 분석을 제공해주세요:

**1. 현재 불안/공황 상태 종합 평가**
- 전반적인 불안 수준과 의미
- 점수 해석 및 공황장애 가능성 평가
- 점수 해석 및 공황장애 가능성 평가

**2. 영역별 불안 분석**
- 신체적 증상: 심장 두근거림, 호흡곤란, 어지러움 등
- 인지적 증상: 비현실감, 통제력 상실 공포, 죽음 공포
- 행동적 증상: 회피 행동, 일상생활 지장, 상황 회피

**3. 불안 패턴 및 위험 요인 분석**
- 불안 촉발 요인 추정
- 불안 유지 메커니즘 (인지적 왜곡, 과각성 등)
- 만성화 위험도 평가
- 공존 질환 가능성 (우울증, PTSD 등)

**4. 맞춤형 불안 관리 전략**
- 즉시 실행 가능한 불안 완화 기법 (호흡법, 접지법, 근이완법)
- 인지행동적 전략 (인지 재구조화, 노출 훈련 등)
- 생활습관 개선 (수면, 카페인, 운동 등)
- 위기 상황 대처 매뉴얼

**5. 전문가 권고사항**
- 전문적 도움이 필요한 기준
- 추천 치료법 (CBT, 약물치료, EMDR 등)
- 자가 모니터링 방법
- 경고 신호 인식

**6. 📋 요약 및 제언**
- 핵심 불안 상태 요약
- 즉시 실행 권장사항 3가지
- 전문가 상담 필요성
- 희망적 전망과 격려 메시지

각 섹션을 최소 200자 이상으로 구체적이고 실용적으로 작성해주세요.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `당신은 20년 경력의 임상심리학 박사이자 불안장애/공황장애 전문가입니다. ${isToddler ? '유아(3-6세) 불안 부모보고형' : isChild ? '아동 불안' : '성인 불안/공황장애'} 자가진단 결과를 바탕으로 매우 전문적이고 상세한 분석을 제공합니다. 학술적 근거를 바탕으로 정확하고 실용적이며 희망적인 관점을 유지하세요. 각 섹션을 최소 200자 이상으로 풍부하게 작성하세요.`
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    const pct = totalScore / (maxScore || (isChild ? 45 : 63));
    const riskLevel = pct >= 0.75 ? 'high' : pct >= 0.5 ? 'medium' : 'low';

    return new Response(JSON.stringify({
      analysis, riskLevel, totalScore, average, severity, ageGroup,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in panic-analyzer function:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
