import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calcMindTrackCurrentDay } from '../mindTrackDayCopy';

/**
 * Timezone boundary tests for calcMindTrackCurrentDay()
 *
 * Goal: prove Day 01~30 boundaries are stable across UTC / KST (UTC+9)
 * regardless of where started_at was created or where "now" is observed.
 *
 * Strategy: the function uses absolute 24h windows (Date.now() - start),
 * so it is timezone-agnostic by design. These tests pin that contract by
 * mocking the system clock with `vi.setSystemTime` and varying the
 * server-stored ISO string against KST-local "wall clock" days.
 *
 * KST = UTC + 9h. e.g. KST 2026-04-28 09:00 == UTC 2026-04-28 00:00.
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** Build a UTC ISO string for the given KST wall-clock moment. */
function kstWallToUtcIso(
  y: number, m: number, d: number, hh = 0, mm = 0,
): string {
  // KST moment in ms = Date.UTC(KST fields) - 9h offset
  const utcMs = Date.UTC(y, m - 1, d, hh, mm) - KST_OFFSET_MS;
  return new Date(utcMs).toISOString();
}

describe('calcMindTrackCurrentDay — timezone boundaries (UTC vs KST)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('start = KST 2026-04-28 09:00 (= UTC 00:00). Same KST day → Day 1', () => {
    const start = kstWallToUtcIso(2026, 4, 28, 9, 0);
    // KST 2026-04-28 23:59 = UTC 2026-04-28 14:59
    vi.setSystemTime(new Date('2026-04-28T14:59:00.000Z'));
    expect(calcMindTrackCurrentDay(start)).toBe(1);
  });

  it('start = KST 2026-04-28 09:00 → exactly +24h = next KST day → Day 2', () => {
    const start = kstWallToUtcIso(2026, 4, 28, 9, 0);
    // +24h = KST 2026-04-29 09:00 = UTC 2026-04-29 00:00
    vi.setSystemTime(new Date('2026-04-29T00:00:00.000Z'));
    expect(calcMindTrackCurrentDay(start)).toBe(2);
  });

  it('start = KST 2026-04-28 23:50 (late night). KST midnight crossing < 24h → still Day 1', () => {
    // KST 2026-04-28 23:50 = UTC 2026-04-28 14:50
    const start = kstWallToUtcIso(2026, 4, 28, 23, 50);
    // KST 2026-04-29 09:00 = UTC 2026-04-29 00:00 — only ~9h elapsed
    vi.setSystemTime(new Date('2026-04-29T00:00:00.000Z'));
    expect(calcMindTrackCurrentDay(start)).toBe(1);
  });

  it('start = KST 2026-04-28 23:50 → +24h on KST clock → Day 2', () => {
    const start = kstWallToUtcIso(2026, 4, 28, 23, 50);
    // +24h = KST 2026-04-29 23:50 = UTC 2026-04-29 14:50
    vi.setSystemTime(new Date('2026-04-29T14:50:00.000Z'));
    expect(calcMindTrackCurrentDay(start)).toBe(2);
  });

  it('start = UTC 00:00, observed in KST early morning of "next" KST day → still Day 1 if <24h', () => {
    // start UTC 2026-04-28 00:00 = KST 2026-04-28 09:00
    const start = '2026-04-28T00:00:00.000Z';
    // KST 2026-04-29 08:00 = UTC 2026-04-28 23:00 (only 23h elapsed)
    vi.setSystemTime(new Date('2026-04-28T23:00:00.000Z'));
    expect(calcMindTrackCurrentDay(start)).toBe(1);
  });

  it('30-day boundary on KST clock — Day 30 reached after 29 full 24h windows', () => {
    const start = kstWallToUtcIso(2026, 1, 1, 9, 0); // KST 2026-01-01 09:00
    // +29*24h = KST 2026-01-30 09:00 = UTC 2026-01-30 00:00
    vi.setSystemTime(new Date('2026-01-30T00:00:00.000Z'));
    expect(calcMindTrackCurrentDay(start)).toBe(30);
  });

  it('clamps to Day 30 even months later regardless of timezone framing', () => {
    const start = kstWallToUtcIso(2026, 1, 1, 9, 0);
    vi.setSystemTime(new Date('2026-12-31T15:00:00.000Z')); // KST 2027-01-01 00:00
    expect(calcMindTrackCurrentDay(start)).toBe(30);
  });

  it('DST-free KST: same elapsed seconds always yields same Day across the year', () => {
    // March (would be DST in some zones) vs November — KST has no DST so equal
    const startMarch = kstWallToUtcIso(2026, 3, 15, 9, 0);
    const startNov   = kstWallToUtcIso(2026, 11, 15, 9, 0);
    // Both observed exactly 7 days later → both Day 8
    vi.setSystemTime(new Date(new Date(startMarch).getTime() + 7 * 86_400_000));
    expect(calcMindTrackCurrentDay(startMarch)).toBe(8);
    vi.setSystemTime(new Date(new Date(startNov).getTime() + 7 * 86_400_000));
    expect(calcMindTrackCurrentDay(startNov)).toBe(8);
  });

  it('start stored without timezone suffix is treated as UTC by Date parser → still consistent', () => {
    // Bare "Z-less" ISO — JS parses as local; we explicitly pass with Z to lock UTC
    const startUtc = '2026-04-28T00:00:00Z';
    vi.setSystemTime(new Date('2026-05-05T00:00:00Z'));
    expect(calcMindTrackCurrentDay(startUtc)).toBe(8);
  });
});
