import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Clock, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

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

  // 7일 이상 기록이 없으면 리마인더 표시
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

  const urgencyColors = {
    low: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
    medium: 'from-orange-500/10 to-orange-500/5 border-orange-500/20',
    high: 'from-red-500/10 to-red-500/5 border-red-500/20'
  };

  return (
    <div className="space-y-3">
      {showConcernReminder && (
        <Card className={cn(
          "bg-gradient-to-r border overflow-hidden",
          urgencyColors[getUrgencyLevel(daysSinceLastConcern)]
        )}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                getUrgencyLevel(daysSinceLastConcern) === 'high' 
                  ? "bg-red-500/20" 
                  : getUrgencyLevel(daysSinceLastConcern) === 'medium'
                    ? "bg-orange-500/20"
                    : "bg-blue-500/20"
              )}>
                {daysSinceLastConcern === null ? (
                  <Sparkles className="w-5 h-5 text-primary" />
                ) : (
                  <Bell className="w-5 h-5 text-orange-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground">
                  {daysSinceLastConcern === null 
                    ? '첫 고민을 기록해보세요!' 
                    : `마지막 기록: ${getTimeAgoText(lastConcernDate)}`}
                </h4>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {daysSinceLastConcern === null 
                    ? '고민을 기록하면 AI가 맞춤 분석을 제공해드려요'
                    : daysSinceLastConcern >= 30
                      ? '한 달 이상 기록이 없어요. 꾸준한 기록이 성장의 열쇠예요!'
                      : '정기적인 기록이 변화를 추적하는 데 도움이 돼요'}
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={() => navigate('/')}
                className="flex-shrink-0"
              >
                기록하기
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showAssessmentReminder && (
        <Card className={cn(
          "bg-gradient-to-r border overflow-hidden",
          urgencyColors[getUrgencyLevel(daysSinceLastAssessment)]
        )}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                getUrgencyLevel(daysSinceLastAssessment) === 'high' 
                  ? "bg-red-500/20" 
                  : getUrgencyLevel(daysSinceLastAssessment) === 'medium'
                    ? "bg-orange-500/20"
                    : "bg-purple-500/20"
              )}>
                <Clock className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground">
                  {daysSinceLastAssessment === null 
                    ? '첫 검사를 받아보세요!' 
                    : `마지막 검사: ${getTimeAgoText(lastAssessmentDate)}`}
                </h4>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {daysSinceLastAssessment === null 
                    ? '심리검사로 현재 상태를 정확히 파악해보세요'
                    : '정기적인 검사로 변화를 추적하세요. 2주마다 검사를 권장해요!'}
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/assessment')}
                className="flex-shrink-0"
              >
                검사하기
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
