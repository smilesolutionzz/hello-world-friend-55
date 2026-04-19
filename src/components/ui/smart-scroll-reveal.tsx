import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { motion, useInView, useScroll, useTransform, useReducedMotion, Variants } from 'framer-motion';

/**
 * 섹션 타입(kind)에 따라 가장 어울리는 스크롤 인터랙션을 자동 적용하는 스마트 컴포넌트.
 *
 * kind:
 *  - hero      : 살짝 페이드 + slide-up (Hero/큰 타이틀)
 *  - text      : fade + slide-up (문단·설명)
 *  - cards     : stagger (자식 순차 등장 — Children에 적용)
 *  - stats     : scale + fade (강조감)
 *  - image     : 살짝 줌아웃 + fade (이미지·일러스트)
 *  - cta       : fade + scale (시선 락인)
 *  - default   : fade + slide-up
 *
 * `prefers-reduced-motion` 자동 감지 → 모션 비활성.
 */

type RevealKind = 'hero' | 'text' | 'cards' | 'stats' | 'image' | 'cta' | 'default';

interface SmartScrollRevealProps {
  children: ReactNode;
  kind?: RevealKind;
  delay?: number;
  className?: string;
  /** stagger 모드에서 자식 사이 간격 (초) */
  stagger?: number;
  once?: boolean;
  /** 화면의 몇 % 보일 때 트리거 (기본 0.15) */
  amount?: number;
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

export const SmartScrollReveal: React.FC<SmartScrollRevealProps> = ({
  children,
  kind = 'default',
  delay = 0,
  className = '',
  stagger,
  once = true,
  amount = 0.15,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount });
  const reduce = useReducedMotion();

  const variants =
    kind === 'cards' && stagger
      ? {
          hidden: {},
          visible: { transition: { staggerChildren: stagger, delayChildren: 0.05 } },
        }
      : baseVariants[kind];

  if (reduce) {
    return <div ref={ref} className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ delay }}
    >
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
 * Hero, 큰 이미지, 인용문 등에 사용.
 */
interface ScrollParallaxProps {
  children: ReactNode;
  /** 이동 강도 (px). 양수=올라감 효과 (기본 60) */
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
 * 숫자 카운트업 (통계 섹션). 화면 진입 시 0 → value로 증가.
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
