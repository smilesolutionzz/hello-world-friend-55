import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Target, Award, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StatData {
  totalTests: number;
  averageScore: number;
  highestScore: number;
  latestLevel: number;
  latestLevelName: string;
  categoryAverages: Record<string, number>;
  scoreHistory: Array<{
    date: string;
    score: number;
  }>;
}

export default function LifeAchievementStats() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<StatData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "로그인 필요",
          description: "통계를 보려면 로그인이 필요합니다.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('life_achievement_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        setStats(null);
        setLoading(false);
        return;
      }

      // 통계 계산
      const totalTests = data.length;
      const averageScore = Math.round(
        data.reduce((sum, r) => sum + r.total_score, 0) / totalTests
      );
      const highestScore = Math.max(...data.map(r => r.total_score));
      const latest = data[data.length - 1];

      // 카테고리별 평균
      const categoryTotals: Record<string, { sum: number; count: number }> = {};
      data.forEach(result => {
        Object.entries(result.category_scores).forEach(([cat, data]: [string, any]) => {
          if (!categoryTotals[cat]) {
            categoryTotals[cat] = { sum: 0, count: 0 };
          }
          categoryTotals[cat].sum += data.percentage;
          categoryTotals[cat].count += 1;
        });
      });

      const categoryAverages: Record<string, number> = {};
      Object.entries(categoryTotals).forEach(([cat, totals]) => {
        categoryAverages[cat] = Math.round(totals.sum / totals.count);
      });

      // 점수 히스토리
      const scoreHistory = data.map(r => ({
        date: new Date(r.created_at).toLocaleDateString('ko-KR', {
          month: 'short',
          day: 'numeric'
        }),
        score: r.total_score
      }));

      setStats({
        totalTests,
        averageScore,
        highestScore,
        latestLevel: latest.level,
        latestLevelName: latest.level_name,
        categoryAverages,
        scoreHistory
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      toast({
        title: "로딩 실패",
        description: "통계를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">통계를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          돌아가기
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            나의 성장 통계
          </h1>
          <p className="text-muted-foreground">
            인생 업적 달성률 분석 리포트
          </p>
        </div>

        {!stats ? (
          <Card className="p-12 text-center">
            <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">아직 데이터가 없습니다</h3>
            <p className="text-muted-foreground mb-6">
              테스트를 진행하면 통계를 확인할 수 있습니다.
            </p>
            <Button onClick={() => navigate('/fun-tests')}>
              테스트 시작하기
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* 주요 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">총 테스트 횟수</span>
                </div>
                <div className="text-3xl font-bold">{stats.totalTests}회</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-muted-foreground">평균 점수</span>
                </div>
                <div className="text-3xl font-bold text-blue-500">{stats.averageScore}점</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-muted-foreground">최고 점수</span>
                </div>
                <div className="text-3xl font-bold text-yellow-500">{stats.highestScore}점</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-muted-foreground">현재 레벨</span>
                </div>
                <div className="text-2xl font-bold text-green-500">
                  Lv.{stats.latestLevel} {stats.latestLevelName}
                </div>
              </Card>
            </div>

            {/* 점수 추이 그래프 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">점수 추이</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.scoreHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* 카테고리별 평균 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">영역별 평균 달성률</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(stats.categoryAverages).map(([category, avg]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category}</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        {avg}%
                      </span>
                    </div>
                    <Progress value={avg} className="h-3" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
