import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssessmentData {
  assessmentType: string;
  results: Record<string, number>;
  assessmentInfo: any;
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assessmentType, results, assessmentInfo, timestamp }: AssessmentData = await req.json();

    console.log('Processing premium assessment analysis:', {
      assessmentType,
      results,
      assessmentInfo: assessmentInfo.title
    });

    // 결과 점수를 텍스트로 변환
    const scoresText = Object.entries(results)
      .map(([category, score]) => `${category.replace(/_/g, ' ')}: ${score.toFixed(1)}/7.0`)
      .join('\n');

    const averageScore = Object.values(results).reduce((sum, score) => sum + score, 0) / Object.keys(results).length;

    // 검사 타입별 전문 프롬프트 설정
    const getAnalysisPrompt = (type: string) => {
      const basePrompt = `당신은 임상심리학 전문가입니다. 다음 프리미엄 심리검사 결과를 전문가 수준으로 심층 분석해주세요.

검사명: ${assessmentInfo.title}
검사 설명: ${assessmentInfo.description}
검사 일시: ${new Date(timestamp).toLocaleString('ko-KR')}

=== 검사 결과 ===
${scoresText}
평균 점수: ${averageScore.toFixed(1)}/7.0

=== 분석 요청 사항 ===
다음 구조로 종합적이고 심층적인 해석을 제공해주세요:

1. **종합 소견** (3-4문단)
   - 전체적인 성향과 특성 종합 평가
   - 주요 강점과 특징 분석
   - 개선이 필요한 영역 식별

2. **영역별 상세 분석** (각 영역당 2-3문단)
   - 각 측정 영역별 구체적 해석
   - 점수의 임상적 의미
   - 일상생활에서의 영향

3. **심리학적 통찰** (2-3문단)
   - 영역 간 상호작용 및 패턴 분석
   - 개인의 심리적 역동성 해석
   - 잠재적 위험 요소나 보호 요소

4. **맞춤형 권장사항** (구체적 제안)
   - 개인 성장을 위한 구체적 방법
   - 일상 실천 가능한 전략
   - 전문가 상담이 필요한 경우 안내

5. **장기적 관점** (1-2문단)
   - 지속적 관리 방향
   - 재검사 권장 시기
   - 변화 추적 포인트

전문적이면서도 이해하기 쉽게 작성하고, 구체적이고 실용적인 조언을 포함해주세요.
검사의 한계를 인정하되, 가능한 한 깊이 있는 통찰을 제공해주세요.`;

      // 검사 유형별 특화 프롬프트 추가
      switch (type) {
        case 'personality_type':
          return basePrompt + `

**특별 고려사항:**
- 4가지 성격 차원 간의 균형과 불균형 분석
- 직업적 적합성과 인간관계 스타일 해석
- 성격 유형별 스트레스 대처 방식과 성장 방향 제시`;

        case 'temperament':
          return basePrompt + `

**특별 고려사항:**
- 타고난 기질적 특성과 후천적 발달 가능성 분석
- 기질 조합에 따른 독특한 행동 패턴 해석
- 기질적 강점 활용과 약점 보완 전략 제시`;

        case 'cognitive':
          return basePrompt + `

**특별 고려사항:**
- 인지기능 영역별 상대적 강약점 분석
- 일상생활 및 사회활동에 미치는 영향 평가
- 인지 기능 유지 및 향상을 위한 구체적 방법 제시`;

        case 'work_stress':
          return basePrompt + `

**특별 고려사항:**
- 직장 내 스트레스 원인과 번아웃 위험도 분석
- 업무 효율성과 만족도 개선 방안
- 일-삶 균형 회복을 위한 실천적 전략 제시`;

        case 'relationship':
          return basePrompt + `

**특별 고려사항:**
- 애착 패턴이 관계에 미치는 영향 분석
- 건강한 관계 형성을 위한 구체적 방법
- 갈등 해결과 친밀감 증진 전략 제시`;

        default:
          return basePrompt;
      }
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: '당신은 20년 경력의 임상심리학 전문가입니다. 심리검사 결과를 전문적이면서도 이해하기 쉽게 해석하는 것이 전문 분야입니다. 깊이 있는 통찰과 실용적인 조언을 제공합니다.'
          },
          {
            role: 'user',
            content: getAnalysisPrompt(assessmentType)
          }
        ],
        max_completion_tokens: 3000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI API response received successfully');

    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      analysis,
      metadata: {
        assessmentType,
        averageScore: averageScore.toFixed(1),
        timestamp,
        generatedAt: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in premium-assessment-analyzer function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      analysis: `AI 분석 생성 중 오류가 발생했습니다. 

기본 해석:
검사 결과를 바탕으로 한 기본적인 피드백을 제공합니다. 각 영역의 점수를 참고하여 개인의 특성을 이해하고, 필요한 경우 전문가와 상담하시기 바랍니다.

전문가 상담을 통해 더 정확하고 개인화된 해석을 받으실 수 있습니다.`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});