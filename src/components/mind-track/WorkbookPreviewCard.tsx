import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Lock,
  CheckCircle2,
  Sparkles,
  Eye,
  Bell,
  AlertTriangle,
  Flame,
  Trophy,
  ListChecks,
  Flag,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import WorkbookSamplePreviewModal from "./WorkbookSamplePreviewModal";
import ChapterShareButton from "./ChapterShareButton";
import MissionMilestoneTracker from "./MissionMilestoneTracker";
import Day12CelebrationModal from "./Day12CelebrationModal";
import { WORKBOOK_CHAPTERS } from "@/lib/mindTrackChapters";
import {
  computeDayStatus,
  computeMilestones,
  getCompletenessCopy,
} from "@/lib/mindTrackMissionProgress";

interface WorkbookPreviewCardProps {
  currentDay: number;
  completedCount: number;
  trackTheme?: string;
  nickname?: string;
  /** 실데이터 — 모달 통계용 */
  checkins?: any[];
  baselines?: any[];
  enrollmentId?: string;
  /** Day 1·2 미션 모두 완료 시, 축하 모달 닫기 후 다음 체크인 액션 */
  onContinueCheckin?: () => void;
  /** 축하 모달 노출 정책 (기본: session) */
  celebrationDisplayPolicy?: "session" | "daily" | "always";
  /** 모달 CTA 보조 라벨 — 예: "Day 3 미션" */
  nextMissionLabel?: string;
  /** 오늘 미션 존재 여부 — 없으면 모달 CTA가 "자동 이동"으로 바뀜 */
  hasTodayMission?: boolean;
}

const CHAPTERS = WORKBOOK_CHAPTERS;

/**
 * "내 워크북" 책 메타포 카드 — 30일 후 손에 남는 결과물을 시각화.
 * Day 진행에 따라 챕터가 한 장씩 잠금 해제되는 모습으로 동기부여.
 * - 잠금 해제된 챕터에 NEW 펄스 배지 + 공유 버튼
 * - 미리보기 모달은 실제 체크인 데이터로 자동 채워짐
 */
