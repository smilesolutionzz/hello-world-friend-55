import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, TrendingUp, TrendingDown, Minus, Brain, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  // 데이터가 충분한지 확인
  const hasEnoughData = concerns.length >= 3 || assessments.length >= 2;

  const generateInsight = async () => {
    if (!hasEnoughData) return;
    
    setLoading(true);
    try {
      // 최근 데이터 준비
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
      
      // 폴백: 로컬 분석
      const localInsight = generateLocalInsight();
      setInsight(localInsight);
      setHasGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  // 로컬 폴백 분석
  const generateLocalInsight = (): InsightData => {
    const recentConcerns = concerns.slice(0, 10);
    const olderConcerns = concerns.slice(10, 20);
    
    // 심각도 트렌드 분석
    const recentHighCount = recentConcerns.filter(c => c.analysis_severity === '높음').length;
    const olderHighCount = olderConcerns.filter(c => c.analysis_severity === '높음').length;
    
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (olderConcerns.length > 0) {
      const recentRatio = recentHighCount / Math.max(recentConcerns.length, 1);
      const olderRatio = olderHighCount / Math.max(olderConcerns.length, 1);
      if (recentRatio < olderRatio - 0.1) trend = 'improving';
      else if (recentRatio > olderRatio + 0.1) trend = 'declining';
    }

    // 주요 고민 유형 분석
    const typeCount: Record<string, number> = {};
    recentConcerns.forEach(c => {
      typeCount[c.analysis_type] = (typeCount[c.analysis_type] || 0) + 1;
    });
    const topTypes = Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type);

    // 인사이트 생성
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

  const TrendIcon = insight?.trend === 'improving' ? TrendingUp : insight?.trend === 'declining' ? TrendingDown : Minus;
  const trendColor = insight?.trend === 'improving' ? 'text-green-500' : insight?.trend === 'declining' ? 'text-red-500' : 'text-blue-500';
  const trendBg = insight?.trend === 'improving' ? 'bg-green-500/10' : insight?.trend === 'declining' ? 'bg-red-500/10' : 'bg-blue-500/10';

  if (!hasEnoughData) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6 text-center">
          <Brain className="w-12 h-12 mx-auto mb-3 text-primary/50" />
          <h3 className="font-semibold text-foreground mb-2">AI 인사이트를 준비 중이에요</h3>
          <p className="text-sm text-muted-foreground">
            더 정확한 분석을 위해 최소 3개의 고민 또는 2개의 검사 기록이 필요해요.
            <br />현재: 고민 {concerns.length}개, 검사 {assessments.length}개
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI 인사이트
          </CardTitle>
          {hasGenerated && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={generateInsight}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasGenerated ? (
          <div className="text-center py-6">
            <Brain className="w-12 h-12 mx-auto mb-3 text-primary" />
            <p className="text-sm text-muted-foreground mb-4">
              AI가 당신의 기록을 분석하여<br />맞춤형 인사이트를 제공해드려요
            </p>
            <Button onClick={generateInsight} disabled={loading}>
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
          </div>
        ) : insight ? (
          <div className="space-y-4">
            {/* 트렌드 배지 */}
            <div className={`flex items-center gap-2 p-3 rounded-lg ${trendBg}`}>
              <TrendIcon className={`w-5 h-5 ${trendColor}`} />
              <span className="text-sm font-medium">
                {insight.trend === 'improving' ? '긍정적 변화' : 
                 insight.trend === 'declining' ? '주의 필요' : '안정적'}
              </span>
            </div>

            {/* 요약 */}
            <p className="text-sm text-foreground leading-relaxed">
              {insight.summary}
            </p>

            {/* 주요 인사이트 */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                주요 발견
              </h4>
              <ul className="space-y-2">
                {insight.keyInsights.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 권장사항 */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span className="text-xs font-semibold">권장사항</span>
              </div>
              <ul className="space-y-1">
                {insight.recommendations.slice(0, 2).map((rec, i) => (
                  <li key={i} className="text-xs text-muted-foreground">• {rec}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
