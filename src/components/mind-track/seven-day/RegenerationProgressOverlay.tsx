/**
 * Day 1~7 맞춤 미션 재생성 — 인포그래픽/애니메이션 진행 오버레이
 *
 * sessionId 가 전달되면 mind_track_regen_progress 테이블을 폴링해
 * 백엔드 단계(parse → map → design → personalize → verify → done)와
 * 실시간 동기화됩니다. 각 단계에는 발달·심리 이론 근거가 표기됩니다.
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  HeartHandshake,
  Sparkles,
  Layers3,
  Target,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StepDef {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  theory: string;
  detail: string;
}

const STEPS: StepDef[] = [
  {
    key: "parse",
    icon: Brain,
    title: "당신의 고민을 의미 단위로 분해",
    theory: "Affect Labeling (Lieberman, 2007)",
    detail: "감정·상황·관계·트리거를 분리해 핵심 주제어를 추출합니다.",
  },
  {
    key: "map",
    icon: Layers3,
    title: "발달·심리 이론과 매핑",
    theory: "Self-Determination Theory · CBT 행동 활성화",
    detail: "자율성·유능감·관계성의 결핍 지점을 찾아 개입 포인트를 정렬합니다.",
  },
  {
    key: "design",
    icon: Target,
    title: "Day 1~7 흐름 설계",
    theory: "Behavioral Activation · Tiny Habits (Fogg)",
    detail: "무거운 Day(1·4·7) / 가벼운 Day(2·3·5·6) 리듬으로 재구성합니다.",
  },
  {
    key: "personalize",
    icon: HeartHandshake,
    title: "당신의 단어로 미션 개인화",
    theory: "Implementation Intentions (Gollwitzer)",
    detail: "‘언제·어디서·누구와’ 조건을 미션에 직접 새깁니다.",
  },
  {
    key: "verify",
    icon: Sparkles,
    title: "안전성·실행 가능성 검증",
    theory: "Stage of Change · 안전 가이드",
    detail: "위기 신호·과부담 미션을 걸러내고 5~15분 단위로 압축합니다.",
  },
];

const STAGE_ORDER = ["parse", "map", "design", "personalize", "verify", "done"];

interface ProgressRow {
  stage: string;
  percent: number;
  message: string | null;
  theory: string | null;
}

export default function RegenerationProgressOverlay({
  open,
  sessionId,
}: {
  open: boolean;
  sessionId?: string;
}) {
  const [progress, setProgress] = useState<ProgressRow | null>(null);
  const [fallbackIdx, setFallbackIdx] = useState(0);
  const pollRef = useRef<number | null>(null);

  // Real polling against mind_track_regen_progress
  useEffect(() => {
    if (!open || !sessionId) return;
    let cancelled = false;

    const tick = async () => {
      const { data } = await supabase
        .from("mind_track_regen_progress")
        .select("stage, percent, message, theory")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(1);
      if (cancelled) return;
      if (data && data.length > 0) {
        setProgress(data[0] as ProgressRow);
      }
    };

    tick();
    pollRef.current = window.setInterval(tick, 900) as unknown as number;
    return () => {
      cancelled = true;
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [open, sessionId]);

  // Fallback animation when sessionId not provided OR before first row arrives
  useEffect(() => {
    if (!open) {
      setFallbackIdx(0);
      setProgress(null);
      return;
    }
    if (progress) return;
    const id = window.setInterval(() => {
      setFallbackIdx((i) => (i + 1) % STEPS.length);
    }, 1800);
    return () => window.clearInterval(id);
  }, [open, progress]);

  if (!open) return null;

  // Determine active step index from real progress (or fallback)
  let activeIdx = fallbackIdx;
  let percent = Math.min(95, ((fallbackIdx + 1) / (STEPS.length + 1)) * 100);
  let liveMessage: string | null = null;
  let liveTheory: string | null = null;
  let isDone = false;
  let isError = false;

  if (progress) {
    if (progress.stage === "done") {
      activeIdx = STEPS.length - 1;
      percent = 100;
      isDone = true;
    } else if (progress.stage === "error") {
      isError = true;
      percent = progress.percent ?? 100;
    } else {
      const idx = STAGE_ORDER.indexOf(progress.stage);
      activeIdx = idx >= 0 && idx < STEPS.length ? idx : fallbackIdx;
      percent = Math.max(5, Math.min(99, progress.percent ?? percent));
    }
    liveMessage = progress.message;
    liveTheory = progress.theory;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#C8B88A]/40 overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] text-white p-5 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <motion.div
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#C8B88A] blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-indigo-400 blur-3xl"
              animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 text-[11px] tracking-[0.2em] text-[#C8B88A] mb-1">
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              MIND TRACK · PERSONALIZATION ENGINE
            </div>
            <h3 className="text-lg font-bold leading-tight break-keep">
              {isDone
                ? "Day 1~7 맞춤 미션 생성 완료"
                : isError
                ? "잠시 문제가 발생했어요"
                : "당신의 고민을 근거로\nDay 1~7 미션을 설계하고 있어요"}
            </h3>
            <p className="text-xs text-white/60 mt-2">
              발달·심리 이론 기반 5단계 · 실시간 진행률 {Math.round(percent)}%
            </p>
          </div>
        </div>

        {/* Live message */}
        {(liveMessage || liveTheory) && (
          <div className="px-5 pt-4">
            <div
              className={`rounded-2xl border p-3 text-xs leading-relaxed break-keep ${
                isError
                  ? "border-rose-200 bg-rose-50 text-rose-800"
                  : "border-[#C8B88A]/40 bg-[#FAF7EE] text-slate-700"
              }`}
            >
              {liveMessage && <p className="font-medium">{liveMessage}</p>}
              {liveTheory && !isError && (
                <p className="text-[11px] text-[#8a7a4d] mt-1">근거 · {liveTheory}</p>
              )}
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="p-5 space-y-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const state =
              i < activeIdx || isDone
                ? "done"
                : i === activeIdx
                ? "active"
                : "pending";
            return (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-start gap-3 rounded-2xl p-3 border transition-colors ${
                  state === "active"
                    ? "bg-[#FAF7EE] border-[#C8B88A]/60"
                    : state === "done"
                    ? "bg-emerald-50/60 border-emerald-100"
                    : "bg-slate-50 border-slate-100"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    state === "active"
                      ? "bg-[#C8B88A] text-white"
                      : state === "done"
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {state === "done" ? (
                      <motion.div
                        key="done"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </motion.div>
                    ) : state === "active" ? (
                      <motion.div
                        key="active"
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.div key="pending">
                        <Icon className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-mono tracking-widest ${
                        state === "pending" ? "text-slate-300" : "text-[#8a7a4d]"
                      }`}
                    >
                      0{i + 1}
                    </span>
                    <p
                      className={`text-sm font-semibold break-keep ${
                        state === "pending" ? "text-slate-400" : "text-slate-900"
                      }`}
                    >
                      {s.title}
                    </p>
                  </div>
                  <p
                    className={`text-[11px] mt-0.5 ${
                      state === "pending" ? "text-slate-300" : "text-[#8a7a4d]"
                    }`}
                  >
                    근거 · {s.theory}
                  </p>
                  {state === "active" && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-xs text-slate-600 mt-1.5 leading-relaxed break-keep"
                    >
                      {s.detail}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Real progress bar */}
        <div className="px-5 pb-5">
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              className={`h-full ${
                isError
                  ? "bg-rose-400"
                  : "bg-gradient-to-r from-[#C8B88A] via-amber-400 to-[#C8B88A]"
              }`}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-2 break-keep">
            {isDone
              ? "Day 1부터 새 미션이 자동으로 반영됐어요"
              : isError
              ? "잠시 후 다시 시도해주세요"
              : "완료되면 Day 1부터 새 미션이 자동으로 반영돼요"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
