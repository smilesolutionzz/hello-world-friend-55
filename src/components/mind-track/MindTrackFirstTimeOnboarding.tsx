import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, PlayCircle, Phone, ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
  onStart: () => void;
  onSnoozeToday?: () => void;
}

const SLIDES = [
  {
    icon: Calendar,
    badge: "30일, 이렇게 흘러가요",
    title: "1주차 적응 → 2~3주차 실천 → 4주차 변화 리포트",
    body: "처음 7일은 짧은 셀프 체크로 마음의 출발점을 잡고, 8~21일은 매일 3분 미션으로 루틴을 만듭니다. 마지막 22~30일에는 변화 그래프와 한 달 회고 리포트를 받아보세요.",
    bullets: [
      "Day 1~7 — 마음 출발점 기록 + 짧은 적응 미션",
      "Day 8~21 — 매일 3분 맞춤 미션과 체크인",
      "Day 22~30 — 깊이 있는 코칭 + 30일 변화 리포트",
    ],
  },
  {
    icon: PlayCircle,
    badge: "하루 흐름은 이렇게",
    title: "오늘 미션 → 3분 실천 → 한 줄 기록",
    body: "복잡하지 않습니다. 매일 카드 하나만 열면 돼요.",
    bullets: [
      "1. 오늘의 미션 카드 열기 (홈 상단에 항상 노출)",
      "2. 미션 단계 가이드 따라 3~5분 실천",
      "3. 한 줄 기록으로 체크인 완료 — 끝!",
    ],
  },
  {
    icon: Phone,
    badge: "막힐 때는 여기로",
    title: "혼자 풀기 어려우면 사람이 옆에 있어요",
    body: "AI 코파일럿이 24시간 옆에서 도와주고, 일정 시점에는 전문가 1:1 매칭도 추천해드려요.",
    bullets: [
      "미션 카드 안 \"막혔어요\" 버튼 → 1탭으로 전문가 매칭",
      "Day 7·14·21 — 적응/중간점검/심화 케어 추천",
      "긴급 상황은 언제든 우선 매칭 (별도 안내)",
    ],
  },
];

export default function MindTrackFirstTimeOnboarding({ open, onClose, onStart, onSnoozeToday }: Props) {
  const [idx, setIdx] = useState(0);
  const slide = SLIDES[idx];
  const Icon = slide.icon;
  const isLast = idx === SLIDES.length - 1;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-white border-0">
        {/* 진행 인디케이터 */}
        <div className="px-6 pt-6 pb-2 flex items-center gap-1.5">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full flex-1 transition-all ${
                i <= idx ? "bg-[#1a1a1a]" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="px-6 pb-2 pt-3 space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-[#C8B88A]/15 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#8a7a4d]" />
              </div>
              <span className="text-[11px] font-semibold tracking-wider text-[#8a7a4d] uppercase">
                {slide.badge}
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-slate-900 break-keep leading-snug">
              {slide.title}
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed break-keep">
              {slide.body}
            </p>

            <ul className="space-y-2 bg-slate-50 rounded-2xl p-4 border border-slate-100">
              {slide.bullets.map((b, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700 leading-relaxed break-keep">
                  <Sparkles className="w-3.5 h-3.5 text-[#C8B88A] shrink-0 mt-1" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (idx === 0 ? onClose() : setIdx((i) => i - 1))}
              className="text-slate-500"
            >
              {idx === 0 ? "건너뛰기" : (
                <>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  이전
                </>
              )}
            </Button>
            {onSnoozeToday && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSnoozeToday}
                className="text-slate-400 hover:text-slate-700 text-xs"
              >
                오늘 다시 보지 않기
              </Button>
            )}
          </div>

          {isLast ? (
            <Button
              onClick={onStart}
              className="bg-[#1a1a1a] text-white hover:bg-black rounded-xl px-5"
            >
              오늘의 미션 시작
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => setIdx((i) => i + 1)}
              className="bg-[#1a1a1a] text-white hover:bg-black rounded-xl px-5"
            >
              다음
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
