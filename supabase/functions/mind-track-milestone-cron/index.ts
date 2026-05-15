// Day 7/14/21/28 마일스톤 자가진단 리포트 자동 생성 + 이메일 안내 cron.
// pg_cron이 매일 한국시간 09:00(UTC 00:00) 호출.
// - 활성 enrollment 중 started_at 기준 경과일이 7/14/21/28 이상인 건에 대해
//   아직 생성되지 않은 milestone 리포트를 mind_track_milestone_reports에 upsert.
// - 생성 직후 사용자에게 1회 이메일 안내 (mind_track_milestone_emails_sent로 중복 방지).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM = "AIHPRO 마음 트랙 <coaching@aihpro.app>";
const MILESTONES = [7, 14, 21, 28] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const resend = Deno.env.get("RESEND_API_KEY")
    ? new Resend(Deno.env.get("RESEND_API_KEY")!)
    : null;

  const stats = { scanned: 0, generated: 0, emailed: 0, skipped: 0, errors: 0 };

  try {
    const { data: enrollments, error } = await admin
      .from("mind_track_enrollments")
      .select("id, user_id, started_at, baseline_data, status")
      .in("status", ["active", "completed"]);
    if (error) throw error;

    const now = Date.now();

    for (const en of enrollments ?? []) {
      stats.scanned++;
      if (!en.started_at) { stats.skipped++; continue; }
      const elapsed = Math.floor((now - new Date(en.started_at).getTime()) / 86400000) + 1;

      for (const day of MILESTONES) {
        if (elapsed < day) continue;

        try {
          // 이미 생성된 마일스톤?
          const { data: existing } = await admin
            .from("mind_track_milestone_reports")
            .select("id")
            .eq("enrollment_id", en.id)
            .eq("milestone_day", day)
            .maybeSingle();

          let reportId = existing?.id ?? null;

          if (!reportId) {
            // milestone-report 함수에 service-role로 위임 호출 (auth 토큰 대신 user_id를 RPC로 직접 처리)
            // 여기서는 함수 재사용을 위해 service-role 컨텍스트로 데이터를 직접 조립해 upsert.
            const reportRow = await buildMilestoneReport(admin, en, day);
            if (!reportRow) { stats.errors++; continue; }
            const { data: ins, error: insErr } = await admin
              .from("mind_track_milestone_reports")
              .upsert(reportRow, { onConflict: "enrollment_id,milestone_day" })
              .select("id")
              .single();
            if (insErr) { stats.errors++; continue; }
            reportId = ins.id;
            stats.generated++;
          }

          // 이메일 1회 발송
          const { data: alreadyMail } = await admin
            .from("mind_track_milestone_emails_sent")
            .select("id")
            .eq("enrollment_id", en.id)
            .eq("milestone_day", day)
            .maybeSingle();
          if (alreadyMail) { stats.skipped++; continue; }

          const { data: userRes } = await admin.auth.admin.getUserById(en.user_id);
          const email = userRes?.user?.email;
          if (!email) { stats.skipped++; continue; }

          const nickname =
            (en.baseline_data as any)?.nickname ||
            (en.baseline_data as any)?.display_name ||
            "당신";

          if (resend) {
            await resend.emails.send({
              from: FROM,
              to: [email],
              reply_to: "support@aihpro.app",
              subject: `${nickname}님, Day ${day} 자가진단 리포트가 도착했어요`,
              html: milestoneEmailHtml(nickname, day),
            });
            stats.emailed++;
          }

          await admin.from("mind_track_milestone_emails_sent").insert({
            enrollment_id: en.id,
            milestone_day: day,
            channel: "email",
          });
        } catch (e) {
          console.error("milestone loop error", en.id, day, e);
          stats.errors++;
        }
      }
    }

    return new Response(JSON.stringify({ success: true, stats }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("milestone-cron fatal", e);
    return new Response(JSON.stringify({ success: false, error: e.message, stats }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function buildMilestoneReport(admin: any, enrollment: any, day: number) {
  const [{ data: workbook }, { data: checkins }, { data: baselines }] = await Promise.all([
    admin.from("mind_track_workbooks").select("*").eq("enrollment_id", enrollment.id).maybeSingle(),
    admin.from("mind_track_checkins").select("*").eq("enrollment_id", enrollment.id).order("day_number"),
    admin.from("mind_track_baseline_assessments").select("*").eq("enrollment_id", enrollment.id).order("created_at"),
  ]);

  const baseline = (baselines ?? []).find((b: any) => b.measurement_point === "baseline") ?? (baselines ?? [])[0] ?? null;
  const latest = (baselines ?? [])[(baselines ?? []).length - 1] ?? null;
  const recent = (checkins ?? []).filter((c: any) => c.day_number <= day);
  const completed = recent.filter((c: any) => c.completed).length;
  const avg = (k: string) => {
    const vs = recent.map((c: any) => c[k]).filter((v: any) => typeof v === "number");
    return vs.length ? Math.round((vs.reduce((a: number, b: number) => a + b, 0) / vs.length) * 10) / 10 : null;
  };

  const checkinSummary = {
    milestone_day: day,
    completed_count: completed,
    adherence_rate: Math.round((completed / day) * 100),
    avg_mood: avg("mood_score"),
    avg_energy: avg("energy_score"),
    avg_clarity: avg("clarity_score"),
    reflection_notes: recent.map((c: any) => c.reflection_note).filter(Boolean).slice(-5),
  };

  // AI 본문 생성 (실패 시 fallback)
  let narrative = "";
  try {
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `당신은 따뜻한 마음 코치입니다. ${day}일 자가진단 본문을 한국어 plain text로 작성하세요.
규칙: 마크다운 표/이모지 금지, 의료 진단/치료 표현 금지.
4개 섹션 '01. 한 줄 요약', '02. 변화 패턴', '03. 인사이트', '04. 다음 ${Math.min(day + 7, 30)}일 권장' 으로 구성, 각 2~4문장.`,
          },
          {
            role: "user",
            content: `[챌린지] ${workbook?.challenge_theme ?? ""}
[목표] ${enrollment.goal_focus ?? ""}
[기준 점수] 스트레스=${baseline?.stress_score ?? "?"} 에너지=${baseline?.energy_score ?? "?"} 명료성=${baseline?.clarity_score ?? "?"}
[최신 점수] 스트레스=${latest?.stress_score ?? "?"} 에너지=${latest?.energy_score ?? "?"} 명료성=${latest?.clarity_score ?? "?"}
[체크인 요약] ${JSON.stringify(checkinSummary)}
[메모]
${checkinSummary.reflection_notes.join("\n") || "(없음)"}`,
          },
        ],
      }),
    });
    if (aiRes.ok) {
      const j = await aiRes.json();
      narrative = j.choices?.[0]?.message?.content ?? "";
    }
  } catch (err) {
    console.error("AI narrative failed:", err);
  }

  if (!narrative) {
    narrative = `01. 한 줄 요약
${day}일 동안 ${completed}회 체크인을 마치며 마음 변화 데이터를 차곡차곡 쌓았어요.

02. 변화 패턴
평균 기분 ${checkinSummary.avg_mood ?? "-"}, 에너지 ${checkinSummary.avg_energy ?? "-"}, 명료성 ${checkinSummary.avg_clarity ?? "-"} 수준으로 유지되고 있어요.

03. 인사이트
꾸준한 기록 자체가 가장 큰 신호예요. 작은 변화가 쌓이면서 나만의 패턴이 보이기 시작합니다.

04. 다음 ${Math.min(day + 7, 30)}일 권장
어려웠던 미션은 더 작게 나누고, 잘된 미션은 한 번 더 반복해보세요.`;
  }

  return {
    user_id: enrollment.user_id,
    enrollment_id: enrollment.id,
    milestone_day: day,
    baseline_snapshot: baseline,
    latest_snapshot: latest,
    checkin_summary: checkinSummary,
    ai_narrative: narrative,
  };
}

