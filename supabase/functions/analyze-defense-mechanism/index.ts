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
3. 건강한 방어기제와 비건강한 방어기제 구분 (방어기제 위계 이론 기반)
4. 실질적이고 따뜻한 성장 가이드 제공
5. 방어기능 적응 수준 평가
6. 정신분석적 이론들을 통합하여 해석

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

다음 형식으로 **3000자 이상** 심층 분석을 작성해주세요:

## 🧠 전체적인 방어기제 프로필

당신의 심리적 방어 패턴의 전반적인 특징을 분석합니다.
(방어기제 위계 이론에 따른 적응 수준 평가: 성숙한/신경증적/미성숙 방어기제 비율 분석)
(방어기제들이 어떻게 상호작용하는지, 핵심 불안(core anxiety)은 무엇인지)

## 🔬 정신분석학적 심층 해석

방어기제의 발달적 기원과 무의식적 갈등 구조를 탐색합니다.
(방어기제 이론, 대상관계이론 관점에서의 해석)
(이 방어 패턴이 초기 양육 환경이나 애착 경험과 어떻게 연결되는지)
(방어 클러스터 분석: 어떤 방어기제들이 함께 작동하며, 그 심리적 의미는 무엇인지)

## 💎 주요 방어기제 심층 분석

**1위: [방어기제명]**
- 정신분석학적 의미와 기능
- 이 방어기제가 나타나는 구체적인 상황 (직장, 관계, 가족 등)
- 이것이 당신의 대인관계와 자기상에 미치는 영향
- 실생활 예시와 내면의 심리적 역동

**2위: [방어기제명]**
(같은 형식으로 심층 분석)

**3위: [방어기제명]**
(같은 형식으로 심층 분석)

## 📊 방어기제 적응 수준 평가

전문 임상 관점에서의 전체적 적응 수준을 평가합니다.
(성숙한 방어기제 vs 미성숙 방어기제의 비율 분석)
(현재 방어 패턴의 정신건강 위험도 평가)

## 🌱 건강한 성장을 위한 임상적 가이드

**즉시 실천 가능한 3가지:**
1. [구체적인 실천 방법 - 인지행동치료 기법 기반]
2. [구체적인 실천 방법 - 마음챙김/정서조절 기법]
3. [구체적인 실천 방법 - 대인관계 스킬 훈련]

**장기적 심리 성장 로드맵:**
- 1단계: [방어기제 자각 훈련]
- 2단계: [감정 내성(affect tolerance) 키우기]
- 3단계: [성숙한 방어기제로의 전환 전략]

## 💪 당신의 심리적 강점과 회복탄력성

당신이 가진 건강한 대처 방식과 강점, 심리적 자원을 발견합니다.
(성숙한 방어기제의 활용 능력, 감정 조절 능력, 자기 인식 수준)

## 🎯 전문가의 종합 소견

검사 결과를 종합하여 임상심리전문가 관점의 종합 소견과 따뜻한 메시지를 전달합니다.
(필요시 심리상담/정신분석 추천, 심리치료 유형 제안)

**중요**: 구체적이고 실용적인 조언으로 3000자 이상 작성하되, 학술적 근거에 기반하면서도 내담자가 쉽게 이해하고 실천할 수 있도록 작성해주세요.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 5000,
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
