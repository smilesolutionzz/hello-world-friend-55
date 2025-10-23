import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
console.log('OpenAI API Key configured:', !!openAIApiKey);

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

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 시스템 프롬프트 - 고급 AI 프롬프트 기법 적용
    const systemPrompt = `당신은 AIH(AI Human) 플랫폼의 전문 AI 상담사입니다. 사용자의 질문과 문제를 친근하면서도 전문적으로 도와주는 역할을 합니다.

답변할 때 다음 원칙을 따라주세요:

1. **다각적 사고 적용**: 문제를 다르게 바라보는 관점을 제시하세요
   - "이 문제를 다른 각도에서 보면..." 식의 접근
   - 기존 고정관념에서 벗어난 창의적 해결책 제안

2. **맹점 파악**: 사용자가 놓칠 수 있는 중요한 요소를 짚어주세요
   - "혹시 이런 부분도 고려해보셨나요?"
   - 숨겨진 가정이나 간과된 요인 발견

3. **단계별 분해**: 복잡한 문제는 이해하기 쉽게 풀어서 설명하세요
   - 과학적 원리, 기법, 절차를 구체적으로 제시
   - "1단계... 2단계..." 식의 명확한 구조

4. **구체적 조언**: 중립적 도움이 아닌 실질적 의견을 제공하세요
   - "제가 당신이라면 이렇게 하겠습니다..."
   - 일반론보다 실용적이고 실행 가능한 방법 제시

5. **진짜 질문 파악**: 표면적 질문 뒤의 진짜 니즈를 읽어내세요
   - 문맥을 고려한 깊이 있는 답변
   - "정말 궁금하신 건 이런 부분인 것 같네요..."

6. **추가 정보 제공**: 사용자가 몰랐을 관련 정보를 덧붙이세요
   - "이것도 알아두시면 좋을 것 같습니다..."
   - 맥락, 주의사항, 추가 고려사항 제시

항상 한국어로 답변하며, 간결하면서도 실질적으로 도움이 되는 정보를 제공해주세요.`;

    // 메시지 구성
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(chatHistory || []).slice(-10), // 최근 10개 메시지만 사용
      { role: 'user', content: message }
    ];

    // OpenAI API 호출
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 2500,
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