import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Users, Heart, Shield, MessageCircle, Scale, HandHeart, Star, TrendingUp, Download, Printer, Loader2, Brain, Lightbulb, Target, Sparkles, ChevronRight, Crown, Wallet, Lock } from "lucide-react";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTestActions } from "@/hooks/useTestActions";
import { useWordDownload } from "@/hooks/useWordDownload";
import { Link } from "react-router-dom";
import { CashBalanceDisplay } from '@/components/paywall/CashBalanceDisplay';
import { BlurredContent } from '@/components/paywall/BlurredContent';
import { useSubscription } from '@/hooks/useSubscription';

interface RelationshipDynamicsResultProps {
  results: {
    answers: Record<string, string>;
    categoryScores: Record<string, number>;
    totalScore: number;
    relationshipType: string;
    strengths: string[];
    growthAreas: string[];
  };
  onBack: () => void;
}

interface AIAnalysis {
  overallAnalysis: string;
  categoryAnalysis: string;
  psychodynamicAnalysis: string;
  strengthStrategy: string;
  growthPlan: string;
  practiceGuide: string;
  expertRecommendation: string;
  fullAnalysis: string;
}

export default function RelationshipDynamicsResult({ results, onBack }: RelationshipDynamicsResultProps) {
  const { categoryScores, totalScore, relationshipType, strengths, growthAreas } = results;
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const { toast } = useToast();
  const { saveTestResult, isSaving } = useTestActions();
  const { generateWordDocument, printDocument } = useWordDownload();

  useEffect(() => {
    fetchAIAnalysis();
  }, []);

  const fetchAIAnalysis = async () => {
    setIsLoadingAnalysis(true);
    setAnalysisError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('relationship-dynamics-analyzer', {
        body: {
          totalScore,
          relationshipType,
          categoryScores,
          strengths,
          growthAreas
        }
      });

      if (error) throw error;
      if (data?.analysis) {
        setAiAnalysis(data.analysis);
      }
    } catch (error: any) {
      console.error('AI analysis error:', error);
      setAnalysisError('AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleSaveResult = async () => {
    await saveTestResult({
      testType: '관계 역동성 심층 분석',
      total: totalScore,
      average: totalScore,
      severity: relationshipType,
      answers: results.answers,
      scores: categoryScores,
      analysis: aiAnalysis?.fullAnalysis,
      recommendations: [aiAnalysis?.practiceGuide || '']
    });
  };

  const handleDownloadWord = () => {
    if (!aiAnalysis) return;
    
    generateWordDocument({
      title: '관계 역동성 심층 분석 결과',
      date: new Date().toLocaleDateString('ko-KR'),
      sections: [
        { title: '검사 개요', content: `관계 유형: ${relationshipType}\n종합 점수: ${totalScore}점` },
        { title: '종합 심리 분석', content: aiAnalysis.overallAnalysis },
        { title: '영역별 심층 해석', content: aiAnalysis.categoryAnalysis },
        { title: '심리역동 분석', content: aiAnalysis.psychodynamicAnalysis },
        { title: '강점 기반 성장 전략', content: aiAnalysis.strengthStrategy },
        { title: '성장 영역 개선 방안', content: aiAnalysis.growthPlan },
        { title: '관계 향상 실천 가이드', content: aiAnalysis.practiceGuide },
        { title: '전문가 권고사항', content: aiAnalysis.expertRecommendation }
      ]
    });
  };

  const handlePrint = () => {
    if (!aiAnalysis) return;
    
    printDocument({
      title: '관계 역동성 심층 분석 결과',
      date: new Date().toLocaleDateString('ko-KR'),
      sections: [
        { title: '검사 개요', content: `관계 유형: ${relationshipType}\n종합 점수: ${totalScore}점` },
        { title: '종합 심리 분석', content: aiAnalysis.overallAnalysis },
        { title: '영역별 심층 해석', content: aiAnalysis.categoryAnalysis },
        { title: '심리역동 분석', content: aiAnalysis.psychodynamicAnalysis },
        { title: '강점 기반 성장 전략', content: aiAnalysis.strengthStrategy },
        { title: '성장 영역 개선 방안', content: aiAnalysis.growthPlan },
        { title: '관계 향상 실천 가이드', content: aiAnalysis.practiceGuide },
        { title: '전문가 권고사항', content: aiAnalysis.expertRecommendation }
      ]
    });
  };

  const getTypeInfo = () => {
    switch (relationshipType) {
      case "안정 균형형":
        return {
          color: "from-green-500 to-emerald-500",
          bgColor: "bg-green-50",
          description: "관계에서 안정감과 균형감을 모두 갖추고 있어요. 건강한 관계를 맺고 유지하는 능력이 뛰어납니다.",
          advice: "현재의 관계 패턴을 유지하면서, 새로운 관계에서도 이 균형감을 발휘해보세요."
        };
      case "성장 조화형":
        return {
          color: "from-blue-500 to-indigo-500",
          bgColor: "bg-blue-50",
          description: "관계에서 성장과 조화를 추구하는 타입이에요. 대부분의 영역에서 안정적이지만 일부 영역에서 성장 여지가 있어요.",
          advice: "성장 영역에 대한 인식을 바탕으로 조금씩 개선해 나가면 더 깊은 관계를 형성할 수 있어요."
        };
      case "탐색 발전형":
        return {
          color: "from-yellow-500 to-orange-500",
          bgColor: "bg-yellow-50",
          description: "관계 패턴을 탐색하고 발전시켜 나가는 과정에 있어요. 성장 잠재력이 높습니다.",
          advice: "강점 영역을 기반으로 자신감을 갖고, 성장 영역에서는 작은 변화부터 시도해보세요."
        };
      default:
        return {
          color: "from-pink-500 to-rose-500",
          bgColor: "bg-pink-50",
          description: "관계에서 어려움을 경험하고 있을 수 있어요. 전문적인 도움이 도움이 될 수 있습니다.",
          advice: "혼자 고민하지 마시고, 신뢰할 수 있는 사람이나 전문가와 이야기를 나눠보세요."
        };
    }
  };

  const categoryInfo: Record<string, { icon: React.ReactNode; name: string; description: string }> = {
    trust: { 
      icon: <Shield className="w-5 h-5" />, 
      name: '신뢰 형성',
      description: '새로운 관계에서 신뢰를 구축하는 능력'
    },
    boundary: { 
      icon: <Scale className="w-5 h-5" />, 
      name: '경계 설정',
      description: '건강한 개인 경계를 유지하는 능력'
    },
    expression: { 
      icon: <MessageCircle className="w-5 h-5" />, 
      name: '감정 표현',
      description: '감정을 적절히 표현하고 소통하는 능력'
    },
    conflict: { 
      icon: <Users className="w-5 h-5" />, 
      name: '갈등 대처',
      description: '갈등 상황을 건설적으로 해결하는 능력'
    },
    support: { 
      icon: <HandHeart className="w-5 h-5" />, 
      name: '지지 제공',
      description: '상대방을 지지하고 도움을 주고받는 능력'
    },
    balance: { 
      icon: <Heart className="w-5 h-5" />, 
      name: '독립-의존 균형',
      description: '자율성과 친밀감 사이의 균형을 유지하는 능력'
    }
  };

  const typeInfo = getTypeInfo();

  const getScoreColor = (score: number) => {
    if (score >= 75) return "bg-green-500";
    if (score >= 50) return "bg-blue-500";
    if (score >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const recommendedTests = [
    { name: "삶의 목적 탐색 검사", path: "/assessment/life-purpose", icon: <Target className="w-5 h-5" /> },
    { name: "에너지 흐름 검사", path: "/assessment/energy-flow", icon: <Sparkles className="w-5 h-5" /> },
    { name: "전체 심리검사 목록", path: "/assessment", icon: <Brain className="w-5 h-5" /> }
  ];

  return (
    <>
      <UnifiedNavigation />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              돌아가기
            </Button>
          </div>

          {/* 메인 결과 카드 */}
          <Card className="border-pink-200 shadow-xl mb-6 overflow-hidden">
            <div className={`bg-gradient-to-r ${typeInfo.color} p-6 text-white`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">관계 역동성 심층 분석 결과</h2>
                    <p className="text-white/80">35문항 6개 영역 분석 리포트</p>
                  </div>
                </div>
                <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                  {relationshipType}
                </Badge>
              </div>
            </div>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-pink-600 mb-2">{totalScore}점</div>
                <p className="text-muted-foreground">관계 건강도 종합 점수</p>
                <Progress value={totalScore} className="w-full mt-4 h-3" />
              </div>
              <div className={`p-4 rounded-lg ${typeInfo.bgColor} mb-4`}>
                <p className="text-lg mb-2">{typeInfo.description}</p>
                <p className="text-sm text-muted-foreground">{typeInfo.advice}</p>
              </div>
            </CardContent>
          </Card>

          {/* 6개 영역 점수 */}
          <Card className="border-pink-200 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-pink-600" />
                6가지 관계 역동 영역 분석
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(categoryScores).map(([category, score]) => (
                  <div key={category} className="p-4 bg-gradient-to-r from-white to-pink-50 rounded-lg border border-pink-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-pink-600">{categoryInfo[category]?.icon}</span>
                        <span className="font-medium">{categoryInfo[category]?.name}</span>
                      </div>
                      <Badge className={`${getScoreColor(score)} text-white`}>{score}점</Badge>
                    </div>
                    <Progress value={score} className="h-2 mb-2" />
                    <p className="text-xs text-muted-foreground">{categoryInfo[category]?.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 강점과 성장 영역 */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card className="border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-green-700">
                  <Star className="w-5 h-5" />
                  강점 영역
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {strengths.map((strength, index) => (
                    <li key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-amber-700">
                  <TrendingUp className="w-5 h-5" />
                  성장 영역
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {growthAreas.map((area, index) => (
                    <li key={index} className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
                      <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm">!</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* AI 심층 분석 리포트 */}
          <Card className="border-indigo-200 mb-6 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6" />
                🧠 AI 임상심리전문가 심층 분석 리포트
              </CardTitle>
              <p className="text-white/80 text-sm">AI 기반 심리 분석 시스템의 상세 해석</p>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingAnalysis ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
                  <p className="text-muted-foreground">AI가 심층 분석 중입니다...</p>
                  <p className="text-sm text-muted-foreground">잠시만 기다려주세요</p>
                </div>
              ) : analysisError ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-4">{analysisError}</p>
                  <Button onClick={fetchAIAnalysis} variant="outline">다시 시도</Button>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-6">
                  {aiAnalysis.overallAnalysis && (
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-l-4 border-indigo-500">
                      <h4 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        종합 심리 분석
                      </h4>
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">{aiAnalysis.overallAnalysis}</p>
                    </div>
                  )}

                  {aiAnalysis.categoryAnalysis && (
                    <div className="p-4 bg-pink-50 rounded-lg border-l-4 border-pink-500">
                      <h4 className="font-bold text-pink-700 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        영역별 심층 해석
                      </h4>
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">{aiAnalysis.categoryAnalysis}</p>
                    </div>
                  )}

                  {aiAnalysis.psychodynamicAnalysis && (
                    <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                      <h4 className="font-bold text-purple-700 mb-2 flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        심리역동 분석
                      </h4>
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">{aiAnalysis.psychodynamicAnalysis}</p>
                    </div>
                  )}

                  {aiAnalysis.strengthStrategy && (
                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                        <Star className="w-5 h-5" />
                        강점 기반 성장 전략
                      </h4>
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">{aiAnalysis.strengthStrategy}</p>
                    </div>
                  )}

                  {aiAnalysis.growthPlan && (
                    <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                      <h4 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        성장 영역 개선 방안
                      </h4>
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">{aiAnalysis.growthPlan}</p>
                    </div>
                  )}

                  {aiAnalysis.practiceGuide && (
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        관계 향상 실천 가이드
                      </h4>
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">{aiAnalysis.practiceGuide}</p>
                    </div>
                  )}

                  {aiAnalysis.expertRecommendation && (
                    <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg border-l-4 border-rose-500">
                      <h4 className="font-bold text-rose-700 mb-2 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        전문가 권고사항
                      </h4>
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">{aiAnalysis.expertRecommendation}</p>
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* 다른 검사 추천 */}
          <Card className="border-purple-200 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                함께 받아보면 좋은 검사
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {recommendedTests.map((test, index) => (
                  <Link key={index} to={test.path}>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <span className="text-purple-600">{test.icon}</span>
                        <span className="font-medium">{test.name}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-purple-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 액션 버튼 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button 
              onClick={handleSaveResult}
              disabled={isSaving}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              결과 저장
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDownloadWord}
              disabled={!aiAnalysis}
            >
              <Download className="w-4 h-4 mr-2" />
              Word 다운로드
            </Button>
            <Button 
              variant="outline" 
              onClick={handlePrint}
              disabled={!aiAnalysis}
            >
              <Printer className="w-4 h-4 mr-2" />
              인쇄하기
            </Button>
            <Link to="/assessment" className="w-full">
              <Button variant="outline" className="w-full">
                다른 검사 하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
