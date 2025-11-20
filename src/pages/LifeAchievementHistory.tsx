import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Calendar, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface HistoryResult {
  id: string;
  total_score: number;
  level: number;
  level_name: string;
  category_scores: any;
  created_at: string;
}

export default function LifeAchievementHistory() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [results, setResults] = useState<HistoryResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "로그인 필요",
          description: "히스토리를 보려면 로그인이 필요합니다.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('life_achievement_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Failed to load history:', error);
      toast({
        title: "로딩 실패",
        description: "히스토리를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 9) return 'from-purple-500 to-pink-500';
    if (level >= 7) return 'from-blue-500 to-purple-500';
    if (level >= 5) return 'from-green-500 to-blue-500';
    if (level >= 3) return 'from-yellow-500 to-green-500';
    return 'from-orange-500 to-yellow-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">히스토리를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
            인생 업적 달성률 히스토리
          </h1>
          <p className="text-muted-foreground">
            나의 성장 과정을 확인해보세요
          </p>
        </div>

        {results.length === 0 ? (
          <Card className="p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50 animate-pulse" />
            <h3 className="text-xl font-semibold mb-2">아직 기록이 없습니다</h3>
            <p className="text-muted-foreground mb-6">
              첫 번째 테스트를 시작해보세요!
            </p>
            <Button 
              onClick={() => navigate('/fun-tests')}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
            >
              테스트 시작하기
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <Card 
                key={result.id} 
                className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${getLevelColor(result.level)} text-white shadow-lg animate-in zoom-in duration-300`}>
                        Lv.{result.level} {result.level_name}
                      </span>
                      {index === 0 && (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          최근
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(result.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      {result.total_score}점
                    </div>
                    <div className="text-sm text-muted-foreground">
                      총점
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(result.category_scores).map(([category, data]: [string, any]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{category}</span>
                        <span className="text-muted-foreground">{data.percentage}%</span>
                      </div>
                      <Progress value={data.percentage} className="h-2" />
                    </div>
                  ))}
                </div>

                {index > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-muted-foreground">
                        이전 대비: 
                        <span className={`ml-1 font-semibold ${
                          result.total_score > results[index - 1].total_score ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {result.total_score > results[index - 1].total_score ? '+' : ''}
                          {result.total_score - results[index - 1].total_score}점
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
