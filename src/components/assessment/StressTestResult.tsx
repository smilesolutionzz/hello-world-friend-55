import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Brain, Share2, RotateCcw, AlertTriangle, CheckCircle, Info, Heart, FileDown, Loader2, BarChart3, Download, ArrowLeft, MessageCircle, Copy, Instagram, Sparkles } from 'lucide-react';
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
    <div id="stress-result-content" className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-4 md:py-8">
      <div className="container mx-auto px-3 md:px-4 max-w-6xl">
        <PDFHeader testName="스트레스 전문가 분석 결과" />
        
        {/* 모바일 최적화 헤더 */}
        <div className="mb-4 md:mb-8">
          {/* 모바일 */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-2">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack} className="h-8 px-2 -ml-2">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span className="text-xs">뒤로</span>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handlePDFDownload} disabled={isDownloadingPDF} className="h-8 px-2">
                <Download className={`w-4 h-4 ${isDownloadingPDF ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Brain className="w-5 h-5 text-blue-500" />
              </div>
              <h1 className="text-lg font-bold">스트레스 분석 결과</h1>
            </div>
          </div>
          
          {/* 데스크톱 */}
          <div className="hidden md:block text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Brain className="w-8 h-8 text-blue-500" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold">스트레스 전문가 분석 결과</h1>
            </div>
          </div>
        </div>

        {/* 결과 요약 - 모바일 최적화 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-8">
          <Card className={`border-2 ${stressInfo.bgColor}`}>
            <CardHeader className="p-3 md:p-6 text-center">
              <div className="flex items-center justify-center gap-2 md:gap-3 mb-2">
                <IconComponent className={`w-8 h-8 md:w-12 md:h-12 ${stressInfo.color}`} />
                <CardTitle className={`text-lg md:text-2xl ${stressInfo.color}`}>
                  스트레스: {stressInfo.level}
                </CardTitle>
              </div>
              <p className="text-muted-foreground text-sm md:text-lg">
                총점 {result.total}점 / 평균 {result.average.toFixed(1)}점
              </p>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className={`p-2 md:p-4 rounded-lg ${stressInfo.bgColor} mb-3 md:mb-4`}>
                <p className={`text-xs md:text-sm ${stressInfo.color} mb-2`}>
                  {stressInfo.description}
                </p>
                <p className={`text-[10px] md:text-xs ${stressInfo.color} font-medium`}>
                  💡 {stressInfo.advice}
                </p>
              </div>
              
              <div className="space-y-1 md:space-y-2">
                <div className="flex justify-between text-xs md:text-sm">
                  <span>스트레스 수준</span>
                  <span className={stressInfo.color}>{((result.total / 48) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(result.total / 48) * 100} className="h-1.5 md:h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 md:p-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
                영역별 분석
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-6 pt-0">
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="domain" tick={{ fontSize: 9 }} />
                  <PolarRadiusAxis domain={[0, 5]} tick={false} />
                  <Radar
                    name="점수"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1 text-center">
                * 높을수록 스트레스 관리가 잘 됨
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 문항별 패턴 - 모바일에서 숨김 또는 축소 */}
        <Card className="mb-4 md:mb-6 hidden md:block">
          <CardHeader className="p-3 md:p-6 pb-2">
            <CardTitle className="text-sm md:text-base">문항별 응답 패턴</CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6 pt-0">
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="question" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 4]} tick={{ fontSize: 10 }} width={25} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="score"
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
              * 각 문항별 응답 점수 (0: 좋음, 4: 나쁨)
            </p>
          </CardContent>
        </Card>

        {/* AI 분석 - 모바일 최적화 */}
        <Card className="mb-4 md:mb-6">
          <CardHeader className="p-3 md:p-6 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm md:text-base">AI 전문가 분석</CardTitle>
              {!isAnalyzing && analysis && (
                <TextToSpeechButton text={analysis} />
              )}
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-4 md:py-8">
                <Loader2 className="w-5 h-5 md:w-8 md:h-8 animate-spin text-primary" />
                <span className="ml-2 text-xs md:text-sm text-muted-foreground">AI 분석 중...</span>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-xs md:text-sm leading-relaxed max-h-60 md:max-h-none overflow-y-auto">
                  {analysis}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 바이럴 공유 섹션 */}
        <Card className="p-6 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              친구들에게 공유하기
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              "이거 어디서 했어?" 친구들이 물어볼 거예요! 🔥
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            {/* 이미지 저장 */}
            <Button
              onClick={handlePDFDownload}
              disabled={isDownloadingPDF}
              className="flex-col h-auto py-3 bg-gradient-to-br from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
            >
              <Download className="w-5 h-5 mb-1" />
              <span className="text-[10px]">PDF 저장</span>
            </Button>

            {/* 카카오톡 */}
            <Button
              onClick={() => {
                const message = `📊 스트레스 자가진단 결과\n\n총점: ${result.total}점\n상태: ${result.severity}\n\n🔗 나도 해보기: ${window.location.origin}/assessment/stress-test\n\n#스트레스테스트 #자가진단 #AIHPRO`;
                if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                  window.location.href = `kakaotalk://send?text=${encodeURIComponent(message)}`;
                } else {
                  navigator.clipboard.writeText(message);
                  toast({ title: "카카오톡에 붙여넣기 하세요! 💬" });
                }
              }}
              className="flex-col h-auto py-3 bg-yellow-400 hover:bg-yellow-500 text-black"
            >
              <MessageCircle className="w-5 h-5 mb-1" />
              <span className="text-[10px]">카카오톡</span>
            </Button>

            {/* 인스타그램 */}
            <Button
              onClick={() => {
                handlePDFDownload();
                toast({ title: "PDF를 저장했어요!", description: "인스타 스토리에 업로드하세요 📸" });
              }}
              className="flex-col h-auto py-3 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:opacity-90"
            >
              <Instagram className="w-5 h-5 mb-1" />
              <span className="text-[10px]">인스타</span>
            </Button>

            {/* 공유하기 */}
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex-col h-auto py-3"
            >
              <Share2 className="w-5 h-5 mb-1" />
              <span className="text-[10px]">더보기</span>
            </Button>
          </div>

          {/* 링크 복사 */}
          <Button
            onClick={() => {
              const message = `📊 스트레스 자가진단: ${result.severity}\n\n테스트 해보기 👉 ${window.location.origin}/assessment/stress-test`;
              navigator.clipboard.writeText(message);
              toast({ title: "복사 완료!", description: "친구에게 공유하세요 💌" });
            }}
            variant="outline"
            className="w-full mb-3"
            size="sm"
          >
            <Copy className="w-4 h-4 mr-2" />
            결과 링크 복사하기
          </Button>

          <div className="flex gap-2">
            {onBack && (
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="flex-1"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                뒤로
              </Button>
            )}
            <Button 
              variant="ghost" 
              onClick={onRestart || (() => navigate('/assessment'))}
              className="flex-1"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              다시하기
            </Button>
          </div>
        </Card>

        {/* 바이럴 유도 메시지 */}
        <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <p className="text-sm">
            💡 <strong>친구도 테스트하면</strong> 서로 결과 비교할 수 있어요!
          </p>
        </div>
        
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