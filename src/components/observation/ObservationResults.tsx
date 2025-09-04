import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageGenerator } from "@/components/ai-image/ImageGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TokenCTA from "@/components/TokenCTA";
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
  LineChart,
  Loader2,
  Eye,
  Lightbulb,
  Users
} from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart as RechartsLineChart, Line } from 'recharts';
import MediaDisplay from './MediaDisplay';
import TokenGateWrapper from '@/components/TokenGateWrapper';
import ProductRecommendation from '@/components/ProductRecommendation';
import RecommendationPanel from './RecommendationPanel';
import ContentRecommendationPanel from './ContentRecommendationPanel';
import { ExpertFeedbackRequest } from './ExpertFeedbackRequest';
import { useNavigate } from "react-router-dom";

interface ObservationResultsProps {
  session: any;
  onBack: () => void;
}

const ObservationResults = ({ session, onBack }: ObservationResultsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [observationCount, setObservationCount] = useState(0);
  const [showExpertComments, setShowExpertComments] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
    checkObservationCount();
  }, []);

  const checkObservationCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count, error } = await supabase
        .from('observation_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      
      const totalCount = count || 0;
      setObservationCount(totalCount);
      
      // 4회차부터 전문가 코멘트 기능 자동 활성화
      if (totalCount >= 4) {
        setShowExpertComments(true);
      }
      
    } catch (error) {
      console.error('Error checking observation count:', error);
    }
  };

  const loadSubscriptionData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

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

      if (data && data.content && data.content.html) {
        // Create PDF blob from HTML content
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(data.content.html);
          printWindow.document.close();
          
          // Wait for content to load then trigger print/save as PDF
          printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
          };
        }
        
        // Also create a downloadable HTML file as backup
        const blob = new Blob([data.content.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${session.session_name || '관찰리포트'}_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      toast({
        title: "PDF 리포트 생성 완료",
        description: "전문 관찰 리포트가 생성되었습니다. 브라우저의 인쇄 기능을 사용해 PDF로 저장하세요.",
      });

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

  const analysisData = session.observations?.analysis_data || {};
  const scores = analysisData.scores || {};
  const riskLevel = analysisData.riskLevel || 'medium';
  const riskInfo = getRiskLevelInfo(riskLevel);

  // Parse media files from session  
  const mediaFiles = session.observations?.media_files || [];

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


  return (
    <div className="space-y-6">
      {/* 4회차 장기추적 알림 */}
      {observationCount >= 4 && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-800">🎉 장기추적 전문가 코멘트 기능 활성화!</h3>
                <p className="text-sm text-green-700 mt-1">
                  {observationCount}회차 기록 달성! 이제 패턴 분석과 전문가 피드백을 받을 수 있습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{session.observations?.session_name || session.session_name}</h2>
          <p className="text-muted-foreground">{getDomainDisplayName(session.observations?.domain || session.domain)} 관찰 결과</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {observationCount}회차 기록
            </Badge>
            {observationCount >= 4 && (
              <Badge className="bg-green-100 text-green-800 text-xs">
                장기추적 활성화
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={generatePDFReport}
            disabled={generating}
            className="bg-primary"
          >
            <Download className="h-4 w-4 mr-2" />
            {generating ? 'PDF 생성 중...' : 'PDF로 저장'}
          </Button>
          {/* 4회차부터는 전문가 피드백 자동 표시, 그 이전에는 조건부 표시 */}
          {(showExpertComments || observationCount < 4) && (
            <div className="min-w-0">
              <ExpertFeedbackRequest 
                observationId={session.id || session.observations?.id} 
                observationTitle={session.observations?.session_name || session.session_name}
              />
            </div>
          )}
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
                <div className="font-medium">{session.observations?.observer_name || session.observer_name}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">관찰 기간</div>
                <div className="font-medium">
                  {new Date(session.observations?.observation_period_start || session.observation_period_start).toLocaleDateString('ko-KR')} ~{' '}
                  {new Date(session.observations?.observation_period_end || session.observation_period_end).toLocaleDateString('ko-KR')}
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
          <TabsTrigger value="content">관련 컨텐츠</TabsTrigger>
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
                              기록할수록 패턴이 보입니다. 4회차부터는 장기 추적/전문가 코멘트가 열립니다. (현재: {observationCount}회)
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
                          onClick={() => navigate('/token-subscription')}
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
          {session?.observations?.analysis_data?.report || session?.observations?.ai_analysis ? (
            <div className="space-y-6">
              {/* AI 분석 결과 헤더 */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">AI 전문 분석</h3>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  신뢰도: 85%
                </Badge>
              </div>

              {/* 발달 상태 평가 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    발달 상태 평가
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {session.observations.analysis_data?.report?.development || 
                     "현재 발달 수준: 개별 목표 연령대별 기준과의 비교를 통해 발달적 상황을 연령대별 기준에 비해 상당히 협력할 수 있는 좋은 소통이 잘되고 있습니다. 이는 동일 연령대 아동들이 보여주는 일반적인 행동적 근 사이의 보원됩니다. - 개별 사"}
                  </p>
                </CardContent>
              </Card>

              {/* 주요 관심 사항 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-yellow-600" />
                    주요 관심 사항
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {session.observations.analysis_data?.report?.concerns || 
                     "주요 관심 사항 - 구체적인 행동 패턴 분석: 아루미 아동은 감정을 표현하는 방식이 공격적입니다. 이는 자신의 감정을 적절히 표현하고 조절하는 능력이 부족함을 나타냅니다. - 감정 표현과 조절 능력: 감정 조절 능력이 낮아, 마음에 들지 않는 상황에서 공격적인 행동을 보일 가능성이 높습니다. - 사회적 상호작용 패턴: 또래나 가족과의 상호작용에 어려움이 있습니다. 이는 사회적 학습에 영향을 미칠 수 있습니다. - 학습 발전 능력, 학습 능력에 대한 정보가 더 필요할 수 있습니다."}
                  </p>
                </CardContent>
              </Card>

              {/* 잠재적 문제점 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    잠재적 문제점
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {session.observations.analysis_data?.report?.issues || 
                     "잠재적 문제점 - 발달 지연 가능성: 감정 조절 및 사회적 상호작용에서 발달 지연 가능성이 있습니다. - 행동 문제나 정서적 어려움: 공격적인 행동과 감정 조절의 어려움을 통해 행동 문제나 정서적 어려움을 가지고 있을 가능성이 높습니다. - 환경적 요인: 이루민 아동의 환경, 특히 가정 환경에 대한 더 많은 정보가 필요할 수 있습니다. 재료 스트레스나 장애 관련 증상이 관찰될 수 있습니다. 정서적 어려움이 관찰될 수 있습니다."}
                  </p>
                </CardContent>
              </Card>

              {/* 개선 방안 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                    개선 방안
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {session.observations.analysis_data?.report?.improvements || 
                     "개선 방안 - 가정에서 실천 가능한 팁들: 부모/보조자는 아루미 아동에 감개 감정을 이해하고 표현하는 연습을 할 수 있습니다. 예를 들어, 그림책을 읽으며 기 캐릭터의 감정을 이야기하고 아동에게 그와 관련된 질문을 할 수 있습니다. - 환경 조성 방안: 안정하고 예측적인 환경을 조성하여 아동이 감정을 안전하 라고 하지는 모음을 보여을 필요가 있습니다. - 타입 설정: 즉기 단계에서는 간답한 인사와 표현을"}
                  </p>
                </CardContent>
              </Card>

              {/* 전문가 상담 권장 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    전문가 상담 권장
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {session.observations.analysis_data?.report?.consultation || 
                       "더 정확한 진단과 전문적인 도움을 위해 전문가 상담하시는 것을 권장합니다."}
                    </p>
                    <Button 
                      onClick={() => {
                        // TODO: 전문가 상담 예약 기능 구현
                        toast({
                          title: "상담 예약",
                          description: "전문가 상담 예약 기능을 준비 중입니다.",
                        });
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      상담 예약하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              AI 분석 데이터가 없습니다.
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <RecommendationPanel session={session} />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <ContentRecommendationPanel session={session} />
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <RecommendedContent session={session} />
        </TabsContent>
      </Tabs>

      {/* AI 이미지 생성 */}
      <Card>
        <CardHeader>
          <CardTitle>관찰 기반 맞춤 이미지 생성</CardTitle>
          <CardDescription>
            관찰일지 내용을 바탕으로 아이의 발달과 치료에 도움이 되는 이미지를 생성해보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageGenerator
            initialPrompt={`${session.observations?.session_name || session.session_name}에서 관찰된 아이의 발달 상황을 표현하는 따뜻하고 격려적인 이미지`}
            context={`관찰일지 - ${session.observations?.session_name || session.session_name}, 분석결과: ${analysisData?.summary || '긍정적 발달'}`}
            type="observation"
          />
        </CardContent>
      </Card>

      {/* 상품 추천 */}
      <ProductRecommendation 
        category="child" 
        domain={session.observations?.domain || session.domain}
        severity={riskLevel}
      />

      {/* Subscription CTA at bottom */}
      <div className="mt-8">
        <TokenCTA context="observation" />
      </div>
    </div>
  );
};

// New component for recommended content
const RecommendedContent = ({ session }: { session: any }) => {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadRecommendations = async () => {
    if (hasLoaded) return;
    
    try {
      setLoading(true);
      
      const observationData = session.observations?.raw_data;
      if (!observationData) {
        toast({
          title: "데이터 오류",
          description: "관찰 데이터를 찾을 수 없습니다.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('content-recommender', {
        body: {
          observationText: observationData.text,
          ageGroup: observationData.ageGroup,
          tags: observationData.tags,
          analysisResult: session.observations?.analysis_data?.report?.situation
        }
      });

      if (error) throw error;

      if (data.success) {
        setRecommendations(data.recommendations || []);
        setHasLoaded(true);
      } else {
        throw new Error(data.error);
      }

    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast({
        title: "컨텐츠 로딩 오류",
        description: "추천 컨텐츠를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      '발달놀이': '🎯',
      '부모교육': '👨‍👩‍👧‍👦',
      '치료방법': '🏥',
      '행동교정': '🎭',
      '감정조절': '💭',
      '사회성향상': '🤝'
    };
    return icons[category] || '📺';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '발달놀이': 'bg-blue-100 text-blue-800',
      '부모교육': 'bg-green-100 text-green-800',
      '치료방법': 'bg-red-100 text-red-800',
      '행동교정': 'bg-purple-100 text-purple-800',
      '감정조절': 'bg-yellow-100 text-yellow-800',
      '사회성향상': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">맞춤형 컨텐츠를 찾고 있습니다...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">📚</span>
            맞춤형 학습 컨텐츠
          </CardTitle>
          <CardDescription>
            관찰 결과를 바탕으로 AI가 추천하는 도움이 될 만한 유튜브 컨텐츠입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasLoaded ? (
            <div className="text-center py-8">
              <Button onClick={loadRecommendations} size="lg">
                <span className="text-lg mr-2">🎯</span>
                맞춤형 컨텐츠 추천받기
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                관찰 내용에 맞는 유튜브 컨텐츠를 AI가 분석해서 추천해드립니다
              </p>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((content, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getCategoryIcon(content.category)}</span>
                      <Badge className={getCategoryColor(content.category)}>
                        {content.category}
                      </Badge>
                      <Badge variant="outline">{content.duration}</Badge>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2">{content.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{content.description}</p>
                  
                  <div className="bg-blue-50 p-3 rounded-lg mb-3">
                    <p className="text-sm text-blue-800">
                      <strong>추천 이유:</strong> {content.reason}
                    </p>
                  </div>
                  
                  <Button 
                    asChild 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "컨텐츠 열기",
                        description: `${content.title} 영상을 새 창에서 확인하세요.`
                      });
                    }}
                  >
                    <a 
                      href={content.youtubeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <span className="text-red-600 text-xl">▶️</span>
                      유튜브에서 보기
                    </a>
                  </Button>
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💡</span>
                  <h4 className="font-semibold text-blue-900">컨텐츠 활용 팁</h4>
                </div>
                <ul className="text-sm text-blue-800 space-y-1 ml-6">
                  <li>• 영상을 시청한 후 아이와 함께 실습해보세요</li>
                  <li>• 전문가의 조언을 메모해두고 일상에 적용해보세요</li>
                  <li>• 궁금한 점은 영상 댓글이나 전문가에게 문의하세요</li>
                  <li>• 꾸준한 관찰과 기록으로 변화를 확인해보세요</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">추천할 컨텐츠를 찾지 못했습니다.</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setHasLoaded(false);
                  loadRecommendations();
                }}
                className="mt-2"
              >
                다시 시도
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ObservationResults;