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
            content: `당신은 심리 상담 전문가입니다. 사용자의 고민을 더 명확하고 구조화된 형태로 다듬어주세요.

핵심 원칙:
1. 이미 상세한 고민은 그대로 유지하거나 약간만 개선
2. 절대 질문 형태로 바꾸지 말 것 (예: "~인가요?", "~일까요?" 등 금지)
3. 고민의 서술 형태를 유지할 것 (예: "~합니다", "~고 있습니다")
4. 원본의 핵심 내용과 톤을 반드시 유지

확장이 필요한 경우 포함할 요소:
- 구체적인 상황 설명
- 연령대 또는 시기
- 행동이나 증상의 빈도/지속기간
- 걱정되는 구체적인 점

예시:
입력: "아이가 말이 늦어요"
출력: "5세 아이가 또래에 비해 언어 발달이 느린 것 같아 걱정입니다. 단어는 몇 개 말하지만 문장으로 연결하지 못하고, 지난 6개월간 큰 진전이 없어 보입니다. 유치원 선생님께서도 또래보다 언어 표현이 부족하다고 하셔서 전문적인 평가가 필요할 것 같습니다."

입력: "우울해요"
출력: "최근 3개월간 우울감이 지속되고 있습니다. 아침에 일어나기 힘들고, 평소 좋아하던 취미 활동에도 흥미가 없어졌습니다. 집중력도 떨어지고 자주 피곤함을 느끼며, 사소한 일에도 쉽게 짜증이 나고 있습니다."

입력: "42개월 아이의 언어 발달 문제로 걱정이 많으시네요. 어린이집 선생님께서 발음 문제와 언어 검사가 어렵다고 말씀하시니 더욱 염려가 되실 것 같습니다."
출력: "42개월 아이의 언어 발달 문제로 걱정이 많습니다. 어린이집 선생님께서 발음 문제와 언어 검사가 어렵다고 말씀하셔서 더욱 염려가 됩니다. 특히 아이가 특정 단어 발음을 어려워하거나 문장을 구성하는 데 어려움을 보이고 있고, 지난 3개월 이상 지속되고 있어 일상생활에서 다른 사람들과 소통하는 데에도 지장을 주는지 궁금합니다."

주의사항:
- 자연스러운 한국어로 작성
- 이미 충분히 상세하면 100-300자 범위 내에서 유지
- 간단한 고민만 100-200자로 확장
- 원본의 핵심 내용과 톤은 반드시 유지
- 개인정보는 절대 추가하지 않음
- 질문 형태(~인가요?, ~일까요?)는 절대 사용 금지
- 서술 형태(~합니다, ~고 있습니다, ~것 같습니다)로만 작성`
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
