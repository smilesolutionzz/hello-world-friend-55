/**
 * Admin NSM metric pure functions — extracted from AdminNSMHero for testability.
 *
 * NSM = 7일 마음 트랙 주간 완주자 수 (Weekly Completers, paid)
 * WAPU = Weekly Active Paid Users (paid + updated_at ≥ now-7d, unique user)
 * Sparkline = 최근 4주(가장 오래된 → 이번 주) paid 완주자 수
 * Cohort = 최근 8주 시작 paid의 시작 주 기준 완주율
 *
 * IMPORTANT — payment_status 표기 표준:
 * 운영 데이터에는 'completed'(Toss confirm 후) 와 과거 'paid' 가 혼재한다.
 * 따라서 "결제 완료" 판정은 항상 PAID_STATUSES 집합으로 한다.
 * 'pending' / 'failed' / 'refunded' / 'cancelled' 은 결제 미완료로 간주.
 *
 * status = enrollment 라이프사이클:
 *   pending → active → completed
 *   cancelled = 사용자 취소(완주/재구매 대상에서 제외)
 */

export type Audience = 'child' | 'adult' | 'parent' | 'teen';

/** payment_status 가 "결제 완료"로 인정되는 값들 — DB 가 'completed' 또는 과거 'paid' 사용 */
export const PAID_STATUSES = new Set(['paid', 'completed']);
/** 재구매·완주 계산에서 제외할 enrollment 라이프사이클 상태 */
export const EXCLUDED_LIFECYCLE_STATUSES = new Set(['cancelled', 'canceled', 'refunded']);

export const isPaidEnrollment = (r: { payment_status: string | null; status: string | null }) =>
  PAID_STATUSES.has((r.payment_status ?? '').toLowerCase()) &&
  !EXCLUDED_LIFECYCLE_STATUSES.has((r.status ?? '').toLowerCase());

export interface NSMEnrollment {
  id: string;
  user_id: string;
  payment_status: string | null;
  status: string | null;
  current_day: number | null;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string | null;
  track_type: string | null;
  audience?: string | null;
  created_at?: string | null;
}

export interface AudienceBreakdownRow {
  audience: Audience | 'unknown';
  totalEnrollments: number;       // 시작(=insert) 카운트 (row 단위)
  uniqueStarters: number;         // 고유 사용자 수 (중복 시도 제외)
  paidEnrollments: number;        // 결제 완료 row 수 (cancelled 제외)
  uniquePaidUsers: number;        // 결제 완료한 고유 사용자
  conversionRate: number;         // uniquePaidUsers / uniqueStarters (%)  — 사용자 기준이 정확
  completers: number;
  completionRate: number;         // completers / paidEnrollments (%)
  repeatPaidUsers: number;        // 결제 ≥2회 한 사용자
  repeatRate: number;             // repeatPaidUsers / uniquePaidUsers (%)
}

export interface CohortRow {
  weekStart: string;
  cohortSize: number;
  completers: number;
  rate: number;
}

export interface NSMMetrics {
  weeklyCompleters: number;
  prevWeekCompleters: number;
  delta: number;
  weeklyActivePaid: number;
  /** 4 entries oldest→newest, last entry === weeklyCompleters */
  sparkline: number[];
  cohorts: CohortRow[];
}

export function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay(); // 0 = Sun
  const diff = (day + 6) % 7; // Monday start
  x.setDate(x.getDate() - diff);
  return x;
}

