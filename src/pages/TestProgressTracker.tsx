import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, LineChart, BarChart3, Activity } from 'lucide-react';
import { TestHistoryChart } from '@/components/test-progress/TestHistoryChart';
import { ImprovementInsights } from '@/components/test-progress/ImprovementInsights';
import { TestComparisonCard } from '@/components/test-progress/TestComparisonCard';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';

interface TestResult {
  id: string;
  created_at: string;
  age_group: string;
  results: any;
  score_overall: number;
}

const TestProgressTracker = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadTestData();
  }, []);

  const loadTestData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Load all assessment results
      const { data: assessments } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (assessments) {
        // Process assessments to extract scores
        const processedResults = assessments.map(assessment => {
          let score = 75; // default
          
          if (assessment.results && typeof assessment.results === 'object' && !Array.isArray(assessment.results)) {
            const results = assessment.results as { [key: string]: any };
            if (results.total) {
              score = results.total;
            } else if (results.totalScore) {
              score = results.totalScore;
            } else if (results.answers && Array.isArray(results.answers)) {
              const answers = results.answers;
              score = Math.round((answers.reduce((sum: number, ans: any) => {
                return sum + (typeof ans === 'number' ? ans : ans.score || 0);
              }, 0) / answers.length) * 20);
            }
          }

          return {
            ...assessment,
            score_overall: score
          };
        });

        setTestResults(processedResults);
      }
    } catch (error) {
      console.error('Error loading test data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall statistics
  const calculateStats = () => {
    if (testResults.length === 0) {
      return {
        totalTests: 0,
        averageScore: 0,
        trend: 'neutral' as 'up' | 'down' | 'neutral',
        improvementRate: 0
      };
    }

    const totalTests = testResults.length;
    const averageScore = Math.round(
      testResults.reduce((sum, test) => sum + test.score_overall, 0) / totalTests
    );

    // Calculate trend (compare first half vs second half)
    if (totalTests >= 4) {
      const midPoint = Math.floor(totalTests / 2);
      const firstHalf = testResults.slice(0, midPoint);
      const secondHalf = testResults.slice(midPoint);
      
      const firstAvg = firstHalf.reduce((sum, test) => sum + test.score_overall, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, test) => sum + test.score_overall, 0) / secondHalf.length;
      
      const improvementRate = Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
      
      return {
        totalTests,
        averageScore,
        trend: improvementRate > 5 ? 'up' : improvementRate < -5 ? 'down' : 'neutral',
        improvementRate
      };
    }

    return {
      totalTests,
      averageScore,
      trend: 'neutral' as 'up' | 'down' | 'neutral',
      improvementRate: 0
    };
  };

  const stats = calculateStats();

  const getTrendIcon = () => {
    if (stats.trend === 'up') return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (stats.trend === 'down') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (stats.trend === 'up') return 'text-green-500';
    if (stats.trend === 'down') return 'text-red-500';
    return 'text-gray-500';
  };

  const getTrendText = () => {
    if (stats.trend === 'up') return '개선 중';
    if (stats.trend === 'down') return '주의 필요';
    return '안정적';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <UnifiedNavigation />
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-2/3 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (testResults.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <UnifiedNavigation />
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <Card>
            <CardHeader>
              <CardTitle>검사 성장 분석</CardTitle>
              <CardDescription>아직 검사 결과가 없습니다</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Activity className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-6">
                검사를 완료하면 여기서 성장 추이를 확인할 수 있습니다
              </p>
              <Button onClick={() => navigate('/assessment')}>
                첫 검사 시작하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <UnifiedNavigation />
      
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">검사 성장 분석</h1>
            <p className="text-muted-foreground">
              나의 검사 결과 변화 추이와 개선도를 확인하세요
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/assessment')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>총 검사 횟수</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalTests}회</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>평균 점수</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.averageScore}점</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>전체 추세</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getTrendIcon()}
                <span className={`text-2xl font-bold ${getTrendColor()}`}>
                  {getTrendText()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>개선율</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getTrendColor()}`}>
                {stats.improvementRate > 0 ? '+' : ''}{stats.improvementRate}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              전체 분석
            </TabsTrigger>
            <TabsTrigger value="history">
              <LineChart className="w-4 h-4 mr-2" />
              상세 기록
            </TabsTrigger>
            <TabsTrigger value="comparison">
              <Activity className="w-4 h-4 mr-2" />
              기간 비교
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ImprovementInsights testResults={testResults} />
            <TestHistoryChart testResults={testResults} />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>검사 이력</CardTitle>
                <CardDescription>시간순으로 정렬된 검사 결과</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResults.slice().reverse().map((test, index) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">
                            {testResults.length - index}번째 검사
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(test.created_at).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className="text-2xl font-bold">{test.score_overall}점</span>
                        </div>
                      </div>
                      
                      {index < testResults.length - 1 && (
                        <div className="flex items-center gap-2">
                          {test.score_overall > testResults[testResults.length - index - 2].score_overall ? (
                            <TrendingUp className="w-5 h-5 text-green-500" />
                          ) : test.score_overall < testResults[testResults.length - index - 2].score_overall ? (
                            <TrendingDown className="w-5 h-5 text-red-500" />
                          ) : (
                            <Minus className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <TestComparisonCard testResults={testResults} />
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">더 정확한 분석을 원하시나요?</h3>
              <p className="text-muted-foreground mb-4">
                정기적인 검사로 더욱 상세한 성장 추이를 확인하세요
              </p>
              <Button onClick={() => navigate('/assessment')}>
                새로운 검사 시작하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestProgressTracker;
