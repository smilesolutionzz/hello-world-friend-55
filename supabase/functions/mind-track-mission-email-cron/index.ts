// 7일 마음 트랙 결제자에게 매일 오전 8시(KST) Day N 미션 이메일 발송
// pg_cron 호출: 매일 23:00 UTC (= 08:00 KST)
// 멱등: send-transactional-email의 idempotencyKey로 동일 (enrollment, day) 중복 발송 차단
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Day별 카피 — src/lib/mindTrackDayCopy.ts의 DAY_COPY_7과 동기화 유지
const DAY_COPY_7: Record<number, { phase: string; title: string; description: string }> = {
  1: { phase: 'Day 1 · 발가벗기', title: '나를 완전히 발가벗겨보기 (기초 진단)', description: '5종 자가진단 + 마음 점수 측정으로 출발선을 정확히 기록해요. 이 데이터가 7일 후 비교의 기준이 됩니다.' },
  2: { phase: 'Day 2 · 패턴 추적', title: '하루 24시간, 내 감정/에너지 추적', description: '아침·점심·저녁 3회 마이크로 체크인으로 나만의 패턴을 찾아내요. AI가 자동으로 트렌드를 분석합니다.' },
  3: { phase: 'Day 3 · 뿌리 진단', title: '뿌리 패턴 진단 (심층 분석 리포트)', description: '2일간 쌓인 데이터를 박사급 AI가 분석해 핵심 패턴 1가지를 골라줘요. "왜 이렇게 사는지"가 보입니다.' },
  4: { phase: 'Day 4 · 전문가 개입', title: '전문가 1:1 개입 (15분 무료 매칭 상담)', description: '내 데이터를 본 전문가가 직접 처방을 줘요. 혼자선 절대 못 보는 사각지대를 짚어줍니다.' },
  5: { phase: 'Day 5 · 회복 루틴 설계', title: '나만의 회복 루틴 3가지 고정', description: '4일간 가장 효과 있던 행동을 3가지로 압축해 일상에 심어요. 이게 평생 갑니다.' },
  6: { phase: 'Day 6 · 실전 적용', title: '실전 — 가장 어려운 상황에 적용', description: '평소 가장 무너지던 순간(스트레스/관계/수면)에 새 루틴을 직접 써봐요. 진짜 변화가 검증되는 날.' },
  7: { phase: 'Day 7 · 변화 리포트', title: '7일 변화 리포트 + 다음 30일 가이드', description: 'Day 1과 비교한 종합 변화 리포트(PDF) + 이후에도 지속 가능한 셀프 코칭 가이드를 받습니다.' },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // 1) 7일 트랙, paid, active enrollment 조회
    const { data: enrollments, error } = await admin
      .from("mind_track_enrollments")
      .select("id, user_id, started_at, baseline_data, track_type, payment_status, status")
      .eq("status", "active")
      .in("payment_status", ["paid", "completed"])
      .or("track_type.eq.mind_7day,track_type.eq.mind_track_7,track_type.is.null");
    if (error) throw error;

    let sent = 0, skipped = 0, failed = 0;

    for (const en of enrollments ?? []) {
      try {
        // 7일 트랙만 (track_type null도 7일로 간주 — 신규 결제 기본값)
        const t = (en.track_type || "mind_7day").toLowerCase();
        if (t.includes("30")) { skipped++; continue; }

        if (!en.started_at) { skipped++; continue; }
        const started = new Date(en.started_at).getTime();
        const now = Date.now();
        const diff = Math.floor((now - started) / (1000 * 60 * 60 * 24)) + 1;
        if (diff < 1 || diff > 7) { skipped++; continue; }

        const copy = DAY_COPY_7[diff];
        if (!copy) { skipped++; continue; }

        // 사용자 이메일/닉네임
        const { data: userRes } = await admin.auth.admin.getUserById(en.user_id);
        const email = userRes?.user?.email;
        if (!email) { skipped++; continue; }
        const nickname =
          (en.baseline_data as any)?.nickname ||
          (en.baseline_data as any)?.display_name ||
          null;

        const idempotencyKey = `mt-mission-${en.id}-day${diff}`;

        // send-transactional-email 호출
        const resp = await fetch(`${SUPABASE_URL}/functions/v1/send-transactional-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SERVICE_KEY}`,
          },
          body: JSON.stringify({
            templateName: "mind-track-mission",
            recipientEmail: email,
            idempotencyKey,
            templateData: {
              nickname,
              dayNumber: diff,
              totalDays: 7,
              phase: copy.phase,
              missionTitle: copy.title,
              missionDescription: copy.description,
              workbookUrl: `https://aihpro.app/mind-track/workbook?day=${diff}&utm_source=email&utm_campaign=mt7_mission&utm_content=day${diff}`,
            },
          }),
        });
        if (!resp.ok) {
          failed++;
          console.error(`[mt-mission] send failed enrollment=${en.id} day=${diff}`, await resp.text());
          continue;
        }
        sent++;
      } catch (innerErr) {
        failed++;
        console.error("[mt-mission] enrollment error", en.id, innerErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent, skipped, failed, total: enrollments?.length ?? 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("[mt-mission] fatal", e);
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
