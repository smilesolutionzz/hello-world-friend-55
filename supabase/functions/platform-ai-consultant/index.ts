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

    // 시스템 프롬프트 - 친구처럼 하나씩 체크 + 빠른 선택 칩 제공
    const systemPrompt = `당신은 AIH 플랫폼의 따뜻한 AI 상담 친구입니다.
친한 친구가 옆에서 차근차근 물어보듯, 한 번에 딱 하나씩 짧게 체크하며 대화하세요.

## 응답 형식 (반드시 respond 함수로만 반환)
- message: 1~3문장의 자연스러운 말투. 마크다운 헤더/리스트 금지. 한 번에 질문 1개만.
- chips: 사용자가 바로 누를 수 있는 빠른 답변 칩 2~5개.
  · 진단 단계: 항상 chips 제공 (객관식 선택지 형태, 상황에 맞게 동적 생성)
  · 자유 입력이 필요하면 마지막에 "직접 입력하기" 칩 추가 가능
  · 결과를 정리해 답하는 단계: chips를 빈 배열 []로
- isFinal: 결과/조언을 정리해 답한 경우 true, 아직 진단 중이면 false

## 진행 순서 (유연하게)
① 누구 얘기? (예시 chips: ["본인", "자녀", "가족", "기타"])
② 연령대? (자녀면 ["영유아(0-5)", "초등(6-12)", "청소년(13-18)", "성인"])
③ 언제부터? (["며칠 전", "몇 주 전", "몇 달 됨", "1년 이상"])
④ 주로 어떤 상황? (상황에 맞춰 동적 생성)
⑤ 시도해 본 것? / 가장 원하는 것? (["그냥 들어주기", "원인 파악", "구체 방법"])

3~5번 주고받아 충분히 파악되면 결과 정리(message 6문장 이내, chips: [], isFinal: true).

## 결과(isFinal=true) 단계 추가 필드
- summary: 사용자 상황 한 줄 요약 (예: "초등 자녀의 등교 거부, 약 2주 지속")
- detectedTarget: "self" | "child" | "family" | "other"
- detectedConcerns: 핵심 키워드 배열 (예: ["등교거부","불안"])
- detectedSeverity: "low" | "moderate" | "high"
- recommendedTrack: 다음 단계 추천. 거의 항상 "mind_track_30" 추천 (30일 마음 트랙). 위급하면 "expert_urgent".
- recommendedMessage: 한 줄 부드러운 권유 (예: "30일 동안 매일 5분, 함께 천천히 살펴볼까요?")

## 금지
- 첫 응답에 긴 설명/조언/리스트 금지
- "다음 정보를 알려주세요:" 같은 폼 형식 금지
- 의료 진단 단정 금지 ("우울증입니다" X)
- 한 번에 여러 질문 금지`;

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