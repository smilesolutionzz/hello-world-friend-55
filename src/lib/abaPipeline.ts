/**
 * ABA → B2B 데이터 공유 파이프라인
 * ──────────────────────────────────
 * client_data_consents에서 'aba' 공유에 active 동의한 사용자만 대상으로
 * aba_observations를 요약하여 익명화된 형태로 기관에 전달한다.
 *
 * 마스킹 규칙:
 *  1) user_id → SHA-like 짧은 해시(별칭) 로만 노출 (anonId)
 *  2) 닉네임(display_name) 만 사용, 실명·이메일·전화번호 절대 금지
 *  3) ABC 내러티브는 60자 이상이면 앞 60자 + … 로 truncate
 *  4) 집계 화면에서 동의자 < 5명이면 개별 카드 숨기고 평균만 노출
 *  5) 모든 조회는 institution_data_access_logs 에 audit 기록
 */
import { supabase } from "@/integrations/supabase/client";
import {
  listObservations,
  summarizeObservations,
  type ABAObservation,
  type ABASummary,
} from "./abaObservations";

export interface AnonymizedABARow {
  anonId: string;
  nickname: string;
  daysLogged: number;
  frequencyDeltaPct: number | null;
  baselineFrequency: number | null;
  finalFrequency: number | null;
  baselineDurationSec: number | null;
  finalDurationSec: number | null;
  scriptConsistencyPct: number;
  reinforcerCoveragePct: number;
  topTriggers: string[];
  completed: boolean;
}

export interface ABACohortAggregate {
  totalConsented: number;
  visibleRows: AnonymizedABARow[];
  meanFrequencyDeltaPct: number | null;
  meanScriptConsistencyPct: number;
  meanReinforcerCoveragePct: number;
  completionRatePct: number;
  topTriggersAcrossCohort: { trigger: string; count: number }[];
  suppressedDueToSmallN: boolean;
}

const MIN_COHORT_FOR_INDIVIDUAL_DISPLAY = 5;
const TRIGGER_TRUNCATE = 60;

function shortHash(input: string): string {
  // 결정적·역추적 어려운 8자 short id (sha-like). user_id를 그대로 노출하지 않기 위함.
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return `aba_${Math.abs(h).toString(36).padStart(6, "0").slice(0, 8)}`;
}

function maskNickname(name?: string | null): string {
  const trimmed = (name || "").trim();
  if (!trimmed) return "익명 보호자";
  if (trimmed.length <= 2) return `${trimmed[0]}*`;
  return `${trimmed[0]}${"*".repeat(Math.max(1, trimmed.length - 2))}${trimmed.slice(-1)}`;
}

function truncateTrigger(s: string): string {
  const t = (s || "").trim().replace(/\s+/g, " ");
  if (!t) return "";
  return t.length > TRIGGER_TRUNCATE ? `${t.slice(0, TRIGGER_TRUNCATE)}…` : t;
}

async function fetchObservationsForUser(userId: string): Promise<ABAObservation[]> {
  const { data, error } = await supabase
    .from("aba_observations")
    .select("*")
    .eq("user_id", userId)
    .order("day", { ascending: true });
  if (error) {
    console.warn("[abaPipeline] observations fetch failed", userId, error.message);
    return [];
  }
  return (data ?? []) as ABAObservation[];
}

async function logAccess(institutionId: string, accessedUserIds: string[]) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || accessedUserIds.length === 0) return;
    await supabase.from("institution_data_access_logs").insert(
      accessedUserIds.map((uid) => ({
        institution_id: institutionId,
        accessed_by: user.id,
        client_user_id: uid,
        access_type: "aba_pipeline_view",
        data_types_accessed: ["aba"],
      })),
    );
  } catch (e) {
    // best-effort
    console.warn("[abaPipeline] audit log failed", e);
  }
}