export function fmtWeek(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function computeNSMMetrics(
  rows: NSMEnrollment[],
  now: Date = new Date(),
): NSMMetrics {
  const thisWeekStart = startOfWeek(now);
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);

  const paid = rows.filter(isPaidEnrollment);

  const weeklyCompleters = paid.filter(
    (r) => r.completed_at && new Date(r.completed_at) >= thisWeekStart,
  ).length;

  const weeklyActivePaid = new Set(
    paid
      .filter((r) => r.updated_at && new Date(r.updated_at) >= oneWeekAgo)
      .map((r) => r.user_id),
  ).size;

  // Sparkline: index 0 = 3주전, index 3 = 이번 주
  const sparkline: number[] = [];
  for (let i = 3; i >= 0; i--) {
    const wStart = new Date(thisWeekStart);
    wStart.setDate(wStart.getDate() - i * 7);
    const wEnd = new Date(wStart);
    wEnd.setDate(wEnd.getDate() + 7);
    const count = paid.filter(
      (r) =>
        r.completed_at &&
        new Date(r.completed_at) >= wStart &&
        new Date(r.completed_at) < wEnd,
    ).length;
    sparkline.push(count);
  }
  const prevWeekCompleters = sparkline[sparkline.length - 2] ?? 0;
  const delta = weeklyCompleters - prevWeekCompleters;

  // Cohorts: 8 weeks, by started_at week
  const cohortMap = new Map<string, { size: number; done: number }>();
  for (let i = 7; i >= 0; i--) {
    const wStart = new Date(thisWeekStart);
    wStart.setDate(wStart.getDate() - i * 7);
    cohortMap.set(fmtWeek(wStart), { size: 0, done: 0 });
  }
  paid
    .filter((r) => !!r.started_at)
    .forEach((r) => {
      const wk = fmtWeek(startOfWeek(new Date(r.started_at!)));
      const c = cohortMap.get(wk);
      if (!c) return;
      c.size += 1;
      if (r.status === "completed" || r.completed_at) c.done += 1;
    });
  const cohorts: CohortRow[] = Array.from(cohortMap.entries()).map(
    ([weekStart, v]) => ({
      weekStart,
      cohortSize: v.size,
      completers: v.done,
      rate: v.size > 0 ? Math.round((v.done / v.size) * 100) : 0,
    }),
  );

  return {
    weeklyCompleters,
    prevWeekCompleters,
    delta,
    weeklyActivePaid,
    sparkline,
    cohorts,
  };
}

const AUDIENCES: (Audience | 'unknown')[] = ['child', 'adult', 'parent', 'teen', 'unknown'];

/**
 * Per-audience breakdown.
 * 정확성 보장:
 *  - 결제전환율 = unique paid users / unique starters  (row-level이 아니라 사용자 단위)
 *  - 완주율   = completers(row) / paid rows           (한 사람이 2번 결제 → 2번 카운트 가능)
 *  - 재구매율 = (≥2 paid 사용자) / unique paid users
 *  - cancelled / refunded enrollment 은 paid 집합에서 제외
 */
export function computeAudienceBreakdown(rows: NSMEnrollment[]): AudienceBreakdownRow[] {
  return AUDIENCES.map((aud) => {
    const subset = rows.filter((r) => {
      const a = (r.audience ?? 'child') as Audience;
      if (aud === 'unknown') return !r.audience;
      return a === aud;
    });
    const total = subset.length;
    const uniqueStarters = new Set(subset.map((r) => r.user_id)).size;
    const paid = subset.filter(isPaidEnrollment);
    const completers = paid.filter(
      (r) => r.status === 'completed' || r.completed_at,
    ).length;
    const userPaidCount = new Map<string, number>();
    paid.forEach((r) => userPaidCount.set(r.user_id, (userPaidCount.get(r.user_id) ?? 0) + 1));
    const uniquePaidUsers = userPaidCount.size;
    const repeatPaidUsers = Array.from(userPaidCount.values()).filter((n) => n >= 2).length;
    const pct = (num: number, den: number) =>
      den > 0 ? Math.round((num / den) * 1000) / 10 : 0;
    return {
      audience: aud,
      totalEnrollments: total,
      uniqueStarters,
      paidEnrollments: paid.length,
      uniquePaidUsers,
      conversionRate: pct(uniquePaidUsers, uniqueStarters),
      completers,
      completionRate: pct(completers, paid.length),
      repeatPaidUsers,
      repeatRate: pct(repeatPaidUsers, uniquePaidUsers),
    };
  }).filter((r) => r.totalEnrollments > 0 || ['child', 'adult', 'parent'].includes(r.audience));
}
