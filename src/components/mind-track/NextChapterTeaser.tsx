import { motion } from "framer-motion";
import { Sparkles, Calendar } from "lucide-react";
import { getNextChapter, getLatestUnlockedChapter } from "@/lib/mindTrackChapters";

interface Props {
  currentDay: number;
}

/**
 * "오늘의 Day에 맞춰 다음에 워크북에 무엇이 추가될지" 예고 미니 카드.
 * 매일 봐도 새로운 정보가 있도록 day별 맞춤 카피를 보여줌.
 */
export default function NextChapterTeaser({ currentDay }: Props) {
  const next = getNextChapter(currentDay);
  const latest = getLatestUnlockedChapter(currentDay);

  // 30일 다 마친 경우 — 완주 안내
  if (!next) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-[#fbf7eb] to-[#e8dcb6]/60 border border-[#C8B88A]/40 px-4 py-3.5 flex items-center gap-3"
      >
        <div className="w-9 h-9 rounded-xl bg-[#C8B88A]/30 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-[#8a7a4d]" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-bold tracking-[0.15em] text-[#8a7a4d] uppercase">
            All Chapters Unlocked
          </div>
          <p className="text-[13px] font-bold text-slate-900 break-keep mt-0.5">
            모든 챕터가 잠금 해제됐어요. 워크북을 받아보세요.
          </p>
        </div>
      </motion.div>
    );
  }

  const daysLeft = next.day - currentDay;
  const Icon = next.icon;

  return (
    <motion.div
      key={`teaser-${currentDay}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl bg-white border border-[#C8B88A]/30 px-4 py-3.5 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#C8B88A]/15 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[#8a7a4d]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-bold tracking-[0.18em] text-[#8a7a4d] uppercase">
              Next Chapter
            </span>
            <span className="text-[10px] text-slate-400 font-mono">·</span>
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" />
              Day {String(next.day).padStart(2, "0")}
            </span>
          </div>
          <p className="text-[13px] font-bold text-slate-900 break-keep leading-snug">
            {next.upcomingCopy(daysLeft)}
          </p>
          {latest && (
            <p className="text-[11px] text-slate-500 break-keep mt-1.5 leading-relaxed">
              지금까지 잠금 해제: <span className="text-slate-700 font-semibold">{latest.shortTitle}</span>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
