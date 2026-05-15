import { useState, useEffect, useCallback, useRef } from 'react';
import { detectRedFlagsFromResult, RedFlagResult } from '@/utils/redFlagDetection';
import { useTeenRiskReferral, type ReferralResult } from '@/hooks/useTeenRiskReferral';

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
  /** 사용자 연령(만나이). 10-19세이면 청소년 위기 자동 연계 활성화 */
  age?: number;
  /** 시도 (예: '서울특별시') */
  region_sido?: string;
  /** 시군구 (예: '강남구') */
  region_sigungu?: string;
  /** 자유응답 텍스트(키워드 감지에 사용). 없으면 result.analysis 사용 */
  freeResponseText?: string;
}

const RISK_KEYWORDS = ['자해', '자살', '죽고 싶', '사라지고 싶', '학교폭력', '왕따', '맞아', '때려', '집에 가기 싫'];

function isTeen(age?: number) {
  return typeof age === 'number' && age >= 10 && age <= 19;
}

function mapSeverityToRisk(sev: 'none' | 'warning' | 'critical'): 'moderate' | 'high' | 'critical' {
  if (sev === 'critical') return 'critical';
  if (sev === 'warning') return 'high';
  return 'moderate';
}

export const useRedFlagDetection = ({
  result,
  testType,
  enabled = true,
  age,
  region_sido,
  region_sigungu,
  freeResponseText,
}: UseRedFlagDetectionProps) => {
  const [redFlagResult, setRedFlagResult] = useState<RedFlagResult>({
    hasRedFlags: false,
    flags: [],
    overallSeverity: 'none'
  });
  const [showAlert, setShowAlert] = useState(false);
  const [hasShownAlert, setHasShownAlert] = useState(false);
  const [teenReferral, setTeenReferral] = useState<ReferralResult | null>(null);
  const referralTriggered = useRef(false);
  const { createReferral } = useTeenRiskReferral();

  useEffect(() => {
    if (!enabled || !result || hasShownAlert) return;

    const detection = detectRedFlagsFromResult(result, testType);
    setRedFlagResult(detection);

    if (!detection.hasRedFlags) return;

    const timer = setTimeout(() => {
      setShowAlert(true);
      setHasShownAlert(true);
    }, 1500);

    // Auto-trigger teen risk referral exactly once across the lifetime of this hook.
    if (isTeen(age) && !referralTriggered.current) {
      referralTriggered.current = true; // set BEFORE await to prevent re-entrancy from re-renders
      const text = freeResponseText ?? result?.analysis ?? '';
      const matchedKeywords = RISK_KEYWORDS.filter((k) => text.includes(k));
      const triggerSource: 'assessment_score' | 'free_response_keyword' =
        matchedKeywords.length > 0 ? 'free_response_keyword' : 'assessment_score';

      createReferral({
        age,
        region_sido,
        region_sigungu,
        risk_level: mapSeverityToRisk(detection.overallSeverity),
        trigger_source: triggerSource,
        trigger_keywords: matchedKeywords,
        detected_score: result.totalScore,
        assessment_type: testType,
      })
        .then((r) => { if (r) setTeenReferral(r); })
        .catch((e) => {
          console.warn('[teen-risk-referral] failed', e);
          // Allow a single retry on hard failure (network/etc.) by resetting the latch.
          referralTriggered.current = false;
        });
    }

    return () => clearTimeout(timer);
  }, [result, testType, enabled, hasShownAlert, age, region_sido, region_sigungu, freeResponseText, createReferral]);

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
    hasRedFlags: redFlagResult.hasRedFlags,
    teenReferral,
  };
};

export default useRedFlagDetection;
