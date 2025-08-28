import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthGuard } from './useAuthGuard';

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
        console.error('토큰 잔액 조회 오류:', error);
        return;
      }

      const newBalance = data || { current_tokens: 0, total_purchased: 0, total_used: 0, referral_bonus: 0 };
      setTokenBalance(newBalance);
      console.log('토큰 잔액 업데이트:', newBalance);
    } catch (error) {
      console.error('토큰 잔액 조회 오류:', error);
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
      
      const newBalance = tokenBalance.current_tokens - amount;
      if (newBalance < 0) return false;

      try {
        // 토큰 소진 및 사용량 업데이트
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
        
        // 토큰 잔액 실시간 새로고침
        setTimeout(() => {
          fetchBalance();
        }, 500);
        console.log(`토큰 소진 완료: ${amount}토큰, 잔액: ${newBalance}`);
        return true;
      } catch (error) {
        console.error('Error consuming tokens:', error);
        return false;
      }
    },
    checkTokenAvailability: (amount: number) => {
      return tokenBalance ? tokenBalance.current_tokens >= amount : false;
    }
  };
}