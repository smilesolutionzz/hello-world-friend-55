/**
 * 7일 마음 트랙 — AI 에이전트 결정 함수
 *
 * 입력: { enrollmentId, day, audience, lastCheckin, recentNotes }
 * 출력: { action, route, label, reason, autoExecute }
 *
 * 안전 가드: 위기 키워드("죽", "자해", "끝내", "사라지") 감지 시
 * 무조건 expert 라우트(/expert-hiring?urgent=true) 로 강제.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CRISIS_PATTERNS = [
  /죽고\s*싶/,
  /자해/,
  /사라지고\s*싶/,
  /끝내고\s*싶/,
  /살기\s*싫/,
];

const ACTIONS = {
  game: {
    route: "/metaverse-voice?from=agent",
    label: "게임 상담 5분",
    why: "말로 꺼내기 무거운 감정은 게임으로 부드럽게 표현돼요.",
  },
  expert: {
    route: "/expert-hiring?from=agent",
    label: "전문가 매칭 보기",
    why: "지금 상태는 사람의 도움이 가장 빠른 해답이 될 수 있어요.",
  },
  voice: {
    route: "/voice-counseling?from=agent",
    label: "음성 상담 시작",
    why: "마음 속 말을 소리내어 풀어내면 정리가 빨라져요.",
  },
  concern: {
    route: "/ai-concern?from=agent",
    label: "AI에게 고민 쓰기",
    why: "지금 머릿속을 한 화면에 정리하면 다음 한 걸음이 보여요.",
  },
  observation: {
    route: "/observation-analysis?from=agent",
    label: "오늘 관찰일지 분석 보기",
    why: "방금 적은 기록을 AI가 패턴으로 풀어드려요.",
  },
  rest: {
    route: "/mind-track/dashboard?from=agent",
    label: "오늘은 쉬기",
    why: "지금은 더 하지 않는 것이 더 큰 도움이 돼요.",
  },
} as const;

type ActionKey = keyof typeof ACTIONS;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { day = 1, audience = "adult", lastCheckin = {}, recentNotes = "" } = body ?? {};

    // 1) 위기 감지 — 무조건 expert
    const text = `${recentNotes ?? ""} ${lastCheckin?.reflection_note ?? ""}`;
    if (CRISIS_PATTERNS.some((p) => p.test(text))) {
      return json({
        action: "expert",
        route: "/expert-hiring?urgent=true&from=agent_crisis",
        label: "지금 전문가 연결하기",
        reason: "방금 적은 표현에서 도움이 시급할 수 있다는 신호를 봤어요.",
        autoExecute: true,
        crisis: true,
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // 2) 휴리스틱 fallback — AI 키 없을 때
    if (!LOVABLE_API_KEY) {
      return json(pick(heuristic(day, lastCheckin), "fallback"));
    }

    const sys = `당신은 7일 마음 트랙의 AI 에이전트입니다.
사용자 대신 오늘 가장 도움이 될 단 한 가지 행동을 결정해주는 역할입니다.

선택지(반드시 이 중 하나만):
- game (게임 상담)
- expert (전문가 매칭)
- voice (음성 상담)
- concern (AI에게 고민 쓰기)
- observation (관찰일지 분석 보기)
- rest (오늘은 쉬기)

반드시 아래 JSON 형식으로만 응답하세요:
{"action": "...", "reason": "한국어 한 문장, 따뜻하지만 단호하게"}

규칙:
- mood/energy/clarity 점수가 낮으면 expert 또는 game 우선
- 기록이 많으면 observation
- 머릿속이 복잡하다면 concern
- 전반적으로 안정적이면 rest 또는 voice
- 의료 표현, 진단 표현 금지`;

    const usr = `Day ${day}/7, audience=${audience}
mood=${lastCheckin?.mood_score ?? "-"} energy=${lastCheckin?.energy_score ?? "-"} clarity=${lastCheckin?.clarity_score ?? "-"}
최근 메모: ${(recentNotes || lastCheckin?.reflection_note || "(없음)").slice(0, 400)}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: usr },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (aiRes.status === 429 || aiRes.status === 402) {
      return json(pick(heuristic(day, lastCheckin), aiRes.status === 429 ? "rate_limited" : "credits_exhausted"));
    }
    if (!aiRes.ok) {
      console.error("AI gateway error", aiRes.status, await aiRes.text());
      return json(pick(heuristic(day, lastCheckin), "ai_error"));
    }

    const data = await aiRes.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";
    let parsed: { action?: string; reason?: string } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      const m = content.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }
    const action = (ACTIONS as any)[parsed.action ?? ""] ? (parsed.action as ActionKey) : heuristic(day, lastCheckin);
    const a = ACTIONS[action];
    return json({
      action,
      route: a.route,
      label: a.label,
      reason: parsed.reason?.trim() || a.why,
      autoExecute: false,
      source: "ai",
    });
  } catch (e) {
    console.error("agent-decide error:", e);
    return json({
      action: "rest",
      route: ACTIONS.rest.route,
      label: ACTIONS.rest.label,
      reason: "잠시 후 다시 추천드릴게요.",
      autoExecute: false,
      source: "error",
    });
  }
});

function heuristic(day: number, ci: any): ActionKey {
  const mood = ci?.mood_score ?? 5;
  const energy = ci?.energy_score ?? 5;
  if (mood <= 3 || energy <= 2) return "expert";
  if (day === 2) return "game";
  if (day === 3) return "voice";
  if (day === 5) return "observation";
  if (day === 6) return "concern";
  if (day === 1 || day === 4 || day === 7) return "expert";
  return "rest";
}

function pick(action: ActionKey, source: string) {
  const a = ACTIONS[action];
  return {
    action,
    route: a.route,
    label: a.label,
    reason: a.why,
    autoExecute: false,
    source,
  };
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
