// Mind Track Graduation Workbook
// Day 14 완주 시 한 번 호출되어 졸업 워크북(HTML + 점수 그래프 데이터 + 한 줄)을 생성.
// PDF는 클라이언트가 별도 단계에서 만들도록 하고, 여기서는 narrative_html + score_journey + keepsake_quote만 저장.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

async function llmNarrative(input: {
  concern: string; goal: string | null; audience: string;
  baseline: number; current: number;
  snapshots: { day: number; score: number; evidence: string }[];
  sessionReports: { day: number; summary: string; key_wins: string[] }[];
}) {
  const sys = `당신은 14일 동안 사용자를 코칭한 베테랑 전문가입니다.
지금 사용자가 트랙을 졸업합니다. "졸업 워크북"의 본문을 한국어 HTML로 작성하세요.
구성: <h2>표지 문구</h2> → <h3>14일 여정</h3> → <h3>핵심 변화 3가지</h3> → <h3>다음 30일 가이드</h3>
규칙: 이모지·마크다운 금지, 의학적 진단 금지, 따뜻하지만 단호한 전문가 톤, 2,500자 이내.
또한 "keepsake_quote" 1문장(60자 이내)을 별도로 제공.`;
  const user = JSON.stringify(input).slice(0, 6000);

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
        name: "emit_graduation",
        parameters: {
          type: "object",
          properties: {
            narrative_html: { type: "string" },
            keepsake_quote: { type: "string" },
          },
          required: ["narrative_html", "keepsake_quote"],
          additionalProperties: false,
        },
      },
    }],
    tool_choice: { type: "function", function: { name: "emit_graduation" } },
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
    const { threadId, enrollmentId } = await req.json();
    if (!threadId || !enrollmentId) {
      return new Response(JSON.stringify({ error: "missing fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 이미 발급된 경우 재사용
    const { data: existing } = await supabase
      .from("mind_track_graduation_workbooks")
      .select("*").eq("thread_id", threadId).maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ workbook: existing, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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

    const { data: snaps } = await supabase
      .from("mind_track_progress_snapshots")
      .select("day_number, self_score, evidence_summary")
      .eq("thread_id", threadId).order("created_at", { ascending: true });
    const { data: reports } = await supabase
      .from("mind_track_session_reports")
      .select("day_number, report_json, key_wins")
      .eq("thread_id", threadId).order("day_number");

    const scoreJourney = [
      { day: 0, score: thread.baseline_score },
      ...(snaps ?? []).map((s: any) => ({ day: s.day_number, score: s.self_score })),
    ];

    let narrative;
    try {
      narrative = await llmNarrative({
        concern: thread.concern_title,
        goal: thread.goal_statement,
        audience: thread.audience,
        baseline: thread.baseline_score,
        current: thread.current_score,
        snapshots: (snaps ?? []).map((s: any) => ({
          day: s.day_number, score: s.self_score, evidence: s.evidence_summary || "",
        })),
        sessionReports: (reports ?? []).map((r: any) => ({
          day: r.day_number,
          summary: r.report_json?.summary || "",
          key_wins: r.key_wins || [],
        })),
      });
    } catch (err) {
      console.error("[graduate] llm failed", err);
      narrative = {
        narrative_html: `<h2>14일을 완주하셨습니다</h2><p>"${thread.concern_title}" 고민과 함께한 시간이 끝났습니다. 점수는 ${thread.baseline_score}에서 ${thread.current_score}로 움직였어요. 매일의 기록이 곧 변화의 증거였습니다.</p>`,
        keepsake_quote: "오늘 한 줄을 남긴 당신, 이미 변하고 있어요.",
      };
    }

    const row = {
      thread_id: threadId,
      enrollment_id: enrollmentId,
      user_id: thread.user_id,
      audience: thread.audience,
      track_focus: thread.track_focus,
      narrative_html: narrative.narrative_html,
      score_journey: scoreJourney,
      keepsake_quote: narrative.keepsake_quote,
      pdf_url: null,
    };
    const { data: saved, error: sErr } = await supabase
      .from("mind_track_graduation_workbooks").insert(row).select().single();
    if (sErr) throw sErr;

    // 스레드 상태 업데이트
    await supabase.from("mind_track_concern_threads")
      .update({ status: "graduated", graduated_at: new Date().toISOString() })
      .eq("id", threadId);

    return new Response(JSON.stringify({ workbook: saved, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[graduate] fatal", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
