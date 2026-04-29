/**
 * Mind Track 30일 워크북 챕터 정의 (단일 진실 공급원)
 * — WorkbookPreviewCard, WeeklyChapterPreview, MindTrackWorkbookPreview, 엣지 함수가 공유
 */

import { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Compass,
  TrendingUp,
  PenLine,
  Lightbulb,
  Sparkles,
  Award,
} from "lucide-react";

export interface WorkbookChapter {
  id: string;
  day: number;        // 잠금 해제되는 일차
  weekIndex?: number; // 주차 (1~4)
  chapterNo: string;  // "00", "01" ...
  title: string;
  shortTitle: string; // 카드용 짧은 제목
  desc: string;
  preview: string;    // "이 챕터에 들어갈 것" 한 줄 카피
  icon: LucideIcon;
  /** "다음에 추가될 것" 카피 — Day별 맞춤 예고 */
  upcomingCopy: (daysLeft: number) => string;
}

export const WORKBOOK_CHAPTERS: WorkbookChapter[] = [
  {
    id: "cover",
    day: 1,
    chapterNo: "00",
    title: "표지 & 여는 글",
    shortTitle: "표지 · 여는 글",
    desc: "30일 전, 당신이 원했던 것",
    preview: "닉네임 · 트랙 주제 · 시작 시점의 마음 상태 · 출발 다짐",
    icon: BookOpen,
    upcomingCopy: () =>
      "오늘부터 표지가 그려지기 시작해요. 베이스라인 점수와 첫 다짐이 새겨집니다.",
  },
  {
    id: "ch1",
    day: 7,
    weekIndex: 1,
    chapterNo: "01",
    title: "1장 · 첫 1주 자가진단",
    shortTitle: "1주차 자가진단",
    desc: "마음의 출발점, 정확하게 짚기",
    preview: "스트레스/에너지/명료도 첫 측정 · 1주 무드 추이 · 핵심 트리거 3가지",
    icon: Compass,
    upcomingCopy: (left) =>
      left <= 1
        ? "내일 1장이 잠금 해제됩니다. 첫 7일의 자가진단 리포트가 워크북에 새겨져요."
        : `${left}일 뒤 1장이 추가돼요 — 첫 7일의 자가진단 리포트가 워크북에 새겨집니다.`,
  },
  {
    id: "ch2",
    day: 14,
    weekIndex: 2,
    chapterNo: "02",
    title: "2장 · 2주차 변화 기록",
    shortTitle: "2주차 변화 그래프",
    desc: "초기 변화의 신호 포착",
    preview: "베이스라인 vs 14일차 비교 · 회복 곡선 · 일주일치 체크인 메모 모음",
    icon: TrendingUp,
    upcomingCopy: (left) =>
      left <= 1
        ? "내일 2장이 추가돼요. 첫 변화 그래프가 그려집니다."
        : `${left}일 뒤 2장이 추가돼요 — 베이스라인 대비 첫 회복 곡선이 그려집니다.`,
  },
  {
    id: "ch3",
    day: 21,
    weekIndex: 3,
    chapterNo: "03",
    title: "3장 · 패턴의 발견",
    shortTitle: "3주차 패턴 분석",
    desc: "21일간 쌓인 데이터의 의미",
    preview: "요일별 무드 패턴 · 회복 트리거 분류 · 재발 방지 알람 포인트",
    icon: PenLine,
    upcomingCopy: (left) =>
      left <= 1
        ? "내일 3장이 추가돼요. 21일간의 패턴이 처음으로 보이기 시작합니다."
        : `${left}일 뒤 3장이 추가돼요 — 당신만의 회복 패턴이 보이기 시작합니다.`,
  },
  {
    id: "ch4",
    day: 28,
    weekIndex: 4,
    chapterNo: "04",
    title: "4장 · 핵심 인사이트",
    shortTitle: "4주차 통합 인사이트",
    desc: "30일이 알려준 자기이해",
    preview: "성장 패턴 3가지 · 발견한 자기이해 3가지 · 강점/주의 영역",
    icon: Lightbulb,
    upcomingCopy: (left) =>
      left <= 1
        ? "내일 4장이 추가돼요. 30일을 관통하는 핵심 통찰이 정리됩니다."
        : `${left}일 뒤 4장이 추가돼요 — 30일을 관통하는 통합 인사이트가 정리됩니다.`,
  },
  {
    id: "closing",
    day: 30,
    chapterNo: "05",
    title: "닫는 글 · 다음 30일",
    shortTitle: "닫는 글 · 완주 배지",
    desc: "전문가 코칭 제안 · 검증 QR",
    preview: "완주 배지 · 다음 30일 루틴 제안 · 추천 전문가 매칭 · 검증 QR",
    icon: Award,
    upcomingCopy: (left) =>
      left <= 1
        ? "내일이 완주의 날입니다. 워크북이 한 권으로 완성되고 완주 배지가 발급돼요."
        : `${left}일 뒤 30일 워크북이 완성되고 완주 배지가 발급됩니다.`,
  },
];

/** 다음에 잠금 해제될 챕터 */
export function getNextChapter(currentDay: number): WorkbookChapter | null {
  return WORKBOOK_CHAPTERS.find((c) => c.day > currentDay) ?? null;
}

/** 가장 최근에 잠금 해제된 챕터 */
export function getLatestUnlockedChapter(currentDay: number): WorkbookChapter | null {
  const unlocked = WORKBOOK_CHAPTERS.filter((c) => c.day <= currentDay);
  return unlocked[unlocked.length - 1] ?? null;
}

/** 잠금 해제 진행률 (0~1) */
export function getChapterProgress(currentDay: number): number {
  const total = WORKBOOK_CHAPTERS.length;
  const unlocked = WORKBOOK_CHAPTERS.filter((c) => c.day <= currentDay).length;
  return total === 0 ? 0 : unlocked / total;
}

/** 주차(1~4)에 해당하는 챕터 */
export function getChapterForWeek(weekIndex: 1 | 2 | 3 | 4): WorkbookChapter | undefined {
  return WORKBOOK_CHAPTERS.find((c) => c.weekIndex === weekIndex);
}

export const WORKBOOK_TOTAL_CHAPTERS = WORKBOOK_CHAPTERS.length;
