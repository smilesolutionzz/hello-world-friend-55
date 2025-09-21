import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Trophy, Crown } from "lucide-react";

interface UserLevelDisplayProps {
  totalPoints: number;
  className?: string;
}

export const UserLevelDisplay = ({ totalPoints, className = "" }: UserLevelDisplayProps) => {
  // 레벨 계산 함수
  const calculateLevel = (points: number) => {
    if (points < 50) return { level: 1, title: "새싹", icon: Star, color: "text-green-600 bg-green-100" };
    if (points < 150) return { level: 2, title: "성장", icon: Star, color: "text-blue-600 bg-blue-100" };
    if (points < 300) return { level: 3, title: "발전", icon: Trophy, color: "text-purple-600 bg-purple-100" };
    if (points < 500) return { level: 4, title: "숙련", icon: Trophy, color: "text-orange-600 bg-orange-100" };
    if (points < 750) return { level: 5, title: "전문", icon: Crown, color: "text-red-600 bg-red-100" };
    return { level: 6, title: "마스터", icon: Crown, color: "text-yellow-600 bg-yellow-100" };
  };

  // 다음 레벨까지 필요한 포인트 계산
  const getNextLevelPoints = (level: number) => {
    const levelThresholds = [0, 50, 150, 300, 500, 750, 1000];
    return levelThresholds[level] || 1000;
  };

  const currentLevel = calculateLevel(totalPoints);
  const nextLevelPoints = getNextLevelPoints(currentLevel.level);
  const currentLevelMinPoints = getNextLevelPoints(currentLevel.level - 1);
  
  const progressToNextLevel = currentLevel.level === 6 
    ? 100 
    : ((totalPoints - currentLevelMinPoints) / (nextLevelPoints - currentLevelMinPoints)) * 100;

  const IconComponent = currentLevel.icon;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <Badge className={currentLevel.color}>
          <IconComponent className="w-4 h-4 mr-1" />
          레벨 {currentLevel.level} - {currentLevel.title}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {totalPoints}P / {currentLevel.level === 6 ? "MAX" : `${nextLevelPoints}P`}
        </span>
      </div>
      
      {currentLevel.level < 6 && (
        <div className="space-y-1">
          <Progress value={progressToNextLevel} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            다음 레벨까지 {nextLevelPoints - totalPoints}P 남음
          </p>
        </div>
      )}
      
      {currentLevel.level === 6 && (
        <p className="text-xs text-muted-foreground text-center font-medium">
          🎉 최고 레벨 달성! 축하합니다!
        </p>
      )}
    </div>
  );
};