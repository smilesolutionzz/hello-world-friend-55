import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SubscriptionCTA from "@/components/SubscriptionCTA";
import { 
  ArrowLeft, 
  Download, 
  BarChart3, 
  FileText, 
  Brain, 
  Target,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  Lock,
  Crown,
  TrendingUp,
  LineChart
} from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart as RechartsLineChart, Line } from 'recharts';
import MediaDisplay from './MediaDisplay';
import SubscriptionGate from './SubscriptionGate';

interface ObservationResultsProps {
  session: any;
  onBack: () => void;
}

const ObservationResults = ({ session, onBack }: ObservationResultsProps) => {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_subscription_usage')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription data:', error);
      } else {
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallAverage = (scores: any): string => {
    const validScores = Object.values(scores)
      .filter((s: any) => s && typeof s.average === 'number')
      .map((s: any) => s.average as number);
    
    if (validScores.length === 0) return 'N/A';
    
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    return (sum / validScores.length).toFixed(1);
  };

  const getDomainDisplayName = (domain: string) => {
    const names = {
      child_development: '아동발달',
      psychology: '심리상담',
      elderly_care: '노인케어',
      workplace: '직장적응',
      learning: '학습능력',
      family: '가족상담',
      medical: '의료재활'
    };
    return names[domain as keyof typeof names] || domain;
  };

  const getRiskLevelInfo = (level: string) => {
    const info = {
      low: { text: '양호', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
      medium: { text: '보통', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock },
      high: { text: '주의', color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertTriangle }
    };
    return info[level as keyof typeof info] || info.medium;
  };

  const generatePDFReport = async () => {
    try {
      setGenerating(true);

      const { data, error } = await supabase.functions.invoke('generate-observation-report', {
        body: {
          sessionData: session,
          reportType: 'comprehensive'
        }
      });

      if (error) throw error;

      // In a real implementation, this would trigger PDF download
      toast({
        title: "PDF 리포트 생성 완료",
        description: "전문 관찰 리포트가 생성되었습니다.",
      });

      // For demo purposes, show the generated content
      console.log('Generated report:', data);

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF 생성 오류",
        description: "리포트 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const analysisData = session.analysis_data || {};
  const scores = analysisData.scores || {};
  const riskLevel = analysisData.riskLevel || 'medium';
  const riskInfo = getRiskLevelInfo(riskLevel);

  // Prepare chart data
  const radarData = Object.entries(scores).map(([category, data]: [string, any]) => ({
    category: category.length > 8 ? category.substring(0, 8) + '...' : category,
    score: data.average || 0,
    fullCategory: category
  }));

  const barData = Object.entries(scores).map(([category, data]: [string, any]) => ({
    category: category.length > 10 ? category.substring(0, 10) + '...' : category,
    score: data.average || 0,
    fullCategory: category
  }));

  // Sample time series data for subscription users
  const timeSeriesData = [
    { date: '1주차', score: 3.2 },
    { date: '2주차', score: 3.5 },
    { date: '3주차', score: 3.8 },
    { date: '4주차', score: 4.1 },
  ];

  const isPremiumUser = subscriptionData?.subscription_status === 'premium';
  const hasUsagesLeft = !subscriptionData || subscriptionData.usage_count < 3;
  const canViewAdvanced = isPremiumUser || hasUsagesLeft;

  // Parse media files from session
  const mediaFiles = session.media_files || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{session.session_name}</h2>
          <p className="text-muted-foreground">{getDomainDisplayName(session.domain)} 관찰 결과</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={generatePDFReport}
            disabled={generating || !isPremiumUser}
            className="bg-primary"
          >
            {!isPremiumUser && <Lock className="h-4 w-4 mr-2" />}
            <Download className="h-4 w-4 mr-2" />
            {generating ? 'PDF 생성 중...' : 'PDF로 저장'}
            {!isPremiumUser && ' (추후)'}
          </Button>
          <Button 
            variant="outline" 
            disabled={!isPremiumUser}
          >
            {!isPremiumUser && <Lock className="h-4 w-4 mr-2" />}
            <MessageSquare className="h-4 w-4 mr-2" />
            전문가 피드백 요청{!isPremiumUser && ' (추후)'}
          </Button>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            돌아가기
          </Button>
        </div>
      </div>

      {/* Basic Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">관찰자</div>
                <div className="font-medium">{session.observer_name}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">관찰 기간</div>
                <div className="font-medium">
                  {new Date(session.observation_period_start).toLocaleDateString('ko-KR')} ~{' '}
                  {new Date(session.observation_period_end).toLocaleDateString('ko-KR')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <riskInfo.icon className={`h-5 w-5 ${riskInfo.color}`} />
              <div>
                <div className="text-sm text-muted-foreground">위험도</div>
                <Badge className={`${riskInfo.bgColor} ${riskInfo.color}`}>
                  {riskInfo.text}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">전체 평균</div>
                <div className="font-medium">
                  {calculateOverallAverage(scores)}/5.0
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Gate for Free Users */}
      {!canViewAdvanced && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">
                  무료 체험은 3회까지 요약 제공. 심화 리포트와 PDF는 구독 전환 후 이용 가능합니다.
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  레이더 차트, 시간 추이 분석, PDF 저장 등의 기능을 이용하세요.
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-amber-300 text-amber-800 hover:bg-amber-100">
                구독하기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">종합 개요</TabsTrigger>
          <TabsTrigger value="scores">점수 분석</TabsTrigger>
          <TabsTrigger value="analysis">AI 분석</TabsTrigger>
          <TabsTrigger value="recommendations">권고사항</TabsTrigger>
          <TabsTrigger value="media">미디어</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Free Version - Limited Report after 3 uses */}
          {!canViewAdvanced ? (
            <>
              {/* Limited Summary for users who exceeded free limit */}
              {subscriptionData?.usage_count >= 3 ? (
                <div className="space-y-6">
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Crown className="h-6 w-6 text-amber-600" />
                          <div>
                            <h3 className="font-semibold text-amber-800">축약 리포트</h3>
                            <p className="text-sm text-amber-700">
                              기록할수록 패턴이 보입니다. 4회차부터는 장기 추적/전문가 코멘트가 열립니다.
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm">
                              전체적인 관찰 결과 양호한 편이며, 특정 영역에서 지속적인 관심이 필요합니다. 
                              장기간 누적 데이터를 통해 더 정확한 패턴 분석이 가능합니다.
                            </p>
                          </div>
                          
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                  <h4 className="font-medium">긍정적 측면</h4>
                                  <p className="text-sm text-muted-foreground">
                                    인지능력과 운동발달은 연령에 적합한 수준을 보이고 있습니다.
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Fixed CTA at bottom */}
                  <Card className="border-primary bg-gradient-to-r from-primary/5 to-purple-500/5">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-primary mb-2">
                            심화 분석으로 더 정확한 인사이트를 얻어보세요
                          </h3>
                          <p className="text-muted-foreground">
                            레이더 차트, 시간 추이 분석, 전문가 피드백까지 한번에
                          </p>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 my-6">
                          <div className="text-center">
                            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                            <p className="text-sm font-medium">영역별 상세 분석</p>
                          </div>
                          <div className="text-center">
                            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                            <p className="text-sm font-medium">시간별 변화 추이</p>
                          </div>
                          <div className="text-center">
                            <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                            <p className="text-sm font-medium">전문가급 PDF 리포트</p>
                          </div>
                        </div>
                        
                        <Button 
                          size="lg" 
                          className="w-full max-w-md mx-auto"
                          onClick={() => window.location.href = '/pricing'}
                        >
                          <Crown className="h-4 w-4 mr-2" />
                          구독하고 심화 리포트 보기
                        </Button>
                        
                        <p className="text-xs text-muted-foreground">
                          첫 7일 무료 체험 • 언제든 취소 가능
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                /* Basic 5-card summary for free users under 3 uses */
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <h3 className="font-semibold mb-1">현재 상황</h3>
                        <p className="text-sm text-muted-foreground">
                          전체적인 발달 상태가 양호하며, 몇 가지 영역에서 개선이 필요합니다.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <h3 className="font-semibold mb-1">핵심 포인트</h3>
                        <p className="text-sm text-muted-foreground">
                          사회적 상호작용과 언어 발달에 집중적인 관심이 필요합니다.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <Brain className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <h3 className="font-semibold mb-1">긍정적 측면</h3>
                        <p className="text-sm text-muted-foreground">
                          인지능력과 운동발달은 연령에 적합한 수준을 보이고 있습니다.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <h3 className="font-semibold mb-1">개선 팁</h3>
                        <p className="text-sm text-muted-foreground">
                          일상적인 놀이 활동을 통해 자연스러운 상호작용을 늘려보세요.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                        <h3 className="font-semibold mb-1">주의사항</h3>
                        <p className="text-sm text-muted-foreground">
                          지속적인 관찰과 기록을 통해 변화를 추적하는 것이 중요합니다.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          ) : (
            /* Premium Version - Full Analytics */
            <>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Score Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      영역별 점수 분포
                      <Badge variant="outline" className="ml-auto text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        프리미엄
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip formatter={(value, name) => [value, '점수']} />
                        <Bar dataKey="score" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Radar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      종합 프로파일
                      <Badge variant="outline" className="ml-auto text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        프리미엄
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" />
                        <PolarRadiusAxis domain={[0, 5]} />
                        <Radar
                          name="점수"
                          dataKey="score"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Time Series Chart - Premium Only */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    시간별 변화 추이
                    <Badge variant="outline" className="ml-auto text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      프리미엄
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsLineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip formatter={(value) => [value, '평균 점수']} />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Summary Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(scores).map(([category, data]: [string, any]) => (
                  <Card key={category}>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {data.average.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">{category}</div>
                        <Progress value={(data.average / 5) * 100} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="scores" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>상세 점수 분석</CardTitle>
              <CardDescription>
                각 영역별 세부 점수와 통계 정보
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(scores).map(([category, data]: [string, any]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{category}</h3>
                      <Badge variant="outline">{data.average.toFixed(1)}점</Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">평균 점수</div>
                        <div className="font-medium">{data.average.toFixed(1)}/5.0</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">총점</div>
                        <div className="font-medium">{data.total}/{data.count * 5}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">항목 수</div>
                        <div className="font-medium">{data.count}개</div>
                      </div>
                    </div>
                    
                    <Progress value={(data.average / 5) * 100} className="mt-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI 전문 분석
              </CardTitle>
              <CardDescription>
                관찰 데이터를 바탕으로 한 전문가급 AI 분석 결과
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="bg-muted p-6 rounded-lg whitespace-pre-line">
                  {session.ai_analysis || '분석 결과가 없습니다.'}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                맞춤형 권고사항
              </CardTitle>
              <CardDescription>
                분석 결과를 바탕으로 한 개별화된 개입 전략
              </CardDescription>
            </CardHeader>
            <CardContent>
              {session.recommendations && session.recommendations.length > 0 ? (
                <div className="space-y-4">
                  {session.recommendations.map((rec: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{rec.title}</h3>
                        <Badge 
                          variant={rec.priority === 'high' ? 'destructive' : 
                                  rec.priority === 'medium' ? 'default' : 'secondary'}
                        >
                          {rec.priority === 'high' ? '높음' : 
                           rec.priority === 'medium' ? '보통' : '낮음'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{rec.description}</p>
                      {rec.actions && (
                        <div>
                          <h4 className="font-medium mb-2">구체적 실행방안:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {rec.actions.map((action: string, actionIndex: number) => (
                              <li key={actionIndex}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  권고사항이 생성되지 않았습니다.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <MediaDisplay 
            mediaFiles={mediaFiles} 
            title="관찰 기록 미디어"
          />
        </TabsContent>
      </Tabs>

      {/* Subscription CTA at bottom */}
      <div className="mt-8">
        <SubscriptionCTA context="observation" />
      </div>
    </div>
  );
};

export default ObservationResults;