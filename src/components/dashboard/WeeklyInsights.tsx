import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Heart,
  Brain,
  Users
} from "lucide-react";

interface WeeklyInsightsProps {
  totalActivities: number;
  averageScore: number;
  trendDirection: 'up' | 'down' | 'stable';
  weeklyGoal?: number;
}

export function WeeklyInsights({ 
  totalActivities, 
  averageScore, 
  trendDirection,
  weeklyGoal = 5 
}: WeeklyInsightsProps) {
  const progress = Math.min((totalActivities / weeklyGoal) * 100, 100);

  const getTrendColor = () => {
    switch (trendDirection) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <BarChart3 className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">이번 주 인사이트</h3>
      </div>

      <div className="space-y-4">
        {/* 주간 목표 진행률 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">주간 활동 목표</span>
            <Badge variant={progress >= 100 ? 'default' : 'secondary'}>
              {totalActivities}/{weeklyGoal}
            </Badge>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            목표까지 {Math.max(0, weeklyGoal - totalActivities)}개 남음
          </p>
        </div>

        {/* 평균 점수 */}
        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-sm">평균 웰빙 점수</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{averageScore}</span>
            {getTrendIcon()}
          </div>
        </div>

        {/* 추천사항 */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI 추천</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {progress < 50 
              ? "더 많은 활동으로 정신건강을 관리해보세요!"
              : progress >= 100 
              ? "훌륭해요! 꾸준한 관리가 이어지고 있어요."
              : "좋은 페이스입니다. 조금만 더 노력해보세요!"
            }
          </p>
        </div>
      </div>
    </Card>
  );
}