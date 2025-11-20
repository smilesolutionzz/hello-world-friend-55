import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface LeaderboardEntry {
  user_id: string;
  total_points: number;
  story_points: number;
  challenge_points: number;
  reversal_points: number;
  current_rank: number;
  streak_days: number;
}

interface GrowthLeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export function GrowthLeaderboard({ entries, currentUserId }: GrowthLeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) return "default";
    if (rank <= 10) return "outline";
    return "secondary";
  };

  const maxPoints = Math.max(...entries.map(e => e.total_points), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          성장 랭킹
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map((entry, index) => {
          const isCurrentUser = entry.user_id === currentUserId;
          
          return (
            <div
              key={entry.user_id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isCurrentUser 
                  ? 'bg-primary/10 border-2 border-primary/20' 
                  : 'bg-muted/30 hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-center w-8 h-8">
                {getRankIcon(entry.current_rank || index + 1)}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {isCurrentUser ? '나' : `사용자 ${entry.user_id.substring(0, 8)}`}
                  </span>
                  <Badge variant={getRankBadge(entry.current_rank || index + 1)} className="text-xs">
                    {entry.current_rank || index + 1}위
                  </Badge>
                  {entry.streak_days > 0 && (
                    <Badge variant="outline" className="text-xs">
                      🔥 {entry.streak_days}일 연속
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(entry.total_points / maxPoints) * 100} 
                    className="flex-1 h-2"
                  />
                  <span className="text-sm font-medium text-primary">
                    {entry.total_points}P
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>📚 {entry.story_points}</span>
                  <span>🎯 {entry.challenge_points}</span>
                  <span>✨ {entry.reversal_points}</span>
                </div>
              </div>
            </div>
          );
        })}
        
        {entries.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>아직 랭킹 데이터가 없습니다</p>
            <p className="text-sm">첫 번째 스토리를 공유해보세요!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}