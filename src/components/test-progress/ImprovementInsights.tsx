import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Award, Calendar, Lightbulb } from 'lucide-react';

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

export const ImprovementInsights: React.FC<Props> = ({ testResults }) => {
  if (testResults.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>개선도 분석</CardTitle>
          <CardDescription>
            검사를 2회 이상 완료하면 개선도 분석을 확인할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>더 많은 검사를 완료하여 성장 패턴을 분석해보세요</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate insights
  const firstTest = testResults[0];
  const latestTest = testResults[testResults.length - 1];
  const previousTest = testResults.length > 1 ? testResults[testResults.length - 2] : firstTest;

  const overallImprovement = latestTest.score_overall - firstTest.score_overall;
  const recentChange = latestTest.score_overall - previousTest.score_overall;

  // Calculate average improvement per test
  const totalChange = latestTest.score_overall - firstTest.score_overall;
  const avgChangePerTest = totalChange / (testResults.length - 1);

  // Calculate time span
  const firstDate = new Date(firstTest.created_at);
  const lastDate = new Date(latestTest.created_at);
  const daysDiff = Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  const weeksDiff = Math.floor(daysDiff / 7);

  // Find best score
  const bestScore = Math.max(...testResults.map(t => t.score_overall));
  const bestTest = testResults.find(t => t.score_overall === bestScore);

  // Determine trend
  const isImproving = overallImprovement > 5;
  const isStable = Math.abs(overallImprovement) <= 5;
  const needsAttention = overallImprovement < -5;

  const insights = [
    {
      icon: isImproving ? TrendingUp : needsAttention ? TrendingDown : Target,
      title: '전체 변화',
      value: `${overallImprovement > 0 ? '+' : ''}${overallImprovement}점`,
      description: `첫 검사 대비 ${Math.abs(overallImprovement)}점 ${overallImprovement > 0 ? '향상' : overallImprovement < 0 ? '변화' : '유지'}`,
      color: isImproving ? 'text-green-500' : needsAttention ? 'text-orange-500' : 'text-blue-500',
      bgColor: isImproving ? 'bg-green-500/10' : needsAttention ? 'bg-orange-500/10' : 'bg-blue-500/10'
    },
    {
      icon: Calendar,
      title: '검사 기간',
      value: weeksDiff > 0 ? `${weeksDiff}주` : `${daysDiff}일`,
      description: `${testResults.length}회 검사 완료`,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: Award,
      title: '최고 점수',
      value: `${bestScore}점`,
      description: bestTest ? new Date(bestTest.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : '',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      icon: Target,
      title: '평균 변화율',
      value: `${avgChangePerTest > 0 ? '+' : ''}${avgChangePerTest.toFixed(1)}점`,
      description: '검사당 평균 변화',
      color: avgChangePerTest > 0 ? 'text-green-500' : 'text-gray-500',
      bgColor: avgChangePerTest > 0 ? 'bg-green-500/10' : 'bg-gray-500/10'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>개선도 분석</CardTitle>
        <CardDescription>
          검사 결과 기반 성장 인사이트
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${insight.bgColor} border border-border/50`}
            >
              <div className="flex items-center gap-2 mb-2">
                <insight.icon className={`w-5 h-5 ${insight.color}`} />
                <span className="text-sm font-medium text-muted-foreground">
                  {insight.title}
                </span>
              </div>
              <div className={`text-2xl font-bold ${insight.color} mb-1`}>
                {insight.value}
              </div>
              <div className="text-xs text-muted-foreground">
                {insight.description}
              </div>
            </div>
          ))}
        </div>

        {/* AI-like insights */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
            <Lightbulb className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">종합 분석</p>
              <p className="text-sm text-muted-foreground">
                {isImproving && (
                  <>
                    {weeksDiff > 0 ? `최근 ${weeksDiff}주` : `최근 ${daysDiff}일`} 동안 
                    <span className="font-semibold text-green-600"> 꾸준한 개선</span>이 관찰됩니다. 
                    현재의 긍정적인 패턴을 계속 유지하세요!
                  </>
                )}
                {isStable && (
                  <>
                    점수가 <span className="font-semibold text-blue-600">안정적으로 유지</span>되고 있습니다. 
                    일관된 상태를 보이고 있어요.
                  </>
                )}
                {needsAttention && (
                  <>
                    최근 <span className="font-semibold text-orange-600">변화</span>가 감지되었습니다. 
                    최근 상황을 점검하고 필요시 전문가 상담을 고려해보세요.
                  </>
                )}
              </p>
            </div>
          </div>

          {recentChange !== 0 && (
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              {recentChange > 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <TrendingDown className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium mb-1">최근 변화</p>
                <p className="text-sm text-muted-foreground">
                  이전 검사 대비 <span className={`font-semibold ${recentChange > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {recentChange > 0 ? '+' : ''}{recentChange}점
                  </span> 변화가 있습니다.
                </p>
              </div>
            </div>
          )}

          {testResults.length >= 5 && (
            <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <Award className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">성취 달성! 🎉</p>
                <p className="text-sm text-muted-foreground">
                  {testResults.length}회 이상 검사를 완료하셨습니다. 
                  자기 성장을 위한 노력이 돋보입니다!
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
