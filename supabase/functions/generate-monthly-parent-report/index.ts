// Generate a monthly parent report grounded in real per-child data.
// Body: { centerId, clientId, period }   period = "YYYY-MM"
// Pulls: client info, that month's sessions (with therapist/program),
// that month's weekly therapy notes (period_type='weekly'), and feeds them
// into the AI Gateway. Result is upserted into center_parent_reports as
// ai_draft_json with schema 'monthly_v1', which SampleParentReport renders.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function monthRange(period: string): { start: string; end: string; y: number; m: number } {
  const [ys, ms] = period.split("-");
  const y = parseInt(ys);
  const m = parseInt(ms);
  const start = `${ys}-${ms.padStart(2, "0")}-01`;
  const end = new Date(y, m, 0).toISOString().slice(0, 10);
  return { start, end, y, m };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: { user } } = await admin.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });

    const { centerId, clientId, period } = await req.json();
    if (!centerId || !clientId || !period) {
      return new Response(JSON.stringify({ error: "centerId, clientId, period required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: mem } = await admin.from("center_members").select("user_id").eq("center_id", centerId).eq("user_id", user.id).maybeSingle();
    if (!mem) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });

    const { start, end, y, m } = monthRange(period);

    // 1) Client basics
    const { data: client } = await admin
      .from("center_clients")
      .select("id, name, birth_date, gender, disability_info")
      .eq("id", clientId)
      .maybeSingle();
    if (!client) {
      return new Response(JSON.stringify({ error: "client_not_found" }), { status: 404, headers: { ...cors, "Content-Type": "application/json" } });
    }

    // 2) Sessions in month
    const { data: sessions } = await admin
      .from("center_sessions")
      .select("id, session_date, start_time, end_time, status, note, therapist_id, program_id")
      .eq("center_id", centerId)
      .eq("client_id", clientId)
      .gte("session_date", start)
      .lte("session_date", end)
      .order("session_date", { ascending: true });

    const therapistIds = Array.from(new Set((sessions || []).map((s) => s.therapist_id).filter(Boolean)));
    const programIds = Array.from(new Set((sessions || []).map((s) => s.program_id).filter(Boolean)));
    const [{ data: ths }, { data: progs }] = await Promise.all([
      therapistIds.length ? admin.from("center_therapists").select("id, name, specialty").in("id", therapistIds) : Promise.resolve({ data: [] as any[] }),
      programIds.length ? admin.from("center_programs").select("id, name, category").in("id", programIds) : Promise.resolve({ data: [] as any[] }),
    ]);
    const thMap = new Map((ths || []).map((t: any) => [t.id, t]));
    const pgMap = new Map((progs || []).map((p: any) => [p.id, p]));

    // 3) Weekly therapy notes for this client in the month
    const { data: weekly } = await admin
      .from("center_parent_reports")
      .select("id, week_key, period_start, period_end, title, ai_summary, ai_draft_json")
      .eq("center_id", centerId)
      .eq("client_id", clientId)
      .eq("period_type", "weekly")
      .gte("period_start", start)
      .lte("period_end", end)
      .order("period_start", { ascending: true });

    // 4) Build context strings
    const completed = (sessions || []).filter((s) => s.status === "completed");
    const totalSessions = (sessions || []).length;
    const attendancePct = totalSessions ? Math.round((completed.length / totalSessions) * 100) : 0;

    const therapistNames = Array.from(
      new Set((sessions || []).map((s) => thMap.get(s.therapist_id)?.name).filter(Boolean))
    );
    const areaList = Array.from(
      new Set((sessions || []).map((s) => pgMap.get(s.program_id)?.category || pgMap.get(s.program_id)?.name).filter(Boolean))
    );

    const sessionLines = (sessions || []).map((s, i) => {
      const th = thMap.get(s.therapist_id);
      const pg = pgMap.get(s.program_id);
      return `  ${i + 1}. ${s.session_date} ${s.start_time?.slice(0, 5) ?? ""} · ${pg?.name ?? "프로그램"}${pg?.category ? `(${pg.category})` : ""} · 담당 ${th?.name ?? "-"} · 상태 ${s.status}${s.note ? ` · 메모: ${s.note}` : ""}`;
    }).join("\n") || "  (이번 달 등록된 회기 없음)";

    const weeklyBlocks = (weekly || []).map((w, i) => {
      const d: any = w.ai_draft_json ?? {};
      const parts = [
        `[주간 노트 ${i + 1} · ${w.period_start} ~ ${w.period_end}] "${w.title ?? "-"}"`,
        d.activities_summary ? `  활동요약: ${d.activities_summary}` : null,
        Array.isArray(d.highlights) && d.highlights.length ? `  하이라이트: ${d.highlights.join(" / ")}` : null,
        Array.isArray(d.growth) && d.growth.length ? `  관찰된 성장: ${d.growth.join(" / ")}` : null,
        Array.isArray(d.home_tips) && d.home_tips.length ? `  가정연습: ${d.home_tips.join(" / ")}` : null,
        d.next_week_focus ? `  다음 방향: ${d.next_week_focus}` : null,
      ].filter(Boolean);
      return parts.join("\n");
    }).join("\n\n") || "(이번 달 발행된 주간 치료노트 없음)";

    const ageStr = client.birth_date ? `${Math.max(0, y - new Date(client.birth_date).getFullYear())}세` : "";

    const prompt = `당신은 발달치료센터의 담당 치료사이며, 아래 **실제 데이터**만을 근거로 보호자에게 보낼 ${y}년 ${m}월 월간 리포트를 작성합니다. 데이터에 없는 활동/에피소드/수치를 만들어내지 마세요.

[아동] ${client.name}${ageStr ? ` (${ageStr})` : ""}${client.gender ? ` · ${client.gender}` : ""}
[기간] ${start} ~ ${end}
[참여 회기] 총 ${totalSessions}회 / 완료 ${completed.length}회 / 출석률 ${attendancePct}%
[치료 영역] ${areaList.join(", ") || "(등록 영역 없음)"}
[담당 치료사] ${therapistNames.join(", ") || "(미지정)"}

[이번 달 회기 상세]
${sessionLines}

[이번 달 주간 치료노트]
${weeklyBlocks}

다음 JSON 스키마로만 반환하세요. 모든 한국어 문장은 보호자가 읽기 쉬운 따뜻한 어조, 의학적 진단 단어 금지:

{
  "stats": {
    "participated": "${completed.length}회",
    "attendance": "${attendancePct}%",
    "areas": "위 [치료 영역]을 자연스럽게 표기 (없으면 '관찰 기록 기반')",
    "therapist": "위 [담당 치료사] 이름 (없으면 '담당 치료사')"
  },
  "summary": "이번 달 한 눈에. 회기 수·주요 활동·가장 두드러진 변화를 3-5문장으로. 위 데이터에 등장한 활동/표현만 사용.",
  "domains": [
    { "domain": "영역명(예: 표현언어/사회성/정서조절 등 위 데이터에서 실제 관찰된 것)", "prev": 0-100 정수, "curr": 0-100 정수, "delta": "+N 또는 -N", "color": "emerald 또는 amber", "note": "주간 노트에서 관찰된 구체적 변화 1문장" }
    // 3-5개. 데이터에 근거 없는 영역은 넣지 말 것.
  ],
  "highlights": [
    { "date": "주차 또는 날짜 (예: 1주차, 2026-06-10)", "title": "에피소드 한 줄 제목", "body": "주간 노트에 실제 기록된 장면을 2-3문장으로" }
    // 2-4개. 주간 노트에 근거가 있어야 함.
  ],
  "note": "담당 치료사 종합 소견 4-6문장. 이 아이만의 변화·강점·다음 달 관심 영역.",
  "noteTherapist": { "name": "${therapistNames[0] ?? "담당 치료사"} 치료사", "meta": "담당 치료사" },
  "practice": [
    { "title": "가정 연습 제목", "desc": "구체적 실행 방법 1-2문장", "time": "예: 5분/회, 매일 10분" }
    // 2-4개. 이 아이의 영역에 맞춤.
  ],
  "goals": [
    { "label": "주요 목표", "value": "다음 달 핵심 목표" },
    { "label": "회기 횟수", "value": "권장 회기" },
    { "label": "재평가 일정", "value": "예: 다음 달 말" }
  ],
  "goalsFooter": "다음 달 첫 회기 안내 또는 보호자 면담 안내 1문장",
  "schema": "monthly_v1"
}

JSON만 출력. 다른 텍스트·코드펜스 금지.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "당신은 보호자 친화적 월간 발달 리포트를 JSON으로 작성합니다. JSON 외 출력 금지. 데이터에 없는 사실을 만들지 마세요." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      return new Response(JSON.stringify({ error: "ai_failed", detail: t }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const aiJson = await aiRes.json();
    let draft: any = {};
    try { draft = JSON.parse(aiJson.choices?.[0]?.message?.content ?? "{}"); } catch { draft = {}; }
    draft.schema = "monthly_v1";
    draft.generated_from = {
      sessions: (sessions || []).length,
      weekly_notes: (weekly || []).length,
      therapists: therapistNames,
      areas: areaList,
    };

    const sourceIds = (weekly || []).map((w: any) => w.id);

    const { data: existing } = await admin
      .from("center_parent_reports")
      .select("id, status, published_at")
      .eq("center_id", centerId)
      .eq("client_id", clientId)
      .eq("period_type", "monthly")
      .eq("period_start", start)
      .maybeSingle();

    let reportId: string;
    if (existing) {
      const { error } = await admin.from("center_parent_reports").update({
        ai_draft_json: draft,
        source_upload_ids: sourceIds,
        title: `${y}년 ${m}월 월간 리포트`,
        generated_at: new Date().toISOString(),
        period_end: end,
        period_yyyymm: period,
      }).eq("id", existing.id);
      if (error) throw error;
      reportId = existing.id;
    } else {
      const { data: ins, error } = await admin.from("center_parent_reports").insert({
        center_id: centerId,
        client_id: clientId,
        period_type: "monthly",
        period_start: start,
        period_end: end,
        period_yyyymm: period,
        ai_draft_json: draft,
        source_upload_ids: sourceIds,
        title: `${y}년 ${m}월 월간 리포트`,
        status: "draft",
        generated_at: new Date().toISOString(),
      }).select("id").single();
      if (error) throw error;
      reportId = ins.id;
    }

    return new Response(JSON.stringify({ reportId, draft }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("[generate-monthly-parent-report]", e);
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
