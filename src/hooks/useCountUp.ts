import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  end: number;
  duration?: number;
  decimals?: number;
  start?: number;
  startOnMount?: boolean;
}

/**
 * 숫자 카운팅 애니메이션 훅
 * @param end - 목표 숫자
 * @param duration - 애니메이션 지속 시간 (ms)
 * @param decimals - 소수점 자리수
 * @param start - 시작 숫자
 * @param startOnMount - 마운트 시 즉시 시작할지 여부
 */
export function useCountUp({
  end,
  duration = 2000,
  decimals = 0,
  start = 0,
  startOnMount = true
}: UseCountUpOptions) {
  const [count, setCount] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const progress = timestamp - startTimeRef.current;
    const percentage = Math.min(progress / duration, 1);

    // Easing function (easeOutExpo)
    const easedProgress = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
    
    const currentCount = start + (end - start) * easedProgress;
    setCount(Number(currentCount.toFixed(decimals)));

    if (percentage < 1) {
      frameRef.current = requestAnimationFrame(animate);
    } else {
      setIsAnimating(false);
      startTimeRef.current = undefined;
    }
  };

  const startAnimation = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCount(start);
    startTimeRef.current = undefined;
    frameRef.current = requestAnimationFrame(animate);
  };

  const reset = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    setCount(start);
    setIsAnimating(false);
    startTimeRef.current = undefined;
  };

  useEffect(() => {
    if (startOnMount) {
      startAnimation();
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration]);

  return { count, startAnimation, reset, isAnimating };
}
