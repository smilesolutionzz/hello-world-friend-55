import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * 사용자의 검사/리포트 크레딧 및 구독 상태를 확인하는 훅
 * 결제 플로우에서 접근 권한 판단에 사용
 */
export function useAccessControl() {
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [reportCredits, setReportCredits] = useState(0);
  const [testCredits, setTestCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsSubscriber(false);
        setReportCredits(0);
        setTestCredits(0);
        setUserId(null);
        return;
      }
      setUserId(user.id);

      // 구독 상태 확인
      const { data: subs } = await supabase
        .from('user_subscriptions')
        .select('id, current_period_end')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('current_period_end', new Date().toISOString().split('T')[0])
        .limit(1);

      setIsSubscriber(!!subs && subs.length > 0);

      // 리포트 크레딧 확인
      const { data: rCredits } = await supabase
        .from('user_report_credits')
        .select('credits, used_credits')
        .eq('user_id', user.id);

      const availableReports = (rCredits || []).reduce(
        (sum, c) => sum + (c.credits - c.used_credits),
        0
      );
      setReportCredits(Math.max(0, availableReports));

      // 검사 크레딧 확인
      const { data: tCredits } = await supabase
        .from('user_test_credits' as any)
        .select('credits, used_credits')
        .eq('user_id', user.id);

      const availableTests = ((tCredits as any[]) || []).reduce(
        (sum: number, c: any) => sum + (c.credits - c.used_credits),
        0
      );
      setTestCredits(Math.max(0, availableTests));
    } catch (err) {
      console.error('Access control check failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** 사용자가 프리미엄 기능에 접근 가능한지 */
  const canAccessPremium = isSubscriber || reportCredits > 0;

  /** 사용자가 검사에 접근 가능한지 */
  const canAccessTest = isSubscriber || testCredits > 0;

  /** 리포트 크레딧 1회 사용 */
  const useReportCredit = useCallback(async (): Promise<boolean> => {
    if (isSubscriber) return true; // 구독자는 무제한
    if (!userId || reportCredits <= 0) return false;

    const { data: credits } = await supabase
      .from('user_report_credits')
      .select('id, credits, used_credits')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    const available = (credits || []).find(c => c.used_credits < c.credits);
    if (!available) return false;

    const { error } = await supabase
      .from('user_report_credits')
      .update({ 
        used_credits: available.used_credits + 1,
        used_at: new Date().toISOString()
      })
      .eq('id', available.id);

    if (!error) {
      setReportCredits(prev => Math.max(0, prev - 1));
      return true;
    }
    return false;
  }, [userId, reportCredits, isSubscriber]);

  /** 검사 크레딧 1회 사용 */
  const useTestCredit = useCallback(async (): Promise<boolean> => {
    if (isSubscriber) return true; // 구독자는 무제한
    if (!userId || testCredits <= 0) return false;

    const { data: credits } = await supabase
      .from('user_test_credits' as any)
      .select('id, credits, used_credits')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    const available = ((credits as any[]) || []).find((c: any) => c.used_credits < c.credits);
    if (!available) return false;

    const { error } = await supabase
      .from('user_test_credits' as any)
      .update({ 
        used_credits: available.used_credits + 1,
        used_at: new Date().toISOString()
      } as any)
      .eq('id', available.id);

    if (!error) {
      setTestCredits(prev => Math.max(0, prev - 1));
      return true;
    }
    return false;
  }, [userId, testCredits, isSubscriber]);

  return {
    isSubscriber,
    reportCredits,
    testCredits,
    canAccessPremium,
    canAccessTest,
    loading,
    userId,
    refresh,
    useReportCredit,
    useTestCredit,
  };
}
