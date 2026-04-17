import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, messages, institutionData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // 리포트 생성 모드
    if (type === "generate_report") {
      const reportPrompt = `다음 기관 정보를 바탕으로 종합 마케팅 전략 리포트를 작성해주세요.

기관 정보:
${JSON.stringify(institutionData, null, 2)}

다음 구조로 상세한 리포트를 작성해주세요:

# 1. 기관 현황 분석
- 강점(Strengths)
- 약점(Weaknesses)
- 기회(Opportunities)
- 위협(Threats)

# 2. 타겟 고객 분석
- 주요 타겟층 정의
- 고객 페르소나 3가지
- 고객 니즈 분석

# 3. 마케팅 전략
- 핵심 메시지 및 포지셔닝
- 채널별 전략 (온라인/오프라인)
- 콘텐츠 마케팅 전략

# 4. 실행 계획
- 3개월 단기 실행 계획
- 6개월 중기 실행 계획
- 예상 예산 배분

# 5. 성과 측정
- 주요 KPI 설정
- 측정 방법 및 도구
- 개선 방안

각 섹션은 구체적이고 실행 가능한 내용으로 작성해주세요.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "user", content: reportPrompt }
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "크레딧이 부족합니다. 워크스페이스에 크레딧을 추가해주세요." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw new Error("AI 요청 실패");
      }

      const data = await response.json();
      const report = data.choices[0].message.content;

      return new Response(
        JSON.stringify({ report }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 채팅 모드 (스트리밍)
    const systemPrompt = `당신은 기관의 마케팅 전략에 대한 추가 질문에 답변하는 AI 어시스턴트입니다.
    
${institutionData ? `현재 분석 중인 기관 정보:\n${JSON.stringify(institutionData, null, 2)}` : ""}

간결하고 명확하게 답변하며, 필요시 구체적인 예시나 실행 방안을 제시해주세요.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "크레딧이 부족합니다. 워크스페이스에 크레딧을 추가해주세요." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI 요청 중 오류가 발생했습니다." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Marketing AI assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
