// 2주 트랙 (mind_2week) — 14일 × 4세션 콘텐츠 라이브러리
// 세션 일정: Day 1, 4, 8, 11 / 비세션: 나머지 / 마지막: Day 14 종합 리포트
// 각 세션은 ① 코칭 → ② 관찰 일지 → ③ 피드백 의 3단계로 진행한다.

import type { MindTrackAudience } from './mindTrackDayCopy';

export const TWO_WEEK_TOTAL_DAYS = 14;
export const TWO_WEEK_SESSION_DAYS = [1, 4, 8, 11] as const;
export const TWO_WEEK_FINAL_DAY = 14;

export function isSessionDay(day: number): boolean {
  return (TWO_WEEK_SESSION_DAYS as readonly number[]).includes(day);
}

export function getSessionIndex(day: number): number {
  return (TWO_WEEK_SESSION_DAYS as readonly number[]).indexOf(day); // 0..3, -1 if not session
}

export function getNextSessionDay(day: number): number | null {
  for (const d of TWO_WEEK_SESSION_DAYS) if (d > day) return d;
  if (day < TWO_WEEK_FINAL_DAY) return TWO_WEEK_FINAL_DAY;
  return null;
}

export interface SessionContent {
  title: string;
  goal: string;
  coaching: string[];          // 3~5문장 코칭 메시지
  journalPrompts: string[];    // 3가지 관찰 일지 질문
  feedbackSystemPrompt: string; // AI 피드백 생성용
}

const SESSIONS_CHILD: SessionContent[] = [
  {
    title: '1세션 · 출발선 정렬',
    goal: '지난 일주일을 한 장면으로 정리하고, 2주 후 비교할 기준선을 만든다.',
    coaching: [
      '오늘은 시작하는 날이에요. 평가가 아니라 "지금 어디쯤"을 또렷하게 보는 시간입니다.',
      '아이를 떠올릴 때 가장 자주 올라오는 감정 하나를 골라보세요. 좋은 것/나쁜 것 구분은 잠시 내려놓아도 좋아요.',
      '오늘 일지는 짧아도 괜찮습니다. 솔직한 한 줄이 2주 뒤의 변화를 보여줍니다.',
    ],
    journalPrompts: [
      '최근 7일 중 가장 마음에 남은 순간은 어떤 장면이었나요?',
      '그때 부모로서 가장 강하게 느낀 감정은 무엇이었나요?',
      '아이의 어떤 행동 때문에 가장 힘들었거나, 가장 뿌듯했나요?',
    ],
    feedbackSystemPrompt:
      '당신은 부모 코칭 전문가입니다. 비의료적·비판단적 톤으로, 부모의 일지를 보고 ①관찰된 핵심 감정 1가지 ②부모 자신을 위한 다음 한 가지 미세 행동 ③다음 세션까지 살펴볼 1가지 관찰 포인트만 짧게 제안하세요. 한국어, 300자 이내.',
  },
  {
    title: '2세션 · 반복되는 한 장면 찾기',
    goal: '지난 3일간 반복된 가장 무너지는 장면 1가지를 골라 들여다본다.',
    coaching: [
      '며칠 지나며 반복되는 장면이 보였을 거예요. 오늘은 그 장면 하나만 깊게 들여다봅니다.',
      '문제를 해결하려 하지 마세요. 먼저 "어떤 패턴인지" 알아차리는 게 이번 세션의 목표예요.',
    ],
    journalPrompts: [
      '지난 3일간 가장 자주 반복된 힘든 장면 1개를 적어보세요.',
      '그 순간 부모인 나의 몸/생각/말은 어떻게 반응했나요?',
      '그 패턴이 시작되는 트리거(시간, 장소, 말투 등)는 무엇인가요?',
    ],
    feedbackSystemPrompt:
      '당신은 부모 코칭 전문가입니다. 보고된 패턴을 ①트리거-반응-결과 구조로 1문단 요약 ②다음 세션까지 시도해볼 "5분 행동" 1개 ③격려 한 문장 순으로 정리하세요. 한국어 300자 이내, 진단·처방 표현 금지.',
  },
  {
    title: '3세션 · 새 루틴 적용',
    goal: '지난 세션에서 찾은 패턴에 대안 행동을 일상에 심는다.',
    coaching: [
      '이제 패턴을 알았으니, 그 자리에 새 행동을 하나 끼워 넣어볼 차례예요.',
      '큰 변화가 아니라 "1분이면 되는 한 가지"를 골라야 지속됩니다.',
    ],
    journalPrompts: [
      '지난 세션에서 찾은 패턴에 끼워 넣고 싶은 새 행동 1가지는 무엇인가요?',
      '이번 3일간 그 행동을 시도한 횟수와 그때의 반응을 적어주세요.',
      '예상과 다르게 흘러간 순간이 있었다면 어떤 장면이었나요?',
    ],
    feedbackSystemPrompt:
      '당신은 부모 코칭 전문가입니다. 새 루틴의 효과를 ①시도한 횟수의 의미 ②반응의 변화 신호 ③유지하기 위한 환경 1가지 순으로 정리하세요. 한국어 300자 이내.',
  },
  {
    title: '4세션 · 정착과 회고',
    goal: '2주간 가장 효과 있던 루틴 1가지를 일상에 고정한다.',
    coaching: [
      '거의 마무리 단계예요. 이번 세션은 "무엇이 남았는가"를 또렷하게 정리하는 시간입니다.',
      '완벽하지 않아도 좋아요. 작더라도 "내 것이 된 한 가지"가 변화의 증거입니다.',
    ],
    journalPrompts: [
      '2주간 가장 효과가 있던 행동/루틴 1가지는 무엇이었나요?',
      '시작했을 때의 나와 지금의 나, 가장 달라진 점은 무엇인가요?',
      '앞으로 4주 동안 계속하고 싶은 한 가지는 무엇인가요?',
    ],
    feedbackSystemPrompt:
      '당신은 부모 코칭 전문가입니다. 회고 데이터를 보고 ①정착된 1가지 핵심 변화 ②남아있는 1가지 도전 ③다음 4주 셀프 유지 가이드 1문단을 정리하세요. 한국어 400자 이내.',
  },
];

