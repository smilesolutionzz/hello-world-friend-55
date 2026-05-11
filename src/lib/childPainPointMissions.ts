/**
 * 페인포인트별 맞춤 미션 라이브러리.
 * 선택한 페인포인트(최대 4개)를 30일 매트릭스의 5/12/19/26일에 1개씩 덮어씁니다.
 * 각 항목은 연령대별 변형을 가집니다.
 */

import type { DayDef } from "./mindTrackTrackContent";
import type { ChildAgeBucket } from "./mindTrackChildMissions";

export type PainPoint = string;

type PainEntry = Record<ChildAgeBucket, DayDef>;

const m = (mission: string, actionTitle: string, actionHowTo: string, actionMinutes = 5): DayDef => ({
  mission, actionTitle, actionHowTo, actionMinutes, videoReason: "",
});

export const PAIN_OVERRIDE_DAYS: number[] = [5, 12, 19, 26];

export const PAIN_MISSION_LIBRARY: Record<PainPoint, PainEntry> = {
  "수면": {
    infant: m("[수면] 입면 의식 고정", "취침 30분 전 같은 순서", "조명 낮춤→목욕→자장가 순서 고정.", 8),
    toddler: m("[수면] 잠자리 루틴 3단계", "씻기→책→불 끄기 고정", "같은 순서 7일 반복.", 8),
    school: m("[수면] 스크린 1시간 전 차단", "취침 1시간 전 폰 회수", "거실 충전 박스 사용.", 5),
    teen: m("[수면] 수면 시각 함께 정하기", "{{name}}과 취침/기상 합의", "강요 없이 합의안 1개.", 6),
  },
  "식사": {
    infant: m("[식사] 식판 자율 선택", "두 가지 중 고르게", "두 음식 보여주고 선택.", 6),
    toddler: m("[식사] 한 입 규칙", "새 음식 한 입 권유", "강요 X, 칭찬 O.", 6),
    school: m("[식사] 가족 식사 1회", "스크린 OFF 30분", "오늘 한 끼 함께.", 30),
    teen: m("[식사] 외식 메뉴 위임", "{{name}}이 메뉴 결정", "오늘 한 끼 자율.", 5),
  },
  "언어 발달": {
    infant: m("[언어] 옹알이 확장", "소리 + 단어로 응답", "'바바' → '바나나 줄까?'.", 5),
    toddler: m("[언어] 두 단어 확장", "말끝에 한 단어 더", "'물' → '시원한 물'.", 5),
    school: m("[언어] 하루 새 단어 1개", "함께 읽고 뜻 풀기", "신문/책에서 1개.", 6),
    teen: m("[언어] 의견 표현 연습", "이유 1개 묻기", "'왜 그렇게 생각해?' 1번.", 5),
  },
  "또래 관계": {
    infant: m("[또래] 함께 놀이 관찰", "다른 아이 옆에서 5분", "강요 없이 옆에 두기.", 5),
    toddler: m("[또래] 나눔 1회 모델링", "장난감 1개 함께 쓰기", "부모가 먼저 시범.", 5),
    school: m("[또래] 친구 갈등 코칭", "양쪽 입장 1줄씩", "{{name}}/친구 입장 정리.", 8),
    teen: m("[또래] 친구 1명 이름 듣기", "최근 친한 친구 묻기", "판단 없이 듣기만.", 5),
  },
  "분리불안": {
    infant: m("[분리] 1분 분리 연습", "예고 후 옆방 1분", "'곧 올게' 말하고 1분.", 4),
    toddler: m("[분리] 5분 분리 + 의식", "같은 인사말로 헤어짐", "동일 인사 후 5분.", 6),
    school: m("[분리] 등교 의식 고정", "같은 인사 + 약속", "오늘 ___시 만나자.", 5),
    teen: m("[분리] 자율성 신뢰 표현", "'네 판단 믿어' 1번", "구체 사안에 1번.", 4),
  },
  "짜증/떼": {
    infant: m("[떼] 자극 강도 측정", "오늘 가장 큰 떼 0~10", "강도와 트리거 기록.", 4),
    toddler: m("[떼] 공감 + 한계", "'~하고 싶었구나, 안 돼'", "공감 먼저, 규칙 다음.", 5),
    school: m("[떼] 진정 코너", "정해진 자리 1곳", "{{name}}과 함께 정하기.", 6),
    teen: m("[떼] 진정 후 대화", "강도 7+ 즉시 거리두기", "둘 다 진정 후 대화.", 5),
  },
  "학습 동기": {
    infant: m("[학습] 호기심 따라가기", "{{name}} 시선 따라 5분", "관심 보이는 것 함께.", 5),
    toddler: m("[학습] 묻고 기다리기", "질문 후 5초 기다림", "답 채우기 금지.", 5),
    school: m("[학습] 결과보다 과정", "오늘 노력 1개 칭찬", "구체 행동 칭찬.", 5),
    teen: m("[학습] '왜 배우는지' 대화", "과목 1개 의미 묻기", "강요 없이 대화 6분.", 6),
  },
  "형제 갈등": {
    infant: m("[형제] 1:1 시간 5분", "{{name}}만의 5분", "다른 형제 없이.", 5),
    toddler: m("[형제] 비교 금지", "각각 강점 1개", "비교 없이 개별 칭찬.", 5),
    school: m("[형제] 중재 대신 코칭", "양쪽 입장 듣기만", "해결은 둘에게 위임.", 6),
    teen: m("[형제] 1:1 시간 15분", "동생/형 빼고 15분", "방해 없는 15분.", 15),
  },
  "미디어/게임": {
    infant: m("[미디어] 화면 노출 0", "오늘 화면 0분", "대신 책·노래.", 5),
    toddler: m("[미디어] 함께 보기 10분", "혼자 보기 → 같이 보기", "옆에서 코멘트.", 10),
    school: m("[미디어] 사용 시간 약속", "같이 정한 시간만", "강요 없이 합의.", 6),
    teen: m("[미디어] 좋아하는 콘텐츠 함께", "{{name}}이 보는 것 10분", "판단 없이 함께.", 10),
  },
  "사춘기 반항": {
    infant: m("[사춘기] (해당 없음)", "지금 강점 3개", "현재 강점 3개 적기.", 4),
    toddler: m("[사춘기] (해당 없음)", "지금 강점 3개", "현재 강점 3개 적기.", 4),
    school: m("[사춘기] 사생활 존중", "방 노크 후 들어가기", "오늘부터 노크.", 3),
    teen: m("[사춘기] 자율성 인정", "결정 1개 위임", "옷·일정 등 위임.", 4),
  },
  "자기조절": {
    infant: m("[자기조절] 부모 호흡 모델", "안고 4-7-8 호흡", "{{name}} 안고 5세트.", 5),
    toddler: m("[자기조절] 감정 + 호흡", "강도 7+이면 호흡", "함께 4-7-8.", 5),
    school: m("[자기조절] 호흡 카드 만들기", "함께 카드 1장", "냉장고에 부착.", 8),
    teen: m("[자기조절] 진정 자원 1개", "{{name}}만의 진정 방법", "함께 1개 찾기.", 6),
  },
  "자존감": {
    infant: m("[자존감] 이름 + 묘사 칭찬", "'{{name}}이 ___했네'", "구체 묘사 3회.", 4),
    toddler: m("[자존감] 강점 거울", "오늘 잘한 것 1개", "구체적으로 말하기.", 4),
    school: m("[자존감] 과정 칭찬", "노력 1개 짚기", "결과 말고 과정.", 4),
    teen: m("[자존감] 가치 인정", "{{name}} 선택 존중", "공식 인정 1번.", 4),
  },
  "감정 표현": {
    infant: m("[감정] 표정 거울", "표정 4종 보여주기", "웃음·놀람·찡그림·뽀뽀.", 4),
    toddler: m("[감정] 감정 단어 1개", "오늘 새 감정 단어", "표정과 함께.", 4),
    school: m("[감정] 반영 1회", "'~게 느꼈구나'", "말 끝에 반영.", 3),
    teen: m("[감정] 부모 감정 명명", "본인 감정 먼저 표현", "'엄마는 ___해'.", 4),
  },
  "집중력": {
    infant: m("[집중] 공동 주의 5분", "한 사물 함께 보기", "손가락 가리키기.", 5),
    toddler: m("[집중] 한 활동 10분", "한 가지만 10분", "도중 다른 자극 차단.", 10),
    school: m("[집중] 25분 집중 1회", "타이머 25분", "함께 옆에 있어주기.", 25),
    teen: m("[집중] 환경 정리 1곳", "책상 위 1곳 비우기", "스크린 분리.", 8),
  },
};

export interface OverrideMap {
  // day -> matched pain point
  [day: number]: PainPoint;
}

export function buildOverrideMap(painPoints: string[] = []): OverrideMap {
  const out: OverrideMap = {};
  const valid = painPoints.filter((p) => PAIN_MISSION_LIBRARY[p]);
  PAIN_OVERRIDE_DAYS.forEach((day, idx) => {
    if (valid[idx]) out[day] = valid[idx];
  });
  return out;
}

export function getOverrideDay(
  day: number,
  bucket: ChildAgeBucket,
  overrides: OverrideMap,
): { def: DayDef; pain: PainPoint } | null {
  const pain = overrides[day];
  if (!pain) return null;
  const entry = PAIN_MISSION_LIBRARY[pain];
  if (!entry) return null;
  return { def: entry[bucket], pain };
}
