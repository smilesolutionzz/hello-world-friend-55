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
      prompt = `당신은 아동 발달 전문가입니다. 다음 관찰일지를 분석하고 **한 문장**으로 핵심 조언을 제공하세요.

관찰 내용:
${observationContent}${answersContext}

요구사항:
- 반드시 한 문장으로 작성
- 가장 중요한 포인트 하나만 언급
- 구체적이고 실행 가능한 조언`;
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
        model: 'google/gemini-2.5-flash',
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
