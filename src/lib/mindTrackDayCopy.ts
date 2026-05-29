// 마음 변화 트랙 — Day별 카피 (7일 / 30일)
// 사용처: /mind-track 진행 배너, /mind-track-workbook?day=N 헤더, /mind-track/dashboard
// 톤: 코칭/비의료, 친근하지만 전문적
// 7일 트랙: 압축 집중형 (진단 → 자기관찰 → 패턴인식 → 전문가 개입 → 회복 루틴 고정 → 변화 리포트)

export interface DayCopy {
  phase: string;        // 단계 이름 (예: "정렬 주차")
  title: string;        // 한 줄 요약
  description: string;  // 부연 설명 (1~2문장)
}

const PHASES_7 = {
  d1: 'Day 1 · 출발선 진단',
  d2: 'Day 2 · 패턴 추적',
  d3: 'Day 3 · 뿌리 진단',
  d4: 'Day 4 · 전문가 개입',
  d5: 'Day 5 · 회복 루틴 설계',
  d6: 'Day 6 · 실전 적용',
  d7: 'Day 7 · 변화 리포트',
} as const;

// 7일 압축 집중 트랙 (CHILD/부모 진단 기반) — 기존 카피 유지 (parent도 동일 베이스 사용)
const DAY_COPY_7: Record<number, DayCopy> = {
  1: { phase: PHASES_7.d1, title: '나의 출발선 진단 (5종 기초 진단)', description: '5종 자가진단 + 마음 점수로 출발선을 기록해요. 7일 후 비교의 기준이 됩니다.' },
  2: { phase: PHASES_7.d2, title: '하루 24시간, 내 감정/에너지 추적', description: '아침·점심·저녁 3회 마이크로 체크인으로 나만의 패턴을 찾아내요. AI가 자동으로 트렌드를 분석합니다.' },
  3: { phase: PHASES_7.d3, title: '뿌리 패턴 진단 (심층 분석 리포트)', description: '2일간 쌓인 데이터를 박사급 AI가 분석해 핵심 패턴 1가지를 골라줘요. "왜 이렇게 사는지"가 보입니다.' },
  4: { phase: PHASES_7.d4, title: '전문가 1:1 개입 (15분 무료 매칭 상담)', description: '내 데이터를 본 전문가가 직접 처방을 줘요. 혼자선 절대 못 보는 사각지대를 짚어줍니다.' },
  5: { phase: PHASES_7.d5, title: '나만의 회복 루틴 3가지 고정', description: '4일간 가장 효과 있던 행동을 3가지로 압축해 일상에 심어요. 이게 평생 갑니다.' },
  6: { phase: PHASES_7.d6, title: '실전 — 가장 어려운 상황에 적용', description: '평소 가장 무너지던 순간(스트레스/관계/수면)에 새 루틴을 직접 써봐요. 진짜 변화가 검증되는 날.' },
  7: { phase: PHASES_7.d7, title: '7일 변화 리포트 + 다음 30일 가이드', description: 'Day 1과 비교한 종합 변화 리포트(PDF) + 이후에도 지속 가능한 셀프 코칭 가이드를 받습니다.' },
};

// 7일 트랙 — 성인(번아웃·불안 통합)
// Phase 2 출시 콘텐츠: 직장/사회생활 번아웃과 예기불안을 한 트랙에서 함께 다룸.
const PHASES_7_ADULT = {
  d1: 'Day 1 · 번아웃/불안 진단',
  d2: 'Day 2 · 에너지 누수 추적',
  d3: 'Day 3 · 불안 트리거 매핑',
  d4: 'Day 4 · 전문가 처방',
  d5: 'Day 5 · 회복 루틴 설계',
  d6: 'Day 6 · 실전 — 가장 무너지는 순간',
  d7: 'Day 7 · 변화 리포트',
} as const;

