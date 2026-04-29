/**
 * Mind Track Day별 추천 검사 매핑.
 *
 * 자체 플랫폼 검사를 미션의 일부로 진행하게 만들기 위한 단일 진실 공급원.
 * - Day 1: 스트레스 (가장 보편적, 첫 진단으로 적합)
 * - Day 2: 우울감 (스트레스 다음 단계로 자연스러운 흐름)
 *
 * 추후 baseline의 track_type을 보고 매핑을 다양화할 수 있도록 함수형으로 둠.
 */

export interface AssessmentRecommendation {
  /** localStorage 키 등에 사용되는 식별자 */
  id: string;
  /** 사용자 노출 제목 */
  title: string;
  /** 1줄 설명 */
  desc: string;
  /** 인앱 라우트 */
  route: string;
  /** 예상 소요 분 */
  minutes: number;
  /** 한줄 동기 — "왜 이걸 지금 해야 하는가" */
  why: string;
}

const RECS: Record<number, AssessmentRecommendation> = {
  1: {
    id: "stress-baseline",
    title: "스트레스 베이스라인 진단",
    desc: "오늘의 긴장도와 회복 여력을 객관 점수로 측정합니다",
    route: "/stress-package",
    minutes: 5,
    why: "30일 변화 그래프의 0번째 점이 됩니다. 이걸 찍어두지 않으면 변화량을 잴 수 없어요.",
  },
  2: {
    id: "mood-depression-check",
    title: "마음 무게(우울감) 진단",
    desc: "최근 2주 마음의 무게를 단계별로 짚어봅니다",
    route: "/depression-package",
    minutes: 6,
    why: "스트레스만으로는 보이지 않는 마음의 두 번째 층을 확인해, 미션을 더 정확히 맞춤화합니다.",
  },
};

export function getAssessmentForDay(day: number): AssessmentRecommendation | null {
  return RECS[day] ?? null;
}

/** localStorage 키 — enrollment + day 단위로 검사 완료 여부 기록 */
export function assessmentMissionStorageKey(enrollmentId: string, day: number) {
  return `mt-assessment-mission-${enrollmentId}-${day}`;
}

export function isAssessmentMissionCompleted(enrollmentId: string | undefined, day: number): boolean {
  if (!enrollmentId || typeof window === "undefined") return false;
  try {
    return !!window.localStorage.getItem(assessmentMissionStorageKey(enrollmentId, day));
  } catch {
    return false;
  }
}

export function markAssessmentMissionCompleted(enrollmentId: string, day: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      assessmentMissionStorageKey(enrollmentId, day),
      new Date().toISOString(),
    );
  } catch {
    /* noop */
  }
}