export default function WorkbookPreviewCard({
  currentDay,
  completedCount,
  trackTheme,
  nickname,
  checkins = [],
  baselines = [],
  enrollmentId,
  onContinueCheckin,
  celebrationDisplayPolicy = "session",
  nextMissionLabel,
  hasTodayMission = true,
}: WorkbookPreviewCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const totalChapters = CHAPTERS.length;
  const unlockedChapters = CHAPTERS.filter((c) => currentDay >= c.day).length;
  const isComplete = currentDay >= 30;
  const remainingDays = Math.max(0, 30 - currentDay);

  // Day별 상세 상태 (검사·영상·회고 + 퍼센트)
  const dayStatuses = useMemo(() => {
    const checkinByDay = new Map<number, any>();
    for (const c of checkins) checkinByDay.set(c.day_number, c);
    const map = new Map<number, ReturnType<typeof computeDayStatus>>();
    for (let d = 1; d <= Math.max(currentDay, 2); d++) {
      map.set(d, computeDayStatus(d, checkinByDay.get(d), enrollmentId));
    }
    return map;
  }, [checkins, currentDay, enrollmentId]);

  const day1Status = dayStatuses.get(1);
  const day2Status = dayStatuses.get(2);

  // 마일스톤 종합 진행률 — 워크북 완성도 카피용
  const overallPercent = useMemo(() => {
    const ms = computeMilestones(currentDay, checkins, enrollmentId);
    return Math.round(ms.reduce((a, m) => a + m.overallPercent, 0) / ms.length);
  }, [currentDay, checkins, enrollmentId]);

  const completenessCopy = useMemo(
    () =>
      getCompletenessCopy({
        currentDay,
        day1: day1Status,
        day2: day2Status,
        overallPercent,
        remainingDays,
      }),
    [currentDay, day1Status, day2Status, overallPercent, remainingDays],
  );

  // Day 1·2 모두 완료 시 축하 모달
  const day12FullyDone =
    !!day1Status?.fullyDone && !!day2Status?.fullyDone && currentDay >= 2;

  // 챕터 언락 인앱 알림 — sessionStorage에 enrollmentId+chapter로 1회만 표시
  useEffect(() => {
    if (!enrollmentId) return;
    const justUnlocked = CHAPTERS.find(
      (c) => c.day === currentDay && c.day > 1
    );
    if (!justUnlocked) return;
    const key = `mt-chapter-unlocked-${enrollmentId}-${justUnlocked.id}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    toast.success(`${justUnlocked.title} 잠금 해제!`, {
      description: justUnlocked.preview,
      icon: <Bell className="w-4 h-4" />,
      duration: 6000,
    });
  }, [currentDay, enrollmentId]);

  const toneStyles = {
    warn: { bar: "bg-rose-500", chip: "bg-rose-50 text-rose-700", icon: AlertTriangle },
    nudge: { bar: "bg-amber-500", chip: "bg-amber-50 text-amber-700", icon: Flame },
    go: { bar: "bg-[#8a7a4d]", chip: "bg-[#C8B88A]/20 text-[#8a7a4d]", icon: Sparkles },
    done: { bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700", icon: Trophy },
  } as const;
  const tone = toneStyles[completenessCopy.tone];
  const ToneIcon = tone.icon;

  return (
    <>
      <Card className="p-5 sm:p-6 rounded-3xl bg-white border border-[#C8B88A]/30 shadow-sm">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#f5efdc] to-[#e8dcb6] flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-[#8a7a4d]" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold tracking-[0.18em] text-[#8a7a4d] uppercase">
                Your Workbook
              </div>
              <h3 className="text-[17px] sm:text-lg font-bold text-slate-900 break-keep mt-0.5">
                나의 30일 마음 워크북
              </h3>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-[#C8B88A]/50 text-[#8a7a4d] bg-[#C8B88A]/10 text-[11px] flex-shrink-0"
          >
            {unlockedChapters}/{totalChapters} 챕터
          </Badge>
        </div>

        {/* 책 비주얼 — 30개 페이지가 채워지는 모습 */}
        <div className="relative mb-5">
          <div className="rounded-2xl bg-gradient-to-b from-[#fbf7eb] to-[#f5efdc] border border-[#C8B88A]/20 p-4 sm:p-5">
            <div className="flex items-end justify-center gap-[2px] h-16 sm:h-20">
              {Array.from({ length: 30 }).map((_, i) => {
                const dayNum = i + 1;
                const filled = dayNum <= currentDay;
                const isToday = dayNum === currentDay;
                return (
                  <motion.div
                    key={i}
                    initial={{ height: 8, opacity: 0.4 }}
                    animate={{
                      height: filled ? (isToday ? "100%" : "85%") : "30%",
                      opacity: filled ? 1 : 0.35,
                    }}
                    transition={{ duration: 0.4, delay: i * 0.012 }}
                    className={`flex-1 rounded-t-sm ${
                      isToday
                        ? "bg-[#8a7a4d] shadow-[0_0_8px_rgba(138,122,77,0.5)]"
                        : filled
                        ? "bg-[#C8B88A]"
                        : "bg-[#C8B88A]/25"
                    }`}
                    title={`Day ${dayNum}`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-3 text-[10px] text-[#8a7a4d]/70 font-medium">
              <span>Day 1</span>
              <span className="font-bold text-[#8a7a4d]">현재 Day {currentDay}</span>
              <span>Day 30</span>
            </div>
          </div>
        </div>

        {/* 완성도 — 검사·영상·회고 상태 기반 설득 카피 + 진행 바 */}
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${tone.chip}`}>
              <ToneIcon className="w-3 h-3" />
              <span className="text-[10px] font-bold tracking-wider uppercase">
                Workbook · {overallPercent}%
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {isComplete ? "완성" : `D-${remainingDays}`}
            </span>
          </div>
          <p className="text-[14px] font-bold text-slate-900 break-keep leading-snug">
            {completenessCopy.headline}
          </p>
          {/* 근거 한 줄 — 검사·영상·회고 중 무엇이 비어있는지 자동 요약 */}
          <p className="text-[11.5px] text-[#8a7a4d] break-keep mt-1.5 leading-relaxed font-semibold">
            {completenessCopy.reason}
          </p>
          <p className="text-[12px] text-slate-500 break-keep mt-1 leading-relaxed">
            {completenessCopy.sub}
          </p>
          <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallPercent}%` }}
              transition={{ duration: 0.7 }}
              className={`h-full ${tone.bar}`}
            />
          </div>
          {/* 단계 바 — 6개 마일스톤 도트 */}
          <div className="mt-2.5 flex items-center justify-between gap-1">
            {[1, 2, 7, 14, 21, 30].map((d) => {
              const reached = currentDay >= d;
              const isCurrent = currentDay === d;
              return (
                <div key={d} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className={`h-1.5 w-full rounded-full ${
                      reached ? "bg-[#8a7a4d]" : "bg-slate-200"
                    } ${isCurrent ? "ring-2 ring-[#C8B88A]/60" : ""}`}
                  />
                  <span
                    className={`text-[9px] font-mono ${
                      reached ? "text-[#8a7a4d] font-bold" : "text-slate-400"
                    }`}
                  >
                    D{d}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 챕터 목록 + 마일스톤 트래커 — 아코디언으로 정리 (기본 접힘) */}
        <Accordion type="multiple" className="mb-5 rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
          <AccordionItem value="chapters" className="border-b-0 px-3">
            <AccordionTrigger className="py-3 text-sm font-bold text-slate-800 hover:no-underline">
              <span className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-[#8a7a4d]" />
                챕터 목록 · {unlockedChapters}/{totalChapters} 잠금 해제
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <div className="space-y-2">
                {CHAPTERS.map((ch) => {
                  const unlocked = currentDay >= ch.day;
                  const isJustUnlocked = unlocked && ch.day === currentDay && ch.day > 1;
                  return (
                    <div
                      key={ch.id}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
                        unlocked
                          ? "bg-white border-[#C8B88A]/30"
                          : "bg-slate-50/60 border-slate-200/70"
                      }`}
                    >
                      {isJustUnlocked && (
                        <span className="absolute -top-1 -left-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8B88A] opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#8a7a4d]" />
                        </span>
                      )}
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          unlocked
                            ? "bg-[#C8B88A]/20 text-[#8a7a4d]"
                            : "bg-slate-200/70 text-slate-400"
                        }`}
                      >
                        {unlocked ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Lock className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[13px] font-bold break-keep ${
                              unlocked ? "text-slate-900" : "text-slate-500"
                            }`}
                          >
                            {ch.title}
                          </span>
                          {isJustUnlocked && (
                            <Badge className="h-4 px-1.5 text-[9px] bg-[#C8B88A] text-white border-0 animate-pulse">
                              NEW
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 break-keep mt-0.5">
                          {ch.desc}
                        </p>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                        Day {String(ch.day).padStart(2, "0")}
                      </div>
                      {unlocked && (
                        <ChapterShareButton
                          chapterNo={ch.chapterNo}
                          chapterTitle={ch.title}
                          shortTitle={ch.shortTitle}
                          desc={ch.desc}
                          day={ch.day}
                          nickname={nickname}
                          trackTheme={trackTheme}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="milestones" className="border-b-0 px-3">
            <AccordionTrigger className="py-3 text-sm font-bold text-slate-800 hover:no-underline">
              <span className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-[#8a7a4d]" />
                Day별 미션 진행률 · 검사 / 영상 / 회고
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <MissionMilestoneTracker
                currentDay={currentDay}
                checkins={checkins}
                enrollmentId={enrollmentId}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* CTA */}
        <Button
          onClick={() => setPreviewOpen(true)}
          variant="outline"
          className="w-full h-11 rounded-xl border-[#C8B88A]/50 text-[#8a7a4d] hover:bg-[#C8B88A]/10 hover:text-[#8a7a4d] font-bold text-[13px]"
        >
          <Eye className="w-4 h-4 mr-1.5" />
          완성된 워크북 미리보기
          <Sparkles className="w-3.5 h-3.5 ml-1.5 opacity-70" />
        </Button>

        <p className="text-[10.5px] text-slate-400 text-center mt-3 break-keep leading-relaxed">
          30일 완주 시 PDF 한 권으로 내려받을 수 있어요 · 무료 포함
        </p>
      </Card>



      <WorkbookSamplePreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        nickname={nickname}
        trackTheme={trackTheme}
        currentDay={currentDay}
        checkins={checkins}
        baselines={baselines}
      />

      <Day12CelebrationModal
        shouldShow={day12FullyDone}
        enrollmentId={enrollmentId}
        onContinue={() => onContinueCheckin?.()}
        displayPolicy={celebrationDisplayPolicy}
        nextMissionLabel={nextMissionLabel}
        hasTodayMission={hasTodayMission}
      />
    </>
  );
}
