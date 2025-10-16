import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Trophy, TrendingUp, Medal } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  best_score: number;
  total_tests: number;
  improvement: number;
  is_current_user?: boolean;
}

export default function Leaderboard({ userId }: { userId?: string }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekRange, setWeekRange] = useState('');

  useEffect(() => {
    loadLeaderboard();
  }, [userId]);

  const loadLeaderboard = async () => {
    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      setWeekRange(`${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`);

      const { data, error } = await supabase
        .from('life_achievement_leaderboard')
        .select('*')
        .gte('week_start', weekStart.toISOString().split('T')[0])
        .order('best_score', { ascending: false })
        .limit(50);

      if (error) throw error;

      const rankedData = data?.map((entry, index) => ({
        ...entry,
        rank: index + 1,
        is_current_user: userId ? entry.user_id === userId : false
      })) || [];

      setEntries(rankedData);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-orange-600" />;
    return null;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4 animate-pulse">
          <div className="h-6 w-48 bg-secondary rounded" />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-secondary/50 rounded" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <Trophy className="h-6 w-6 text-primary" />
          주간 리더보드
        </h3>
        <p className="text-sm text-muted-foreground">{weekRange}</p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">아직 참여자가 없습니다</p>
          <p className="text-sm text-muted-foreground mt-2">
            첫 번째 참여자가 되어보세요!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={entry.user_id}
              className={`p-4 rounded-lg transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-left-4 ${
                entry.is_current_user
                  ? 'bg-gradient-to-r from-primary/10 to-purple-500/10 border-2 border-primary'
                  : 'bg-gradient-to-r from-background to-secondary/20'
              } ${entry.rank <= 3 ? 'border-2 border-yellow-500/30' : ''}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                {/* 순위 */}
                <div className="flex-shrink-0 w-12 text-center">
                  {entry.rank <= 3 ? (
                    getMedalIcon(entry.rank)
                  ) : (
                    <span className="text-2xl font-bold text-muted-foreground">
                      #{entry.rank}
                    </span>
                  )}
                </div>

                {/* 정보 */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {entry.is_current_user ? '나' : `익명 ${entry.rank}`}
                      </span>
                      {entry.improvement > 0 && (
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-600 text-xs rounded-full flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          +{entry.improvement}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        {entry.best_score}점
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {entry.total_tests}회 참여
                      </div>
                    </div>
                  </div>
                  <Progress value={entry.best_score} className="h-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {userId && !entries.find(e => e.is_current_user) && (
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-sm text-center">
            이번 주에 테스트를 완료하고 리더보드에 참여해보세요! 🎯
          </p>
        </div>
      )}
    </Card>
  );
}
