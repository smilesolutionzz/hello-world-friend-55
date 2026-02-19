import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthGuard } from './useAuthGuard';

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'free' | 'premium' | 'paid' | 'lifetime';
  price: number;
  yearly_price?: number;
  description: string;
  features: string[];
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  subscription_type: 'free' | 'premium' | 'paid' | 'lifetime';
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired';
  current_period_start?: string;
  current_period_end?: string;
  payment_method?: string;
  is_lifetime?: boolean;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
}

export function useSubscription() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const { user } = useAuthGuard();

  const fetchSubscription = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 사용자의 현재 구독 정보 조회
      const { data: userSub, error: subError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (subError && subError.code !== 'PGRST116') {
        console.error('구독 정보 조회 오류:', subError);
        return;
      }

      setSubscription(userSub as UserSubscription);
      console.log('구독 정보 업데이트:', userSub);
    } catch (error) {
      console.error('구독 정보 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePlans = async () => {
    try {
      const { data: plans, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setAvailablePlans((plans || []) as SubscriptionPlan[]);
    } catch (error) {
      console.error('구독 플랜 조회 오류:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSubscription();
      fetchAvailablePlans();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const hasFeatureAccess = (featureType: string): boolean => {
    if (!subscription) return false;

    // 무료 플랜 제한사항
    if (subscription.subscription_type === 'free') {
      const freeFeatures = [
        'basic_test', 
        'crisis_detection',
        'observation_basic'
      ];
      return freeFeatures.includes(featureType);
    }

    // 프리미엄/평생이용권은 모든 기능 사용 가능
    if (subscription.subscription_type === 'premium' || subscription.subscription_type === 'lifetime' || subscription.is_lifetime) {
      return true;
    }

    // 유료 토큰 플랜은 토큰 기반으로 확인 (기존 로직 유지)
    if (subscription.subscription_type === 'paid') {
      return true;
    }

    return false;
  };

  const checkSubscriptionRequired = (featureType: string): boolean => {
    if (!subscription) return true;

    return !hasFeatureAccess(featureType);
  };

  const isSubscriptionActive = (): boolean => {
    if (!subscription) return false;
    return subscription.status === 'active';
  };

  const isPremiumUser = (): boolean => {
    // 평생이용권 또는 프리미엄 구독자
    return (subscription?.is_lifetime || subscription?.subscription_type === 'premium' || subscription?.subscription_type === 'lifetime') && isSubscriptionActive();
  };

  const isLifetimeUser = (): boolean => {
    return subscription?.is_lifetime === true && isSubscriptionActive();
  };

  const isFreeUser = (): boolean => {
    return !subscription || subscription.subscription_type === 'free';
  };

  const getSubscriptionLabel = (): string => {
    if (!subscription) return '구독 없음';
    
    if (subscription.is_lifetime || subscription.subscription_type === 'lifetime') {
      return '평생이용권';
    }
    
    switch (subscription.subscription_type) {
      case 'free':
        return '무료';
      case 'premium':
        return '프리미엄';
      case 'paid':
        return subscription.plan?.name || '유료';
      default:
        return '알 수 없음';
    }
  };

  const refreshSubscription = fetchSubscription;

  return {
    loading,
    subscription,
    availablePlans,
    hasFeatureAccess,
    checkSubscriptionRequired,
    isSubscriptionActive,
    isPremiumUser,
    isLifetimeUser,
    isFreeUser,
    getSubscriptionLabel,
    refreshSubscription,
    fetchSubscription,
  };
}