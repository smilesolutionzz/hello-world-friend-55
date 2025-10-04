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
        if (subLoading) {
          setLoading(true);
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