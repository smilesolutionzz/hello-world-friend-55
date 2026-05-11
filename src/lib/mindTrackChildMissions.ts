/**
 * 아이 발달 코칭 — 연령대별 30일 미션 데이터
 * 4 버킷 × 30일 = 120 미션. 미션 텍스트의 "{{name}}"은 렌더 시 닉네임으로 치환.
 */

import type { DayDef } from "./mindTrackTrackContent";

export type ChildAgeBucket = "infant" | "toddler" | "school" | "teen";

export const AGE_BUCKET_LABEL: Record<ChildAgeBucket, string> = {
  infant: "영아 (0~2세)",
  toddler: "유아 (3~5세)",
  school: "학령기 (6~12세)",
  teen: "청소년 (13~18세)",
};

export const PAIN_POINT_OPTIONS = [
  "수면", "식사", "언어 발달", "또래 관계", "분리불안",
  "짜증/떼", "학습 동기", "형제 갈등", "미디어/게임", "사춘기 반항",
  "자기조절", "자존감", "감정 표현", "집중력",
] as const;

export function getAgeBucket(birthDate: string | Date): ChildAgeBucket {
  const d = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const months = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  if (months < 36) return "infant";
  if (months < 72) return "toddler";
  if (months < 156) return "school";
  return "teen";
}

export function getAgeYears(birthDate: string | Date): number {
  const d = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const years = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(years);
}

const W = (w: number) => `${w}주차`;

