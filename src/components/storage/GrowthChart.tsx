import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { ko } from 'date-fns/locale';

interface GrowthChartProps {
  concerns: Array<{
    created_at: string;
    analysis_severity: string;
    analysis_type: string;
  }>;
  assessments: Array<{
    completed_at: string;
    risk_level?: 'low' | 'medium' | 'high';
    results?: any;
  }>;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ concerns, assessments }) => {
  const chartData = useMemo(() => {
    // 최근 6개월 데이터
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 5);
    const months = eachMonthOfInterval({ start: startOfMonth(sixMonthsAgo), end: endOfMonth(now) });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      // 해당 월의 고민 데이터
      const monthConcerns = concerns.filter(c => {
        const date = new Date(c.created_at);
        return date >= monthStart && date <= monthEnd;
      });
      
      // 해당 월의 검사 데이터
      const monthAssessments = assessments.filter(a => {
        const date = new Date(a.completed_at);
        return date >= monthStart && date <= monthEnd;
      });
      
      // 심각도별 카운트
      const highSeverity = monthConcerns.filter(c => c.analysis_severity === '높음').length;
      const mediumSeverity = monthConcerns.filter(c => c.analysis_severity === '중간').length;
      const lowSeverity = monthConcerns.filter(c => c.analysis_severity === '낮음').length;
      
      // 평균 검사 점수 계산
      const scores = monthAssessments
        .map(a => a.results?.total_score || a.results?.predicted_score || a.results?.score)
        .filter(s => typeof s === 'number');
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
      
      return {
        month: format(month, 'M월', { locale: ko }),
        fullMonth: format(month, 'yyyy년 M월', { locale: ko }),
        총고민: monthConcerns.length,
        총검사: monthAssessments.length,
        높음: highSeverity,
        중간: mediumSeverity,
        낮음: lowSeverity,
        평균점수: avgScore ? Math.round(avgScore) : null
      };
    });
  }, [concerns, assessments]);

  // 트렌드 계산
  const trend = useMemo(() => {
    if (chartData.length < 2) return 'neutral';
    
    const recent = chartData.slice(-2);
    const recentHigh = recent[1]?.높음 || 0;
    const prevHigh = recent[0]?.높음 || 0;
    
    if (recentHigh < prevHigh) return 'improving';
    if (recentHigh > prevHigh) return 'declining';
    return 'neutral';
  }, [chartData]);

  const TrendIcon = trend === 'improving' ? TrendingDown : trend === 'declining' ? TrendingUp : Minus;
  const trendColor = trend === 'improving' ? 'text-green-500' : trend === 'declining' ? 'text-red-500' : 'text-muted-foreground';
  const trendText = trend === 'improving' ? '심각도 감소 추세' : trend === 'declining' ? '심각도 증가 추세' : '안정적';

  if (concerns.length === 0 && assessments.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            📈 성장 추이
          </CardTitle>
          <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span>{trendText}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.fullMonth || label}
              />
              <Legend />
              <Area type="monotone" dataKey="높음" stroke="#ef4444" fillOpacity={1} fill="url(#colorHigh)" name="높은 심각도" />
              <Area type="monotone" dataKey="중간" stroke="#f59e0b" fillOpacity={1} fill="url(#colorMedium)" name="중간 심각도" />
              <Area type="monotone" dataKey="낮음" stroke="#10b981" fillOpacity={1} fill="url(#colorLow)" name="낮은 심각도" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* 월별 요약 */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {chartData.reduce((sum, d) => sum + d.총고민, 0)}
            </p>
            <p className="text-xs text-muted-foreground">최근 6개월 고민</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {chartData.reduce((sum, d) => sum + d.총검사, 0)}
            </p>
            <p className="text-xs text-muted-foreground">최근 6개월 검사</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {chartData.filter(d => d.평균점수).slice(-1)[0]?.평균점수 || '-'}점
            </p>
            <p className="text-xs text-muted-foreground">최근 평균 점수</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
