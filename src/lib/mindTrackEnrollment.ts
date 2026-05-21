// Centralized helper: every "start 30-day mind track" entry point should call
// `ensureMindTrackEnrollment()` BEFORE `pay('mind_track_30')`.
// This guarantees an enrollment row exists (status=pending) so the post-payment
// flow (PaymentComplete → MindTrackStart → mind-track-init) never fails with
// "no active track found". It also seeds baseline data from the Quiz onboarding
// answers so MindTrackStart can skip the 12-question diagnostic.

import { supabase } from "@/integrations/supabase/client";

export const MIND_TRACK_PRICE = 19900;

export interface QuizSeed {
  goal?: string | null;
  concern?: string | null;
  // Optional pre-computed scores 0-100 (from Quiz state/duration sliders)
  stressScore?: number | null;
  energyScore?: number | null;
  clarityScore?: number | null;
  lifeStage?: string | null;
  ageRange?: string | null;
}

export interface EnsureResult {
  enrollmentId: string | null;
  hasBaseline: boolean;
  error?: string;
}

/** Read seed values from user_onboarding_data + localStorage quiz_data. */
async function loadQuizSeed(userId: string): Promise<QuizSeed> {
  const seed: QuizSeed = {};

  // 1) DB (preferred)
  try {
    const { data } = await supabase
      .from("user_onboarding_data")
      .select(
        "primary_goal, free_text_concern, current_mood_score, issue_duration, life_stage, age_range",
      )
      .eq("user_id", userId)
      .maybeSingle();
    if (data) {
      seed.goal = (data as any).primary_goal ?? null;
      seed.concern = (data as any).free_text_concern ?? null;
      seed.lifeStage = (data as any).life_stage ?? null;
      seed.ageRange = (data as any).age_range ?? null;

      // Convert mood (1-10) + duration to 0-100 baseline scores
      const mood = Number((data as any).current_mood_score);
      if (Number.isFinite(mood)) {
        // mood: 1=worst, 10=best → energy & clarity scale up with mood, stress inverse
        const moodPct = Math.max(0, Math.min(100, Math.round((mood / 10) * 100)));
        seed.energyScore = moodPct;
        seed.clarityScore = moodPct;
        seed.stressScore = 100 - moodPct;
      }
    }
  } catch (e) {
    console.warn("[mindTrackEnrollment] onboarding load failed", e);
  }

  // 2) localStorage fallback (guest -> just signed up)
  if (!seed.goal || !seed.concern) {
    try {
      const raw = localStorage.getItem("quiz_data");
      if (raw) {
        const q = JSON.parse(raw);
        seed.goal = seed.goal || q.goal || null;
        seed.concern = seed.concern || q.concern || null;
        seed.lifeStage = seed.lifeStage || q.lifestage || null;
        seed.ageRange = seed.ageRange || q.age || null;
        if (
          seed.stressScore == null &&
          typeof q.state === "number" &&
          q.state > 0
        ) {
          // q.state likely 1-10
          const moodPct = Math.max(0, Math.min(100, Math.round((q.state / 10) * 100)));
          seed.energyScore = moodPct;
          seed.clarityScore = moodPct;
          seed.stressScore = 100 - moodPct;
        }
      }
    } catch {
      /* ignore */
    }
  }

  return seed;
}

/**
 * Ensure a mind_track_enrollments row exists for this user.
 * - If a non-completed enrollment exists, reuse it (and refresh seed data).
 * - Otherwise insert a new pending one.
 * Returns the enrollment id and whether baseline scores were seeded (so
 * MindTrackStart can skip the 12-question diagnostic).
 */
export type MindTrackPlan = '7d' | '30d';
export type MindTrackAudience = 'child' | 'adult' | 'parent' | 'teen';

