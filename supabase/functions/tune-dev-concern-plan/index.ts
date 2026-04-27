// Edge function: tune a 7-day plan for "child development concern"
// Takes a base template + user context, returns short tuned phrases per day.
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReqBody {
  childAgeMonths?: number | null;
  score: number; // 0-100
  riskLevel: "low" | "medium" | "high";
  topFactors: string[]; // top concern factor labels
  userContext?: string; // free-text "현재 가장 걱정되는 점"
  basePlan: { day: number; title: string; action: string }[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const body = (await req.json()) as ReqBody;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not set");

    // Truncate user context defensively
    const ctx = (body.userContext ?? "").slice(0, 500);
    const factors = (body.topFactors ?? []).slice(0, 5).join(", ");

    const systemPrompt = `당신은 한국의 발달심리 코치입니다. 의료 진단 표현은 절대 사용하지 마세요.
부모를 위로하면서 실천 가능한 한 줄 코칭 문구를 만듭니다. 반드시 한국어로 따뜻하고 구체적으로 작성하세요.
각 일자별로 'tunedAction' 필드 한 문장(최대 60자)만 반환하세요.`;

    const userPrompt = `아이 개월수: ${body.childAgeMonths ?? "미입력"}
발달 걱정도 점수(0~100): ${body.score} (위험도: ${body.riskLevel})
가장 영향이 큰 요인: ${factors || "정보 없음"}
부모가 직접 적은 걱정: ${ctx || "(없음)"}

아래는 7일 베이스 플랜입니다. 각 day의 action을 위 부모 상황에 맞게 자연스럽고 따뜻한 한 문장(60자 이내)으로 다듬어주세요.
${JSON.stringify(body.basePlan)}`;

    const resp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_tuned_plan",
                description: "Return tuned 7-day plan",
                parameters: {
                  type: "object",
                  properties: {
                    days: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          day: { type: "number" },
                          tunedAction: { type: "string" },
                        },
                        required: ["day", "tunedAction"],
                        additionalProperties: false,
                      },
                    },
                    interpretation: {
                      type: "string",
                      description:
                        "부모에게 위로가 되는 2~3문장 해석. 의료 진단 표현 금지.",
                    },
                  },
                  required: ["days", "interpretation"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "return_tuned_plan" },
          },
        }),
      }
    );

    if (resp.status === 429) {
      return new Response(
        JSON.stringify({
          error: "요청이 많아요. 잠시 후 다시 시도해주세요.",
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (resp.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI 사용 크레딧이 부족합니다." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall?.function?.arguments
      ? JSON.parse(toolCall.function.arguments)
      : { days: [], interpretation: "" };

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("tune-dev-concern-plan error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
