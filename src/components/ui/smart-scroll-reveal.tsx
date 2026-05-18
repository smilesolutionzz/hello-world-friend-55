import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { motion, useInView, useScroll, useTransform, useReducedMotion, Variants } from 'framer-motion';

/**
 * 섹션 타입(kind)에 따라 가장 어울리는 스크롤 인터랙션을 자동 적용하는 스마트 컴포넌트.
 *
 * 모바일 안전:
 *  - `amount`는 기본 'some' (1px만 보여도 트리거) — 뷰포트보다 큰 섹션이 hidden에 갇히는 것 방지.
 *  - `mobileAmount`로 모바일 한정 별도 값 지정 가능.
 *  - `?reveal-debug=1` 쿼리 또는 localStorage `reveal-debug=1` 활성화 시:
 *    · 콘솔에 [reveal] 로그 (kind/label/inView/opacity 가정)
 *    · 우측 상단 작은 배지로 상태 표시
 */

type RevealKind = 'hero' | 'text' | 'cards' | 'stats' | 'image' | 'cta' | 'default';

interface SmartScrollRevealProps {
  children: ReactNode;
  kind?: RevealKind;
  delay?: number;
  className?: string;
  stagger?: number;
  once?: boolean;
  /** 데스크탑 amount (기본 'some') */
  amount?: number | 'some' | 'all';
  /** 모바일(<768px) 한정 amount. 미지정 시 amount 사용 */
  mobileAmount?: number | 'some' | 'all';
  /** 디버그 라벨 (배지/로그용) */
  debugLabel?: string;
}

const baseVariants: Record<RevealKind, Variants> = {
  hero: {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  },
  text: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  },
  cards: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  },
  stats: {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] } },
  },
  image: {
    hidden: { opacity: 0, scale: 1.04 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
  },
  cta: {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  },
  default: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  },
};

const childItemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

function isRevealDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (new URLSearchParams(window.location.search).get('reveal-debug') === '1') return true;
    return window.localStorage.getItem('reveal-debug') === '1';
  } catch {
    return false;
  }
}

function useIsMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(max-width: 767px)');
    const sync = () => setM(mql.matches);
    sync();
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  }, []);
  return m;
}

export const SmartScrollReveal: React.FC<SmartScrollRevealProps> = ({
  children,
  kind = 'default',
  delay = 0,
  className = '',
  stagger,
  once = true,
  amount = 'some',
  mobileAmount,
  debugLabel,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const effectiveAmount = isMobile ? (mobileAmount ?? amount) : amount;
  const inView = useInView(ref, { once, amount: effectiveAmount as any });
  const reduce = useReducedMotion();
  const debug = isRevealDebugEnabled();

  useEffect(() => {
    if (!debug) return;
    // eslint-disable-next-line no-console
    console.log('[reveal]', {
      label: debugLabel ?? kind,
      kind,
      inView,
      amount: effectiveAmount,
      isMobile,
      reduce,
    });
  }, [debug, debugLabel, kind, inView, effectiveAmount, isMobile, reduce]);

  const variants =
    kind === 'cards' && stagger
      ? {
          hidden: {},
          visible: { transition: { staggerChildren: stagger, delayChildren: 0.05 } },
        }
      : baseVariants[kind];

  const debugBadge = debug ? (
    <span
      style={{
        position: 'absolute',
        top: 4,
        right: 4,
        zIndex: 50,
        fontSize: 10,
        padding: '2px 6px',
        borderRadius: 6,
        background: inView ? 'rgba(16,185,129,0.9)' : 'rgba(244,63,94,0.9)',
        color: 'white',
        fontFamily: 'monospace',
        pointerEvents: 'none',
      }}
    >
      {(debugLabel ?? kind)}:{inView ? 'show' : 'hide'}
    </span>
  ) : null;

  if (reduce) {
    return (
      <div
        ref={ref}
        className={className}
        data-reveal-label={debugLabel}
        data-reveal-inview="true"
        style={debug ? { position: 'relative' } : undefined}
      >
        {debugBadge}
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ delay }}
      data-reveal-label={debugLabel}
      data-reveal-inview={inView ? 'true' : 'false'}
      style={debug ? { position: 'relative' } : undefined}
    >
      {debugBadge}
      {kind === 'cards'
        ? React.Children.map(children, (child, i) => (
            <motion.div key={i} variants={childItemVariants}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
};

/**
 * 스크롤 진행도에 따라 살짝 위/아래로 이동하는 패럴럭스 래퍼.
 */
interface ScrollParallaxProps {
  children: ReactNode;
  offset?: number;
  className?: string;
}

export const ScrollParallax: React.FC<ScrollParallaxProps> = ({
  children,
  offset = 60,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  if (reduce) {
    return <div ref={ref} className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
};

/**
 * 숫자 카운트업 (통계 섹션).
 */
interface CountUpProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  value,
  duration = 1.4,
  suffix = '',
  prefix = '',
  className = '',
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView || reduce) {
      if (reduce) setDisplay(value);
      return;
    }
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
};

export default SmartScrollReveal;
