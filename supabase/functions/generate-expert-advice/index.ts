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
    const { observationContent, answers = [], adviceType = 'summary' } = await req.json();
    console.log('Generating expert advice, type:', adviceType);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const answersContext = answers.length > 0 
      ? `\n\n추가 정보:\n${answers.map((qa: any, i: number) => 
          `Q: ${qa.question}\nA: ${qa.answer}`
        ).join('\n\n')}`
      : '';

    let prompt = '';
    
    if (adviceType === 'summary') {
      prompt = `당신은 아동 발달 전문가입니다. 다음 관찰일지를 분석하고 5개 섹션으로 구조화된 전문가 조언을 제공하세요.

관찰 내용:
${observationContent}${answersContext}

반드시 아래 5개 섹션으로 작성하세요 (각 섹션 100-150자):

## 1. 현재 발달 상태
(관찰된 행동에서 보이는 발달 수준과 특성을 구체적으로 분석)

## 2. 강점 및 긍정적 측면
(아이가 보여주는 강점과 잘하고 있는 부분을 격려와 함께 설명)

## 3. 주의 관찰 포인트
(앞으로 지켜봐야 할 부분이나 약간의 우려가 될 수 있는 점)

## 4. 구체적 실천 가이드
(부모님이 일상에서 바로 적용할 수 있는 2-3가지 구체적 활동이나 상호작용 방법)

## 5. 종합 권고사항
(전체적인 방향 제안과 필요시 전문가 상담 권고)`;
    } else {
      prompt = `당신은 아동 발달 전문가입니다. 다음 관찰일지를 종합적으로 분석하고 상세한 전문가 조언을 제공하세요.

관찰 내용:
${observationContent}${answersContext}

다음 항목들을 포함하여 상세한 분석을 제공하세요:
1. 전반적인 발달 상태 평가
2. 긍정적인 측면
3. 주의가 필요한 부분
4. 구체적인 양육 조언 (3-5개)
5. 필요시 전문가 상담 권고사항`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: '당신은 아동 발달 전문가로서 부모에게 실질적인 조언을 제공합니다.' },
          { role: 'user', content: prompt }
        ]
      }),
    });

    console.log('Expert advice API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Expert advice API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Payment required. Please add credits to continue.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const advice = data.choices[0].message.content;
    console.log('Generated advice length:', advice.length);

    return new Response(JSON.stringify({ advice }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating expert advice:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to generate expert advice' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
