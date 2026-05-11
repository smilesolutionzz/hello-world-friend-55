// 14년 경력 현장 전문가가 설계한 30일 마음 트랙 일별 시드.
// AI 미션 생성 시 "추상적 위로"가 아닌 "이론 기반·구체적·단계적" 미션이 나오도록
// weekly-refresh / init 함수에서 프롬프트에 주입한다.
//
// 톤: 비의료, 코칭/회복 코어. 외부 브랜드/약어 금지.
// 구조: theme(주제) / focus(이번 미션이 다루는 회복 메커니즘) / anchor(현장 사례 한 줄) /
//        suggestedAction(미션 1줄 시드) / reflectionAngle(체크인 자기성찰 방향)

export interface ExpertDaySeed {
  day: number;
  week: number;
  theme: string;
  focus: string;
  anchor: string;
  suggestedAction: string;
  reflectionAngle: string;
  difficulty: "easy" | "medium" | "deep";
}

export const EXPERT_DAY_SEEDS: Record<number, ExpertDaySeed> = {
  // ───── 1주차 · 출발 정렬 (자가관찰 + 베이스라인 안정화) ─────
  1: { day: 1, week: 1, theme: "출발선 그리기", focus: "현재 상태 객관화", anchor: "회복은 측정에서 시작한다", suggestedAction: "오늘의 스트레스·에너지·명료성 점수를 기록하고 한 줄 메모", reflectionAngle: "지금 가장 무거운 한 가지", difficulty: "easy" },
  2: { day: 2, week: 1, theme: "마이크로 호흡 루틴", focus: "자율신경 안정화 (4-4-6 호흡)", anchor: "긴장이 누적되기 전에 끊어주는 첫 도구", suggestedAction: "정해진 시간 1회, 4-4-6 호흡 5세트", reflectionAngle: "호흡 전후 몸의 변화", difficulty: "easy" },
  3: { day: 3, week: 1, theme: "감정 라벨링", focus: "감정 단어를 늘려 인식 해상도 높이기", anchor: "이름 붙인 감정은 다루기 쉬워진다", suggestedAction: "오늘 떠오른 감정 3개에 단어로 이름 붙이기", reflectionAngle: "가장 자주 등장한 감정 단어", difficulty: "easy" },
  4: { day: 4, week: 1, theme: "신체 신호 스캔", focus: "마음-몸 연결 인식", anchor: "어깨·턱·호흡은 가장 먼저 신호를 보낸다", suggestedAction: "기상 후·취침 전 보디스캔 3분", reflectionAngle: "긴장이 가장 잘 모이는 부위", difficulty: "easy" },
  5: { day: 5, week: 1, theme: "5분 행동 활성화", focus: "회피 무력감 깨기", anchor: "작은 행동 1개가 하루의 톤을 바꾼다", suggestedAction: "5분 안에 끝나는 미뤄둔 일 1개 처리", reflectionAngle: "행동 후 기분 변화", difficulty: "easy" },
  6: { day: 6, week: 1, theme: "에너지 누수 점검", focus: "환경/관계 자극원 식별", anchor: "에너지를 빼앗는 1개를 줄이면 회복 속도가 달라진다", suggestedAction: "오늘 에너지를 가장 빼앗은 자극 1가지를 적기", reflectionAngle: "그 자극을 내일 어떻게 줄일지", difficulty: "medium" },
  7: { day: 7, week: 1, theme: "1주차 리뷰", focus: "데이터 기반 인사이트", anchor: "7일치 점수가 첫 패턴을 드러낸다", suggestedAction: "1주 점수 변화·체크인 메모를 보고 한 줄 요약", reflectionAngle: "이번 주 가장 효과 있던 행동", difficulty: "medium" },

  // ───── 2주차 · 마음 루틴 (안정 루틴 형성) ─────
  8:  { day: 8, week: 2, theme: "아침 마음챙김 루틴", focus: "하루의 첫 5분 고정", anchor: "아침이 흔들리면 하루가 흔들린다", suggestedAction: "기상 직후 호흡 1분 + 의도 1문장 적기", reflectionAngle: "오늘 의도를 얼마나 지켰는지", difficulty: "easy" },
  9:  { day: 9, week: 2, theme: "생각의 자동 재생 끊기", focus: "반복되는 부정 사고 알아차림", anchor: "같은 생각이 5번 반복되면 의식이 잠든 상태", suggestedAction: "오늘 가장 자주 떠오른 생각 1개를 적고 '정말 그런가?' 한 줄 반박", reflectionAngle: "그 생각의 트리거 상황", difficulty: "medium" },
  10: { day: 10, week: 2, theme: "에너지 골든타임", focus: "회복 시간대 발견", anchor: "회복 효율은 시간대마다 다르다", suggestedAction: "하루 중 가장 안정적인 시간대 1개를 메모", reflectionAngle: "그 시간에 어떤 루틴을 옮길지", difficulty: "easy" },
  11: { day: 11, week: 2, theme: "관계 패턴 알아차림", focus: "자동 반응 인식", anchor: "가까운 사람 앞에서 반복되는 반응이 핵심 패턴", suggestedAction: "오늘 가까운 사람과의 대화에서 반복된 내 반응 1개 메모", reflectionAngle: "그 반응이 보호하는 게 무엇인지", difficulty: "medium" },
  12: { day: 12, week: 2, theme: "미니 호흡 인터럽트", focus: "긴장 누적 끊기", anchor: "쉼은 길이가 아니라 빈도", suggestedAction: "오늘 일과 중 4-7-8 호흡 3회 시도", reflectionAngle: "어느 순간에 가장 도움이 됐는지", difficulty: "easy" },
  13: { day: 13, week: 2, theme: "5분 자유 기록", focus: "감정 정리·인지 재구성", anchor: "쓰는 순간 머릿속이 비워진다", suggestedAction: "타이머 5분, 떠오르는 모든 것을 한 페이지에 적기", reflectionAngle: "쓰고 난 뒤 가장 강한 감정", difficulty: "medium" },
  14: { day: 14, week: 2, theme: "2주차 변화 점검", focus: "베이스라인 대비 변화 측정", anchor: "변화는 작게, 그러나 확실히 보인다", suggestedAction: "1주차 대비 가장 부드러워진 영역 1개 적기", reflectionAngle: "왜 그 영역이 바뀌었는지", difficulty: "medium" },

  // ───── 3주차 · 패턴 전환 (회피·관계·자기자비) ─────
  15: { day: 15, week: 3, theme: "중간 지점 재정렬", focus: "효과 있던 루틴 강화", anchor: "30일의 절반, 가장 효과 있던 루틴을 두 번 더", suggestedAction: "지금까지 가장 효과 있던 루틴 1개를 오늘 2회 시도", reflectionAngle: "왜 이 루틴이 나에게 맞는지", difficulty: "easy" },
  16: { day: 16, week: 3, theme: "회피 깨기", focus: "5분 노출", anchor: "회피한 일은 마음의 무게로 남는다", suggestedAction: "미뤄둔 일 1개를 5분만 시도하기", reflectionAngle: "시도 전후 부담감의 차이", difficulty: "deep" },
  17: { day: 17, week: 3, theme: "도움 요청 연습", focus: "사회적 지지 활성화", anchor: "혼자 짊어지지 않는 것이 회복의 핵심", suggestedAction: "신뢰하는 1명에게 짧은 메시지로 도움 요청", reflectionAngle: "요청 전 망설인 이유", difficulty: "deep" },
  18: { day: 18, week: 3, theme: "감정 강도 측정", focus: "탈동일시", anchor: "감정과 거리를 두면 휘둘리지 않는다", suggestedAction: "강한 감정이 올라올 때 0~10으로 측정 + 한 단어 라벨", reflectionAngle: "측정 후 강도 변화", difficulty: "medium" },
  19: { day: 19, week: 3, theme: "자기 자비", focus: "내적 비판자 다루기", anchor: "자신에게 가장 엄한 사람은 자기 자신", suggestedAction: "오늘 잘한 일 1가지를 친구에게 말하듯 스스로에게 말하기", reflectionAngle: "그 말을 들었을 때 몸의 반응", difficulty: "easy" },
  20: { day: 20, week: 3, theme: "에너지 도둑 정리", focus: "환경 디자인", anchor: "환경이 바뀌면 의지력이 절약된다", suggestedAction: "에너지를 빼앗는 환경 1개를 손보기 (앱 알림·자리 배치 등)", reflectionAngle: "손본 뒤 변화", difficulty: "medium" },
  21: { day: 21, week: 3, theme: "3주차 코칭 인사이트", focus: "데이터 기반 통찰 수신", anchor: "21일이 회복 패턴이 분명해지는 분기점", suggestedAction: "21일치 데이터로 받은 코칭 메시지를 한 문장으로 재작성", reflectionAngle: "가장 와닿은 한 줄", difficulty: "medium" },

  // ───── 4주차 · 깊이 있는 코칭 (정체성·재발 방지·관계 회복) ─────
  22: { day: 22, week: 4, theme: "패턴 뿌리 탐색", focus: "초기 학습 경험 살피기", anchor: "지금의 패턴은 어디서 시작됐는가", suggestedAction: "오늘 패턴 1개를 골라 '언제부터 시작됐는지' 한 줄 적기", reflectionAngle: "그 패턴이 나를 어떻게 보호해왔는지", difficulty: "deep" },
  23: { day: 23, week: 4, theme: "AI 코파일럿 1:1", focus: "주제 집중 대화", anchor: "혼자 정리되지 않는 주제는 대화로 풀린다", suggestedAction: "오늘 가장 풀리지 않는 주제를 코파일럿과 5분 대화", reflectionAngle: "대화 후 새롭게 보인 것", difficulty: "medium" },
  24: { day: 24, week: 4, theme: "재발 방지 신호", focus: "조기 경고 시스템", anchor: "회복은 후퇴를 미리 알아차리는 능력", suggestedAction: "예전 패턴이 돌아올 때 쓸 신호 문장 1개를 정해 저장", reflectionAngle: "이 신호가 작동할 상황", difficulty: "medium" },
  25: { day: 25, week: 4, theme: "회복 루틴 고정", focus: "지속 가능한 3종 세트", anchor: "30일 후에도 남길 루틴은 3개로 충분", suggestedAction: "지금까지 효과 있던 루틴 3가지를 골라 카드로 정리", reflectionAngle: "어떤 시간대에 어떻게 배치할지", difficulty: "medium" },
  26: { day: 26, week: 4, theme: "관계 회복 한 걸음", focus: "미뤄둔 대화", anchor: "한 마디가 막힌 관계를 풀어준다", suggestedAction: "미뤄둔 대화 1개를 짧은 메시지로 시작", reflectionAngle: "보내기 전 망설인 감정", difficulty: "deep" },
  27: { day: 27, week: 4, theme: "경계와 거절", focus: "에너지 보호 문장 만들기", anchor: "거절도 문장이 있어야 가능해진다", suggestedAction: "내 에너지를 지키는 거절 문장 1개를 미리 만들어 저장", reflectionAngle: "이 문장을 쓸 상황 1개", difficulty: "medium" },
  28: { day: 28, week: 4, theme: "4주차 정리", focus: "변화 흐름 한 문장 요약", anchor: "변화는 한 문장으로 압축될 때 자기 것이 된다", suggestedAction: "4주간의 가장 큰 변화를 한 문장으로 적기", reflectionAngle: "이 문장을 누구에게 전하고 싶은지", difficulty: "medium" },

  // ───── 5주차 · 마무리 리포트 ─────
  29: { day: 29, week: 5, theme: "리포트 데이터 마무리", focus: "마지막 체크인 정합성", anchor: "마지막 체크인이 종합 리포트의 결론을 좌우한다", suggestedAction: "오늘 체크인을 평소보다 한 단계 더 솔직하게 작성", reflectionAngle: "30일 전과 비교한 한 가지", difficulty: "easy" },
  30: { day: 30, week: 5, theme: "30일 마무리 의식", focus: "변화 자축 + 다음 30일 설계", anchor: "끝맺음은 다음 시작의 기반", suggestedAction: "감사 한 줄 + 다음 30일에 가져갈 루틴 1개를 적기", reflectionAngle: "이 워크북을 누구와 나누고 싶은지", difficulty: "medium" },
};

// 주차별 시드 묶어서 가져오기
export function getWeekSeeds(weekNumber: number): ExpertDaySeed[] {
  return Object.values(EXPERT_DAY_SEEDS).filter((s) => s.week === weekNumber);
}

// AI 프롬프트에 주입할 텍스트 형태로 변환
export function formatSeedsForPrompt(seeds: ExpertDaySeed[]): string {
  return seeds
    .map(
      (s) =>
        `Day ${s.day} | 주제: ${s.theme} | 회복 메커니즘: ${s.focus} | 현장 사례: ${s.anchor} | 미션 시드: ${s.suggestedAction} | 자기성찰 각도: ${s.reflectionAngle} | 난이도: ${s.difficulty}`,
    )
    .join("\n");
}
