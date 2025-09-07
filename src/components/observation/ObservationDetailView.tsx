import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Brain, Target, TrendingUp, AlertTriangle, CheckCircle, Award } from "lucide-react";

interface ObservationDetailViewProps {
  session: any;
  onBack: () => void;
}

const ObservationDetailView = ({ session, onBack }: ObservationDetailViewProps) => {
  const { toast } = useToast();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const getDomainDisplayName = (domain: string): string => {
    const domainMap: { [key: string]: string } = {
      emotion: "정서",
      behavior: "행동", 
      cognitive: "인지",
      social: "사회성",
      physical: "신체",
      language: "언어발달",
      self_regulation: "자기조절능력"
    };
    return domainMap[domain] || domain;
  };

  const getDomainColor = (domain: string): string => {
    const colorMap: { [key: string]: string } = {
      emotion: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      behavior: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      cognitive: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      social: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      physical: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      language: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      self_regulation: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
    };
    return colorMap[domain] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreLevel = (score: number): { label: string; icon: React.ReactNode } => {
    if (score >= 90) return { label: "우수", icon: <Award className="w-4 h-4" /> };
    if (score >= 80) return { label: "양호", icon: <CheckCircle className="w-4 h-4" /> };
    if (score >= 60) return { label: "보통", icon: <TrendingUp className="w-4 h-4" /> };
    return { label: "주의", icon: <AlertTriangle className="w-4 h-4" /> };
  };

  const downloadReport = async () => {
    try {
      setIsGeneratingReport(true);
      
      const { data, error } = await supabase.functions.invoke('generate-observation-report', {
        body: { sessionId: session.id }
      });

      if (error) throw error;

      if (data?.reportUrl) {
        window.open(data.reportUrl, '_blank');
        toast({
          title: "리포트 생성 완료",
          description: "전문가 리포트가 성공적으로 생성되었습니다.",
        });
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "리포트 생성 실패",
        description: "리포트 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const analysisScore = session.analysis_score || {};
  const overallScore = analysisScore.overall || 0;
  const domainScores = analysisScore.domains || {};

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <span className="text-lg">←</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">관찰 분석 결과</h1>
            <p className="text-muted-foreground">
              {new Date(session.created_at).toLocaleDateString('ko-KR')} 기록
            </p>
          </div>
        </div>
        
        <Button
          onClick={downloadReport}
          disabled={isGeneratingReport}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Download className="w-4 h-4 mr-2" />
          {isGeneratingReport ? "생성 중..." : "전문가 리포트 다운로드"}
        </Button>
      </div>

      {/* 기본 정보 카드 */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <FileText className="w-5 h-5" />
            관찰 기록 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">대상자</p>
              <p className="font-semibold text-foreground">{session.target_name || '대상자'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">연령대</p>
              <p className="font-semibold text-foreground">
                {session.age_group === 'child' ? '아동' : 
                 session.age_group === 'teen' ? '청소년' : 
                 session.age_group === 'adult' ? '성인' : '노인'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">관찰 상황</p>
              <p className="font-semibold text-foreground">
                {session.context === 'home' ? '가정' :
                 session.context === 'institution' ? '기관' :
                 session.context === 'therapy' ? '치료실' : '기타'}
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">관찰 영역</p>
            <div className="flex flex-wrap gap-2">
              {session.observation_domains?.map((domain: string, index: number) => (
                <Badge key={index} className={getDomainColor(domain)}>
                  {getDomainDisplayName(domain)}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI 분석
          </TabsTrigger>
          <TabsTrigger value="scores" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            점수 분석
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            관찰 내용
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="mt-6">
          <div className="space-y-8">
            {/* 전문가 종합 분석 */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">박사급 전문가 분석 보고서</h3>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="prose prose-sm max-w-none text-foreground">
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {session.ai_analysis || '전문가 분석을 진행 중입니다...'}
                  </div>
                </div>
              </div>
            </div>

            {/* 맞춤형 권고사항 */}
            {session.recommendations && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">📋</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">맞춤형 권고사항</h3>
                </div>
                
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="prose prose-sm max-w-none text-foreground">
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {session.recommendations}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 추가 전문가 의견 */}
            <div className="bg-amber-50 dark:bg-amber-950/30 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">💡</span>
                </div>
                <h4 className="font-semibold text-amber-800 dark:text-amber-200">전문가 의견</h4>
              </div>
              <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">
                이 분석은 AI 기반 전문가 시스템에 의한 것으로, 참고용으로 활용하시기 바랍니다. 
                정확한 진단이나 치료가 필요한 경우 전문의와 상담하시기 바랍니다.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scores" className="mt-6">
          <div className="space-y-6">
            {/* 종합 점수 */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                    <Target className="w-5 h-5" />
                    종합 평가 점수
                  </span>
                  <div className="flex items-center gap-2">
                    {getScoreLevel(overallScore).icon}
                    <Badge variant="secondary" className={getScoreColor(overallScore)}>
                      {getScoreLevel(overallScore).label}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                    {overallScore}점
                  </div>
                  <p className="text-muted-foreground">100점 만점</p>
                </div>
                <Progress value={overallScore} className="h-3" />
              </CardContent>
            </Card>

            {/* 영역별 점수 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  영역별 상세 분석
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(domainScores).map(([domain, score]) => {
                    const numScore = Number(score);
                    const level = getScoreLevel(numScore);
                    return (
                      <div key={domain} className="p-4 border rounded-lg bg-muted/30">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-foreground">{domain}</span>
                          <div className="flex items-center gap-2">
                            {level.icon}
                            <span className={`font-bold ${getScoreColor(numScore)}`}>
                              {numScore}점
                            </span>
                          </div>
                        </div>
                        <Progress value={numScore} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">{level.label}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                관찰 내용
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-6 rounded-lg">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {session.observation_text}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ObservationDetailView;