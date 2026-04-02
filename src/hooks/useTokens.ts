import { useCallback } from 'react';

// 토큰 시스템 폐기 - 모든 함수를 no-op으로 대체
export function useTokens() {
  const consumeTokens = useCallback(async (_amount: number) => {
    return true; // 항상 성공
  }, []);

  const checkTokenAvailability = useCallback((_amount: number) => {
    return true; // 항상 가용
  }, []);

  const fetchBalance = async () => {};

  return {
    loading: false,
    balance: { current_tokens: 0, total_purchased: 0, total_used: 0, referral_bonus: 0 },
    tokenBalance: { current_tokens: 0, total_purchased: 0, total_used: 0, referral_bonus: 0 },
    fetchBalance,
    refreshTokenBalance: fetchBalance,
    isPremium: false,
    consumeTokens,
    checkTokenAvailability,
  };
}
