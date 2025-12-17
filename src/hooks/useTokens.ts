import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthGuard } from './useAuthGuard';
import { isBetaTestPeriod } from '@/utils/betaTest';

export function useTokens() {
  const [loading, setLoading] = useState(true);
  const [tokenBalance, setTokenBalance] = useState<any>(null);
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

  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [user?.id]);

  return {
    loading,
    balance: tokenBalance,
    tokenBalance,
    fetchBalance,
    refreshTokenBalance: fetchBalance,
    consumeTokens: async (amount: number) => {
      if (!user || !tokenBalance) return false;
      
      // 베타테스트 기간 중에는 캐시 소비하지 않음
      if (isBetaTestPeriod()) {
        console.log(`🎉 Beta Test: Cash consumption skipped (${amount} cash)`);
        return true;
      }
      
      const newBalance = tokenBalance.current_tokens - amount;
      if (newBalance < 0) return false;

      try {
        // 캐시 소진 및 사용량 업데이트
        const { error } = await supabase
          .from('user_tokens')
          .update({
            current_tokens: newBalance,
            total_used: (tokenBalance.total_used || 0) + amount
          })
          .eq('user_id', user.id);

        if (error) throw error;

        // 사용량 추적 기록
        await supabase
          .from('usage_tracking')
          .insert({
            user_id: user.id,
            feature_type: 'token_consumption',
            usage_date: new Date().toISOString().split('T')[0],
            count: amount
          });
        
        // 캐시 잔액 실시간 새로고침
        setTimeout(() => {
          fetchBalance();
        }, 500);
        console.log(`캐시 소진 완료: ${amount}캐시, 잔액: ${newBalance}`);
        return true;
      } catch (error) {
        console.error('Error consuming cash:', error);
        return false;
      }
    },
    checkTokenAvailability: (amount: number) => {
      // 베타테스트 기간 중에는 항상 true 반환
      if (isBetaTestPeriod()) {
        console.log('🎉 Beta Test: Cash availability check bypassed');
        return true;
      }
      
      // 로딩 중이거나 캐시 정보가 없으면 false 반환
      if (loading || !tokenBalance) {
        console.log(`🔍 Cash Check: Loading=${loading}, TokenBalance=${!!tokenBalance}`);
        return false;
      }
      
      // 현재 캐시가 요구 캐시보다 많거나 같으면 true
      const hasEnough = tokenBalance.current_tokens >= amount;
      console.log(`💰 Cash Check: 보유 ${tokenBalance.current_tokens}, 필요 ${amount}, 충분: ${hasEnough}`);
      return hasEnough;
    }
  };
}