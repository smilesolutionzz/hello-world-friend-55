import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Compass, Star, Target, Sparkles, Mountain, Heart, Lightbulb, Download, Printer, TrendingUp, Loader2, Brain, Users, ChevronRight, BookOpen, Crown, Wallet, Lock } from "lucide-react";
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

interface LifePurposeTestResultProps {
  results: {
    answers: Record<string, string>;
    categoryScores: Record<string, number>;
    totalScore: number;
    purposeType: string;
    clarityLevel: string;
    recommendations: string[];
  };
  onBack: () => void;
}

interface AIAnalysis {
  existentialAnalysis: string;
  categoryAnalysis: string;
  psychodynamicAnalysis: string;
  strengthsAnalysis: string;
  growthDirection: string;
  practiceGuide: string;
  reflectionQuestions: string;
  expertOpinion: string;
  fullAnalysis: string;
}

export default function LifePurposeTestResult({ results, onBack }: LifePurposeTestResultProps) {
  const { categoryScores, totalScore, purposeType, clarityLevel, recommendations } = results;
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
      const { data, error } = await supabase.functions.invoke('life-purpose-analyzer', {
        body: { totalScore, purposeType, clarityLevel, categoryScores, recommendations }
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
      testType: isEnglish ? 'Life Purpose Exploration' : '삶의 의미 및 목적 탐색 검사',
      total: totalScore, average: totalScore, severity: purposeType, level: clarityLevel,
      answers: results.answers, scores: categoryScores,
      analysis: aiAnalysis?.fullAnalysis, recommendations: [aiAnalysis?.practiceGuide || '']
    });
  };

  const docTitle = isEnglish ? 'Life Purpose Exploration Results' : '삶의 의미 및 목적 탐색 검사 결과';
  const docSections = (a: AIAnalysis) => [
    { title: isEnglish ? 'Overview' : '검사 개요', content: `${isEnglish ? 'Type' : '목적 유형'}: ${purposeType}\n${isEnglish ? 'Clarity' : '방향 명확성'}: ${clarityLevel}\n${isEnglish ? 'Score' : '종합 점수'}: ${totalScore}${isEnglish ? 'pts' : '점'}` },
    { title: isEnglish ? 'Existential Analysis' : '실존적 의미 분석', content: a.existentialAnalysis },
    { title: isEnglish ? 'Domain Analysis' : '영역별 심층 해석', content: a.categoryAnalysis },
    { title: isEnglish ? 'Psychodynamic Analysis' : '심리역동 분석', content: a.psychodynamicAnalysis },
    { title: isEnglish ? 'Strengths & Potential' : '강점 및 잠재력 분석', content: a.strengthsAnalysis },
    { title: isEnglish ? 'Growth Direction' : '성장 방향 제안', content: a.growthDirection },
    { title: isEnglish ? 'Practice Guide' : '일상 실천 가이드', content: a.practiceGuide },
    { title: isEnglish ? 'Reflection Questions' : '깊은 성찰 질문', content: a.reflectionQuestions },
    { title: isEnglish ? 'Expert Opinion' : '전문가 종합 소견', content: a.expertOpinion }
  ];

  const handleDownloadWord = () => { if (!aiAnalysis) return; generateWordDocument({ title: docTitle, date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'), sections: docSections(aiAnalysis) }); };
  const handlePrint = () => { if (!aiAnalysis) return; printDocument({ title: docTitle, date: new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR'), sections: docSections(aiAnalysis) }); };

  const getTypeInfo = () => {
    if (isEnglish) {
      switch (purposeType) {
        case "명확한 방향 탐색자": return { color: "from-emerald-500 to-teal-500", bgColor: "bg-emerald-50", emoji: "🌟", description: "Your life direction is clear, with well-aligned values and goals. You're living a meaningful life.", quote: '"A life with purpose stands firm against any storm."' };
        case "성장하는 탐험가": return { color: "from-blue-500 to-indigo-500", bgColor: "bg-blue-50", emoji: "🚀", description: "You're actively seeking life's meaning. You have direction in most areas and are growing.", quote: '"The journey itself is the destination. Keep going."' };
        case "방향 모색 중인 여행자": return { color: "from-amber-500 to-orange-500", bgColor: "bg-amber-50", emoji: "🧭", description: "You're exploring your life direction. This is an important time for self-discovery.", quote: '"You must get lost to find new paths."' };
        default: return { color: "from-purple-500 to-pink-500", bgColor: "bg-purple-50", emoji: "🌱", description: "You're beginning your journey to find meaning. Start with small questions.", quote: '"A seed needs time in the dark to sprout."' };
      }
    }
    switch (purposeType) {
      case "명확한 방향 탐색자": return { color: "from-emerald-500 to-teal-500", bgColor: "bg-emerald-50", emoji: "🌟", description: "삶의 방향이 명확하고, 가치관과 목표가 잘 정렬되어 있어요. 의미 있는 삶을 살고 있습니다.", quote: '"목적이 있는 삶은 어떤 폭풍에도 흔들리지 않는다."' };
      case "성장하는 탐험가": return { color: "from-blue-500 to-indigo-500", bgColor: "bg-blue-50", emoji: "🚀", description: "삶의 의미를 능동적으로 찾아가고 있어요. 대부분의 영역에서 방향성이 있으며, 성장 중입니다.", quote: '"여정 자체가 목적지다. 계속 나아가라."' };
      case "방향 모색 중인 여행자": return { color: "from-amber-500 to-orange-500", bgColor: "bg-amber-50", emoji: "🧭", description: "삶의 방향을 탐색하는 과정에 있어요. 이 시기는 자기발견을 위한 중요한 시간입니다.", quote: '"길을 잃어봐야 새로운 길을 발견할 수 있다."' };
      default: return { color: "from-purple-500 to-pink-500", bgColor: "bg-purple-50", emoji: "🌱", description: "의미를 찾는 여정을 시작하고 있어요. 작은 질문들부터 시작해보세요.", quote: '"씨앗이 싹을 틔우려면 어둠 속에서 시간이 필요하다."' };
    }
  };

  const categoryInfo: Record<string, { icon: React.ReactNode; name: string; description: string }> = {
    fulfillment: { icon: <Heart className="w-5 h-5" />, name: isEnglish ? 'Existential Fulfillment' : '실존적 충만감', description: isEnglish ? 'Degree of meaning and satisfaction in daily life' : '일상에서 의미와 만족을 느끼는 정도' },
    values: { icon: <Star className="w-5 h-5" />, name: isEnglish ? 'Value Clarity' : '가치 명확성', description: isEnglish ? 'Clarity and consistency of core values' : '핵심 가치관의 명료함과 일관성' },
    goals: { icon: <Target className="w-5 h-5" />, name: isEnglish ? 'Goal Consistency' : '목표 일관성', description: isEnglish ? 'Persistence in goal setting and execution' : '목표 설정과 실행의 지속성' },
    awareness: { icon: <Compass className="w-5 h-5" />, name: isEnglish ? 'Self-Awareness' : '자기 인식', description: isEnglish ? 'Self-understanding and reflective capacity' : '자신에 대한 이해와 성찰 능력' }
  };

  const typeInfo = getTypeInfo();
  const getScoreColor = (score: number) => { if (score >= 75) return "bg-emerald-500"; if (score >= 60) return "bg-blue-500"; if (score >= 45) return "bg-amber-500"; return "bg-rose-500"; };
  const getClarityBadgeColor = () => {
    switch (clarityLevel) {
      case "매우 높음": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "높음": return "bg-blue-100 text-blue-800 border-blue-200";
      case "보통": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-rose-100 text-rose-800 border-rose-200";
    }
  };

  const recommendedTests = [
    { name: isEnglish ? "Relationship Dynamics Analysis" : "관계 역동성 심층 분석", path: "/assessment/relationship-dynamics", icon: <Users className="w-5 h-5" /> },
    { name: isEnglish ? "Energy Flow Assessment" : "에너지 흐름 검사", path: "/assessment/energy-flow", icon: <Sparkles className="w-5 h-5" /> },
    { name: isEnglish ? "All Assessments" : "전체 심리검사 목록", path: "/assessment", icon: <Brain className="w-5 h-5" /> }
  ];

  const analysisLabels = isEnglish ? {
    existential: 'Existential Meaning Analysis', category: 'Domain Analysis', psychodynamic: 'Psychodynamic Analysis',
    strengths: 'Strengths & Potential', growth: 'Growth Direction', practice: 'Daily Practice Guide',
    reflection: 'Deep Reflection Questions', expert: 'Expert Opinion'
  } : {
    existential: '실존적 의미 분석', category: '영역별 심층 해석', psychodynamic: '심리역동 분석',
    strengths: '강점 및 잠재력 분석', growth: '성장 방향 제안', practice: '일상 실천 가이드',
    reflection: '깊은 성찰 질문', expert: '전문가 종합 소견'
  };

  return (
    <>
      <UnifiedNavigation />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />{isEnglish ? "Back" : "돌아가기"}
            </Button>
          </div>

          <Card className="border-indigo-200 shadow-xl mb-6 overflow-hidden">
            <div className={`bg-gradient-to-r ${typeInfo.color} p-6 text-white`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl"><Mountain className="w-8 h-8" /></div>
                  <div>
                    <h2 className="text-2xl font-bold">{isEnglish ? "Life Purpose Exploration Results" : "삶의 의미 및 목적 탐색 결과"}</h2>
                    <p className="text-white/80">{isEnglish ? "40-item 4-domain in-depth analysis report" : "40문항 4개 영역 심층 분석 리포트"}</p>
                  </div>
                </div>
                <div className="text-4xl">{typeInfo.emoji}</div>
              </div>
            </div>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xl px-6 py-2 mb-4">{purposeType}</Badge>
                <div className="text-5xl font-bold text-indigo-600 mb-2">{totalScore}{isEnglish ? "pts" : "점"}</div>
                <p className="text-muted-foreground">{isEnglish ? "Overall Life Meaning Clarity Score" : "삶의 의미 명확성 종합 점수"}</p>
                <Progress value={totalScore} className="w-full mt-4 h-3" />
              </div>
              <div className={`p-4 rounded-lg ${typeInfo.bgColor} mb-4`}>
                <p className="text-lg mb-2">{typeInfo.description}</p>
                <p className="text-sm italic text-muted-foreground">{typeInfo.quote}</p>
              </div>
              <div className="flex justify-center">
                <Badge className={`text-sm px-4 py-2 ${getClarityBadgeColor()}`}>
                  {isEnglish ? "Direction Clarity" : "방향 명확성"}: {clarityLevel}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                {isEnglish ? '4 Life Meaning Domains' : '4가지 삶의 의미 영역 분석'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(categoryScores).map(([category, score]) => (
                  <div key={category} className="p-4 bg-gradient-to-r from-white to-indigo-50 rounded-lg border border-indigo-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-600">{categoryInfo[category]?.icon}</span>
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

          <Card className="border-purple-200 mb-6 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
              <CardTitle className="flex items-center gap-2"><Brain className="w-6 h-6" />🧠 {isEnglish ? 'AI Clinical Expert Analysis Report' : 'AI 임상심리전문가 심층 분석 리포트'}</CardTitle>
              <p className="text-white/80 text-sm">{isEnglish ? 'Detailed existential psychology analysis' : 'AI 기반 실존주의 심리 분석 시스템의 상세 해석'}</p>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingAnalysis ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4" />
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
                    { key: 'existentialAnalysis', label: analysisLabels.existential, icon: <Mountain className="w-5 h-5" />, colors: 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-500 text-purple-700' },
                    { key: 'categoryAnalysis', label: analysisLabels.category, icon: <TrendingUp className="w-5 h-5" />, colors: 'bg-indigo-50 border-indigo-500 text-indigo-700' },
                    { key: 'psychodynamicAnalysis', label: analysisLabels.psychodynamic, icon: <Heart className="w-5 h-5" />, colors: 'bg-pink-50 border-pink-500 text-pink-700' },
                    { key: 'strengthsAnalysis', label: analysisLabels.strengths, icon: <Star className="w-5 h-5" />, colors: 'bg-green-50 border-green-500 text-green-700' },
                    { key: 'growthDirection', label: analysisLabels.growth, icon: <Target className="w-5 h-5" />, colors: 'bg-amber-50 border-amber-500 text-amber-700' },
                    { key: 'practiceGuide', label: analysisLabels.practice, icon: <Lightbulb className="w-5 h-5" />, colors: 'bg-blue-50 border-blue-500 text-blue-700' },
                    { key: 'reflectionQuestions', label: analysisLabels.reflection, icon: <BookOpen className="w-5 h-5" />, colors: 'bg-teal-50 border-teal-500 text-teal-700' },
                    { key: 'expertOpinion', label: analysisLabels.expert, icon: <Sparkles className="w-5 h-5" />, colors: 'bg-gradient-to-r from-rose-50 to-pink-50 border-rose-500 text-rose-700' },
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

          <Card className="border-indigo-200 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-indigo-600" />{isEnglish ? 'Recommended Tests' : '함께 받아보면 좋은 검사'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {recommendedTests.map((test, index) => (
                  <Link key={index} to={test.path}>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg hover:from-indigo-100 hover:to-purple-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3"><span className="text-indigo-600">{test.icon}</span><span className="font-medium">{test.name}</span></div>
                      <ChevronRight className="w-5 h-5 text-indigo-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button onClick={handleSaveResult} disabled={isSaving} className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600">
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
