import { useSubscription } from './useSubscription';

// 토큰 시스템 폐기 - 구독 상태만 체크
interface TokenGuardReturn {
  allowed: boolean;
  loading: boolean;
  remainingTokens: number;
  isSubscriber: boolean;
}

export const useTokenGuard = (_requiredTokens: number = 1): TokenGuardReturn => {
  const { loading: subLoading, isPremiumUser } = useSubscription();

  return { 
    allowed: true, // 항상 허용
    loading: subLoading, 
    remainingTokens: 0,
    isSubscriber: isPremiumUser()
  };
};
