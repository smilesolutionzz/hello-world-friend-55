import React, { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertCircle, Sparkles, Target, Calendar, Lightbulb, Heart, Zap, Shield, type LucideIcon } from "lucide-react";
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { supabase } from "@/integrations/supabase/client";

interface Observation {
  id: string;
  score_overall: number;
  created_at: string;
  age_group: string;
  categoryScores?: { [key: string]: number };
}

interface AIInsightsProps {
  observations: Observation[];
}

interface CuratedInsight {
  type: 'trend' | 'strength' | 'concern' | 'action';
  title: string;
  content: string;
  icon: LucideIcon;
  color: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({ observations }) => {
  const [aiHealthInsights, setAiHealthInsights] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEnhancedData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // AI Health Insights 가져오기
        const { data: aiInsights } = await supabase
          .from('ai_health_insights')
          .select('insight_type, content, created_at')
          .eq('user_id', user.id)
          .order('generated_at', { ascending: false })
          .limit(5);

        // 상담 데이터 가져오기
        const { data: consultationData } = await supabase
          .from('consultations')
          .select('notes, created_at')
          .eq('patient_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        setAiHealthInsights(aiInsights || []);
        setConsultations(consultationData || []);
      } catch (error) {
        console.error('Error loading enhanced data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEnhancedData();
  }, []);

  const insights = useMemo(() => {
    if (observations.length === 0) {
      return {
        trend: 'stable',
        trendText: '데이터 없음',
        improvements: [] as string[],
        concerns: [] as string[],
        recommendations: [] as string[],
        nextCheckDate: null as Date | null,
        curatedInsights: [] as CuratedInsight[]
      };
    }

    const recent5 = observations.slice(0, 5);
    const scores = recent5.map(o => o.score_overall);
    
    // 추세 분석
    let trend = 'stable';
    let trendText = '안정적';
    if (scores.length >= 2) {
      const avgRecent = scores.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
      const avgOlder = scores.slice(2).reduce((a, b) => a + b, 0) / (scores.length - 2);
      const diff = avgRecent - avgOlder;
      
      if (diff > 5) {
        trend = 'improving';
        trendText = '개선 중';
      } else if (diff < -5) {
        trend = 'declining';
        trendText = '주의 필요';
      }
    }

    // 개선 영역
    const improvements: string[] = [];
    const concerns: string[] = [];
    
    if (recent5.length >= 2) {
      const latest = recent5[0];
      const previous = recent5[1];
      
      if (latest.categoryScores && previous.categoryScores) {
        Object.keys(latest.categoryScores).forEach(category => {
          const latestScore = latest.categoryScores![category];
          const prevScore = previous.categoryScores![category];
          
          if (latestScore > prevScore + 3) {
            improvements.push(category);
          } else if (latestScore < prevScore - 3) {
            concerns.push(category);
          }
        });
      }
    }

    // AI 생성 인사이트 활용
    const curatedInsights: CuratedInsight[] = [];

    // 1. 추세 기반 큐레이션
    if (trend === 'improving' && recent5.length >= 3) {
      const scoreImprovement = recent5[0].score_overall - recent5[recent5.length - 1].score_overall;
      curatedInsights.push({
        type: 'trend',
        title: '긍정적 성장 추세',
        content: `최근 ${recent5.length}회 검사에서 ${scoreImprovement.toFixed(1)}점의 개선을 보이고 있습니다. 현재의 접근 방식이 효과적이며, 이 패턴을 유지하면 더 큰 발전을 기대할 수 있습니다.`,
        icon: TrendingUp,
        color: 'text-green-500'
      });
    } else if (trend === 'declining') {
      curatedInsights.push({
        type: 'concern',
        title: '관심이 필요한 시점',
        content: '최근 검사 결과가 이전 대비 하락 추세를 보이고 있습니다. 일시적인 변화일 수 있으나, 생활 패턴이나 환경 변화를 점검해보시는 것을 권장합니다.',
        icon: AlertCircle,
        color: 'text-orange-500'
      });
    }

    // 2. AI Health Insights 통합
    if (aiHealthInsights.length > 0) {
      const latestAI = aiHealthInsights[0];
      const insightType = latestAI.insight_type as string;
      const content = latestAI.content as string;
      
      if (insightType === 'mood_analysis' && content) {
        curatedInsights.push({
          type: 'strength',
          title: '정서적 건강 분석',
          content: content.substring(0, 150) + '...',
          icon: Heart,
          color: 'text-pink-500'
        });
      }
      if (insightType === 'energy_boost' && content) {
        curatedInsights.push({
          type: 'action',
          title: '에너지 증진 제안',
          content: content.substring(0, 150) + '...',
          icon: Zap,
          color: 'text-yellow-500'
        });
      }
    }

    // 3. 상담 데이터 기반 인사이트
    if (consultations.length > 0) {
      const recentConsultation = consultations[0];
      const notes = recentConsultation.notes as string;
      const createdAt = recentConsultation.created_at as string;
      
      if (notes) {
        curatedInsights.push({
          type: 'action',
          title: '전문가 상담 요약',
          content: `${format(new Date(createdAt), 'M월 d일', { locale: ko })} 상담에서 논의된 내용을 지속적으로 실천해보세요. 전문가의 조언이 현재 상황 개선에 도움이 될 것입니다.`,
          icon: Lightbulb,
          color: 'text-purple-500'
        });
      }
    }

    // 4. 개선 영역 강조
    if (improvements.length > 0) {
      curatedInsights.push({
        type: 'strength',
        title: '두드러진 성장 영역',
        content: `${improvements.join(', ')} 영역에서 의미 있는 개선이 관찰되었습니다. 이러한 긍정적 변화는 노력의 결실이며, 다른 영역에도 좋은 영향을 미칠 수 있습니다.`,
        icon: Target,
        color: 'text-blue-500'
      });
    }

    // 5. 주의 영역 액션 플랜
    if (concerns.length > 0) {
      curatedInsights.push({
        type: 'action',
        title: '집중 관리 영역',
        content: `${concerns.join(', ')} 영역이 다른 영역 대비 낮은 점수를 보입니다. 전문가 상담이나 관련 프로그램 참여를 통해 체계적으로 접근하시면 좋은 결과를 얻을 수 있습니다.`,
        icon: Shield,
        color: 'text-red-500'
      });
    }

    // 6. 일반 추천사항
    const recommendations: string[] = [];
    if (trend === 'improving') {
      recommendations.push('현재의 긍정적인 추세를 유지하세요');
    } else if (trend === 'declining') {
      recommendations.push('전문가 상담을 고려해보세요');
    }
    
    if (observations.length > 0) {
      recommendations.push('정기적인 검사로 진행상황을 모니터링하세요');
    }

    // 다음 검사 제안일
    const lastCheckDate = new Date(observations[0].created_at);
    const nextCheckDate = new Date(lastCheckDate);
    nextCheckDate.setDate(nextCheckDate.getDate() + 30);

    return {
      trend,
      trendText,
      improvements,
      concerns,
      recommendations,
      nextCheckDate,
      curatedInsights
    };
  }, [observations, aiHealthInsights, consultations]);

  const getTrendColor = () => {
    switch (insights.trend) {
      case 'improving': return 'text-green-500';
      case 'declining': return 'text-orange-500';
      default: return 'text-blue-500';
    }
  };

  const getTrendIcon = () => {
    switch (insights.trend) {
      case 'improving': return <TrendingUp className="h-5 w-5" />;
      case 'declining': return <AlertCircle className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-[#0F1823] border-slate-800">
          <CardContent className="py-12 text-center text-slate-400">
            <Brain className="h-8 w-8 mx-auto mb-2 animate-pulse" />
            <p>AI 인사이트를 생성하는 중...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 큐레이션 헤더 */}
      <div className="bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-lg p-6 border border-primary/30">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/20 rounded-lg">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">
              맞춤형 AI 인사이트
            </h2>
            <p className="text-slate-300 text-sm">
              {observations.length}회의 검사 데이터{aiHealthInsights.length > 0 && `, ${aiHealthInsights.length}개의 AI 분석`}{consultations.length > 0 && `, ${consultations.length}건의 상담 기록`}을 종합하여 생성된 개인화 인사이트입니다.
            </p>
          </div>
        </div>
      </div>

      {/* 큐레이션된 인사이트 카드들 */}
      {insights.curatedInsights && insights.curatedInsights.length > 0 ? (
        <div className="space-y-4">
          {insights.curatedInsights.map((insight, idx) => {
            const Icon = insight.icon;
            return (
              <Card 
                key={idx} 
                className={`bg-[#0F1823] border-slate-800 hover:border-slate-700 transition-all duration-300 ${
                  insight.type === 'concern' ? 'border-l-4 border-l-orange-500' :
                  insight.type === 'strength' ? 'border-l-4 border-l-green-500' :
                  insight.type === 'action' ? 'border-l-4 border-l-blue-500' :
                  'border-l-4 border-l-purple-500'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      insight.type === 'concern' ? 'bg-orange-500/10' :
                      insight.type === 'strength' ? 'bg-green-500/10' :
                      insight.type === 'action' ? 'bg-blue-500/10' :
                      'bg-purple-500/10'
                    }`}>
                      <Icon className={`h-5 w-5 ${insight.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {insight.title}
                      </h3>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {insight.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-[#0F1823] border-slate-800">
          <CardContent className="py-12 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 mb-2">아직 충분한 데이터가 없습니다</p>
            <p className="text-slate-500 text-sm">검사를 진행하시면 개인화된 AI 인사이트를 제공해드립니다</p>
          </CardContent>
        </Card>
      )}

      {/* 빠른 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#0F1823] border-slate-800">
          <CardContent className="p-4 text-center">
            <div className={getTrendColor()}>
              {getTrendIcon()}
            </div>
            <p className="text-slate-400 text-xs mt-2">현재 추세</p>
            <p className={`text-lg font-semibold mt-1 ${getTrendColor()}`}>
              {insights.trendText}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1823] border-slate-800">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-green-500 mx-auto" />
            <p className="text-slate-400 text-xs mt-2">개선 영역</p>
            <p className="text-lg font-semibold text-white mt-1">
              {insights.improvements.length}개
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1823] border-slate-800">
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-6 w-6 text-orange-500 mx-auto" />
            <p className="text-slate-400 text-xs mt-2">주의 영역</p>
            <p className="text-lg font-semibold text-white mt-1">
              {insights.concerns.length}개
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1823] border-slate-800">
          <CardContent className="p-4 text-center">
            <Brain className="h-6 w-6 text-purple-500 mx-auto" />
            <p className="text-slate-400 text-xs mt-2">AI 분석</p>
            <p className="text-lg font-semibold text-white mt-1">
              {aiHealthInsights.length}건
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 다음 검사 제안 */}
      {insights.nextCheckDate && (
        <Card className="bg-[#0F1823] border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              다음 검사 제안
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300">
              권장 검사일: <span className="text-white font-medium">
                {format(insights.nextCheckDate, 'yyyy년 M월 d일 (E)', { locale: ko })}
              </span>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              정기적인 검사로 발달 과정을 체계적으로 관리하세요
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIInsights;
