import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useReferrals = () => {
  const [referralCode, setReferralCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    referralCount: 0,
    totalTokensEarned: 0,
    myReferralCode: null as string | null
  });
  const [referrals, setReferrals] = useState<any[]>([]);
  const { toast } = useToast();

  // 추천 통계 불러오기
  const loadReferralStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('referral-system', {
        body: { action: 'getReferralStats' }
      });

      if (error) throw error;

      if (data.success) {
        setStats(data.stats);
        if (data.stats.myReferralCode) {
          setReferralCode(data.stats.myReferralCode);
        }
      }
    } catch (error) {
      console.error('Error loading referral stats:', error);
    }
  };

  // URL에서 추천 코드 감지하고 처리
  const processReferralFromUrl = async (code: string, user: any) => {
    if (!user) {
      // 로그인하지 않은 상태면 localStorage에 저장
      localStorage.setItem('pendingReferralCode', code);
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('referral-system', {
        body: { 
          action: 'applyCode',
          referralCode: code
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "추천 코드 적용 완료!",
          description: data.message,
        });
        // 통계 새로고침
        await loadReferralStats();
      } else {
        toast({
          title: "추천 코드 오류",
          description: data.error,
          variant: "destructive",
        });
      }
      
      // 처리된 코드는 localStorage에서 제거
      localStorage.removeItem('pendingReferralCode');
    } catch (error) {
      console.error('Error processing referral:', error);
      toast({
        title: "오류",
        description: "추천 코드 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReferralCode = async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('referral-system', {
        body: { action: 'generateCode' }
      });

      if (error) throw error;

      if (data.success) {
        setReferralCode(data.referralCode);
        // 통계 새로고침
        await loadReferralStats();
        return data.referralCode;
      }
      return null;
    } catch (error) {
      console.error('Error generating referral code:', error);
      toast({
        title: "오류",
        description: "추천 코드 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "링크 복사 완료!",
      description: "친구들에게 공유해보세요!",
    });
  };

  // 추천 코드 직접 입력 처리
  const applyReferralCode = async (code: string) => {
    try {
      setIsLoading(true);
      console.log('Applying referral code:', code);
      
      const { data, error } = await supabase.functions.invoke('referral-system', {
        body: { 
          action: 'applyCode',
          referralCode: code
        }
      });

      console.log('Referral response:', { data, error });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "추천 코드 적용 완료!",
          description: data.message,
        });
        // 통계 새로고침
        await loadReferralStats();
        return true;
      } else {
        toast({
          title: "추천 코드 오류",
          description: data.error,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error applying referral code:', error);
      toast({
        title: "오류",
        description: "추천 코드 적용 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 기존 API와 호환성을 위한 함수들
  const fetchReferrals = async () => {
    await loadReferralStats();
  };

  const trackReferral = async (code?: string) => {
    if (code) {
      return await applyReferralCode(code);
    }
  };

  const processReferralReward = async (code?: string) => {
    if (code) {
      return await applyReferralCode(code);
    }
  };

  return {
    referralCode,
    loading: isLoading,
    isLoading,
    stats,
    referrals: [], // 현재는 빈 배열로 유지, 필요시 나중에 구현
    processReferralFromUrl,
    generateReferralCode,
    copyReferralLink,
    applyReferralCode,
    loadReferralStats,
    fetchReferrals,
    trackReferral,
    processReferralReward,
  };
};