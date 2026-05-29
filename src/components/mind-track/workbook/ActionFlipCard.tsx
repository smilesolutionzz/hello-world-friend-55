import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Check, Hand } from "lucide-react";
import type { ActionItem } from "@/lib/mindTrackActionPrescription";

interface Props {
  index: number;
  action: ActionItem;
  framework?: string | null;
  done: boolean;
  onToggleDone: () => void;
}

const TIER_BY_INDEX = [
  { label: "CORE", grad: "from-[#1a1a2e] via-[#2a2347] to-[#4a3a78]", glow: "shadow-[0_20px_60px_-15px_rgba(124,92,209,0.55)]" },
  { label: "FOCUS", grad: "from-[#0f2027] via-[#203a43] to-[#2c5364]", glow: "shadow-[0_20px_60px_-15px_rgba(44,83,100,0.55)]" },
  { label: "BONUS", grad: "from-[#3a2618] via-[#6b4423] to-[#a77b3a]", glow: "shadow-[0_20px_60px_-15px_rgba(167,123,58,0.55)]" },
];

const ActionFlipCard: React.FC<Props> = ({ index, action, framework, done, onToggleDone }) => {
  const [flipped, setFlipped] = useState(false);
  const tier = TIER_BY_INDEX[index % 3];
  const number = String(index + 1).padStart(2, "0");

  return (
    <div className="relative" style={{ perspective: 1400 }}>
      <motion.div
        className="relative w-full aspect-[3/4] cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => setFlipped((v) => !v)}
      >
        {/* FRONT */}
        <div
          className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${tier.grad} ${tier.glow} overflow-hidden`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* shine */}
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.45),transparent_55%)]" />
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
          {/* foil sheen */}
          <motion.div
            className="absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.18)_50%,transparent_70%)]"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear", delay: index * 0.4 }}
          />

          <div className="relative h-full p-5 flex flex-col text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] tracking-[0.25em] text-white/60 font-semibold">
                  {tier.label}
                </div>
                <div className="font-display text-4xl font-black text-[#F4E7B8] mt-1 leading-none">
                  {number}
                </div>
              </div>
              {framework && (
                <span className="text-[9px] tracking-wider px-2 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur">
                  {framework}
                </span>
              )}
            </div>

            <div className="flex-1 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-[#F4E7B8] drop-shadow-lg" strokeWidth={1.2} />
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold leading-snug break-keep">
                {action.title}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] tracking-wider text-white/70 animate-pulse">
                <Hand className="w-3 h-3" /> 카드를 눌러 처방 보기
              </div>
            </div>

            {done && (
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
            )}
          </div>
        </div>

        {/* BACK */}
        <div
          className={`absolute inset-0 rounded-3xl bg-white border border-slate-200 overflow-hidden ${done ? "ring-2 ring-emerald-300" : ""}`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="h-full p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#C8B88A] font-bold text-xs">{number}</span>
              <h4 className="font-semibold text-slate-900 text-sm break-keep flex-1">
                {action.title}
              </h4>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed break-keep flex-1 overflow-auto">
              <div>
                <span className="font-semibold text-[#8a7a4d]">언제 · </span>
                {action.when}
              </div>
              <div>
                <span className="font-semibold text-[#8a7a4d]">어떻게 · </span>
                {action.how}
              </div>
              <div className="text-slate-500 pt-2 border-t border-slate-100">
                <span className="font-semibold">왜 · </span>
                {action.why}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleDone();
              }}
              className={`mt-3 w-full h-9 rounded-xl text-xs font-semibold transition ${
                done
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {done ? "완료됨" : "오늘 실행 완료"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ActionFlipCard;
