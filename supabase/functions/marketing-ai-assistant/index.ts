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
    const { messages, institutionData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // 기관 데이터를 기반으로 한 시스템 프롬프트
    const systemPrompt = `당신은 기관 데이터를 분석하여 마케팅 전략을 제안하는 전문 AI 어시스턴트입니다.

당신의 역할:
1. 기관의 데이터와 특성을 깊이 분석합니다
2. 데이터 기반의 구체적이고 실행 가능한 마케팅 전략을 제안합니다
3. 타겟 고객층 분석 및 세분화를 지원합니다
4. 마케팅 채널별 전략과 예산 배분을 제안합니다
5. 측정 가능한 KPI와 성과 지표를 설정합니다

분석 영역:
- 기관 현황 분석 (강점, 약점, 기회, 위협)
- 경쟁사 분석 및 차별화 포인트
- 타겟 고객 페르소나 설정
- 마케팅 채널 전략 (온라인/오프라인)
- 콘텐츠 마케팅 전략
- 예산 최적화 방안
- 성과 측정 및 개선 방안

답변 스타일:
- 전문적이면서도 이해하기 쉽게
- 데이터와 근거를 기반으로
- 구체적이고 실행 가능한 제안
- 단계별 실행 계획 포함
- 한국어로 친절하게 답변

${institutionData ? `\n현재 분석 중인 기관 정보:\n${JSON.stringify(institutionData, null, 2)}` : ""}`;

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
