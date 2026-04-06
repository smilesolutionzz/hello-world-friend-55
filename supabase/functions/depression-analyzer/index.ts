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
    const { results, answers } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const isToddler = results.answers?.length === 12;
    const ageGroupLabel = results.ageGroup || (isToddler ? '유아 (3-6세)' : '성인');

    const ageSpecificPrompt = isToddler
      ? `
유아(3-6세) 우울 부모보고형 자가진단 결과에 대한 전문적인 분석을 제공해주세요.

체크 결과:
- 대상: ${ageGroupLabel}
- 총점: ${results.total}점 (36점 만점)
- 평균: ${results.average}점
- 수준: ${results.severity}
- 개별 응답: ${answers.join(', ')}

다음 구조로 2000자 이상의 상세한 분석을 제공해주세요:

**1. 유아 정서 상태 종합 평가**
- 전반적인 우울/정서 수준과 발달적 의미
- 3-6세 연령 대비 정서 발달 수준 해석
- 정상 발달 범위와의 비교

**2. 영역별 정서 분석**
- 정서 표현: 울음, 짜증, 무기력 등의 정서 표현 양상
- 흥미/동기: 놀이 및 활동에 대한 관심 수준
- 신체 증상: 식사, 수면, 에너지 수준의 변화
- 사회적 관계: 또래 관계, 분리불안, 위축 정도

**3. 발달적 관점에서의 해석**
- 유아기 우울의 특수성 (성인과 다른 표현 양상)
- 기질적 요인과 환경적 요인 분석
- 정서 문제가 전반적 발달에 미치는 영향

**4. 부모/보호자를 위한 실천 가이드**
- 가정에서 즉시 실천할 수 있는 정서 지원 방법 (5가지)
- 안정 애착 형성을 위한 상호작용 방법
- 놀이를 통한 정서 표현 및 조절 훈련
- 긍정적 양육 환경 조성법

**5. 전문가 권고사항**
- 전문 상담/치료가 필요한 기준
- 추천 치료 유형 (놀이치료, 미술치료, 부모-자녀 상호작용 치료 등)
- 어린이집/유치원과의 협력 방안

**6. 📋 요약 및 제언**
- 핵심 상태 요약
- 즉시 실행 권장사항 3가지
- 전문가 상담 필요성
- 희망적 전망과 격려`
      : `
당신은 20년 경력의 임상심리학 박사이자 우울증 전문가입니다. 우울감 자가체크 결과를 최고 수준의 전문가적 관점에서 매우 상세하고 심층적으로 분석해주세요.

체크 결과:
- 대상: ${ageGroupLabel}
- 총점: ${results.total}점 (0-63점 범위)
- 평균: ${results.average}점
- 수준: ${results.severity}
- 개별 응답: ${answers.join(', ')}

=== 전문가 수준 심층 분석 요청 (최소 2500자) ===

1. **종합적 우울증상 평가 및 점수 해석** (400자 이상)
   - Beck 우울척도 규준에 따른 현재 점수의 임상적 의미
   - 연령대별, 성별 표준집단과의 비교 분석
   - 우울증상의 심각도 수준과 기능 손상 정도

2. **증상 영역별 정밀 분석** (600자 이상)
   - **인지적 증상**: 부정적 사고 패턴, 자기비하, 절망감, 죄책감
   - **정서적 증상**: 우울감, 불안감, 흥미 상실, 즐거움 감소
   - **신체적 증상**: 수면 장애, 식욕 변화, 피로감, 집중력 저하
   - **행동적 증상**: 활동 수준 저하, 사회적 위축, 의사결정 어려움

3. **개별 문항 패턴 분석 및 임상적 함의** (400자 이상)
   - 특히 높은 점수를 보인 문항들의 구체적 의미
   - 자살 위험성 관련 문항의 세심한 평가
   - 증상의 지속성과 일관성 패턴

4. **위험도 평가 및 주의사항** (350자 이상)
   - 자해나 자살 사고의 위험도 정밀 평가
   - 일상생활 기능 손상의 구체적 영역과 정도
   - 우울증 악화 요인 및 조기 경고 신호

5. **개인 맞춤형 회복 전략 및 권장사항** (500자 이상)
   - 즉시 실행 가능한 조치
   - 단기적 관리 방안 (1-3개월)
   - 장기적 회복 계획 (3개월-1년)

6. **전문가 상담 및 치료 권고** (300자 이상)
   - 정신건강의학과 전문의 상담의 필요성과 시급성
   - 심리치료 적합성 및 추천 치료법

7. **구체적이고 실천 가능한 생활 관리 가이드** (450자 이상)
   - 수면 위생, 식사, 운동 관리
   - 정서 관리 기술
   - 사회적 지지 활용

8. **📋 요약 및 제언** (400자 이상)
   - 핵심 우울상태 요약
   - 즉시 실행 권장사항 3가지
   - 전문가 치료 필요성
   - 희망적 전망과 격려 메시지

⚠️ 이 분석은 참고용 의견이며 의학적 진단이 아닙니다.`;

    const analysisPrompt = ageSpecificPrompt;

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
            content: `당신은 임상심리학 박사이자 우울감 전문가입니다. ${isToddler ? '유아(3-6세) 우울 부모보고형' : '내담자의'} 검사 결과에 대해 도움이 되는 참고용 분석을 제공합니다. 각 섹션을 최소 200자 이상으로 풍부하게 작성하세요.`
          },
          { role: 'user', content: analysisPrompt }
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

    return new Response(JSON.stringify({ 
      analysis,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in depression-analyzer function:', error);
    
    // Fallback analysis
    const fallbackAnalysis = `체크 결과 참고 분석:
    
    현재 체크 결과에 대한 상세 분석을 생성하는 중 문제가 발생했습니다.
    
    주요 권장사항:
    1. 현재 상태에 대한 정확한 평가를 위해 전문가와의 상담을 권장합니다.
    2. 규칙적인 생활 패턴과 충분한 수면을 유지하세요.
    3. 가벼운 운동과 사회적 활동 참여를 늘려보세요.
    4. 스트레스 관리법을 익히고 실천하세요.
    
    주의사항:
    이 체크는 자가진단 도구로, 의학적 진단을 대체할 수 없습니다. 어려움이 지속되거나 악화될 경우 반드시 전문의와 상담하시기 바랍니다.
    
    지속적인 관심과 적절한 도움을 통해 충분히 개선될 수 있습니다.`;

    return new Response(JSON.stringify({ 
      analysis: fallbackAnalysis,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});