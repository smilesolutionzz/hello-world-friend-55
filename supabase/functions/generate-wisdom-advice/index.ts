import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers, scores } = await req.json();

    console.log('Generating wisdom advice with:', { answers: Object.keys(answers).length, scores });

    // 답변 패턴 분석
    const answerAnalysis = Object.entries(answers).map(([id, answer]) => `질문 ${id}: ${answer}`).join('\n');
    
    // 가장 높은 점수 영역 찾기
    const maxScore = Math.max(...(Object.values(scores) as number[]));
    const dominantTraits = Object.entries(scores as Record<string, number>)
      .filter(([_, score]) => score === maxScore)
      .map(([trait, _]) => trait);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `당신은 노인분들을 위한 따뜻하고 재미있는 지혜 조언을 제공하는 전문가입니다. 
            존댓말을 사용하고, 유머러스하면서도 따뜻한 톤으로 조언을 해주세요.
            각 조언은 구체적이고 실용적이며, 노인분들의 경험과 지혜를 인정하면서 새로운 관점을 제시해야 합니다.
            이모지를 적절히 사용해서 재미있게 만들어주세요.`
          },
          {
            role: 'user',
            content: `다음은 지혜 조언 테스트 결과입니다:

답변 내용:
${answerAnalysis}

점수 분포:
- 가족/인간관계: ${scores.family}점
- 건강관리: ${scores.health}점  
- 지혜/통찰: ${scores.wisdom}점
- 경험/멘토링: ${scores.experience}점

가장 높은 점수 영역: ${dominantTraits.join(', ')}

이 결과를 바탕으로 다음 형식으로 재미있고 따뜻한 조언을 생성해주세요:

1. title: 재미있는 별명 형태의 제목 (예: "따뜻한 마음의 가족 지킴이 👨‍👩‍👧‍👦")
2. description: 성격과 특성에 대한 재미있는 분석 (100-150자)
3. advice: 구체적이고 실용적인 조언 3-4문장
4. funFact: 재미있는 추가 정보나 격려의 말 1-2문장
5. recommendation: 오늘 당장 해볼 수 있는 작은 실천 방법

JSON 형태로 응답해주세요.`
          }
        ],
        temperature: 0.8,
        max_tokens: 800
      }),
    });

    const data = await response.json();
    console.log('OpenAI response received');

    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid OpenAI response');
    }

    const content = data.choices[0].message.content;
    let result;
    
    try {
      result = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse JSON response:', content);
      // 기본 응답 제공
      result = {
        title: "지혜로운 인생의 멘토 🌟",
        description: "당신은 풍부한 인생 경험과 따뜻한 마음을 가진 분이십니다.",
        advice: "당신의 경험과 지혜를 주변 사람들과 나누어 주세요. 작은 관심과 배려가 큰 힘이 됩니다.",
        funFact: "당신 같은 분이 있어서 세상이 더 따뜻해집니다! 😊",
        recommendation: "오늘 가족이나 친구에게 안부 전화를 한 통 해보세요."
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-wisdom-advice function:', error);
    
    // 에러 시 기본 응답
    const fallbackResult = {
      title: "지혜로운 인생의 선배 🌅",
      description: "당신은 인생의 소중한 가치들을 잘 아시는 분입니다. 경험에서 우러나온 지혜가 빛나는 분이세요!",
      advice: "당신의 따뜻한 마음과 경험을 주변 사람들과 나누어 주세요. 건강도 챙기시고, 작은 행복들을 놓치지 마세요.",
      funFact: "인생의 진짜 보물은 돈이 아니라 사람과의 인연이라는 걸 아시는군요! 👏",
      recommendation: "오늘 하루는 평소보다 조금 더 여유롭게 보내보세요."
    };

    return new Response(JSON.stringify(fallbackResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});