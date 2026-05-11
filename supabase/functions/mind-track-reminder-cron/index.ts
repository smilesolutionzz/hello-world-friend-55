// 미완료 Day 리마인더 cron — 매일 한국시간 20:00 (UTC 11:00) pg_cron 호출
// 동작: status=active 인 enrollment를 돌며 어제까지의 기준일에 체크인 미완료면
//       이메일로 짧은 리마인더 발송. mind_track_reminders_sent로 중복 방지.
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM = "AIHPRO 마음 트랙 <coaching@aihpro.app>";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const resend = resendKey ? new Resend(resendKey) : null;

    // 1) 활성 enrollment + 사용자 이메일/닉네임
    const { data: enrollments, error } = await admin
      .from("mind_track_enrollments")
      .select("id, user_id, started_at, current_day, baseline_data, goal_focus")
      .eq("status", "active");
    if (error) throw error;

    let sent = 0;
    let skipped = 0;

    for (const en of enrollments ?? []) {
      try {
        if (!en.started_at) continue;
        const started = new Date(en.started_at);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - started.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const expectedDay = Math.min(Math.max(diffDays, 1), 30);
        // 어제 기준일을 미완료한 경우만 리마인더
        const targetDay = expectedDay - 1;
        if (targetDay < 1 || targetDay > 30) { skipped++; continue; }

        // 이미 해당 day의 체크인 완료 여부
        const { data: ck } = await admin
          .from("mind_track_checkins")
          .select("completed")
          .eq("enrollment_id", en.id)
          .eq("day_number", targetDay)
          .maybeSingle();
        if (ck?.completed) { skipped++; continue; }

        // 중복 발송 방지
        const { data: already } = await admin
          .from("mind_track_reminders_sent")
          .select("id")
          .eq("enrollment_id", en.id)
          .eq("day_number", targetDay)
          .eq("channel", "email")
          .maybeSingle();
        if (already) { skipped++; continue; }

        // 사용자 이메일 조회
        const { data: userRes } = await admin.auth.admin.getUserById(en.user_id);
        const email = userRes?.user?.email;
        if (!email) { skipped++; continue; }

        const nickname =
          (en.baseline_data as any)?.nickname ||
          (en.baseline_data as any)?.display_name ||
          "당신";

        if (resend) {
          await resend.emails.send({
            from: FROM,
            to: [email],
            reply_to: "support@aihpro.app",
            subject: `${nickname}님, Day ${targetDay} 미션이 기다리고 있어요`,
            html: `
              <div style="font-family:'Pretendard',-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1f2937;">
                <div style="font-size:11px;font-weight:700;letter-spacing:.2em;color:#8a7a4d;margin-bottom:8px;">AIHPRO MIND TRACK</div>
                <h1 style="font-size:22px;font-weight:700;margin:0 0 12px 0;">Day ${targetDay} 미션이 비어 있어요</h1>
                <p style="font-size:14px;line-height:1.7;color:#475569;margin:0 0 20px;">
                  ${nickname}님, 30일 마음 트랙은 매일 5분이면 충분해요. 어제의 미션을 짧게라도 채우면
                  데이터가 끊기지 않고 회복 패턴이 더 또렷하게 보입니다.
                </p>
                <a href="https://aihpro.app/mind-track-workbook?day=${targetDay}"
                   style="display:inline-block;background:#8a7a4d;color:#fff;text-decoration:none;font-weight:700;
                          padding:12px 22px;border-radius:14px;font-size:14px;">
                  Day ${targetDay} 미션 열기
                </a>
                <p style="font-size:11px;color:#94a3b8;margin-top:28px;line-height:1.6;">
                  이 메일이 더 이상 필요 없으시면 앱 내 설정에서 알림을 꺼주세요.
                </p>
              </div>
            `,
          });
        }

        await admin.from("mind_track_reminders_sent").insert({
          user_id: en.user_id,
          enrollment_id: en.id,
          day_number: targetDay,
          channel: "email",
        });

        sent++;
      } catch (innerErr) {
        console.error("[mind-track-reminder] enrollment error", en.id, innerErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent, skipped, total: enrollments?.length ?? 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("[mind-track-reminder] fatal", e);
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
