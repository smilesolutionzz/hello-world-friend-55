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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { text, context } = await req.json();
    
    if (!text || text.trim().length < 10) {
      return new Response(
        JSON.stringify({ 
          questions: [],
          severity: 'low',
          needsMoreInfo: false 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Analyzing observation text:', text);

    const systemPrompt = `당신은 아동 발달 전문가입니다. 부모가 작성 중인 관찰일지를 실시간으로 분석하고, 더 정확한 분석을 위해 필요한 추가 질문을 제안하세요.

응답 형식:
{
  "questions": ["질문1", "질문2", "질문3"],
  "severity": "low|medium|high",
  "concerns": ["우려사항1", "우려사항2"],
  "needsMoreInfo": true|false,
  "insight": "간단한 인사이트 (1-2문장)"
}

규칙:
- 질문은 3-5개, 구체적이고 답변 가능하게
- severity는 내용의 심각도
- needsMoreInfo는 추가 정보가 필요한지 여부
- insight는 현재까지 입력된 내용에 대한 간단한 피드백`;

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
          { role: 'user', content: `작성 중인 관찰: ${text}\n\n맥락: ${context || '없음'}` }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Insufficient credits. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('AI analysis failed');
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    console.log('Analysis result:', analysis);

    return new Response(
      JSON.stringify(analysis),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in realtime-observation-analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
