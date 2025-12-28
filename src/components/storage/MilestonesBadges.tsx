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
  { id: 'concern_10', icon: Star, title: '기록 시작', description: '10개의 고민을 기록했어요', target: 10, type: 'concern', gradient: 'from-amber-500 to-yellow-500', shadowColor: 'shadow-amber-500/30' },
  { id: 'concern_30', icon: Zap, title: '꾸준한 관찰', description: '30개의 고민을 기록했어요', target: 30, type: 'concern', gradient: 'from-blue-500 to-cyan-500', shadowColor: 'shadow-blue-500/30' },
  { id: 'concern_50', icon: Trophy, title: '열정 기록', description: '50개의 고민을 기록했어요', target: 50, type: 'concern', gradient: 'from-orange-500 to-amber-500', shadowColor: 'shadow-orange-500/30' },
  { id: 'concern_100', icon: Crown, title: '마스터', description: '100개의 고민을 기록했어요', target: 100, type: 'concern', gradient: 'from-violet-500 to-purple-500', shadowColor: 'shadow-violet-500/30' },
  { id: 'first_assessment', icon: Target, title: '첫 검사', description: '첫 번째 검사를 완료했어요', target: 1, type: 'assessment', gradient: 'from-emerald-500 to-green-500', shadowColor: 'shadow-emerald-500/30' },
  { id: 'assessment_5', icon: Award, title: '탐험가', description: '5개의 검사를 완료했어요', target: 5, type: 'assessment', gradient: 'from-cyan-500 to-teal-500', shadowColor: 'shadow-cyan-500/30' },
  { id: 'assessment_10', icon: Flame, title: '검사 달인', description: '10개의 검사를 완료했어요', target: 10, type: 'assessment', gradient: 'from-red-500 to-rose-500', shadowColor: 'shadow-red-500/30' },
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
    <div className="rounded-2xl md:rounded-3xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Medal className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg text-foreground">마일스톤</h3>
              <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">나의 성취를 확인하세요</p>
            </div>
          </div>
          <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <span className="text-xs md:text-sm font-bold text-primary">{unlockedCount}/{milestones.length}</span>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Next Goal */}
        {nextMilestone && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20"
          >
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className={cn(
                "w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br flex items-center justify-center",
                nextMilestone.gradient
              )}>
                <nextMilestone.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] md:text-xs text-muted-foreground">다음 목표</p>
                <p className="font-semibold text-sm md:text-base text-foreground truncate">{nextMilestone.title}</p>
              </div>
              <span className="text-xs md:text-sm font-bold text-primary whitespace-nowrap">
                {nextMilestone.type === 'concern' ? concernCount : assessmentCount} / {nextMilestone.target}
              </span>
            </div>
            <Progress value={getProgress(nextMilestone)} className="h-1.5 md:h-2" />
          </motion.div>
        )}

        {/* Badges Grid - 모바일: 가로 스크롤, 데스크탑: 4열 그리드 */}
        <div className="md:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {milestones.map((milestone, index) => {
              const unlocked = isUnlocked(milestone);
              const progress = getProgress(milestone);
              const Icon = milestone.icon;

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className={cn(
                    "relative flex flex-col items-center p-2.5 rounded-xl flex-shrink-0 w-[72px]",
                    unlocked 
                      ? "bg-gradient-to-br from-white/50 to-white/30 dark:from-white/10 dark:to-white/5 border border-white/50 dark:border-white/10" 
                      : "bg-muted/30 border border-transparent"
                  )}
                  title={`${milestone.title}: ${milestone.description}`}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center mb-1.5",
                    unlocked 
                      ? cn("bg-gradient-to-br shadow-md", milestone.gradient, milestone.shadowColor)
                      : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      unlocked ? "text-white" : "text-muted-foreground"
                    )} />
                  </div>
                  <span className={cn(
                    "text-[10px] text-center font-medium leading-tight",
                    unlocked ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {milestone.title}
                  </span>
                  
                  {unlocked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1"
                    >
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow">
                        <CheckCircle className="w-2.5 h-2.5 text-white" />
                      </div>
                    </motion.div>
                  )}
                  
                  {!unlocked && progress > 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 rounded-xl backdrop-blur-sm">
                      <span className="text-xs font-bold text-foreground">{Math.round(progress)}%</span>
                      <span className="text-[8px] text-muted-foreground mt-0.5">{milestone.title}</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-4 gap-3">
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
                
                {!unlocked && progress > 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 rounded-2xl backdrop-blur-sm">
                    <span className="text-sm font-bold text-foreground">{Math.round(progress)}%</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{milestone.title}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Stats Footer */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 pt-3 md:pt-4 border-t border-border/50">
          <div className="text-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20">
            <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
              {concernCount}
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">총 고민 기록</p>
          </div>
          <div className="text-center p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20">
            <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              {assessmentCount}
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">총 검사 완료</p>
          </div>
        </div>
      </div>
    </div>
  );
};