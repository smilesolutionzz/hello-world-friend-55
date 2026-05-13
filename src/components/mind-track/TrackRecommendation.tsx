import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { recommendTracks, type RecommendResult } from '@/lib/mindTrackCategories';
import { MIND_TRACK_FOCUSES, type MindTrackFocusId } from '@/lib/mindTrackFocusTracks';

interface TrackRecommendationProps {
  userId?: string | null;
  selectedGoal: string | null;
  onSelect: (goalId: MindTrackFocusId) => void;
}

/**
 * AI 추천 트랙 섹션 — 검사 결과/온보딩 응답 기반 top3
 * 데이터 부족 시 자체적으로 숨김 (graceful degrade)
 */
const TrackRecommendation: React.FC<TrackRecommendationProps> = ({
  userId,
  selectedGoal,
  onSelect,
}) => {
  const [results, setResults] = useState<RecommendResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!userId) {
        setResults([]);
        setLoading(false);
        return;
      }
      try {
        const sb: any = supabase;
        const [obRes, scRes] = await Promise.all([
          sb
            .from('user_onboarding_data')
            .select('primary_goal, age_range, role')
            .eq('user_id', userId)
            .maybeSingle(),
          sb
            .from('mind_track_self_check_results')
            .select('goal_id, level')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10),
        ]);

        const onboarding = obRes?.data ?? {};
        const checks: { goal_id: string; level: string }[] = scRes?.data ?? [];

        // 위험 도메인 = level이 calm이 아닌 셀프체크의 goal_id
        const riskConcerns = Array.from(
          new Set(checks.filter((c) => c.level && c.level !== 'calm').map((c) => c.goal_id))
        );

        const profile = {
          riskConcerns,
          lifeStage: mapAgeRangeToLifeStage(onboarding.age_range),
          role: onboarding.role,
          primaryGoal: (onboarding.primary_goal ?? null) as MindTrackFocusId | null,
        };

        const recs = recommendTracks(profile, 3);
        if (alive) setResults(recs);
      } catch (e) {
        console.warn('[TrackRecommendation] failed', e);
        if (alive) setResults([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  if (loading || results.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm md:text-base font-bold text-slate-900">당신에게 맞는 트랙</h3>
        <span className="text-[10px] text-slate-400">검사·온보딩 응답 기반</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {results.map((rec) => {
          const focus = MIND_TRACK_FOCUSES.find((f) => f.id === rec.trackId);
          if (!focus) return null;
          const active = selectedGoal === focus.id;
          return (
            <button
              key={focus.id}
              type="button"
              onClick={() => onSelect(focus.id)}
              className={`text-left p-4 rounded-2xl border-2 transition-all ${
                active
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-xl">{focus.icon}</div>
                {active ? (
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                )}
              </div>
              <div className="font-semibold text-sm text-slate-900 mb-1">{focus.label}</div>
              <div className="text-[11px] text-slate-500 break-keep mb-2">{focus.desc}</div>
              {rec.reasons[0] && (
                <div className="text-[10px] text-blue-600 font-medium">· {rec.reasons[0]}</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

function mapAgeRangeToLifeStage(ageRange?: string): string | undefined {
  if (!ageRange) return undefined;
  const r = String(ageRange).toLowerCase();
  if (r.includes('10') || r.includes('20') || r.includes('teen') || r.includes('youth')) return 'youth';
  if (r.includes('30') || r.includes('40')) return 'worker';
  if (r.includes('50') || r.includes('60')) return 'midlife';
  if (r.includes('70') || r.includes('senior')) return 'senior';
  return undefined;
}

export default TrackRecommendation;
