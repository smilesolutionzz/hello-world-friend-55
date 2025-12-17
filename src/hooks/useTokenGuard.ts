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
  const [isVisibilityChanging, setIsVisibilityChanging] = useState(false);
  const { balance, checkTokenAvailability } = useTokens();
  const { subscription, loading: subLoading, isPremiumUser } = useSubscription();
  const navigate = useNavigate();

  // Visibility change detection to prevent redirect during app switch
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsVisibilityChanging(true);
      } else {
        // 페이지 복귀 시 잠시 대기 후 플래그 해제
        setTimeout(() => setIsVisibilityChanging(false), 1000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (subLoading || !balance) {
          setLoading(true);
          return;
        }

        // Visibility 변경 중에는 리다이렉트하지 않음
        if (isVisibilityChanging) {
          console.log('⏳ Visibility changing - skipping cash redirect');
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

        // 무료 사용자는 캐시로만 이용 가능
        const hasEnoughTokens = checkTokenAvailability(requiredTokens);
        console.log(`🔒 Free user - Cash check: Required ${requiredTokens}, Balance: ${balance?.current_tokens}, Has enough: ${hasEnoughTokens}`);
        
        if (!hasEnoughTokens) {
          console.log('❌ Insufficient cash - redirecting to subscription');
          navigate('/subscription');
          setAllowed(false);
        } else {
          console.log('✅ Sufficient cash - access granted');
          setAllowed(true);
        }
      } catch (error) {
        console.error('Access check error:', error);
        if (!isVisibilityChanging) {
          navigate('/subscription');
        }
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [balance, subscription, subLoading, requiredTokens, navigate, checkTokenAvailability, isPremiumUser, isVisibilityChanging]);

  return { 
    allowed, 
    loading, 
    remainingTokens: balance?.current_tokens || 0,
    isSubscriber: isPremiumUser()
  };
};