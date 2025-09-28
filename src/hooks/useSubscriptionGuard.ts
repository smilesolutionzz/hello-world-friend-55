import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from './useSubscription';
import { isBetaTestPeriod } from '@/utils/betaTest';

interface SubscriptionGuardReturn {
  allowed: boolean;
  loading: boolean;
  subscriptionType: 'free' | 'premium' | 'paid' | null;
  planName?: string;
}

export const useSubscriptionGuard = (requiredFeature: string = 'basic_test'): SubscriptionGuardReturn => {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { 
    subscription, 
    loading: subLoading, 
    hasFeatureAccess, 
    checkSubscriptionRequired 
  } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // 베타테스트 기간 중에는 모든 접근 허용
        if (isBetaTestPeriod()) {
          console.log('🎉 Beta Test Period: All subscription features granted');
          setAllowed(true);
          setLoading(false);
          return;
        }

        if (subLoading) {
          setLoading(true);
          return;
        }

        if (!subscription) {
          // 구독이 없으면 구독 페이지로 이동
          navigate('/subscription');
          setAllowed(false);
          return;
        }

        const hasAccess = hasFeatureAccess(requiredFeature);
        
        if (!hasAccess) {
          // 기능에 대한 접근 권한이 없으면 구독 페이지로 이동
          navigate('/subscription');
          setAllowed(false);
        } else {
          setAllowed(true);
        }
      } catch (error) {
        console.error('Subscription check error:', error);
        navigate('/subscription');
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [subscription, subLoading, requiredFeature, navigate, hasFeatureAccess]);

  return { 
    allowed, 
    loading, 
    subscriptionType: subscription?.subscription_type || null,
    planName: subscription?.plan?.name
  };
};