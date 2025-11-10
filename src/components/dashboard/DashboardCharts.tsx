import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { TrendingUp } from 'lucide-react';

interface DashboardChartsProps {
  recentTests: any[];
  observations: any[];
}

export function DashboardCharts({ recentTests, observations }: DashboardChartsProps) {
  // 월별 검사 수 집계
  const monthlyData = () => {
    const monthMap = new Map<string, number>();
    
    [...recentTests, ...observations].forEach(item => {
      const date = new Date(item.completed_at || item.created_at);
      const monthKey = format(date, 'yyyy-MM', { locale: ko });
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
    });
    
    // 최근 3개월만 표시
    const sortedMonths = Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-3);
    
    return sortedMonths.map(([month, count]) => ({
      month: format(new Date(month + '-01'), 'M월', { locale: ko }),
      '검사 횟수': count,
    }));
  };

  // 시간에 따른 점수 변화 (최근 10개 검사)
  const scoreData = () => {
    const allData = [
      ...recentTests.map(test => ({
        date: new Date(test.completed_at),
        score: test.scores?.total_score || 0,
        type: 'test'
      })),
      ...observations.map(obs => ({
        date: new Date(obs.created_at),
        score: obs.score_overall || 0,
        type: 'observation'
      }))
    ];
    
    return allData
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-10)
      .map((item) => ({
        name: format(item.date, 'MM/dd', { locale: ko }),
        점수: Math.round(item.score),
      }));
  };

  const monthly = monthlyData();
  const scores = scoreData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 월별 검사 추이 */}
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent flex items-center gap-2">
            월별 검사 추이 (최근 3개월)
          </CardTitle>
          <CardDescription className="text-purple-300/70">
            월별 검사 횟수 통계
          </CardDescription>
        </CardHeader>
        <CardContent>
          {monthly.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="month" 
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis 
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar 
                  dataKey="검사 횟수" 
                  fill="#f59e0b" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              검사 데이터가 없습니다
            </div>
          )}
        </CardContent>
      </Card>

      {/* 점수 추이 */}
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            점수 추이 (최근 10회)
          </CardTitle>
          <CardDescription className="text-purple-300/70">
            시간에 따른 점수 변화
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scores.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scores}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis 
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="점수" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              점수 데이터가 없습니다
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