const DAY_COPY_7_ADULT: Record<number, DayCopy> = {
  1: { phase: PHASES_7_ADULT.d1, title: '번아웃·불안 통합 진단', description: '직장/일상 번아웃 강도와 예기불안 빈도를 한 번에 측정해 출발선을 잡아요. 7일 후 같은 척도로 비교합니다.' },
  2: { phase: PHASES_7_ADULT.d2, title: '하루 에너지가 어디서 새는지 추적', description: '아침·점심·저녁 3회 체크인으로 "에너지를 가장 많이 빼앗기는 시간/관계/업무"를 자동으로 찾아냅니다.' },
  3: { phase: PHASES_7_ADULT.d3, title: '불안 트리거 1순위 진단', description: '쌓인 데이터를 AI가 분석해 "지금 가장 자주 작동하는 불안 패턴 1가지"를 짚어드려요. 막연한 불안을 구체화합니다.' },
  4: { phase: PHASES_7_ADULT.d4, title: '전문가 1:1 처방 (15분 무료 매칭)', description: '번아웃·불안 코칭 전문가가 내 데이터를 보고 직접 처방을 줘요. 약 처방이 아닌 행동·환경 처방입니다.' },
  5: { phase: PHASES_7_ADULT.d5, title: '하루 5분, 회복 루틴 3가지 고정', description: '효과가 검증된 호흡·이완·경계 루틴 중 가장 잘 맞는 3가지를 일상에 심습니다.' },
  6: { phase: PHASES_7_ADULT.d6, title: '실전 — 평소 가장 무너지던 순간 적용', description: '회의 직전, 잠들기 전, 갈등 직후 등 가장 무너지던 장면에 새 루틴을 써봐요. 변화가 실제로 검증되는 날.' },
  7: { phase: PHASES_7_ADULT.d7, title: '7일 변화 리포트 + 다음 30일 가이드', description: 'Day 1과 비교한 번아웃·불안 변화 리포트(PDF) + 30일 지속 가이드 + 전문가 후속 상담 제안을 받습니다.' },
};

// 7일 트랙 — 부모 (audience='parent')
// 자기 자신을 케어하면서 동시에 아이와의 관계를 다루는 부모 전용 카피.
const PHASES_7_PARENT = {
  d1: 'Day 1 · 부모 번아웃 진단',
  d2: 'Day 2 · 일상 트리거 추적',
  d3: 'Day 3 · 반복 패턴 진단',
  d4: 'Day 4 · 전문가 1:1 코칭',
  d5: 'Day 5 · 부모 회복 루틴 설계',
  d6: 'Day 6 · 실전 — 아이와의 가장 힘든 순간',
  d7: 'Day 7 · 변화 리포트',
} as const;

const DAY_COPY_7_PARENT: Record<number, DayCopy> = {
  1: { phase: PHASES_7_PARENT.d1, title: '부모 번아웃·죄책감 진단', description: '"좋은 부모가 되어야 한다"는 압박과 번아웃 강도를 함께 측정해요. 비교 안 하고 내 출발선만 확인합니다.' },
  2: { phase: PHASES_7_PARENT.d2, title: '하루 중 무너지는 시간대 찾기', description: '등원·하교·취침 시간 등 부모가 가장 흔들리는 순간을 마이크로 체크인으로 추적합니다.' },
  3: { phase: PHASES_7_PARENT.d3, title: '나 → 아이로 번지는 패턴 진단', description: '내 감정이 아이의 행동을 어떻게 흔드는지 1가지 핵심 패턴을 AI가 골라드려요.' },
  4: { phase: PHASES_7_PARENT.d4, title: '부모 코칭 전문가 1:1 (15분 무료)', description: '부모 상담·발달 전문가가 내 패턴을 보고 "오늘부터 바꿀 한 가지"를 짚어줘요.' },
  5: { phase: PHASES_7_PARENT.d5, title: '나를 먼저 채우는 회복 루틴 3가지', description: '아이가 아닌 "내 에너지"를 먼저 채우는 5분 루틴을 일상에 심습니다.' },
  6: { phase: PHASES_7_PARENT.d6, title: '실전 — 아이와 가장 힘든 순간 적용', description: '떼쓰기·등원 거부·취침 거부 등 가장 힘든 장면에 새 루틴을 적용해봐요.' },
  7: { phase: PHASES_7_PARENT.d7, title: '7일 부모 변화 리포트', description: 'Day 1과 비교한 변화 리포트(PDF) + 자녀 트랙 연계 제안 + 후속 상담 매칭을 받습니다.' },
};

const PHASES = {
  week1: '1주차 · 출발 정렬',
  week2: '2주차 · 마음 루틴',
  week3: '3주차 · 패턴 전환',
  week4: '4주차 · 깊이 있는 코칭',
  week5: '마지막 · 변화 리포트',
} as const;

