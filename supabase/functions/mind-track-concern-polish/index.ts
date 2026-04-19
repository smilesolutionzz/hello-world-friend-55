import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { concern } = await req.json();

    if (!concern || typeof concern !== "string" || concern.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "다듬을 내용을 조금 더 적어주세요." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `당신은 사용자가 자신의 고민을 잘 표현할 수 있도록 돕는 따뜻한 한국인 글 코치입니다.

[역할]
- 사용자가 적은 짧고 거친 메모/단어를 자연스러운 한국어 고민 문장으로 다듬어주세요.
- 의미를 절대 바꾸지 말고, 사용자의 감정과 맥락을 그대로 살려서 1~3문장으로 정리합니다.
- 사용자가 직접 적은 듯한 1인칭 자연체로 작성합니다 (예: "~해요", "~인 것 같아요").
- 의료적·진단적 표현 금지. 과장 금지.
- 새로운 정보를 추가하거나 추측하지 마세요. 부족한 부분은 자연스럽게 흘려두세요.

[출력 형식]
오직 다듬어진 고민 문장만 출력합니다. 따옴표·머리말·설명 없이 본문만 반환하세요.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `다음 메모를 자연스러운 고민 문장으로 다듬어주세요:\n\n"${concern.trim()}"` },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "요청이 많아요. 잠시 후 다시 시도해주세요." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI 사용량이 소진되었습니다." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let polished = (data.choices?.[0]?.message?.content || "").trim();
    // 따옴표 제거
    polished = polished.replace(/^["'「『]+|["'」』]+$/g, "").trim();

    if (!polished) throw new Error("다듬기 결과를 받지 못했습니다.");

    return new Response(JSON.stringify({ polished }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("mind-track-concern-polish error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
