// 베타테스트 기간 설정 (2024년 10월 31일까지)
export const BETA_TEST_END_DATE = new Date('2024-10-31T23:59:59');

export const isBetaTestPeriod = (): boolean => {
  const now = new Date();
  return now <= BETA_TEST_END_DATE;
};

export const getBetaTestMessage = (): string => {
  return `🎉 베타테스트 기간 중! 10월 31일까지 모든 서비스를 무료로 이용하실 수 있습니다.`;
};