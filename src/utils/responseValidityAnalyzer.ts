/**
 * 응답 신뢰도 분석기 (Response Validity Analyzer)
 * 
 * 사용자의 검사 응답 패턴을 분석하여 결과의 신뢰도를 판정합니다.
 * - 일관성 지수 (Consistency Index)
 * - 극단 응답 편향 (Extreme Response Bias)
 * - 무선 응답 탐지 (Random Response Detection)
 * - 묵인 편향 (Acquiescence Bias)
 */

export interface ValidityResult {
  overallValidity: 'high' | 'acceptable' | 'caution' | 'invalid';
  overallScore: number; // 0-100
  indicators: ValidityIndicator[];
  recommendation: string;
}

export interface ValidityIndicator {
  name: string;
  nameEn: string;
  score: number; // 0-100
  status: 'pass' | 'warning' | 'fail';
  description: string;
  descriptionEn: string;
}

/**
 * 응답 배열을 분석하여 신뢰도 지표를 산출합니다.
 * @param answers - 사용자 응답 배열 (숫자)
 * @param maxScale - 최대 척도 값 (예: 리커트 5점이면 5)
 * @param reversedItems - 역문항 인덱스 배열 (0-based)
 */
export const analyzeResponseValidity = (
  answers: number[],
  maxScale: number = 5,
  reversedItems: number[] = []
): ValidityResult => {
  if (!answers || answers.length < 5) {
    return {
      overallValidity: 'caution',
      overallScore: 50,
      indicators: [],
      recommendation: '문항 수가 부족하여 신뢰도 분석이 제한적입니다.',
    };
  }

  const indicators: ValidityIndicator[] = [];

  // 1. 일관성 지수 (Consistency Index)
  // 인접 문항 간 응답 차이의 평균을 분석
  const consistencyScore = calcConsistencyIndex(answers, maxScale);
  indicators.push({
    name: '응답 일관성',
    nameEn: 'Response Consistency',
    score: consistencyScore,
    status: consistencyScore >= 70 ? 'pass' : consistencyScore >= 50 ? 'warning' : 'fail',
    description: consistencyScore >= 70
      ? '응답 패턴이 일관적이며 신뢰할 수 있습니다.'
      : consistencyScore >= 50
        ? '일부 응답에서 비일관적 패턴이 관찰됩니다.'
        : '무작위 응답 가능성이 높아 결과 해석에 주의가 필요합니다.',
    descriptionEn: consistencyScore >= 70
      ? 'Response patterns are consistent and reliable.'
      : consistencyScore >= 50
        ? 'Some inconsistent patterns observed in responses.'
        : 'High probability of random responding; interpret with caution.',
  });

  // 2. 극단 응답 편향 (Extreme Response Bias)
  const extremeBiasScore = calcExtremeBias(answers, maxScale);
  indicators.push({
    name: '극단 응답 편향',
    nameEn: 'Extreme Response Bias',
    score: extremeBiasScore,
    status: extremeBiasScore >= 70 ? 'pass' : extremeBiasScore >= 50 ? 'warning' : 'fail',
    description: extremeBiasScore >= 70
      ? '응답 분포가 적절하며 극단값 편중이 없습니다.'
      : extremeBiasScore >= 50
        ? '극단적 응답(최소/최대)이 다소 많아 편향 가능성이 있습니다.'
        : '대부분의 응답이 극단값에 치우쳐 있어 결과 왜곡 가능성이 있습니다.',
    descriptionEn: extremeBiasScore >= 70
      ? 'Response distribution is appropriate with no extreme value bias.'
      : extremeBiasScore >= 50
        ? 'Moderate tendency toward extreme responses detected.'
        : 'Most responses are skewed to extreme values; results may be distorted.',
  });

  // 3. 묵인 편향 (Acquiescence Bias) - 긍정 응답 치우침
  const acquiescenceScore = calcAcquiescenceBias(answers, maxScale);
  indicators.push({
    name: '묵인 편향',
    nameEn: 'Acquiescence Bias',
    score: acquiescenceScore,
    status: acquiescenceScore >= 70 ? 'pass' : acquiescenceScore >= 50 ? 'warning' : 'fail',
    description: acquiescenceScore >= 70
      ? '긍정/부정 응답 비율이 균형적입니다.'
      : acquiescenceScore >= 50
        ? '한쪽 방향으로의 응답 경향이 관찰됩니다.'
        : '대부분 동의 또는 비동의로 응답하여 변별력이 낮습니다.',
    descriptionEn: acquiescenceScore >= 70
      ? 'Balanced ratio of positive and negative responses.'
      : acquiescenceScore >= 50
        ? 'Tendency toward one-directional responding observed.'
        : 'Mostly agreeing or disagreeing responses; low discrimination.',
  });

  // 4. 응답 다양성 (Response Variability)
  const variabilityScore = calcResponseVariability(answers, maxScale);
  indicators.push({
    name: '응답 다양성',
    nameEn: 'Response Variability',
    score: variabilityScore,
    status: variabilityScore >= 70 ? 'pass' : variabilityScore >= 50 ? 'warning' : 'fail',
    description: variabilityScore >= 70
      ? '다양한 척도 값을 사용하여 변별력 있는 응답을 하였습니다.'
      : variabilityScore >= 50
        ? '사용된 척도 범위가 제한적입니다.'
        : '거의 동일한 값으로 응답하여 변별력이 매우 낮습니다.',
    descriptionEn: variabilityScore >= 70
      ? 'Diverse scale values used; responses show good discrimination.'
      : variabilityScore >= 50
        ? 'Limited range of scale values used.'
        : 'Nearly identical responses; very low discrimination.',
  });

  // Overall score
  const overallScore = Math.round(
    indicators.reduce((sum, ind) => sum + ind.score, 0) / indicators.length
  );

  const overallValidity: ValidityResult['overallValidity'] =
    overallScore >= 75 ? 'high' :
    overallScore >= 60 ? 'acceptable' :
    overallScore >= 40 ? 'caution' : 'invalid';

  const recommendations: Record<ValidityResult['overallValidity'], string> = {
    high: '응답 신뢰도가 높아 검사 결과를 신뢰할 수 있습니다.',
    acceptable: '응답 신뢰도가 수용 가능한 수준이며, 결과 해석 시 일부 주의가 필요합니다.',
    caution: '응답 패턴에 주의가 필요하며, 재검사를 권장합니다.',
    invalid: '응답 신뢰도가 매우 낮아 결과 해석이 어렵습니다. 재검사를 강력히 권장합니다.',
  };

  return {
    overallValidity,
    overallScore,
    indicators,
    recommendation: recommendations[overallValidity],
  };
};

