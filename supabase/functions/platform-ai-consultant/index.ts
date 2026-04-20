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

    // 시스템 프롬프트 - 빠르게 파악하고 결과로 마무리
    const systemPrompt = `당신은 AIH 플랫폼의 따뜻한 AI 상담 친구입니다.
짧고 자연스럽게 대화하며, **최대한 빨리** 결과를 내드리세요.

## 핵심 규칙 (반드시 지킬 것)
1. **이미 받은 정보는 절대 다시 묻지 않습니다.** chatHistory를 꼼꼼히 읽고, 사용자가 이미 답한 항목(대상/연령/기간/상황 등)은 건너뛰세요.
2. **질문은 최대 2~3개까지만.** 3번째 사용자 답변(=총 6개 메시지) 이후에는 무조건 isFinal=true로 결과를 정리해 마무리합니다.
3. **한 번에 질문 1개**, 1~2문장으로 짧게.
4. 정보가 부족해도 추론으로 채우고 결과로 넘어가세요. 완벽한 정보를 모으려 하지 마세요.

## 응답 형식 (respond 함수로만 반환)
- message: 1~2문장의 자연스러운 말투. 마크다운 금지.
- chips: 진단 중이면 2~4개 객관식 칩, 결과 단계면 빈 배열 [].
- isFinal: 결과 정리 단계면 true, 진단 중이면 false.

## 진행 가이드 (이미 답한 건 스킵)
1턴: 누구 얘기? (본인/자녀/가족) — 이미 알면 스킵
2턴: 핵심 상황 한 가지 (예: 어떤 점이 가장 힘드세요?)
3턴 이후: **반드시 결과 마무리** (isFinal=true)

## 결과(isFinal=true) 단계 필드
- summary: 한 줄 요약 (예: "초등 자녀의 등교 거부, 약 2주 지속")
- detectedTarget: "self" | "child" | "family" | "other"
- detectedConcerns: 핵심 키워드 배열
- detectedSeverity: "low" | "moderate" | "high"
- recommendedTrack: 거의 항상 "mind_track_30". 위급하면 "expert_urgent".
- recommendedMessage: 한 줄 부드러운 권유

## 금지
- 같은 질문 반복 금지 (가장 중요!)
- "다음 정보를 알려주세요" 같은 폼 형식 금지
- 의료 진단 단정 금지
- 4턴 이상 끌지 말 것 — 빨리 결과로 마무리`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(chatHistory || []).slice(-10),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        max_tokens: 600,
        temperature: 0.7,
        tools: [{
          type: 'function',
          function: {
            name: 'respond',
            description: '사용자에게 보낼 짧은 응답과 빠른 선택 칩을 반환',
            parameters: {
              type: 'object',
              properties: {
                message: { type: 'string', description: '1~3문장의 짧은 응답 또는 결과 정리(6문장 이내)' },
                chips: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '빠른 답변 칩 0~5개. 진단 중이면 2~5개, 결과 단계면 빈 배열.'
                },
                isFinal: { type: 'boolean', description: '결과/조언 단계면 true' },
                summary: { type: 'string', description: 'isFinal=true일 때만. 사용자 상황 한 줄 요약' },
                detectedTarget: { type: 'string', description: 'self|child|family|other' },
                detectedConcerns: { type: 'array', items: { type: 'string' } },
                detectedSeverity: { type: 'string', description: 'low|moderate|high' },
                recommendedTrack: { type: 'string', description: 'mind_track_30 | expert_urgent | none' },
                recommendedMessage: { type: 'string' }
              },
              required: ['message', 'chips', 'isFinal'],
              additionalProperties: false,
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'respond' } },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('AI gateway error:', response.status, errorData);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: '요청이 많아요. 잠시 후 다시 시도해주세요.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI 크레딧이 부족합니다.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    let parsed: any = { message: '', chips: [], isFinal: false };

    if (toolCall?.function?.arguments) {
      try {
        parsed = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error('Failed to parse tool args:', e);
      }
    }
    if (!parsed.message) {
      parsed.message = aiResponse.choices?.[0]?.message?.content || '죄송해요, 다시 한 번 말씀해주실래요?';
    }

    const routeMap: Record<string, string> = {
      mind_track_30: '/mind-track',
      expert_urgent: '/expert-hiring?urgent=true',
    };
    const recommendedRoute = parsed.recommendedTrack ? (routeMap[parsed.recommendedTrack] || null) : null;

    return new Response(
      JSON.stringify({
        response: parsed.message,
        chips: Array.isArray(parsed.chips) ? parsed.chips.slice(0, 5) : [],
        isFinal: !!parsed.isFinal,
        summary: parsed.summary || null,
        detectedTarget: parsed.detectedTarget || null,
        detectedConcerns: Array.isArray(parsed.detectedConcerns) ? parsed.detectedConcerns : null,
        detectedSeverity: parsed.detectedSeverity || null,
        recommendedTrack: parsed.recommendedTrack || null,
        recommendedRoute,
        recommendedMessage: parsed.recommendedMessage || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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