const DAY_COPY: Record<number, DayCopy> = {
  1:  { phase: PHASES.week1, title: '출발점을 또렷하게 그려요', description: '오늘은 시작 셀프 체크와 첫 호흡으로 30일의 기준선을 만들어요.' },
  2:  { phase: PHASES.week1, title: '3분 마음 루틴, 첫 실천', description: '어제의 기준선을 떠올리며 가장 가벼운 마이크로 액션을 시도해요.' },
  3:  { phase: PHASES.week1, title: '내 감정에 이름 붙이기', description: '오늘 떠오른 감정을 한 단어로 정리하면 패턴이 보이기 시작해요.' },
  4:  { phase: PHASES.week1, title: '몸이 보내는 신호 알아차리기', description: '어깨·턱·호흡의 긴장도를 점검하며 마음과 몸을 연결해봐요.' },
  5:  { phase: PHASES.week1, title: '하루를 바꾸는 작은 결정', description: '오늘은 5분 안에 끝나는 한 가지 행동에 집중해요.' },
  6:  { phase: PHASES.week1, title: '나를 위한 경계 만들기', description: '에너지를 빼앗는 한 가지를 줄이는 연습을 시작해요.' },
  7:  { phase: PHASES.week1, title: '첫 주 인사이트 정리', description: '7일 데이터를 바탕으로 첫 주간 인사이트를 받아봐요.' },

  8:  { phase: PHASES.week2, title: '루틴이 자리 잡는 시점', description: '어제까지의 흐름을 유지하며 더 자연스럽게 적용해요.' },
  9:  { phase: PHASES.week2, title: '생각의 자동 재생 끊기', description: '반복되는 생각 한 가지를 알아차리고 잠시 멈춰봐요.' },
  10: { phase: PHASES.week2, title: '에너지 회복의 골든타임', description: '하루 중 가장 안정적인 시간대를 찾아 루틴을 옮겨봐요.' },
  11: { phase: PHASES.week2, title: '관계 속 내 패턴 보기', description: '가까운 사람과의 대화에서 반복되는 반응을 살펴봐요.' },
  12: { phase: PHASES.week2, title: '쉼의 질을 높이는 호흡', description: '4-4-6 호흡을 일상 속 짧은 틈마다 적용해요.' },
  13: { phase: PHASES.week2, title: '기록으로 마음 정리하기', description: '5분 자유 기록으로 오늘의 핵심 감정을 한 문장으로 요약해요.' },
  14: { phase: PHASES.week2, title: '2주차 변화 점검', description: '시작 점수와 비교해 어떤 영역이 부드러워졌는지 확인해봐요.' },

  15: { phase: PHASES.week3, title: '중간 지점, 다시 정렬', description: '15일을 지난 지금, 가장 효과 있던 루틴을 다시 강화해요.' },
  16: { phase: PHASES.week3, title: '회피하던 한 가지 마주하기', description: '미뤄둔 작은 일 하나를 오늘은 5분만 시도해봐요.' },
  17: { phase: PHASES.week3, title: '도움 요청 연습', description: '혼자 짊어지지 않고 한 사람에게 도움을 청하는 메시지를 보내요.' },
  18: { phase: PHASES.week3, title: '감정의 강도 다루기', description: '강하게 올라오는 감정을 0~10으로 측정해 거리를 두는 연습이에요.' },
  19: { phase: PHASES.week3, title: '나에게 친절해지기', description: '오늘 한 가지 잘한 일을 스스로에게 또렷하게 말해줘요.' },
  20: { phase: PHASES.week3, title: '에너지 도둑 정리', description: '에너지를 가장 많이 빼앗는 환경 한 가지를 손봐요.' },
  21: { phase: PHASES.week3, title: '3주차 코칭 인사이트', description: '3주간의 데이터로 깊이 있는 코칭 메시지를 받아봐요.' },

  22: { phase: PHASES.week4, title: '깊이 있는 자기 이해', description: '맞춤 워크북 질문으로 내 패턴의 뿌리를 살펴봐요.' },
  23: { phase: PHASES.week4, title: 'AI 코파일럿 1:1 대화', description: '코파일럿과 오늘의 주제를 가지고 짧게 대화해봐요.' },
  24: { phase: PHASES.week4, title: '재발 방지 시그널 만들기', description: '예전 패턴이 돌아오려 할 때 쓸 신호 문장을 정해둬요.' },
  25: { phase: PHASES.week4, title: '나만의 회복 루틴 정립', description: '지금까지 효과 있던 루틴 3가지를 골라 고정해요.' },
  26: { phase: PHASES.week4, title: '관계 회복 한 걸음', description: '미뤄둔 대화 한 가지를 짧게라도 시도해봐요.' },
  27: { phase: PHASES.week4, title: '경계와 거절 연습', description: '내 에너지를 지키는 한 문장을 미리 준비해둬요.' },
  28: { phase: PHASES.week4, title: '4주차 깊이 있는 정리', description: '4주간의 변화 흐름을 한 문장으로 요약해봐요.' },

  29: { phase: PHASES.week5, title: '리포트 데이터 마무리', description: '내일의 종합 리포트를 위해 마지막 체크인을 완성해요.' },
  30: { phase: PHASES.week5, title: '나의 30일 변화 리포트', description: '시작과 지금을 비교한 종합 리포트와 다음 한 달 가이드를 받아봐요.' },
};