// ─── Internal Calculations ───

function calcConsistencyIndex(answers: number[], maxScale: number): number {
  if (answers.length < 3) return 50;
  
  let totalDiff = 0;
  for (let i = 1; i < answers.length; i++) {
    totalDiff += Math.abs(answers[i] - answers[i - 1]);
  }
  const avgDiff = totalDiff / (answers.length - 1);
  const maxPossibleDiff = maxScale - 1;
  
  // Very low diff = possibly all same (bad), very high = random (bad)
  // Ideal is moderate variance
  const normalizedDiff = avgDiff / maxPossibleDiff;
  
  if (normalizedDiff < 0.05) return 30; // all same answers
  if (normalizedDiff > 0.7) return 25;  // too erratic / random
  if (normalizedDiff > 0.5) return 55;
  return Math.min(100, Math.round(80 + (0.3 - Math.abs(normalizedDiff - 0.3)) * 100));
}

function calcExtremeBias(answers: number[], maxScale: number): number {
  const extremeCount = answers.filter(a => a === 1 || a === maxScale).length;
  const extremeRatio = extremeCount / answers.length;
  
  if (extremeRatio > 0.8) return 15;
  if (extremeRatio > 0.6) return 40;
  if (extremeRatio > 0.4) return 60;
  return Math.round(85 - extremeRatio * 30);
}

function calcAcquiescenceBias(answers: number[], maxScale: number): number {
  const midpoint = (maxScale + 1) / 2;
  const aboveMid = answers.filter(a => a > midpoint).length;
  const belowMid = answers.filter(a => a < midpoint).length;
  const total = aboveMid + belowMid;
  
  if (total === 0) return 50; // all midpoint
  
  const ratio = Math.max(aboveMid, belowMid) / total;
  if (ratio > 0.9) return 25;
  if (ratio > 0.8) return 45;
  if (ratio > 0.7) return 65;
  return Math.round(90 - (ratio - 0.5) * 100);
}

function calcResponseVariability(answers: number[], maxScale: number): number {
  const uniqueValues = new Set(answers).size;
  const possibleValues = maxScale;
  const usageRatio = uniqueValues / possibleValues;
  
  if (usageRatio <= 0.2) return 15;  // only 1 value used
  if (usageRatio <= 0.4) return 45;
  if (usageRatio <= 0.6) return 65;
  return Math.min(100, Math.round(usageRatio * 100));
}

/**
 * 신뢰도 계수를 계산합니다 (Cronbach's Alpha 근사)
 * 내부 일관성 신뢰도의 간소화 버전입니다.
 */
export const calcInternalConsistency = (
  answers: number[],
  domainItemIndices: Record<string, number[]>
): number => {
  const domains = Object.values(domainItemIndices);
  if (domains.length < 2) return 0.7; // default

  const k = domains.length;
  const domainScores = domains.map(indices => {
    const items = indices.map(i => answers[i] ?? 0);
    return items.reduce((a, b) => a + b, 0);
  });

  const totalVariance = calcVariance(domainScores);
  if (totalVariance === 0) return 0.5;

  const itemVariances = domains.map(indices => {
    const items = indices.map(i => answers[i] ?? 0);
    return calcVariance(items);
  });
  const sumItemVariance = itemVariances.reduce((a, b) => a + b, 0);

  const alpha = (k / (k - 1)) * (1 - sumItemVariance / totalVariance);
  return Math.max(0, Math.min(1, alpha));
};

function calcVariance(arr: number[]): number {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (arr.length - 1);
}

/**
 * 점수의 신뢰구간을 계산합니다 (95% CI)
 * SEM (Standard Error of Measurement) 기반
 */
export const calcConfidenceInterval = (
  score: number,
  maxScore: number,
  reliability: number = 0.8,
  confidenceLevel: number = 1.96 // 95% CI
): { lower: number; upper: number; sem: number } => {
  const sd = maxScore * 0.15; // estimated SD
  const sem = sd * Math.sqrt(1 - reliability);
  const margin = confidenceLevel * sem;
  
  return {
    lower: Math.max(0, Math.round((score - margin) * 10) / 10),
    upper: Math.min(maxScore, Math.round((score + margin) * 10) / 10),
    sem: Math.round(sem * 100) / 100,
  };
};
