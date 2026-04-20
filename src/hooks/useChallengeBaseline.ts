import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BaselineInput {
  testType: string;
  testId?: string;
  scores?: Record<string, number | string>;
  riskAreas?: string[];
  strengthAreas?: string[];
  recommendedFocus?: string;
}

/**
 * 검사 결과 표시 시점에 자동으로 challenge_baselines에 저장.
 * 동일 user+testType은 24시간 내 1회만 저장 (중복 방지).
 * 비로그인이면 silent skip.
 */
export const useChallengeBaseline = (input: BaselineInput | null | undefined) => {
  const savedRef = useRef(false);

  useEffect(() => {
    if (!input || !input.testType || savedRef.current) return;

    const save = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 24시간 내 동일 testType baseline 중복 체크
        const { data: existing } = await supabase
          .from('challenge_baselines')
          .select('id')
          .eq('user_id', user.id)
          .eq('source_test_type', input.testType)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .limit(1);

        if (existing && existing.length > 0) {
          savedRef.current = true;
          return;
        }

        await supabase.from('challenge_baselines').insert({
          user_id: user.id,
          source_test_type: input.testType,
          source_test_id: input.testId || null,
          baseline_scores: (input.scores || {}) as any,
          risk_areas: input.riskAreas || [],
          strength_areas: input.strengthAreas || [],
          recommended_focus: input.recommendedFocus || null,
        });
        savedRef.current = true;
      } catch (e) {
        // silent — 챌린지 baseline 저장 실패가 결과 표시를 막지 않도록
        console.warn('[challenge-baseline] save skipped:', e);
      }
    };

    save();
  }, [input?.testType, input?.testId]);
};
