import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Download, MessageCircle, Bot, Brain, TrendingUp, AlertTriangle, Target, Users, FileText, Crown, Wallet, Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { useTestResultActions } from "@/hooks/useTestResultActions";
import ProductRecommendation from "@/components/ProductRecommendation";
import { CashBalanceDisplay } from '@/components/paywall/CashBalanceDisplay';
import { BlurredContent } from '@/components/paywall/BlurredContent';
import { useSubscription } from '@/hooks/useSubscription';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/useTranslation';

interface PremiumAdhdResultProps {
  results: {
    answers: Record<string, number>;
    scores: {
      inattention: number;
      hyperactivity: number;
      impulsivity: number;
      executiveDysfunction: number;
      comorbidity: number;
      functionalImpairment: number;
    };
    totalScore: number;
    severityLevel: string;
    adhdSubtype: string;
    ageGroup: string;
  };
  onBack: () => void;
  onStartAIChat?: () => void;
  onStartRealTimeChat?: () => void;
}

const PremiumAdhdResult = ({ results, onBack, onStartAIChat, onStartRealTimeChat }: PremiumAdhdResultProps) => {
  const navigate = useNavigate();
  const { isEnglish } = useLanguage();
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const { generatePDFReport, saveTestResult, isGeneratingPDF, isSaving } = useTestResultActions();

  const getSeverityColor = (level: string) => {
    switch (level) {
      case "경미한 수준": return { color: "text-green-600", bg: "bg-green-50", progress: "bg-green-500" };
      case "중등도 수준": return { color: "text-yellow-600", bg: "bg-yellow-50", progress: "bg-yellow-500" };
      case "심각한 수준": return { color: "text-red-600", bg: "bg-red-50", progress: "bg-red-500" };
      default: return { color: "text-gray-600", bg: "bg-gray-50", progress: "bg-gray-500" };
    }
  };

  const severity = getSeverityColor(results.severityLevel);

  // AI 분석 생성 - ADHD 전용 분석기 사용
  useEffect(() => {
    const generateAIAnalysis = async () => {
      try {
        setIsAnalyzing(true);
        
        // answers를 배열로 변환
        const answersArray = Object.values(results.answers);
        
        // ADHD 전용 분석 데이터 구조
        const analysisData = {
          answers: answersArray,
          ageGroup: results.ageGroup,
          severity: results.severityLevel,
          total: results.totalScore,
          average: results.totalScore / answersArray.length,
          scores: results.scores
        };

        console.log('Calling premium-adhd-analyzer with data:', analysisData);

        const { data, error } = await supabase.functions.invoke('premium-adhd-analyzer', {
          body: analysisData
        });

        if (error) {
          console.error('Edge function error:', error);
          throw error;
        }

        console.log('Analysis response:', data);

        if (data && data.analysis) {
          setAnalysis(data.analysis);
          
          // 결과 저장
          await saveTestResult({
            testType: 'Premium ADHD 정밀검사',
            results: results,
            analysis: data.analysis,
            testInfo: {
              severityLevel: results.severityLevel,
              adhdSubtype: results.adhdSubtype,
              totalScore: results.totalScore,
              domainScores: data.domainScores
            },
            ageGroup: results.ageGroup
          });
        } else {
          throw new Error('분석 결과가 없습니다.');
        }

      } catch (error) {
        console.error('AI 분석 생성 실패:', error);
        toast.error('AI 분석 생성에 실패했습니다.');
        setAnalysis(`분석 생성 중 오류가 발생했습니다.

⚠️ 중요 안내:
- 본 결과는 발달 코칭 및 의사결정 보조를 위한 참고용 분석입니다
- 의료 진단이 아니며, 임상적 판단이 필요한 경우 자격을 갖춘 전문가와 상담하시기 바랍니다
- 지속적인 어려움이 있으시면 플랫폼 내 전문가 매칭 서비스를 이용해 주세요

플랫폼 내 전문가 상담 서비스를 통해 보다 자세한 코칭 인사이트를 받으실 수 있습니다.`);
      } finally {
        setIsAnalyzing(false);
      }
    };

    generateAIAnalysis();
  }, [results]);

  const handlePDFDownload = async () => {
    await generatePDFReport({
      testType: 'Premium ADHD 정밀검사',
      results: results,
      analysis: analysis,
      testInfo: {
        severityLevel: results.severityLevel,
        adhdSubtype: results.adhdSubtype,
        totalScore: results.totalScore,
        ageGroup: results.ageGroup
      }
    });
  };

  // 차트 데이터 준비
  const scoreChartData = [
    { name: isEnglish ? 'Inattention' : '부주의', score: results.scores.inattention, fullMark: 200 },
    { name: isEnglish ? 'Hyperactivity' : '과잉행동', score: results.scores.hyperactivity, fullMark: 200 },
    { name: isEnglish ? 'Impulsivity' : '충동성', score: results.scores.impulsivity, fullMark: 200 },
    { name: isEnglish ? 'Executive Function' : '실행기능', score: results.scores.executiveDysfunction, fullMark: 200 },
    { name: isEnglish ? 'Comorbidity' : '동반증상', score: results.scores.comorbidity, fullMark: 100 },
    { name: isEnglish ? 'Functioning' : '기능수준', score: results.scores.functionalImpairment, fullMark: 100 }
  ];

  const radarChartData = [
    { subject: isEnglish ? 'Inattention' : '부주의', score: (results.scores.inattention / 200) * 100, fullMark: 100 },
    { subject: isEnglish ? 'Hyperactivity' : '과잉행동', score: (results.scores.hyperactivity / 200) * 100, fullMark: 100 },
    { subject: isEnglish ? 'Impulsivity' : '충동성', score: (results.scores.impulsivity / 200) * 100, fullMark: 100 },
    { subject: isEnglish ? 'Executive Function' : '실행기능', score: (results.scores.executiveDysfunction / 200) * 100, fullMark: 100 }
  ];

  const barChartData = [
    { category: isEnglish ? 'Inattention' : '부주의', score: results.scores.inattention },
    { category: isEnglish ? 'Hyperactivity' : '과잉행동', score: results.scores.hyperactivity },
    { category: isEnglish ? 'Impulsivity' : '충동성', score: results.scores.impulsivity },
    { category: isEnglish ? 'Executive Function' : '실행기능', score: results.scores.executiveDysfunction }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          {isEnglish ? 'Back' : '뒤로가기'}
        </Button>
        <h1 className="text-2xl font-bold">{isEnglish ? 'AIH Premium ADHD Assessment Results' : 'AIH 프리미엄 ADHD 정밀검사 결과'}</h1>
        <div className="w-24" />
      </div>

      {/* 법적 고지 */}
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800 mb-1">{isEnglish ? 'Important Notice' : '중요 안내사항'}</p>
            <p className="text-yellow-700">
              {isEnglish 
                ? 'This report is a developmental coaching and decision-support reference. It is not a medical diagnosis or treatment. Please consult a qualified professional when clinical judgment is needed.'
                : '본 리포트는 발달 코칭 및 의사결정 보조를 위한 참고용 분석이며, 의료 진단·치료를 대체하지 않습니다. 임상적 판단이 필요한 경우 자격을 갖춘 전문가와 상담하시기 바랍니다.'}
            </p>
          </div>
        </div>
      </Card>

      {/* 종합 결과 요약 */}
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold">{isEnglish ? 'Overall Results' : '종합 검사 결과'}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${severity.bg}`}>
              <div className="text-2xl font-bold mb-1">{results.totalScore}{isEnglish ? ' pts' : '점'}</div>
              <div className="text-sm text-muted-foreground">{isEnglish ? 'Total' : '총점'}</div>
            </div>
            
            <div className={`p-4 rounded-lg ${severity.bg}`}>
              <div className={`text-lg font-semibold mb-1 ${severity.color}`}>{results.severityLevel}</div>
              <div className="text-sm text-muted-foreground">{isEnglish ? 'Severity' : '심각도'}</div>
            </div>
            
            <div className="p-4 rounded-lg bg-blue-50">
              <div className="text-lg font-semibold mb-1 text-blue-600">{results.adhdSubtype}</div>
              <div className="text-sm text-muted-foreground">{isEnglish ? 'ADHD Type' : 'ADHD 유형'}</div>
            </div>
            
            <div className="p-4 rounded-lg bg-purple-50">
              <div className="text-lg font-semibold mb-1 text-purple-600">{results.ageGroup}</div>
              <div className="text-sm text-muted-foreground">{isEnglish ? 'Age Group' : '연령군'}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* 영역별 점수 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 막대 차트 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {isEnglish ? 'Domain Score Analysis' : '영역별 점수 분석'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 레이더 차트 */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            {isEnglish ? 'ADHD Symptom Pattern' : 'ADHD 증상 패턴'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarChartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name={isEnglish ? "Score" : "점수"}
                dataKey="score"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* 세부 영역별 분석 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{isEnglish ? 'Detailed Domain Analysis' : '세부 영역별 분석'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scoreChartData.map((item, index) => {
            const percentage = (item.score / item.fullMark) * 100;
            const getScoreLevel = (percent: number) => {
              if (percent <= 25) return { level: isEnglish ? "Low" : "낮음", color: "text-green-600", bg: "bg-green-500" };
              if (percent <= 50) return { level: isEnglish ? "Moderate" : "보통", color: "text-yellow-600", bg: "bg-yellow-500" };
              if (percent <= 75) return { level: isEnglish ? "High" : "높음", color: "text-orange-600", bg: "bg-orange-500" };
              return { level: isEnglish ? "Very High" : "매우 높음", color: "text-red-600", bg: "bg-red-500" };
            };
            
            const scoreLevel = getScoreLevel(percentage);
            
            return (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{item.name}</span>
                  <span className={`text-sm font-semibold ${scoreLevel.color}`}>
                    {scoreLevel.level}
                  </span>
                </div>
                <div className="space-y-2">
                  <Progress value={percentage} className="h-2" />
                  <div className="text-sm text-muted-foreground">
                    {item.score}/{item.fullMark}{isEnglish ? ' pts' : '점'} ({Math.round(percentage)}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* AI 전문가 해석 - 프리미엄 스타일 */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-purple-900">{isEnglish ? '🧠 AI Expert Analysis' : '🧠 AI 전문가 심층 분석'}</h3>
              <p className="text-sm text-purple-600">{isEnglish ? 'Clinical-grade ADHD analysis report' : 'ADHD 전문 정신과 전문의 수준의 임상 분석 리포트'}</p>
            </div>
          </div>
          
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white/60 rounded-xl">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Brain className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-purple-300 border-t-transparent animate-spin" />
              </div>
              <p className="mt-4 font-medium text-purple-700">{isEnglish ? 'AI is analyzing...' : 'AI가 심층 분석 중입니다...'}</p>
              <p className="text-sm text-purple-500">{isEnglish ? 'Generating detailed analysis' : '3000자 이상의 상세한 분석을 생성하고 있습니다'}</p>
            </div>
          ) : (
            <div className="bg-white/80 rounded-xl p-5 border border-purple-100 shadow-inner">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-base leading-relaxed text-gray-800">
                  {analysis}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-purple-100 flex items-center justify-between text-xs text-purple-500">
                <span>{isEnglish ? `📝 Characters: ${analysis?.length || 0}` : `📝 분석 글자 수: ${analysis?.length || 0}자`}</span>
                <span>🤖 Powered by Advanced AI</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 액션 버튼들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          onClick={() => navigate('/expert-hiring')}
          className="h-auto p-4 flex flex-col items-center gap-2"
          variant="outline"
        >
          <Users className="w-6 h-6" />
          <div className="text-center">
            <div className="font-semibold">{isEnglish ? 'ADHD Expert' : 'ADHD전문가연결'}</div>
            <div className="text-xs text-muted-foreground">{isEnglish ? 'Online Consultation' : '온라인 상담'}</div>
          </div>
        </Button>

        <Button
          onClick={() => navigate('/counseling', { state: { assessmentResults: { ...results, testType: 'premium_adhd' } } })}
          className="h-auto p-4 flex flex-col items-center gap-2"
          variant="outline"
        >
          <MessageCircle className="w-6 h-6" />
          <div className="text-center">
            <div className="font-semibold">{isEnglish ? 'Live Counseling' : '실시간 상담'}</div>
            <div className="text-xs text-muted-foreground">{isEnglish ? 'Connect Now' : '즉시 연결'}</div>
          </div>
        </Button>

        <Button
          onClick={() => navigate('/ai-counselor', { state: { assessmentResults: { ...results, testType: 'premium_adhd' } } })}
          className="h-auto p-4 flex flex-col items-center gap-2"
          variant="outline"
        >
          <Bot className="w-6 h-6" />
          <div className="text-center">
            <div className="font-semibold">{isEnglish ? 'AI Counselor' : 'AI 상담사'}</div>
            <div className="text-xs text-muted-foreground">{isEnglish ? '24/7 Available' : '24시간 이용'}</div>
          </div>
        </Button>

        <Button
          onClick={handlePDFDownload}
          disabled={isGeneratingPDF}
          className="h-auto p-4 flex flex-col items-center gap-2"
          variant="outline"
        >
          <FileText className="w-6 h-6" />
          <div className="text-center">
            <div className="font-semibold">
              {isGeneratingPDF ? (isEnglish ? "Generating..." : "생성 중...") : (isEnglish ? "Full Report" : "상세 리포트")}
            </div>
            <div className="text-xs text-muted-foreground">{isEnglish ? 'PDF Download' : 'PDF 다운로드'}</div>
          </div>
        </Button>
      </div>

      {/* IEP 생성 버튼 (구독자 전용) */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-purple-900 mb-2">{isEnglish ? 'Custom IEP Generation' : '맞춤형 개별교육계획(IEP) 생성'}</h4>
            <p className="text-purple-800 text-sm mb-4">
              {isEnglish 
                ? 'AI automatically generates an individualized education and treatment plan based on your premium ADHD assessment results.'
                : '프리미엄 ADHD 검사 결과를 바탕으로 AI가 개별화된 교육 및 치료 계획을 자동으로 생성해드립니다.'}
            </p>
            <Button
              onClick={() => navigate('/iep-generator', { 
                state: { 
                  assessmentResults: {
                    [isEnglish ? 'Premium ADHD Assessment' : '프리미엄 ADHD 검사']: results
                  } 
                }
              })}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              {isEnglish ? 'Generate Custom IEP' : '맞춤형 IEP 생성하기'}
            </Button>
          </div>
        </div>
      </Card>

      {/* 추천 상품 */}
      <ProductRecommendation 
        category="adhd"
      />

      {/* 참고 정보 */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="text-center space-y-3">
          <h3 className="font-semibold text-blue-800">{isEnglish ? 'Next Steps' : '다음 단계 안내'}</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p>• {isEnglish ? 'This is a self-assessment tool for reference only' : '본 검사는 자가 평가 도구로서 참고용입니다'}</p>
            <p>• {isEnglish ? 'Accurate diagnosis requires professional consultation' : '정확한 진단을 위해서는 전문의 상담이 필요합니다'}</p>
            <p>• {isEnglish ? 'ADHD can be significantly improved with proper treatment' : 'ADHD는 적절한 치료와 관리로 충분히 개선 가능합니다'}</p>
            <p>• {isEnglish ? 'Understanding and support from family is important' : '가족과 주변의 이해와 지원이 중요합니다'}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PremiumAdhdResult;