const infant: DayDef[] = [
  { mission: "애착 베이스라인", actionTitle: "{{name}} 강점 3개 적기", actionHowTo: "지금 떠오르는 강점 3개를 적어요.", actionMinutes: 4, videoReason: "" },
  { mission: "안정감 신호", actionTitle: "눈맞춤 1분 × 3회", actionHowTo: "수유·기저귀 시간에 1분 눈맞춤.", actionMinutes: 3, videoReason: "" },
  { mission: "옹알이 응답", actionTitle: "소리 따라하기 5번", actionHowTo: "{{name}}의 옹알이를 똑같이 따라해요.", actionMinutes: 4, videoReason: "" },
  { mission: "루틴 1개 정리", actionTitle: "잠 자는 의식 1개", actionHowTo: "취침 전 같은 노래·등불 한 가지 정해요.", actionMinutes: 4, videoReason: "" },
  { mission: "스킨십 누적", actionTitle: "안기 10분", actionHowTo: "오늘 누적 10분 안아주기.", actionMinutes: 10, videoReason: "" },
  { mission: "표정 거울 놀이", actionTitle: "마주보고 표정 4종", actionHowTo: "웃음·놀람·찡그림·뽀뽀 표정 보여주기.", actionMinutes: 4, videoReason: "" },
  { mission: "1주차 회고", actionTitle: "가장 평온했던 순간 1줄", actionHowTo: "1주 중 안정 순간 1줄 기록.", actionMinutes: 4, videoReason: "" },
  { mission: "안전 기지 확인", actionTitle: "낯선 자극 후 회복 시간 측정", actionHowTo: "낯선 사람·소리 후 진정까지 분 단위 기록.", actionMinutes: 5, videoReason: "" },
  { mission: "감각 자극 1종", actionTitle: "촉감놀이 5분", actionHowTo: "수건·실리콘 등 다른 촉감 만지게 해요.", actionMinutes: 5, videoReason: "" },
  { mission: "수면 패턴 점검", actionTitle: "낮잠 시각 기록 3회", actionHowTo: "낮잠 시작/끝 시각 3회 기록.", actionMinutes: 3, videoReason: "" },
  { mission: "부모 호흡 1분", actionTitle: "안고 함께 호흡", actionHowTo: "안은 채 4-7-8 호흡 5세트.", actionMinutes: 4, videoReason: "" },
  { mission: "사회적 미소 유도", actionTitle: "까꿍 5회", actionHowTo: "마주보며 까꿍 놀이 5번.", actionMinutes: 4, videoReason: "" },
  { mission: "이름 부르기", actionTitle: "이름 + 강점 부르기", actionHowTo: "'{{name}}, 잘 잤구나' 등 명명+묘사.", actionMinutes: 3, videoReason: "" },
  { mission: "2주차 회고", actionTitle: "가장 어려웠던 순간 1줄", actionHowTo: "어떤 자극에 무너졌는지 1줄.", actionMinutes: 5, videoReason: "" },
  { mission: "양육자 자기돌봄", actionTitle: "10분 호흡명상", actionHowTo: "{{name}} 잘 때 10분 명상.", actionMinutes: 10, videoReason: "" },
  { mission: "감각 통합", actionTitle: "베이비 마사지 5분", actionHowTo: "다리·팔 부드럽게 5분.", actionMinutes: 5, videoReason: "" },
  { mission: "예측 가능성", actionTitle: "다음 행동 예고", actionHowTo: "'이제 옷 갈아입을게' 미리 말하기.", actionMinutes: 3, videoReason: "" },
  { mission: "강도 진단 (감각)", actionTitle: "오늘 가장 강한 자극 1개", actionHowTo: "{{name}}이 가장 크게 반응한 자극 기록.", actionMinutes: 4, videoReason: "" },
  { mission: "양육자 거절 1개", actionTitle: "외부 압박 거절 1개", actionHowTo: "오늘 약속·요청 1개 정중히 거절.", actionMinutes: 3, videoReason: "" },
  { mission: "공동 주의", actionTitle: "같은 사물 함께 보기 3회", actionHowTo: "손가락으로 가리키고 함께 보기.", actionMinutes: 4, videoReason: "" },
  { mission: "3주차 회고", actionTitle: "패턴 1개 발견", actionHowTo: "잠/식사/울음 패턴 1개 발견.", actionMinutes: 5, videoReason: "" },
  { mission: "수면 환경 정리", actionTitle: "조도 한 단계 낮추기", actionHowTo: "취침 30분 전 조명 낮춤.", actionMinutes: 3, videoReason: "" },
  { mission: "관계 자원", actionTitle: "도움 1명 요청", actionHowTo: "오늘 1시간 도움 요청.", actionMinutes: 3, videoReason: "" },
  { mission: "노래·리듬", actionTitle: "같은 동요 3회 반복", actionHowTo: "예측 가능한 동요로 안정.", actionMinutes: 5, videoReason: "" },
  { mission: "분리·재회 의식", actionTitle: "외출/귀가 인사 고정", actionHowTo: "같은 인사말 사용.", actionMinutes: 3, videoReason: "" },
  { mission: "코파일럿 1:1", actionTitle: "오늘 궁금한 발달 질문 1개", actionHowTo: "'{{name}} 요즘 ___' 한 줄 입력.", actionMinutes: 6, videoReason: "" },
  { mission: "양육자 회복", actionTitle: "20분 혼자 시간", actionHowTo: "낮잠 시간 활용 20분 휴식.", actionMinutes: 20, videoReason: "" },
  { mission: "발달 이정표 1개", actionTitle: "이번 달 새로 한 행동 1개", actionHowTo: "처음 한 행동 1개 기록.", actionMinutes: 4, videoReason: "" },
  { mission: "4주차 요약", actionTitle: "'4주 동안 {{name}}이 ___'", actionHowTo: "한 문장.", actionMinutes: 5, videoReason: "" },
  { mission: "30일 선언문", actionTitle: "'{{name}}의 안전기지가 되는 부모'", actionHowTo: "선언문 1문장.", actionMinutes: 5, videoReason: "" },
];

