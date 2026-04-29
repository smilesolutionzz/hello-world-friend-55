import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Lock, CheckCircle2, Sparkles, Eye, Bell, ClipboardCheck, Video, PenLine } from "lucide-react";
import { toast } from "sonner";
import WorkbookSamplePreviewModal from "./WorkbookSamplePreviewModal";
import ChapterShareButton from "./ChapterShareButton";
import { WORKBOOK_CHAPTERS } from "@/lib/mindTrackChapters";
import {
  getAssessmentForDay,
  isAssessmentMissionCompleted,
} from "@/lib/mindTrackAssessmentMissions";

interface WorkbookPreviewCardProps {
  currentDay: number;
  completedCount: number;
  trackTheme?: string;
  nickname?: string;
  /** 실데이터 — 모달 통계용 */
  checkins?: any[];
  baselines?: any[];
  enrollmentId?: string;
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
}: WorkbookPreviewCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const totalChapters = CHAPTERS.length;
  const unlockedChapters = CHAPTERS.filter((c) => currentDay >= c.day).length;
  const isComplete = currentDay >= 30;
  const remainingDays = Math.max(0, 30 - currentDay);

  // Day별 미션 완료 도트 — 검사·영상·체크인 3가지를 시각화
  const missionProgress = useMemo(() => {
    const map = new Map<number, { assessment: boolean | null; video: boolean | null; checkin: boolean }>();
    const checkinByDay = new Map<number, any>();
    for (const c of checkins) checkinByDay.set(c.day_number, c);

    for (let d = 1; d <= currentDay; d++) {
      const c = checkinByDay.get(d);
      const rec = getAssessmentForDay(d);
      map.set(d, {
        assessment: rec ? isAssessmentMissionCompleted(enrollmentId, d) : null,
        // 영상 완료 여부는 체크인의 video_reflection 존재 또는 watched 여부로 추정
        video: c?.video_reflection ? true : c ? false : null,
        checkin: !!c?.completed,
      });
    }
    return map;
  }, [checkins, currentDay, enrollmentId]);

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

        {/* 카피 — 동기부여 메시지 */}
        <div className="text-center mb-5 px-2">
          {isComplete ? (
            <p className="text-[15px] font-bold text-slate-900 break-keep leading-relaxed">
              30일을 모두 마쳤어요. 당신의 워크북이 완성되었습니다.
            </p>
          ) : (
            <p className="text-[14px] sm:text-[15px] text-slate-700 break-keep leading-relaxed">
              앞으로{" "}
              <span className="font-bold text-[#8a7a4d]">{remainingDays}일</span> 후,
              <br className="sm:hidden" />
              <span className="font-semibold text-slate-900"> 나만의 마음 기록 한 권</span>이
              완성됩니다
            </p>
          )}
        </div>

        {/* 챕터 목록 — 잠금 해제 상태 + NEW 배지 + 공유 버튼 */}
        <div className="space-y-2 mb-5">
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
                {/* NEW 펄스 알림 닷 */}
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
    </>
  );
}
