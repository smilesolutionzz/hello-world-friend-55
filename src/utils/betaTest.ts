// 베타테스트 종료 - 유료화 전환 완료
export const BETA_TEST_END_DATE = new Date('2025-10-31T23:59:59');

export const isBetaTestPeriod = (): boolean => {
  return false; // 베타 테스트 완전 종료
};

export const getBetaTestMessage = (): string => {
  return '';
};

// 무료 플랜 제공 기능
export const FREE_PLAN_FEATURES = {
  basicTests: 3, // 월 3회 기본 검사
  observations: 5, // 월 5회 관찰일지
  aiAnalysis: 0, // AI 분석 불가
  expertConsultation: 0, // 전문가 상담 불가
  premiumTests: 0, // 프리미엄 검사 불가
  dataStorage: 30, // 30일 데이터 보관
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