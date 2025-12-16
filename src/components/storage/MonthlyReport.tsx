import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, Download, ChevronRight, TrendingUp, TrendingDown, Minus, FileText } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  // 월별 데이터 계산
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

      // 타입별 카운트
      const typeCount: Record<string, number> = {};
      monthConcerns.forEach(c => {
        typeCount[c.analysis_type] = (typeCount[c.analysis_type] || 0) + 1;
      });
      const topTypes = Object.entries(typeCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([type]) => type);

      // 평균 점수
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

  // 이번 달 vs 지난 달 비교
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
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            월간 리포트
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {format(new Date(), 'yyyy년 M월', { locale: ko })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* 이번 달 요약 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">고민 기록</span>
              {comparison && comparison.concernTrend !== 'same' && (
                <Badge variant="secondary" className="text-xs">
                  {comparison.concernTrend === 'up' ? '+' : ''}{comparison.concernChange}
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{currentMonth.concernCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">검사 완료</span>
              {comparison && comparison.assessmentChange !== 0 && (
                <Badge variant="secondary" className="text-xs">
                  {comparison.assessmentChange > 0 ? '+' : ''}{comparison.assessmentChange}
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{currentMonth.assessmentCount}</p>
          </div>
        </div>

        {/* 트렌드 표시 */}
        {comparison && comparison.severityTrend !== 'same' && (
          <div className={`p-3 rounded-lg mb-4 ${
            comparison.severityTrend === 'improving' 
              ? 'bg-green-500/10 border border-green-500/20' 
              : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <div className="flex items-center gap-2">
              {comparison.severityTrend === 'improving' ? (
                <TrendingDown className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingUp className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm font-medium">
                {comparison.severityTrend === 'improving' 
                  ? '지난달 대비 높은 심각도 고민이 감소했어요!' 
                  : '지난달 대비 높은 심각도 고민이 증가했어요'}
              </span>
            </div>
          </div>
        )}

        {/* 주요 고민 유형 */}
        {currentMonth.topTypes.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">이번 달 주요 고민</p>
            <div className="flex flex-wrap gap-2">
              {currentMonth.topTypes.map(type => (
                <Badge key={type} variant="secondary">{type}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* 평균 점수 */}
        {currentMonth.avgScore !== null && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">이번 달 평균 검사 점수</span>
              <span className="text-sm font-bold text-primary">{currentMonth.avgScore}점</span>
            </div>
            <Progress value={currentMonth.avgScore} className="h-2" />
          </div>
        )}

        {/* 최근 3개월 미니 히스토리 */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">최근 3개월</p>
          <div className="flex gap-2">
            {monthlyData.map((data, i) => (
              <div 
                key={i} 
                className={`flex-1 p-2 rounded-lg text-center ${i === 0 ? 'bg-primary/10' : 'bg-muted/30'}`}
              >
                <p className="text-xs text-muted-foreground">
                  {format(data.month, 'M월', { locale: ko })}
                </p>
                <p className="text-lg font-bold text-foreground">{data.concernCount + data.assessmentCount}</p>
                <p className="text-[10px] text-muted-foreground">기록</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
