import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, TrendingUp, Shield, AlertTriangle, Heart, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface PreventionScore {
  preventionScore: number;
  scoreLevel: string;
  currentStatus: string;
  riskFactors: string[];
  predictions: {
    '1month': { score: number; status: string };
    '2months': { score: number; status: string };
    '3months': { score: number; status: string };
  };
  preventionTips: string[];
  keyMessage: string;
}

export const PreventionScoreDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [scoreData, setScoreData] = useState<PreventionScore | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPreventionScore();
  }, []);

  const fetchPreventionScore = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "로그인 필요",
          description: "예방 건강 점수를 확인하려면 로그인해주세요.",
          variant: "destructive",
        });
        return;
      }

      // 최근 점수 확인
      const { data: recentScore, error: fetchError } = await supabase
        .from('wellness_prevention_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // 최근 점수가 24시간 이내면 재사용
      if (recentScore && !fetchError) {
        const createdTime = new Date(recentScore.created_at as string).getTime();
        if (createdTime > Date.now() - 24 * 60 * 60 * 1000) {
          setScoreData({
            preventionScore: recentScore.score as number,
            scoreLevel: recentScore.score_level as string,
            currentStatus: recentScore.current_status as string,
            riskFactors: (recentScore.risk_factors as string[]) || [],
            predictions: (recentScore.predictions as any) || {},
            preventionTips: (recentScore.prevention_tips as string[]) || [],
            keyMessage: recentScore.key_message as string,
          });
          setLoading(false);
          return;
        }
      }

      // 새로운 분석 요청
      const { data, error } = await supabase.functions.invoke('wellness-prevention-score', {
        body: { userId: user.id }
      });

      if (error) throw error;

      setScoreData(data);
      toast({
        title: "분석 완료",
        description: "예방 건강 점수가 업데이트되었습니다.",
      });

    } catch (error) {
      console.error('Error fetching prevention score:', error);
      toast({
        title: "오류",
        description: "점수를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (level: string) => {
    switch (level) {
      case '우수': return 'text-green-600 bg-green-50 border-green-200';
      case '양호': return 'text-blue-600 bg-blue-50 border-blue-200';
      case '주의': return 'text-amber-600 bg-amber-50 border-amber-200';
      case '위험': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreIcon = (level: string) => {
    switch (level) {
      case '우수': return <Shield className="h-8 w-8 text-green-600" />;
      case '양호': return <Heart className="h-8 w-8 text-blue-600" />;
      case '주의': return <AlertTriangle className="h-8 w-8 text-amber-600" />;
      case '위험': return <AlertTriangle className="h-8 w-8 text-red-600" />;
      default: return <Activity className="h-8 w-8 text-gray-600" />;
    }
  };

  const chartData = scoreData ? [
    { month: '현재', score: scoreData.preventionScore, name: '현재 점수' },
    { month: '1개월', score: scoreData.predictions['1month'].score, name: scoreData.predictions['1month'].status },
    { month: '2개월', score: scoreData.predictions['2months'].score, name: scoreData.predictions['2months'].status },
    { month: '3개월', score: scoreData.predictions['3months'].score, name: scoreData.predictions['3months'].status },
  ] : [];

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">예방 건강 점수 분석 중...</span>
        </div>
      </Card>
    );
  }

  if (!scoreData) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">예방 건강 점수</h3>
          <p className="text-muted-foreground mb-4">
            AI가 여러분의 건강 데이터를 분석하여 예방 점수를 계산합니다.
          </p>
          <Button onClick={fetchPreventionScore}>
            <Activity className="mr-2 h-4 w-4" />
            분석 시작하기
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 핵심 메시지 */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">나탈리의 웰니스 철학</h3>
            <p className="text-sm text-muted-foreground italic">
              "건강은 사라지지 않는 수요이며, 이것은 유행이 아니라 본능입니다. 더 이상 의료인에게만 의존하지 말고, 
              내 몸은 내가 책임지는 예방의 시대를 맞이하세요."
            </p>
          </div>
        </div>
      </Card>

      {/* 예방 건강 점수 */}
      <Card className={`p-6 border-2 ${getScoreColor(scoreData.scoreLevel)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getScoreIcon(scoreData.scoreLevel)}
            <div>
              <h3 className="text-2xl font-bold">예방 건강 점수</h3>
              <p className="text-sm text-muted-foreground">AI 기반 예방의학 분석</p>
            </div>
          </div>
          <Badge variant="outline" className={`text-lg px-4 py-2 ${getScoreColor(scoreData.scoreLevel)}`}>
            {scoreData.scoreLevel}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 점수 표시 */}
          <div className="flex flex-col items-center justify-center p-6 bg-background rounded-lg">
            <div className="text-6xl font-bold mb-2" style={{ 
              color: scoreData.scoreLevel === '우수' ? '#16a34a' : 
                     scoreData.scoreLevel === '양호' ? '#2563eb' :
                     scoreData.scoreLevel === '주의' ? '#d97706' : '#dc2626'
            }}>
              {scoreData.preventionScore}
            </div>
            <div className="text-sm text-muted-foreground">/ 100점</div>
            <p className="text-center mt-4 text-sm">{scoreData.keyMessage}</p>
          </div>

          {/* 현재 상태 */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                현재 건강 상태
              </h4>
              <p className="text-sm text-muted-foreground">{scoreData.currentStatus}</p>
            </div>

            {scoreData.riskFactors.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  주의 필요 항목
                </h4>
                <ul className="space-y-1">
                  {scoreData.riskFactors.map((risk, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 3개월 예측 그래프 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          3개월 후 예상 건강 상태
        </h3>
        
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-lg shadow-lg p-3">
                      <p className="font-semibold">{payload[0].payload.month}</p>
                      <p className="text-sm text-primary">점수: {payload[0].value}</p>
                      <p className="text-xs text-muted-foreground">{payload[0].payload.name}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fill="url(#scoreGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>예방의 힘:</strong> 현재 생활 습관을 유지하면 3개월 후 예상 점수는{' '}
            <span className="font-bold">{scoreData.predictions['3months'].score}점</span>입니다.{' '}
            꾸준한 관리로 질병을 예방하세요!
          </p>
        </div>
      </Card>

      {/* 예방 팁 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          내 몸은 내가 책임진다 - 예방 가이드
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scoreData.preventionTips.map((tip, idx) => (
            <div key={idx} className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </div>
                <p className="text-sm text-green-800 dark:text-green-200 flex-1">{tip}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <Button onClick={fetchPreventionScore} variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            점수 새로고침
          </Button>
        </div>
      </Card>
    </div>
  );
};
