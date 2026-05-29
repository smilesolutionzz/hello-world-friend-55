// Mind Track Session Report
// 세션 Day(1·4·8·11) 종료 직후 호출되어 회차 리포트를 생성한다.
// POST { threadId, enrollmentId, dayNumber, selfScore, evidence }
//   → { report: { summary, key_wins, evidence_of_change, risk_flags, next_focus } }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

async function llmReport(input: {
  concern: string;
  goal: string | null;
  baseline: number;
  current: number;
  dayNumber: number;
  evidence: string;
  pastEvidence: string[];
}) {
  const sys = `당신은 한국의 베테랑 행동·심리 코치입니다.
사용자가 14일 트랙에서 특정 고민을 추적하고 있고, 오늘 세션이 끝났습니다.
회차 리포트를 JSON으로만 작성하세요. 이모지/마크다운 금지. 의학적 진단 금지.
"summary"는 60자 이내 한 문장. "key_wins"는 구체 행동 2~3개. "next_focus"는 다음 세션에서 강화할 한 가지.`;
  const user = `concern: ${input.concern}
goal: ${input.goal ?? "(미설정)"}
score: baseline ${input.baseline} → today ${input.current} (Day ${input.dayNumber})
오늘 증거: ${input.evidence}
이전 증거: ${input.pastEvidence.join(" / ") || "(없음)"}`;

  const body = {
    model: "google/gemini-3.1-flash-lite-preview",
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    reasoning: { effort: "medium" },
    tools: [{
      type: "function",
      function: {
        name: "emit_session_report",
        parameters: {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_wins: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 3 },
            evidence_of_change: { type: "array", items: { type: "string" } },
            risk_flags: { type: "array", items: { type: "string" } },
            next_focus: { type: "string" },
          },
          required: ["summary", "key_wins", "next_focus"],
          additionalProperties: false,
        },
      },
    }],
    tool_choice: { type: "function", function: { name: "emit_session_report" } },
  };

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`gateway ${resp.status}`);
  const data = await resp.json();
  const call = data?.choices?.[0]?.message?.tool_calls?.[0];
  if (!call?.function?.arguments) throw new Error("no tool call");
  return JSON.parse(call.function.arguments);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { threadId, enrollmentId, dayNumber, selfScore, evidence } = await req.json();
    if (!threadId || !enrollmentId || typeof dayNumber !== "number") {
      return new Response(JSON.stringify({ error: "missing fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: thread } = await supabase
      .from("mind_track_concern_threads")
      .select("*").eq("id", threadId).single();
    if (!thread) {
      return new Response(JSON.stringify({ error: "thread not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: pastSnaps } = await supabase
      .from("mind_track_progress_snapshots")
      .select("evidence_summary").eq("thread_id", threadId).limit(5);
    const past = (pastSnaps || []).map((s: any) => s.evidence_summary).filter(Boolean);

    let report;
    try {
      report = await llmReport({
        concern: thread.concern_title,
        goal: thread.goal_statement,
        baseline: thread.baseline_score,
        current: selfScore ?? thread.current_score,
        dayNumber,
        evidence: evidence ?? "",
        pastEvidence: past,
      });
    } catch (err) {
      console.error("[session-report] llm failed", err);
      report = {
        summary: "오늘도 한 걸음 나아갔어요. 작은 변화를 기록한 것 자체가 진전입니다.",
        key_wins: ["관찰한 장면을 한 문장으로 남겼다", "고민 점수를 다시 매겼다"],
        evidence_of_change: evidence ? [evidence] : [],
        risk_flags: [],
        next_focus: "다음 세션에는 오늘 효과가 있었던 행동을 한 번 더 반복해보세요.",
      };
    }

    const row = {
      thread_id: threadId,
      enrollment_id: enrollmentId,
      user_id: thread.user_id,
      day_number: dayNumber,
      report_json: report,
      key_wins: report.key_wins ?? [],
      risk_flags: report.risk_flags ?? [],
      next_focus: report.next_focus ?? null,
    };
    const { data: saved } = await supabase
      .from("mind_track_session_reports")
      .upsert(row, { onConflict: "thread_id,day_number" })
      .select().single();

    return new Response(JSON.stringify({ report: { ...report, id: saved?.id } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[session-report] fatal", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