const toddler: DayDef[] = [
  { mission: "발달 베이스라인", actionTitle: "{{name}} 강점 3개", actionHowTo: "현재 강점 3개 적기.", actionMinutes: 4, videoReason: "" },
  { mission: "감정 어휘 1개", actionTitle: "감정 단어 1개 가르치기", actionHowTo: "'속상해' 표정과 함께.", actionMinutes: 4, videoReason: "" },
  { mission: "선택권 주기", actionTitle: "옷 2벌 중 선택", actionHowTo: "'빨강 vs 파랑' 둘 중 선택.", actionMinutes: 3, videoReason: "" },
  { mission: "한계 + 공감", actionTitle: "'~하고 싶었구나, 안 돼'", actionHowTo: "공감 먼저, 규칙 다음.", actionMinutes: 4, videoReason: "" },
  { mission: "놀이 주도 따라가기", actionTitle: "10분 {{name}} 주도 놀이", actionHowTo: "지시 없이 따라만 가기.", actionMinutes: 10, videoReason: "" },
  { mission: "분리 연습 1분", actionTitle: "옆방에 1분", actionHowTo: "예고하고 1분 후 돌아오기.", actionMinutes: 3, videoReason: "" },
  { mission: "1주차 회고", actionTitle: "가장 잘 통한 말 1개", actionHowTo: "효과 있던 말 1개 기록.", actionMinutes: 4, videoReason: "" },
  { mission: "감정 라벨링", actionTitle: "'지금 ___같아'", actionHowTo: "{{name}} 감정 1번 명명.", actionMinutes: 3, videoReason: "" },
  { mission: "사과 모델링", actionTitle: "부모가 먼저 사과", actionHowTo: "어른이 모델 보여주기.", actionMinutes: 3, videoReason: "" },
  { mission: "강도 진단 (떼)", actionTitle: "오늘 가장 큰 떼 0~10", actionHowTo: "강도 점수 기록.", actionMinutes: 4, videoReason: "" },
  { mission: "예고 루틴", actionTitle: "타이머로 5분 전 알림", actionHowTo: "전환 5분 전 예고.", actionMinutes: 3, videoReason: "" },
  { mission: "감각 놀이", actionTitle: "물·모래 5분", actionHowTo: "감각 자극 놀이.", actionMinutes: 5, videoReason: "" },
  { mission: "이름 + 묘사 칭찬", actionTitle: "구체 칭찬 3회", actionHowTo: "'{{name}}이 끝까지 치웠네'.", actionMinutes: 4, videoReason: "" },
  { mission: "2주차 회고", actionTitle: "줄어든 행동 1개", actionHowTo: "이전보다 줄어든 행동 1개.", actionMinutes: 5, videoReason: "" },
  { mission: "양육자 자기돌봄", actionTitle: "10분 명상", actionHowTo: "혼자 10분 호흡.", actionMinutes: 10, videoReason: "" },
  { mission: "스토리텔링", actionTitle: "잠자리 동화 5분", actionHowTo: "감정 있는 짧은 이야기.", actionMinutes: 5, videoReason: "" },
  { mission: "역할 놀이", actionTitle: "인형으로 갈등 재연", actionHowTo: "오늘 다툼을 인형으로.", actionMinutes: 5, videoReason: "" },
  { mission: "공동 주의", actionTitle: "함께 책 5분", actionHowTo: "한 페이지에서 같이 멈춤.", actionMinutes: 5, videoReason: "" },
  { mission: "거절 문장", actionTitle: "{{name}} 보호 거절 1개", actionHowTo: "외부 압박 거절.", actionMinutes: 4, videoReason: "" },
  { mission: "분리 연습 5분", actionTitle: "다른 방 5분", actionHowTo: "예고 후 5분.", actionMinutes: 5, videoReason: "" },
  { mission: "3주차 회고", actionTitle: "{{name}}이 새로 말한 단어", actionHowTo: "새 어휘 1개 기록.", actionMinutes: 5, videoReason: "" },
  { mission: "신체 놀이", actionTitle: "5분 거친 놀이", actionHowTo: "베개싸움·뒹굴기.", actionMinutes: 5, videoReason: "" },
  { mission: "한계 일관성", actionTitle: "같은 규칙 3번 반복", actionHowTo: "흔들림 없이 같은 말.", actionMinutes: 4, videoReason: "" },
  { mission: "감사 한 줄", actionTitle: "잠자기 전 감사 1개", actionHowTo: "{{name}}에게 고마운 점.", actionMinutes: 3, videoReason: "" },
  { mission: "관계 1순위", actionTitle: "10분 1:1 시간", actionHowTo: "방해 없는 10분.", actionMinutes: 10, videoReason: "" },
  { mission: "코파일럿 1:1", actionTitle: "발달 주제 1개", actionHowTo: "'{{name}} 요즘 ___'.", actionMinutes: 6, videoReason: "" },
  { mission: "양육자 회복", actionTitle: "20분 자기 시간", actionHowTo: "혼자 20분.", actionMinutes: 20, videoReason: "" },
  { mission: "발달 이정표", actionTitle: "이번 달 새 능력 1개", actionHowTo: "처음 한 행동.", actionMinutes: 4, videoReason: "" },
  { mission: "4주차 요약", actionTitle: "'4주 동안 {{name}}이 ___'", actionHowTo: "한 문장.", actionMinutes: 5, videoReason: "" },
  { mission: "30일 선언문", actionTitle: "'{{name}}의 감정을 읽는 부모'", actionHowTo: "선언문.", actionMinutes: 5, videoReason: "" },
];

