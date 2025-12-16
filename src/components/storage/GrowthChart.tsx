import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Activity, BarChart3 } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 5);
    const months = eachMonthOfInterval({ start: startOfMonth(sixMonthsAgo), end: endOfMonth(now) });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthConcerns = concerns.filter(c => {
        const date = new Date(c.created_at);
        return date >= monthStart && date <= monthEnd;
      });
      
      const monthAssessments = assessments.filter(a => {
        const date = new Date(a.completed_at);
        return date >= monthStart && date <= monthEnd;
      });
      
      const highSeverity = monthConcerns.filter(c => c.analysis_severity === '높음').length;
      const mediumSeverity = monthConcerns.filter(c => c.analysis_severity === '중간').length;
      const lowSeverity = monthConcerns.filter(c => c.analysis_severity === '낮음').length;
      
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
  const trendConfig = {
    improving: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: '심각도 감소 추세' },
    declining: { color: 'text-rose-500', bg: 'bg-rose-500/10', label: '심각도 증가 추세' },
    neutral: { color: 'text-blue-500', bg: 'bg-blue-500/10', label: '안정적' }
  };

  if (concerns.length === 0 && assessments.length === 0) {
    return null;
  }

  const stats = [
    { 
      label: '최근 6개월 고민', 
      value: chartData.reduce((sum, d) => sum + d.총고민, 0),
      color: 'from-violet-500 to-purple-500'
    },
    { 
      label: '최근 6개월 검사', 
      value: chartData.reduce((sum, d) => sum + d.총검사, 0),
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      label: '최근 평균 점수', 
      value: `${chartData.filter(d => d.평균점수).slice(-1)[0]?.평균점수 || '-'}점`,
      color: 'from-emerald-500 to-green-500'
    }
  ];

  return (
    <div className="rounded-3xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">성장 추이</h3>
              <p className="text-xs text-muted-foreground">최근 6개월 기록 분석</p>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-2xl",
            trendConfig[trend].bg
          )}>
            <TrendIcon className={cn("w-4 h-4", trendConfig[trend].color)} />
            <span className={cn("text-sm font-medium", trendConfig[trend].color)}>
              {trendConfig[trend].label}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '16px',
                  color: 'hsl(var(--foreground))',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.fullMonth || label}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
              />
              <Area 
                type="monotone" 
                dataKey="높음" 
                stroke="#f43f5e" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorHigh)" 
                name="높은 심각도" 
              />
              <Area 
                type="monotone" 
                dataKey="중간" 
                stroke="#f59e0b" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorMedium)" 
                name="중간 심각도" 
              />
              <Area 
                type="monotone" 
                dataKey="낮음" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorLow)" 
                name="낮은 심각도" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Stats Footer */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-muted/30 border-t border-border/50">
        {stats.map((stat, i) => (
          <div key={i} className="text-center">
            <p className={cn(
              "text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
              stat.color
            )}>
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};