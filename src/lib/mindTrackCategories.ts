/**
 * Mind Track 카테고리 시스템 — 4축 다중 분류
 *
 * 트랙(MIND_TRACK_FOCUSES)은 그대로 두고, 이 파일이 각 트랙에
 * 4개 축의 태그를 부여하여 필터/추천에 사용합니다.
 *
 * - concern    : 고민/증상 (수면·스트레스·우울·불안·집중 등)
 * - lifeStage  : 생애주기 (청년·직장인·부모·중장년·시니어)
 * - role       : 역할/상황 (개인·부모·커플·관리자)
 * - intensity  : 목표 기간/난이도 (5분 가볍게 · 30일 집중 · 90일 심화)
 *
 * URL 쿼리스트링이 단일 진실: ?category=<axis>&tag=<id>[,<id>...]
 */

import type { MindTrackFocusId } from './mindTrackFocusTracks';

export type CategoryAxis = 'concern' | 'lifeStage' | 'role' | 'intensity';

export interface CategoryAxisDef {
  id: CategoryAxis;
  label: string;        // 칩 라인 헤더
  tags: { id: string; label: string; comingSoon?: boolean }[];
}

export const CATEGORY_AXES: CategoryAxisDef[] = [
  {
    id: 'concern',
    label: '내 고민으로',
    tags: [
      { id: 'sleep', label: '수면' },
      { id: 'stress', label: '스트레스' },
      { id: 'mood', label: '우울·기분' },
      { id: 'anxiety', label: '불안' },
      { id: 'focus', label: '집중력' },
      { id: 'relationship', label: '관계' },
      { id: 'self', label: '자기이해' },
      { id: 'parenting', label: '육아 번아웃' },
      { id: 'family', label: '가족·아이' },
    ],
  },
  {
    id: 'lifeStage',
    label: '내 나이로',
    tags: [
      { id: 'youth', label: '청년 (10~20대)' },
      { id: 'worker', label: '직장인 (30~40대)' },
      { id: 'parent', label: '부모' },
      { id: 'midlife', label: '중장년 (50대+)' },
      { id: 'senior', label: '시니어' },
    ],
  },
  {
    id: 'role',
    label: '역할로',
    tags: [
      { id: 'personal', label: '개인' },
      { id: 'parent', label: '부모' },
      { id: 'couple', label: '커플·부부' },
      { id: 'manager', label: '관리자·리더' },
    ],
  },
  {
    id: 'intensity',
    label: '기간으로',
    tags: [
      { id: 'focus_30', label: '30일 집중' },
      { id: 'light_5', label: '5분 가볍게', comingSoon: true },
      { id: 'deep_90', label: '90일 심화', comingSoon: true },
    ],
  },
];

export interface TrackTags {
  concern: string[];
  lifeStage: string[];
  role: string[];
  intensity: string[];
}

/**
 * 트랙별 태그 매핑 — 분류·필터·추천의 단일 진실 공급원
 */
export const TRACK_TAGS: Record<MindTrackFocusId, TrackTags> = {
  sleep: {
    concern: ['sleep', 'stress'],
    lifeStage: ['youth', 'worker', 'midlife', 'senior'],
    role: ['personal', 'manager'],
    intensity: ['focus_30'],
  },
  stress: {
    concern: ['stress', 'anxiety'],
    lifeStage: ['worker', 'parent', 'midlife'],
    role: ['personal', 'manager'],
    intensity: ['focus_30'],
  },
  mood: {
    concern: ['mood', 'anxiety', 'self'],
    lifeStage: ['youth', 'worker', 'midlife', 'senior'],
    role: ['personal'],
    intensity: ['focus_30'],
  },
  focus: {
    concern: ['focus', 'stress'],
    lifeStage: ['youth', 'worker'],
    role: ['personal', 'manager'],
    intensity: ['focus_30'],
  },
  relationship: {
    concern: ['relationship', 'stress'],
    lifeStage: ['worker', 'parent', 'midlife'],
    role: ['personal', 'couple', 'manager'],
    intensity: ['focus_30'],
  },
  self: {
    concern: ['self', 'mood'],
    lifeStage: ['youth', 'worker', 'midlife'],
    role: ['personal'],
    intensity: ['focus_30'],
  },
  parenting: {
    concern: ['parenting', 'stress', 'family'],
    lifeStage: ['parent', 'worker'],
    role: ['parent', 'couple'],
    intensity: ['focus_30'],
  },
  child_development: {
    concern: ['family', 'parenting'],
    lifeStage: ['parent'],
    role: ['parent'],
    intensity: ['focus_30'],
  },
  family_communication: {
    concern: ['family', 'relationship', 'parenting'],
    lifeStage: ['parent'],
    role: ['parent', 'couple'],
    intensity: ['focus_30'],
  },
};

/**
 * 트랙이 (axis, tag) 쌍과 매칭되는지 — 필터링용
 * tagIds가 비면 모든 트랙 통과
 */
export function matchTrack(trackId: MindTrackFocusId, axis: CategoryAxis, tagIds: string[]): boolean {
  if (!tagIds.length) return true;
  const trackTags = TRACK_TAGS[trackId]?.[axis] ?? [];
  return tagIds.some((t) => trackTags.includes(t));
}

/**
 * 추천 점수 계산 — 사용자 프로필 → 트랙별 가중 매칭
 */
export interface RecommendProfile {
  /** 검사 결과에서 위험으로 분류된 도메인 (예: ['stress', 'sleep']) */
  riskConcerns?: string[];
  /** 온보딩에서 받은 생애주기 태그 */
  lifeStage?: string;
  /** 온보딩에서 받은 역할 태그 */
  role?: string;
  /** 사용자가 직접 선택한 1차 목표 (있으면 강하게 가중) */
  primaryGoal?: MindTrackFocusId | null;
}

export interface RecommendResult {
  trackId: MindTrackFocusId;
  score: number;
  reasons: string[];
}

export function recommendTracks(profile: RecommendProfile, topN = 3): RecommendResult[] {
  const trackIds = Object.keys(TRACK_TAGS) as MindTrackFocusId[];
  const results: RecommendResult[] = trackIds.map((id) => {
    const tags = TRACK_TAGS[id];
    let score = 0;
    const reasons: string[] = [];

    if (profile.primaryGoal === id) {
      score += 5;
      reasons.push('목표로 선택한 트랙');
    }
    for (const c of profile.riskConcerns ?? []) {
      if (tags.concern.includes(c)) {
        score += 3;
        reasons.push(`${c} 영역 매칭`);
      }
    }
    if (profile.lifeStage && tags.lifeStage.includes(profile.lifeStage)) {
      score += 1;
      reasons.push('생애주기 매칭');
    }
    if (profile.role && tags.role.includes(profile.role)) {
      score += 1;
      reasons.push('역할 매칭');
    }

    return { trackId: id, score, reasons };
  });

  return results
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

export function getAxis(id: string | null | undefined): CategoryAxisDef | null {
  return CATEGORY_AXES.find((a) => a.id === id) ?? null;
}
