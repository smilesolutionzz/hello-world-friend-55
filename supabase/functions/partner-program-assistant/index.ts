import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { kind, idea, institutionName, institutionType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const isProgram = kind !== "product";

    const systemPrompt = `당신은 한국의 발달·심리·교육 협력기관의 운영 콘텐츠를 정돈해주는 카피라이터입니다.
기관명: ${institutionName ?? "(미상)"} / 유형: ${institutionType ?? "(미상)"}.
사용자가 짧게 적어준 아이디어를 바탕으로, 학부모가 보고 바로 신청·구매를 결정할 수 있는 ${isProgram ? "운영 프로그램" : "도서·굿즈"} 카드 정보를 생성하세요.
규칙:
- 모든 텍스트는 한국어, 자연스러운 전문가 톤.
- 과장된 의료·치료 단언 금지(예: "완치", "진단"). 코칭/지원 표현 사용.
- 가격은 입력에 명시되어 있을 때만 정수 KRW로, 없으면 null.
- 제목은 25자 이내, 설명은 2~3문장 (총 200자 이내).`;

    const programTool = {
      type: "function",
      function: {
        name: "draft_program",
        description: "Draft a partner program card.",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string" },
            category: { type: "string", description: "예: ABA, 언어치료, 부모교육" },
            target_age: { type: "string", description: "예: 만 3~7세" },
            duration_text: { type: "string", description: "예: 주 1회 50분, 8주 과정" },
            price_krw: { type: ["integer", "null"] },
            cta_label: { type: "string", description: "신청 버튼 문구, 8자 이내" },
            description: { type: "string" },
          },
          required: ["title", "category", "target_age", "duration_text", "cta_label", "description"],
          additionalProperties: false,
        },
      },
    };

    const productTool = {
      type: "function",
      function: {
        name: "draft_product",
        description: "Draft a partner book/goods card.",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string" },
            kind: { type: "string", enum: ["book", "kit", "goods"] },
            author: { type: "string", description: "저자 또는 브랜드명" },
            price_krw: { type: ["integer", "null"] },
            description: { type: "string" },
          },
          required: ["title", "kind", "author", "description"],
          additionalProperties: false,
        },
      },
    };

    const tool = isProgram ? programTool : productTool;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `아이디어: ${idea ?? ""}` },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: tool.function.name } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "요청이 많습니다. 잠시 후 다시 시도해 주세요." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI 크레딧이 부족합니다. 관리자에게 문의해 주세요." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI 요청 실패");
    }

    const data = await response.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = call ? JSON.parse(call.function.arguments) : {};

    return new Response(JSON.stringify({ draft: args }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("partner-program-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
