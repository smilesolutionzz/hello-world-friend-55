import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Award, Sparkles, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

interface Props {
  /** Day 1·2 모두 fullyDone 일 때 true */
  shouldShow: boolean;
  enrollmentId?: string;
  onContinue: () => void;
}

/**
 * Day 1·2 미션을 모두 완료한 직후, 한 번만 뜨는 작은 축하 모달.
 * sessionStorage로 enrollment별 1회 표시. 다음 체크인으로 부드럽게 연결.
 */
export default function Day12CelebrationModal({
  shouldShow,
  enrollmentId,
  onContinue,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!shouldShow || !enrollmentId) return;
    const key = `mt-day12-celebration-${enrollmentId}`;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    setOpen(true);
    // 가벼운 컨페티
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.4 },
        colors: ["#C8B88A", "#8a7a4d", "#fbf7eb", "#e8dcb6"],
      });
    } catch {
      /* noop */
    }
  }, [shouldShow, enrollmentId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm rounded-3xl border-[#C8B88A]/40 p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-[#fbf7eb] via-white to-[#f5efdc] p-6 text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 16 }}
            className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#C8B88A] to-[#8a7a4d] flex items-center justify-center shadow-lg"
          >
            <Award className="w-8 h-8 text-white" />
          </motion.div>

          <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C8B88A]/15 border border-[#C8B88A]/30">
            <Sparkles className="w-3 h-3 text-[#8a7a4d]" />
            <span className="text-[10px] font-bold tracking-[0.18em] text-[#8a7a4d] uppercase">
              First Badge Unlocked
            </span>
          </div>

          <h2 className="mt-3 text-xl font-bold text-slate-900 break-keep leading-snug">
            워크북 ‘출발선’ 배지 획득
          </h2>
          <p className="mt-2 text-[13px] text-slate-600 break-keep leading-relaxed">
            Day 1·2 검사·영상·회고를 모두 끝냈어요.
            <br />
            이제 30일 변화 곡선의 <span className="font-bold text-[#8a7a4d]">기준점</span>이
            워크북 1장에 새겨졌습니다.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { k: "검사", v: "2/2" },
              { k: "영상", v: "2/2" },
              { k: "회고", v: "2/2" },
            ].map((s) => (
              <div
                key={s.k}
                className="rounded-xl border border-[#C8B88A]/30 bg-white py-2"
              >
                <div className="text-[10px] text-slate-500 font-bold">{s.k}</div>
                <div className="text-[13px] font-bold text-[#8a7a4d]">{s.v}</div>
              </div>
            ))}
          </div>

          <Button
            onClick={() => {
              setOpen(false);
              onContinue();
            }}
            className="mt-5 w-full h-11 rounded-xl bg-gradient-to-r from-[#8a7a4d] to-[#C8B88A] text-white font-bold hover:opacity-95"
          >
            다음 체크인으로 이어가기
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
          <button
            onClick={() => setOpen(false)}
            className="mt-2 text-[11px] text-slate-400 hover:text-slate-600"
          >
            나중에 보기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
