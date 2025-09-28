import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTokens } from './useTokens';
import { useSubscription } from './useSubscription';
import { isBetaTestPeriod } from '@/utils/betaTest';

interface TokenGuardReturn {
  allowed: boolean;
  loading: boolean;
  remainingTokens: number;
  isSubscriber: boolean;
}

export const useTokenGuard = (requiredTokens: number = 1): TokenGuardReturn => {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { balance, checkTokenAvailability } = useTokens();
  const { subscription, loading: subLoading, isPremiumUser } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // 베타테스트 기간 중에는 모든 접근 허용
        if (isBetaTestPeriod()) {
          console.log('🎉 Beta Test Period: All access granted');
          setAllowed(true);
          setLoading(false);
          return;
        }

        if (subLoading || !balance) {
          setLoading(true);
          return;
        }

        // 구독자면 무제한 이용 가능
        const isSubscriber = isPremiumUser();
        if (isSubscriber) {
          setAllowed(true);
          setLoading(false);
          return;
        }

        // 구독자가 아니면 토큰 확인
        const hasEnoughTokens = checkTokenAvailability(requiredTokens);
        console.log(`🔒 Token Guard: Required ${requiredTokens}, Has enough: ${hasEnoughTokens}, Balance: ${balance?.current_tokens}`);
        
        if (!hasEnoughTokens) {
          console.log('❌ Token Guard: Insufficient tokens, redirecting to subscription');
          navigate('/token-subscription');
          setAllowed(false);
        } else {
          console.log('✅ Token Guard: Sufficient tokens, allowing access');
          setAllowed(true);
        }
      } catch (error) {
        console.error('Access check error:', error);
        navigate('/token-subscription');
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [balance, subscription, subLoading, requiredTokens, navigate, checkTokenAvailability, isPremiumUser]);

  return { 
    allowed, 
    loading, 
    remainingTokens: balance?.current_tokens || 0,
    isSubscriber: isPremiumUser()
  };
};