export async function ensureMindTrackEnrollment(
  overrides: QuizSeed = {},
  plan: MindTrackPlan = '7d',
  audience: MindTrackAudience = 'child',
): Promise<EnsureResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { enrollmentId: null, hasBaseline: false, error: "not_authenticated" };

  const dbSeed = await loadQuizSeed(user.id);
  const seed: QuizSeed = { ...dbSeed, ...Object.fromEntries(
    Object.entries(overrides).filter(([, v]) => v != null && v !== ""),
  ) };

  const goalFocus = seed.goal || "stress"; // safe default
  const hasBaseline =
    seed.stressScore != null && seed.energyScore != null && seed.clarityScore != null;

  const baselineData = hasBaseline
    ? {
        stress_score: seed.stressScore,
        energy_score: seed.energyScore,
        clarity_score: seed.clarityScore,
        primary_concern: seed.concern || null,
        source: "quiz_onboarding",
        seeded_at: new Date().toISOString(),
      }
    : seed.concern
    ? { primary_concern: seed.concern, source: "quiz_onboarding" }
    : null;

  // Look for existing enrollment we can reuse (pending OR active without workbook)
  const { data: existing } = await supabase
    .from("mind_track_enrollments")
    .select("id, payment_status, baseline_data")
    .eq("user_id", user.id)
    .neq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const patch: Record<string, unknown> = {
      goal_focus: goalFocus,
      audience,
      // ❗ 기존 enrollment가 다른 트랙(예: 30일)일 수 있으니 plan에 맞춰 강제 동기화
      track_type: plan === '7d' ? 'mind_7day' : 'mind_30day',
    };
    if (baselineData) {
      const prev = (existing.baseline_data && typeof existing.baseline_data === "object" && !Array.isArray(existing.baseline_data))
        ? (existing.baseline_data as Record<string, unknown>)
        : {};
      patch.baseline_data = { ...prev, ...baselineData };
    }
    await supabase.from("mind_track_enrollments").update(patch).eq("id", existing.id);
    return { enrollmentId: existing.id, hasBaseline };
  }

  // 파트너 센터 추천 슬러그 (CenterReferralLanding에서 저장됨)
  let referrerSlug: string | null = null;
  let referrerOrgId: string | null = null;
  try {
    referrerSlug = localStorage.getItem("referrer_org_slug");
    if (referrerSlug) {
      const { data: orgData } = await supabase.rpc("get_partner_org_by_slug", {
        _slug: referrerSlug,
      });
      const row = Array.isArray(orgData) && orgData.length > 0 ? (orgData[0] as { id: string }) : null;
      if (row?.id) referrerOrgId = row.id;
    }
  } catch {
    /* ignore */
  }

  const { data: created, error } = await supabase
    .from("mind_track_enrollments")
    .insert({
      user_id: user.id,
      track_type: plan === '7d' ? "mind_7day" : "mind_30day",
      audience,
      goal_focus: goalFocus,
      payment_status: "pending",
      payment_amount: plan === '7d' ? 7900 : MIND_TRACK_PRICE,
      baseline_data: baselineData ?? {},
      referrer_org_id: referrerOrgId,
      referrer_slug: referrerSlug,
    })
    .select("id")
    .single();

  if (error || !created) {
    console.error("[mindTrackEnrollment] insert failed", error);
    return { enrollmentId: null, hasBaseline: false, error: error?.message };
  }
  return { enrollmentId: created.id, hasBaseline };
}

/**
 * Start a 3-day FREE trial of the 7-day Mind Track.
 * - Reuses (or creates) an enrollment for the user.
 * - Sets payment_status='trial' and started_at=now so Day 1 begins immediately.
 * - Day 4+ gates show an upgrade paywall (handled in Dashboard).
 * NO card required. Conversion happens on Day 4.
 */
export async function startMindTrackTrial(
  overrides: QuizSeed = {},
  audience: MindTrackAudience = 'child',
): Promise<EnsureResult> {
  const ensured = await ensureMindTrackEnrollment(overrides, '7d', audience);
  if (!ensured.enrollmentId) return ensured;

  const nowIso = new Date().toISOString();
  const { error } = await supabase
    .from('mind_track_enrollments')
    .update({
      payment_status: 'trial',
      status: 'active',
      started_at: nowIso,
      current_day: 1,
    })
    .eq('id', ensured.enrollmentId)
    // only flip if it isn't already paid/completed
    .in('payment_status', ['pending', 'trial']);

  if (error) {
    console.warn('[mindTrackEnrollment] trial activation failed', error);
    return { ...ensured, error: error.message };
  }
  return ensured;
}

/** Poll for the enrollment becoming payment_status='completed' after Toss confirm. */
export async function waitForCompletedEnrollment(
  timeoutMs = 12_000,
  intervalMs = 800,
): Promise<{ id: string; hasBaseline: boolean } | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const { data } = await supabase
      .from("mind_track_enrollments")
      .select("id, baseline_data")
      .eq("user_id", user.id)
      .eq("payment_status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.id) {
      const b = (data.baseline_data as any) || {};
      const hasBaseline =
        typeof b.stress_score === "number" &&
        typeof b.energy_score === "number" &&
        typeof b.clarity_score === "number";
      return { id: data.id, hasBaseline };
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return null;
}