export type MindTrackAudience = 'child' | 'adult' | 'parent' | 'teen';

/**
 * 지정된 트랙 길이(7 또는 30일) + audience에 맞는 Day별 카피를 반환.
 * - 7일 트랙은 audience별 카피 (child=DAY_COPY_7, adult=DAY_COPY_7_ADULT, parent=DAY_COPY_7_PARENT)
 * - 30일 트랙은 공통 점진적 코칭형 (audience 분리는 Phase 3에서 진행)
 */
export function getDayCopy(
  day: number,
  totalDays: number = 30,
  audience: MindTrackAudience = 'child',
): DayCopy {
  if (totalDays === 7) {
    const safe = Math.min(Math.max(Math.round(day), 1), 7);
    if (audience === 'adult') return DAY_COPY_7_ADULT[safe];
    if (audience === 'parent') return DAY_COPY_7_PARENT[safe];
    return DAY_COPY_7[safe];
  }
  if (totalDays === 14) {
    // 2주 트랙: 세션 날(1·4·8·11)과 비세션 날을 구분해 카피 반환
    const safe = Math.min(Math.max(Math.round(day), 1), 14);
    const sessionDays = [1, 4, 8, 11];
    const sessionIdx = sessionDays.indexOf(safe);
    if (sessionIdx >= 0) {
      const phase = `Day ${safe} · 세션 ${sessionIdx + 1}/4`;
      const titles = ['출발선 정렬', '반복 패턴 찾기', '새 루틴 적용', '정착과 회고'];
      return {
        phase,
        title: titles[sessionIdx],
        description: '오늘은 세션 날이에요. 코칭 → 관찰 일지 → 피드백 3단계로 진행합니다.',
      };
    }
    if (safe === 14) {
      return {
        phase: 'Day 14 · 2주 종합 리포트',
        title: '2주 변화 리포트',
        description: '4번의 세션이 만든 변화를 한 장으로 정리해드려요.',
      };
    }
    const next = sessionDays.find((d) => d > safe) ?? 14;
    return {
      phase: `Day ${safe} · 쉬는 날`,
      title: `다음 세션 D-${next - safe}`,
      description: '오늘은 새로운 미션이 없어요. 지난 세션의 한 장면만 가볍게 떠올려보세요.',
    };
  }
  const safe = Math.min(Math.max(Math.round(day), 1), 30);
  return DAY_COPY[safe];
}

/**
 * started_at(또는 ISO 문자열)과 현재 시각 기준으로 1~totalDays 사이 currentDay를 계산.
 * - 시작일 당일은 Day 1
 * - 24시간 경과 기준
 * - totalDays 초과 시 totalDays로 고정 (기본 30, 7일 트랙은 7 전달)
 */
export function calcMindTrackCurrentDay(
  startedAt: string | Date | null | undefined,
  totalDays: number = 30,
): number {
  if (!startedAt) return 1;
  const start = typeof startedAt === 'string' ? new Date(startedAt) : startedAt;
  if (Number.isNaN(start.getTime())) return 1;
  const diffMs = Date.now() - start.getTime();
  const dayIndex = Math.floor(diffMs / 86_400_000) + 1;
  if (dayIndex < 1) return 1;
  if (dayIndex > totalDays) return totalDays;
  return dayIndex;
}
