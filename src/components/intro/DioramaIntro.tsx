import { useEffect, useMemo, useState } from "react";
import { Heart, Clock, TrendingUp, ShieldCheck, Sparkles } from "lucide-react";
import {
  INTRO_KEYS,
  getIntroVariant,
  isIntroDisabled,
  trackIntroEvent,
  type IntroVariant,
} from "@/lib/introPreferences";

const DURATION_MS = 4200;

interface Props {
  /** force show ignoring session flag & disabled flag (for /?intro=1 or settings preview) */
  force?: boolean;
  /** override A/B assignment (settings preview) */
  variantOverride?: IntroVariant;
}

const DioramaIntro = ({ force = false, variantOverride }: Props) => {
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);
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
    const t = setTimeout(() => handleClose("complete"), DURATION_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [force, variant]);

  const handleClose = (reason: "skip" | "complete" = "skip") => {
    sessionStorage.setItem(INTRO_KEYS.shown, "1");
    trackIntroEvent(reason, variant);
    setClosing(true);
    setTimeout(() => setShow(false), 600);
  };

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center overflow-hidden diorama-root ${
        closing ? "diorama-closing" : ""
      }`}
      style={{ perspective: "1200px" }}
      aria-hidden="true"
      data-intro-variant={variant}
    >
      <style>{`
        @keyframes diorama-world {
          0% { background: radial-gradient(circle at 50% 50%, #f8fafc 0%, #eef2ff 60%, #e0e7ff 100%); }
          80% { background: radial-gradient(circle at 50% 50%, #f8fafc 0%, #eef2ff 60%, #e0e7ff 100%); }
          100% { background: radial-gradient(circle at 50% 50%, #0f172a 0%, #0a0f1d 100%); }
        }
        @keyframes diorama-zoom {
          0% { transform: scale(0.78) translateY(24px); opacity: 0; }
          12% { opacity: 1; }
          100% { transform: scale(1.08) translateY(0); }
        }
        @keyframes diorama-pop {
          0% { transform: scale(0) translateZ(-100px) rotateX(45deg); opacity: 0; }
          70% { transform: scale(1.12) translateZ(20px) rotateX(-8deg); opacity: 1; }
          100% { transform: scale(1) translateZ(0) rotateX(0); opacity: 1; }
        }
        @keyframes diorama-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes diorama-text-in {
          0% { opacity: 0; transform: translateY(14px); filter: blur(6px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes diorama-fadeout { to { opacity: 0; visibility: hidden; } }

        .diorama-root { animation: diorama-world 4s cubic-bezier(0.4,0,0.2,1) forwards; }
        .diorama-closing { animation: diorama-fadeout 0.6s ease-out forwards !important; }
        .diorama-scene {
          transform-style: preserve-3d;
          animation: diorama-zoom 4s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .diorama-pop {
          opacity: 0;
          animation: diorama-pop 0.85s cubic-bezier(0.34,1.56,0.64,1) forwards;
          transform-origin: bottom center;
        }
        .diorama-float { animation: diorama-float 3s ease-in-out infinite alternate; }
        .diorama-text {
          opacity: 0;
          animation: diorama-text-in 0.9s cubic-bezier(0.16,1,0.3,1) 0.6s forwards;
        }
      `}</style>

      <button
        onClick={() => handleClose("skip")}
        className="absolute top-5 right-5 md:top-8 md:right-8 z-50 px-4 py-1.5 md:px-5 md:py-2 border border-slate-300/70 text-slate-500 bg-white/60 backdrop-blur-sm rounded-full text-xs md:text-sm font-medium hover:bg-white transition-colors"
      >
        SKIP
      </button>

      {variant === "A" ? <VariantA /> : <VariantB />}

      <div
        className="absolute bottom-8 md:bottom-12 left-0 right-0 flex justify-center diorama-text"
        style={{ animationDelay: "0.9s" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-[10px] md:text-xs">
            AH
          </div>
          <span className="font-bold tracking-tighter text-slate-500 text-base md:text-lg">
            AIHPRO · {variant}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ───────── Variant A : 디오라마 팝업 (중앙 카드 + 사방 아이콘) ───────── */
const VariantA = () => (
  <div className="diorama-scene relative w-[min(560px,92vw)] h-[min(560px,80vh)] flex items-center justify-center">
    <div className="absolute w-[78%] h-[78%] bg-blue-200/70 rounded-full blur-3xl opacity-60" />
    <div className="absolute bottom-[22%] w-[68%] h-[14%] bg-slate-300/50 rounded-[100%] blur-2xl opacity-50" />

    <div className="diorama-pop relative z-20 flex flex-col items-center" style={{ animationDelay: "0.15s" }}>
      <div
        className="w-32 h-32 md:w-44 md:h-44 bg-white rounded-[28px] md:rounded-[32px] shadow-2xl flex items-center justify-center ring-8 ring-blue-50"
        style={{ transform: "rotateY(8deg) rotateX(4deg)" }}
      >
        <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-tr from-blue-500 to-emerald-400 rounded-2xl flex items-center justify-center shadow-inner">
          <Heart className="w-8 h-8 md:w-12 md:h-12 text-white" strokeWidth={2.4} />
        </div>
      </div>

      <div className="mt-6 md:mt-10 text-center diorama-text">
        <p className="text-[10px] md:text-xs tracking-[0.3em] text-slate-500 font-semibold mb-2">
          AIHPRO · MIND TRACK
        </p>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight break-keep leading-tight">
          발견하고, 읽고, <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
            바꿔드립니다
          </span>
        </h1>
        <p className="mt-2 md:mt-3 text-xs md:text-sm text-slate-500 break-keep">
          우리 가족의 마음을 7일 만에 숫자로
        </p>
      </div>
    </div>

    <div className="diorama-pop absolute left-[6%] md:-left-6 top-[24%] z-30" style={{ animationDelay: "0.45s" }}>
      <div className="diorama-float w-14 h-14 md:w-20 md:h-20 bg-amber-100 rounded-2xl shadow-xl flex items-center justify-center" style={{ transform: "rotate(-10deg)" }}>
        <Clock className="w-7 h-7 md:w-10 md:h-10 text-amber-500" strokeWidth={2.2} />
      </div>
    </div>
    <div className="diorama-pop absolute right-[4%] md:-right-4 bottom-[30%] z-30" style={{ animationDelay: "0.75s" }}>
      <div className="diorama-float w-16 h-16 md:w-24 md:h-24 bg-emerald-100 rounded-3xl shadow-xl flex items-center justify-center" style={{ transform: "rotate(10deg)", animationDelay: "-1s" }}>
        <TrendingUp className="w-9 h-9 md:w-12 md:h-12 text-emerald-500" strokeWidth={2.4} />
      </div>
    </div>
    <div className="diorama-pop absolute left-[28%] top-[2%] z-10" style={{ animationDelay: "1.05s" }}>
      <div className="diorama-float w-11 h-11 md:w-16 md:h-16 bg-blue-50 rounded-full shadow-lg flex items-center justify-center" style={{ animationDelay: "-2s" }}>
        <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-blue-500" strokeWidth={2.2} />
      </div>
    </div>
    <div className="diorama-pop absolute right-[26%] top-[6%] z-10" style={{ animationDelay: "1.25s" }}>
      <div className="diorama-float w-10 h-10 md:w-14 md:h-14 bg-violet-100 rounded-2xl shadow-md flex items-center justify-center" style={{ animationDelay: "-1.5s", transform: "rotate(6deg)" }}>
        <Sparkles className="w-5 h-5 md:w-7 md:h-7 text-violet-500" strokeWidth={2.2} />
      </div>
    </div>
  </div>
);

/* ───────── Variant B : 헤드라인 우선 + 아크형 아이콘 라인업 ───────── */
const VariantB = () => {
  const icons = [
    { Icon: ShieldCheck, bg: "bg-blue-50", color: "text-blue-500", label: "임상 검증" },
    { Icon: Clock, bg: "bg-amber-100", color: "text-amber-500", label: "7일 트랙" },
    { Icon: Heart, bg: "bg-rose-100", color: "text-rose-500", label: "가족 코칭" },
    { Icon: TrendingUp, bg: "bg-emerald-100", color: "text-emerald-500", label: "변화 측정" },
    { Icon: Sparkles, bg: "bg-violet-100", color: "text-violet-500", label: "박사급 리포트" },
  ];
  return (
    <div className="diorama-scene relative w-[min(640px,94vw)] flex flex-col items-center justify-center">
      <div className="absolute -z-10 top-1/4 w-[80%] h-[60%] bg-blue-200/60 rounded-full blur-3xl opacity-60" />

      {/* 헤드라인 — 더 크게, 먼저 */}
      <div className="text-center diorama-pop" style={{ animationDelay: "0.1s" }}>
        <p className="text-[10px] md:text-xs tracking-[0.32em] text-slate-500 font-semibold mb-3">
          AIHPRO · MIND TRACK
        </p>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight break-keep leading-[1.15]">
          7일 뒤, <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
            우리 가족의 마음
          </span>
          <br />이 달라집니다
        </h1>
        <p className="mt-3 md:mt-4 text-sm md:text-base text-slate-500 break-keep">
          매일 1분 체크인 + 임상 검증 검사
        </p>
      </div>

      {/* 아크형 아이콘 라인업 */}
      <div className="relative mt-10 md:mt-14 w-full flex justify-center items-end gap-3 md:gap-5">
        {icons.map(({ Icon, bg, color, label }, i) => {
          const arc = [12, 4, 0, 4, 12][i]; // 아크 곡선
          return (
            <div
              key={label}
              className="diorama-pop flex flex-col items-center"
              style={{
                animationDelay: `${0.4 + i * 0.12}s`,
                transform: `translateY(${arc}px)`,
              }}
            >
              <div
                className={`diorama-float w-12 h-12 md:w-16 md:h-16 ${bg} rounded-2xl shadow-xl flex items-center justify-center`}
                style={{ animationDelay: `${-i * 0.4}s` }}
              >
                <Icon className={`w-6 h-6 md:w-8 md:h-8 ${color}`} strokeWidth={2.2} />
              </div>
              <span className="mt-2 text-[10px] md:text-xs font-semibold text-slate-600 break-keep">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DioramaIntro;
