import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, TrendingUp, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export const PreventionScorePreview = () => {
  const [loading, setLoading] = useState(true);
  const [scoreData, setScoreData] = useState<{ score: number; level: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLatestScore();
  }, []);

  const fetchLatestScore = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('wellness_prevention_scores')
        .select('score, score_level')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setScoreData({ score: data.score as number, level: data.score_level as string });
      }
    } catch (error) {
      console.error('Error fetching prevention score preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (level: string) => {
    switch (level) {
      case '우수': return 'text-green-600';
      case '양호': return 'text-blue-600';
      case '주의': return 'text-amber-600';
      case '위험': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">예방 건강 점수</h3>
            <p className="text-sm text-muted-foreground">AI 기반 건강 예측 시스템</p>
          </div>
        </div>
        {scoreData && (
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(scoreData.level)}`}>
              {scoreData.score}
            </div>
            <div className="text-xs text-muted-foreground">{scoreData.level}</div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2 text-sm">
          <Activity className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-muted-foreground">
            "건강은 사라지지 않는 수요이며, 이것은 유행이 아니라 본능입니다."
          </p>
        </div>

        <Button 
          onClick={() => navigate('/dashboard')}
          className="w-full group"
          variant="outline"
        >
          <span>상세 분석 보기</span>
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  );
};
