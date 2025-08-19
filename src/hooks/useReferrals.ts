import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserReferral {
  id: string;
  referral_code: string;
  status: 'pending' | 'completed' | 'cancelled';
  reward_tokens: number;
  reward_given: boolean;
  created_at: string;
  completed_at?: string;
}

export const useReferrals = () => {
  const [referrals, setReferrals] = useState<UserReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_referrals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals((data || []) as UserReferral[]);
    } catch (error: any) {
      console.error('Referrals loading error:', error);
      toast({
        title: "추천 내역 로드 실패",
        description: "추천 내역을 불러올 수 없습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = async (): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다');

      // First, check if user already has a pending referral code
      const { data: existingReferrals } = await supabase
        .from('user_referrals')
        .select('referral_code')
        .eq('status', 'pending')
        .eq('reward_given', false)
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingReferrals && existingReferrals.length > 0) {
        // Return existing referral code
        return existingReferrals[0].referral_code;
      }

      // Generate new referral code if none exists
      const { data, error } = await supabase.rpc('generate_referral_code', {
        p_referrer_user_id: user.id
      });

      if (error) throw error;

      await loadReferrals(); // Refresh the list
      return data;
    } catch (error: any) {
      console.error('Referral code generation error:', error);
      
      // If it's a duplicate key error, try to get the existing code
      if (error.code === '23505') {
        const { data: existingReferrals } = await supabase
          .from('user_referrals')
          .select('referral_code')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1);

        if (existingReferrals && existingReferrals.length > 0) {
          return existingReferrals[0].referral_code;
        }
      }
      
      toast({
        title: "추천 코드 생성 실패",
        description: error.message || "추천 코드를 생성할 수 없습니다.",
        variant: "destructive"
      });
      return null;
    }
  };

  const processReferralReward = async (referralCode: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다');

      const { data, error } = await supabase.rpc('process_referral_reward', {
        p_referral_code: referralCode,
        p_referred_user_id: user.id
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string; reward_tokens?: number };
      
      if (result.success) {
        toast({
          title: "추천 보상 지급 완료!",
          description: `${result.reward_tokens}개의 토큰이 추천인에게 지급되었습니다.`,
        });
        await loadReferrals();
        return true;
      } else {
        toast({
          title: "추천 코드 처리 실패",
          description: result.message,
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      console.error('Referral reward processing error:', error);
      toast({
        title: "추천 보상 처리 실패",
        description: error.message || "추천 보상을 처리할 수 없습니다.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    referrals,
    loading,
    generateReferralCode,
    processReferralReward,
    refreshReferrals: loadReferrals
  };
};