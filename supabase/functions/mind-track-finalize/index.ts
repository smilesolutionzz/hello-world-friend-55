// Triggered when user reaches Day 30 of Mind Track.
// Generates a comprehensive completion report and sends a transactional email.
// Idempotent: safe to call multiple times — only acts once per enrollment.
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
      { global: { headers: { Authorization: authHeader } } }
    );
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { enrollmentId } = await req.json();
    if (!enrollmentId) throw new Error("enrollmentId required");

    // Load enrollment + workbook + checkins + baselines
    const [{ data: enrollment }, { data: workbook }, { data: checkins }, { data: baselines }] =
      await Promise.all([
        supabase.from("mind_track_enrollments").select("*").eq("id", enrollmentId).maybeSingle(),
        supabase.from("mind_track_workbooks").select("*").eq("enrollment_id", enrollmentId).maybeSingle(),
        supabase.from("mind_track_checkins").select("*").eq("enrollment_id", enrollmentId).order("day_number"),
        supabase.from("mind_track_baseline_assessments").select("*").eq("enrollment_id", enrollmentId).order("created_at"),
      ]);

    if (!enrollment) throw new Error("Enrollment not found");
    if (enrollment.user_id !== user.id) throw new Error("Forbidden");

    // Idempotency: already finalized?
    if (enrollment.status === "completed" && enrollment.completed_at) {
      return new Response(
        JSON.stringify({ success: true, alreadyCompleted: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const baseline = baselines?.find((b: any) => b.measurement_point === "baseline");
    const completedCount = (checkins ?? []).filter((c: any) => c.completed).length;

    // Compute final scores from latest 7 check-ins (or fall back to baseline)
    const recent = (checkins ?? []).filter((c: any) => c.completed).slice(-7);
    const avg = (key: string) =>
      recent.length > 0
        ? Math.round(recent.reduce((s: number, c: any) => s + (c[key] ?? 0), 0) / recent.length * 10)
        : baseline?.[key === "mood_score" ? "stress_score" : key.replace("_score", "_score")] ?? 50;

    const finalStress = baseline ? Math.max(0, baseline.stress_score - (recent.length > 0 ? Math.round(recent.reduce((s: number, c: any) => s + (10 - (c.mood_score ?? 5)), 0) / recent.length * 10) - 30 : 0)) : 50;
    const finalEnergy = recent.length > 0 ? Math.round(recent.reduce((s: number, c: any) => s + (c.energy_score ?? 5), 0) / recent.length * 10) : baseline?.energy_score ?? 50;
    const finalClarity = recent.length > 0 ? Math.round(recent.reduce((s: number, c: any) => s + (c.clarity_score ?? 5), 0) / recent.length * 10) : baseline?.clarity_score ?? 50;

    // Save final baseline measurement (post-30d)
    await supabase.from("mind_track_baseline_assessments").insert({
      user_id: user.id,
      enrollment_id: enrollmentId,
      assessment_mode: enrollment.assessment_mode ?? "quick",
      measurement_point: "post_30d",
      stress_score: finalStress,
      energy_score: finalEnergy,
      clarity_score: finalClarity,
    });

    const stressDelta = baseline ? baseline.stress_score - finalStress : 0; // positive = stress reduced
    const energyDelta = baseline ? finalEnergy - baseline.energy_score : 0;
    const clarityDelta = baseline ? finalClarity - baseline.clarity_score : 0;

    // Mark enrollment completed
    await supabase
      .from("mind_track_enrollments")
      .update({ status: "completed", completed_at: new Date().toISOString(), current_day: 30 })
      .eq("id", enrollmentId);

    // Look up user email + nickname
    const { data: profile } = await admin
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle();

    const recipientEmail = user.email;
    const nickname = profile?.display_name ?? null;

    // Send completion email (transactional)
    if (recipientEmail) {
      try {
        await admin.functions.invoke("send-transactional-email", {
          body: {
            templateName: "mind-track-completion",
            recipientEmail,
            idempotencyKey: `mind-track-completion-${enrollmentId}`,
            templateData: {
              nickname,
              challengeTheme: workbook?.challenge_theme ?? "30일 마음 변화 트랙",
              stressDelta,
              energyDelta,
              clarityDelta,
              completedDays: completedCount,
              reportUrl: "https://aihpro.app/mind-track/workbook",
            },
          },
        });
      } catch (mailErr) {
        console.error("completion email send failed:", mailErr);
        // Do not fail the whole finalization on email error
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        completedCount,
        stressDelta,
        energyDelta,
        clarityDelta,
        emailSent: !!recipientEmail,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("mind-track-finalize error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
