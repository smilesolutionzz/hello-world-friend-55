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

    const { centerId, clientId, period, force } = await req.json();
    if (!centerId || !clientId || !period) {
      return new Response(JSON.stringify({ error: "centerId, clientId, period required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: mem } = await admin.from("center_members").select("user_id").eq("center_id", centerId).eq("user_id", user.id).maybeSingle();
    if (!mem) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });

    // Pre-check: skip if an existing report already covers this month, unless force=true.
    // Never overwrite published reports automatically — even with force, require force=true explicitly.
    {
      const { start: pStart } = monthRange(period);
      const { data: pre } = await admin
        .from("center_parent_reports")
        .select("id, status")
        .eq("center_id", centerId)
        .eq("client_id", clientId)
        .eq("period_type", "monthly")
        .eq("period_start", pStart)
        .maybeSingle();
      if (pre && !force) {
        return new Response(
          JSON.stringify({ skipped: true, reason: "already_exists", reportId: pre.id, status: pre.status }),
          { status: 200, headers: { ...cors, "Content-Type": "application/json" } },
        );
      }
    }

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

    // 1b) Center org (real name + whitelabel branding snapshot)
    const { data: org } = await admin
      .from("center_organizations")
      .select("id, name, branding")
      .eq("id", centerId)
      .maybeSingle();
    const centerName = org?.name || "발달치료센터";
    const centerBranding = (org as any)?.branding ?? null;


    // 2) Scheduled sessions in month (include meta.records — therapist-authored treatment notes)
    const { data: sessions } = await admin
      .from("center_sessions")
      .select("id, session_date, start_time, end_time, status, note, therapist_id, program_id, meta")
      .eq("center_id", centerId)
      .eq("client_id", clientId)
      .gte("session_date", start)
      .lte("session_date", end)
      .order("session_date", { ascending: true });


    // 2b) Parsed session logs (the real source of truth for what happened)
    const { data: uploads } = await admin
      .from("center_session_uploads")
      .select("id, session_date, therapist_id, ai_extracted, ocr_text, status")
      .eq("center_id", centerId)
      .eq("client_id", clientId)
      .gte("session_date", start)
      .lte("session_date", end)
      .in("status", ["parsed", "used", "done"])
      .order("session_date", { ascending: true });

    const therapistIds = Array.from(new Set([
      ...((sessions || []).map((s) => s.therapist_id).filter(Boolean)),
      ...((uploads || []).map((u: any) => u.therapist_id).filter(Boolean)),
    ]));
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

    // 4) Build context strings — uploads (parsed logs) are the primary session source
    const completedScheduled = (sessions || []).filter((s) => s.status === "completed");
    const uploadCount = (uploads || []).length;
    const participatedCount = Math.max(uploadCount, completedScheduled.length);
    const scheduledTotal = (sessions || []).length;
    const attendancePct = scheduledTotal
      ? Math.min(100, Math.round((Math.max(uploadCount, completedScheduled.length) / scheduledTotal) * 100))
      : (uploadCount > 0 ? 100 : 0);

    // Therapist priority:
    //  ① most-assigned therapist in this month's center_sessions
    //  ② most-frequent therapist_id across center_session_uploads
    //  ③ name extracted from OCR text
    const countByName = new Map<string, number>();
    const bump = (name: string | undefined | null, w = 1) => {
      if (!name) return;
      countByName.set(name, (countByName.get(name) || 0) + w);
    };
    const sessionTherapistCounts = new Map<string, number>();
    for (const s of sessions || []) {
      const n = thMap.get(s.therapist_id)?.name;
      if (n) sessionTherapistCounts.set(n, (sessionTherapistCounts.get(n) || 0) + 1);
    }
    let primaryTherapist: string | null = null;
    if (sessionTherapistCounts.size) {
      primaryTherapist = [...sessionTherapistCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    }
    if (!primaryTherapist) {
      const uploadTherapistCounts = new Map<string, number>();
      for (const u of uploads || []) {
        const n = thMap.get((u as any).therapist_id)?.name;
        if (n) uploadTherapistCounts.set(n, (uploadTherapistCounts.get(n) || 0) + 1);
      }
      if (uploadTherapistCounts.size) {
        primaryTherapist = [...uploadTherapistCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];
      }
    }
    if (!primaryTherapist) {
      const ocrCounts = new Map<string, number>();
      for (const u of uploads || []) {
        const txt = (u as any).ocr_text || "";
        const m1 = txt.match(/(?:담당|치료사)[\s:]*([가-힣]{2,4})\s*(?:치료사|선생님)?/);
        if (m1?.[1]) ocrCounts.set(m1[1], (ocrCounts.get(m1[1]) || 0) + 1);
        const m2 = txt.match(/재활\s+([가-힣]{2,4})\s*[:：]/);
        if (m2?.[1]) ocrCounts.set(m2[1], (ocrCounts.get(m2[1]) || 0) + 1);
      }
      if (ocrCounts.size) {
        primaryTherapist = [...ocrCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];
      }
    }

    const therapistNames = primaryTherapist ? [primaryTherapist] : [];


    const areaList = Array.from(
      new Set((sessions || []).map((s) => pgMap.get(s.program_id)?.category || pgMap.get(s.program_id)?.name).filter(Boolean))
    );

    const sessionLines = (sessions || []).map((s, i) => {
      const th = thMap.get(s.therapist_id);
      const pg = pgMap.get(s.program_id);
      return `  ${i + 1}. ${s.session_date} ${s.start_time?.slice(0, 5) ?? ""} · ${pg?.name ?? "프로그램"}${pg?.category ? `(${pg.category})` : ""} · 담당 ${th?.name ?? "-"} · 상태 ${s.status}${s.note ? ` · 메모: ${s.note}` : ""}`;
    }).join("\n") || "  (스케줄에 등록된 회기 없음 — 아래 [파싱된 회기 일지]를 회기 근거로 사용)";

    const uploadBlocks = (uploads || []).map((u: any, i: number) => {
      const ex = u.ai_extracted ?? {};
      const th = thMap.get(u.therapist_id)?.name;
      const parts = [
        `[회기 일지 ${i + 1} · ${u.session_date}]${th ? ` 담당 ${th}` : ""}`,
        Array.isArray(ex.activities) && ex.activities.length ? `  활동: ${ex.activities.join(" / ")}` : null,
        Array.isArray(ex.goals) && ex.goals.length ? `  목표: ${ex.goals.join(" / ")}` : null,
        Array.isArray(ex.emotions) && ex.emotions.length ? `  정서/반응: ${ex.emotions.join(" / ")}` : null,
        ex.progress_notes ? `  소견: ${ex.progress_notes}` : null,
        Array.isArray(ex.next_steps) && ex.next_steps.length ? `  다음 단계: ${ex.next_steps.join(" / ")}` : null,
      ].filter(Boolean);
      return parts.join("\n");
    }).join("\n\n") || "(이번 달 파싱된 회기 일지 없음)";

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

    const hasAnyData = uploadCount > 0 || (weekly?.length ?? 0) > 0 || scheduledTotal > 0;

    // Map raw program category/name to a parent-friendly developmental domain
    // so the header "치료 영역" and the body "영역별 발달 흐름" stay aligned.
    const mapAreaToDomain = (a: string): string => {
      const t = a.replace(/\s+/g, "");
      if (/(특수체육|운동|신체|감통|감각통합|체육|놀이체육)/.test(t)) return "운동·신체 발달";
      if (/(인지|학습|집중|주의|수학|읽기|쓰기학습)/.test(t)) return "인지·학습";
      if (/(언어|말|발화|조음|쓰기|읽기언어)/.test(t)) return "언어·의사소통";
      if (/(사회|상호작용|또래|놀이치료|정서사회)/.test(t)) return "사회성·상호작용";
      if (/(정서|행동|조절|감정)/.test(t)) return "정서·행동 조절";
      if (/(미술|음악|예술)/.test(t)) return "표현·창의";
      return a;
    };
    const requiredDomains = Array.from(new Set(areaList.map((a) => mapAreaToDomain(String(a)))));

    // ─────────────────────────────────────────────────────────────────
    // Build per-therapy tracks.
    // A "track" represents one therapy (program). Only sessions that have
    // therapist-authored notes (center_sessions.meta.records) are included,
    // so the monthly report mirrors exactly which therapies actually wrote
    // treatment notes this month.
    // ─────────────────────────────────────────────────────────────────
    type TrackData = {
      key: string;
      area: string;             // e.g. "특수체육"
      therapistName: string;
      therapistId: string | null;
      sessionCount: number;
      scheduledCount: number;
      recordRows: { date: string; consult?: string; record?: string; special?: string }[];
      uploadBlocks: string[];
      weeklyBlocks: string[];
    };

    const trackMap = new Map<string, TrackData>();
    const ensureTrack = (area: string, therapist: any): TrackData => {
      const key = `${area}__${therapist?.id ?? ""}`;
      let t = trackMap.get(key);
      if (!t) {
        t = {
          key, area,
          therapistName: therapist?.name ?? "담당 치료사",
          therapistId: therapist?.id ?? null,
          sessionCount: 0, scheduledCount: 0,
          recordRows: [], uploadBlocks: [], weeklyBlocks: [],
        };
        trackMap.set(key, t);
      }
      return t;
    };

    // 1) Sessions WITH therapist-written records → these define the tracks
    for (const s of sessions || []) {
      const r = (s as any).meta?.records;
      const hasRecord = r && (r.consult || r.record || r.special);
      if (!hasRecord) continue;
      const pg = pgMap.get(s.program_id);
      const th = thMap.get(s.therapist_id);
      const area = pg?.name || pg?.category || (th as any)?.specialty || "치료";
      const t = ensureTrack(area, th);
      t.sessionCount += 1;
      t.scheduledCount += 1;
      t.recordRows.push({
        date: s.session_date,
        consult: r.consult || undefined,
        record: r.record || undefined,
        special: r.special || undefined,
      });
    }

    // 2) Enrich tracks with parsed uploads (matched by therapist)
    for (const u of uploads || []) {
      const th = thMap.get((u as any).therapist_id);
      if (!th) continue;
      // Pick the most likely track for this therapist (largest existing track)
      const candidates = Array.from(trackMap.values()).filter((tr) => tr.therapistId === th.id);
      if (!candidates.length) continue; // upload's therapist has no records track this month
      const track = candidates.sort((a, b) => b.sessionCount - a.sessionCount)[0];
      const ex = (u as any).ai_extracted ?? {};
      const parts = [
        `[회기 일지 · ${(u as any).session_date}] 담당 ${th.name}`,
        Array.isArray(ex.activities) && ex.activities.length ? `  활동: ${ex.activities.join(" / ")}` : null,
        Array.isArray(ex.goals) && ex.goals.length ? `  목표: ${ex.goals.join(" / ")}` : null,
        Array.isArray(ex.emotions) && ex.emotions.length ? `  정서/반응: ${ex.emotions.join(" / ")}` : null,
        ex.progress_notes ? `  소견: ${ex.progress_notes}` : null,
        Array.isArray(ex.next_steps) && ex.next_steps.length ? `  다음 단계: ${ex.next_steps.join(" / ")}` : null,
      ].filter(Boolean);
      track.uploadBlocks.push(parts.join("\n"));
    }

    // 3) Enrich tracks with weekly notes. Weekly notes aren't per-therapy, so we
    //    only attach a weekly note when its text mentions the track's area name.
    for (const w of weekly || []) {
      const d: any = (w as any).ai_draft_json ?? {};
      const blob = JSON.stringify({
        title: (w as any).title, summary: (w as any).ai_summary,
        activities_summary: d.activities_summary, highlights: d.highlights,
        growth: d.growth, home_tips: d.home_tips, next_week_focus: d.next_week_focus,
      });
      for (const track of trackMap.values()) {
        if (blob.includes(track.area)) {
          const parts = [
            `[주간 노트 · ${(w as any).period_start} ~ ${(w as any).period_end}] "${(w as any).title ?? "-"}"`,
            d.activities_summary ? `  활동요약: ${d.activities_summary}` : null,
            Array.isArray(d.highlights) && d.highlights.length ? `  하이라이트: ${d.highlights.join(" / ")}` : null,
            Array.isArray(d.growth) && d.growth.length ? `  관찰된 성장: ${d.growth.join(" / ")}` : null,
            Array.isArray(d.home_tips) && d.home_tips.length ? `  가정연습: ${d.home_tips.join(" / ")}` : null,
            d.next_week_focus ? `  다음 방향: ${d.next_week_focus}` : null,
          ].filter(Boolean);
          track.weeklyBlocks.push(parts.join("\n"));
        }
      }
    }

    const tracks = Array.from(trackMap.values()).sort((a, b) => b.sessionCount - a.sessionCount);

    if (!tracks.length) {
      return new Response(
        JSON.stringify({
          error: "no_treatment_notes",
          detail: "이번 달 치료노트(회기기록)가 작성된 치료가 없습니다. 회기기록 페이지에서 치료사가 회기 기록을 먼저 작성해 주세요.",
        }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }




    async function generateTrack(track: TrackData) {
      const recBlock = track.recordRows.map((r, i) => {
        const parts = [`[회기기록 ${i + 1} · ${r.date}]`];
        if (r.consult) parts.push(`  활동내용: ${r.consult}`);
        if (r.record) parts.push(`  주관평가: ${r.record}`);
        if (r.special) parts.push(`  특이사항: ${r.special}`);
        return parts.join("\n");
      }).join("\n\n") || "(치료사 회기기록 없음)";
      const upBlock = track.uploadBlocks.join("\n\n") || "(파싱된 회기 일지 없음)";
      const wkBlock = track.weeklyBlocks.join("\n\n") || "(이 치료 영역과 관련된 주간 노트 없음)";
      const reqDomain = mapAreaToDomain(track.area);

      const prompt = `당신은 발달치료센터의 ${track.area} 담당 치료사이며, 아래 **실제 데이터**만을 근거로 보호자에게 보낼 ${y}년 ${m}월 ${track.area} 월간 리포트 한 페이지를 작성합니다.

[엄격 규칙]
- 데이터에 없는 활동·에피소드·수치·치료사 이름을 절대 만들어내지 마세요.
- 회기기록의 키워드가 summary/highlights/note 중 최소 한 곳에 그대로 등장해야 합니다.
- 데이터가 비어 있는 섹션은 짧게 "이번 달 해당 없음"으로 표기하세요.
- domains 점수는 0~100 사이 정수, prev<curr면 emerald, 보합/감소면 amber. delta는 "+N"/"-N".

[아동] ${client.name}${ageStr ? ` (${ageStr})` : ""}${client.gender ? ` · ${client.gender}` : ""}
[기간] ${start} ~ ${end}
[치료 영역] ${track.area}
[필수 발달 영역 — domains 배열에 반드시 포함] ${reqDomain}
[담당 치료사] ${track.therapistName}
[참여 회기] ${track.sessionCount}회 (회기기록 기준)

[치료사 회기기록 — 이번 달 ${track.area} 회기]
${recBlock}

[파싱된 회기 일지]
${upBlock}

[관련 주간 노트]
${wkBlock}

다음 JSON 스키마로만 반환하세요(이 치료 한 가지에 대한 한 페이지):
{
  "stats": {
    "participated": "${track.sessionCount}회",
    "areas": "${track.area}",
    "therapist": "${track.therapistName}"
  },
  "summary": "이번 달 ${track.area} 활동 요약 3-5문장. 회기기록 키워드 인용.",
  "domains": [
    { "domain": "${reqDomain}", "prev": 정수, "curr": 정수, "delta": "+N", "color": "emerald 또는 amber", "note": "관찰된 구체적 변화 1문장" }
  ],
  "highlights": [
    { "date": "회기 날짜 또는 주차", "title": "에피소드 한 줄 제목", "body": "회기기록에 실제 기록된 장면 2-3문장" }
  ],
  "note": "${track.therapistName} 치료사 종합 소견 3-5문장.",
  "noteTherapist": { "name": "${track.therapistName} 치료사", "meta": "${track.area} 담당" },
  "practice": [
    { "title": "${track.area}와 연계된 가정 연습 제목", "desc": "구체적 실행 방법 1-2문장", "time": "예: 5분/회, 매일 10분" }
  ],
  "goals": [
    { "label": "주요 목표", "value": "다음 달 핵심 목표" },
    { "label": "회기 횟수", "value": "권장 회기" },
    { "label": "재평가 일정", "value": "예: 다음 달 말" }
  ],
  "goalsFooter": "보호자 안내 1문장"
}
JSON만 출력. 다른 텍스트·코드펜스 금지.`;

      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: `당신은 ${track.area} 치료의 보호자 친화적 월간 페이지를 JSON으로 작성합니다. JSON 외 출력 금지. 데이터에 없는 사실 금지.` },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`AI failed for track ${track.area}: ${t}`);
      }
      const j = await res.json();
      let parsed: any = {};
      try { parsed = JSON.parse(j.choices?.[0]?.message?.content ?? "{}"); } catch { parsed = {}; }
      return {
        key: track.key,
        area: track.area,
        therapist: track.therapistName,
        sessionCount: track.sessionCount,
        stats: parsed.stats ?? { participated: `${track.sessionCount}회`, areas: track.area, therapist: track.therapistName },
        summary: parsed.summary ?? "",
        domains: Array.isArray(parsed.domains) ? parsed.domains : [],
        highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
        note: parsed.note ?? "",
        noteTherapist: parsed.noteTherapist ?? { name: `${track.therapistName} 치료사`, meta: `${track.area} 담당` },
        practice: Array.isArray(parsed.practice) ? parsed.practice : [],
        goals: Array.isArray(parsed.goals) ? parsed.goals : [],
        goalsFooter: parsed.goalsFooter ?? "",
      };
    }

    const trackResults = await Promise.all(tracks.map(generateTrack));

    // Compose final draft. Top-level keeps backward-compatible fields (mirror first track)
    // so older renderers still show *something* reasonable. `tracks` is the new source of truth.
    const overallAreas = trackResults.map((t) => t.area).join(", ");
    const overallTherapists = Array.from(new Set(trackResults.map((t) => t.therapist))).join(", ");
    const overallParticipated = trackResults.reduce((sum, t) => sum + t.sessionCount, 0);
    const first = trackResults[0];

    const draft: any = {
      schema: "monthly_v1",
      center_name: centerName,
      branding: centerBranding ?? undefined,
      tracks: trackResults,
      stats: {
        participated: `${overallParticipated}회`,
        attendance: `${attendancePct}%`,
        areas: overallAreas,
        therapist: overallTherapists,
      },
      summary: first?.summary ?? "",
      domains: first?.domains ?? [],
      highlights: first?.highlights ?? [],
      note: first?.note ?? "",
      noteTherapist: first?.noteTherapist ?? { name: "담당 치료사", meta: "담당 치료사" },
      practice: first?.practice ?? [],
      goals: first?.goals ?? [],
      goalsFooter: first?.goalsFooter ?? "",
      generated_from: {
        scheduled_sessions: (sessions || []).length,
        parsed_uploads: (uploads || []).length,
        weekly_notes: (weekly || []).length,
        tracks: trackResults.map((t) => ({ area: t.area, therapist: t.therapist, sessions: t.sessionCount })),
        center_name: centerName,
      },
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
