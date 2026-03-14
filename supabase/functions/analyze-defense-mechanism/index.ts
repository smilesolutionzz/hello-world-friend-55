import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { categoryScores, primaryMechanisms, answers } = await req.json();

    console.log('Defense mechanism analysis request:', { categoryScores, primaryMechanisms });

    const mechanismNames: Record<string, string> = {
      projection: '투사 (Projection)',
      denial: '부정 (Denial)',
      rationalization: '합리화 (Rationalization)',
      displacement: '전위 (Displacement)',
      regression: '퇴행 (Regression)',
      sublimation: '승화 (Sublimation)',
      repression: '억압 (Repression)',
      reaction_formation: '반동형성 (Reaction Formation)',
    };

    const mechanismDescriptions: Record<string, string> = {
      projection: '자신의 수용하기 어려운 감정이나 생각을 다른 사람에게 돌리는 방어기제입니다.',
      denial: '불편한 현실이나 감정을 인정하지 않고 회피하는 방어기제입니다.',
      rationalization: '자신의 행동이나 선택을 논리적으로 정당화하여 불편함을 줄이는 방어기제입니다.',
      displacement: '감정을 원래 대상이 아닌 다른 대상에게 표출하는 방어기제입니다.',
      regression: '스트레스 상황에서 발달 단계상 이전 행동으로 돌아가는 방어기제입니다.',
      sublimation: '부정적 충동을 사회적으로 수용 가능한 긍정적 활동으로 전환하는 건강한 방어기제입니다.',
      repression: '불편한 기억이나 감정을 무의식으로 밀어내는 방어기제입니다.',
      reaction_formation: '진짜 감정과 정반대되는 행동을 보이는 방어기제입니다.',
    };

    const primaryMechsList = primaryMechanisms
      .map((m: string) => `- ${mechanismNames[m]} (${categoryScores[m]}%): ${mechanismDescriptions[m]}`)
      .join('\n');

    const systemPrompt = `당신은 20년 경력의 임상심리 전문가이자 정신분석 전문가입니다. 
방어기제(Defense Mechanism)는 프로이트가 제안한 개념으로, 사람들이 불안이나 스트레스에 대처하기 위해 무의식적으로 사용하는 심리적 전략입니다.

당신의 역할:
1. 검사 결과를 바탕으로 내담자의 심리적 방어 패턴을 깊이있게 분석
2. 각 방어기제가 어떤 상황에서 나타나는지 구체적 예시 제공
3. 건강한 방어기제와 비건강한 방어기제 구분 (Vaillant의 방어기제 위계 이론 기반)
4. 실질적이고 따뜻한 성장 가이드 제공
5. DSM-5 방어기능척도(DMRS) 관점에서 방어기제의 적응 수준 평가
6. Anna Freud, Melanie Klein, Nancy McWilliams 등의 이론을 통합하여 해석

분석 원칙:
- 비판적이지 않고 이해하는 태도
- 방어기제는 자연스러운 현상임을 강조
- 각 방어기제의 정신분석학적 기원과 발달적 맥락 설명
- 방어기제 간의 상호작용 패턴과 방어 클러스터 분석
- 무의식적 갈등 구조와 핵심 불안(core anxiety) 탐색
- 건강한 대안과 구체적 실천 방법 제시 (인지행동치료, 마음챙김 기법 포함)
- 전문적이면서도 쉽게 이해할 수 있는 언어 사용
- **3000자 이상** 깊이 있는 분석 제공`;

    const userPrompt = `다음은 방어기제 검사 결과입니다:

**주요 방어기제 (상위 3개):**
${primaryMechsList}

**전체 카테고리 점수:**
${Object.entries(categoryScores)
  .map(([key, value]) => `- ${mechanismNames[key]}: ${value}%`)
  .join('\n')}

다음 형식으로 **2000자 이상** 심층 분석을 작성해주세요:

## 🧠 전체적인 방어기제 프로필

당신의 심리적 방어 패턴의 전반적인 특징을 분석합니다.
(주요 방어기제들이 어떻게 상호작용하는지, 어떤 성향을 보이는지)

## 💎 주요 방어기제 심층 분석

**1위: [방어기제명]**
- 이 방어기제가 나타나는 구체적인 상황
- 당신이 이 방어기제를 사용하는 이유
- 이것이 당신에게 어떤 영향을 미치는지
- 실생활 예시

**2위: [방어기제명]**
(같은 형식)

**3위: [방어기제명]**
(같은 형식)

## 🌱 건강한 성장을 위한 가이드

**즉시 실천 가능한 3가지:**
1. [구체적인 실천 방법]
2. [구체적인 실천 방법]  
3. [구체적인 실천 방법]

**장기적 성장 전략:**
- [심화 방법 1]
- [심화 방법 2]
- [심화 방법 3]

## 💪 당신의 강점

당신이 가진 건강한 대처 방식과 강점을 발견하여 격려합니다.

## 🎯 전문가의 한마디

검사 결과를 종합하여 따뜻하고 희망적인 메시지를 전달합니다.

**중요**: 구체적이고 실용적인 조언으로 2000자 이상 작성하되, 내담자가 실제로 실천할 수 있고 위안을 받을 수 있도록 작성해주세요.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('Analysis generated successfully');

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-defense-mechanism function:', error);
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
