/**
 * 7일 트랙 — Day 번호를 화면 종류로 매핑
 *
 * 무거운 Day(1·4·7) = 전용 이벤트 화면
 * 가벼운 Day(2·3·5·6) = 5분 미션 카드
 */

export type SevenDayScreenKind =
  | "diagnosis"   // Day 1
  | "light"       // Day 2,3,5,6
  | "expert"      // Day 4
  | "report";     // Day 7

export function get7DayScreenKind(day: number): SevenDayScreenKind {
  const d = Math.min(Math.max(Math.round(day), 1), 7);
  if (d === 1) return "diagnosis";
  if (d === 4) return "expert";
  if (d === 7) return "report";
  return "light";
}

export function isHeavyDay(day: number): boolean {
  return [1, 4, 7].includes(day);
}