const school: DayDef[] = [
  { mission: "발달 베이스라인", actionTitle: "{{name}} 강점 3개", actionHowTo: "강점 3개 함께 적기.", actionMinutes: 5, videoReason: "" },
  { mission: "경청 5분", actionTitle: "끊지 않고 5분 듣기", actionHowTo: "조언 금지, 듣기만.", actionMinutes: 5, videoReason: "" },
  { mission: "감정 라벨링", actionTitle: "'~게 느꼈구나' 반영", actionHowTo: "말 끝에 반영 1번.", actionMinutes: 3, videoReason: "" },
  { mission: "선택권 확장", actionTitle: "오늘 결정 2개 위임", actionHowTo: "옷·간식 등 위임.", actionMinutes: 3, videoReason: "" },
  { mission: "공동 활동 1개", actionTitle: "10분 보드게임/산책", actionHowTo: "스마트폰 없이.", actionMinutes: 10, videoReason: "" },
  { mission: "한계 + 협상", actionTitle: "규칙 같이 정하기", actionHowTo: "{{name}}과 1개 합의.", actionMinutes: 6, videoReason: "" },
  { mission: "1주차 회고", actionTitle: "잘 통한 말 1개", actionHowTo: "효과 있던 말 1개.", actionMinutes: 4, videoReason: "" },
  { mission: "강점 칭찬", actionTitle: "구체 칭찬 3회", actionHowTo: "'끝까지 ___해서 멋졌어'.", actionMinutes: 4, videoReason: "" },
  { mission: "또래 코칭", actionTitle: "친구 갈등 함께 정리", actionHowTo: "{{name}} 입장 1줄, 친구 입장 1줄.", actionMinutes: 6, videoReason: "" },
  { mission: "강도 진단", actionTitle: "오늘 가장 큰 감정 0~10", actionHowTo: "{{name}}이 강도 표시.", actionMinutes: 4, videoReason: "" },
  { mission: "학습 동기 1개", actionTitle: "'왜 배우는지' 대화", actionHowTo: "과목 1개 의미 묻기.", actionMinutes: 6, videoReason: "" },
  { mission: "자기조절 모델", actionTitle: "부모가 호흡 보여주기", actionHowTo: "{{name}} 앞에서 4-7-8 호흡.", actionMinutes: 4, videoReason: "" },
  { mission: "감사 한 줄", actionTitle: "{{name}}에게 감사 1개", actionHowTo: "구체 감사 한 마디.", actionMinutes: 3, videoReason: "" },
  { mission: "2주차 회고", actionTitle: "줄어든 갈등 1개", actionHowTo: "이전보다 나아진 점.", actionMinutes: 5, videoReason: "" },
  { mission: "양육자 자기돌봄", actionTitle: "10분 명상", actionHowTo: "혼자 10분.", actionMinutes: 10, videoReason: "" },
  { mission: "사생활 존중", actionTitle: "방 노크 후 들어가기", actionHowTo: "오늘부터 노크.", actionMinutes: 2, videoReason: "" },
  { mission: "스크린 약속", actionTitle: "함께 시간 정하기", actionHowTo: "사용 시간 같이 결정.", actionMinutes: 6, videoReason: "" },
  { mission: "감정 강도 다루기", actionTitle: "감정 + 호흡 매칭", actionHowTo: "강도 7 이상이면 호흡.", actionMinutes: 5, videoReason: "" },
  { mission: "거절 문장", actionTitle: "{{name}} 보호 거절", actionHowTo: "외부 일정 거절 1개.", actionMinutes: 4, videoReason: "" },
  { mission: "관계 1순위", actionTitle: "1:1 시간 10분", actionHowTo: "방해 없는 10분.", actionMinutes: 10, videoReason: "" },
  { mission: "3주차 회고", actionTitle: "{{name}}이 자랑한 것", actionHowTo: "스스로 말한 자랑 1개.", actionMinutes: 5, videoReason: "" },
  { mission: "자율성 확장", actionTitle: "스스로 정한 일 1개", actionHowTo: "오늘 직접 정한 일.", actionMinutes: 4, videoReason: "" },
  { mission: "회복탄력성 대화", actionTitle: "실패 이야기 1개 나누기", actionHowTo: "부모의 실패 이야기.", actionMinutes: 6, videoReason: "" },
  { mission: "공동 활동", actionTitle: "함께 요리 15분", actionHowTo: "간단 요리 1개.", actionMinutes: 15, videoReason: "" },
  { mission: "친구 초대", actionTitle: "{{name}} 친구 1명 초대", actionHowTo: "이번 주 안에 초대.", actionMinutes: 5, videoReason: "" },
  { mission: "코파일럿 1:1", actionTitle: "양육 주제 1개", actionHowTo: "'요즘 {{name}}과 ___'.", actionMinutes: 6, videoReason: "" },
  { mission: "양육자 회복", actionTitle: "20분 자기 시간", actionHowTo: "혼자 20분.", actionMinutes: 20, videoReason: "" },
  { mission: "발달 이정표", actionTitle: "이번 달 새 능력 1개", actionHowTo: "처음 한 행동 기록.", actionMinutes: 4, videoReason: "" },
  { mission: "4주차 요약", actionTitle: "'4주 동안 {{name}}이 ___'", actionHowTo: "한 문장.", actionMinutes: 5, videoReason: "" },
  { mission: "30일 선언문", actionTitle: "'{{name}}의 강점을 키우는 부모'", actionHowTo: "선언문.", actionMinutes: 5, videoReason: "" },
];

