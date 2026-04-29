/**
 * Mind Track 미션 진행률 계산 (단일 진실 공급원)
 * - Day별 3축(검사/영상/회고) 완료 여부와 퍼센트
 * - 마일스톤(Day 1, 2, 14, 21, 30) 묶음 진행률
 * - 완성도(Workbook) 카피 변형용 신호
 *
 * 사용처: WorkbookPreviewCard, MissionMilestoneTracker, 워크북 미리보기 모달
 */

import {
  getAssessmentForDay,
  isAssessmentMissionCompleted,
} from "./mindTrackAssessmentMissions";

export interface DayMissionStatus {
  day: number;
  /** 검사 미션 필요 여부 (Day 1·2만 true) */
  needsAssessment: boolean;
  assessmentDone: boolean;
  /** 영상 미션 필요 여부 — 체크인이 존재하면 true 처리 */
  needsVideo: boolean;
  videoDone: boolean;
  /** 회고(체크인) 완료 여부 */
  reflectionDone: boolean;
  /** 0~100 — 필요한 축 대비 완료 비율 */
  percent: number;
  /** 모든 필요 축 완료 */
  fullyDone: boolean;
}

export function computeDayStatus(
  day: number,
  checkin: any | undefined,
  enrollmentId?: string,
): DayMissionStatus {
  const rec = getAssessmentForDay(day);
  const needsAssessment = !!rec;
  const assessmentDone = needsAssessment
    ? isAssessmentMissionCompleted(enrollmentId, day)
    : false;
  const needsVideo = true; // 모든 day는 영상 회고 칸을 가짐 (있으면 가산)
  const videoDone = !!checkin?.video_reflection;
  const reflectionDone = !!checkin?.completed;

  const axes: boolean[] = [];
  if (needsAssessment) axes.push(assessmentDone);
  if (needsVideo) axes.push(videoDone);
  axes.push(reflectionDone);

  const done = axes.filter(Boolean).length;
  const percent = axes.length === 0 ? 0 : Math.round((done / axes.length) * 100);

  return {
    day,
    needsAssessment,
    assessmentDone,
    needsVideo,
    videoDone,
    reflectionDone,
    percent,
    fullyDone: percent === 100,
  };
}

/** 워크북 완성도용 마일스톤 정의 — 사용자에게 보이는 핵심 분기점 */
export const MILESTONES: Array<{ day: number; label: string; tag: string }> = [
  { day: 1, label: "출발선", tag: "Day 01" },
  { day: 2, label: "초기 흐름", tag: "Day 02" },
  { day: 7, label: "1주차 자가진단", tag: "Day 07" },
  { day: 14, label: "2주차 변화", tag: "Day 14" },
  { day: 21, label: "3주차 패턴", tag: "Day 21" },
  { day: 30, label: "완주 · 워크북 완성", tag: "Day 30" },
];

export interface MilestoneStatus {
  day: number;
  label: string;
  tag: string;
  reached: boolean; // currentDay >= day
  /** 그 날까지 누적된 체크인 비율 (0~100) */
  reflectionPercent: number;
  /** Day 1·2의 검사 완료 여부(가능한 경우) */
  assessmentDone: boolean | null;
  /** 영상 시청 / 회고 작성된 비율 (0~100) */
  videoPercent: number;
  /** 종합 완성도 0~100 */
  overallPercent: number;
}

export function computeMilestones(
  currentDay: number,
  checkins: any[],
  enrollmentId?: string,
): MilestoneStatus[] {
  const checkinByDay = new Map<number, any>();
  for (const c of checkins) checkinByDay.set(c.day_number, c);

  return MILESTONES.map((m) => {
    const reached = currentDay >= m.day;
    const upTo = Math.min(currentDay, m.day);

    let reflectionDone = 0;
    let videoDone = 0;
    for (let d = 1; d <= upTo; d++) {
      const c = checkinByDay.get(d);
      if (c?.completed) reflectionDone++;
      if (c?.video_reflection) videoDone++;
    }
    const reflectionPercent = m.day === 0 ? 0 : Math.round((reflectionDone / m.day) * 100);
    const videoPercent = m.day === 0 ? 0 : Math.round((videoDone / m.day) * 100);

    let assessmentDone: boolean | null = null;
    if (m.day <= 2) {
      assessmentDone = isAssessmentMissionCompleted(enrollmentId, m.day);
    } else if (m.day >= 7) {
      // Day 1·2 둘 다 완료되었는지로 대체
      assessmentDone =
        isAssessmentMissionCompleted(enrollmentId, 1) &&
        isAssessmentMissionCompleted(enrollmentId, 2);
    }

    const parts = [reflectionPercent, videoPercent];
    if (assessmentDone !== null) parts.push(assessmentDone ? 100 : 0);
    const overallPercent = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);

    return {
      day: m.day,
      label: m.label,
      tag: m.tag,
      reached,
      reflectionPercent,
      videoPercent,
      assessmentDone,
      overallPercent,
    };
  });
}

