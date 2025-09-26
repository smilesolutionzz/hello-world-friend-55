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

      if (data && data.reportData && data.reportData.html) {
        // HTML을 새 창으로 열어서 PDF로 인쇄할 수 있게 함
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(data.reportData.html);
          printWindow.document.close();
          
          printWindow.onload = () => {
            printWindow.focus();
            setTimeout(() => {
              printWindow.print();
            }, 500);
          };
        }
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

  // AI 분석 데이터 추출 - 올바른 경로로 수정
  const aiAnalysis = session.observations?.ai_analysis || 
                      session.observations?.analysis_data?.ai_analysis || 
                      session.analysis_data?.ai_analysis ||
                      session.ai_analysis;
  
  const analysisData = session.observations?.analysis_data || session.observations || {};
  const scores = analysisData.scores || session.observations?.scores || {};
  const riskLevel = analysisData.riskLevel || session.observations?.riskLevel || 'medium';
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

  const timeSeriesData = [
    { date: '1주차', score: 3.2 },
    { date: '2주차', score: 3.5 },
    { date: '3주차', score: 3.8 },
    { date: '4주차', score: 4.1 },
  ];

  const isPremiumUser = subscriptionData?.subscription_status === 'premium';
  const hasUsagesLeft = !subscriptionData || subscriptionData.usage_count < 5;
  const canViewAdvanced = isPremiumUser || hasUsagesLeft;

  // 연령대 확인
  const ageGroup = session.observations?.analysis_data?.age_group || 
                   session.observations?.age_group || 
                   session.analysis_data?.age_group || 
                   'child';
  
  const isAdult = ageGroup === 'adult' || ageGroup === 'senior';

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
                  무료 체험은 5회까지 요약 제공. 심화 리포트와 PDF는 구독 전환 후 이용 가능합니다.
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

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">종합 개요</TabsTrigger>
          <TabsTrigger value="scores">점수 분석</TabsTrigger>
          <TabsTrigger value="analysis">AI 분석</TabsTrigger>
          <TabsTrigger value="recommendations">권고사항</TabsTrigger>
          <TabsTrigger value="content">컨텐츠 추천</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Basic summary for overview */}
          <Card>
            <CardHeader>
              <CardTitle>종합 개요</CardTitle>
              <CardDescription>관찰 결과의 전체적인 요약입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm leading-relaxed">
                {typeof aiAnalysis === 'string' 
                  ? aiAnalysis.substring(0, 500) + (aiAnalysis.length > 500 ? '...' : '')
                  : aiAnalysis?.situation || "관찰 결과를 분석했습니다. 전반적으로 안정적인 상태를 보이고 있습니다."
                }
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scores" className="space-y-6">
          {radarData.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>영역별 점수 분석</CardTitle>
                <CardDescription>각 영역별 상세 점수와 차트를 확인하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">레이더 차트</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" />
                        <PolarRadiusAxis domain={[0, 5]} />
                        <Radar name="점수" dataKey="score" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">막대 차트</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Bar dataKey="score" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                점수 데이터가 없습니다.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="space-y-6">
            {/* AI 분석 결과 헤더 */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">AI 전문 분석 결과</CardTitle>
                    <CardDescription>
                      {session.observations?.target_name || '대상자'}님의 관찰 데이터를 바탕으로 한 종합 분석입니다
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* AI 분석 결과 파싱 - 올바른 경로로 수정 */}
            {(() => {
              // 분석 데이터 추출 - ObservationFormMobile에서 저장한 구조에 맞게 수정
              const reportData = session.observations?.analysis_data?.report || 
                                session.analysis_data?.report;
              
              console.log('Full session data:', session);
              console.log('Analysis Report Data:', reportData);
              console.log('Analysis Data:', session.observations?.analysis_data);
              
              if (reportData) {
                return (
                  <div className="grid gap-6">
                    {/* 상황 분석 */}
                    {reportData.situation && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            상황 분석
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm leading-relaxed whitespace-pre-wrap bg-blue-50 p-4 rounded-lg">
                            {reportData.situation}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* 주요 관찰 포인트 */}
                    {reportData.points && reportData.points.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-green-600" />
                            🎯 주요 관찰 포인트
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {reportData.points.map((point: string, index: number) => (
                              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm leading-relaxed">{point}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* 개선 제안 */}
                    {reportData.tips && reportData.tips.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-600" />
                            💡 개선 제안
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {reportData.tips.map((tip: string, index: number) => (
                              <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                                <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm leading-relaxed">{tip}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* 긍정적 측면 (상세 모드에서만) */}
                    {reportData.positives && reportData.positives.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                            ✨ 긍정적 측면
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {reportData.positives.map((positive: string, index: number) => (
                              <div key={index} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                                <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm leading-relaxed">{positive}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* 주의사항 */}
                    {reportData.alerts && reportData.alerts.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            ⚠️ 주의사항
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {reportData.alerts.map((alert: string, index: number) => (
                              <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm leading-relaxed">{alert}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* 미디어 노트 */}
                    {reportData.mediaNotes && reportData.mediaNotes.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-purple-600" />
                            📎 미디어 분석 노트
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {reportData.mediaNotes.map((note: string, index: number) => (
                              <div key={index} className="text-sm p-2 bg-purple-50 rounded">
                                {note}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
              }

              // 기존 AI 분석이 있는 경우 (문자열)
              if (aiAnalysis && typeof aiAnalysis === 'string') {
                return (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        전문가 분석 결과
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap bg-blue-50 p-4 rounded-lg">
                        {aiAnalysis}
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              // 데이터가 없는 경우
              return (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-medium mb-2">AI 분석 데이터를 불러오는 중...</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      분석 데이터가 표시되지 않는 경우, 관찰일지를 새로 생성해보세요.
                    </p>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                      페이지 새로고침
                    </Button>
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <RecommendationPanel session={session} />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <ContentRecommendationPanel session={session} />
        </TabsContent>
      </Tabs>

      {/* Media Files Display */}
      {mediaFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>첨부된 미디어</CardTitle>
            <CardDescription>관찰 중 촬영된 사진과 동영상입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <MediaDisplay mediaFiles={mediaFiles} />
          </CardContent>
        </Card>
      )}

      {/* Subscription CTA at bottom */}
      <div className="mt-8">
        <TokenCTA context="observation" />
      </div>
    </div>
  );
};

export default ObservationResults;