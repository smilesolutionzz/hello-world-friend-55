/**
 * Admin NSM metric pure functions — extracted from AdminNSMHero for testability.
 *
 * NSM = 7일 마음 트랙 주간 완주자 수 (Weekly Completers, paid)
 * WAPU = Weekly Active Paid Users (paid + updated_at ≥ now-7d, unique user)
 * Sparkline = 최근 4주(가장 오래된 → 이번 주) paid 완주자 수
 * Cohort = 최근 8주 시작 paid의 시작 주 기준 완주율
 */

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

  const paid = rows.filter((r) => r.payment_status === "paid");

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
