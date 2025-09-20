import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Lightbulb, Zap, Heart, RefreshCw, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIInsight {
  id: string;
  insight_type: string;
  content: string;
  confidence_score: number;
  generated_at: string;
  is_read: boolean;
}

interface AIInsightsPanelProps {
  userId?: string;
  checkinData?: any;
  onInsightGenerated?: (insights: AIInsight[]) => void;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  userId,
  checkinData,
  onInsightGenerated
}) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const insightTypeConfig = {
    mood_analysis: { icon: Heart, label: '기분 분석', color: 'bg-pink-100 text-pink-700' },
    energy_boost: { icon: Zap, label: '에너지 관리', color: 'bg-yellow-100 text-yellow-700' },
    stress_relief: { icon: Brain, label: '스트레스 완화', color: 'bg-purple-100 text-purple-700' },
    daily_recommendation: { icon: Lightbulb, label: '오늘의 추천', color: 'bg-blue-100 text-blue-700' }
  };

  useEffect(() => {
    loadRecentInsights();
  }, []);

  const loadRecentInsights = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_health_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewInsights = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !checkinData) {
      toast({
        title: "데이터 부족",
        description: "인사이트 생성을 위해 체크인 데이터가 필요합니다.",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {

      // Call AI insights function
      const { data, error } = await supabase.functions.invoke('ai-health-insights', {
        body: {
          userId: user.id,
          checkinData,
          challengeHistory: [] // Could be passed as prop
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "AI 인사이트 생성 완료! 🎯",
          description: "개인맞춤 건강 인사이트가 생성되었습니다."
        });
        
        await loadRecentInsights();
        onInsightGenerated?.(data.insights);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "인사이트 생성 실패",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const markAsRead = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('ai_health_insights')
        .update({ is_read: true })
        .eq('id', insightId);

      if (!error) {
        setInsights(prev => prev.map(insight => 
          insight.id === insightId ? { ...insight, is_read: true } : insight
        ));
      }
    } catch (error) {
      console.error('Error marking insight as read:', error);
    }
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return { label: '높음', color: 'bg-green-100 text-green-700' };
    if (score >= 0.6) return { label: '보통', color: 'bg-yellow-100 text-yellow-700' };
    return { label: '낮음', color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-semibold">AI 건강 인사이트</h3>
        </div>
        <Button 
          onClick={generateNewInsights} 
          disabled={generating || !checkinData}
          variant="outline"
          size="sm"
        >
          {generating ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Brain className="w-4 h-4 mr-2" />
          )}
          {generating ? '분석 중...' : '새 인사이트 생성'}
        </Button>
      </div>

      {/* Insights Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : insights.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {insights.map(insight => {
            const config = insightTypeConfig[insight.insight_type as keyof typeof insightTypeConfig];
            const Icon = config?.icon || Lightbulb;
            const confidence = getConfidenceLabel(insight.confidence_score);

            return (
              <Card 
                key={insight.id}
                className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
                  !insight.is_read ? 'ring-2 ring-primary ring-opacity-20' : ''
                }`}
                onClick={() => !insight.is_read && markAsRead(insight.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-primary" />
                      <CardTitle className="text-sm font-medium">
                        {config?.label || insight.insight_type}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {!insight.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                      <Badge variant="secondary" className={confidence.color}>
                        {confidence.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.content}
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {new Date(insight.generated_at).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-8">
          <CardContent>
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              아직 AI 인사이트가 없습니다
            </p>
            <Button 
              onClick={generateNewInsights}
              disabled={!checkinData}
              variant="outline"
            >
              첫 번째 인사이트 생성하기
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};