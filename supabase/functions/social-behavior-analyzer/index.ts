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
    const { results, overallScore, answers, ageGroup, ageInMonths, birthDate } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const categoryLabels: Record<string, string> = {
      social_interaction: "사회적 상호작용",
      play_peer: "놀이 및 또래관계",
      communication: "의사소통",
      behavioral_patterns: "행동 패턴",
      sensory_response: "감각 반응"
    };

    const scoresDescription = Object.entries(results)
      .map(([category, score]) => `${categoryLabels[category] || category}: ${score}점`)
      .join('\n');

    const ageDescription = ageInMonths 
      ? `${Math.floor(ageInMonths / 12)}세 ${ageInMonths % 12}개월` 
      : '연령 정보 없음';

    const prompt = `당신은 아동 발달 전문가입니다. 부모가 작성한 '사회적 행동 발달 자가체크' 결과를 분석해주세요.

## 중요 안내
- 이것은 진단 도구가 아닌 부모 관찰 기반 자가점검입니다.
- 점수가 낮다고 해서 문제가 있다는 것을 의미하지 않습니다.
- 강점 중심으로 분석하되, 관찰이 필요한 부분도 부드럽게 안내해주세요.

## 아이 정보
- 연령: ${ageDescription}
- 연령 그룹: ${ageGroup}

## 영역별 점수 (100점 만점)
${scoresDescription}

## 종합 점수
${overallScore}점 / 100점

아래 5개 섹션으로 분석 결과를 작성해주세요. 각 섹션은 200-300자로 작성합니다:

## 1. 종합 소견 (summary)
아이의 전반적인 발달 특성을 따뜻하고 격려하는 톤으로 요약해주세요. 강점을 먼저 언급하고, 부모님의 관심과 노력을 칭찬해주세요.

## 2. 강점 영역 (strengths)
점수가 높은 영역을 중심으로 아이가 잘하고 있는 부분을 구체적으로 설명해주세요. 이 강점이 아이의 성장에 어떻게 도움이 되는지 설명합니다.

## 3. 관찰 포인트 (observations)
점수가 상대적으로 낮은 영역에 대해 부드럽게 안내해주세요. "문제"라고 표현하지 말고, "지켜봐야 할 부분" 또는 "지원하면 좋을 영역"으로 표현합니다. 부모가 일상에서 관찰할 수 있는 구체적인 포인트를 알려주세요.

## 4. 추천 활동 가이드 (activities)
아이의 발달을 지원하기 위해 일상에서 쉽게 할 수 있는 놀이나 활동 3-5가지를 추천해주세요. 각 활동이 어떤 발달 영역에 도움이 되는지 설명합니다.

## 5. 전문 상담 안내 (consultation)
전문가 상담이 필요한지 여부를 안내해주세요. 불안을 조장하지 않으면서도, 필요한 경우 적절한 전문가(소아청소년과, 발달센터 등)를 안내합니다. 대부분의 경우 "지속적인 관찰"로 충분함을 강조하되, 걱정되면 언제든 상담받을 수 있음을 안내합니다.

JSON 형식으로 응답해주세요:
{
  "summary": "종합 소견 내용",
  "strengths": "강점 영역 내용",
  "observations": "관찰 포인트 내용",
  "activities": "추천 활동 가이드 내용",
  "consultation": "전문 상담 안내 내용"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: '당신은 아동 발달 전문가입니다. 부모를 격려하고 아이의 강점을 찾아주는 따뜻한 관점으로 분석합니다. 진단이 아닌 자가체크임을 항상 명심하고, 불안을 조장하지 않습니다.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid response from OpenAI');
    }

    let analysis;
    try {
      const content = data.choices[0].message.content;
      // JSON 블록 추출
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      // Fallback
      analysis = {
        summary: "분석 결과를 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.",
        strengths: "강점 분석을 불러올 수 없습니다.",
        observations: "관찰 포인트를 불러올 수 없습니다.",
        activities: "활동 가이드를 불러올 수 없습니다.",
        consultation: "전문가 상담이 필요하시면 소아청소년과 또는 발달센터에 문의하세요."
      };
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        scores: results,
        overallScore 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in social-behavior-analyzer:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
