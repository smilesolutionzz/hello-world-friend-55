import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { observations } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // 관찰 데이터를 분석용 텍스트로 변환
    const observationSummary = observations.map((obs: any, idx: number) => {
      const categories = Object.entries(obs.categoryScores || {})
        .map(([cat, score]) => `${cat}: ${score}점`)
        .join(", ");
      return `검사 ${idx + 1}: ${categories}`;
    }).join("\n");

    const systemPrompt = `당신은 심리 분석 전문가입니다. 사용자의 여러 검사 데이터를 분석하여 핵심 성격 특성을 파악해주세요.

분석 지침:
1. 점수 패턴에서 일관되게 높거나 낮은 영역을 찾아 성격 특성을 도출
2. 시간에 따른 변화 추이가 있다면 성장 방향성 파악
3. 각 영역 간 균형도를 고려하여 전반적 성격 유형 설명
4. 긍정적이고 건설적인 톤으로 작성
5. 3-4가지 핵심 특성만 간결하게 제시 (각 특성당 20-30자)`;

    const userPrompt = `다음은 사용자의 검사 기록입니다:\n\n${observationSummary}\n\n이 데이터를 바탕으로 사용자의 핵심 성격 특성 3-4가지를 분석해주세요.`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_personality",
              description: "사용자의 성격 특성을 분석하여 반환합니다.",
              parameters: {
                type: "object",
                properties: {
                  traits: {
                    type: "array",
                    description: "핵심 성격 특성 3-4개",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "특성 이름 (예: 감정 표현이 풍부함)" },
                        description: { type: "string", description: "특성 설명 (20-30자)" },
                        score: { type: "number", description: "특성 강도 (0-100)" }
                      },
                      required: ["title", "description", "score"],
                      additionalProperties: false
                    }
                  },
                  summary: {
                    type: "string",
                    description: "전반적인 성격 요약 (50-80자)"
                  }
                },
                required: ["traits", "summary"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_personality" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No personality analysis returned");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-personality error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
