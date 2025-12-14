// 레드플래그 감지 유틸리티
// 위험 신호가 감지되면 즉시 전문가 상담을 안내

export interface RedFlag {
  type: 'regression' | 'no_eye_contact' | 'speech_decline' | 'response_decline' | 'severe_score' | 'self_harm_risk' | 'social_withdrawal';
  severity: 'warning' | 'critical';
  message: string;
  description: string;
}

export interface RedFlagResult {
  hasRedFlags: boolean;
  flags: RedFlag[];
  overallSeverity: 'none' | 'warning' | 'critical';
}

// 레드플래그 키워드 정의
const RED_FLAG_KEYWORDS = {
  regression: ['퇴행', '후퇴', '발달 퇴행', '능력 감소', '이전보다 못함'],
  no_eye_contact: ['눈맞춤 없음', '눈맞춤 거의 없음', '시선 회피', '눈을 마주치지', '눈 맞추지 않'],
  speech_decline: ['말소리 감소', '말 급감', '언어 퇴행', '말을 안함', '말이 줄어', '발화 감소', '언어 감소'],
  response_decline: ['반응 급감', '반응 없음', '반응이 줄어', '무반응', '자극에 반응하지'],
  self_harm_risk: ['자해', '자살', '죽고 싶', '사라지고 싶', '위험 행동'],
  social_withdrawal: ['사회적 위축', '고립', '혼자만', '친구 없음', '관계 단절']
};

// 위험 점수 임계값
const CRITICAL_SCORE_THRESHOLDS = {
  autism: 15,      // 자폐 스펙트럼 위험 점수
  adhd: 18,        // ADHD 위험 점수  
  depression: 20,  // 우울증 위험 점수
  anxiety: 18,     // 불안 위험 점수
  stress: 25,      // 스트레스 위험 점수
  default: 80      // 백분율 기준 위험 점수
};

export function detectRedFlags(
  analysisText: string,
  scores?: Record<string, number>,
  testType?: string,
  rawAnswers?: number[]
): RedFlagResult {
  const flags: RedFlag[] = [];
  const textLower = analysisText.toLowerCase();

  // 1. 키워드 기반 레드플래그 감지
  Object.entries(RED_FLAG_KEYWORDS).forEach(([type, keywords]) => {
    keywords.forEach(keyword => {
      if (analysisText.includes(keyword)) {
        const isCritical = type === 'self_harm_risk' || type === 'regression';
        flags.push({
          type: type as RedFlag['type'],
          severity: isCritical ? 'critical' : 'warning',
          message: getRedFlagMessage(type as RedFlag['type']),
          description: getRedFlagDescription(type as RedFlag['type'])
        });
      }
    });
  });

  // 2. 점수 기반 레드플래그 감지
  if (scores) {
    const threshold = testType && CRITICAL_SCORE_THRESHOLDS[testType as keyof typeof CRITICAL_SCORE_THRESHOLDS]
      ? CRITICAL_SCORE_THRESHOLDS[testType as keyof typeof CRITICAL_SCORE_THRESHOLDS]
      : CRITICAL_SCORE_THRESHOLDS.default;

    const totalScore = scores.total || scores.totalScore || 0;
    
    if (totalScore >= threshold) {
      flags.push({
        type: 'severe_score',
        severity: 'critical',
        message: '검사 점수가 매우 높습니다',
        description: '전문가의 정밀 평가가 필요한 수준입니다.'
      });
    }
  }

  // 3. 원시 답변 패턴 분석 (극단적 응답 패턴)
  if (rawAnswers && rawAnswers.length > 0) {
    const maxScore = Math.max(...rawAnswers);
    const extremeResponses = rawAnswers.filter(a => a === maxScore).length;
    const extremeRatio = extremeResponses / rawAnswers.length;

    if (extremeRatio > 0.7 && maxScore >= 3) {
      flags.push({
        type: 'severe_score',
        severity: 'warning',
        message: '대부분의 항목에서 높은 응답이 나타났습니다',
        description: '전반적으로 어려움을 겪고 계실 수 있습니다.'
      });
    }
  }

  // 위험도 레벨과 riskLevel 텍스트 분석
  if (analysisText.includes('높음') || analysisText.includes('위험') || 
      analysisText.includes('high') || textLower.includes('심각')) {
    const hasExisting = flags.some(f => f.type === 'severe_score');
    if (!hasExisting) {
      flags.push({
        type: 'severe_score',
        severity: 'warning',
        message: '위험 수준이 높은 것으로 나타났습니다',
        description: '전문가 상담을 권장드립니다.'
      });
    }
  }

  // 중복 제거
  const uniqueFlags = flags.filter((flag, index, self) =>
    index === self.findIndex(f => f.type === flag.type)
  );

  // 전체 심각도 결정
  let overallSeverity: 'none' | 'warning' | 'critical' = 'none';
  if (uniqueFlags.some(f => f.severity === 'critical')) {
    overallSeverity = 'critical';
  } else if (uniqueFlags.length > 0) {
    overallSeverity = 'warning';
  }

  return {
    hasRedFlags: uniqueFlags.length > 0,
    flags: uniqueFlags,
    overallSeverity
  };
}

function getRedFlagMessage(type: RedFlag['type']): string {
  const messages: Record<RedFlag['type'], string> = {
    regression: '발달 퇴행 징후가 감지되었습니다',
    no_eye_contact: '눈맞춤 어려움이 나타났습니다',
    speech_decline: '언어/말소리 감소가 감지되었습니다',
    response_decline: '반응 감소가 나타났습니다',
    severe_score: '위험 수준의 점수입니다',
    self_harm_risk: '자해/자살 위험 신호가 감지되었습니다',
    social_withdrawal: '사회적 위축이 나타났습니다'
  };
  return messages[type];
}

function getRedFlagDescription(type: RedFlag['type']): string {
  const descriptions: Record<RedFlag['type'], string> = {
    regression: '이전에 가능했던 능력이 감소하는 것은 즉각적인 전문가 평가가 필요합니다.',
    no_eye_contact: '눈맞춤의 어려움은 발달적 평가가 필요할 수 있습니다.',
    speech_decline: '언어 발달의 급격한 변화는 전문가 상담이 필요합니다.',
    response_decline: '반응의 급격한 감소는 즉각적인 평가가 권장됩니다.',
    severe_score: '검사 결과가 전문가 상담이 필요한 수준입니다.',
    self_harm_risk: '즉각적인 전문 도움이 필요합니다. 가까운 정신건강 전문기관에 연락해 주세요.',
    social_withdrawal: '사회적 고립은 정서적 지원이 필요할 수 있습니다.'
  };
  return descriptions[type];
}

// 레드플래그 결과에서 riskLevel 분석
export function detectRedFlagsFromResult(result: {
  analysis?: string;
  riskLevel?: string;
  recommendations?: string[];
  scoreInterpretation?: Record<string, any>;
  totalScore?: number;
  level?: string;
  description?: string;
}, testType?: string): RedFlagResult {
  const textParts: string[] = [];
  
  if (result.analysis) textParts.push(result.analysis);
  if (result.description) textParts.push(result.description);
  if (result.level) textParts.push(result.level);
  if (result.recommendations) textParts.push(result.recommendations.join(' '));
  if (result.riskLevel) textParts.push(result.riskLevel);

  const combinedText = textParts.join(' ');
  
  const scores: Record<string, number> = {};
  if (result.totalScore) scores.total = result.totalScore;
  if (result.scoreInterpretation?.normalized) scores.normalized = result.scoreInterpretation.normalized;

  return detectRedFlags(combinedText, scores, testType);
}
