import { useEffect, useState } from "react";
import { Heart, Clock, TrendingUp, ShieldCheck, Sparkles } from "lucide-react";

const STORAGE_KEY = "aihpro:diorama-intro-shown";
const DURATION_MS = 4200;

interface Props {
  /** force show ignoring session flag (for /?intro=1) */
  force?: boolean;
}

const DioramaIntro = ({ force = false }: Props) => {
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem(STORAGE_KEY);
    if (seen && !force) return;
    // 모바일 데이터 절약 모드 / 모션 줄이기 존중
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches && !force) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      return;
    }
    setShow(true);
    const t = setTimeout(() => handleClose(), DURATION_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [force]);

  const handleClose = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
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
        @keyframes diorama-fadeout {
          to { opacity: 0; visibility: hidden; }
        }

        .diorama-root {
          animation: diorama-world 4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .diorama-closing {
          animation: diorama-fadeout 0.6s ease-out forwards !important;
        }
        .diorama-scene {
          transform-style: preserve-3d;
          animation: diorama-zoom 4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .diorama-pop {
          opacity: 0;
          animation: diorama-pop 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: bottom center;
        }
        .diorama-float {
          animation: diorama-float 3s ease-in-out infinite alternate;
        }
        .diorama-text {
          opacity: 0;
          animation: diorama-text-in 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
        }
      `}</style>

      {/* Skip */}
      <button
        onClick={handleClose}
        className="absolute top-5 right-5 md:top-8 md:right-8 z-50 px-4 py-1.5 md:px-5 md:py-2 border border-slate-300/70 text-slate-500 bg-white/60 backdrop-blur-sm rounded-full text-xs md:text-sm font-medium hover:bg-white transition-colors"
      >
        SKIP
      </button>

      <div className="diorama-scene relative w-[min(560px,92vw)] h-[min(560px,80vh)] flex items-center justify-center">
        {/* glow */}
        <div className="absolute w-[78%] h-[78%] bg-blue-200/70 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[22%] w-[68%] h-[14%] bg-slate-300/50 rounded-[100%] blur-2xl opacity-50" />

        {/* center main card */}
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

        {/* Floating icons */}
        <div className="diorama-pop absolute left-[6%] md:-left-6 top-[24%] z-30" style={{ animationDelay: "0.45s" }}>
          <div
            className="diorama-float w-14 h-14 md:w-20 md:h-20 bg-amber-100 rounded-2xl shadow-xl flex items-center justify-center"
            style={{ transform: "rotate(-10deg)" }}
          >
            <Clock className="w-7 h-7 md:w-10 md:h-10 text-amber-500" strokeWidth={2.2} />
          </div>
        </div>

        <div className="diorama-pop absolute right-[4%] md:-right-4 bottom-[30%] z-30" style={{ animationDelay: "0.75s" }}>
          <div
            className="diorama-float w-16 h-16 md:w-24 md:h-24 bg-emerald-100 rounded-3xl shadow-xl flex items-center justify-center"
            style={{ transform: "rotate(10deg)", animationDelay: "-1s" }}
          >
            <TrendingUp className="w-9 h-9 md:w-12 md:h-12 text-emerald-500" strokeWidth={2.4} />
          </div>
        </div>

        <div className="diorama-pop absolute left-[28%] top-[2%] z-10" style={{ animationDelay: "1.05s" }}>
          <div
            className="diorama-float w-11 h-11 md:w-16 md:h-16 bg-blue-50 rounded-full shadow-lg flex items-center justify-center"
            style={{ animationDelay: "-2s" }}
          >
            <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-blue-500" strokeWidth={2.2} />
          </div>
        </div>

        <div className="diorama-pop absolute right-[26%] top-[6%] z-10" style={{ animationDelay: "1.25s" }}>
          <div
            className="diorama-float w-10 h-10 md:w-14 md:h-14 bg-violet-100 rounded-2xl shadow-md flex items-center justify-center"
            style={{ animationDelay: "-1.5s", transform: "rotate(6deg)" }}
          >
            <Sparkles className="w-5 h-5 md:w-7 md:h-7 text-violet-500" strokeWidth={2.2} />
          </div>
        </div>

        {/* sparkle dots */}
        <div className="diorama-pop absolute right-[16%] top-[14%]" style={{ animationDelay: "1.4s" }}>
          <div className="w-2 h-2 md:w-3 md:h-3 bg-yellow-400 rounded-full blur-[1px]" />
        </div>
        <div className="diorama-pop absolute left-[10%] bottom-[28%]" style={{ animationDelay: "1.55s" }}>
          <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-300 rounded-full blur-[2px]" />
        </div>
      </div>

      {/* Logo bottom */}
      <div className="absolute bottom-8 md:bottom-12 left-0 right-0 flex justify-center diorama-text" style={{ animationDelay: "0.9s" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-[10px] md:text-xs">
            AH
          </div>
          <span className="font-bold tracking-tighter text-slate-500 text-base md:text-lg">AIHPRO</span>
        </div>
      </div>
    </div>
  );
};

export default DioramaIntro;