function milestoneEmailHtml(nickname: string, day: number) {
  return `
    <div style="font-family:'Pretendard',-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:36px 28px;color:#1f2937;background:#ffffff;">
      <div style="font-size:11px;font-weight:700;letter-spacing:.22em;color:#8a7a4d;margin-bottom:10px;">AIHPRO MIND TRACK</div>
      <h1 style="font-family:'Instrument Serif',serif;font-size:28px;font-weight:400;margin:0 0 14px 0;color:#0f172a;">
        Day ${day} 자가진단 리포트가 준비됐어요
      </h1>
      <p style="font-size:14px;line-height:1.75;color:#475569;margin:0 0 24px;">
        ${nickname}님이 ${day}일간 쌓아온 체크인과 미션 데이터를 바탕으로
        한 줄 요약 · 변화 패턴 · 인사이트 · 다음 권장까지 정리한
        <strong style="color:#0f172a;">전문가 톤의 자가진단 리포트</strong>가 도착했습니다.
      </p>
      <a href="https://aihpro.app/my-journey"
         style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;font-weight:700;
                padding:14px 26px;border-radius:14px;font-size:14px;letter-spacing:.02em;">
        Day ${day} 리포트 열어보기
      </a>
      <hr style="border:none;border-top:1px solid #eef0f4;margin:32px 0;" />
      <p style="font-size:11px;color:#94a3b8;line-height:1.7;margin:0;">
        본 리포트는 코칭/관찰용 자가진단으로, 의료 진단·치료 목적이 아닙니다.
        알림이 더 이상 필요 없으시면 앱 내 설정에서 꺼주세요.
      </p>
    </div>
  `;
}
