import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TokenBalance {
  current_tokens: number;
  total_purchased: number;
  total_used: number;
}

export interface TokenPlan {
  id: string;
  name: string;
  price: number;
  yearly_price: number;
  tokens_included: number;
  features: string[];
  popular: boolean;
}

export const useTokens = () => {
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTokenBalance();
  }, []);

  const loadTokenBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_tokens')
        .select('current_tokens, total_purchased, total_used')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setTokenBalance(data || { current_tokens: 0, total_purchased: 0, total_used: 0 });
    } catch (error: any) {
      console.error('Token balance loading error:', error);
      toast({
        title: "토큰 정보 로드 실패",
        description: "토큰 잔액을 불러올 수 없습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkTokenAvailability = (tokensNeeded: number): boolean => {
    return (tokenBalance?.current_tokens || 0) >= tokensNeeded;
  };

  const consumeTokens = async (featureType: string, tokensNeeded: number, featureId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('consume_tokens', {
      p_user_id: user.id,
      p_feature_type: featureType,
      p_tokens_needed: tokensNeeded,
      p_feature_id: featureId || null
    });

    if (error) throw error;

    const result = data as any;
    if (result?.success) {
      await loadTokenBalance(); // 토큰 잔액 새로고침
      return result;
    } else {
      throw new Error(result?.message || '토큰 소모 중 오류가 발생했습니다');
    }
  };

  return {
    tokenBalance,
    loading,
    checkTokenAvailability,
    consumeTokens,
    refreshTokenBalance: loadTokenBalance
  };
};