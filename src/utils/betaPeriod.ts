// 베타 테스트 기간 종료 - 유료 서비스 전환
export const BETA_END_DATE = new Date('2025-01-01T00:00:00+09:00');

export const isBetaPeriod = (): boolean => {
  // 베타 테스트 기간 종료됨 - 항상 false 반환
  return false;
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
