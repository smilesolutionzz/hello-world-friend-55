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

  // AI 분석 데이터 추출
  const aiAnalysis = session.observations?.analysis_data?.ai_analysis || 
                     session.observations?.ai_analysis || 
                     session.analysis_data?.ai_analysis ||
                     session.ai_analysis;
  
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

  const timeSeriesData = [
    { date: '1주차', score: 3.2 },
    { date: '2주차', score: 3.5 },
    { date: '3주차', score: 3.8 },
    { date: '4주차', score: 4.1 },
  ];

  const isPremiumUser = subscriptionData?.subscription_status === 'premium';
  const hasUsagesLeft = !subscriptionData || subscriptionData.usage_count < 3;
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
          {/* Basic summary for overview */}
          <Card>
            <CardHeader>
              <CardTitle>종합 개요</CardTitle>
              <CardDescription>관찰 결과의 전체적인 요약입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm leading-relaxed">
                {aiAnalysis?.situation || "관찰 결과를 분석했습니다. 전반적으로 안정적인 상태를 보이고 있습니다."}
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

            {/* Dynamic AI Analysis Results */}
            {aiAnalysis ? (
              <div className="grid gap-6">
                {/* 상황 분석 */}
                {aiAnalysis.situation && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        상황 분석
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {aiAnalysis.situation}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 주요 포인트/현재 상태 평가 */}
                {aiAnalysis.points && aiAnalysis.points.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-amber-600" />
                        {isAdult ? '현재 상태 평가' : '주요 포인트'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {aiAnalysis.points.map((point: string, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                            <div className="text-sm leading-relaxed">{point}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 긍정적 측면/관심 사항 */}
                {aiAnalysis.positives && aiAnalysis.positives.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        {isAdult ? '긍정적 측면' : '주요 관심 사항'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {aiAnalysis.positives.map((positive: string, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            <div className="text-sm leading-relaxed">{positive}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 개선 방안 */}
                {aiAnalysis.tips && aiAnalysis.tips.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-green-600" />
                        개선 방안
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {aiAnalysis.tips.map((tip: string, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div className="text-sm leading-relaxed">{tip}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 주의사항/알림 */}
                {aiAnalysis.alerts && aiAnalysis.alerts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        주의사항
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {aiAnalysis.alerts.map((alert: string, index: number) => (
                          <div key={index} className="p-3 bg-red-50 rounded-lg">
                            <div className="text-sm text-red-700 leading-relaxed">{alert}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 미디어 노트 */}
                {aiAnalysis.mediaNotes && aiAnalysis.mediaNotes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-purple-600" />
                        미디어 분석 노트
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {aiAnalysis.mediaNotes.map((note: string, index: number) => (
                          <div key={index} className="text-sm text-muted-foreground">
                            • {note}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              /* Fallback static content when no AI analysis available */
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      {isAdult ? '현재 상태 평가' : '발달 상태 평가'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        현재 {isAdult ? '상태' : '발달'} 수준: <span className="font-medium text-foreground">연령대 적합</span>
                      </div>
                      <Progress value={75} className="h-2" />
                      <div className="text-sm">
                        {session.observations?.target_name || '대상자'}의 전반적인 상태는 연령대에 적합한 수준을 보이고 있으며, 
                        지속적인 관찰과 지원이 도움이 될 것입니다.
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-green-600" />
                      개선 방안
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium">지속적인 관찰</div>
                          <div className="text-muted-foreground">정기적인 관찰을 통해 변화를 추적해보세요.</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium">긍정적 피드백</div>
                          <div className="text-muted-foreground">작은 성취에도 즉시적이고 구체적인 격려를 해주세요.</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 전문가 상담 권장 */}
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-purple-800 mb-2">전문가 상담 권장</h3>
                    <p className="text-purple-700 text-sm mb-4">
                      현재 관찰된 내용을 바탕으로 전문가와의 상담을 통해 더 구체적인 지원 방안을 논의하는 것이 도움이 될 수 있습니다.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => navigate('/expert-consultation')}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        전문가 상담 신청
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-purple-300 text-purple-700"
                        onClick={() => navigate('/assessment')}
                      >
                        심화 평가 받기
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 추천 콘텐츠 */}
            <ProductRecommendation 
              category="child" 
              domain={session.observations?.domain || session.domain}
              severity={riskLevel}
            />
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <RecommendationPanel session={session} />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <ContentRecommendationPanel session={session} />
        </TabsContent>
      </Tabs>

      {/* Media Section */}
      {mediaFiles && mediaFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              관찰 미디어
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MediaDisplay mediaFiles={mediaFiles} title="관찰 기록 미디어" />
          </CardContent>
        </Card>
      )}

      {/* AI 이미지 생성 */}
      <Card>
        <CardHeader>
          <CardTitle>관찰 기반 맞춤 이미지 생성</CardTitle>
          <CardDescription>
            관찰일지 내용을 바탕으로 {isAdult ? '대상자' : '아이'}의 {isAdult ? '상태' : '발달'}와 치료에 도움이 되는 이미지를 생성해보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageGenerator
            initialPrompt={`${session.observations?.session_name || session.session_name}에서 관찰된 ${isAdult ? '대상자' : '아이'}의 ${isAdult ? '상태' : '발달'} 상황을 표현하는 따뜻하고 격려적인 이미지`}
            context={`관찰일지 - ${session.observations?.session_name || session.session_name}, 분석결과: ${analysisData?.summary || '긍정적 상태'}`}
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

export default ObservationResults;