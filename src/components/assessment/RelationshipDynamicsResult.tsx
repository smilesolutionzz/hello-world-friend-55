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
import { useLanguage } from '@/i18n/LanguageContext';
import VisualResultInfographic from './VisualResultInfographic';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';

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
  const { isEnglish } = useLanguage();

  useEffect(() => { fetchAIAnalysis(); }, []);

  const fetchAIAnalysis = async () => {
    setIsLoadingAnalysis(true);
    setAnalysisError(null);
    try {
      const { data, error } = await supabase.functions.invoke('relationship-dynamics-analyzer', {
        body: { totalScore, relationshipType, categoryScores, strengths, growthAreas }
      });
      if (error) throw error;
      if (data?.analysis) setAiAnalysis(data.analysis);
    } catch (error: any) {
      console.error('AI analysis error:', error);
      setAnalysisError(isEnglish ? 'AI analysis error. Please try again.' : 'AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleSaveResult = async () => {
    await saveTestResult({
      testType: isEnglish ? 'Relationship Dynamics Analysis' : '관계 역동성 심층 분석',
      total: totalScore, average: totalScore, severity: relationshipType,
      answers: results.answers, scores: categoryScores,
      analysis: aiAnalysis?.fullAnalysis, recommendations: [aiAnalysis?.practiceGuide || '']
    });
  };

  const docTitle = isEnglish ? 'Relationship Dynamics Analysis Results' : '관계 역동성 심층 분석 결과';
  const docSections = (a: AIAnalysis) => [
    { title: isEnglish ? 'Overview' : '검사 개요', content: `${isEnglish ? 'Type' : '관계 유형'}: ${relationshipType}\n${isEnglish ? 'Score' : '종합 점수'}: ${totalScore}${isEnglish ? 'pts' : '점'}` },
    { title: isEnglish ? 'Comprehensive Analysis' : '종합 심리 분석', content: a.overallAnalysis },
    { title: isEnglish ? 'Domain Analysis' : '영역별 심층 해석', content: a.categoryAnalysis },
    { title: isEnglish ? 'Psychodynamic Analysis' : '심리역동 분석', content: a.psychodynamicAnalysis },
    { title: isEnglish ? 'Strength Strategy' : '강점 기반 성장 전략', content: a.strengthStrategy },
    { title: isEnglish ? 'Growth Plan' : '성장 영역 개선 방안', content: a.growthPlan },
    { title: isEnglish ? 'Practice Guide' : '관계 향상 실천 가이드', content: a.practiceGuide },
    { title: isEnglish ? 'Expert Recommendation' : '전문가 권고사항', content: a.expertRecommendation }
  ];

  const handleDownloadWord = () => { if (!aiAnalysis) return; generateWordDocument({ title: docTitle, date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'), sections: docSections(aiAnalysis) }); };
  const handlePrint = () => { if (!aiAnalysis) return; printDocument({ title: docTitle, date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'), sections: docSections(aiAnalysis) }); };

  const getTypeInfo = () => {
    if (isEnglish) {
      switch (relationshipType) {
        case "안정 균형형": return { color: "from-green-500 to-emerald-500", bgColor: "bg-green-50", description: "You have both stability and balance in relationships. You excel at building and maintaining healthy connections.", advice: "Maintain your current patterns and extend this balance to new relationships." };
        case "성장 조화형": return { color: "from-blue-500 to-indigo-500", bgColor: "bg-blue-50", description: "You pursue growth and harmony. Most areas are stable with some room for growth.", advice: "Use awareness of growth areas to gradually improve and deepen your connections." };
        case "탐색 발전형": return { color: "from-yellow-500 to-orange-500", bgColor: "bg-yellow-50", description: "You're in the process of exploring and developing relationship patterns. High growth potential.", advice: "Build confidence from strengths and try small changes in growth areas." };
        default: return { color: "from-pink-500 to-rose-500", bgColor: "bg-pink-50", description: "You may be experiencing difficulties in relationships. Professional guidance could help.", advice: "Don't struggle alone — consider talking to someone you trust or a professional." };
      }
    }
    switch (relationshipType) {
      case "안정 균형형": return { color: "from-green-500 to-emerald-500", bgColor: "bg-green-50", description: "관계에서 안정감과 균형감을 모두 갖추고 있어요. 건강한 관계를 맺고 유지하는 능력이 뛰어납니다.", advice: "현재의 관계 패턴을 유지하면서, 새로운 관계에서도 이 균형감을 발휘해보세요." };
      case "성장 조화형": return { color: "from-blue-500 to-indigo-500", bgColor: "bg-blue-50", description: "관계에서 성장과 조화를 추구하는 타입이에요. 대부분의 영역에서 안정적이지만 일부 영역에서 성장 여지가 있어요.", advice: "성장 영역에 대한 인식을 바탕으로 조금씩 개선해 나가면 더 깊은 관계를 형성할 수 있어요." };
      case "탐색 발전형": return { color: "from-yellow-500 to-orange-500", bgColor: "bg-yellow-50", description: "관계 패턴을 탐색하고 발전시켜 나가는 과정에 있어요. 성장 잠재력이 높습니다.", advice: "강점 영역을 기반으로 자신감을 갖고, 성장 영역에서는 작은 변화부터 시도해보세요." };
      default: return { color: "from-pink-500 to-rose-500", bgColor: "bg-pink-50", description: "관계에서 어려움을 경험하고 있을 수 있어요. 전문적인 도움이 도움이 될 수 있습니다.", advice: "혼자 고민하지 마시고, 신뢰할 수 있는 사람이나 전문가와 이야기를 나눠보세요." };
    }
  };

  const categoryInfo: Record<string, { icon: React.ReactNode; name: string; description: string }> = {
    trust: { icon: <Shield className="w-5 h-5" />, name: isEnglish ? 'Trust Building' : '신뢰 형성', description: isEnglish ? 'Ability to build trust in new relationships' : '새로운 관계에서 신뢰를 구축하는 능력' },
    boundary: { icon: <Scale className="w-5 h-5" />, name: isEnglish ? 'Boundary Setting' : '경계 설정', description: isEnglish ? 'Ability to maintain healthy personal boundaries' : '건강한 개인 경계를 유지하는 능력' },
    expression: { icon: <MessageCircle className="w-5 h-5" />, name: isEnglish ? 'Emotional Expression' : '감정 표현', description: isEnglish ? 'Ability to express and communicate emotions' : '감정을 적절히 표현하고 소통하는 능력' },
    conflict: { icon: <Users className="w-5 h-5" />, name: isEnglish ? 'Conflict Resolution' : '갈등 대처', description: isEnglish ? 'Ability to resolve conflicts constructively' : '갈등 상황을 건설적으로 해결하는 능력' },
    support: { icon: <HandHeart className="w-5 h-5" />, name: isEnglish ? 'Mutual Support' : '지지 제공', description: isEnglish ? 'Ability to give and receive support' : '상대방을 지지하고 도움을 주고받는 능력' },
    balance: { icon: <Heart className="w-5 h-5" />, name: isEnglish ? 'Independence Balance' : '독립-의존 균형', description: isEnglish ? 'Balance between autonomy and intimacy' : '자율성과 친밀감 사이의 균형을 유지하는 능력' }
  };

  const typeInfo = getTypeInfo();
  const getScoreColor = (score: number) => { if (score >= 75) return "bg-green-500"; if (score >= 50) return "bg-blue-500"; if (score >= 25) return "bg-yellow-500"; return "bg-red-500"; };

  const recommendedTests = [
    { name: isEnglish ? "Life Purpose Exploration" : "삶의 목적 탐색 검사", path: "/assessment/life-purpose", icon: <Target className="w-5 h-5" /> },
    { name: isEnglish ? "Energy Flow Assessment" : "에너지 흐름 검사", path: "/assessment/energy-flow", icon: <Sparkles className="w-5 h-5" /> },
    { name: isEnglish ? "All Assessments" : "전체 심리검사 목록", path: "/assessment", icon: <Brain className="w-5 h-5" /> }
  ];

  const analysisLabels = isEnglish ? {
    overall: 'Comprehensive Analysis', category: 'Domain Analysis', psychodynamic: 'Psychodynamic Analysis',
    strength: 'Strength-based Growth Strategy', growth: 'Growth Area Improvement', practice: 'Relationship Enhancement Guide', expert: 'Expert Recommendation'
  } : {
    overall: '종합 심리 분석', category: '영역별 심층 해석', psychodynamic: '심리역동 분석',
    strength: '강점 기반 성장 전략', growth: '성장 영역 개선 방안', practice: '관계 향상 실천 가이드', expert: '전문가 권고사항'
  };

  return (
    <>
      <UnifiedNavigation />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />{isEnglish ? 'Back' : '돌아가기'}
            </Button>
          </div>

          <Card className="border-pink-200 shadow-xl mb-6 overflow-hidden">
            <div className={`bg-gradient-to-r ${typeInfo.color} p-6 text-white`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl"><Users className="w-8 h-8" /></div>
                  <div>
                    <h2 className="text-2xl font-bold">{isEnglish ? 'Relationship Dynamics Analysis' : '관계 역동성 심층 분석 결과'}</h2>
                    <p className="text-white/80">{isEnglish ? '35-item 6-domain analysis report' : '35문항 6개 영역 분석 리포트'}</p>
                  </div>
                </div>
                <Badge className="bg-white/20 text-white text-lg px-4 py-2">{relationshipType}</Badge>
              </div>
            </div>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-pink-600 mb-2">{totalScore}{isEnglish ? 'pts' : '점'}</div>
                <p className="text-muted-foreground">{isEnglish ? 'Overall Relationship Health Score' : '관계 건강도 종합 점수'}</p>
                <Progress value={totalScore} className="w-full mt-4 h-3" />
              </div>
              <div className={`p-4 rounded-lg ${typeInfo.bgColor} mb-4`}>
                <p className="text-lg mb-2">{typeInfo.description}</p>
                <p className="text-sm text-muted-foreground">{typeInfo.advice}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-200 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-pink-600" />
                {isEnglish ? '6 Relationship Dynamic Domains' : '6가지 관계 역동 영역 분석'}
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
                      <Badge className={`${getScoreColor(score)} text-white`}>{score}{isEnglish ? 'pts' : '점'}</Badge>
                    </div>
                    <Progress value={score} className="h-2 mb-2" />
                    <p className="text-xs text-muted-foreground">{categoryInfo[category]?.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card className="border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-green-700"><Star className="w-5 h-5" />{isEnglish ? 'Strengths' : '강점 영역'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {strengths.map((s, i) => (
                    <li key={i} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-amber-700"><TrendingUp className="w-5 h-5" />{isEnglish ? 'Growth Areas' : '성장 영역'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {growthAreas.map((a, i) => (
                    <li key={i} className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
                      <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm">!</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="border-indigo-200 mb-6 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <CardTitle className="flex items-center gap-2"><Brain className="w-6 h-6" />🧠 {isEnglish ? 'AI Clinical Expert Analysis Report' : 'AI 임상심리전문가 심층 분석 리포트'}</CardTitle>
              <p className="text-white/80 text-sm">{isEnglish ? 'Detailed interpretation by AI psychology analysis system' : 'AI 기반 심리 분석 시스템의 상세 해석'}</p>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingAnalysis ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
                  <p className="text-muted-foreground">{isEnglish ? 'AI is analyzing...' : 'AI가 심층 분석 중입니다...'}</p>
                  <p className="text-sm text-muted-foreground">{isEnglish ? 'Please wait' : '잠시만 기다려주세요'}</p>
                </div>
              ) : analysisError ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-4">{analysisError}</p>
                  <Button onClick={fetchAIAnalysis} variant="outline">{isEnglish ? 'Retry' : '다시 시도'}</Button>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-6">
                  {[
                    { key: 'overallAnalysis', label: analysisLabels.overall, icon: <Brain className="w-5 h-5" />, colors: 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-500 text-indigo-700' },
                    { key: 'categoryAnalysis', label: analysisLabels.category, icon: <TrendingUp className="w-5 h-5" />, colors: 'bg-pink-50 border-pink-500 text-pink-700' },
                    { key: 'psychodynamicAnalysis', label: analysisLabels.psychodynamic, icon: <Heart className="w-5 h-5" />, colors: 'bg-purple-50 border-purple-500 text-purple-700' },
                    { key: 'strengthStrategy', label: analysisLabels.strength, icon: <Star className="w-5 h-5" />, colors: 'bg-green-50 border-green-500 text-green-700' },
                    { key: 'growthPlan', label: analysisLabels.growth, icon: <Target className="w-5 h-5" />, colors: 'bg-amber-50 border-amber-500 text-amber-700' },
                    { key: 'practiceGuide', label: analysisLabels.practice, icon: <Lightbulb className="w-5 h-5" />, colors: 'bg-blue-50 border-blue-500 text-blue-700' },
                    { key: 'expertRecommendation', label: analysisLabels.expert, icon: <Sparkles className="w-5 h-5" />, colors: 'bg-gradient-to-r from-rose-50 to-pink-50 border-rose-500 text-rose-700' },
                  ].map(({ key, label, icon, colors }) => {
                    const content = aiAnalysis[key as keyof AIAnalysis];
                    if (!content) return null;
                    const [bgColors, borderColor, textColor] = colors.split(' ');
                    return (
                      <div key={key} className={`p-4 ${bgColors} rounded-lg border-l-4 ${borderColor}`}>
                        <h4 className={`font-bold ${textColor} mb-2 flex items-center gap-2`}>{icon}{label}</h4>
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{content}</p>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-purple-200 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-600" />{isEnglish ? 'Recommended Tests' : '함께 받아보면 좋은 검사'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {recommendedTests.map((test, index) => (
                  <Link key={index} to={test.path}>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3"><span className="text-purple-600">{test.icon}</span><span className="font-medium">{test.name}</span></div>
                      <ChevronRight className="w-5 h-5 text-purple-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button onClick={handleSaveResult} disabled={isSaving} className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              {isEnglish ? 'Save' : '결과 저장'}
            </Button>
            <Button variant="outline" onClick={handleDownloadWord} disabled={!aiAnalysis}>
              <Download className="w-4 h-4 mr-2" />{isEnglish ? 'Word' : 'Word 다운로드'}
            </Button>
            <Button variant="outline" onClick={handlePrint} disabled={!aiAnalysis}>
              <Printer className="w-4 h-4 mr-2" />{isEnglish ? 'Print' : '인쇄하기'}
            </Button>
            <Link to="/assessment" className="w-full">
              <Button variant="outline" className="w-full">{isEnglish ? 'More Tests' : '다른 검사 하기'}</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
