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
    const { prompt } = await req.json();

    if (!prompt || prompt.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: '최소 10자 이상 입력해주세요.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('프롬프트 확장 요청:', prompt);

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
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
          {
            role: 'system',
            content: `당신은 심리 상담 전문가입니다. 사용자의 간단한 고민을 더 구체적이고 상세한 형태로 확장해주세요.

확장 시 포함해야 할 요소:
- 구체적인 상황 설명
- 연령대 또는 시기
- 행동이나 증상의 빈도/지속기간
- 걱정되는 구체적인 점

예시:
입력: "아이가 말이 늦어요"
출력: "5세 아이가 또래에 비해 언어 발달이 느린 것 같아 걱정입니다. 단어는 몇 개 말하지만 문장으로 연결하지 못하고, 지난 6개월간 큰 진전이 없어 보입니다. 유치원 선생님께서도 또래보다 언어 표현이 부족하다고 하셔서 전문적인 평가가 필요한지 궁금합니다."

입력: "우울해요"
출력: "최근 3개월간 우울감이 지속되고 있습니다. 아침에 일어나기 힘들고, 평소 좋아하던 취미 활동에도 흥미가 없어졌습니다. 집중력도 떨어지고 자주 피곤함을 느끼며, 사소한 일에도 쉽게 짜증이 나고 있습니다. 이런 상태가 계속되어 일상생활에 지장이 있어 어떻게 해야 할지 고민입니다."

주의사항:
- 자연스러운 한국어로 작성
- 100-200자 사이로 확장
- 원본의 핵심 내용은 유지하되 구체성을 높임
- 개인정보는 절대 추가하지 않음
- 실제 사용자가 작성한 것처럼 자연스럽게`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('AI Gateway 오류:', data);
      throw new Error(data.error?.message || 'AI Gateway 호출 실패');
    }

    const expandedPrompt = data.choices[0].message.content.trim();

    console.log('확장된 프롬프트:', expandedPrompt);

    return new Response(
      JSON.stringify({ expandedPrompt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('프롬프트 확장 오류:', error);
    return new Response(
      JSON.stringify({ error: error.message || '프롬프트 확장 중 오류가 발생했습니다.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
