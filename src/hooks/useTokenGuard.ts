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
        if (subLoading || !balance) {
          setLoading(true);
          return;
        }

        // 유료화 전환: 프리미엄 구독자는 무제한 이용
        const isSubscriber = isPremiumUser();
        if (isSubscriber) {
          console.log('✅ Premium subscriber - unlimited access granted');
          setAllowed(true);
          setLoading(false);
          return;
        }

        // 무료 사용자는 토큰으로만 이용 가능
        const hasEnoughTokens = checkTokenAvailability(requiredTokens);
        console.log(`🔒 Free user - Token check: Required ${requiredTokens}, Balance: ${balance?.current_tokens}, Has enough: ${hasEnoughTokens}`);
        
        if (!hasEnoughTokens) {
          console.log('❌ Insufficient tokens - redirecting to subscription');
          navigate('/subscription');
          setAllowed(false);
        } else {
          console.log('✅ Sufficient tokens - access granted');
          setAllowed(true);
        }
      } catch (error) {
        console.error('Access check error:', error);
        navigate('/subscription');
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