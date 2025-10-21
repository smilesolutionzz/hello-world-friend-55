import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TestResult {
  id: string;
  created_at: string;
  age_group: string;
  results: any;
  score_overall: number;
}

interface Props {
  testResults: TestResult[];
}

export const TestComparisonCard: React.FC<Props> = ({ testResults }) => {
  if (testResults.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>기간 비교</CardTitle>
          <CardDescription>
            검사를 2회 이상 완료하면 기간별 비교를 확인할 수 있습니다
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Split tests into periods
  const midPoint = Math.ceil(testResults.length / 2);
  const firstPeriod = testResults.slice(0, midPoint);
  const secondPeriod = testResults.slice(midPoint);

  const firstAvg = Math.round(
    firstPeriod.reduce((sum, test) => sum + test.score_overall, 0) / firstPeriod.length
  );
  const secondAvg = Math.round(
    secondPeriod.reduce((sum, test) => sum + test.score_overall, 0) / secondPeriod.length
  );

  const improvement = secondAvg - firstAvg;
  const improvementPercent = Math.round((improvement / firstAvg) * 100);

  // Prepare comparison data
  const comparisonData = [
    {
      period: '초기',
      score: firstAvg,
      count: firstPeriod.length,
      color: 'hsl(var(--chart-1))'
    },
    {
      period: '최근',
      score: secondAvg,
      count: secondPeriod.length,
      color: 'hsl(var(--chart-2))'
    }
  ];

  // Compare first and last tests
  const firstTest = testResults[0];
  const lastTest = testResults[testResults.length - 1];
  const totalImprovement = lastTest.score_overall - firstTest.score_overall;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-semibold">{data.period} 기간</p>
          <p className="text-lg font-bold text-primary">{data.score}점</p>
          <p className="text-xs text-muted-foreground">{data.count}회 평균</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>기간별 점수 비교</CardTitle>
          <CardDescription>
            초기와 최근 검사 결과를 비교합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">초기 → 최근 변화</p>
                <p className="text-2xl font-bold">
                  {improvement > 0 ? '+' : ''}{improvement}점
                  <span className="text-lg text-muted-foreground ml-2">
                    ({improvementPercent > 0 ? '+' : ''}{improvementPercent}%)
                  </span>
                </p>
              </div>
              <Badge 
                variant={improvement > 0 ? 'default' : improvement < 0 ? 'destructive' : 'secondary'}
                className="text-lg px-4 py-2"
              >
                {improvement > 0 ? (
                  <><TrendingUp className="w-5 h-5 mr-2" /> 개선</>
                ) : improvement < 0 ? (
                  <><TrendingDown className="w-5 h-5 mr-2" /> 변화</>
                ) : (
                  <><Minus className="w-5 h-5 mr-2" /> 유지</>
                )}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>첫 검사 vs 최근 검사</CardTitle>
          <CardDescription>
            전체 기간 동안의 변화를 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">첫 검사</p>
              <p className="text-3xl font-bold mb-1">{firstTest.score_overall}점</p>
              <p className="text-xs text-muted-foreground">
                {new Date(firstTest.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
            
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground mb-2">최근 검사</p>
              <p className="text-3xl font-bold mb-1">{lastTest.score_overall}점</p>
              <p className="text-xs text-muted-foreground">
                {new Date(lastTest.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">전체 변화량</p>
                <p className="text-3xl font-bold">
                  {totalImprovement > 0 ? '+' : ''}{totalImprovement}점
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">진행 기간</p>
                <p className="text-xl font-semibold">
                  {Math.floor(
                    (new Date(lastTest.created_at).getTime() - new Date(firstTest.created_at).getTime()) 
                    / (1000 * 60 * 60 * 24)
                  )}일
                </p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-primary/20">
              <p className="text-sm">
                {totalImprovement > 0 ? (
                  <span className="text-green-600 font-semibold">
                    훌륭합니다! 지속적인 노력으로 {totalImprovement}점이 향상되었습니다. 🎉
                  </span>
                ) : totalImprovement < 0 ? (
                  <span className="text-orange-600 font-semibold">
                    최근 변화가 있습니다. 상태를 점검하고 필요시 전문가 상담을 고려해보세요.
                  </span>
                ) : (
                  <span className="text-blue-600 font-semibold">
                    점수가 일정하게 유지되고 있습니다. 안정적인 상태입니다.
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
