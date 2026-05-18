/**
 * ABA-grade 7-Day Child Development Curriculum
 * ─────────────────────────────────────────────
 * 30-45 부모·아이 발달/ADHD ICP 전용 트랙.
 * 응용행동분석(ABA: Applied Behavior Analysis) 원리를 따르되,
 * 임상/치료가 아닌 "부모 코칭" 프레임으로 표현합니다.
 *
 * 각 Day는 (1) 측정 가능한 표적 행동, (2) 부모가 수행하는 ABC 기록·강화 전략,
 * (3) 5분 마이크로 미션, (4) 임상 비면책 메모 — 4요소를 갖춥니다.
 * 의료·치료 주장 금지 (mem://strategy/non-medical-coaching-branding-ko).
 */

export interface ABADay {
  day: number;
  phase: "Baseline" | "ABC 기록" | "강화 설계" | "선행 조작" | "대체 행동" | "일반화" | "유지·리포트";
  /** 한 줄 후킹 */
  hook: string;
  /** 학습 목표 (부모가 그날 익히는 것) */
  parentObjective: string;
  /** 표적 행동 — 관찰·기록 가능한 단위로 정의 */
  targetBehavior: string;
  /** 데이터 수집 방법 — 빈도(frequency) / 지속시간(duration) / 간격(interval) */
  dataMethod: "frequency" | "duration" | "interval" | "ABC narrative";
  /** 5분 마이크로 미션 — 그날 실제 해보는 행동 */
  microMission: string;
  /** 부모 스크립트 예시 (실제 사용하는 문장) */
  parentScript: string;
  /** 안전·임상 메모 */
  safetyNote?: string;
}

