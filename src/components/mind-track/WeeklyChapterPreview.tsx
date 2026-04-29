import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle2 } from "lucide-react";
import { WORKBOOK_CHAPTERS } from "@/lib/mindTrackChapters";

interface Props {
  currentDay: number;
}

/**
 * 1주(7) / 2주(14) / 3주(21) / 4주(28)마다 워크북에 추가될 섹션을 미리보기 카드로 예고.
 * 잠금 상태(완료/예정)와 "이 챕터에 들어갈 것" 설명을 한눈에.
 */
export default function WeeklyChapterPreview({ currentDay }: Props) {
  // 주차 챕터만 (표지/닫는 글 제외)
  const weeklyChapters = WORKBOOK_CHAPTERS.filter((c) => c.weekIndex);

  return (
    <Card className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/70 shadow-sm">
      <div className="mb-4">
        <div className="text-[11px] font-bold tracking-[0.18em] text-[#8a7a4d] uppercase mb-1">
          Weekly Chapter Preview
        </div>
        <h3 className="text-[16px] sm:text-lg font-bold text-slate-900 break-keep">
          주차마다 워크북에 더해지는 것
        </h3>
        <p className="text-[12px] text-slate-500 break-keep mt-1 leading-relaxed">
          7일·14일·21일·28일에 도달할 때마다 한 챕터씩 워크북에 새겨집니다.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {weeklyChapters.map((ch, idx) => {
          const unlocked = currentDay >= ch.day;
          const isNext = !unlocked && weeklyChapters.slice(0, idx).every((p) => currentDay >= p.day);
          const Icon = ch.icon;

          return (
            <motion.div
              key={ch.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`relative rounded-2xl border p-3.5 transition-colors ${
                unlocked
                  ? "bg-[#fbf7eb]/50 border-[#C8B88A]/40"
                  : isNext
                  ? "bg-white border-[#C8B88A]/30 ring-2 ring-[#C8B88A]/20"
                  : "bg-slate-50/60 border-slate-200/70"
              }`}
            >
              {isNext && (
                <Badge className="absolute -top-2 right-3 h-4 px-1.5 text-[9px] bg-[#C8B88A] text-white border-0">
                  NEXT
                </Badge>
              )}

              <div className="flex items-start gap-2.5 mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    unlocked
                      ? "bg-[#C8B88A]/25 text-[#8a7a4d]"
                      : "bg-slate-200/70 text-slate-400"
                  }`}
                >
                  {unlocked ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-400">
                      Week {ch.weekIndex} · Day {ch.day}
                    </span>
                    {!unlocked && <Lock className="w-2.5 h-2.5 text-slate-300" />}
                  </div>
                  <h4
                    className={`text-[13px] font-bold break-keep leading-tight mt-0.5 ${
                      unlocked ? "text-slate-900" : "text-slate-600"
                    }`}
                  >
                    {ch.shortTitle}
                  </h4>
                </div>
              </div>

              <p
                className={`text-[11.5px] break-keep leading-relaxed ${
                  unlocked ? "text-slate-700" : "text-slate-500"
                }`}
              >
                {ch.preview}
              </p>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