const teen: DayDef[] = [
  { mission: "관계 베이스라인", actionTitle: "{{name}} 강점 3개", actionHowTo: "강점 3개 적기.", actionMinutes: 5, videoReason: "" },
  { mission: "경청 5분", actionTitle: "조언 없이 5분", actionHowTo: "끊지 말고 듣기.", actionMinutes: 5, videoReason: "" },
  { mission: "감정 반영", actionTitle: "'~게 느꼈겠다'", actionHowTo: "공감 1번.", actionMinutes: 3, videoReason: "" },
  { mission: "사생활 존중", actionTitle: "방 노크 + 존댓말 1번", actionHowTo: "공간/언어로 존중.", actionMinutes: 3, videoReason: "" },
  { mission: "가치 대화", actionTitle: "'무엇이 중요해?' 1번", actionHowTo: "한 가지 가치 묻기.", actionMinutes: 6, videoReason: "" },
  { mission: "스크린 약속 협상", actionTitle: "사용 시간 함께 정하기", actionHowTo: "강요 없이 합의.", actionMinutes: 8, videoReason: "" },
  { mission: "1주차 회고", actionTitle: "갈등 줄어든 순간 1개", actionHowTo: "기록.", actionMinutes: 4, videoReason: "" },
  { mission: "자율성 인정", actionTitle: "결정 1개 위임", actionHowTo: "{{name}}이 정하게.", actionMinutes: 4, videoReason: "" },
  { mission: "친구 관계 듣기", actionTitle: "친구 이름 3명 묻기", actionHowTo: "최근 가까운 친구.", actionMinutes: 5, videoReason: "" },
  { mission: "강도 진단", actionTitle: "갈등 강도 0~10", actionHowTo: "최근 갈등 강도 표시.", actionMinutes: 4, videoReason: "" },
  { mission: "사과 모델", actionTitle: "부모가 먼저 사과", actionHowTo: "최근 잘못 1개.", actionMinutes: 4, videoReason: "" },
  { mission: "공동 활동 비강제", actionTitle: "초대만, 강요 X", actionHowTo: "산책·식사 초대.", actionMinutes: 4, videoReason: "" },
  { mission: "감정 라벨", actionTitle: "본인 감정 명명", actionHowTo: "부모가 자기 감정을 먼저.", actionMinutes: 3, videoReason: "" },
  { mission: "2주차 회고", actionTitle: "통한 말 1개", actionHowTo: "효과 있던 말 1개.", actionMinutes: 5, videoReason: "" },
  { mission: "양육자 자기돌봄", actionTitle: "10분 명상", actionHowTo: "혼자 10분.", actionMinutes: 10, videoReason: "" },
  { mission: "미디어 콘텐츠 함께", actionTitle: "{{name}}이 좋아하는 것 1개", actionHowTo: "함께 10분 시청.", actionMinutes: 10, videoReason: "" },
  { mission: "학업 압박 점검", actionTitle: "성적 대신 노력 칭찬", actionHowTo: "결과보다 과정.", actionMinutes: 4, videoReason: "" },
  { mission: "감정 강도 다루기", actionTitle: "강도 7+이면 거리두기", actionHowTo: "둘 다 진정 후 대화.", actionMinutes: 5, videoReason: "" },
  { mission: "거절 문장", actionTitle: "{{name}} 보호 거절", actionHowTo: "외부 압박 거절.", actionMinutes: 4, videoReason: "" },
  { mission: "관계 1순위", actionTitle: "1:1 시간 15분", actionHowTo: "방해 없는 15분.", actionMinutes: 15, videoReason: "" },
  { mission: "3주차 회고", actionTitle: "{{name}}이 먼저 말한 것", actionHowTo: "선제 대화 1번.", actionMinutes: 5, videoReason: "" },
  { mission: "가치 일치 행동", actionTitle: "{{name}} 가치 1개 인정", actionHowTo: "공식 인정.", actionMinutes: 4, videoReason: "" },
  { mission: "갈등 협상", actionTitle: "Win-Win 1개", actionHowTo: "한 가지 합의안.", actionMinutes: 6, videoReason: "" },
  { mission: "신뢰 회복 행동", actionTitle: "약속 1개 지키기", actionHowTo: "작은 약속.", actionMinutes: 4, videoReason: "" },
  { mission: "친구 초대 허용", actionTitle: "친구 집에 초대 OK", actionHowTo: "장소 제공.", actionMinutes: 5, videoReason: "" },
  { mission: "코파일럿 1:1", actionTitle: "사춘기 주제 1개", actionHowTo: "'요즘 {{name}}이 ___'.", actionMinutes: 6, videoReason: "" },
  { mission: "양육자 회복", actionTitle: "20분 자기 시간", actionHowTo: "혼자 20분.", actionMinutes: 20, videoReason: "" },
  { mission: "독립 준비", actionTitle: "스스로 한 일 1개 칭찬", actionHowTo: "독립적 행동 인정.", actionMinutes: 4, videoReason: "" },
  { mission: "4주차 요약", actionTitle: "'4주 동안 {{name}}과 ___'", actionHowTo: "한 문장.", actionMinutes: 5, videoReason: "" },
  { mission: "30일 선언문", actionTitle: "'{{name}}을 신뢰하는 부모'", actionHowTo: "선언문.", actionMinutes: 5, videoReason: "" },
];

export const CHILD_MISSIONS_BY_AGE: Record<ChildAgeBucket, DayDef[]> = {
  infant, toddler, school, teen,
};

export const CHILD_WEEKLY_THEMES: Record<ChildAgeBucket, string[]> = {
  infant: ["애착·안전기지", "감각·예측 가능성", "양육자 회복", "발달 이정표"],
  toddler: ["감정 어휘", "한계 + 공감", "분리 연습", "자율성 확장"],
  school: ["경청·반영", "협상·자기조절", "사생활·자율", "회복탄력성"],
  teen: ["존중·경청", "협상·합의", "신뢰 회복", "독립 준비"],
};

export function renderName(text: string, name: string): string {
  return text.replace(/\{\{name\}\}/g, name || "아이");
}
