/**
 * 7일 트랙 — 가벼운 Day(2·3·5·6) audience별 미션 풀
 *
 * 무거운 Day(1·4·7)는 전용 화면이 있고, 이 파일은 5분짜리 가벼운 미션 4개만 담당.
 * audience별로 풀이 분리되어 톤과 행동이 다름.
 */

import type { MindTrackAudience } from "@/lib/mindTrackEnrollment";

export interface SevenDayMission {
  title: string;       // 한 줄 미션 제목
  how: string;         // 1-2 문장 실행 방법
  minutes: number;     // 소요 시간(분)
  reflectionPrompt: string; // 마치고 적을 한 줄
}

type Day2356 = 2 | 3 | 5 | 6;

const CHILD: Record<Day2356, SevenDayMission> = {
  2: {
    title: "오늘 아이의 강점 1개를 구체적으로 칭찬해요",
    how: "결과가 아닌 과정에 대해 '끝까지 ___해서 멋졌어' 형태로 한 번만 또렷하게 전해요.",
    minutes: 3,
    reflectionPrompt: "아이는 어떤 반응을 보였나요?",
  },
  3: {
    title: "감정 단어 1개를 가르치고 함께 써봐요",
    how: "'속상해/뿌듯해/긴장돼' 중 하나를 골라 표정과 함께 알려주고, 오늘 그 단어를 1번 같이 써봐요.",
    minutes: 4,
    reflectionPrompt: "오늘 가장 잘 통한 한 마디는?",
  },
  5: {
    title: "5분간 아이가 주도하는 놀이를 따라가요",
    how: "지시·교정 없이 아이가 하자는 대로 5분만 함께해요. 평가도, 가르침도 잠시 멈춰요.",
    minutes: 5,
    reflectionPrompt: "관찰한 아이의 새로운 모습 한 가지는?",
  },
  6: {
    title: "하루를 닫는 1분 의식을 고정해요",
    how: "잠자리에서 '오늘 좋았던 일 1개'를 함께 말하고 안아주는 1분 루틴을 시작해요.",
    minutes: 3,
    reflectionPrompt: "아이가 말한 좋았던 일 한 가지는?",
  },
};

const ADULT: Record<Day2356, SevenDayMission> = {
  2: {
    title: "오늘 에너지가 가장 빠진 순간을 기록해요",
    how: "아침·점심·저녁 중 가장 무거웠던 시간대와 그때 한 일을 한 줄로 적어요.",
    minutes: 3,
    reflectionPrompt: "에너지 누수의 트리거 한 가지는?",
  },
  3: {
    title: "4-7-8 호흡 × 3세트",
    how: "4초 들이마시고, 7초 멈추고, 8초 내쉬는 호흡을 3번 반복해요. 어깨·턱 힘도 풀어요.",
    minutes: 4,
    reflectionPrompt: "호흡 전후 달라진 점 한 가지는?",
  },
  5: {
    title: "오늘 거절할 한 가지를 정해요",
    how: "에너지를 빼앗는 약속·요청 1개를 정중히 거절하거나 일정에서 빼요.",
    minutes: 4,
    reflectionPrompt: "거절 후 느낀 가장 큰 감정은?",
  },
  6: {
    title: "잠들기 전 화면 30분 꺼두기",
    how: "취침 30분 전 모든 스크린을 끄고 종이책·메모·스트레칭 중 하나로 마무리해요.",
    minutes: 5,
    reflectionPrompt: "수면 직전 머릿속 무게가 어땠나요?",
  },
};

const PARENT: Record<Day2356, SevenDayMission> = {
  2: {
    title: "나만의 10분을 일정에 적어요",
    how: "오늘 또는 내일 캘린더에 '나 혼자 10분'을 글자로 적고, 가족에게 알려요.",
    minutes: 3,
    reflectionPrompt: "10분 동안 무엇을 했나요?",
  },
  3: {
    title: "오늘 한 가지를 정중히 거절해요",
    how: "외부 일정·부탁·자녀 친구 모임 중 1개를 '오늘은 어려워요'로 거절해요.",
    minutes: 4,
    reflectionPrompt: "거절 후 마음에 남은 한 단어는?",
  },
  5: {
    title: "내 호흡을 먼저 정돈하는 4-7-8 × 3세트",
    how: "아이가 무너지기 전, 내가 먼저 호흡을 세 번 가다듬어요. 4초/7초/8초.",
    minutes: 4,
    reflectionPrompt: "호흡 후 아이 대하는 톤이 어땠나요?",
  },
  6: {
    title: "오늘 나에게 한 마디 칭찬을 남겨요",
    how: "거울이나 메모에 '오늘 나는 ___해서 잘했다' 한 문장을 또렷하게 남겨요.",
    minutes: 3,
    reflectionPrompt: "스스로에게 어떤 말을 해줬나요?",
  },
};

const POOLS: Record<MindTrackAudience, Record<Day2356, SevenDayMission>> = {
  child: CHILD,
  adult: ADULT,
  parent: PARENT,
  teen: ADULT, // Phase 2: teen 전용 풀 추가 전까지 adult 풀 재사용
};

export function getSevenDayLightMission(
  audience: MindTrackAudience,
  day: number,
): SevenDayMission | null {
  if (![2, 3, 5, 6].includes(day)) return null;
  return POOLS[audience][day as Day2356];
}

/** Day 4 스킵 시 폴백 미션 (전문가 없이 셀프 정리) */
export function getDay4SelfMission(audience: MindTrackAudience): SevenDayMission {
  const base = {
    minutes: 6,
    reflectionPrompt: "오늘 가장 또렷해진 한 가지는?",
  };
  if (audience === "child") {
    return {
      title: "지난 3일간 아이의 변화 1가지를 메모해요",
      how: "Day 1~3 동안 새로 보인 행동/표정/말 중 한 가지를 한 줄로 적어요.",
      ...base,
    };
  }
  if (audience === "parent") {
    return {
      title: "지난 3일 내 회복 루틴 중 1개만 골라요",
      how: "Day 2·3 미션 중 가장 효과 있었던 한 가지를 골라 내일도 이어가요.",
      ...base,
    };
  }
  return {
    title: "지난 3일 내 패턴 1가지를 한 줄로 정리해요",
    how: "Day 1~3 데이터 중 반복되는 트리거나 회복 신호 1개를 적어요.",
    ...base,
  };
}
