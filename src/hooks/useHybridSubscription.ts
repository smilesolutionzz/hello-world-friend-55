import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'free' | 'token_pack' | 'monthly_unlimited';
  price_monthly?: number;
  price_yearly?: number;
  token_count?: number;
  features: any; // Json 타입 호환
  is_active: boolean;
}

interface UserSubscription {
  id: string;
  subscription_type: 'free' | 'token_pack' | 'monthly_unlimited';
  plan_id?: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  plan?: SubscriptionPlan;
}

interface UsageStats {
  assessment: number;
  analysis: number;
  consultation: number;
}

export function useHybridSubscription() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [usage, setUsage] = useState<UsageStats>({ assessment: 0, analysis: 0, consultation: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // 구독 플랜 목록 가져오기
  const fetchPlans = async () => {
    try {
      console.log('🔍 구독 플랜 가져오기 시작');
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) {
        console.error('❌ 구독 플랜 가져오기 에러:', error);
        throw error;
      }
      
      console.log('✅ 구독 플랜 데이터:', data);
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "플랜 로딩 오류",
        description: "구독 플랜을 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  // 사용자 구독 정보 가져오기
  const fetchUserSubscription = async () => {
    try {
      console.log('🔍 사용자 구독 정보 가져오기 시작');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ 사용자 인증 정보 없음');
        return;
      }

      console.log('✅ 사용자 인증됨:', user.id);

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ 구독 정보 가져오기 에러:', error);
        throw error;
      }
      
      console.log('✅ 사용자 구독 데이터:', data);
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast({
        title: "구독 정보 로딩 오류", 
        description: "구독 정보를 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  // 월간 사용량 가져오기
  const fetchUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const features = ['assessment', 'analysis', 'consultation'];
      const usagePromises = features.map(async (feature) => {
        const { data, error } = await supabase.rpc('get_monthly_usage', {
          p_user_id: user.id,
          p_feature_type: feature
        });
        
        if (error) throw error;
        return { [feature]: data || 0 };
      });

      const usageResults = await Promise.all(usagePromises);
      const combinedUsage = usageResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setUsage({
        assessment: combinedUsage.assessment || 0,
        analysis: combinedUsage.analysis || 0,
        consultation: combinedUsage.consultation || 0
      });
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  // 사용량 추적
  const trackUsage = async (featureType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.rpc('track_feature_usage', {
        p_user_id: user.id,
        p_feature_type: featureType
      });

      if (error) throw error;
      
      // 사용량 다시 가져오기
      await fetchUsage();
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  };

  // 기능 사용 가능 여부 확인
  const canUseFeature = (featureType: string): { allowed: boolean; reason?: string } => {
    if (!subscription) return { allowed: false, reason: '구독 정보를 불러오는 중입니다.' };

    const currentUsage = usage[featureType as keyof UsageStats] || 0;

    switch (subscription.subscription_type) {
      case 'free':
        if (featureType === 'assessment' && currentUsage >= 1) {
          return { allowed: false, reason: '무료 체험은 월 1회까지 가능합니다. 토큰팩 또는 구독을 구매해주세요.' };
        }
        if (featureType === 'analysis' || featureType === 'consultation') {
          return { allowed: false, reason: '이 기능은 유료 플랜에서만 사용 가능합니다.' };
        }
        return { allowed: true };

      case 'token_pack':
        // 토큰 확인 (기존 토큰 시스템 활용)
        return { allowed: true }; // 토큰 시스템에서 별도 체크

      case 'monthly_unlimited':
        return { allowed: true };

      default:
        return { allowed: false, reason: '구독 정보를 확인할 수 없습니다.' };
    }
  };

  // 추천 플랜 계산
  const getRecommendedPlan = () => {
    const totalMonthlyUsage = Object.values(usage).reduce((sum, count) => sum + count, 0);
    
    if (totalMonthlyUsage <= 3) {
      return plans.find(p => p.type === 'token_pack' && p.token_count === 10);
    } else if (totalMonthlyUsage <= 10) {
      return plans.find(p => p.type === 'token_pack' && p.token_count === 25);
    } else {
      return plans.find(p => p.type === 'monthly_unlimited');
    }
  };

  // 업그레이드 가이드
  const getUpgradeGuide = () => {
    if (!subscription || subscription.subscription_type === 'monthly_unlimited') return null;

    const totalUsage = Object.values(usage).reduce((sum, count) => sum + count, 0);
    
    if (subscription.subscription_type === 'free') {
      return {
        title: '더 많은 분석을 받아보세요',
        description: '무료 체험 후 토큰팩으로 시작하거나 무제한 플랜으로 업그레이드하세요.',
        recommendedPlan: getRecommendedPlan()
      };
    }

    if (subscription.subscription_type === 'token_pack' && totalUsage >= 15) {
      return {
        title: '월간 무제한 플랜을 추천드려요',
        description: '매월 15회 이상 사용하신다면 무제한 플랜이 더 경제적입니다.',
        recommendedPlan: plans.find(p => p.type === 'monthly_unlimited')
      };
    }

    return null;
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPlans(),
        fetchUserSubscription(),
        fetchUsage()
      ]);
      setLoading(false);
    };

    initializeData();
  }, []);

  return {
    subscription,
    plans,
    usage,
    loading,
    canUseFeature,
    trackUsage,
    getRecommendedPlan,
    getUpgradeGuide,
    refreshData: () => Promise.all([fetchUserSubscription(), fetchUsage()])
  };
}