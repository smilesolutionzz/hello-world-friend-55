import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Download, MessageCircle, Bot, Brain, TrendingUp, AlertTriangle, Target, Users, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { useTestResultActions } from "@/hooks/useTestResultActions";
import ProductRecommendation from "@/components/ProductRecommendation";

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

  // AI 분석 생성
  useEffect(() => {
    const generateAIAnalysis = async () => {
      try {
        setIsAnalyzing(true);
        
        const analysisData = {
          assessmentType: 'premium_adhd',
          ageGroup: results.ageGroup,
          scores: results.scores,
          totalScore: results.totalScore,
          severityLevel: results.severityLevel,
          adhdSubtype: results.adhdSubtype,
          answers: results.answers
        };

        const { data, error } = await supabase.functions.invoke('enhanced-assessment-analyzer', {
          body: analysisData
        });

        if (error) throw error;

        setAnalysis(data.analysis || "분석 중 오류가 발생했습니다.");
        
        // 결과 저장
        await saveTestResult({
          testType: 'Premium ADHD 정밀검사',
          results: results,
          analysis: data.analysis,
          testInfo: {
            severityLevel: results.severityLevel,
            adhdSubtype: results.adhdSubtype,
            totalScore: results.totalScore
          },
          ageGroup: results.ageGroup
        });

      } catch (error) {
        console.error('AI 분석 생성 실패:', error);
        toast.error('AI 분석 생성에 실패했습니다.');
        setAnalysis("분석 생성에 실패했습니다. 전문가와 상담을 통해 정확한 해석을 받아보시기 바랍니다.");
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
    { name: '부주의', score: results.scores.inattention, fullMark: 200 },
    { name: '과잉행동', score: results.scores.hyperactivity, fullMark: 200 },
    { name: '충동성', score: results.scores.impulsivity, fullMark: 200 },
    { name: '실행기능', score: results.scores.executiveDysfunction, fullMark: 200 },
    { name: '동반증상', score: results.scores.comorbidity, fullMark: 100 },
    { name: '기능수준', score: results.scores.functionalImpairment, fullMark: 100 }
  ];

  const radarChartData = [
    { subject: '부주의', score: (results.scores.inattention / 200) * 100, fullMark: 100 },
    { subject: '과잉행동', score: (results.scores.hyperactivity / 200) * 100, fullMark: 100 },
    { subject: '충동성', score: (results.scores.impulsivity / 200) * 100, fullMark: 100 },
    { subject: '실행기능', score: (results.scores.executiveDysfunction / 200) * 100, fullMark: 100 }
  ];

  const barChartData = [
    { category: '부주의', score: results.scores.inattention },
    { category: '과잉행동', score: results.scores.hyperactivity },
    { category: '충동성', score: results.scores.impulsivity },
    { category: '실행기능', score: results.scores.executiveDysfunction }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          뒤로가기
        </Button>
        <h1 className="text-2xl font-bold">AIH 프리미엄 ADHD 정밀검사 결과</h1>
        <div className="w-24" />
      </div>

      {/* 법적 고지 */}
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800 mb-1">중요 안내사항</p>
            <p className="text-yellow-700">
              본 체크 결과는 자가 관찰 도구로서 참고 목적으로만 사용되며, 정식 전문평가를 대체할 수 없습니다. 
              정확한 진단과 치료를 위해서는 반드시 전문의와 상담하시기 바랍니다.
            </p>
          </div>
        </div>
      </Card>

      {/* 종합 결과 요약 */}
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold">종합 검사 결과</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${severity.bg}`}>
              <div className="text-2xl font-bold mb-1">{results.totalScore}점</div>
              <div className="text-sm text-muted-foreground">총점</div>
            </div>
            
            <div className={`p-4 rounded-lg ${severity.bg}`}>
              <div className={`text-lg font-semibold mb-1 ${severity.color}`}>{results.severityLevel}</div>
              <div className="text-sm text-muted-foreground">심각도</div>
            </div>
            
            <div className="p-4 rounded-lg bg-blue-50">
              <div className="text-lg font-semibold mb-1 text-blue-600">{results.adhdSubtype}</div>
              <div className="text-sm text-muted-foreground">ADHD 유형</div>
            </div>
            
            <div className="p-4 rounded-lg bg-purple-50">
              <div className="text-lg font-semibold mb-1 text-purple-600">{results.ageGroup}</div>
              <div className="text-sm text-muted-foreground">연령군</div>
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
            영역별 점수 분석
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
            ADHD 증상 패턴
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarChartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="점수"
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
        <h3 className="text-lg font-semibold mb-4">세부 영역별 분석</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scoreChartData.map((item, index) => {
            const percentage = (item.score / item.fullMark) * 100;
            const getScoreLevel = (percent: number) => {
              if (percent <= 25) return { level: "낮음", color: "text-green-600", bg: "bg-green-500" };
              if (percent <= 50) return { level: "보통", color: "text-yellow-600", bg: "bg-yellow-500" };
              if (percent <= 75) return { level: "높음", color: "text-orange-600", bg: "bg-orange-500" };
              return { level: "매우 높음", color: "text-red-600", bg: "bg-red-500" };
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
                    {item.score}/{item.fullMark}점 ({Math.round(percentage)}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* AI 전문가 해석 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI 전문가 심층 분석
        </h3>
        {isAnalyzing ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">AI가 검사 결과를 심층 분석하고 있습니다...</span>
          </div>
        ) : (
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed p-4 bg-muted/5 rounded-lg">
              {analysis}
            </div>
          </div>
        )}
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
            <div className="font-semibold">ADHD전문가연결</div>
            <div className="text-xs text-muted-foreground">온라인 상담</div>
          </div>
        </Button>

        <Button
          onClick={() => navigate('/counseling', { state: { assessmentResults: { ...results, testType: 'premium_adhd' } } })}
          className="h-auto p-4 flex flex-col items-center gap-2"
          variant="outline"
        >
          <MessageCircle className="w-6 h-6" />
          <div className="text-center">
            <div className="font-semibold">실시간 상담</div>
            <div className="text-xs text-muted-foreground">즉시 연결</div>
          </div>
        </Button>

        <Button
          onClick={() => navigate('/ai-counselor', { state: { assessmentResults: { ...results, testType: 'premium_adhd' } } })}
          className="h-auto p-4 flex flex-col items-center gap-2"
          variant="outline"
        >
          <Bot className="w-6 h-6" />
          <div className="text-center">
            <div className="font-semibold">AI 상담사</div>
            <div className="text-xs text-muted-foreground">24시간 이용</div>
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
              {isGeneratingPDF ? "생성 중..." : "상세 리포트"}
            </div>
            <div className="text-xs text-muted-foreground">PDF 다운로드</div>
          </div>
        </Button>
      </div>

      {/* 추천 상품 */}
      <ProductRecommendation 
        category="adhd"
      />

      {/* 참고 정보 */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="text-center space-y-3">
          <h3 className="font-semibold text-blue-800">다음 단계 안내</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p>• 본 검사는 자가 평가 도구로서 참고용입니다</p>
            <p>• 정확한 진단을 위해서는 전문의 상담이 필요합니다</p>
            <p>• ADHD는 적절한 치료와 관리로 충분히 개선 가능합니다</p>
            <p>• 가족과 주변의 이해와 지원이 중요합니다</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PremiumAdhdResult;