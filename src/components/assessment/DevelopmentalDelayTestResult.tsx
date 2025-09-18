import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Brain, TrendingUp, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTestResultActions } from "@/hooks/useTestResultActions";

interface DevelopmentalDelayTestResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    ageGroup: string;
    severity: string;
  };
  onBack: () => void;
  onRestart: () => void;
}

const DevelopmentalDelayTestResult = ({ results, onBack, onRestart }: DevelopmentalDelayTestResultProps) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { generatePDFReport, saveTestResult, isGeneratingPDF, isSaving } = useTestResultActions();

  useEffect(() => {
    analyzeResults();
  }, [results]);

  const analyzeResults = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('analyze-test-results', {
        body: {
          testType: 'developmental-delay',
          results,
          answers: results.answers
        }
      });

      if (error) throw error;
      
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error analyzing results:', error);
      toast({
        title: "분석 오류",
        description: "결과 분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      setAnalysis("결과 분석을 위해 전문가 상담을 권장합니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case '정상': return 'bg-green-500';
      case '경미': return 'bg-yellow-500';
      case '중등도': return 'bg-orange-500';
      case '심각': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case '정상': return <CheckCircle className="w-5 h-5" />;
      case '경미': return <TrendingUp className="w-5 h-5" />;
      case '중등도': return <AlertCircle className="w-5 h-5" />;
      case '심각': return <AlertCircle className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const handleSaveReport = async () => {
    try {
      await saveTestResult({
        testType: '발달지연 검사',
        results,
        analysis,
        ageGroup: results.ageGroup
      });
      
      toast({
        title: "저장 완료",
        description: "검사 결과가 저장되었습니다.",
      });
    } catch (error) {
      toast({
        title: "저장 실패",
        description: "결과 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleGeneratePDF = async () => {
    try {
      await generatePDFReport({
        testType: '발달지연 검사',
        results,
        analysis,
        testInfo: {
          totalQuestions: results.answers.length,
          completedAt: new Date().toLocaleString('ko-KR')
        }
      });
    } catch (error) {
      toast({
        title: "PDF 생성 실패",
        description: "PDF 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로가기
        </Button>
        <h1 className="text-2xl font-bold text-foreground">발달지연 검사 결과</h1>
      </div>

      {/* 결과 요약 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            검사 결과 요약
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{results.total}</div>
              <div className="text-sm text-muted-foreground">총점</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{results.average.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">평균점수</div>
            </div>
            <div className="text-center">
              <Badge className={`${getSeverityColor(results.severity)} text-white`}>
                {results.severity}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">평가등급</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{results.ageGroup}</div>
              <div className="text-sm text-muted-foreground">연령대</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>진행률</span>
              <span>100%</span>
            </div>
            <Progress value={100} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* AI 분석 결과 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getSeverityIcon(results.severity)}
            전문가 AI 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>결과를 분석하고 있습니다...</span>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-line text-foreground leading-relaxed">
                {analysis}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 액션 버튼들 */}
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={handleSaveReport}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              저장 중...
            </>
          ) : (
            "결과 저장"
          )}
        </Button>
        
        <Button 
          onClick={handleGeneratePDF}
          disabled={isGeneratingPDF}
          variant="outline"
        >
          {isGeneratingPDF ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              생성 중...
            </>
          ) : (
            "PDF 다운로드"
          )}
        </Button>
        
        <Button onClick={onRestart} variant="outline">
          다시 검사하기
        </Button>
        
        <Button 
          onClick={() => window.open('https://example.com/expert-consultation', '_blank')}
          className="bg-green-600 hover:bg-green-700"
        >
          전문가 상담 예약
        </Button>
      </div>
    </div>
  );
};

export default DevelopmentalDelayTestResult;