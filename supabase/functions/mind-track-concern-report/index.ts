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
    const { concern, goal } = await req.json();

    if (!concern || typeof concern !== "string" || concern.trim().length < 5) {
      return new Response(
        JSON.stringify({ error: "고민을 5자 이상 입력해주세요." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `당신은 따뜻하고 신뢰감 있는 한국인 마음 코치입니다.
사용자의 고민을 듣고 '간단 진단 리포트'를 작성합니다.

[엄격한 작성 규칙]
- '진단', '치료', '환자', '병', '장애' 같은 의료 표현 금지
- 'Calm', 'Noom', 'Wysa', 'CBT', 'DSM', 'RCI' 등 외부 브랜드/학계 약어 금지
- 영어 인명·논문 인용 금지
- 따뜻하고 구체적인 한국어 표현 사용
- 톤: 친구 같은 전문가 (격려 + 통찰)

[반드시 아래 JSON 형식으로만 응답]
{
  "summary": "고민의 핵심을 2~3문장으로 따뜻하게 요약",
  "rootCauses": ["가능성 있는 원인 1", "원인 2", "원인 3"],
  "currentState": {
    "stress": 70,
    "energy": 35,
    "clarity": 45
  },
  "quickActions": [
    "오늘 당장 5분이면 할 수 있는 행동 1",
    "행동 2",
    "행동 3"
  ],
  "trackRecommendation": {
    "matchedGoal": "sleep | stress | mood | focus | relationship | self 중 1개",
    "reason": "왜 30일 트랙이 이 고민에 맞는지 2~3문장",
    "expectedChange": "30일 후 기대되는 변화를 구체적으로 2문장"
  }
}

currentState 점수는 0~100. 고민의 무게에 따라 stress 높게, energy/clarity 낮게.`;

    const userPrompt = `사용자 고민: "${concern}"
${goal ? `사용자가 선택한 집중 영역: ${goal}` : ""}

위 고민에 대한 간단 진단 리포트를 JSON으로 작성해주세요.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "요청이 많아요. 잠시 후 다시 시도해주세요.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI 사용량이 소진되었습니다." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let parsed: any = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      const m = content?.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }

    if (!parsed) throw new Error("AI 응답을 해석할 수 없습니다.");

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("mind-track-concern-report error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
