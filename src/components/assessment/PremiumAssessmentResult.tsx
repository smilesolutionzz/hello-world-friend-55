import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Crown, Download, Brain, TrendingUp, FileText, Sparkles, Calendar, Target, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FeedbackModal from "@/components/FeedbackModal";
import EarlyDiagnosisSection from "@/components/assessment/EarlyDiagnosisSection";

interface PremiumAssessmentResultProps {
  assessmentType: string;
  results: Record<string, number>;
  assessmentInfo: any;
  onBack: () => void;
}

const PremiumAssessmentResult = ({ 
  assessmentType, 
  results, 
  assessmentInfo, 
  onBack 
}: PremiumAssessmentResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    generateAIAnalysis();
  }, []);

  const generateAIAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      
      const response = await supabase.functions.invoke('premium-assessment-analyzer', {
        body: {
          assessmentType,
          results,
          assessmentInfo,
          timestamp: new Date().toISOString()
        }
      });

      if (response.error) {
        console.error('AI Analysis Error:', response.error);
        throw new Error(response.error.message);
      }

      setAiAnalysis(response.data.analysis);
      
      // 결과를 데이터베이스에 저장
      await saveAssessmentResult(response.data.analysis);
      
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      toast({
        title: "분석 오류",
        description: "AI 분석 생성 중 오류가 발생했습니다. 다시 시도해 주세요.",
        variant: "destructive"
      });
      setAiAnalysis("분석을 생성하는 중 오류가 발생했습니다. 기본 해석을 제공합니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAssessmentResult = async (analysis: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 검사 결과를 test_results 테이블에 저장
      const { error } = await supabase.functions.invoke('save-test-result', {
        body: {
          testType: assessmentType,
          results: results,
          analysis: analysis,
          testInfo: assessmentInfo,
          ageGroup: 'adult' // 프리미엄 검사는 성인 대상
        }
      });

      if (error) {
        console.error('Error saving test result:', error);
        throw error;
      }

      console.log('Assessment result saved to database');
    } catch (error) {
      console.error('Error saving assessment result:', error);
    }
  };

  const generatePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      
      const response = await supabase.functions.invoke('generate-premium-pdf', {
        body: {
          assessmentType,
          results,
          assessmentInfo,
          aiAnalysis,
          timestamp: new Date().toISOString()
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // HTML 컨텐츠를 새 창에서 열어 인쇄 가능하도록 함
      const htmlContent = response.data.htmlContent;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }

      toast({
        title: "PDF 준비 완료",
        description: "새 창에서 인쇄 대화상자가 열립니다. PDF로 저장하시려면 인쇄 대상을 'PDF로 저장'으로 선택하세요.",
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF 생성 오류",
        description: "PDF 생성 중 오류가 발생했습니다. 다시 시도해 주세요.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getScoreInterpretation = (score: number, category: string) => {
    if (score >= 6) return { level: "High (높음)", color: "bg-red-500", description: "매우 강한 특성" };
    if (score >= 5) return { level: "Above Average (중상)", color: "bg-orange-500", description: "강한 특성" };
    if (score >= 4) return { level: "Average (보통)", color: "bg-yellow-500", description: "일반적 특성" };
    if (score >= 3) return { level: "Below Average (중하)", color: "bg-green-500", description: "약한 특성" };
    return { level: "Low (낮음)", color: "bg-blue-500", description: "매우 약한 특성" };
  };

  const translateCategory = (category: string) => {
    const translations: Record<string, string> = {
      'novelty_seeking': 'Novelty Seeking (자극추구)',
      'harm_avoidance': 'Harm Avoidance (위험회피)', 
      'reward_dependence': 'Reward Dependence (사회적 민감성)',
      'persistence': 'Persistence (인내력)',
      'self_directedness': 'Self-Directedness (자율성)',
      'cooperativeness': 'Cooperativeness (협조성)',
      'self_transcendence': 'Self-Transcendence (자기초월)',
      'extraversion': 'Extraversion (외향성)',
      'agreeableness': 'Agreeableness (친화성)',
      'conscientiousness': 'Conscientiousness (성실성)',
      'neuroticism': 'Neuroticism (신경성)',
      'openness': 'Openness (개방성)'
    };
    return translations[category.toLowerCase()] || category.replace(/_/g, ' ');
  };

  const totalScore = Object.values(results).reduce((sum, score) => sum + score, 0);
  const averageScore = totalScore / Object.keys(results).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-blue-50/30 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-yellow-200/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                프리미엄 분석 결과
              </h1>
              <Crown className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-lg text-muted-foreground">
              {assessmentInfo.title} • AI 심층 분석 완료
            </p>
          </div>
          
          <div className="w-20" />
        </div>

        {/* Overall Score Card */}
        <div className="max-w-6xl mx-auto mb-8">
          <Card className="overflow-hidden hover-glow border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{assessmentInfo.title}</CardTitle>
                  <p className="text-purple-100 mt-1">{assessmentInfo.subtitle}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{averageScore.toFixed(1)}</div>
                  <div className="text-sm text-purple-100">평균 점수</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    영역별 상세 점수
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(results).map(([category, score]) => {
                      const interpretation = getScoreInterpretation(score, category);
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {translateCategory(category)}
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`${interpretation.color} text-white`}>
                                {interpretation.level}
                              </Badge>
                              <span className="font-bold">{score.toFixed(1)}</span>
                            </div>
                          </div>
                          <Progress value={(score / 7) * 100} className="h-2" />
                          <p className="text-xs text-muted-foreground">{interpretation.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    검사 정보
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">검사일:</span> {new Date().toLocaleDateString()}</p>
                    <p><span className="font-medium">문항 수:</span> {assessmentInfo.questions_count}개</p>
                    <p><span className="font-medium">소요 시간:</span> {assessmentInfo.duration}</p>
                    <p><span className="font-medium">검사 유형:</span> 프리미엄 전문 검사</p>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      ※ {assessmentInfo.disclaimer}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Section */}
        <div className="max-w-6xl mx-auto mb-8">
          <Card className="overflow-hidden hover-glow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">AIH 전문 분석 보고서</h2>
                  <p className="text-sm text-muted-foreground">AI 기반 전문가 수준 해석 + 조기 위험요소 체크</p>
                </div>
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isAnalyzing ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-lg font-medium">AI가 심층 분석 중입니다...</p>
                    <p className="text-sm text-muted-foreground">조기 위험요소 체크 포함</p>
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {aiAnalysis || "분석을 생성하는 중 오류가 발생했습니다."}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AIH 조기진단 섹션 */}
        <EarlyDiagnosisSection 
          assessmentType={assessmentType}
          results={results}
          isAnalyzing={isAnalyzing}
        />

        {/* Action Buttons */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-4">
            <Button
              onClick={generatePDF}
              disabled={isGeneratingPDF || isAnalyzing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex items-center gap-2"
              size="lg"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  생성 중...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  PDF 다운로드
                </>
              )}
            </Button>

            <Button
              onClick={() => setShowFeedbackModal(true)}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
            >
              <MessageSquare className="w-5 h-5" />
              후기 남기기
            </Button>

            <Button
              onClick={() => navigate('/premium-assessment')}
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <Target className="w-5 h-5" />
              다른 검사 하기
            </Button>

            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              검사 기록 보기
            </Button>
          </div>
        </div>

        {/* Feedback Modal */}
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          testType={assessmentInfo.title}
          onFeedbackSubmitted={() => {
            toast({
              title: "후기 작성 완료",
              description: "소중한 후기가 다른 이용자들에게 도움이 될 것입니다!",
            });
          }}
        />

        {/* Professional Notice */}
        <div className="max-w-6xl mx-auto mt-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <h4 className="font-semibold text-blue-900 mb-2">전문 심리검사 결과 안내</h4>
              <p className="text-blue-800 text-sm leading-relaxed">
                본 검사 결과는 AI 기반 심층 분석을 통해 제공되는 참고 자료입니다. 
                정확한 진단이나 치료가 필요한 경우 반드시 전문가와 상담하시기 바랍니다.
                검사 결과는 개인의 현재 상태를 반영하며, 시간이 지남에 따라 변화할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PremiumAssessmentResult;