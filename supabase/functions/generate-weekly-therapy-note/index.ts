// Generate a weekly parent-friendly therapy note from uploads.
// Body: { centerId, clientId, weekKey }
// Creates/updates a center_parent_reports row (period_type='weekly', status='draft') with AI draft.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function weekRange(weekKey: string): { start: string; end: string } {
  const m = weekKey.match(/^(\d{4})-W(\d{2})$/);
  if (!m) {
    const today = new Date();
    return { start: today.toISOString().slice(0, 10), end: today.toISOString().slice(0, 10) };
  }
  const y = parseInt(m[1]);
  const w = parseInt(m[2]);
  const jan4 = new Date(Date.UTC(y, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Mon = new Date(jan4);
  week1Mon.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));
  const start = new Date(week1Mon);
  start.setUTCDate(week1Mon.getUTCDate() + (w - 1) * 7);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
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

    const { centerId, clientId, weekKey, allowEmpty } = await req.json();
    if (!centerId || !clientId || !weekKey) {
      return new Response(JSON.stringify({ error: "centerId, clientId, weekKey required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: mem } = await admin.from("center_members").select("user_id").eq("center_id", centerId).eq("user_id", user.id).maybeSingle();
    if (!mem) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });

    const { start, end } = weekRange(weekKey);

    // Gather uploads
    const { data: uploads } = await admin
      .from("center_session_uploads")
      .select("*")
      .eq("center_id", centerId)
      .eq("client_id", clientId)
      .eq("week_key", weekKey)
      .eq("status", "parsed")
      .order("session_date", { ascending: true });

    // Gather scheduled sessions for the week (always — used to enrich or as sole source)
    const { data: schedSessions } = await admin
      .from("center_sessions")
      .select("id, session_date, start_time, end_time, duration_min, status, note, therapist_id, program_id, meta")
      .eq("center_id", centerId)
      .eq("client_id", clientId)
      .gte("session_date", start)
      .lte("session_date", end)
      .order("session_date", { ascending: true });

    const therapistIds = Array.from(new Set((schedSessions || []).map((s) => s.therapist_id).filter(Boolean)));
    const programIds = Array.from(new Set((schedSessions || []).map((s) => s.program_id).filter(Boolean)));
    const [{ data: ths }, { data: progs }] = await Promise.all([
      therapistIds.length ? admin.from("center_therapists").select("id, name, specialty").in("id", therapistIds) : Promise.resolve({ data: [] as any[] }),
      programIds.length ? admin.from("center_programs").select("id, name").in("id", programIds) : Promise.resolve({ data: [] as any[] }),
    ]);
    const thMap = new Map((ths || []).map((t: any) => [t.id, t]));
    const pgMap = new Map((progs || []).map((p: any) => [p.id, p]));

    // 회기별 치료사 직접 작성 기록 (center_sessions.meta.records)
    const recordRows = (schedSessions || [])
      .map((s: any) => {
        const r = s.meta?.records;
        if (!r) return null;
        const parts = [];
        if (r.consult) parts.push(`상담내용: ${r.consult}`);
        if (r.record) parts.push(`기록내용: ${r.record}`);
        if (r.special) parts.push(`특이사항: ${r.special}`);
        if (parts.length === 0) return null;
        return `[${s.session_date}] ${parts.join(" / ")}`;
      })
      .filter(Boolean) as string[];
    const hasRecords = recordRows.length > 0;
    const recordsSummary = hasRecords ? recordRows.join("\n") : "(이번 주 치료사 직접 작성 기록 없음)";

    const hasUploads = (uploads || []).length > 0;
    const hasSessions = (schedSessions || []).length > 0;
    if (!hasUploads && !hasSessions && !hasRecords && !allowEmpty) {
      return new Response(JSON.stringify({ error: "no_data", detail: "이번 주 기록이 없어요." }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: client } = await admin.from("center_clients").select("name, birth_date").eq("id", clientId).maybeSingle();

    const uploadSummary = hasUploads ? (uploads || []).map((u, i) => {
      const e = u.ai_extracted || {};
      return `[일지 ${i + 1} · ${u.session_date}]
활동: ${(e.activities || []).join(", ")}
감정/태도: ${(e.emotions || []).join(", ")}
다룬 목표: ${(e.goals || []).join(", ")}
관찰: ${e.progress_notes || ""}
다음 회기 제안: ${(e.next_steps || []).join(", ")}`;
    }).join("\n\n") : "(이번 주 업로드된 일지 사진 없음)";

    const scheduleSummary = hasSessions ? (schedSessions || []).map((s, i) => {
      const th = s.therapist_id ? thMap.get(s.therapist_id) : null;
      const pg = s.program_id ? pgMap.get(s.program_id) : null;
      return `[회기 ${i + 1} · ${s.session_date} ${s.start_time?.slice(0,5) ?? ""}-${s.end_time?.slice(0,5) ?? ""}] ${pg?.name ?? "프로그램"} · 담당 ${th?.name ?? "-"}${th?.specialty ? `(${th.specialty})` : ""} · 상태 ${s.status}${s.note ? ` · 메모: ${s.note}` : ""}`;
    }).join("\n") : "(이번 주 예약된 회기 없음)";

    const prompt = `당신은 보호자와 따뜻하게 소통하는 치료사입니다. 아래 이번 주 회기 정보를 묶어, 보호자에게 보낼 **주간 치료 노트**를 작성하세요.

[아동] ${client?.name ?? "—"}
[주차] ${weekKey} (${start} ~ ${end})

[이번 주 예약/진행 회기]
${scheduleSummary}

[치료사 일지(사진)에서 추출한 내용]
${uploadSummary}

다음 JSON 구조로만 반환하세요:
{
  "title": "이번 주 한 줄 제목",
  "greeting": "보호자께 드리는 짧은 인사 (2-3문장)",
  "highlights": ["이번 주 가장 인상적인 순간 2-3개"],
  "activities_summary": "이번 주 어떤 활동을 했는지 (3-4문장)",
  "growth": ["관찰된 성장/긍정 변화 2-3개"],
  "home_tips": ["가정에서 해볼 수 있는 활동 2-3개 (구체적으로)"],
  "next_week_focus": "다음 주 집중 방향 (1-2문장)"
}

규칙:
- 전문용어 최소화, 부모님이 읽기 쉬운 따뜻한 어조
- 의학적 진단 단어 사용 금지 (예: '자폐', 'ADHD 진단' 등)
- 비교/평가 대신 관찰과 격려 중심
- JSON만 출력, 다른 텍스트 금지`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "당신은 보호자 친화적 주간 치료 노트를 JSON으로 작성합니다. JSON 외 출력 금지." },
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

    const uploadIds = (uploads || []).map((u) => u.id);

    // Upsert weekly report
    const { data: existing } = await admin
      .from("center_parent_reports")
      .select("id")
      .eq("center_id", centerId)
      .eq("client_id", clientId)
      .eq("week_key", weekKey)
      .eq("period_type", "weekly")
      .maybeSingle();

    let reportId: string;
    if (existing) {
      const { error } = await admin.from("center_parent_reports").update({
        ai_draft_json: draft,
        source_upload_ids: uploadIds,
        title: draft.title ?? null,
        status: "draft",
        period_start: start,
        period_end: end,
        generated_at: new Date().toISOString(),
      }).eq("id", existing.id);
      if (error) throw error;
      reportId = existing.id;
    } else {
      const { data: ins, error } = await admin.from("center_parent_reports").insert({
        center_id: centerId,
        client_id: clientId,
        period_type: "weekly",
        week_key: weekKey,
        period_start: start,
        period_end: end,
        ai_draft_json: draft,
        source_upload_ids: uploadIds,
        title: draft.title ?? null,
        status: "draft",
        generated_at: new Date().toISOString(),
      }).select("id").single();
      if (error) throw error;
      reportId = ins.id;
    }

    // Mark uploads as used
    if (uploadIds.length) {
      await admin.from("center_session_uploads").update({ status: "used" }).in("id", uploadIds);
    }

    return new Response(JSON.stringify({ reportId, draft }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("[generate-weekly-therapy-note]", e);
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
