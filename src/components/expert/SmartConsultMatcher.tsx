import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MessageCircle, Video, Zap, Loader2, ExternalLink, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import { formatKRW } from '@/lib/expertPricing';

interface SmartConsultMatcherProps {
  defaultConcern?: string;
  triggerSource?: 'crisis_detected' | 'post_report' | 'subscription_d7' | 'manual';
  compact?: boolean;
}

interface MatchedExpert {
  id: string;
  full_name: string;
  professional_title: string;
  specializations: string[];
  years_experience: number;
  average_rating: number;
  hourly_rate: number;
  profile_image_url?: string;
  kakao_link?: string;
  matchScore: number;
  matchedSpecs: string[];
}

const OFFERING_PRICE: Record<string, { base: number; monthly: number; yearly: number; label: string; icon: any }> = {
  kakao_async: { base: 9900, monthly: 6900, yearly: 4900, label: '카톡 3일 비동기', icon: MessageCircle },
  urgent_zoom_15: { base: 19900, monthly: 13900, yearly: 9900, label: '15분 긴급 줌', icon: Zap },
  report_review_30: { base: 49000, monthly: 34300, yearly: 24500, label: '리포트 해석 30분', icon: Video },
  monthly_coaching: { base: 159000, monthly: 119000, yearly: 79000, label: '월 정기 코칭 (4회)', icon: Video },
};

export const SmartConsultMatcher = ({
  defaultConcern = '',
  triggerSource = 'manual',
  compact = false,
}: SmartConsultMatcherProps) => {
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  const [concern, setConcern] = useState(defaultConcern);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    matchId: string;
    category: string;
    severity: string;
    recommendedOffering: string;
    experts: MatchedExpert[];
  } | null>(null);

  const tier = subscription?.status === 'active'
    ? (subscription.is_lifetime || /year|연간|annual/i.test(subscription.plan?.name || '') ? 'yearly' : 'monthly')
    : 'none';

  const handleMatch = async () => {
    if (concern.trim().length < 5) {
      toast.error('고민을 5자 이상 입력해주세요');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('match-consultation-expert', {
        body: { concernText: concern, triggerSource },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || '매칭 실패');
      setResult(data);
    } catch (e: any) {
      toast.error(e.message || '매칭 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExpert = async (expert: MatchedExpert) => {
    if (result?.matchId) {
      await supabase
        .from('ai_consultation_matches')
        .update({ selected_expert_id: expert.id })
        .eq('id', result.matchId);
    }
    if (expert.kakao_link && result?.recommendedOffering === 'kakao_async') {
      window.open(expert.kakao_link, '_blank');
    } else {
      navigate(`/experts/${expert.id}?offering=${result?.recommendedOffering || ''}`);
    }
  };

  const offering = result ? OFFERING_PRICE[result.recommendedOffering] : null;
  const finalPrice = offering ? (tier === 'yearly' ? offering.yearly : tier === 'monthly' ? offering.monthly : offering.base) : 0;
  const Icon = offering?.icon || Sparkles;

  return (
    <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-lg">AI 전문가 매칭</h3>
          <p className="text-xs text-muted-foreground">고민 한 줄이면 가장 적합한 전문가 3명을 찾아드려요</p>
        </div>
      </div>

      {!result && (
        <div className="space-y-3">
          <Textarea
            placeholder="예: 요즘 잠을 못 자고 무기력해요. 직장에서 자꾸 실수하고 자존감이 낮아져요."
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
            rows={compact ? 2 : 3}
            className="resize-none"
          />
          <Button
            onClick={handleMatch}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> AI가 분석 중…</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> 맞춤 전문가 찾기</>
            )}
          </Button>
        </div>
      )}

      {result && offering && (
        <div className="space-y-4">
          {/* 추천 패키지 */}
          <div className="rounded-xl bg-white border-2 border-primary/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-primary" />
                <span className="font-semibold">추천: {offering.label}</span>
              </div>
              {result.severity === 'high' && (
                <Badge variant="destructive" className="text-xs">긴급</Badge>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              {tier !== 'none' && (
                <span className="text-sm text-muted-foreground line-through">{formatKRW(offering.base)}</span>
              )}
              <span className="text-2xl font-bold text-primary">{formatKRW(finalPrice)}</span>
              {tier !== 'none' && (
                <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                  {tier === 'yearly' ? '연간 구독자가' : '월간 구독자가'}
                </Badge>
              )}
            </div>
          </div>

          {/* 추천 전문가 3명 */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">매칭된 전문가</p>
            {result.experts.map((expert) => (
              <button
                key={expert.id}
                onClick={() => handleSelectExpert(expert)}
                className="w-full text-left rounded-lg border bg-white p-3 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{expert.full_name}</span>
                      <Badge variant="outline" className="text-[10px]">{expert.matchScore}% 적합</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {expert.professional_title} · 경력 {expert.years_experience}년
                    </p>
                    {expert.matchedSpecs.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {expert.matchedSpecs.slice(0, 3).map((s, i) => (
                          <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 ml-2">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs font-semibold">{expert.average_rating?.toFixed(1) || '4.5'}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground ml-2" />
                </div>
              </button>
            ))}
          </div>

          <Button variant="ghost" size="sm" onClick={() => setResult(null)} className="w-full">
            다시 매칭하기
          </Button>
        </div>
      )}
    </Card>
  );
};

export default SmartConsultMatcher;
