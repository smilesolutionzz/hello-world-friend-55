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

    const systemPrompt = `당신은 사용자가 자신의 고민을 풍부하게 표현할 수 있도록 돕는 따뜻한 한국인 글 코치입니다.

[역할]
- 사용자가 적은 짧고 거친 메모/단어/문장을 더 풍부하고 구체적인 한국어 고민 글로 확장해주세요.
- 의미와 감정의 방향은 절대 바꾸지 말고, 사용자의 맥락을 그대로 살리되 자연스럽게 살을 붙입니다.
- 분량: 4~7문장, 약 250~450자 사이로 충분히 풍성하게 작성합니다.
- 1인칭 자연체("~해요", "~인 것 같아요")로 사용자가 직접 적은 듯한 톤을 유지합니다.
- 자연스럽게 덧붙일 수 있는 요소: 그 고민이 일상에 어떻게 영향을 주는지, 어떤 순간에 가장 힘든지, 어떤 마음 상태가 동반되는지.
- 의료적·진단적 표현 금지. 위로/공감/조언 금지. 사용자가 말하지 않은 구체적 사건·관계·원인을 새로 만들어내지 마세요.
- 부족한 부분은 "~한 느낌이 들어요", "~한 것 같아요" 같이 부드럽게 흘려두세요.

[출력 형식]
오직 다듬어진 고민 본문만 출력합니다. 따옴표·머리말·설명·번호 없이 본문만 반환하세요. 줄바꿈은 1~2회 이내로 자연스럽게.
[금지] HTML 태그(<b>, </b>, <br> 등), 마크다운 기호(**, __, \`, ~~), 이모지, 영문 라벨을 절대 포함하지 마세요. 순수 한국어 평문만 출력합니다.`;

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
            { role: "user", content: `다음 메모를 더 풍부하고 구체적인 한국어 고민 글(4~7문장, 250~450자)로 확장해주세요. 의미는 그대로 두고, 일상에 미치는 영향이나 동반되는 마음 상태를 자연스럽게 덧붙여 주세요:\n\n"${concern.trim()}"` },
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
    // HTML/마크다운 잔여물 제거 + 따옴표 제거
    polished = polished
      .replace(/<\/?[a-zA-Z][^>]*>/g, "")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/[*_`~]+/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/^["'「『]+|["'」』]+$/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

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
