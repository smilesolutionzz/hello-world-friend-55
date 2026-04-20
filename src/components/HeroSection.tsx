import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { ArrowRight, TrendingDown, TrendingUp, ShieldCheck, Sparkles, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n";
import { trackEvent } from "@/components/common/Analytics";

/**
 * 결과 중심 히어로: Before/After 변화를 데이터로 증명
 * - 좌: 강력한 카피 + CTA
 * - 우: 실제 변화 지표 시각화 (애니메이션 카운터 + 비교 막대)
 */
const HeroSection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const phrases = (t.hero as any).parentHookPhrases || [];

  useEffect(() => {
    if (phrases.length <= 1) return;
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [phrases.length]);

  const handlePrimaryCTA = () => {
    trackEvent('hero_cta_mind_track');
    navigate('/mind-track');
  };

  const handleSecondaryCTA = () => {
    trackEvent('hero_cta_free_test');
    navigate('/assessment');
  };

  // 페르소나별 Before/After 데이터 슬라이드
  const personas = [
    {
      key: 'workingmom',
      name: '워킹맘',
      emoji: '👩‍💼',
      sub: '직장 + 육아 병행',
      metrics: [
        { label: '스트레스 지수', before: 82, after: 49, delta: '-40%', direction: 'down' as const, color: 'from-rose-400 to-orange-400' },
        { label: '수면 만족도', before: 38, after: 75, delta: '+97%', direction: 'up' as const, color: 'from-emerald-400 to-teal-400' },
        { label: '감정 안정성', before: 47, after: 81, delta: '+72%', direction: 'up' as const, color: 'from-sky-400 to-indigo-400' },
        { label: '육아 번아웃', before: 79, after: 44, delta: '-44%', direction: 'down' as const, color: 'from-fuchsia-400 to-pink-400' },
        { label: '아이와의 소통', before: 35, after: 78, delta: '+123%', direction: 'up' as const, color: 'from-amber-400 to-yellow-400' },
      ],
    },
    {
      key: 'stayhomemom',
      name: '전업맘',
      emoji: '👩‍🍼',
      sub: '하루종일 육아',
      metrics: [
        { label: '스트레스 지수', before: 74, after: 46, delta: '-38%', direction: 'down' as const, color: 'from-rose-400 to-orange-400' },
        { label: '수면 만족도', before: 45, after: 82, delta: '+82%', direction: 'up' as const, color: 'from-emerald-400 to-teal-400' },
        { label: '자기효능감', before: 42, after: 79, delta: '+88%', direction: 'up' as const, color: 'from-sky-400 to-indigo-400' },
        { label: '고립감', before: 81, after: 38, delta: '-53%', direction: 'down' as const, color: 'from-fuchsia-400 to-pink-400' },
        { label: '아이와의 소통', before: 51, after: 86, delta: '+69%', direction: 'up' as const, color: 'from-amber-400 to-yellow-400' },
      ],
    },
    {
      key: 'dad',
      name: '아빠',
      emoji: '👨‍👧',
      sub: '일과 가정의 균형',
      metrics: [
        { label: '스트레스 지수', before: 76, after: 52, delta: '-32%', direction: 'down' as const, color: 'from-rose-400 to-orange-400' },
        { label: '수면 만족도', before: 48, after: 77, delta: '+60%', direction: 'up' as const, color: 'from-emerald-400 to-teal-400' },
        { label: '감정 표현력', before: 39, after: 71, delta: '+82%', direction: 'up' as const, color: 'from-sky-400 to-indigo-400' },
        { label: '업무 번아웃', before: 71, after: 45, delta: '-37%', direction: 'down' as const, color: 'from-fuchsia-400 to-pink-400' },
        { label: '아이와의 친밀도', before: 44, after: 80, delta: '+82%', direction: 'up' as const, color: 'from-amber-400 to-yellow-400' },
      ],
    },
    {
      key: 'professional',
      name: '직장인',
      emoji: '💼',
      sub: '커리어 집중기',
      metrics: [
        { label: '스트레스 지수', before: 80, after: 47, delta: '-41%', direction: 'down' as const, color: 'from-rose-400 to-orange-400' },
        { label: '수면 만족도', before: 41, after: 78, delta: '+90%', direction: 'up' as const, color: 'from-emerald-400 to-teal-400' },
        { label: '감정 안정성', before: 49, after: 83, delta: '+69%', direction: 'up' as const, color: 'from-sky-400 to-indigo-400' },
        { label: '업무 번아웃', before: 78, after: 43, delta: '-45%', direction: 'down' as const, color: 'from-fuchsia-400 to-pink-400' },
        { label: '집중력', before: 46, after: 82, delta: '+78%', direction: 'up' as const, color: 'from-amber-400 to-yellow-400' },
      ],
    },
  ];

  const [personaIndex, setPersonaIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setPersonaIndex((prev) => (prev + 1) % personas.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, personas.length]);

  const currentPersona = personas[personaIndex];
  const goPrev = () => setPersonaIndex((p) => (p - 1 + personas.length) % personas.length);
  const goNext = () => setPersonaIndex((p) => (p + 1) % personas.length);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0a0e1a] via-[#0f1729] to-[#0a0e1a]"
    >
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Ambient glows */}
      <motion.div
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-0 -left-40 w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[140px]"
      />
      <motion.div
        animate={{ opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-0 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-500/20 blur-[160px]"
      />

      <div className="relative z-10 container mx-auto px-4 md:px-6 pt-20 md:pt-28 pb-12 md:pb-20 min-h-screen flex flex-col">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center flex-1">
          {/* LEFT: Copy + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 backdrop-blur border border-white/10 mb-5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] md:text-xs font-medium text-white/80 tracking-wide">
                {(t.hero as any).innovationBadge}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[28px] sm:text-4xl md:text-5xl lg:text-[56px] font-extrabold leading-[1.1] tracking-tight mb-5">
              <span className="block text-white/95">{(t.hero as any).headlineTop}</span>
              <span className="block bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-transparent">
                {(t.hero as any).headlineBottom}
              </span>
            </h1>

            {/* Sub hook */}
            <p className="text-white/75 text-base md:text-lg leading-relaxed mb-3 break-keep">
              {(t.hero as any).parentHook}
            </p>

            {/* Rotating proof phrases */}
            <div className="h-9 mb-6 flex items-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phraseIndex}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-400/20"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-200 text-sm md:text-base font-bold tabular-nums">
                    {phrases[phraseIndex]}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Trust bullets */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-7 text-white/70 text-sm">
              <span>{(t.hero as any).descriptionHighlight}</span>
              <span>{(t.hero as any).descriptionHighlight2}</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <Button
                onClick={handlePrimaryCTA}
                className="group h-14 px-7 text-base font-bold rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-900 hover:from-emerald-300 hover:to-teal-300 shadow-[0_8px_32px_-8px_rgba(52,211,153,0.6)] hover:shadow-[0_12px_40px_-8px_rgba(52,211,153,0.8)] transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {(t.hero as any).ctaPrimary}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={handleSecondaryCTA}
                variant="outline"
                className="h-14 px-6 text-base font-medium rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur border-white/15 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                {(t.hero as any).ctaExpertConsult}
              </Button>
            </div>

            {/* Trust line */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm text-white/60">
              <span>{(t.hero as any).trustNoSignup}</span>
              <span className="opacity-40">·</span>
              <span>{(t.hero as any).trustFree}</span>
              <span className="opacity-40">·</span>
              <span>{(t.hero as any).trust24h}</span>
            </div>

            <div className="mt-3 flex items-center gap-3 text-xs md:text-sm">
              <span className="text-amber-300 font-semibold">{(t.hero as any).ratingCount}</span>
              <span className="text-white/50">·</span>
              <motion.span
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-emerald-300 font-medium"
              >
                {(t.hero as any).liveUsers}
              </motion.span>
            </div>
          </motion.div>

          {/* RIGHT: Before/After data card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div
              className="relative rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 p-6 md:p-8 shadow-2xl"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Card header */}
              <div className="flex items-center justify-between mb-5">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold tracking-[0.15em] text-emerald-300/80 uppercase mb-1">
                    Before · After · 30 Days
                  </p>
                  <h3 className="text-white text-lg md:text-xl font-bold truncate">
                    {(t.hero as any).beforeAfterTitle}
                  </h3>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 shrink-0 ml-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-300 tracking-wider">LIVE</span>
                </div>
              </div>

              {/* Persona switcher */}
              <div className="flex items-center justify-between gap-2 mb-4 p-2 rounded-2xl bg-white/[0.04] border border-white/10">
                <button
                  onClick={goPrev}
                  aria-label="이전 페르소나"
                  className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPersona.key}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-2 min-w-0"
                  >
                    <span className="text-xl">{currentPersona.emoji}</span>
                    <div className="text-left min-w-0">
                      <div className="text-white text-sm font-bold leading-tight truncate">{currentPersona.name}</div>
                      <div className="text-white/50 text-[10px] leading-tight truncate">{currentPersona.sub}</div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="flex items-center gap-1 shrink-0">
                  {personas.map((p, i) => (
                    <button
                      key={p.key}
                      onClick={() => setPersonaIndex(i)}
                      aria-label={`${p.name} 슬라이드`}
                      className={`h-1.5 rounded-full transition-all ${
                        i === personaIndex ? 'w-5 bg-emerald-400' : 'w-1.5 bg-white/25 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={goNext}
                  aria-label="다음 페르소나"
                  className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition shrink-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Metrics (animated per persona) */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPersona.key}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-5"
                >
                  {currentPersona.metrics.map((m, i) => (
                    <MetricRow key={`${currentPersona.key}-${m.label}`} metric={m} delay={0.1 + i * 0.1} />
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Footer caption */}
              <div className="mt-6 pt-5 border-t border-white/10">
                <p className="text-[10px] md:text-[11px] text-white/45 leading-relaxed break-keep">
                  {(t.hero as any).proofCaption}
                </p>
              </div>

            </div>

            {/* Bottom urgency */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-400/20"
            >
              <span className="text-amber-300 text-sm font-medium break-keep text-center">
                {(t.hero as any).urgencyBanner}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ============= Animated metric row =============
function MetricRow({
  metric,
  delay,
}: {
  metric: { label: string; before: number; after: number; delta: string; direction: 'up' | 'down'; color: string };
  delay: number;
}) {
  const [val, setVal] = useState(metric.before);

  useEffect(() => {
    const start = performance.now();
    const duration = 1600;
    const from = metric.before;
    const to = metric.after;
    const startDelay = delay * 1000;

    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start - startDelay;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [metric.before, metric.after, delay]);

  const Icon = metric.direction === 'up' ? TrendingUp : TrendingDown;
  const deltaColor = metric.direction === 'up' ? 'text-emerald-300' : 'text-rose-300';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/85 text-sm md:text-base font-semibold">{metric.label}</span>
        <div className={`inline-flex items-center gap-1 ${deltaColor} text-sm font-bold tabular-nums`}>
          <Icon className="w-3.5 h-3.5" />
          {metric.delta}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Before */}
        <div className="flex flex-col items-end min-w-[44px]">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Before</span>
          <span className="text-white/50 text-base font-bold tabular-nums line-through decoration-white/30">
            {metric.before}
          </span>
        </div>

        {/* Bar */}
        <div className="flex-1 h-2.5 rounded-full bg-white/[0.06] overflow-hidden relative">
          <motion.div
            initial={{ width: `${metric.before}%` }}
            animate={{ width: `${metric.after}%` }}
            transition={{ duration: 1.6, delay, ease: 'easeOut' }}
            className={`h-full rounded-full bg-gradient-to-r ${metric.color} shadow-[0_0_12px_currentColor]`}
          />
        </div>

        {/* After (animated counter) */}
        <div className="flex flex-col items-start min-w-[44px]">
          <span className="text-[10px] text-emerald-300/70 uppercase tracking-wider font-semibold">After</span>
          <span className="text-white text-lg md:text-xl font-extrabold tabular-nums">
            {val}
          </span>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
