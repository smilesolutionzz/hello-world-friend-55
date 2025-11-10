import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, Target, Calendar, Award } from 'lucide-react';

interface DashboardStatsProps {
  recentTests: any[];
  observations: any[];
}

export function DashboardStats({ recentTests, observations }: DashboardStatsProps) {
  // 검사 수 계산
  const totalTests = recentTests.length;
  
  // 평균 점수 계산
  const averageScore = recentTests.length > 0
    ? recentTests.reduce((sum, test) => sum + (test.scores?.total_score || 0), 0) / recentTests.length
    : 0;
  
  // 성장률 계산 (최근 2개 검사 비교)
  const growthRate = recentTests.length >= 2
    ? ((recentTests[0].scores?.total_score || 0) - (recentTests[1].scores?.total_score || 0)) / (recentTests[1].scores?.total_score || 1) * 100
    : 0;
  
  // 완료율 계산 (관찰 데이터 기반)
  const completionRate = observations.length > 0
    ? (observations.filter(obs => obs.score_overall > 0).length / observations.length * 100)
    : 0;

  const stats = [
    {
      title: '총 검사',
      value: totalTests,
      suffix: '회',
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: '바로 검사',
      value: observations.length,
      suffix: '회',
      icon: Activity,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: '총 점수',
      value: Math.round(averageScore),
      suffix: '점',
      icon: Target,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: '성장률',
      value: growthRate.toFixed(1),
      suffix: '%',
      icon: growthRate >= 0 ? TrendingUp : TrendingDown,
      color: growthRate >= 0 ? 'text-green-400' : 'text-red-400',
      bgColor: growthRate >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
    },
    {
      title: '완료율',
      value: completionRate.toFixed(0),
      suffix: '%',
      icon: Award,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">{stat.title}</span>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">
                  {stat.value}
                </span>
                <span className="text-sm text-slate-400">{stat.suffix}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
