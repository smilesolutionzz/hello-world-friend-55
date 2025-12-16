import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, TrendingUp, TrendingDown, CalendarRange } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MonthlyReportProps {
  concerns: Array<{
    created_at: string;
    analysis_type: string;
    analysis_severity: string;
  }>;
  assessments: Array<{
    completed_at: string;
    results?: any;
    risk_level?: string;
  }>;
}

interface MonthData {
  month: Date;
  concernCount: number;
  assessmentCount: number;
  highSeverityCount: number;
  avgScore: number | null;
  topTypes: string[];
}

export const MonthlyReport: React.FC<MonthlyReportProps> = ({ concerns, assessments }) => {
  const monthlyData = useMemo(() => {
    const months: MonthData[] = [];
    const now = new Date();

    for (let i = 0; i < 3; i++) {
      const month = subMonths(now, i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthConcerns = concerns.filter(c => 
        isWithinInterval(new Date(c.created_at), { start: monthStart, end: monthEnd })
      );

      const monthAssessments = assessments.filter(a => 
        isWithinInterval(new Date(a.completed_at), { start: monthStart, end: monthEnd })
      );

      const typeCount: Record<string, number> = {};
      monthConcerns.forEach(c => {
        typeCount[c.analysis_type] = (typeCount[c.analysis_type] || 0) + 1;
      });
      const topTypes = Object.entries(typeCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([type]) => type);

      const scores = monthAssessments
        .map(a => a.results?.total_score || a.results?.predicted_score || a.results?.score)
        .filter(s => typeof s === 'number');
      const avgScore = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
        : null;

      months.push({
        month,
        concernCount: monthConcerns.length,
        assessmentCount: monthAssessments.length,
        highSeverityCount: monthConcerns.filter(c => c.analysis_severity === '높음').length,
        avgScore,
        topTypes
      });
    }

    return months;
  }, [concerns, assessments]);

  const comparison = useMemo(() => {
    if (monthlyData.length < 2) return null;
    
    const thisMonth = monthlyData[0];
    const lastMonth = monthlyData[1];
    
    const concernChange = thisMonth.concernCount - lastMonth.concernCount;
    const assessmentChange = thisMonth.assessmentCount - lastMonth.assessmentCount;
    const severityChange = thisMonth.highSeverityCount - lastMonth.highSeverityCount;
    
    return {
      concernChange,
      assessmentChange,
      severityChange,
      concernTrend: concernChange > 0 ? 'up' : concernChange < 0 ? 'down' : 'same',
      severityTrend: severityChange < 0 ? 'improving' : severityChange > 0 ? 'declining' : 'same'
    };
  }, [monthlyData]);

  const currentMonth = monthlyData[0];

  if (concerns.length === 0 && assessments.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-xl overflow-hidden h-full">
      {/* Header */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <CalendarRange className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">월간 리포트</h3>
              <p className="text-xs text-muted-foreground">이번 달 활동 요약</p>
            </div>
          </div>
          <Badge className="rounded-xl px-3 py-1 bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-primary/20">
            {format(new Date(), 'yyyy년 M월', { locale: ko })}
          </Badge>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Monthly Stats */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">고민 기록</span>
              {comparison && comparison.concernTrend !== 'same' && (
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full",
                  comparison.concernTrend === 'up' 
                    ? "bg-emerald-500/20 text-emerald-600" 
                    : "bg-rose-500/20 text-rose-600"
                )}>
                  {comparison.concernTrend === 'up' ? '+' : ''}{comparison.concernChange}
                </span>
              )}
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
              {currentMonth.concernCount}
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">검사 완료</span>
              {comparison && comparison.assessmentChange !== 0 && (
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full",
                  comparison.assessmentChange > 0 
                    ? "bg-emerald-500/20 text-emerald-600" 
                    : "bg-rose-500/20 text-rose-600"
                )}>
                  {comparison.assessmentChange > 0 ? '+' : ''}{comparison.assessmentChange}
                </span>
              )}
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              {currentMonth.assessmentCount}
            </p>
          </motion.div>
        </div>

        {/* Severity Trend */}
        {comparison && comparison.severityTrend !== 'same' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-4 rounded-2xl border",
              comparison.severityTrend === 'improving' 
                ? "bg-gradient-to-r from-emerald-500/10 to-green-500/5 border-emerald-500/20" 
                : "bg-gradient-to-r from-rose-500/10 to-red-500/5 border-rose-500/20"
            )}
          >
            <div className="flex items-center gap-3">
              {comparison.severityTrend === 'improving' ? (
                <TrendingDown className="w-5 h-5 text-emerald-500" />
              ) : (
                <TrendingUp className="w-5 h-5 text-rose-500" />
              )}
              <span className={cn(
                "text-sm font-medium",
                comparison.severityTrend === 'improving' ? "text-emerald-600" : "text-rose-600"
              )}>
                {comparison.severityTrend === 'improving' 
                  ? '지난달 대비 높은 심각도 고민이 감소했어요!' 
                  : '지난달 대비 높은 심각도 고민이 증가했어요'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Top Concern Types */}
        {currentMonth.topTypes.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">이번 달 주요 고민</p>
            <div className="flex flex-wrap gap-2">
              {currentMonth.topTypes.map(type => (
                <Badge 
                  key={type} 
                  className="rounded-xl px-3 py-1.5 bg-muted/50 text-foreground border-0 font-medium"
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Average Score */}
        {currentMonth.avgScore !== null && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">이번 달 평균 검사 점수</span>
              <span className="text-sm font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {currentMonth.avgScore}점
              </span>
            </div>
            <Progress value={currentMonth.avgScore} className="h-2" />
          </div>
        )}

        {/* 3-Month History */}
        <div className="pt-4 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-3">최근 3개월</p>
          <div className="flex gap-3">
            {monthlyData.map((data, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "flex-1 p-3 rounded-2xl text-center transition-all",
                  i === 0 
                    ? "bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20" 
                    : "bg-muted/30"
                )}
              >
                <p className="text-xs text-muted-foreground mb-1">
                  {format(data.month, 'M월', { locale: ko })}
                </p>
                <p className={cn(
                  "text-xl font-bold",
                  i === 0 ? "text-primary" : "text-foreground"
                )}>
                  {data.concernCount + data.assessmentCount}
                </p>
                <p className="text-[10px] text-muted-foreground">기록</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};