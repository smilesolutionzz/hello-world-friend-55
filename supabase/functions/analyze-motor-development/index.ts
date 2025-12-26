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
    const { results, answers, ageInMonths } = await req.json();
    
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const ageYears = Math.floor(ageInMonths / 12);
    const ageMonthsRemainder = ageInMonths % 12;

    const prompt = `
당신은 소아재활의학과 전문의이자 아동 운동발달 전문가입니다. 
아래 아동의 운동발달 자가체크 결과를 바탕으로 임상심리사 수준의 상세한 분석 리포트를 작성해주세요.

## 아동 정보
- 연령: ${ageYears}세 ${ageMonthsRemainder}개월

## 검사 결과
- 종합 점수: ${results.percentage}점 (100점 만점)
- 발달 수준: ${results.developmentLevel}
- 평가 문항 수: ${results.questionCount}개

## 영역별 점수 (100점 만점)
- 이동운동: ${results.categoryScores.locomotor}점
- 물체조작: ${results.categoryScores.object_control}점
- 균형감각: ${results.categoryScores.balance}점
- 협응력: ${results.categoryScores.coordination}점

## 강점 영역: ${results.strengths.join(', ') || '없음'}
## 지원필요 영역: ${results.weaknesses.join(', ') || '없음'}

---

위 결과를 바탕으로 다음 형식으로 500-800자의 상세 분석 리포트를 작성해주세요:

1. **종합 발달 평가**: 해당 연령 발달 기준과 비교한 종합 평가
2. **영역별 세부 분석**: 각 영역의 발달 수준과 특징
3. **발달적 의미**: 현재 결과가 아동의 전반적 발달에 미치는 영향
4. **구체적 활동 제안**: 가정에서 할 수 있는 놀이 활동 3-5가지
5. **전문가 상담 필요 여부**: 추가 평가나 상담이 필요한 경우 안내

따뜻하고 격려하는 톤으로, 부모님이 이해하기 쉽게 작성해주세요.
`;

    const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 소아재활의학 전문가이자 아동발달 전문 심리사입니다. 부모님께 아이의 운동발달 상태를 설명하고, 가정에서 할 수 있는 구체적인 활동을 제안합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable API Error:', errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || '';

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-motor-development:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        analysis: null 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
