import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Crown, Download, Brain, TrendingUp, FileText, Sparkles, Calendar, Target, MessageSquare, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FeedbackModal from "@/components/FeedbackModal";
import EarlyScreeningSection from "@/components/assessment/EarlyScreeningSection";
import { EnhancedChart } from "@/components/ui/enhanced-chart";
import html2pdf from "html2pdf.js";

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
  const [tokenError, setTokenError] = useState<string | null>(null);

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
      
    } catch (error: any) {
      console.error('Error generating AI analysis:', error);
      const msg = error?.message || String(error);
      if (msg.includes('토큰') || msg.toLowerCase().includes('token')) {
        setTokenError(msg);
        setAiAnalysis('토큰 부족으로 AI 분석을 실행할 수 없습니다. 토큰을 충전한 후 다시 시도해 주세요.');
      } else {
        setAiAnalysis('분석을 생성하는 중 오류가 발생했습니다. 기본 해석을 제공합니다.');
      }
      toast({
        title: '분석 오류',
        description: msg,
        variant: 'destructive'
      });
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
      
      // Create PDF content element
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.6; color: #333;">
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #8B5CF6; padding-bottom: 20px;">
            <h1 style="font-size: 28px; margin: 0 0 10px 0; color: #8B5CF6; font-weight: bold;">프리미엄 AIH 검사 결과 보고서</h1>
            <h2 style="font-size: 20px; margin: 0 0 10px 0; color: #6366F1;">${assessmentInfo.title}</h2>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">검사일: ${new Date().toLocaleDateString()}</p>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">평균 점수: ${averageScore.toFixed(1)}/7.0</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; color: #8B5CF6; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 2px solid #E5E7EB;">📊 영역별 상세 점수</h3>
            <div style="display: grid; gap: 15px;">
              ${Object.entries(results).map(([category, score]) => {
                const interpretation = getScoreInterpretation(score, category);
                const percentage = (score / 7) * 100;
                return `
                  <div style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px; background: #F9FAFB;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <strong style="color: #374151;">${translateCategory(category)}</strong>
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="background: ${interpretation.color}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">${interpretation.level}</span>
                        <strong style="color: #111827; font-size: 16px;">${score.toFixed(1)}</strong>
                      </div>
                    </div>
                    <div style="background: #E5E7EB; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 5px;">
                      <div style="background: linear-gradient(90deg, #8B5CF6, #6366F1); height: 100%; width: ${percentage}%; border-radius: 4px;"></div>
                    </div>
                    <p style="margin: 0; font-size: 12px; color: #6B7280;">${interpretation.description}</p>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; color: #8B5CF6; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 2px solid #E5E7EB;">🧠 AIH 전문 분석 보고서</h3>
            <div style="background: linear-gradient(135deg, #F0F9FF, #F3E8FF); border: 1px solid #C7D2FE; border-radius: 12px; padding: 20px;">
              <div style="white-space: pre-wrap; line-height: 1.7; font-size: 14px; color: #374151;">
                ${aiAnalysis || "분석을 완료하는 중입니다..."}
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; color: #8B5CF6; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 2px solid #E5E7EB;">📋 검사 정보</h3>
            <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px;">
              <p style="margin: 5px 0; font-size: 14px;"><strong>검사 유형:</strong> ${assessmentInfo.title}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>문항 수:</strong> ${assessmentInfo.questions_count || 'N/A'}개</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>소요 시간:</strong> ${assessmentInfo.duration || 'N/A'}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>검사 등급:</strong> 프리미엄 전문 검사</p>
            </div>
          </div>
          
          <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 15px; margin-top: 30px;">
            <h4 style="color: #92400E; margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">⚠️ 중요 안내사항</h4>
            <p style="margin: 0; font-size: 12px; color: #92400E; line-height: 1.5;">
              본 검사 결과는 AI 기반 심층 분석을 통해 제공되는 참고 자료입니다. 
              정확한 진단이나 치료가 필요한 경우 반드시 전문가와 상담하시기 바랍니다.
              검사 결과는 개인의 현재 상태를 반영하며, 시간이 지남에 따라 변화할 수 있습니다.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="margin: 0; font-size: 12px; color: #9CA3AF;">AIH - AI Health Platform | 프리미엄 심리검사</p>
          </div>
        </div>
      `;
      
      // Configure PDF options
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `${assessmentInfo.title}_결과보고서_${new Date().toLocaleDateString().replace(/\./g, '')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };
      
      // Generate PDF
      await html2pdf().set(opt).from(element).save();
      
      toast({
        title: "PDF 다운로드 완료",
        description: "프리미엄 분석 보고서가 성공적으로 다운로드되었습니다.",
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
      // TCI 요인
      'novelty_seeking': 'Novelty Seeking (자극추구)',
      'harm_avoidance': 'Harm Avoidance (위험회피)', 
      'reward_dependence': 'Reward Dependence (사회적 민감성)',
      'persistence': 'Persistence (인내력)',
      'self_directedness': 'Self-Directedness (자율성)',
      'cooperativeness': 'Cooperativeness (협조성)',
      'self_transcendence': 'Self-Transcendence (자기초월)',
      
      // Big Five 요인  
      'extraversion': 'Extraversion (외향성)',
      'agreeableness': 'Agreeableness (친화성)',
      'conscientiousness': 'Conscientiousness (성실성)',
      'neuroticism': 'Neuroticism (신경성)',
      'openness': 'Openness (개방성)',
      
      // 번아웃/직장 스트레스 요인
      'emotional_exhaustion': 'Emotional Exhaustion (감정소진)',
      'depersonalization': 'Depersonalization (비인격화)',
      'personal_accomplishment': 'Personal Accomplishment (성취감)',
      'work_life_balance': 'Work-Life Balance (일-삶 균형)',
      'job_satisfaction': 'Job Satisfaction (직무만족)',
      'work_overload': 'Work Overload (업무과부하)',
      'interpersonal_conflict': 'Interpersonal Conflict (대인갈등)',
      'role_ambiguity': 'Role Ambiguity (역할모호성)',
      'career_development': 'Career Development (경력개발)',
      'organizational_support': 'Organizational Support (조직지원)',
      
      // 기타 영역
      'social_energy': 'Social Energy (사회적 에너지)',
      'decision_making': 'Decision Making (의사결정)',
      'emotional_regulation': 'Emotional Regulation (감정조절)',
      'adaptability': 'Adaptability (적응성)',
      'stress_tolerance': 'Stress Tolerance (스트레스 내성)',
      'cognitive_flexibility': 'Cognitive Flexibility (인지유연성)',
      'achievement_motivation': 'Achievement Motivation (성취동기)',
      'interpersonal_skills': 'Interpersonal Skills (대인관계)',
      'self_confidence': 'Self Confidence (자신감)',
      'emotional_intelligence': 'Emotional Intelligence (감정지능)'
    };
    return translations[category.toLowerCase()] || category.replace(/_/g, ' ');
  };

  const totalScore = Object.values(results).reduce((sum, score) => sum + score, 0);
  const averageScore = totalScore / Object.keys(results).length;

  // 차트 데이터 준비
  const chartData = Object.entries(results).map(([category, score]) => {
    const interpretation = getScoreInterpretation(score, category);
    return {
      name: translateCategory(category),
      value: score,
      color: interpretation.color.replace('bg-', '').replace('-500', ''),
      description: interpretation.description
    };
  });

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
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    시각화 차트 분석
                  </h3>
                  <EnhancedChart 
                    data={chartData}
                    title="영역별 점수 분포"
                    description="각 영역의 상대적 강도를 한눈에 확인하세요"
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    영역별 상세 점수 (Score Details)
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(results).map(([category, score]) => {
                      const interpretation = getScoreInterpretation(score, category);
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">
                              {translateCategory(category)}
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`${interpretation.color} text-white text-xs`}>
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
              {tokenError && (
                <div className="mb-4 p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                  <p className="text-sm text-yellow-800 mb-3">⚠️ {tokenError}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => navigate('/token-subscription')} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      토큰 충전하기
                    </Button>
                    <Button size="sm" variant="outline" onClick={generateAIAnalysis} disabled={isAnalyzing}>
                      다시 시도
                    </Button>
                  </div>
                </div>
              )}
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

        {/* AIH 조기선별 섹션 */}
        <EarlyScreeningSection
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