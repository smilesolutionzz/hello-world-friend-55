// 베타 테스트 기간 체크 유틸리티
export const BETA_END_DATE = new Date('2025-10-30T23:59:59+09:00'); // 2025년 10월 30일 23:59:59 KST

export const isBetaPeriod = (): boolean => {
  const now = new Date();
  return now < BETA_END_DATE;
};

export const getBetaDaysRemaining = (): number => {
  if (!isBetaPeriod()) return 0;
  const now = new Date();
  const diffTime = BETA_END_DATE.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getBetaMessage = (): string => {
  const daysRemaining = getBetaDaysRemaining();
  if (daysRemaining === 0) return '베타 테스트 기간이 종료되었습니다.';
  return `🎉 베타 테스트 기간! 모든 기능 무료 (D-${daysRemaining})`;
};
