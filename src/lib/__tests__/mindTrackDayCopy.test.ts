import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calcMindTrackCurrentDay, getDayCopy } from '../mindTrackDayCopy';

// 시간 기반 함수이므로 vi.useFakeTimers로 "현재 시각"을 고정해 테스트
describe('calcMindTrackCurrentDay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('null/undefined/잘못된 값은 Day 1을 반환', () => {
    expect(calcMindTrackCurrentDay(null)).toBe(1);
    expect(calcMindTrackCurrentDay(undefined)).toBe(1);
    expect(calcMindTrackCurrentDay('not-a-date')).toBe(1);
  });

  it('시작일 당일은 Day 1', () => {
    const start = '2026-04-28T00:00:00.000Z';
    vi.setSystemTime(new Date('2026-04-28T05:00:00.000Z'));
    expect(calcMindTrackCurrentDay(start)).toBe(1);
  });

  it('정확히 24시간이 지나면 Day 2', () => {
    const start = '2026-04-28T00:00:00.000Z';
    vi.setSystemTime(new Date('2026-04-29T00:00:00.000Z'));
    expect(calcMindTrackCurrentDay(start)).toBe(2);
  });

  it('23시간 59분 경과 시점은 여전히 Day 1', () => {
    const start = '2026-04-28T00:00:00.000Z';
    vi.setSystemTime(new Date('2026-04-28T23:59:00.000Z'));
    expect(calcMindTrackCurrentDay(start)).toBe(1);
  });

  it('KST 자정 직전 시작 → UTC 기준 24h 후엔 Day 2', () => {
    // KST 2026-04-28 23:50 = UTC 2026-04-28 14:50
    const startKstLate = '2026-04-28T14:50:00.000Z';
    // 24시간 후 = UTC 2026-04-29 14:50
    vi.setSystemTime(new Date('2026-04-29T14:50:00.000Z'));
    expect(calcMindTrackCurrentDay(startKstLate)).toBe(2);
  });

  it('29일 경과 = Day 30', () => {
    const start = '2026-04-01T00:00:00.000Z';
    vi.setSystemTime(new Date('2026-04-30T00:00:00.000Z'));
    expect(calcMindTrackCurrentDay(start)).toBe(30);
  });

  it('30일 초과해도 Day 30으로 클램프', () => {
    const start = '2026-01-01T00:00:00.000Z';
    vi.setSystemTime(new Date('2026-06-01T00:00:00.000Z'));
    expect(calcMindTrackCurrentDay(start)).toBe(30);
  });

  it('시작일이 미래여도 Day 1로 보정 (음수 방지)', () => {
    const start = '2026-12-31T00:00:00.000Z';
    vi.setSystemTime(new Date('2026-04-28T00:00:00.000Z'));
    expect(calcMindTrackCurrentDay(start)).toBe(1);
  });

  it('Date 객체로도 동일하게 동작', () => {
    const start = new Date('2026-04-28T00:00:00.000Z');
    vi.setSystemTime(new Date('2026-05-05T00:00:00.000Z'));
    expect(calcMindTrackCurrentDay(start)).toBe(8);
  });
});

describe('getDayCopy', () => {
  it('1~30 사이 모든 Day에 카피가 존재', () => {
    for (let d = 1; d <= 30; d++) {
      const c = getDayCopy(d);
      expect(c.title).toBeTruthy();
      expect(c.description).toBeTruthy();
      expect(c.phase).toBeTruthy();
    }
  });

  it('범위 밖 값은 1 또는 30으로 클램프', () => {
    expect(getDayCopy(0)).toEqual(getDayCopy(1));
    expect(getDayCopy(-5)).toEqual(getDayCopy(1));
    expect(getDayCopy(99)).toEqual(getDayCopy(30));
  });
});
