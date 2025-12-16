import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, TrendingUp, TrendingDown, Minus, Brain, Lightbulb, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AIInsightSummaryProps {
  concerns: Array<{
    created_at: string;
    analysis_type: string;
    analysis_severity: string;
    concern_text: string;
  }>;
  assessments: Array<{
    completed_at: string;
    results?: any;
    risk_level?: string;
  }>;
}

interface InsightData {
  summary: string;
  trend: 'improving' | 'stable' | 'declining';
  keyInsights: string[];
  recommendations: string[];
}

export const AIInsightSummary: React.FC<AIInsightSummaryProps> = ({ concerns, assessments }) => {
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { toast } = useToast();

  const hasEnoughData = concerns.length >= 3 || assessments.length >= 2;

  const generateInsight = async () => {
    if (!hasEnoughData) return;
    
    setLoading(true);
    try {
      const recentConcerns = concerns.slice(0, 10).map(c => ({
        date: c.created_at,
        type: c.analysis_type,
        severity: c.analysis_severity,
        text: c.concern_text.substring(0, 100)
      }));

      const recentAssessments = assessments.slice(0, 5).map(a => ({
        date: a.completed_at,
        riskLevel: a.risk_level,
        score: a.results?.total_score || a.results?.predicted_score
      }));

      const { data, error } = await supabase.functions.invoke('generate-storage-insight', {
        body: { concerns: recentConcerns, assessments: recentAssessments }
      });

      if (error) throw error;

      setInsight(data);
      setHasGenerated(true);
    } catch (error) {
      console.error('AI 인사이트 생성 오류:', error);
      const localInsight = generateLocalInsight();
      setInsight(localInsight);
      setHasGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  const generateLocalInsight = (): InsightData => {
    const recentConcerns = concerns.slice(0, 10);
    const olderConcerns = concerns.slice(10, 20);
    
    const recentHighCount = recentConcerns.filter(c => c.analysis_severity === '높음').length;
    const olderHighCount = olderConcerns.filter(c => c.analysis_severity === '높음').length;
    
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (olderConcerns.length > 0) {
      const recentRatio = recentHighCount / Math.max(recentConcerns.length, 1);
      const olderRatio = olderHighCount / Math.max(olderConcerns.length, 1);
      if (recentRatio < olderRatio - 0.1) trend = 'improving';
      else if (recentRatio > olderRatio + 0.1) trend = 'declining';
    }

    const typeCount: Record<string, number> = {};
    recentConcerns.forEach(c => {
      typeCount[c.analysis_type] = (typeCount[c.analysis_type] || 0) + 1;
    });
    const topTypes = Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type);

    const keyInsights: string[] = [];
    if (topTypes.length > 0) {
      keyInsights.push(`최근 주요 고민 유형: ${topTypes.join(', ')}`);
    }
    if (trend === 'improving') {
      keyInsights.push('높은 심각도의 고민이 감소하는 긍정적 추세입니다');
    } else if (trend === 'declining') {
      keyInsights.push('심각도가 높은 고민이 증가하고 있어 주의가 필요합니다');
    }
    keyInsights.push(`총 ${concerns.length}개의 고민과 ${assessments.length}개의 검사 기록이 있습니다`);

    const recommendations = [
      '정기적인 기록을 통해 변화 패턴을 파악하세요',
      '심각도가 높은 고민은 전문가 상담을 고려해보세요',
      '검사 결과를 참고하여 맞춤형 관리 계획을 세워보세요'
    ];

    return {
      summary: trend === 'improving' 
        ? '전반적으로 긍정적인 변화가 관찰됩니다. 꾸준한 기록과 관리가 효과를 보이고 있어요!'
        : trend === 'declining'
          ? '최근 심각도가 높은 고민이 증가하고 있습니다. 적극적인 관리가 필요할 수 있어요.'
          : '안정적인 상태를 유지하고 있습니다. 꾸준한 기록을 통해 지속적으로 모니터링하세요.',
      trend,
      keyInsights,
      recommendations
    };
  };

  const trendConfig = {
    improving: { 
      icon: TrendingUp, 
      color: 'text-emerald-500', 
      bg: 'bg-gradient-to-br from-emerald-500/20 to-green-500/10',
      border: 'border-emerald-500/30',
      label: '긍정적 변화' 
    },
    declining: { 
      icon: TrendingDown, 
      color: 'text-rose-500', 
      bg: 'bg-gradient-to-br from-rose-500/20 to-red-500/10',
      border: 'border-rose-500/30',
      label: '주의 필요' 
    },
    stable: { 
      icon: Minus, 
      color: 'text-blue-500', 
      bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10',
      border: 'border-blue-500/30',
      label: '안정적' 
    }
  };

  if (!hasEnoughData) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
          <Brain className="w-8 h-8 text-primary/60" />
        </div>
        <h3 className="font-bold text-foreground mb-2">AI 인사이트 준비 중</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          더 정확한 분석을 위해 최소 3개의 고민 또는<br />2개의 검사 기록이 필요해요.
        </p>
        <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
          <span className="px-3 py-1.5 rounded-full bg-muted/50">고민 {concerns.length}개</span>
          <span className="px-3 py-1.5 rounded-full bg-muted/50">검사 {assessments.length}개</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-xl overflow-hidden h-full">
      {/* Header */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">AI 인사이트</h3>
              <p className="text-xs text-muted-foreground">맞춤형 분석 리포트</p>
            </div>
          </div>
          {hasGenerated && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={generateInsight}
              disabled={loading}
              className="rounded-xl hover:bg-muted/50"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <AnimatePresence mode="wait">
          {!hasGenerated ? (
            <motion.div 
              key="generate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center">
                <Wand2 className="w-10 h-10 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                AI가 당신의 기록을 분석하여<br />맞춤형 인사이트를 제공해드려요
              </p>
              <Button 
                onClick={generateInsight} 
                disabled={loading}
                className="rounded-2xl px-6 h-12 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg shadow-violet-500/25"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    인사이트 생성하기
                  </>
                )}
              </Button>
            </motion.div>
          ) : insight ? (
            <motion.div 
              key="insight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Trend Badge */}
              <div className={cn(
                "flex items-center gap-2.5 p-3.5 rounded-2xl border",
                trendConfig[insight.trend].bg,
                trendConfig[insight.trend].border
              )}>
                {React.createElement(trendConfig[insight.trend].icon, {
                  className: cn("w-5 h-5", trendConfig[insight.trend].color)
                })}
                <span className={cn("text-sm font-semibold", trendConfig[insight.trend].color)}>
                  {trendConfig[insight.trend].label}
                </span>
              </div>

              {/* Summary */}
              <p className="text-sm text-foreground leading-relaxed">
                {insight.summary}
              </p>

              {/* Key Insights */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  주요 발견
                </h4>
                <ul className="space-y-2">
                  {insight.keyInsights.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="p-4 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 rounded-2xl border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-amber-600">권장사항</span>
                </div>
                <ul className="space-y-1.5">
                  {insight.recommendations.slice(0, 2).map((rec, i) => (
                    <li key={i} className="text-xs text-muted-foreground leading-relaxed">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};