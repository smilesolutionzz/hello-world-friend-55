import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Brain, Share2, RotateCcw, AlertTriangle, CheckCircle, Info, Heart, FileDown, Loader2, BarChart3, Download, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { PersonalizedProductRecommendation } from '@/components/product/PersonalizedProductRecommendation';
import { TextToSpeechButton } from '@/components/audio/TextToSpeechButton';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { PDFHeader } from '@/components/common/PDFHeader';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';

interface StressTestResultProps {
  result: {
    answers: number[];
    total: number;
    average: number;
    severity: string;
  };
  onRestart?: () => void;
  onBack?: () => void;
}

const StressTestResult = ({ result, onRestart, onBack }: StressTestResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  // 자동 저장 - AI 분석 포함
  useAutoSaveTestResult({
    testType: '스트레스 검사',
    results: { total: result.total, average: result.average, answers: result.answers },
    analysis: analysis,
    severity: result.severity
  });

  useEffect(() => {
    const analyzeStressResults = async () => {
      try {
        setIsAnalyzing(true);
        
        const { data, error } = await supabase.functions.invoke('stress-analyzer', {
          body: {
            answers: result.answers,
            totalScore: result.total,
            average: result.average,
            severity: result.severity
          }
        });

        if (error) {
          console.error('Stress analyzer error:', error);
          // 에러 발생 시에도 상세한 기본 분석 제공
          setAnalysis(generateDetailedFallbackAnalysis());
          setRiskLevel(calculateRiskLevel());
        } else {
          setAnalysis(data.analysis || data.fallbackAnalysis || generateDetailedFallbackAnalysis());
          setRiskLevel(data.riskLevel || calculateRiskLevel());
        }
      } catch (error) {
        console.error('Analysis error:', error);
        // 예외 발생 시에도 상세한 기본 분석 제공
        setAnalysis(generateDetailedFallbackAnalysis());
        setRiskLevel(calculateRiskLevel());
      } finally {
        setIsAnalyzing(false);
      }
    };

    const calculateRiskLevel = (): 'low' | 'medium' | 'high' => {
      if (result.total > 32) return 'high';
      if (result.total > 16) return 'medium';
      return 'low';
    };

    const generateDetailedFallbackAnalysis = (): string => {
      const riskLevel = calculateRiskLevel();
      const avgScore = result.average.toFixed(1);
      
      let riskDescription = '';
      let immediateActions = '';
      let longTermStrategies = '';
      let professionalHelp = '';
      
      if (riskLevel === 'high') {
        riskDescription = `현재 총점 ${result.total}점(평균 ${avgScore}점)으로 **높은 수준의 스트레스** 상태입니다. 일상생활에 상당한 영향을 미치고 있을 가능성이 높습니다.`;
        immediateActions = `
**즉시 실행 권장사항:**
1. 오늘부터 하루 10분 이상 깊은 호흡 명상을 실천하세요
2. 충분한 수면(7-8시간)을 최우선으로 확보하세요
3. 스트레스 요인을 기록하고 우선순위를 정리하세요`;
        professionalHelp = `\n**⚠️ 전문가 상담이 강력히 권장됩니다.** 지속적인 고민이 있으시다면 정신건강 전문가와의 상담을 고려해주세요.`;
      } else if (riskLevel === 'medium') {
        riskDescription = `현재 총점 ${result.total}점(평균 ${avgScore}점)으로 **중간 수준의 스트레스** 상태입니다. 적절한 관리가 필요한 시점입니다.`;
        immediateActions = `
**즉시 실행 권장사항:**
1. 규칙적인 운동(주 3회, 30분 이상)을 시작하세요
2. 취미 활동이나 휴식 시간을 의식적으로 확보하세요
3. 스트레스 해소를 위한 나만의 방법을 찾아보세요`;
        professionalHelp = `\n**전문가 도움:** 스트레스가 지속되거나 악화된다면 전문가와 상담하는 것이 도움이 될 수 있습니다.`;
      } else {
        riskDescription = `현재 총점 ${result.total}점(평균 ${avgScore}점)으로 **건강한 수준**입니다. 현재의 좋은 상태를 유지하는 것이 중요합니다.`;
        immediateActions = `
**유지 권장사항:**
1. 현재의 생활 패턴을 잘 유지하세요
2. 예방 차원에서 정기적인 자기 점검을 하세요
3. 스트레스 관리 기술을 지속적으로 연습하세요`;
        professionalHelp = `\n**예방:** 현재 상태가 좋지만, 정기적인 자가 점검으로 건강한 정신 상태를 유지하세요.`;
      }
      
      longTermStrategies = `
**장기적 스트레스 관리 전략:**
1. 규칙적인 생활 리듬 확립 (수면, 식사, 운동)
2. 사회적 지지망 구축 및 유지 (가족, 친구와의 관계)
3. 긍정적 사고 훈련 및 감사 일기 작성
4. 정기적인 자기 돌봄 시간 확보`;

      return `**1. 현재 스트레스 상태 종합 평가**

${riskDescription}

**개별 응답 분석:**
- 최고점: ${Math.max(...result.answers)}점 (특정 영역에서 높은 스트레스)
- 최저점: ${Math.min(...result.answers)}점
- 응답 편차: ${(Math.max(...result.answers) - Math.min(...result.answers))}점

**2. 스트레스 영역별 분석**

각 문항에서 나타난 스트레스 패턴을 통해 정서적, 신체적, 인지적, 사회적 영역에서 스트레스가 복합적으로 작용하고 있음을 확인할 수 있습니다.

${immediateActions}

${longTermStrategies}

**5. 생활습관 개선 권장사항:**
- **수면:** 규칙적인 수면 시간 유지, 취침 전 스크린 타임 줄이기
- **운동:** 유산소 운동과 스트레칭을 병행하여 신체적 긴장 완화
- **식습관:** 균형 잡힌 영양 섭취, 카페인/알코올 섭취 조절
- **휴식:** 업무와 개인 시간의 명확한 분리, 정기적인 취미 활동

${professionalHelp}

**6. 📋 요약 및 제언**

**핵심 스트레스 상태 요약:** ${result.severity} 상태로, 전반적인 스트레스 수준은 ${riskLevel === 'high' ? '높은 편' : riskLevel === 'medium' ? '중간' : '낮은 편'}입니다. ${riskLevel === 'high' ? '적극적인 관리가 필요합니다.' : riskLevel === 'medium' ? '예방적 관리를 시작하세요.' : '현재 상태를 잘 유지하세요.'}

**희망적 전망:** 스트레스는 적절한 관리와 노력으로 충분히 개선될 수 있습니다. 작은 변화부터 시작하여 꾸준히 실천하면 긍정적인 결과를 경험하실 수 있습니다. 💪`;
    };

    analyzeStressResults();
  }, [result]);

  const handleShare = async () => {
    const shareText = `스트레스 자가진단 결과\n총점: ${result.total}점\n상태: ${result.severity}\n\n나도 테스트해보기!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '스트레스 자가진단 결과',
          text: shareText,
          url: `${window.location.origin}/assessment/stress-test`,
        });
      } catch (error) {
        console.log('공유 취소됨');
      }
    } else {
      const shareUrl = `${window.location.origin}/assessment/stress-test`;
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast({
        title: "결과가 복사되었습니다",
        description: "클립보드에 결과를 복사했습니다!",
      });
    }
  };

  const handlePDFDownload = async () => {
    try {
      setIsDownloadingPDF(true);
      await downloadResultAsPDF(
        'stress-result-content',
        '스트레스_검사_결과',
        () => {
          toast({
            title: "PDF 다운로드 완료",
            description: "스트레스 검사 결과가 저장되었습니다.",
          });
        },
        (error) => {
          toast({
            title: "다운로드 실패",
            description: error.message,
            variant: "destructive",
          });
        }
      );
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const getStressLevel = () => {
    if (result.total <= 16) {
      return {
        level: "낮음",
        description: "현재 스트레스 수준이 건강한 범위에 있습니다.",
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200",
        icon: CheckCircle,
        advice: "현재의 좋은 상태를 유지하기 위해 규칙적인 운동과 충분한 휴식을 취하세요."
      };
    } else if (result.total <= 32) {
      return {
        level: "보통",
        description: "스트레스가 조금 높은 상태입니다. 관리가 필요합니다.",
        color: "text-orange-600",
        bgColor: "bg-orange-50 border-orange-200",
        icon: AlertTriangle,
        advice: "스트레스 관리 기법을 시작해보세요. 명상, 깊은 호흡, 가벼운 운동이 도움됩니다."
      };
    } else {
      return {
        level: "높음",
        description: "스트레스가 높은 상태입니다. 적극적인 관리가 필요합니다.",
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200",
        icon: AlertTriangle,
        advice: "전문가의 도움을 받는 것을 고려해보세요. 즉시 스트레스 관리를 시작하는 것이 중요합니다."
      };
    }
  };

  const stressInfo = getStressLevel();
  const IconComponent = stressInfo.icon;

  // Create chart data
  const radarData = [
    { domain: '정서적 안정성', score: Math.max(1, 5 - (result.answers[0] + result.answers[2]) / 2) },
    { domain: '문제해결능력', score: Math.max(1, 5 - (result.answers[3] + result.answers[6]) / 2) },
    { domain: '신체적 건강', score: Math.max(1, 5 - (result.answers[11] + result.answers[5]) / 2) },
    { domain: '사회적 관계', score: Math.max(1, 5 - (result.answers[10] + result.answers[8]) / 2) },
    { domain: '미래 전망', score: Math.max(1, 5 - (result.answers[7] + result.answers[4]) / 2) },
    { domain: '스트레스 대처', score: Math.max(1, 5 - (result.answers[1] + result.answers[9]) / 2) }
  ];

  const lineData = result.answers.map((score, index) => ({
    question: `Q${index + 1}`,
    score: score,
    reversed: score <= 2 ? 4 - score : score
  }));

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <h3 className="font-semibold text-lg">AI 전문가 분석 중...</h3>
                <p className="text-muted-foreground">상세한 스트레스 분석을 생성하고 있습니다</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div id="stress-result-content" className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <PDFHeader testName="스트레스 전문가 분석 결과" />
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-blue-500/10">
              <Brain className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold">스트레스 전문가 분석 결과</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className={`border-2 ${stressInfo.bgColor}`}>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <IconComponent className={`w-12 h-12 ${stressInfo.color}`} />
                <CardTitle className={`text-2xl ${stressInfo.color}`}>
                  스트레스 수준: {stressInfo.level}
                </CardTitle>
              </div>
              <p className="text-muted-foreground text-lg">
                총점 {result.total}점 / 평균 {result.average.toFixed(1)}점
              </p>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg ${stressInfo.bgColor} mb-4`}>
                <p className={`text-sm ${stressInfo.color} mb-3`}>
                  {stressInfo.description}
                </p>
                <p className={`text-xs ${stressInfo.color} font-medium`}>
                  💡 전문가 조언: {stressInfo.advice}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>스트레스 수준</span>
                  <span className={stressInfo.color}>{((result.total / 48) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(result.total / 48) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                스트레스 영역별 분석
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="domain" className="text-xs" />
                  <PolarRadiusAxis domain={[0, 5]} tick={false} />
                  <Radar
                    name="점수"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                * 높은 점수일수록 해당 영역의 스트레스 관리가 잘 되고 있음
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>문항별 스트레스 응답 패턴</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="question" />
                <YAxis domain={[0, 4]} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'score' ? `응답값: ${value}` : `조정값: ${value}`,
                    name === 'score' ? '원점수' : '스트레스 수준'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="score"
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              * 각 문항별 응답 점수 (0: 매우 좋음, 4: 매우 나쁨)
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI 전문가 상세 분석</CardTitle>
              {!isAnalyzing && analysis && (
                <TextToSpeechButton text={analysis} />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">AI가 분석 중입니다...</span>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {analysis}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handlePDFDownload}
                disabled={isDownloadingPDF}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
              >
                <FileDown className="w-4 h-4 mr-2" />
                {isDownloadingPDF ? 'PDF 생성 중...' : 'PDF 다운로드'}
              </Button>
              <Button 
                onClick={handleShare}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Share2 className="w-4 h-4 mr-2" />
                결과 공유하기
              </Button>
              {onBack && (
                <Button 
                  variant="outline" 
                  onClick={onBack}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  뒤로가기
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={onRestart || (() => navigate('/assessment'))}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                다른 테스트 하기
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* 맞춤 추천 및 B2B 제안 */}
        <PersonalizedProductRecommendation 
          testType="stress"
          testResult={result}
        />
      </div>
    </div>
  );
};

export default StressTestResult;