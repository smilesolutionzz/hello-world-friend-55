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
    const { observationContent, previousAnswers = [] } = await req.json();
    console.log('Generating questions for observation:', observationContent.substring(0, 100));

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const previousContext = previousAnswers.length > 0 
      ? `\n\n이전 질문-답변:\n${previousAnswers.map((qa: any, i: number) => 
          `Q${i+1}: ${qa.question}\nA${i+1}: ${qa.answer}`
        ).join('\n\n')}`
      : '';

    const prompt = `당신은 아동 발달 전문가입니다. 다음 관찰일지를 읽고 더 정확한 분석을 위해 필요한 추가 질문 3개를 생성하세요.

관찰 내용:
${observationContent}${previousContext}

요구사항:
- 구체적이고 관찰 가능한 행동에 대해 질문하세요
- 상황의 맥락을 파악하는 질문을 하세요
- 부모가 쉽게 답변할 수 있는 질문이어야 합니다
- 이미 답변된 내용은 다시 묻지 마세요`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-preview',
        messages: [
          { role: 'system', content: '당신은 아동 발달 전문가로서 관찰일지 분석을 돕는 AI입니다.' },
          { role: 'user', content: prompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_questions',
              description: '관찰일지 분석을 위한 추가 질문 생성',
              parameters: {
                type: 'object',
                properties: {
                  questions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        question: { type: 'string', description: '질문 내용' },
                        category: { 
                          type: 'string', 
                          enum: ['상황', '행동', '감정', '빈도', '맥락'],
                          description: '질문 카테고리'
                        }
                      },
                      required: ['question', 'category'],
                      additionalProperties: false
                    },
                    minItems: 3,
                    maxItems: 3
                  }
                },
                required: ['questions'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_questions' } }
      }),
    });

    console.log('Questions API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Questions API error:', response.status, errorText);
      
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
    console.log('Questions response:', JSON.stringify(data));

    const toolCall = data.choices[0].message.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in response');
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log('Generated questions:', result.questions.length);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to generate questions' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
