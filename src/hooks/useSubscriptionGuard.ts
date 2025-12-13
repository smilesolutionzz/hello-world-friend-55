import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from './useSubscription';
import { isBetaTestPeriod } from '@/utils/betaTest';

interface SubscriptionGuardReturn {
  allowed: boolean;
  loading: boolean;
  subscriptionType: 'free' | 'premium' | 'paid' | 'lifetime' | null;
  planName?: string;
}

export const useSubscriptionGuard = (requiredFeature: string = 'basic_test'): SubscriptionGuardReturn => {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isVisibilityChanging, setIsVisibilityChanging] = useState(false);
  const { 
    subscription, 
    loading: subLoading, 
    hasFeatureAccess, 
    checkSubscriptionRequired 
  } = useSubscription();
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
        if (subLoading) {
          setLoading(true);
          return;
        }

        // Visibility 변경 중에는 리다이렉트하지 않음
        if (isVisibilityChanging) {
          console.log('⏳ Visibility changing - skipping subscription redirect');
          return;
        }

        // 유료화 전환: 구독이 없으면 무조건 구독 페이지로 이동
        if (!subscription) {
          console.log('❌ No subscription found - redirecting to subscription page');
          navigate('/subscription');
          setAllowed(false);
          setLoading(false);
          return;
        }

        const hasAccess = hasFeatureAccess(requiredFeature);
        
        if (!hasAccess) {
          console.log(`❌ Feature access denied for: ${requiredFeature}`);
          navigate('/subscription');
          setAllowed(false);
        } else {
          console.log(`✅ Feature access granted for: ${requiredFeature}`);
          setAllowed(true);
        }
      } catch (error) {
        console.error('Subscription check error:', error);
        if (!isVisibilityChanging) {
          navigate('/subscription');
        }
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [subscription, subLoading, requiredFeature, navigate, hasFeatureAccess, isVisibilityChanging]);

  return { 
    allowed, 
    loading, 
    subscriptionType: subscription?.subscription_type || null,
    planName: subscription?.plan?.name
  };
};