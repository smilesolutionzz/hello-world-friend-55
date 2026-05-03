/**
 * Mind Track 니즈 트랙 — 단일 진실 공급원 (Single Source of Truth)
 *
 * `MindTrack.tsx`의 트랙 선택 UI, 결제 후 `goal_focus`로 저장된 값,
 * Day별 콘텐츠 분기, 대시보드/이메일 트랙 배지 표시 등 모든 곳에서
 * 이 파일의 ID/레이블/색을 사용합니다.
 *
 * ID는 절대 변경 금지 — 이미 저장된 enrollment.goal_focus와 매칭됩니다.
 */

export type MindTrackFocusId =
  | 'sleep'
  | 'stress'
  | 'mood'
  | 'focus'
  | 'relationship'
  | 'self'
  | 'parenting'
  | 'child_development'
  | 'family_communication';

export interface MindTrackFocus {
  id: MindTrackFocusId;
  /** 사용자 노출 명칭 (예: "깊은 수면 회복") */
  label: string;
  /** 1줄 설명 */
  desc: string;
  /** 이모지 아이콘 (선택 화면) */
  icon: string;
  /** 톤 — 대시보드 배지/이메일 강조 색상 */
  badgeClass: string;
  /** 30일 흐름의 핵심 주제 (주차별 4단계) */
  weeklyThemes: [string, string, string, string];
  /** 카테고리 — Personal | Family */
  category: 'personal' | 'family';
}

export const MIND_TRACK_FOCUSES: MindTrackFocus[] = [
  {
    id: 'sleep',
    label: '깊은 수면 회복',
    desc: '잠 못 드는 밤, 무거운 아침에서 벗어나기',
    icon: '🌙',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    weeklyThemes: ['수면 패턴 진단', '취침 전 이완 루틴', '각성 신호 다스리기', '수면 리듬 고정'],
    category: 'personal',
  },
  {
    id: 'stress',
    label: '스트레스 다스리기',
    desc: '일상 속 긴장과 압박감을 다루는 힘 기르기',
    icon: '🌿',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    weeklyThemes: ['긴장 신호 인식', '호흡·이완 루틴', '인지 재구성', '회복 루틴 정착'],
    category: 'personal',
  },
  {
    id: 'mood',
    label: '감정 안정',
    desc: '오르내리는 기분을 부드럽게 조율하기',
    icon: '☀️',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    weeklyThemes: ['감정 라벨링', '수용과 거리두기', '자기자비', '감정 회복 루틴'],
    category: 'personal',
  },
  {
    id: 'focus',
    label: '집중력 회복',
    desc: '산만함을 줄이고 일상 효율 끌어올리기',
    icon: '🎯',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    weeklyThemes: ['주의 패턴 진단', '디지털 절제', '딥워크 블록', '에너지 관리'],
    category: 'personal',
  },
  {
    id: 'relationship',
    label: '관계 개선',
    desc: '가족·동료와의 소통 결을 다듬기',
    icon: '🤝',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    weeklyThemes: ['관계 패턴 인식', '경청·공감 연습', '경계 세우기', '회복적 대화'],
    category: 'personal',
  },
  {
    id: 'self',
    label: '자기 이해 심화',
    desc: '내 패턴을 알고 새로운 루틴 만들기',
    icon: '🪞',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
    weeklyThemes: ['핵심 가치 탐색', '강점·그림자 통합', '내면 대화', '정체성 정렬'],
    category: 'personal',
  },
  {
    id: 'parenting',
    label: '육아 번아웃 회복',
    desc: '엄마·아빠의 지친 마음을 회복하는 30일',
    icon: '🤱',
    badgeClass: 'bg-pink-50 text-pink-700 border-pink-200',
    weeklyThemes: ['번아웃 신호 인식', '나만의 회복 시간', '감정 분리', '지속 가능한 루틴'],
    category: 'family',
  },
  {
    id: 'child_development',
    label: '아이 발달 코칭',
    desc: '연령별 발달 포인트와 부모 대응법 익히기',
    icon: '🌱',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    weeklyThemes: ['발달 지표 이해', '관찰·기록', '발달 자극 활동', '주간 점검 루틴'],
    category: 'family',
  },
  {
    id: 'family_communication',
    label: '아이와의 소통',
    desc: '훈육 갈등 줄이고 안정 애착 만들기',
    icon: '💕',
    badgeClass: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    weeklyThemes: ['감정 코칭', '경청·반영', '훈육 언어', '애착 회복 루틴'],
    category: 'family',
  },
];

const FOCUS_BY_ID = new Map(MIND_TRACK_FOCUSES.map((f) => [f.id, f]));

export function getFocus(id: string | null | undefined): MindTrackFocus {
  if (id && FOCUS_BY_ID.has(id as MindTrackFocusId)) {
    return FOCUS_BY_ID.get(id as MindTrackFocusId)!;
  }
  // 안전 기본값 — 가장 보편 트랙
  return FOCUS_BY_ID.get('stress')!;
}

export function getFocusLabel(id: string | null | undefined): string {
  return getFocus(id).label;
}

export function isValidFocusId(id: string | null | undefined): id is MindTrackFocusId {
  return !!id && FOCUS_BY_ID.has(id as MindTrackFocusId);
}
