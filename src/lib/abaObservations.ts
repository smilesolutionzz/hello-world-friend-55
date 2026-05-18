/**
 * ABA Observations — CRUD + summary helpers for 7-day child development track.
 * mem://features/observation, RLS: 본인만.
 */
import { supabase } from "@/integrations/supabase/client";
import { ABA_CHILD_CURRICULUM_7D, type ABADay } from "./abaChildCurriculum";

export interface ABAObservation {
  id?: string;
  user_id?: string;
  enrollment_id?: string | null;
  child_profile_id?: string | null;
  day: number;
  phase: string;
  target_behavior?: string | null;
  data_method: "frequency" | "duration" | "interval" | "abc_narrative";
  frequency_count?: number | null;
  duration_seconds?: number | null;
  interval_hits?: number | null;
  interval_total?: number | null;
  abc_antecedent?: string | null;
  abc_behavior?: string | null;
  abc_consequence?: string | null;
  reinforcer_used?: string | null;
  parent_script_used?: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

const TABLE = "aba_observations" as const;

function curriculumDataMethod(day: number): ABAObservation["data_method"] {
  const d = ABA_CHILD_CURRICULUM_7D.find((x) => x.day === day);
  if (!d) return "frequency";
  return d.dataMethod === "ABC narrative" ? "abc_narrative" : (d.dataMethod as ABAObservation["data_method"]);
}

export function defaultObservationForDay(day: number, childProfileId?: string | null, enrollmentId?: string | null): ABAObservation {
  const d = ABA_CHILD_CURRICULUM_7D.find((x) => x.day === day) as ABADay;
  return {
    day,
    phase: d?.phase ?? "Baseline",
    data_method: curriculumDataMethod(day),
    child_profile_id: childProfileId ?? null,
    enrollment_id: enrollmentId ?? null,
    parent_script_used: false,
  };
}

export async function listObservations(childProfileId?: string | null): Promise<ABAObservation[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  let q = supabase.from(TABLE).select("*").eq("user_id", user.id).order("day", { ascending: true });
  if (childProfileId) q = q.eq("child_profile_id", childProfileId);
  else q = q.is("child_profile_id", null);
  const { data, error } = await q;
  if (error) {
    console.warn("[aba] list failed", error.message);
    return [];
  }
  return (data ?? []) as ABAObservation[];
}

export async function upsertObservation(obs: ABAObservation): Promise<ABAObservation | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const payload = { ...obs, user_id: user.id };
  // unique (user_id, day, COALESCE(child_profile_id, sentinel)) → upsert via select+update/insert manually
  const existingQ = supabase.from(TABLE).select("id").eq("user_id", user.id).eq("day", obs.day);
  const { data: existing } = obs.child_profile_id
    ? await existingQ.eq("child_profile_id", obs.child_profile_id).maybeSingle()
    : await existingQ.is("child_profile_id", null).maybeSingle();
  if (existing?.id) {
    const { data, error } = await supabase.from(TABLE).update(payload).eq("id", existing.id).select().maybeSingle();
    if (error) { console.warn("[aba] update failed", error.message); return null; }
    return data as ABAObservation;
  }
  const { data, error } = await supabase.from(TABLE).insert(payload).select().maybeSingle();
  if (error) { console.warn("[aba] insert failed", error.message); return null; }
  return data as ABAObservation;
}

export interface ABASummary {
  totalDaysLogged: number;
  baselineFrequency: number | null;
  finalFrequency: number | null;
  frequencyDeltaPct: number | null;
  baselineDurationSec: number | null;
  finalDurationSec: number | null;
  abcTriggers: string[];
  scriptConsistencyPct: number;
  reinforcerCoveragePct: number;
  byDay: Record<number, ABAObservation | undefined>;
}

export function summarizeObservations(rows: ABAObservation[]): ABASummary {
  const byDay: Record<number, ABAObservation | undefined> = {};
  for (const r of rows) byDay[r.day] = r;

  const freqDay = (n: number) => byDay[n]?.frequency_count ?? null;
  const durDay = (n: number) => byDay[n]?.duration_seconds ?? null;

  const baselineFrequency = freqDay(1);
  // Final = latest day with frequency (prefer 6, fallback 7,5,4,3)
  const finalFrequency = [6, 7, 5, 4, 3].map(freqDay).find((v) => v != null) ?? null;
  let frequencyDeltaPct: number | null = null;
  if (baselineFrequency != null && finalFrequency != null && baselineFrequency > 0) {
    frequencyDeltaPct = Math.round(((finalFrequency - baselineFrequency) / baselineFrequency) * 100);
  }

  const baselineDurationSec = durDay(1);
  const finalDurationSec = [6, 7, 5].map(durDay).find((v) => v != null) ?? null;

  const abcTriggers = rows
    .map((r) => (r.abc_antecedent || "").trim())
    .filter((s) => s.length > 0);

  const logged = rows.length;
  const scriptHits = rows.filter((r) => r.parent_script_used).length;
  const reinforcerHits = rows.filter((r) => (r.reinforcer_used || "").trim().length > 0).length;

  return {
    totalDaysLogged: logged,
    baselineFrequency,
    finalFrequency,
    frequencyDeltaPct,
    baselineDurationSec,
    finalDurationSec,
    abcTriggers,
    scriptConsistencyPct: logged ? Math.round((scriptHits / logged) * 100) : 0,
    reinforcerCoveragePct: logged ? Math.round((reinforcerHits / logged) * 100) : 0,
    byDay,
  };
}

export function isTrackCompletable(rows: ABAObservation[]): boolean {
  // 7일 중 최소 5일 + Day 1 베이스라인 + Day 6 또는 7 데이터
  if (rows.length < 5) return false;
  const days = new Set(rows.map((r) => r.day));
  return days.has(1) && (days.has(6) || days.has(7));
}
