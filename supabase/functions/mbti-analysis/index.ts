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
    const { mbtiType, answers } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY가 설정되지 않았습니다');
    }

    // MBTI 타입별 특성
    const typeCharacteristics: Record<string, string> = {
      'INTJ': '전략적이고 독립적인 사고',
      'INTP': '논리적이고 창의적인 분석',
      'ENTJ': '리더십과 결단력',
      'ENTP': '혁신적이고 논쟁을 즐기는 성향',
      'INFJ': '통찰력과 이상주의',
      'INFP': '감수성과 창의성',
      'ENFJ': '카리스마와 공감 능력',
      'ENFP': '열정과 창의성',
      'ISTJ': '책임감과 체계성',
      'ISFJ': '헌신과 세심함',
      'ESTJ': '조직력과 실용성',
      'ESFJ': '친절과 협조성',
      'ISTP': '실용적 문제해결',
      'ISFP': '예술적 감각과 유연성',
      'ESTP': '행동력과 현실성',
      'ESFP': '사교성과 즐거움'
    };

    const systemPrompt = `당신은 MBTI 전문가입니다. 사용자의 MBTI 타입(${mbtiType})과 테스트 답변을 바탕으로 심층적이고 개인화된 성격 분석을 제공하세요.

분석 포인트:
1. ${typeCharacteristics[mbtiType]}의 특성이 어떻게 나타나는지
2. 일상생활에서의 구체적인 행동 패턴
3. 대인관계에서의 특징
4. 성장을 위한 실질적인 조언
5. 숨겨진 강점과 잠재력

답변은 친근하고 공감적인 톤으로, 200-300자 정도로 작성해주세요.`;

    const userPrompt = `MBTI 타입: ${mbtiType}\n답변 패턴: ${JSON.stringify(answers)}\n\n이 사람의 성격을 심층적으로 분석해주세요.`;

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
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'AI 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
            analysis: `${mbtiType} 타입인 당신은 ${typeCharacteristics[mbtiType]} 특성을 가지고 있습니다. 테스트 결과를 바탕으로 볼 때, 당신만의 독특한 강점과 매력이 있습니다.`
          }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'AI 분석 크레딧이 부족합니다.',
            analysis: `${mbtiType} 타입인 당신은 ${typeCharacteristics[mbtiType]} 특성을 가지고 있습니다.`
          }),
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      throw new Error(`AI API 오류: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || 
      `${mbtiType} 타입인 당신은 ${typeCharacteristics[mbtiType]} 특성을 가지고 있습니다.`;

    return new Response(
      JSON.stringify({ analysis }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('MBTI 분석 오류:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        analysis: '분석 중 오류가 발생했습니다. 기본 결과를 확인해주세요.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
