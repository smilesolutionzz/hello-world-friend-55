import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Heart, Clock, TrendingUp, ShieldCheck, Sparkles } from "lucide-react";
import {
  INTRO_KEYS,
  getIntroVariant,
  isIntroDisabled,
  trackIntroEvent,
  type IntroVariant,
} from "@/lib/introPreferences";

// 인스타 릴스에서 유행하는 손글씨 스케치 인트로
// - 펜이 'AIHPRO' 를 한 획씩 그리고, 밑줄·아이콘이 따라 그려짐
// - SKIP / 다시 그리기(리셋) 버튼 제공
const DURATION_MS = 4600;

interface Props {
  force?: boolean;
  variantOverride?: IntroVariant;
}

const DioramaIntro = ({ force = false, variantOverride }: Props) => {
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);
  const [runKey, setRunKey] = useState(0); // 리셋시 증가 → 애니메이션 재시작
  const variant = useMemo<IntroVariant>(
    () => variantOverride ?? getIntroVariant(),
    [variantOverride],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!force) {
      if (isIntroDisabled()) return;
      const seen = sessionStorage.getItem(INTRO_KEYS.shown);
      if (seen) return;
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        sessionStorage.setItem(INTRO_KEYS.shown, "1");
        return;
      }
    }
    setShow(true);
    trackIntroEvent("view", variant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [force, variant]);

  // 매 재생마다 자동 종료 타이머
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => handleClose("complete"), DURATION_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, runKey]);

  // 키보드 단축키: R = 다시 그리기, Esc/S = SKIP
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      if (e.key === "Escape" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        handleClose("skip");
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleReset();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const handleClose = (reason: "skip" | "complete" = "skip") => {
    sessionStorage.setItem(INTRO_KEYS.shown, "1");
    trackIntroEvent(reason, variant);
    setClosing(true);
    setTimeout(() => setShow(false), 500);
  };

  const handleReset = () => {
    setClosing(false);
    setRunKey((k) => k + 1);
    trackIntroEvent("reset", variant);
  };

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#fafaf7] ${
        closing ? "sketch-fadeout" : ""
      }`}
      aria-hidden="true"
      data-intro-variant={variant}
    >
      <style>{`
        @keyframes sketch-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sketch-fadeout-kf { to { opacity: 0; visibility: hidden; } }
        .sketch-fadeout { animation: sketch-fadeout-kf .5s ease-out forwards !important; }

        @keyframes sketch-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes sketch-pop {
          0% { opacity: 0; transform: translateY(8px) scale(.92); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pen-move {
          0% { opacity: 0; transform: translate(-4%, -10%) rotate(-18deg); }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { opacity: 0; transform: translate(78%, -22%) rotate(-12deg); }
        }
        @keyframes paper-grid-in { from { opacity: 0; } to { opacity: .35; } }

        .sketch-paper { animation: paper-grid-in 1.2s ease-out forwards; }
        .sketch-path {
          fill: none;
          stroke: #111827;
          stroke-width: 6;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: var(--len, 1200);
          stroke-dashoffset: var(--len, 1200);
          animation: sketch-draw var(--dur, 1.4s) cubic-bezier(.65,.05,.36,1) forwards;
          animation-delay: var(--delay, 0s);
        }
        .sketch-accent { stroke: #2563eb; }
        .sketch-pop {
          opacity: 0;
          animation: sketch-pop .55s cubic-bezier(.34,1.56,.64,1) forwards;
          animation-delay: var(--delay, 0s);
        }
        .sketch-pen {
          opacity: 0;
          animation: pen-move 2.6s cubic-bezier(.65,.05,.36,1) forwards;
          animation-delay: .15s;
        }
      `}</style>

      {/* 상단 컨트롤 */}
      <div className="absolute top-5 right-5 md:top-8 md:right-8 z-50 flex items-center gap-2">
        <button
          onClick={handleReset}
          className="px-3 py-1.5 md:px-4 md:py-2 border border-slate-300 text-slate-600 bg-white rounded-full text-xs md:text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          aria-label="인트로 다시 그리기 (단축키 R)"
          title="R"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          다시 그리기 <kbd className="ml-1 hidden md:inline px-1.5 py-0.5 text-[10px] bg-slate-100 border border-slate-200 rounded">R</kbd>
        </button>
        <button
          onClick={() => handleClose("skip")}
          className="px-4 py-1.5 md:px-5 md:py-2 border border-slate-300 text-slate-500 bg-white rounded-full text-xs md:text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          aria-label="인트로 건너뛰기 (단축키 Esc)"
          title="Esc"
        >
          SKIP <kbd className="hidden md:inline px-1.5 py-0.5 text-[10px] bg-slate-100 border border-slate-200 rounded">Esc</kbd>
        </button>
      </div>

      {/* 종이 배경 (모눈) */}
      <div
        className="sketch-paper absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <SketchScene key={runKey} />
    </div>
  );
};

/* ───────── 손글씨 스케치 씬 ───────── */
const SketchScene = () => {
  return (
    <div className="relative w-[min(720px,94vw)] flex flex-col items-center">
      {/* 메인 로고 손글씨 */}
      <svg viewBox="0 0 720 240" className="w-full h-auto">
        {/* A */}
        <path className="sketch-path" style={{ ["--len" as any]: 260, ["--dur" as any]: ".7s", ["--delay" as any]: "0s" } as any}
          d="M40 200 L100 60 L160 200 M65 150 L135 150" />
        {/* I */}
        <path className="sketch-path" style={{ ["--len" as any]: 160, ["--dur" as any]: ".4s", ["--delay" as any]: ".55s" } as any}
          d="M195 70 L255 70 M225 70 L225 200 M195 200 L255 200" />
        {/* H */}
        <path className="sketch-path" style={{ ["--len" as any]: 320, ["--dur" as any]: ".7s", ["--delay" as any]: ".85s" } as any}
          d="M285 60 L285 200 M345 60 L345 200 M285 130 L345 130" />
        {/* P */}
        <path className="sketch-path" style={{ ["--len" as any]: 280, ["--dur" as any]: ".7s", ["--delay" as any]: "1.4s" } as any}
          d="M385 200 L385 60 Q455 60 455 100 Q455 140 385 140" />
        {/* R */}
        <path className="sketch-path" style={{ ["--len" as any]: 320, ["--dur" as any]: ".7s", ["--delay" as any]: "1.9s" } as any}
          d="M495 200 L495 60 Q565 60 565 100 Q565 140 495 140 L565 200" />
        {/* O */}
        <path className="sketch-path" style={{ ["--len" as any]: 380, ["--dur" as any]: ".8s", ["--delay" as any]: "2.4s" } as any}
          d="M650 130 Q650 60 605 60 Q560 60 560 130 Q560 200 605 200 Q650 200 650 130 Z" />

        {/* 강조 밑줄 (파란펜) */}
        <path
          className="sketch-path sketch-accent"
          style={{ ["--len" as any]: 700, ["--dur" as any]: ".9s", ["--delay" as any]: "3.1s", strokeWidth: 5 } as any}
          d="M30 225 Q360 245 690 222"
        />

        {/* 펜 (이모지로 가볍게) */}
        <text
          className="sketch-pen"
          x="0"
          y="50"
          fontSize="42"
          style={{ transformOrigin: "0 0" }}
        >
          ✏️
        </text>
      </svg>

      {/* 부제 — 한 줄씩 페이드인 */}
      <div className="mt-6 md:mt-8 text-center">
        <p
          className="sketch-pop text-[11px] md:text-xs tracking-[0.32em] text-slate-500 font-semibold"
          style={{ ["--delay" as any]: "3.4s" } as any}
        >
          AI × 전문가 · 마음 트랙
        </p>
        <h2
          className="sketch-pop mt-2 text-xl md:text-3xl font-black text-slate-900 break-keep leading-tight"
          style={{ ["--delay" as any]: "3.7s" } as any}
        >
          한 번의 스케치로,
          <br className="md:hidden" />{" "}
          <span className="text-blue-600">7일 마음 리포트</span>까지
        </h2>
      </div>

      {/* 손그림 아이콘 4개 */}
      <div className="mt-6 md:mt-8 flex items-center justify-center gap-4 md:gap-6">
        {[
          { Icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50", delay: 4.0 },
          { Icon: Clock, color: "text-amber-600", bg: "bg-amber-50", delay: 4.15 },
          { Icon: Heart, color: "text-rose-500", bg: "bg-rose-50", delay: 4.3 },
          { Icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", delay: 4.45 },
        ].map(({ Icon, color, bg, delay }, i) => (
          <div
            key={i}
            className={`sketch-pop w-12 h-12 md:w-14 md:h-14 ${bg} rounded-2xl border-2 border-slate-900/90 flex items-center justify-center shadow-[3px_3px_0_0_rgba(15,23,42,0.9)]`}
            style={{ ["--delay" as any]: `${delay}s` } as any}
          >
            <Icon className={`w-6 h-6 md:w-7 md:h-7 ${color}`} strokeWidth={2.4} />
          </div>
        ))}
      </div>

      {/* 워터마크 */}
      <div
        className="sketch-pop mt-8 flex items-center gap-2"
        style={{ ["--delay" as any]: "4.7s" } as any}
      >
        <Sparkles className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs text-slate-400 tracking-wider">aihpro.app</span>
      </div>
    </div>
  );
};

export default DioramaIntro;
