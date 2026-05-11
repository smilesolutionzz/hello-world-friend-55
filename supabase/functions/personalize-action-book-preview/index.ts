// Live Day 1-3 action book preview generator (anonymous-friendly).
// Returns 3 ultra-personalized mission cards for the workbook preview funnel.
import { corsHeaders } from "@supabase/supabase-js/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface Body {
  nickname?: string;
  goalId?: string;
  goalLabel?: string;
  concern?: string;
  ageGroup?: string;
}

const DEFAULT_LINES = [
  { title: "수면 리셋", body: "잠들기 30분 전 핸드폰 거실에 두기" },
  { title: "감정 신호", body: "오늘 짜증 1번을 한 줄로 적기" },
  { title: "회복 루틴", body: "퇴근 후 5분 산책 1바퀴" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    const nickname = (body.nickname || "당신").toString().slice(0, 30);
    const goal = (body.goalLabel || body.goalId || "마음 회복").toString().slice(0, 60);
    const concern = (body.concern || "").toString().slice(0, 600);
    const ageGroup = (body.ageGroup || "").toString().slice(0, 30);

    if (!LOVABLE_API_KEY) {
      return json({ days: DEFAULT_LINES, fallback: true, reason: "no_api_key" });
    }

    const sys = `당신은 30일 마음 변화 트랙의 1~3일차 미션을 작성하는 한국어 코칭 카피라이터입니다.
- 정확히 3개의 미션을 JSON으로 반환합니다.
- 각 미션: title(한국어 6자 이내), body(한국어 25자 이내, 행동 1개).
- 의료 진단/약 권유 금지. 긍정·구체·작은 행동.
- 닉네임/목표/고민을 반영해 초맞춤형으로 작성.`;
    const user = `닉네임: ${nickname}
목표: ${goal}
연령대: ${ageGroup || "미지정"}
고민: ${concern || "(미입력)"}

JSON 스키마: {"days":[{"title":"...","body":"..."}, ...3개]}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.warn("[preview] gateway error", resp.status, t.slice(0, 200));
      return json({ days: DEFAULT_LINES, fallback: true, reason: `gateway_${resp.status}` });
    }
    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content || "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { /* noop */ }
    const days = Array.isArray(parsed.days) ? parsed.days.slice(0, 3) : [];
    const safe = [0, 1, 2].map((i) => ({
      title: String(days[i]?.title || DEFAULT_LINES[i].title).slice(0, 16),
      body: String(days[i]?.body || DEFAULT_LINES[i].body).slice(0, 60),
    }));
    return json({ days: safe, fallback: false });
  } catch (e) {
    console.error("[preview] error", e);
    return json({ days: DEFAULT_LINES, fallback: true, reason: "exception" });
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
