import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cleanMarkdown } from '@/utils/cleanMarkdown';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ContentRecommendationPanel from "./ContentRecommendationPanel";
import { ResourceRecommendations } from "./ResourceRecommendations";
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
  TrendingUp,
  LineChart,
  Loader2,
  Eye,
  Lightbulb,
  Image as ImageIcon,
  Play
} from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ObservationDetailViewProps {
  session: any;
  onBack: () => void;
}

const ObservationDetailView = ({ session, onBack }: ObservationDetailViewProps) => {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);

  // 데이터 추출
  const observations = session.observations || {};
  const analysisData = observations.analysis_data || {};
  const aiReport = analysisData.report || {};
  const scores = analysisData.score || {};
  const domainScores = scores.domains || {};
  const overallScore = scores.overall || 0;
  
  // 미디어 파일
  const mediaFiles = observations.media_files || [];

  const generatePDFReport = async () => {
    try {
      setGenerating(true);

      // 전체 분석 데이터를 포함한 완전한 세션 데이터 구성
      const fullSessionData = {
        ...session,
        analysis_data: session.observations?.analysis_data || session.analysis_data,
        raw_data: session.observations?.raw_data || session.raw_data
      };

      console.log('Sending session data for PDF:', fullSessionData);

      const { data, error } = await supabase.functions.invoke('generate-observation-report', {
        body: {
          sessionData: fullSessionData,
          reportType: 'comprehensive'
        }
      });

      if (error) throw error;

      if (data && data.reportData && data.reportData.html) {
        // PDF 생성을 위한 새 창 열기
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
        description: "전문 관찰 리포트가 생성되었습니다.",
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

  const getRiskLevelInfo = (level: string) => {
    const info = {
      low: { text: '양호', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
      medium: { text: '보통', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock },
      high: { text: '주의', color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertTriangle }
    };
    return info[level as keyof typeof info] || info.medium;
  };

  const getDomainDisplayName = (domain: string) => {
    const names = {
      child_development: '아동발달',
      psychology: '심리상담',
      elderly_care: '노인케어',
      workplace: '직장적응',
      learning: '학습능력',
      family: '가족상담',
      medical: '의료재활',
      general: '일반관찰'
    };
    return names[domain as keyof typeof names] || domain;
  };

  // 차트 데이터 준비
  const radarData = Object.entries(domainScores).map(([domain, score]) => ({
    domain: domain.length > 4 ? domain.substring(0, 4) : domain,
    score: Number(score) || 0,
    fullDomain: domain
  }));

  const barData = Object.entries(domainScores).map(([domain, score]) => ({
    domain: domain.length > 6 ? domain.substring(0, 6) + '..' : domain,
    score: Number(score) || 0,
    fullDomain: domain
  }));

  // 위험도 정보
  const riskLevel = analysisData.riskLevel || 'medium';
  const riskInfo = getRiskLevelInfo(riskLevel);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            {observations.session_name || `${getDomainDisplayName(observations.domain)} 관찰일지`}
          </h2>
          <p className="text-muted-foreground">
            {observations.target_name || observations.observer_name}님의 관찰 결과
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {new Date(session.created_at).toLocaleDateString('ko-KR')}
            </Badge>
            <Badge className={`${riskInfo.bgColor} ${riskInfo.color} text-xs`}>
              위험도: {riskInfo.text}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={generatePDFReport}
            disabled={generating}
            className="bg-primary"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                PDF 리포트
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            돌아가기
          </Button>
        </div>
      </div>

      {/* 기본 정보 카드 */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">관찰자</div>
                <div className="font-medium">{observations.observer_name || '관찰자'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">관찰 기간</div>
                <div className="font-medium">
                  {observations.observation_period_start && observations.observation_period_end ? (
                    `${new Date(observations.observation_period_start).toLocaleDateString('ko-KR')} ~ ${new Date(observations.observation_period_end).toLocaleDateString('ko-KR')}`
                  ) : (
                    new Date(session.created_at).toLocaleDateString('ko-KR')
                  )}
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
                <div className="text-sm text-muted-foreground">전체 점수</div>
                <div className="font-medium">
                  {overallScore}/100
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 탭 컨텐츠 */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">종합 개요</TabsTrigger>
          <TabsTrigger value="analysis">AI 분석</TabsTrigger>
          <TabsTrigger value="media">첨부 파일</TabsTrigger>
          <TabsTrigger value="recommendations">권고사항</TabsTrigger>
        </TabsList>

        {/* 종합 개요 */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>관찰 상황 요약</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm leading-relaxed">
                {aiReport.situation || observations.ai_analysis || "관찰 결과를 분석했습니다."}
              </div>
            </CardContent>
          </Card>

          {/* 점수 개요 */}
          {Object.keys(domainScores).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>영역별 점수 개요</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(domainScores).map(([domain, score]) => (
                    <div key={domain} className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {Number(score) || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">{domain}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI 분석 */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>AI 전문 분석 결과</CardTitle>
                  <CardDescription>
                    관찰 데이터를 바탕으로 한 종합 분석입니다
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 상황 분석 */}
              {aiReport.situation && (
                <div>
                  <h4 className="font-semibold mb-2">📋 상황 분석</h4>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm leading-relaxed">{aiReport.situation}</p>
                  </div>
                </div>
              )}

              {/* 주요 포인트 */}
              {aiReport.points && aiReport.points.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">🎯 주요 관찰 포인트</h4>
                  <div className="space-y-2">
                    {aiReport.points.map((point: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 개선 팁 */}
              {aiReport.tips && aiReport.tips.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">💡 개선 제안</h4>
                  <div className="space-y-2">
                    {aiReport.tips.map((tip: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                        <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 주의사항 */}
              {aiReport.alerts && aiReport.alerts.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">⚠️ 주의사항</h4>
                  <div className="space-y-2">
                    {aiReport.alerts.map((alert: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{alert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 첨부 파일 */}
        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>첨부된 미디어 파일</CardTitle>
              <CardDescription>관찰 과정에서 첨부된 이미지와 영상</CardDescription>
            </CardHeader>
            <CardContent>
              {mediaFiles.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mediaFiles.map((file: any, index: number) => (
                    <div key={index} className="relative group">
                      {file.type === 'image' ? (
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                          <img 
                            src={file.url} 
                            alt={`관찰 이미지 ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(file.url, '_blank')}
                          />
                          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                            <ImageIcon className="h-3 w-3" />
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                             onClick={() => window.open(file.url, '_blank')}>
                          <Play className="h-8 w-8 text-muted-foreground" />
                          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                            VIDEO
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  첨부된 미디어 파일이 없습니다.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 권고사항 */}
        <TabsContent value="recommendations" className="space-y-6">
          {/* Full AI Analysis if available */}
          {aiReport.fullText && (
            <Card>
              <CardHeader>
                <CardTitle>전문가 분석 전문</CardTitle>
                <CardDescription>임상심리사 수준의 종합 분석</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cleanMarkdown(aiReport.fullText).split('\n\n').filter(Boolean).map((p: string, i: number) => (
                    <p key={i} className="text-sm leading-[1.8] text-foreground/85">{p.trim()}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations from AI */}
          {aiReport.tips && aiReport.tips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>전문가 권고사항</CardTitle>
                <CardDescription>관찰 결과를 바탕으로 한 맞춤형 제안</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiReport.tips.map((tip: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                      <p className="text-blue-800 flex-1">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alerts from AI */}
          {aiReport.alerts && aiReport.alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>전문가 상담 권장</CardTitle>
                <CardDescription>전문가 개입이 필요한 영역</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiReport.alerts.map((alert: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
                      <p className="text-red-800 flex-1">{alert}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content Recommendations */}
          <ContentRecommendationPanel session={session} />

          {/* AI Powered Resource Recommendations */}
          <ResourceRecommendations 
            keywords={aiReport.keywords || []}
            childAge={session.child_age}
            behaviorType={aiReport.behavior_type || '발달'}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ObservationDetailView;