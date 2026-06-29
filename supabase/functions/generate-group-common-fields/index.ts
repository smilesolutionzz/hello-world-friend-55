// Generate all "common" group therapy note fields from a single activity name.
// Body: { activity: string, audience?: string }
// Returns: { greeting, activities_summary, highlights: string[], home_tips: string[], next_week_focus, title }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });

    const { activity, audience } = await req.json();
    if (!activity || typeof activity !== "string" || !activity.trim()) {
      return new Response(JSON.stringify({ error: "activity required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const sys = `당신은 한국 치료/돌봄 기관의 그룹 주간 치료노트 작성 도우미입니다.
- 보호자에게 전달되는 톤(따뜻·구체·자연스러움), 의학적 진단 표현 금지.
- 아동 실명/개인정보 절대 생성 금지(공통 영역이므로 일반 표현만).
- 반드시 JSON 객체 하나만 출력. 추가 설명/머리말/코드펜스 금지.`;

    const user = `다음 "프로그램/활동명"만 보고, 이번 주 그룹 활동 주간노트의 공통 영역 초안을 만들어주세요.

프로그램/활동명: ${activity.trim()}
대상: ${audience || "그룹 아동"}

다음 키를 가진 JSON으로 출력:
{
  "title": "이번 주 주간노트 제목 (15자 내, 활동명 반영)",
  "greeting": "보호자께 드리는 2~3문장 인사 (이번 주 활동 흐름을 자연스럽게 언급)",
  "activities_summary": "이번 주 진행한 공통 활동 내용을 3~5문장으로 구체적으로 서술 (도입→전개→마무리)",
  "highlights": ["하이라이트 3~5개", "각 항목은 한 문장, 그룹 전체 관찰"],
  "home_tips": ["가정에서 함께 해보기 좋은 활동 3~4개", "각 항목은 한 문장 실천 가이드"],
  "next_week_focus": "다음 주 집중 방향 2~3문장 (자연스러운 연결)"
}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      return new Response(JSON.stringify({ error: "ai_failed", detail: t }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const aiJson = await aiRes.json();
    const raw = aiJson.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(raw); } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch {} }
    }

    const out = {
      title: typeof parsed.title === "string" ? parsed.title : "",
      greeting: typeof parsed.greeting === "string" ? parsed.greeting : "",
      activities_summary: typeof parsed.activities_summary === "string" ? parsed.activities_summary : "",
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights.filter((s: any) => typeof s === "string" && s.trim()) : [],
      home_tips: Array.isArray(parsed.home_tips) ? parsed.home_tips.filter((s: any) => typeof s === "string" && s.trim()) : [],
      next_week_focus: typeof parsed.next_week_focus === "string" ? parsed.next_week_focus : "",
    };

    return new Response(JSON.stringify(out), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("[generate-group-common-fields]", e);
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
