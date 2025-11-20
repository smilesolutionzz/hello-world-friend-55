import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, TrendingUp, Medal, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  best_score: number;
  total_tests: number;
  improvement: number;
  is_current_user?: boolean;
}

export default function LifeAchievementLeaderboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('life_achievement_leaderboard')
        .select('*')
        .eq('week_start', weekStartStr)
        .order('best_score', { ascending: false })
        .limit(50);

      if (error) throw error;

      const rankedData = (data || []).map((entry, index) => ({
        ...entry,
        rank: index + 1,
        is_current_user: user?.id === entry.user_id
      }));

      setLeaderboard(rankedData);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      toast({
        title: "로딩 실패",
        description: "리더보드를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-orange-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/10 to-gray-500/10 border-gray-400/30';
    if (rank === 3) return 'bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30';
    return 'bg-secondary/50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 space-y-4">
            <div className="h-8 w-48 bg-secondary/50 rounded animate-pulse" />
            <div className="h-4 w-64 bg-secondary/30 rounded animate-pulse" />
          </div>
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i} className="p-4 mb-3">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-secondary/50 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-secondary/50 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-secondary/30 rounded animate-pulse" />
                </div>
              </div>
            </Card>
          ))}
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

        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              이번 주 리더보드
            </h1>
          </div>
          <p className="text-muted-foreground">
            최고의 인생 업적 달성자들과 경쟁해보세요!
          </p>
        </div>

        {leaderboard.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">아직 기록이 없습니다</h3>
            <p className="text-muted-foreground mb-6">
              첫 번째 도전자가 되어보세요!
            </p>
            <Button onClick={() => navigate('/fun-tests')}>
              테스트 시작하기
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <Card 
                key={entry.user_id}
                className={`p-4 transition-all duration-300 hover:shadow-lg ${getRankBg(entry.rank)} ${
                  entry.is_current_user ? 'ring-2 ring-primary' : ''
                } animate-in fade-in slide-in-from-bottom-4`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold truncate">
                        {entry.is_current_user ? '나' : `사용자 ${entry.rank}`}
                      </span>
                      {entry.is_current_user && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                          나
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>테스트 {entry.total_tests}회</span>
                      {entry.improvement > 0 && (
                        <span className="flex items-center gap-1 text-green-500">
                          <TrendingUp className="h-3 w-3" />
                          +{entry.improvement}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      {entry.best_score}점
                    </div>
                    <div className="text-xs text-muted-foreground">최고 점수</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
