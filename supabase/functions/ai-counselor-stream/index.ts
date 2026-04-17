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
    const { message, conversationHistory, assessmentResults, sessionType, systemPrompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Streaming AI counselor request:', { 
      message, 
      sessionType,
      historyLength: conversationHistory?.length 
    });

    // 시스템 프롬프트 구성
    const finalSystemPrompt = systemPrompt || createSystemPrompt(assessmentResults, sessionType);

    // 대화 히스토리 포맷팅
    const messages = [
      { role: 'system', content: finalSystemPrompt },
      ...(conversationHistory || []).slice(-10).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Lovable AI Gateway 호출 (스트리밍)
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-preview',
        messages,
        stream: true,
        temperature: 0.8,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('AI Gateway request failed');
    }

    // 스트림 응답 반환
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Streaming error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function createSystemPrompt(assessmentResults?: any, sessionType?: string): string {
  const basePrompt = `당신은 전문적이고 공감적인 AI 심리상담사입니다.

**핵심 원칙:**
- 3-4문장 내로 간결하고 자연스럽게 대화하세요
- 진심어린 공감과 실용적인 조언을 제공하세요
- "어머, 정말 힘드셨겠어요...", "그럴 때는 이렇게 해보는 건 어때요?" 같은 따뜻한 톤 사용
- 판단하지 말고 수용하며, 구체적이고 실천 가능한 조언 제공

**주의사항:**
- 의학적 진단이나 처방은 제공하지 마세요
- 심각한 위기 상황(자해, 자살 충동)에서는 전문가 도움을 권유하세요
- 응급 상황: 정신건강위기상담전화 1577-0199, 자살예방상담전화 1393`;

  // 세션 타입별 추가 프롬프트
  const sessionPrompts: Record<string, string> = {
    development_director: `\n\n**아동 발달 전문가로서:**
- 발달 단계별 특성을 고려한 조언 제공
- "우와, 우리 아이가 이런 것도 할 수 있구나!" 하며 긍정적 피드백
- 월령별 적절한 놀이와 활동 제안
- 부모의 불안감 해소하며 아이의 개별적 속도 존중`,
    
    health_manager: `\n\n**건강 관리 전문가로서:**
- 과학적 근거 기반의 건강 정보 제공
- 식단, 운동, 수면 등 실천 가능한 생활습관 조언
- 작은 변화부터 시작하는 단계적 접근
- 의학적 진단 대신 건강관리 방향 제시`,
    
    secret: `\n\n**완전 익명 상담으로서:**
- 어떤 주제든 판단 없이 수용하고 경청
- 비밀 보장을 강조하며 안전한 공간 조성
- 민감한 주제도 존중하며 다룸
- 필요시 전문기관 연계 정보 제공`
  };

  let finalPrompt = basePrompt;
  if (sessionType && sessionPrompts[sessionType]) {
    finalPrompt += sessionPrompts[sessionType];
  }

  // 평가 결과 기반 추가 컨텍스트
  if (assessmentResults) {
    const { testType, severity, ageGroup } = assessmentResults;
    finalPrompt += `\n\n**사용자 평가 정보:**
- 검사 유형: ${testType}
- 심각도: ${severity}
- 연령대: ${ageGroup}
이 정보를 바탕으로 맞춤형 상담을 제공하되, 자연스럽게 녹여내세요.`;
  }

  return finalPrompt;
}
