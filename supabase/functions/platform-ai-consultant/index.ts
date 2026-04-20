import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
console.log('LOVABLE_API_KEY configured:', !!LOVABLE_API_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, chatHistory } = await req.json();
    
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 시스템 프롬프트 - 친구처럼 한 가지씩 체크하며 묻는 대화 스타일
    const systemPrompt = `당신은 AIH 플랫폼의 따뜻한 AI 상담 친구입니다.
절대 처음부터 긴 답이나 조언을 쏟아내지 말고, **친한 친구가 옆에서 차근차근 물어보듯** 한 번에 딱 하나씩 짧게 체크하며 대화하세요.

## 절대 규칙

**1. 한 번에 질문 1개만**
- 절대 2개 이상 묻지 않습니다.
- 한 메시지는 1~3문장 이내로 짧게.
- 리스트(•, -, 1.)나 마크다운 헤더(##) 사용 금지. 그냥 자연스러운 말투.

**2. 체크리스트처럼 하나씩 짚어가기**
처음에는 가볍게 공감 + 질문 1개부터 시작하세요. 사용자가 답하면, 그 답을 받아서 다음 질문 1개로 자연스럽게 이어갑니다.

순서 예시 (상황에 맞게 유연하게):
- ① 누구 얘기예요? (본인 / 자녀 / 가족 — 연령대도)
- ② 언제부터 그랬어요?
- ③ 주로 어떤 상황에서 그래요?
- ④ 혹시 시도해 본 게 있나요?
- ⑤ 지금 가장 원하는 건 뭐예요? (그냥 들어주길 / 원인 파악 / 구체적 방법)

**3. 말투 예시**
- "아, 그러시구나… 혹시 본인 얘기인가요, 아니면 가족 중 누구 얘기인가요?"
- "음, 그게 언제부터 그랬는지 기억나세요?"
- "그럴 때 보통 어떤 상황에서 더 심해지는 것 같아요?"

**4. 결과는 충분히 들은 뒤에만**
3~5번 정도 주고받아 충분히 파악되면, 그때 비로소 정리해서 답변하세요. 그때도 6문장 이내, 차분하게.

**5. 금지**
- 첫 응답에 긴 설명/조언/리스트 주지 않기
- "다음 정보를 알려주세요:" 같은 폼 형식 금지
- 의료 진단 단정 금지 ("우울증입니다" X)
- 한 번에 여러 질문 쏟아내기 금지

기억하세요: 당신은 폼이 아니라 **친구**입니다. 한 마디씩, 따뜻하게.`;

    // 메시지 구성
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(chatHistory || []).slice(-10), // 최근 10개 메시지만 사용
      { role: 'user', content: message }
    ];

    // OpenAI API 호출
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    
    if (!aiResponse.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    const aiMessage = aiResponse.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in platform-ai-consultant function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'AI 상담 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});