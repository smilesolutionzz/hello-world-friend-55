import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

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

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 시스템 프롬프트
    const systemPrompt = `당신은 AIH(AI Human) 에이전트입니다. 사용자의 질문과 문제를 친근하고 전문적으로 도와주는 AI 어시스턴트입니다.

다음과 같은 역할을 수행해주세요:
- 사용자의 질문에 명확하고 도움이 되는 답변 제공
- 복잡한 문제를 단계별로 해결하도록 안내
- 필요시 구체적인 예시나 방법 제시
- 친근하면서도 전문적인 톤으로 대화

항상 한국어로 답변하며, 간결하면서도 유익한 정보를 제공해주세요.`;

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
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 1000,
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
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});