export const ABA_CHILD_CURRICULUM_7D: ABADay[] = [
  {
    day: 1,
    phase: "Baseline",
    hook: "아이 행동을 '느낌'에서 '숫자'로 옮기는 첫날",
    parentObjective: "표적 행동을 1개만 정의하고 24시간 베이스라인 측정하기",
    targetBehavior:
      "예: '식탁에서 자리에 30초 이상 앉아 있기' — 관찰자 2명이 같은 정의로 셀 수 있게 구체적으로",
    dataMethod: "frequency",
    microMission:
      "오늘 하루 표적 행동이 발생할 때마다 휴대폰 메모에 '/' 한 번씩 표시. 환경·시간대도 같이.",
    parentScript:
      "(아이가 표적 행동을 보이면) '지금 ___ 잘했네' — 행동만 짧게 말하기, 평가/판단어 금지.",
    safetyNote:
      "베이스라인 단계에서는 행동을 바꾸려 하지 않습니다. 변화 시도는 Day 3 이후.",
  },
  {
    day: 2,
    phase: "ABC 기록",
    hook: "문제 행동의 '왜'를 처음으로 본다",
    parentObjective: "ABC(Antecedent–Behavior–Consequence) 기록으로 트리거 패턴 발견",
    targetBehavior:
      "Day 1에서 정한 표적 행동의 반대(예: '식탁에서 일어나기') 또는 가장 부담되는 행동 1가지",
    dataMethod: "ABC narrative",
    microMission:
      "행동 발생 3건만 'A: 직전 1분 / B: 행동 / C: 직후 1분' 3줄로 기록.",
    parentScript:
      "(행동 직후) — 말하지 않고 5초 관찰. 무엇이 강화되고 있는지(관심·회피·물건·감각) 가설 메모.",
    safetyNote:
      "ABC는 가설 도구입니다. 단정 진단(예: 'ADHD')으로 비약하지 않습니다.",
  },
  {
    day: 3,
    phase: "강화 설계",
    hook: "'야단'을 빼고 '강화'를 처음 넣는 날",
    parentObjective: "표적 행동에 대한 차별적 정적 강화(DRA: Differential Reinforcement) 설계",
    targetBehavior: "Day 1에서 정한 바람직한 행동을 1회 발생할 때마다 즉시 강화",
    dataMethod: "frequency",
    microMission:
      "강화제 3종 후보(사회적·활동·1차) 적기 → 아이가 가장 선호하는 1개 선택 → 오늘 5회 시도.",
    parentScript:
      "행동 직후 3초 안에 '구체 칭찬 + 강화제' — 예: '의자에 30초 앉았네, 좋아하는 스티커 한 장 더!'",
    safetyNote:
      "음식·물질 보상은 권장하지 않습니다. 사회적 강화(웃음, 하이파이브) 우선.",
  },
  {
    day: 4,
    phase: "선행 조작",
    hook: "행동이 바뀌지 않으면 환경을 바꾼다",
    parentObjective: "선행자극(Antecedent) 조정으로 문제 행동의 트리거 자체를 줄이기",
    targetBehavior: "ABC 기록에서 가장 자주 나온 트리거 1개를 사전에 제거/완화",
    dataMethod: "frequency",
    microMission:
      "트리거 1개(예: 식사 직전 영상 시청)에 대해 환경 변경 1가지 실행 후 횟수 비교.",
    parentScript:
      "(전환 시점 2분 전) '2분 뒤에 ___ 시작할 거야. 시계 같이 볼까?' — 시각 타이머 제시.",
  },
  {
    day: 5,
    phase: "대체 행동",
    hook: "'하지 마' 대신 '이걸 해' 가르치기",
    parentObjective:
      "기능적 등가 대체 행동(FCT: Functional Communication Training) — 같은 기능을 채우는 적절한 행동 가르치기",
    targetBehavior:
      "문제 행동(예: 떼쓰기)이 채우던 기능(관심/회피)을 대체할 의사소통 행동(예: '쉬어도 돼?' 카드)",
    dataMethod: "frequency",
    microMission:
      "대체 행동 1개 모델링 3회 → 아이가 사용 시 즉시 100% 강화(요청 들어주기).",
    parentScript:
      "(아이가 대체 행동 사용) — 1초 안에 '말해줘서 고마워, 바로 들어줄게.' 요청을 즉시 충족.",
    safetyNote:
      "초기 1~2주는 일관성이 핵심. 가끔만 들어주면 외려 문제 행동을 강화할 수 있습니다.",
  },
  {
    day: 6,
    phase: "일반화",
    hook: "집에서 잘 되던 게 어린이집에서도 되도록",
    parentObjective:
      "장소/시간/사람에 걸친 일반화(generalization) 점검 — 한 환경 성공을 다른 환경으로 옮기기",
    targetBehavior: "Day 3~5에서 늘어난 바람직한 행동을 새 환경 1곳에서 측정",
    dataMethod: "interval",
    microMission:
      "10분 인터벌 3회 동안 새 환경(외출지·할머니 댁 등)에서 표적 행동 발생 여부 체크.",
    parentScript:
      "(새 환경 진입 직전) '집에서처럼 ___하면 똑같이 ___ 해줄게.' — 강화 약속 사전 고지.",
  },
  {
    day: 7,
    phase: "유지·리포트",
    hook: "7일 변화 데이터 + 다음 30일 부모 행동 처방",
    parentObjective:
      "Day 1 베이스라인 vs Day 6 데이터 비교 → 유지(maintenance) 계획 수립",
    targetBehavior: "표적 행동의 주간 변화율, 강화 일관성률, 트리거 감소율 산출",
    dataMethod: "frequency",
    microMission:
      "7일 데이터 한 장 요약 → 다음 23일 동안 유지할 강화 스케줄 1개 선택 (연속→간헐 전환).",
    parentScript:
      "(가족 회의) '우리는 ___을(를) ___배 늘렸어. 다음 한 달은 ___로 이어갈게.' — 가족 합의 1줄.",
    safetyNote:
      "진전이 없거나 자해·공격 행동이 있다면 7일째에 자격을 갖춘 전문가 상담으로 연결하세요.",
  },
];

/** Inflearn 허브에 노출되는 7일 커리큘럼 요약 라인 */
export const ABA_CHILD_CURRICULUM_LINES: string[] =
  ABA_CHILD_CURRICULUM_7D.map(
    (d) => `Day ${d.day} · ${d.phase} — ${d.parentObjective}`,
  );