/**
 * 검사·영상·회고 중 무엇이 비어있는지 한 줄로 요약 — 완성도 헤드라인의 근거 문장.
 * 예: "지금은 검사·영상은 완료, 회고만 남았어요"
 */
export function summarizeMissingAxes(args: {
  day1?: DayMissionStatus;
  day2?: DayMissionStatus;
  currentDay: number;
}): string {
  const { day1, day2, currentDay } = args;

  if (currentDay >= 30) {
    return "지금은 검사·영상·회고 모두 마감 — 워크북 한 권으로 묶을 준비가 끝났어요.";
  }

  // Day 1·2 기준으로 누가 비었는지 집계
  const considered = [day1, day2].filter(Boolean) as DayMissionStatus[];
  if (considered.length === 0) {
    return "지금은 첫 체크인을 시작해 검사·영상·회고 기록을 모으는 단계예요.";
  }

  const missing: string[] = [];
  const done: string[] = [];

  const needsAssessment = considered.some((d) => d.needsAssessment);
  const assessmentDone = considered.every((d) => !d.needsAssessment || d.assessmentDone);
  if (needsAssessment) {
    (assessmentDone ? done : missing).push("검사");
  }

  const videoDone = considered.every((d) => d.videoDone);
  (videoDone ? done : missing).push("영상");

  const reflectionDone = considered.every((d) => d.reflectionDone);
  (reflectionDone ? done : missing).push("회고");

  if (missing.length === 0) {
    return "지금은 검사·영상·회고 모두 완료 — 다음 챕터 잠금 해제만 남았어요.";
  }
  if (done.length === 0) {
    return `지금은 ${missing.join("·")}이(가) 모두 비어있어요. 가장 짧은 ${missing[0]} 1개부터 시작해 보세요.`;
  }
  return `지금은 ${done.join("·")}은 완료, ${missing.join("·")}만 남았어요.`;
}

/** 완성도 카피 톤 결정 — 검사/영상/회고 상태에 맞춘 설득 카피 + 근거 요약 */
export function getCompletenessCopy(args: {
  currentDay: number;
  day1?: DayMissionStatus;
  day2?: DayMissionStatus;
  overallPercent: number;
  remainingDays: number;
}): {
  headline: string;
  sub: string;
  reason: string;
  tone: "warn" | "nudge" | "go" | "done";
} {
  const { currentDay, day1, day2, overallPercent, remainingDays } = args;
  const reason = summarizeMissingAxes({ day1, day2, currentDay });

  if (currentDay >= 30) {
    return {
      headline: "30일을 모두 마쳤어요. 워크북이 한 권으로 완성되었습니다.",
      sub: "이제 표지부터 닫는 글까지 한 권으로 내려받을 수 있어요.",
      reason,
      tone: "done",
    };
  }

  // Day 1·2 검사 미완료 → 강한 경고 톤
  const missingAssessment =
    (day1 && day1.needsAssessment && !day1.assessmentDone) ||
    (day2 && day2.needsAssessment && !day2.assessmentDone);

  if (missingAssessment) {
    return {
      headline: "지금 베이스라인을 안 찍으면, 30일 뒤 변화량을 잴 수 없어요",
      sub: "Day 1·2 추천 검사 1개만 끝내면 워크북 완성도가 즉시 올라갑니다.",
      reason,
      tone: "warn",
    };
  }

  const day1NoReflection = day1 && day1.needsAssessment && day1.assessmentDone && !day1.reflectionDone;
  const day2NoReflection = day2 && day2.needsAssessment && day2.assessmentDone && !day2.reflectionDone;
  if (day1NoReflection || day2NoReflection) {
    return {
      headline: "검사 점수가 들어왔어요. 한 줄 회고만 더하면 워크북 1장이 채워집니다",
      sub: "회고 한 줄이 30일 뒤 ‘내 변화의 이유’를 설명해주는 단서가 돼요.",
      reason,
      tone: "nudge",
    };
  }

  if (overallPercent >= 80) {
    return {
      headline: `완성도 ${overallPercent}% — 결승선이 보여요`,
      sub: `앞으로 ${remainingDays}일이면 나만의 마음 기록 한 권이 손에 남습니다.`,
      reason,
      tone: "go",
    };
  }

  if (overallPercent >= 40) {
    return {
      headline: `완성도 ${overallPercent}% · ${remainingDays}일 뒤 워크북이 완성됩니다`,
      sub: "한 챕터씩 잠금이 풀리고 있어요. 오늘의 회고를 더해 페이지를 채워보세요.",
      reason,
      tone: "go",
    };
  }

  return {
    headline: `완성도 ${overallPercent}% — 지금이 가장 중요한 출발 구간`,
    sub: "초반 7일의 기록이 30일 분석 정확도의 60% 이상을 결정합니다.",
    reason,
    tone: "nudge",
  };
}

