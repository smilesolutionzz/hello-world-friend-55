// Generate a milestone (Day 7/14/21/28) self-diagnosis report for a Mind Track enrollment.
// Idempotent: returns the existing report if already generated.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { enrollmentId, milestoneDay, force } = await req.json();
    const validDays = [7, 14, 21, 28, 30];
    if (!enrollmentId || !validDays.includes(milestoneDay)) {
      throw new Error("invalid enrollmentId or milestoneDay (7|14|21|28|30)");
    }

    // Existing?
    if (!force) {
      const { data: existing } = await supabase
        .from("mind_track_milestone_reports")
        .select("*")
        .eq("enrollment_id", enrollmentId)
        .eq("milestone_day", milestoneDay)
        .maybeSingle();
      if (existing) {
        return new Response(JSON.stringify({ success: true, report: existing, cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Load enrollment + workbook + checkins + baselines
    const [{ data: enrollment }, { data: workbook }, { data: checkins }, { data: baselines }] = await Promise.all([
      supabase.from("mind_track_enrollments").select("*").eq("id", enrollmentId).maybeSingle(),
      supabase.from("mind_track_workbooks").select("*").eq("enrollment_id", enrollmentId).maybeSingle(),
      supabase.from("mind_track_checkins").select("*").eq("enrollment_id", enrollmentId).order("day_number"),
      supabase.from("mind_track_baseline_assessments").select("*").eq("enrollment_id", enrollmentId).order("created_at"),
    ]);

    if (!enrollment) throw new Error("enrollment not found");

    const baseline = (baselines ?? []).find((b: any) => b.measurement_point === "baseline") ?? (baselines ?? [])[0] ?? null;
    const latest = (baselines ?? [])[(baselines ?? []).length - 1] ?? null;

    const recentCheckins = (checkins ?? []).filter((c: any) => c.day_number <= milestoneDay);
    const completedCount = recentCheckins.filter((c: any) => c.completed).length;
    const avg = (k: string) => {
      const vs = recentCheckins.map((c: any) => c[k]).filter((v: any) => typeof v === "number");
      return vs.length ? Math.round((vs.reduce((a: number, b: number) => a + b, 0) / vs.length) * 10) / 10 : null;
    };

    const checkinSummary = {
      milestone_day: milestoneDay,
      completed_count: completedCount,
      adherence_rate: Math.round((completedCount / milestoneDay) * 100),
      avg_mood: avg("mood_score"),
      avg_energy: avg("energy_score"),
      avg_clarity: avg("clarity_score"),
      reflection_notes: recentCheckins
        .map((c: any) => c.reflection_note)
        .filter(Boolean)
        .slice(-5),
    };

    // Compose AI narrative
    const systemPrompt = `당신은 따뜻하고 전문적인 마음 코치입니다. 사용자의 ${milestoneDay}일차 마음 변화 데이터를 보고
'${milestoneDay}일 자가진단 리포트' 본문을 한국어 plain text로 작성하세요.
규칙:
- 의료 진단/치료 표현 금지 (코칭/관찰/변화 흐름 중심)
- 마크다운 표 금지, 이모지 금지
- 4개 섹션을 '01. 한 줄 요약', '02. 변화 패턴', '03. 인사이트', '04. 다음 ${Math.min(milestoneDay + 7, 30)}일 권장' 으로 구성
- 각 섹션은 2~4문장, 따뜻하지만 구체적으로`;

    const userPrompt = `[챌린지] ${workbook?.challenge_theme ?? ""}
[목표 영역] ${enrollment.goal_focus ?? ""}
[기준 점수] 스트레스=${baseline?.stress_score ?? "?"} 에너지=${baseline?.energy_score ?? "?"} 명료성=${baseline?.clarity_score ?? "?"}
[최신 점수] 스트레스=${latest?.stress_score ?? "?"} 에너지=${latest?.energy_score ?? "?"} 명료성=${latest?.clarity_score ?? "?"}
[체크인 요약] ${JSON.stringify(checkinSummary)}
[최근 메모]
${checkinSummary.reflection_notes.join("\n") || "(없음)"}

위 데이터를 바탕으로 ${milestoneDay}일 자가진단 본문을 작성하세요.`;

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
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
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
${milestoneDay}일 동안 ${completedCount}회 체크인을 마치며 마음 변화 데이터를 차곡차곡 쌓았어요.

02. 변화 패턴
평균 기분 ${checkinSummary.avg_mood ?? "-"}, 에너지 ${checkinSummary.avg_energy ?? "-"}, 명료성 ${checkinSummary.avg_clarity ?? "-"} 수준으로 유지되고 있어요.

03. 인사이트
꾸준한 기록 자체가 가장 큰 신호예요. 작은 변화가 쌓이면서 나만의 패턴이 보이기 시작합니다.

04. 다음 ${Math.min(milestoneDay + 7, 30)}일 권장
어려웠던 미션은 더 작게 나누고, 잘된 미션은 한 번 더 반복해보세요.`;
    }

    // Upsert
    const payload = {
      user_id: user.id,
      enrollment_id: enrollmentId,
      milestone_day: milestoneDay,
      baseline_snapshot: baseline,
      latest_snapshot: latest,
      checkin_summary: checkinSummary,
      ai_narrative: narrative,
    };

    const { data: upserted, error: upErr } = await supabase
      .from("mind_track_milestone_reports")
      .upsert(payload, { onConflict: "enrollment_id,milestone_day" })
      .select()
      .single();
    if (upErr) throw upErr;

    return new Response(JSON.stringify({ success: true, report: upserted, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("milestone-report error:", e);
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
