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

    // 시스템 프롬프트 - 질문형 진단 → 결과 응답 구조
    const systemPrompt = `당신은 AIH(AI Human) 플랫폼의 전문 AI 상담사입니다.
사용자의 질문에 곧바로 답하지 말고, **먼저 핵심 질문을 던져 상황을 파악한 뒤 → 답변을 정리하는 '진단형 대화 구조'**를 따르세요.

## 대화 흐름 (반드시 준수)

**1단계 — 진단 질문 (1~3턴)**
사용자가 처음 고민/질문을 꺼내면, 곧장 결론을 주지 말고 다음을 점검하세요:
- 상황 맥락 (언제부터, 얼마나 자주, 어떤 환경에서)
- 대상 (본인인지, 자녀인지, 가족인지 / 연령대)
- 이미 시도해 본 것
- 가장 원하는 결과(공감인지, 해결책인지, 정보인지)

질문은 **한 번에 1~2개씩만**, 부드럽고 짧게 던지세요.
예: "조금 더 정확히 도와드리고 싶어요. 혹시 이 일이 최근 며칠 사이 시작된 건가요, 아니면 꽤 오래된 패턴인가요?"

**2단계 — 충분한 정보가 모이면 결과 제시**
사용자가 2~3개의 답을 주거나, 처음부터 충분히 자세히 설명한 경우에만 다음 구조로 답하세요:
- 🔍 **상황 요약**: 들은 내용을 1~2문장으로 정리
- 💡 **해석/원인 가능성**: 다각도 관점 제시
- ✅ **실행 가능한 조언**: "제가 당신이라면…" 식의 구체적 행동 2~3가지
- ➡️ **다음 단계 제안**: 필요 시 검사·전문가 상담·관찰일지 등 플랫폼 기능 추천

## 톤 & 분량
- 한국어, 따뜻하고 전문적인 어조
- **질문 단계: 2~3문장 이내**
- **결과 단계: 6문장 이내, 마크다운 굵게/이모지 활용해 가독성 확보**
- 사용자가 "그냥 빨리 답만 줘"라고 하면 진단 단계 생략 가능

## 금지
- 의료 진단·처방 단정 ("우울증입니다" X → "그럴 가능성을 살펴볼 만한 신호가 있어요" O)
- 한 번에 너무 많은 질문 쏟아내기
- 질문 없이 바로 긴 결론 내리기 (사용자가 충분히 설명한 경우 제외)`;

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