export async function getAnonymizedABASummariesForInstitution(
  institutionId: string,
): Promise<ABACohortAggregate> {
  // 1) 'aba' 공유에 active 동의한 사용자
  const { data: consents, error } = await supabase
    .from("client_data_consents")
    .select("client_user_id, shared_data_types, consent_status")
    .eq("institution_id", institutionId)
    .eq("consent_status", "active");
  if (error) throw error;

  const consentedUserIds = (consents ?? [])
    .filter((c) => Array.isArray(c.shared_data_types) && c.shared_data_types.includes("aba"))
    .map((c) => c.client_user_id);

  const totalConsented = consentedUserIds.length;
  if (totalConsented === 0) {
    return {
      totalConsented: 0,
      visibleRows: [],
      meanFrequencyDeltaPct: null,
      meanScriptConsistencyPct: 0,
      meanReinforcerCoveragePct: 0,
      completionRatePct: 0,
      topTriggersAcrossCohort: [],
      suppressedDueToSmallN: false,
    };
  }

  // 2) 닉네임
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, display_name")
    .in("user_id", consentedUserIds);

  // 3) 사용자별 observations + summary
  const perUser = await Promise.all(
    consentedUserIds.map(async (uid) => {
      const rows = await fetchObservationsForUser(uid);
      const summary = summarizeObservations(rows);
      const nickname = profiles?.find((p) => p.user_id === uid)?.display_name ?? null;
      const row: AnonymizedABARow = {
        anonId: shortHash(uid),
        nickname: maskNickname(nickname),
        daysLogged: summary.totalDaysLogged,
        frequencyDeltaPct: summary.frequencyDeltaPct,
        baselineFrequency: summary.baselineFrequency,
        finalFrequency: summary.finalFrequency,
        baselineDurationSec: summary.baselineDurationSec,
        finalDurationSec: summary.finalDurationSec,
        scriptConsistencyPct: summary.scriptConsistencyPct,
        reinforcerCoveragePct: summary.reinforcerCoveragePct,
        topTriggers: summary.abcTriggers.slice(0, 3).map(truncateTrigger).filter(Boolean),
        completed: summary.totalDaysLogged >= 5,
      };
      return row;
    }),
  );

  // 4) audit log (best-effort, RLS 에 의해 권한 없으면 무시됨)
  void logAccess(institutionId, consentedUserIds);

  // 5) 집계
  const deltas = perUser.map((r) => r.frequencyDeltaPct).filter((v): v is number => v != null);
  const meanFrequencyDeltaPct = deltas.length
    ? Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length)
    : null;
  const meanScriptConsistencyPct = Math.round(
    perUser.reduce((a, r) => a + r.scriptConsistencyPct, 0) / perUser.length,
  );
  const meanReinforcerCoveragePct = Math.round(
    perUser.reduce((a, r) => a + r.reinforcerCoveragePct, 0) / perUser.length,
  );
  const completionRatePct = Math.round(
    (perUser.filter((r) => r.completed).length / perUser.length) * 100,
  );

  const triggerCounts = new Map<string, number>();
  perUser.forEach((r) =>
    r.topTriggers.forEach((t) => triggerCounts.set(t, (triggerCounts.get(t) ?? 0) + 1)),
  );
  const topTriggersAcrossCohort = Array.from(triggerCounts.entries())
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const suppressed = totalConsented < MIN_COHORT_FOR_INDIVIDUAL_DISPLAY;
  return {
    totalConsented,
    visibleRows: suppressed ? [] : perUser,
    meanFrequencyDeltaPct,
    meanScriptConsistencyPct,
    meanReinforcerCoveragePct,
    completionRatePct,
    topTriggersAcrossCohort,
    suppressedDueToSmallN: suppressed,
  };
}

/** 본인 데이터 미리보기용 — 임원 데모에 사용할 mock fallback */
export async function getMyABAPreview(): Promise<ABASummary | null> {
  const rows = await listObservations(null);
  if (rows.length === 0) return null;
  return summarizeObservations(rows);
}

export const ABA_PIPELINE_MASKING = {
  minCohortForIndividualDisplay: MIN_COHORT_FOR_INDIVIDUAL_DISPLAY,
  triggerTruncate: TRIGGER_TRUNCATE,
} as const;
