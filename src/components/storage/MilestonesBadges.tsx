import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Zap, Crown, Target, Award, Flame, Heart, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MilestonesBadgesProps {
  concernCount: number;
  assessmentCount: number;
  consecutiveDays?: number;
}

interface MilestoneConfig {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  target: number;
  type: 'concern' | 'assessment' | 'streak';
  color: string;
  bgColor: string;
}

const milestones: MilestoneConfig[] = [
  { id: 'first_concern', icon: Heart, title: '첫 고민', description: '첫 번째 고민을 기록했어요', target: 1, type: 'concern', color: 'text-pink-500', bgColor: 'bg-pink-500/20' },
  { id: 'concern_10', icon: Star, title: '기록의 시작', description: '10개의 고민을 기록했어요', target: 10, type: 'concern', color: 'text-yellow-500', bgColor: 'bg-yellow-500/20' },
  { id: 'concern_30', icon: Zap, title: '꾸준한 관찰자', description: '30개의 고민을 기록했어요', target: 30, type: 'concern', color: 'text-blue-500', bgColor: 'bg-blue-500/20' },
  { id: 'concern_50', icon: Trophy, title: '열정적인 기록자', description: '50개의 고민을 기록했어요', target: 50, type: 'concern', color: 'text-orange-500', bgColor: 'bg-orange-500/20' },
  { id: 'concern_100', icon: Crown, title: '마스터 기록자', description: '100개의 고민을 기록했어요', target: 100, type: 'concern', color: 'text-purple-500', bgColor: 'bg-purple-500/20' },
  { id: 'first_assessment', icon: Target, title: '첫 검사', description: '첫 번째 검사를 완료했어요', target: 1, type: 'assessment', color: 'text-green-500', bgColor: 'bg-green-500/20' },
  { id: 'assessment_5', icon: Award, title: '검사 탐험가', description: '5개의 검사를 완료했어요', target: 5, type: 'assessment', color: 'text-cyan-500', bgColor: 'bg-cyan-500/20' },
  { id: 'assessment_10', icon: Flame, title: '검사 마스터', description: '10개의 검사를 완료했어요', target: 10, type: 'assessment', color: 'text-red-500', bgColor: 'bg-red-500/20' },
];

export const MilestonesBadges: React.FC<MilestonesBadgesProps> = ({ 
  concernCount, 
  assessmentCount,
  consecutiveDays = 0 
}) => {
  const getProgress = (milestone: MilestoneConfig): number => {
    const current = milestone.type === 'concern' ? concernCount : 
                   milestone.type === 'assessment' ? assessmentCount : consecutiveDays;
    return Math.min((current / milestone.target) * 100, 100);
  };

  const isUnlocked = (milestone: MilestoneConfig): boolean => {
    return getProgress(milestone) >= 100;
  };

  const unlockedCount = milestones.filter(m => isUnlocked(m)).length;
  const nextMilestone = milestones.find(m => !isUnlocked(m));

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            🏆 마일스톤 & 뱃지
          </CardTitle>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {unlockedCount}/{milestones.length} 달성
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* 다음 목표 */}
        {nextMilestone && (
          <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <nextMilestone.icon className={cn("w-5 h-5", nextMilestone.color)} />
              <span className="text-sm font-medium">다음 목표: {nextMilestone.title}</span>
            </div>
            <Progress value={getProgress(nextMilestone)} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {nextMilestone.type === 'concern' ? concernCount : assessmentCount} / {nextMilestone.target}
            </p>
          </div>
        )}

        {/* 뱃지 그리드 */}
        <div className="grid grid-cols-4 gap-3">
          {milestones.map((milestone) => {
            const unlocked = isUnlocked(milestone);
            const progress = getProgress(milestone);
            const Icon = milestone.icon;

            return (
              <div
                key={milestone.id}
                className={cn(
                  "relative flex flex-col items-center p-2 rounded-lg transition-all",
                  unlocked 
                    ? `${milestone.bgColor} border border-transparent` 
                    : "bg-muted/30 opacity-50"
                )}
                title={`${milestone.title}: ${milestone.description}`}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mb-1",
                  unlocked ? milestone.bgColor : "bg-muted"
                )}>
                  <Icon className={cn(
                    "w-5 h-5",
                    unlocked ? milestone.color : "text-muted-foreground"
                  )} />
                </div>
                <span className={cn(
                  "text-[10px] text-center font-medium leading-tight",
                  unlocked ? "text-foreground" : "text-muted-foreground"
                )}>
                  {milestone.title}
                </span>
                {unlocked && (
                  <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-green-500 bg-background rounded-full" />
                )}
                {!unlocked && progress > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                    <span className="text-xs font-bold">{Math.round(progress)}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 총 달성 현황 */}
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">{concernCount}</p>
            <p className="text-xs text-muted-foreground">총 고민 기록</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{assessmentCount}</p>
            <p className="text-xs text-muted-foreground">총 검사 완료</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