const SESSIONS_ADULT: SessionContent[] = [
  {
    title: '1세션 · 나의 출발선',
    goal: '지금 가장 자주 느끼는 감정·에너지 수준의 기준선을 잡는다.',
    coaching: [
      '오늘은 무엇을 바꾸려 하지 않아도 됩니다. 지금의 나를 있는 그대로 기록하는 날이에요.',
      '솔직한 한 줄이 2주 뒤의 비교 기준이 됩니다.',
    ],
    journalPrompts: [
      '지난 7일 중 가장 무거웠던 순간은 언제였나요?',
      '그때의 몸 신호(어깨·호흡·턱·위장)는 어땠나요?',
      '에너지가 가장 잘 회복되는 시간/장소는 어디였나요?',
    ],
    feedbackSystemPrompt:
      '당신은 성인 번아웃·불안 코치입니다. 기준선 데이터를 ①핵심 감정 1개 ②에너지 회복원 1개 ③다음 세션까지 관찰 포인트 1개로 정리하세요. 한국어 300자 이내, 의료적 진단 표현 금지.',
  },
  {
    title: '2세션 · 에너지 누수 지점',
    goal: '에너지를 가장 많이 빼앗는 상황 1가지를 명확히 한다.',
    coaching: [
      '지난 3일을 돌아보면 반복적으로 에너지가 빠지는 구간이 보일 거예요.',
      '해결책을 찾지 말고, 먼저 "누수 지점"을 또렷하게 정리합니다.',
    ],
    journalPrompts: [
      '에너지가 가장 많이 빠지는 상황(시간/사람/업무)은 무엇이었나요?',
      '그 직후 몸과 마음의 변화는 어땠나요?',
      '회복하는 데 평균 얼마의 시간이 필요했나요?',
    ],
    feedbackSystemPrompt:
      '당신은 번아웃 코치입니다. 누수 데이터를 ①트리거 1개 ②몸/마음 영향 ③다음 세션까지 시도할 5분 회복 루틴 1가지로 정리하세요. 한국어 300자 이내.',
  },
  {
    title: '3세션 · 회복 루틴 시운전',
    goal: '하루 5분 회복 행동 1가지를 일상에 시험한다.',
    coaching: [
      '이번엔 시도와 관찰을 동시에 진행합니다.',
      '효과가 적어도 괜찮아요. "내게 맞지 않는 것"을 찾아내는 것도 데이터입니다.',
    ],
    journalPrompts: [
      '지난 3일간 가장 자주 시도한 회복 행동은 무엇이었나요?',
      '시도 직후 0~10 중 회복감은 몇이었나요?',
      '예상과 가장 다르게 흘러간 순간을 적어주세요.',
    ],
    feedbackSystemPrompt:
      '당신은 번아웃 코치입니다. 시운전 결과를 ①가장 효과적이었던 행동 ②유지 조건 ③다음 세션 전 미세 조정 1가지로 정리하세요. 한국어 300자 이내.',
  },
  {
    title: '4세션 · 정착과 다음 4주',
    goal: '2주간 검증된 루틴을 일상에 고정하고 다음 4주 가이드를 정한다.',
    coaching: [
      '이제 검증된 한 가지를 일상에 심을 차례예요.',
      '거창한 결심보다, 매일 같은 시간·같은 자리에서 1분 반복이 가장 강력합니다.',
    ],
    journalPrompts: [
      '가장 효과가 검증된 회복 루틴 1가지를 적어주세요.',
      '시작 시점과 지금, 에너지 점수(0~10) 변화는?',
      '다음 4주 동안 유지하기 위해 환경에서 바꿀 한 가지는?',
    ],
    feedbackSystemPrompt:
      '당신은 번아웃 코치입니다. 회고를 ①정착된 변화 1개 ②남은 도전 1개 ③다음 4주 유지 가이드 1문단으로 정리하세요. 한국어 400자 이내.',
  },
];

