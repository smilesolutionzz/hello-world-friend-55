import { useState, useEffect, useCallback } from 'react';
import { detectRedFlagsFromResult, RedFlagResult } from '@/utils/redFlagDetection';

interface UseRedFlagDetectionProps {
  result?: {
    analysis?: string;
    riskLevel?: string;
    recommendations?: string[];
    scoreInterpretation?: Record<string, any>;
    totalScore?: number;
    level?: string;
    description?: string;
  };
  testType?: string;
  enabled?: boolean;
}

export const useRedFlagDetection = ({
  result,
  testType,
  enabled = true
}: UseRedFlagDetectionProps) => {
  const [redFlagResult, setRedFlagResult] = useState<RedFlagResult>({
    hasRedFlags: false,
    flags: [],
    overallSeverity: 'none'
  });
  const [showAlert, setShowAlert] = useState(false);
  const [hasShownAlert, setHasShownAlert] = useState(false);

  useEffect(() => {
    if (!enabled || !result || hasShownAlert) return;

    const detection = detectRedFlagsFromResult(result, testType);
    setRedFlagResult(detection);

    // 레드플래그가 있으면 자동으로 알림 표시
    if (detection.hasRedFlags && !hasShownAlert) {
      // 약간의 딜레이 후 표시 (결과 화면이 먼저 보이도록)
      const timer = setTimeout(() => {
        setShowAlert(true);
        setHasShownAlert(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [result, testType, enabled, hasShownAlert]);

  const closeAlert = useCallback(() => {
    setShowAlert(false);
  }, []);

  const openAlert = useCallback(() => {
    setShowAlert(true);
  }, []);

  return {
    redFlagResult,
    showAlert,
    closeAlert,
    openAlert,
    hasRedFlags: redFlagResult.hasRedFlags
  };
};

export default useRedFlagDetection;
