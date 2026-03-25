import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useLanguage } from '@/i18n/LanguageContext';

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

export const TestHistoryChart: React.FC<Props> = ({ testResults }) => {
  const { isEnglish } = useLanguage();

  const chartData = testResults.map((test, index) => ({
    name: isEnglish ? `#${index + 1}` : `${index + 1}차`,
    date: new Date(test.created_at).toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR', { month: 'short', day: 'numeric' }),
    score: test.score_overall,
    fullDate: test.created_at
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">{data.date}</p>
          <p className="text-lg font-bold text-primary mt-1">{data.score}{isEnglish ? ' pts' : '점'}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEnglish ? 'Score Trend' : '검사 점수 변화 추이'}</CardTitle>
        <CardDescription>{isEnglish ? 'Track how your scores change over time' : '시간에 따른 검사 점수의 변화를 확인하세요'}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#scoreGradient)" />
          </AreaChart>
        </ResponsiveContainer>

        {chartData.length >= 2 && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">{isEnglish ? 'Insights' : '분석 인사이트'}</p>
            <p className="text-sm">
              {chartData[chartData.length - 1].score > chartData[0].score ? (
                isEnglish ? (
                  <>Improved by <span className="font-bold text-green-600">+{Math.abs(chartData[chartData.length - 1].score - chartData[0].score)} pts</span> since the first test. Great progress! 🎉</>
                ) : (
                  <>첫 검사 대비 <span className="font-bold text-green-600">+{Math.abs(chartData[chartData.length - 1].score - chartData[0].score)}점</span> 향상되었습니다. 꾸준한 성장을 보이고 있어요! 🎉</>
                )
              ) : chartData[chartData.length - 1].score < chartData[0].score ? (
                isEnglish ? (
                  <>Changed by <span className="font-bold text-orange-600">{chartData[chartData.length - 1].score - chartData[0].score} pts</span> since the first test. Consider reviewing your recent status.</>
                ) : (
                  <>첫 검사 대비 <span className="font-bold text-orange-600">{chartData[chartData.length - 1].score - chartData[0].score}점</span> 변화가 있습니다. 최근 상태를 확인해보세요.</>
                )
              ) : (
                isEnglish ? (
                  <>Your score has been <span className="font-bold">consistently maintained</span>. You're in a stable state.</>
                ) : (
                  <>점수가 <span className="font-bold">일정하게 유지</span>되고 있습니다. 안정적인 상태를 유지 중이에요.</>
                )
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