const SESSIONS_PARENT = SESSIONS_CHILD; // 부모는 아동 트랙과 동일 베이스
const SESSIONS_TEEN = SESSIONS_ADULT;   // 청소년은 성인 트랙과 동일 베이스 (Phase 3에서 분기 예정)

export function getSessionContent(
  day: number,
  audience: MindTrackAudience = 'child',
): SessionContent | null {
  const idx = getSessionIndex(day);
  if (idx < 0) return null;
  const pool =
    audience === 'adult' ? SESSIONS_ADULT :
    audience === 'parent' ? SESSIONS_PARENT :
    audience === 'teen' ? SESSIONS_TEEN :
    SESSIONS_CHILD;
  return pool[idx] ?? null;
}

export interface RestDayContent {
  title: string;
  message: string;
  reflectionHint: string;
}

export function getRestDayContent(day: number, audience: MindTrackAudience = 'child'): RestDayContent {
  const next = getNextSessionDay(day);
  const dGap = next ? next - day : 0;
  return {
    title: dGap > 0 ? `쉬는 날 · 다음 세션 D-${dGap}` : '오늘은 마무리 정리',
    message:
      audience === 'adult' || audience === 'teen'
        ? '오늘은 새로 시도할 게 없어요. 지난 세션에서 정한 루틴을 평소처럼 흘려보내며, 몸과 마음이 보내는 신호만 가볍게 관찰해보세요.'
        : '오늘은 새로운 미션이 없어요. 지난 세션에서 골랐던 관찰 포인트만 가볍게 떠올려보세요. 무엇을 더 하지 않아도 됩니다.',
    reflectionHint:
      '한 줄 메모: 오늘 가장 인상적이었던 한 장면을 한 문장으로만 남겨두세요. 다음 세션에서 쓰입니다.',
  };
}
