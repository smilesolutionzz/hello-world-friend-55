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
    const { result } = await req.json();
    console.log('Analyzing attachment result:', result);

    const prompt = `다음은 사용자의 애착 유형 검사 결과입니다. 전문적이고 따뜻하게 심층 분석해주세요.

주요 애착 유형: ${result.dominantStyle} (${result.styleInfo.name})
주요 유형 점수: ${result.dominantScore.toFixed(1)}/5.0
총점: ${result.totalScore.toFixed(0)}점
평균 점수: ${result.averageScore.toFixed(1)}점

모든 애착 유형 점수:
${result.averageScores.map((s: any) => `- ${s.category}: ${s.average.toFixed(1)}/5.0`).join('\n')}

다음 내용을 포함해서 분석해주세요:

1. **애착 유형 심층 분석** (200-250자)
   - 현재 애착 유형이 일상 관계에 미치는 영향
   - 이 유형의 장점과 어려움
   - 구체적인 관계 패턴 예시

2. **다른 애착 유형과의 관계** (150-200자)
   - 점수가 높은 다른 유형들의 영향
   - 복합적인 애착 패턴의 의미
   - 상황에 따른 유형 변화 가능성

3. **성장을 위한 구체적 조언** (200-250자)
   - 더 안정적인 애착으로 발전하는 방법
   - 일상에서 실천할 수 있는 구체적인 행동
   - 자기 이해를 돕는 질문들

전문적이면서도 따뜻하고 희망적인 톤으로 작성해주세요.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: '당신은 애착 이론 전문가이자 따뜻한 심리 상담사입니다. 사용자의 애착 유형 결과를 깊이 있고 구체적으로 분석하여 성장을 돕는 조언을 제공합니다.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('Analysis completed successfully');

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in attachment-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      analysis: '분석 중 오류가 발생했습니다. 나중에 다시 시도해주세요.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
