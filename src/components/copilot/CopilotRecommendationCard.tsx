import { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, Star, FileText, UserRound, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import {
  calculateExpertPricing,
  EXPERT_BASE_PRICE,
  formatKRW,
} from '@/lib/expertPricing';

const REPORT_INTERPRETATION_BASE = 19500; // 30분 = 시간권 0.5h (시간당 ₩39,000)

interface MatchedExpert {
  id: string;
  full_name: string;
  professional_title?: string | null;
  specializations?: string[] | null;
  years_experience?: number | null;
  average_rating?: number | null;
  profile_image_url?: string | null;
  matchScore?: number;
}

interface CopilotRecommendationCardProps {
  recommendedTrack: string | null;
  recommendedRoute: string | null;
  recommendedMessage: string | null;
  summary: string | null;
  concerns: string[] | null;
  severity: string | null;
  onNavigated: () => void;
}

export const CopilotRecommendationCard = ({
  recommendedTrack,
  recommendedRoute,
  recommendedMessage,
  summary,
  concerns,
  severity,
  onNavigated,
}: CopilotRecommendationCardProps) => {
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  const [experts, setExperts] = useState<MatchedExpert[]>([]);
  const [loading, setLoading] = useState(true);

  // 전문가 상담료
  const consultationPricing = calculateExpertPricing(subscription, EXPERT_BASE_PRICE);
  // 리포트 해석료 (동일 할인율 적용)
  const reportPricing = calculateExpertPricing(subscription, REPORT_INTERPRETATION_BASE);
  const hasDiscount = consultationPricing.discountPercent > 0;

  useEffect(() => {
    let cancelled = false;
    const concernText =
      summary ||
      (concerns && concerns.length > 0 ? concerns.join(', ') : '') ||
      '심리 상담이 필요한 상황';

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('match-consultation-expert', {
          body: { concernText, triggerSource: 'manual' },
        });
        if (cancelled) return;
        if (!error && data?.experts) {
          setExperts((data.experts as MatchedExpert[]).slice(0, 2));
        }
      } catch (e) {
        console.warn('[copilot] expert match failed', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [summary, concerns?.join('|')]);

  const goToExpert = (expertId?: string) => {
    if (expertId) {
      navigate(`/expert-hiring?expertId=${expertId}`);
    } else {
      navigate('/expert-hiring');
    }
    onNavigated();
  };

  const goToTrack = () => {
    if (recommendedRoute) {
      navigate(recommendedRoute);
    } else {
      navigate('/mind-track');
    }
    onNavigated();
  };

  return (
    <div className="ml-8 mt-2 rounded-xl border border-primary/40 bg-gradient-to-br from-primary/15 to-purple-500/10 p-3 space-y-3">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
        <Sparkles className="w-3 h-3" />
        대화 내용을 바탕으로 추천드려요
      </div>

      {recommendedMessage && (
        <p className="text-xs text-white/80 leading-relaxed">{recommendedMessage}</p>
      )}

      {/* Primary CTA: 30일 트랙 또는 긴급 전문가 */}
      <button
        onClick={goToTrack}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-gradient-to-r from-primary to-purple-600 text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-md"
      >
        {recommendedTrack === 'expert_urgent' ? '🚨 긴급 전문가 연결' : '✨ 30일 마음 트랙 시작'}
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {/* 가격 카드 */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-2.5 space-y-2">
        <div className="text-[10px] font-bold text-white/60 uppercase tracking-wide">
          1:1 전문가 상담 안내
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md bg-white/5 p-2">
            <div className="flex items-center gap-1 text-[10px] text-white/50 mb-0.5">
              <UserRound className="w-2.5 h-2.5" />
              전문가 상담
            </div>
            {hasDiscount && (
              <div className="text-[9px] text-white/40 line-through leading-none">
                {formatKRW(consultationPricing.base)}
              </div>
            )}
            <div className="text-sm font-bold text-emerald-300 leading-tight">
              {formatKRW(consultationPricing.final)}
              <span className="text-[9px] text-white/50 font-normal">/40분</span>
            </div>
          </div>
          <div className="rounded-md bg-white/5 p-2">
            <div className="flex items-center gap-1 text-[10px] text-white/50 mb-0.5">
              <FileText className="w-2.5 h-2.5" />
              리포트 해석
            </div>
            {hasDiscount && (
              <div className="text-[9px] text-white/40 line-through leading-none">
                {formatKRW(reportPricing.base)}
              </div>
            )}
            <div className="text-sm font-bold text-emerald-300 leading-tight">
              {formatKRW(reportPricing.final)}
              <span className="text-[9px] text-white/50 font-normal">/건</span>
            </div>
          </div>
        </div>
        {hasDiscount ? (
          <div className="text-[10px] text-emerald-300 font-medium">
            ✓ {consultationPricing.label} 적용 중
          </div>
        ) : (
          <div className="text-[10px] text-amber-300/90 font-medium">
            💡 구독 시 월간 30%, 연간/평생 50% 할인
          </div>
        )}
      </div>

      {/* 실제 매칭된 전문가 미리보기 */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-white/60 uppercase tracking-wide">
          AIH 인증 매칭 전문가
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-3">
            <Loader2 className="w-4 h-4 animate-spin text-white/40" />
          </div>
        ) : experts.length === 0 ? (
          <button
            onClick={() => goToExpert()}
            className="w-full text-left text-[11px] text-white/60 hover:text-white py-2 px-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
          >
            전문가 전체 둘러보기 →
          </button>
        ) : (
          experts.map((ex) => (
            <button
              key={ex.id}
              onClick={() => goToExpert(ex.id)}
              className="w-full flex items-center gap-2 p-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 transition-all text-left"
            >
              {ex.profile_image_url ? (
                <img
                  src={ex.profile_image_url}
                  alt={ex.full_name}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <UserRound className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate">{ex.full_name}</span>
                  {ex.matchScore && (
                    <span className="text-[9px] font-semibold text-emerald-300 bg-emerald-500/10 px-1 py-0.5 rounded">
                      {ex.matchScore}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-white/50 truncate">
                  <span className="truncate">{ex.professional_title || '심리상담 전문가'}</span>
                  {ex.average_rating ? (
                    <span className="flex items-center gap-0.5 shrink-0">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      {ex.average_rating.toFixed(1)}
                    </span>
                  ) : null}
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-white/30 shrink-0" />
            </button>
          ))
        )}
        <button
          onClick={() => goToExpert()}
          className="w-full text-center text-[10px] text-primary/80 hover:text-primary py-1 font-medium"
        >
          전체 전문가 보기 →
        </button>
      </div>
    </div>
  );
};
