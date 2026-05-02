// 30일 마음 트랙 최종 워크북 컴파일 엣지 함수
// 입력: { enrollmentId }
// 동작: 체크인 + 베이스라인 + 마일스톤 리포트를 모아 AI 통찰을 생성하고
// mind_track_final_workbooks 테이블에 캐시. 두 번째 호출부터는 캐시 반환.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReqBody {
  enrollmentId: string;
  forceRegenerate?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Unauthorized" }, 401);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // 사용자 검증
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);
    const userId = userData.user.id;

    const body: ReqBody = await req.json();
    if (!body.enrollmentId) return json({ error: "enrollmentId required" }, 400);

    // 서비스 롤로 데이터 수집
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // 캐시 확인
    if (!body.forceRegenerate) {
      const { data: cached } = await admin
        .from("mind_track_final_workbooks")
        .select("*")
        .eq("enrollment_id", body.enrollmentId)
        .maybeSingle();
      if (cached) {
        return json({ workbook: cached, cached: true });
      }
    }

    // 1) Enrollment 조회 + 권한 검증
    const { data: enrollment, error: enrErr } = await admin
      .from("mind_track_enrollments")
      .select("*")
      .eq("id", body.enrollmentId)
      .maybeSingle();

    if (enrErr || !enrollment) return json({ error: "Enrollment not found" }, 404);
    if (enrollment.user_id !== userId) return json({ error: "Forbidden" }, 403);

    // 2) 체크인, 마일스톤, 워크북 묶음 조회
    const [{ data: checkins }, { data: milestones }, { data: workbookRow }] =
      await Promise.all([
        admin
          .from("mind_track_checkins")
          .select("*")
          .eq("enrollment_id", body.enrollmentId)
          .order("day_number", { ascending: true }),
        admin
          .from("mind_track_milestone_reports")
          .select("*")
          .eq("enrollment_id", body.enrollmentId)
          .order("milestone_day", { ascending: true }),
        admin
          .from("mind_track_workbooks")
          .select("*")
          .eq("enrollment_id", body.enrollmentId)
          .maybeSingle(),
      ]);

    // 3) AI 통찰 생성 (선택)
    let aiInsights = "";
    if (LOVABLE_API_KEY && checkins && checkins.length > 0) {
      const checkinSummary = checkins
        .map(
          (c: any) =>
            `Day ${c.day_number}: 무드 ${c.mood_score ?? "-"}/10, 메모 "${(c.reflection_text ?? "").slice(0, 60)}"`
        )
        .join("\n");

      try {
        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content:
                  "당신은 30일 자기성찰 워크북의 마무리 페이지를 쓰는 코칭 작가입니다. 따뜻하지만 전문적인 한국어로, 의료 진단 표현은 피하고, 데이터에 근거한 3가지 핵심 통찰과 다음 30일 제안을 제시하세요. 마크다운 표/이모지 사용 금지.",
              },
              {
                role: "user",
                content: `30일간의 체크인 데이터:\n${checkinSummary}\n\n트랙 주제: ${
                  workbookRow?.challenge_theme ?? "마음 트랙"
                }\n베이스라인: ${JSON.stringify(enrollment.baseline_data ?? {})}\n\n다음 형식으로 작성해주세요:\n1) 30일을 관통하는 핵심 통찰 3가지\n2) 발견한 회복 패턴\n3) 다음 30일을 위한 구체적 제안 3가지\n4) 마무리 한 문장`,
              },
            ],
            reasoning: { effort: "medium" },
          }),
        });
        if (aiRes.ok) {
          const aiJson = await aiRes.json();
          aiInsights = aiJson.choices?.[0]?.message?.content ?? "";
        } else {
          console.warn("AI gateway returned", aiRes.status);
        }
      } catch (e) {
        console.error("AI generation failed:", e);
      }
    }

    // 4) 차트용 데이터 정리
    const chartData = {
      moodTrend: (checkins ?? []).map((c: any) => ({
        day: c.day_number,
        mood: c.mood_score,
        energy: c.energy_score,
        clarity: c.clarity_score,
      })),
      totalCheckins: checkins?.length ?? 0,
      streakDays: checkins?.length ?? 0,
    };

    const completionCertificate = {
      issuedAt: new Date().toISOString(),
      certificateNo: `AIHPRO-MT-${body.enrollmentId.slice(0, 8).toUpperCase()}`,
      trackTheme: workbookRow?.challenge_theme ?? "30일 마음 트랙",
      totalDays: 30,
      completedCheckins: checkins?.length ?? 0,
      verifyUrl: `https://aihpro.app/verify-report?id=${body.enrollmentId}`,
    };

    const compiled = {
      enrollment,
      checkins: checkins ?? [],
      milestones: milestones ?? [],
      workbook: workbookRow ?? null,
      generatedAt: new Date().toISOString(),
    };

    // 5) upsert
    const { data: saved, error: saveErr } = await admin
      .from("mind_track_final_workbooks")
      .upsert(
        {
          enrollment_id: body.enrollmentId,
          user_id: userId,
          compiled_data: compiled,
          ai_insights: aiInsights,
          chart_data: chartData,
          completion_certificate: completionCertificate,
        },
        { onConflict: "enrollment_id" }
      )
      .select()
      .single();

    if (saveErr) {
      console.error("Save error:", saveErr);
      return json({ error: saveErr.message }, 500);
    }

    return json({ workbook: saved, cached: false });
  } catch (e) {
    console.error("compile-final-workbook error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
