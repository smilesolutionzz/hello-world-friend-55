import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Clock, Sparkles, ArrowRight, PenLine, FileSearch } from 'lucide-react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ReminderBannerProps {
  lastConcernDate?: string | null;
  lastAssessmentDate?: string | null;
}

export const ReminderBanner: React.FC<ReminderBannerProps> = ({ 
  lastConcernDate, 
  lastAssessmentDate 
}) => {
  const navigate = useNavigate();

  const daysSinceLastConcern = lastConcernDate 
    ? differenceInDays(new Date(), new Date(lastConcernDate))
    : null;

  const daysSinceLastAssessment = lastAssessmentDate
    ? differenceInDays(new Date(), new Date(lastAssessmentDate))
    : null;

  const showConcernReminder = daysSinceLastConcern === null || daysSinceLastConcern >= 7;
  const showAssessmentReminder = daysSinceLastAssessment === null || daysSinceLastAssessment >= 14;

  if (!showConcernReminder && !showAssessmentReminder) {
    return null;
  }

  const getTimeAgoText = (date: string | null) => {
    if (!date) return '아직 기록이 없어요';
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ko });
  };

  const getUrgencyLevel = (days: number | null): 'low' | 'medium' | 'high' => {
    if (days === null) return 'high';
    if (days >= 30) return 'high';
    if (days >= 14) return 'medium';
    return 'low';
  };

  const urgencyConfig = {
    low: { 
      gradient: 'from-blue-500/20 via-blue-500/10 to-transparent',
      border: 'border-blue-500/30',
      iconBg: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/20'
    },
    medium: { 
      gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
      border: 'border-amber-500/30',
      iconBg: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/20'
    },
    high: { 
      gradient: 'from-rose-500/20 via-rose-500/10 to-transparent',
      border: 'border-rose-500/30',
      iconBg: 'from-rose-500 to-red-500',
      shadow: 'shadow-rose-500/20'
    }
  };

  return (
    <div className="space-y-4">
      {showConcernReminder && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative rounded-3xl border overflow-hidden p-5",
            `bg-gradient-to-r ${urgencyConfig[getUrgencyLevel(daysSinceLastConcern)].gradient}`,
            urgencyConfig[getUrgencyLevel(daysSinceLastConcern)].border
          )}
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-lg",
              urgencyConfig[getUrgencyLevel(daysSinceLastConcern)].iconBg,
              urgencyConfig[getUrgencyLevel(daysSinceLastConcern)].shadow
            )}>
              {daysSinceLastConcern === null ? (
                <Sparkles className="w-6 h-6 text-white" />
              ) : (
                <PenLine className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-foreground text-base">
                {daysSinceLastConcern === null 
                  ? '첫 고민을 기록해보세요!' 
                  : `마지막 기록: ${getTimeAgoText(lastConcernDate)}`}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {daysSinceLastConcern === null 
                  ? '고민을 기록하면 AI가 맞춤 분석을 제공해드려요'
                  : daysSinceLastConcern >= 30
                    ? '한 달 이상 기록이 없어요. 꾸준한 기록이 성장의 열쇠예요!'
                    : '정기적인 기록이 변화를 추적하는 데 도움이 돼요'}
              </p>
            </div>
            <Button 
              onClick={() => navigate('/')}
              className="flex-shrink-0 rounded-2xl h-12 px-5 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
            >
              기록하기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}

      {showAssessmentReminder && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "relative rounded-3xl border overflow-hidden p-5",
            `bg-gradient-to-r ${urgencyConfig[getUrgencyLevel(daysSinceLastAssessment)].gradient}`,
            urgencyConfig[getUrgencyLevel(daysSinceLastAssessment)].border
          )}
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20"
            )}>
              <FileSearch className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-foreground text-base">
                {daysSinceLastAssessment === null 
                  ? '첫 검사를 받아보세요!' 
                  : `마지막 검사: ${getTimeAgoText(lastAssessmentDate)}`}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {daysSinceLastAssessment === null 
                  ? '심리검사로 현재 상태를 정확히 파악해보세요'
                  : '정기적인 검사로 변화를 추적하세요. 2주마다 검사를 권장해요!'}
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => navigate('/assessment')}
              className="flex-shrink-0 rounded-2xl h-12 px-5 border-2 hover:bg-muted/50"
            >
              검사하기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};