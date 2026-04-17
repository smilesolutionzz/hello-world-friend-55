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
    const { answers, personalityType, score } = await req.json();
    
    console.log('Analyzing Otrovert result:', { personalityType, score });

    const prompt = `당신은 성격 심리학 전문가입니다. 다음 오트로버트(Otrovert) 성격 진단 결과를 분석해주세요.

성격 유형: ${personalityType}
점수: ${score}점

답변 패턴:
${Object.entries(answers).map(([key, answer]: [string, any]) => `- ${key}: ${answer.value} (점수: ${answer.score})`).join('\n')}

다음 형식으로 분석해주세요:

1. 핵심 특성 (3-4문장): 이 사람의 가장 두드러진 성격 특성을 구체적으로 설명
2. 사회적 에너지 패턴: 어떻게 에너지를 소모하고 충전하는지
3. 의사소통 스타일: 대화와 관계 형성 방식
4. 업무/학습 환경: 가장 생산적인 환경과 조건
5. 관계 맺기: 친구 관계와 연애 관계에서의 특징
6. 주의사항 (2-3가지): 이 성격 유형이 조심해야 할 점
7. 발전 방향 (2-3가지): 더 나은 삶을 위한 구체적 조언

각 항목을 명확하고 공감가는 언어로 작성해주세요.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-preview',
        messages: [
          { role: 'system', content: '당신은 성격 심리학과 성격유형 이론, 빅5 성격 이론을 깊이 이해하는 전문가입니다. 오트로버트는 외향성과 내향성 사이의 스펙트럼을 측정하는 새로운 개념입니다.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    // 그래프 데이터 생성
    const graphData = {
      extroversion: Math.max(0, 100 - (parseFloat(score) / 9 * 100)),
      introversion: parseFloat(score) / 9 * 100,
      socialEnergy: calculateDimensionScore(answers, ['social_energy', 'social_battery', 'energy_source']),
      aloneTime: calculateDimensionScore(answers, ['alone_time', 'recharge_time', 'workspace']),
      groupPreference: calculateDimensionScore(answers, ['party_behavior', 'group_size', 'after_work']),
      communication: calculateDimensionScore(answers, ['conversation_style', 'small_talk', 'phone_calls']),
      thinkingStyle: calculateDimensionScore(answers, ['thinking_style', 'decision_making', 'conflict_resolution'])
    };

    return new Response(JSON.stringify({ 
      analysis,
      graphData,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in otrovert-analyzer:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      analysis: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      graphData: null,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateDimensionScore(answers: Record<string, any>, questionIds: string[]): number {
  const relevantAnswers = questionIds
    .map(id => answers[id])
    .filter(answer => answer !== undefined);
  
  if (relevantAnswers.length === 0) return 50;
  
  const avgScore = relevantAnswers.reduce((sum, answer) => sum + answer.score, 0) / relevantAnswers.length;
  return 100 - (avgScore / 9 * 100); // 반전: 높은 점수 = 더 내향적, 그래프에서는 낮게 표시
}
