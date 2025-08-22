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

    try {
      const { data, error } = await supabase
        .from('user_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching token balance:', error);
        return;
      }

      setTokenBalance(data || { current_tokens: 0, total_purchased: 0, total_used: 0 });
    } catch (error) {
      console.error('Error fetching token balance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [user]);

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
        const { error } = await supabase
          .from('user_tokens')
          .update({
            current_tokens: newBalance,
            total_used: tokenBalance.total_used + amount
          })
          .eq('user_id', user.id);

        if (error) throw error;
        
        await fetchBalance();
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