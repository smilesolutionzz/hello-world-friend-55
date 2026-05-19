import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  computeNSMMetrics,
  computeAudienceBreakdown,
  startOfWeek,
  type NSMEnrollment,
} from "../adminNSMMetrics";

// Anchor "now" = Wed 2026-05-13 12:00 KST-agnostic (use UTC for determinism).
const NOW = new Date("2026-05-13T12:00:00.000Z");
const THIS_WEEK_START = startOfWeek(NOW); // Mon 2026-05-11

function dayOffset(base: Date, days: number, hour = 10): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function mk(over: Partial<NSMEnrollment>): NSMEnrollment {
  return {
    id: Math.random().toString(36).slice(2),
    user_id: "u",
    payment_status: "paid",
    status: null,
    current_day: null,
    started_at: null,
    completed_at: null,
    updated_at: null,
    track_type: "mind_track_7",
    ...over,
  };
}

describe("computeNSMMetrics", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it("returns zeros for empty data", () => {
    const m = computeNSMMetrics([], NOW);
    expect(m.weeklyCompleters).toBe(0);
    expect(m.prevWeekCompleters).toBe(0);
    expect(m.delta).toBe(0);
    expect(m.weeklyActivePaid).toBe(0);
    expect(m.sparkline).toEqual([0, 0, 0, 0]);
    expect(m.cohorts).toHaveLength(8);
  });

  it("counts only paid completers in current ISO week (Mon start)", () => {
    const rows: NSMEnrollment[] = [
      mk({ user_id: "a", completed_at: dayOffset(THIS_WEEK_START, 0) }),  // Mon — count
      mk({ user_id: "b", completed_at: dayOffset(THIS_WEEK_START, 2) }),  // Wed — count
      mk({ user_id: "c", payment_status: "pending", completed_at: dayOffset(THIS_WEEK_START, 1) }), // unpaid — skip
      mk({ user_id: "d", completed_at: dayOffset(THIS_WEEK_START, -1) }), // Sun (prev week) — skip
    ];
    const m = computeNSMMetrics(rows, NOW);
    expect(m.weeklyCompleters).toBe(2);
  });

  it("computes prev week from sparkline[length-2] and delta", () => {
    const rows: NSMEnrollment[] = [
      // Prev week: 2 completers
      mk({ user_id: "p1", completed_at: dayOffset(THIS_WEEK_START, -3) }),
      mk({ user_id: "p2", completed_at: dayOffset(THIS_WEEK_START, -5) }),
      // This week: 5 completers
      ...Array.from({ length: 5 }).map((_, i) =>
        mk({ user_id: `t${i}`, completed_at: dayOffset(THIS_WEEK_START, i % 6) }),
      ),
    ];
    const m = computeNSMMetrics(rows, NOW);
    expect(m.weeklyCompleters).toBe(5);
    expect(m.prevWeekCompleters).toBe(2);
    expect(m.delta).toBe(3);
    expect(m.sparkline[3]).toBe(m.weeklyCompleters); // last bucket = current
    expect(m.sparkline[2]).toBe(m.prevWeekCompleters);
  });

  it("sparkline buckets are non-overlapping and ordered oldest→newest", () => {
    const rows: NSMEnrollment[] = [
      mk({ user_id: "w0", completed_at: dayOffset(THIS_WEEK_START, -21) }), // 3주전
      mk({ user_id: "w1", completed_at: dayOffset(THIS_WEEK_START, -14) }), // 2주전
      mk({ user_id: "w1b", completed_at: dayOffset(THIS_WEEK_START, -10) }),// 2주전
      mk({ user_id: "w2", completed_at: dayOffset(THIS_WEEK_START, -7) }),  // 1주전 (Mon prev)
      mk({ user_id: "w3", completed_at: dayOffset(THIS_WEEK_START, 1) }),   // 이번 주
    ];
    const m = computeNSMMetrics(rows, NOW);
    expect(m.sparkline).toEqual([1, 2, 1, 1]);
  });

  it("WAPU dedupes by user_id within last 7 days, paid only", () => {
    const rows: NSMEnrollment[] = [
      mk({ user_id: "u1", updated_at: dayOffset(NOW, -1) }),
      mk({ user_id: "u1", updated_at: dayOffset(NOW, -2) }),
      mk({ user_id: "u2", updated_at: dayOffset(NOW, -6) }),
      mk({ user_id: "u3", updated_at: dayOffset(NOW, -10) }), // outside 7d — skip
      mk({ user_id: "u4", payment_status: "pending", updated_at: dayOffset(NOW, -1) }), // unpaid
    ];
    const m = computeNSMMetrics(rows, NOW);
    expect(m.weeklyActivePaid).toBe(2); // u1 + u2
  });

  it("cohorts bucket by started_at week and compute rate", () => {
    const rows: NSMEnrollment[] = [
      mk({ user_id: "a", started_at: dayOffset(THIS_WEEK_START, -7), completed_at: dayOffset(THIS_WEEK_START, -1) }),
      mk({ user_id: "b", started_at: dayOffset(THIS_WEEK_START, -7), status: "completed" }),
      mk({ user_id: "c", started_at: dayOffset(THIS_WEEK_START, -7) }), // not done
      mk({ user_id: "d", started_at: dayOffset(THIS_WEEK_START, 0) }), // this week, not done
    ];
    const m = computeNSMMetrics(rows, NOW);
    const prev = m.cohorts.find((c) => c.weekStart === toISODate(addDays(THIS_WEEK_START, -7)));
    expect(prev?.cohortSize).toBe(3);
    expect(prev?.completers).toBe(2);
    expect(prev?.rate).toBe(67);
  });
});

function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function toISODate(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
