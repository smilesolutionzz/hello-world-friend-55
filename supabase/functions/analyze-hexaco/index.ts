import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { categoryScores, answers } = await req.json();

    console.log('HEXACO analysis request:', { categoryScores });

    const dimensionNames: Record<string, string> = {
      honesty: '정직-겸손성 (Honesty-Humility)',
      emotionality: '정서성 (Emotionality)',
      extraversion: '외향성 (eXtraversion)',
      agreeableness: '원만성 (Agreeableness)',
      conscientiousness: '성실성 (Conscientiousness)',
      openness: '개방성 (Openness to Experience)',
    };

    const scoreList = Object.entries(categoryScores)
      .map(([key, value]) => `- ${dimensionNames[key]}: ${value}점`)
      .join('\n');

    const systemPrompt = `당신은 20년 경력의 성격심리학 전문가이자 6요인 성격 모델의 권위자입니다.

6요인 성격 모델은 기존 5요인 모델에 정직-겸손성 차원을 추가하여 성격을 더 포괄적으로 설명하는 심리학적 프레임워크입니다.

**6가지 차원:**
1. **H (Honesty-Humility)**: 도덕성, 정직함, 겸손함, 물질주의의 반대
2. **E (Emotionality)**: 정서적 반응성, 공감, 불안 민감성, 의존성
3. **X (eXtraversion)**: 사교성, 활력, 긍정적 정서, 자기확신
4. **A (Agreeableness)**: 관용, 인내, 유연성, 협조성
5. **C (Conscientiousness)**: 조직화, 근면성, 완벽주의, 신중함
6. **O (Openness)**: 창의성, 심미성, 호기심, 비전통성

당신의 역할:
1. 각 차원의 점수를 바탕으로 성격 프로필을 종합적으로 해석
2. 차원 간의 상호작용과 조합이 만드는 독특한 패턴 설명
3. 직업, 대인관계, 리더십 스타일에 대한 구체적 인사이트
4. 성장을 위한 실용적이고 맞춤화된 조언 제공

분석 원칙:
- 과학적 근거에 기반한 해석
- 긍정적이면서도 현실적인 피드백
- 구체적인 예시와 실천 방법 제시
- 내담자의 강점을 발견하고 격려`;

    const userPrompt = `다음은 6요인 성격 검사 결과입니다:

**각 차원별 점수 (0-100점):**
${scoreList}

다음 형식으로 **3000자 이상** 전문적이고 심층적인 분석을 작성해주세요:

## 🎯 종합 성격 프로필

당신의 6요인 성격 패턴을 종합적으로 해석합니다.
(6가지 차원이 어떻게 조합되어 독특한 성격을 만드는지 설명)

## 💎 6차원 상세 분석

### H - 정직-겸손성 (${categoryScores.honesty}점)
- 이 차원에서의 당신의 특징
- 실생활에서 나타나는 구체적인 패턴
- 대인관계와 윤리적 의사결정에 미치는 영향

### E - 정서성 (${categoryScores.emotionality}점)
- 감정 처리 방식과 공감 능력
- 스트레스 대처와 안전에 대한 욕구
- 인간관계에서의 정서적 패턴

### X - 외향성 (${categoryScores.extraversion}점)
- 사회적 에너지와 활력의 원천
- 커뮤니케이션 스타일
- 네트워킹과 관계 형성 패턴

### A - 원만성 (${categoryScores.agreeableness}점)
- 갈등 해결 방식
- 협력과 타협의 태도
- 팀워크에서의 역할

### C - 성실성 (${categoryScores.conscientiousness}점)
- 목표 추구와 과제 수행 방식
- 계획성과 조직화 능력
- 책임감과 근면성

### O - 개방성 (${categoryScores.openness}점)
- 새로움에 대한 태도
- 창의성과 상상력
- 학습과 성장 방식

## 💼 직업 및 경력 인사이트

당신의 성격 프로필에 적합한:
- 추천 직업군과 업무 환경
- 리더십 스타일과 팀 역할
- 경력 개발 전략

## 🤝 대인관계 패턴

- 친밀한 관계에서의 특징
- 우정과 사랑에서의 패턴
- 갈등 상황 대처 방식
- 효과적인 커뮤니케이션 팁

## 🌱 성장을 위한 맞춤 가이드

**강점 활용 전략:**
1. [구체적인 강점 활용 방법]
2. [실천 가능한 전략]
3. [장기적 발전 방향]

**보완이 필요한 영역:**
1. [개선 포인트와 구체적 방법]
2. [단계별 실천 계획]
3. [예상되는 긍정적 변화]

## 🎨 당신만의 독특한 조합

6가지 차원의 조합이 만드는 당신만의 특별한 성격 특성을 발견하고,
그것이 어떻게 당신의 삶을 풍요롭게 만드는지 설명합니다.

## 🌟 전문가의 한마디

검사 결과를 종합하여 격려와 희망의 메시지를 전달합니다.

**중요**: 과학적 근거를 바탕으로 3000자 이상 작성하되, 실용적이고 구체적인 조언으로 내담자에게 실질적 도움이 되도록 작성해주세요.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('HEXACO analysis generated successfully');

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-hexaco function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        analysis: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
