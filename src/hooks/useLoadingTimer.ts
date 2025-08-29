import { useState, useEffect, useRef } from 'react';

interface UseLoadingTimerProps {
  estimatedDuration: number; // 초 단위
  onComplete?: () => void;
}

export const useLoadingTimer = ({ estimatedDuration, onComplete }: UseLoadingTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(estimatedDuration);
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    setIsActive(true);
    setTimeLeft(estimatedDuration);
    setProgress(0);
  };

  const stop = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const reset = () => {
    stop();
    setTimeLeft(estimatedDuration);
    setProgress(0);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = Math.max(0, prev - 1);
          setProgress(((estimatedDuration - newTime) / estimatedDuration) * 100);
          
          if (newTime === 0) {
            setIsActive(false);
            onComplete?.();
          }
          
          return newTime;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, estimatedDuration, onComplete]);

  return {
    timeLeft,
    progress,
    isActive,
    start,
    stop,
    reset
  };
};

// 검사 유형별 예상 시간 (초 단위)
export const ANALYSIS_DURATIONS = {
  'autism-screening': 45,
  'adult-assessment': 35,
  'premium-assessment': 60,
  'attachment-style': 30,
  'big-five': 40,
  'personality-love': 25,
  'depression': 35,
  'stress': 30,
  'adhd': 40,
  'language-development': 45,
  'default': 30
} as const;

export type AnalysisType = keyof typeof ANALYSIS_DURATIONS;