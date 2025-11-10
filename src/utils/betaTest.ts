// PMF 검증 기간 - 100일 무료 운영
export const BETA_TEST_END_DATE = new Date('2026-02-17T23:59:59+09:00');

export const isBetaTestPeriod = (): boolean => {
  const now = new Date();
  return now < BETA_TEST_END_DATE; // 2026년 2월 17일까지 무료 (약 100일)
};

export const getBetaTestMessage = (): string => {
  if (!isBetaTestPeriod()) return '';
  const now = new Date();
  const diffTime = BETA_TEST_END_DATE.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `🎉 100일 무료 체험! 2026년 2월 17일까지 모든 기능 무료 (D-${diffDays})`;
};

// 무료 플랜 제공 기능 (100일간)
export const FREE_PLAN_FEATURES = {
  basicTests: 5, // 월 5회 기본 검사
  observations: 10, // 월 10회 관찰일지
  aiAnalysis: 0, // AI 분석 유료
  expertConsultation: 0, // 전문가 상담 유료
  premiumTests: 0, // 프리미엄 검사 유료
  dataStorage: 90, // 90일 데이터 보관
};

// 프리미엄 플랜 제공 기능
export const PREMIUM_PLAN_FEATURES = {
  basicTests: Infinity, // 무제한
  observations: Infinity, // 무제한
  aiAnalysis: Infinity, // 무제한 AI 분석
  expertConsultation: 1, // 월 1회 전문가 상담
  premiumTests: Infinity, // 무제한 프리미엄 검사
  dataStorage: Infinity, // 무제한 데이터 보관
};