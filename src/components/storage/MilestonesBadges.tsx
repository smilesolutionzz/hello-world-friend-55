import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Zap, Crown, Target, Award, Flame, Heart, CheckCircle, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
  gradient: string;
  shadowColor: string;
}

const milestones: MilestoneConfig[] = [
  { id: 'first_concern', icon: Heart, title: '첫 고민', description: '첫 번째 고민을 기록했어요', target: 1, type: 'concern', gradient: 'from-pink-500 to-rose-500', shadowColor: 'shadow-pink-500/30' },
  { id: 'concern_10', icon: Star, title: '기록의 시작', description: '10개의 고민을 기록했어요', target: 10, type: 'concern', gradient: 'from-amber-500 to-yellow-500', shadowColor: 'shadow-amber-500/30' },
  { id: 'concern_30', icon: Zap, title: '꾸준한 관찰자', description: '30개의 고민을 기록했어요', target: 30, type: 'concern', gradient: 'from-blue-500 to-cyan-500', shadowColor: 'shadow-blue-500/30' },
  { id: 'concern_50', icon: Trophy, title: '열정적인 기록자', description: '50개의 고민을 기록했어요', target: 50, type: 'concern', gradient: 'from-orange-500 to-amber-500', shadowColor: 'shadow-orange-500/30' },
  { id: 'concern_100', icon: Crown, title: '마스터 기록자', description: '100개의 고민을 기록했어요', target: 100, type: 'concern', gradient: 'from-violet-500 to-purple-500', shadowColor: 'shadow-violet-500/30' },
  { id: 'first_assessment', icon: Target, title: '첫 검사', description: '첫 번째 검사를 완료했어요', target: 1, type: 'assessment', gradient: 'from-emerald-500 to-green-500', shadowColor: 'shadow-emerald-500/30' },
  { id: 'assessment_5', icon: Award, title: '검사 탐험가', description: '5개의 검사를 완료했어요', target: 5, type: 'assessment', gradient: 'from-cyan-500 to-teal-500', shadowColor: 'shadow-cyan-500/30' },
  { id: 'assessment_10', icon: Flame, title: '검사 마스터', description: '10개의 검사를 완료했어요', target: 10, type: 'assessment', gradient: 'from-red-500 to-rose-500', shadowColor: 'shadow-red-500/30' },
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
    <div className="rounded-3xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Medal className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">마일스톤 & 뱃지</h3>
              <p className="text-xs text-muted-foreground">나의 성취를 확인하세요</p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <span className="text-sm font-bold text-primary">{unlockedCount}/{milestones.length}</span>
            <span className="text-xs text-muted-foreground ml-1">달성</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Next Goal */}
        {nextMilestone && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
                nextMilestone.gradient
              )}>
                <nextMilestone.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">다음 목표</p>
                <p className="font-semibold text-foreground">{nextMilestone.title}</p>
              </div>
              <span className="text-sm font-bold text-primary">
                {nextMilestone.type === 'concern' ? concernCount : assessmentCount} / {nextMilestone.target}
              </span>
            </div>
            <Progress value={getProgress(nextMilestone)} className="h-2" />
          </motion.div>
        )}

        {/* Badges Grid */}
        <div className="grid grid-cols-4 gap-3">
          {milestones.map((milestone, index) => {
            const unlocked = isUnlocked(milestone);
            const progress = getProgress(milestone);
            const Icon = milestone.icon;

            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "relative flex flex-col items-center p-3 rounded-2xl transition-all duration-300",
                  unlocked 
                    ? "bg-gradient-to-br from-white/50 to-white/30 dark:from-white/10 dark:to-white/5 border border-white/50 dark:border-white/10" 
                    : "bg-muted/30 border border-transparent"
                )}
                title={`${milestone.title}: ${milestone.description}`}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all",
                  unlocked 
                    ? cn("bg-gradient-to-br shadow-lg", milestone.gradient, milestone.shadowColor)
                    : "bg-muted"
                )}>
                  <Icon className={cn(
                    "w-6 h-6",
                    unlocked ? "text-white" : "text-muted-foreground"
                  )} />
                </div>
                <span className={cn(
                  "text-[11px] text-center font-medium leading-tight",
                  unlocked ? "text-foreground" : "text-muted-foreground"
                )}>
                  {milestone.title}
                </span>
                
                {/* Unlock badge */}
                {unlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  </motion.div>
                )}
                
                {/* Progress overlay */}
                {!unlocked && progress > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-2xl backdrop-blur-sm">
                    <span className="text-sm font-bold text-foreground">{Math.round(progress)}%</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Stats Footer */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20">
            <p className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
              {concernCount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">총 고민 기록</p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20">
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              {assessmentCount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">총 검사 완료</p>
          </div>
        </div>
      </div>
    </div>
  );
};