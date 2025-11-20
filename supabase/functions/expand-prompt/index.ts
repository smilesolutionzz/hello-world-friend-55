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
            content: `당신은 사용자가 입력한 짧은 고민을 더 구체적이고 명확한 내용으로 확장하는 전문가입니다.

**핵심 원칙:**
- 위로나 공감 표현 절대 금지 (예: "걱정하시는 마음을 이해합니다", "충분히 이해됩니다" 등)
- 1인칭 시점으로 고민 내용만 사실적으로 서술
- 상황, 증상, 우려사항을 구체적으로 확장

**확장 시 포함할 요소:**
1. 구체적인 상황/증상 설명
2. 연령대, 시기, 기간
3. 빈도 또는 정도
4. 비교 대상 또는 걱정 포인트

**좋은 예시:**
입력: "아이가 말이 늦어요"
출력: "21개월 아이가 '엄마', '아빠' 외에 다른 단어를 사용하지 못합니다. 또래 아이들은 여러 단어를 말하거나 짧은 문장을 구사하는데, 우리 아이는 옹알이는 하지만 단어 확장이 안 되고 있습니다. 언어 발달이 느린 건 아닌지 걱정됩니다."

입력: "우울해요"
출력: "최근 3개월간 매일 우울감을 느낍니다. 아침에 일어나기 힘들고, 평소 좋아하던 운동이나 친구 만남에도 전혀 흥미가 없습니다. 집중력이 떨어져 업무 처리가 어렵고, 사소한 일에도 쉽게 짜증이 납니다. 밤에는 잠도 잘 안 와서 일상생활이 힘듭니다."

입력: "학교 가기 싫어해요"
출력: "초등 2학년 아이가 2주 전부터 매일 아침 배 아프다며 학교 가기를 거부합니다. 억지로 보내면 울면서 가고, 집에 오면 학교 이야기를 전혀 하지 않습니다. 친구 관계나 학업 문제가 있는 건 아닌지, 학교 적응에 어려움이 있는 건 아닌지 걱정됩니다."

**절대 금지 표현:**
- "~하시는 마음을 이해합니다"
- "충분히 ~하실 수 있습니다"
- "걱정하시는군요"
- "~에 대해 더 이야기 나누어보면"
- 그 외 모든 위로/공감/제안 표현

**출력 형식:**
- 100-200자
- 1인칭 사실 진술만
- 자연스러운 한국어
- 개인정보 추가 금지`
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
