import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthGuard } from './useAuthGuard';
import { isBetaTestPeriod } from '@/utils/betaTest';

// Premium status cache to avoid circular dependency with useSubscription
let cachedPremiumStatus: boolean | null = null;
let premiumCheckPromise: Promise<boolean> | null = null;

async function checkPremiumStatus(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('subscription_type, is_lifetime, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (error || !data) return false;

    return data.subscription_type === 'premium' 
      || data.subscription_type === 'lifetime' 
      || data.is_lifetime === true;
  } catch {
    return false;
  }
}

export function useTokens() {
  const [loading, setLoading] = useState(true);
  const [tokenBalance, setTokenBalance] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const { user } = useAuthGuard();

  const fetchBalance = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_tokens')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('캐시 잔액 조회 오류:', error);
        return;
      }

      const newBalance = data || { current_tokens: 0, total_purchased: 0, total_used: 0, referral_bonus: 0 };
      setTokenBalance(newBalance);
      console.log('캐시 잔액 업데이트:', newBalance);
    } catch (error) {
      console.error('캐시 잔액 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check premium status
  useEffect(() => {
    if (user) {
      if (cachedPremiumStatus !== null) {
        setIsPremium(cachedPremiumStatus);
      }
      if (!premiumCheckPromise) {
        premiumCheckPromise = checkPremiumStatus(user.id);
      }
      premiumCheckPromise.then((status) => {
        cachedPremiumStatus = status;
        setIsPremium(status);
        premiumCheckPromise = null;
      });
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [user?.id]);

  const consumeTokens = useCallback(async (amount: number) => {
    // 무료 기능 (0 캐시)은 로그인 여부와 상관없이 통과
    if (amount === 0) return true;
    
    if (!user || !tokenBalance) return false;
    
    // 베타테스트 기간 중에는 캐시 소비하지 않음
    if (isBetaTestPeriod()) {
      console.log(`🎉 Beta Test: Cash consumption skipped (${amount} cash)`);
      return true;
    }

    // 프리미엄 구독자는 캐시 소비 없이 통과
    if (isPremium) {
      console.log(`👑 Premium User: Cash consumption skipped (${amount} cash)`);
      return true;
    }

    // 무료 기능 (0 캐시)은 그냥 통과
    if (amount === 0) return true;
    
    const newBalance = tokenBalance.current_tokens - amount;
    if (newBalance < 0) return false;

    try {
      const { error } = await supabase
        .from('user_tokens')
        .update({
          current_tokens: newBalance,
          total_used: (tokenBalance.total_used || 0) + amount
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await supabase
        .from('usage_tracking')
        .insert({
          user_id: user.id,
          feature_type: 'token_consumption',
          usage_date: new Date().toISOString().split('T')[0],
          count: amount
        });
      
      setTimeout(() => {
        fetchBalance();
      }, 500);
      console.log(`캐시 소진 완료: ${amount}캐시, 잔액: ${newBalance}`);
      return true;
    } catch (error) {
      console.error('Error consuming cash:', error);
      return false;
    }
  }, [user, tokenBalance, isPremium]);

  const checkTokenAvailability = useCallback((amount: number) => {
    // 베타테스트 기간 중에는 항상 true 반환
    if (isBetaTestPeriod()) {
      console.log('🎉 Beta Test: Cash availability check bypassed');
      return true;
    }

    // 프리미엄 구독자는 항상 true
    if (isPremium) {
      console.log('👑 Premium User: Cash availability check bypassed');
      return true;
    }

    // 무료 기능 (0 캐시)은 항상 true
    if (amount === 0) return true;
    
    // 로딩 중이거나 캐시 정보가 없으면 false 반환
    if (loading || !tokenBalance) {
      console.log(`🔍 Cash Check: Loading=${loading}, TokenBalance=${!!tokenBalance}`);
      return false;
    }
    
    const hasEnough = tokenBalance.current_tokens >= amount;
    console.log(`💰 Cash Check: 보유 ${tokenBalance.current_tokens}, 필요 ${amount}, 충분: ${hasEnough}`);
    return hasEnough;
  }, [loading, tokenBalance, isPremium]);

  return {
    loading,
    balance: tokenBalance,
    tokenBalance,
    fetchBalance,
    refreshTokenBalance: fetchBalance,
    isPremium,
    consumeTokens,
    checkTokenAvailability,
  };
}
