import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthGuard } from './useAuthGuard';
import { FREE_TRIAL_LIMITS } from '@/constants/tokenCosts';

export function useFreeTrial() {
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuthGuard();

  const fetchUsage = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('usage_tracking')
        .select('feature_type, count')
        .eq('user_id', user.id);

      if (error) {
        console.error('무료 체험 사용량 조회 오류:', error);
        return;
      }

      const counts: Record<string, number> = {};
      (data || []).forEach(row => {
        counts[row.feature_type] = (counts[row.feature_type] || 0) + row.count;
      });
      setUsageCounts(counts);
    } catch (error) {
      console.error('무료 체험 사용량 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const canUseFree = useCallback((featureKey: string): boolean => {
    const limit = FREE_TRIAL_LIMITS[featureKey];
    if (limit === undefined) return false;
    if (limit === -1) return true; // 무제한 무료

    const used = usageCounts[featureKey.toLowerCase()] || 0;
    return used < limit;
  }, [usageCounts]);

  const getRemainingTrials = useCallback((featureKey: string): number => {
    const limit = FREE_TRIAL_LIMITS[featureKey];
    if (limit === undefined) return 0;
    if (limit === -1) return Infinity;

    const used = usageCounts[featureKey.toLowerCase()] || 0;
    return Math.max(0, limit - used);
  }, [usageCounts]);

  const recordUsage = useCallback(async (featureKey: string) => {
    if (!user) return;
    
    try {
      await supabase.from('usage_tracking').insert({
        user_id: user.id,
        feature_type: featureKey.toLowerCase(),
        usage_date: new Date().toISOString().split('T')[0],
        count: 1,
      });
      
      // 로컬 상태 업데이트
      setUsageCounts(prev => ({
        ...prev,
        [featureKey.toLowerCase()]: (prev[featureKey.toLowerCase()] || 0) + 1,
      }));
    } catch (error) {
      console.error('사용량 기록 오류:', error);
    }
  }, [user]);

  return {
    loading,
    canUseFree,
    getRemainingTrials,
    recordUsage,
    refreshUsage: fetchUsage,
  };
}
