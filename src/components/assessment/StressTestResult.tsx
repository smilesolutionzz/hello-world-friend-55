import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Brain, Share2, RotateCcw, AlertTriangle, CheckCircle, Info, Heart, FileDown, Loader2, BarChart3, Download, ArrowLeft, MessageCircle, Copy, Instagram, Sparkles, Lock, UserPlus, Star, Shield, Crown, Wallet } from 'lucide-react';
import AnalysisLoadingScreen from './AnalysisLoadingScreen';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { PersonalizedProductRecommendation } from '@/components/product/PersonalizedProductRecommendation';
import { TextToSpeechButton } from '@/components/audio/TextToSpeechButton';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { PDFHeader } from '@/components/common/PDFHeader';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { CashBalanceDisplay } from '@/components/paywall/CashBalanceDisplay';
import { BlurredContent } from '@/components/paywall/BlurredContent';
import { useSubscription } from '@/hooks/useSubscription';
import { useLanguage } from '@/i18n';

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
  const { isEnglish, localePath } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  
  // 로그인 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();
  }, []);
  
  // 즉시 기본 분석 제공 - AI 분석은 백그라운드에서 로드
  const calculateRiskLevel = (): 'low' | 'medium' | 'high' => {
    if (result.total > 32) return 'high';
    if (result.total > 16) return 'medium';
    return 'low';
  };

  const generateDetailedFallbackAnalysis = (): string => {
    const risk = calculateRiskLevel();
    const avgScore = result.average.toFixed(1);
    
    let riskDescription = '';
    let immediateActions = '';
    let longTermStrategies = '';
    let professionalHelp = '';
    
    if (isEnglish) {
      if (risk === 'high') {
        riskDescription = `Current score: ${result.total} (avg ${avgScore}) — **High stress level**.`;
        immediateActions = `**Immediate actions:** 10-min daily meditation, adequate sleep (7-8 hrs), identify stressors`;
        professionalHelp = `⚠️ **Professional consultation is strongly recommended.**`;
      } else if (risk === 'medium') {
        riskDescription = `Current score: ${result.total} (avg ${avgScore}) — **Moderate stress level**.`;
        immediateActions = `**Recommendations:** Regular exercise (3x/week), hobbies, find stress relief methods`;
        professionalHelp = `Consider professional help if stress persists.`;
      } else {
        riskDescription = `Current score: ${result.total} (avg ${avgScore}) — **Healthy level**.`;
        immediateActions = `**Maintain:** Keep current lifestyle, regular self-check-ins`;
        professionalHelp = `Keep up the good work!`;
      }
      longTermStrategies = `**Long-term:** Regular routine, social connections, positive thinking`;
      return `**1. Stress Assessment**\n\n${riskDescription}\n\n**2. ${immediateActions}**\n\n**3. ${longTermStrategies}**\n\n**4. ${professionalHelp}**`;
    }

    if (risk === 'high') {
      riskDescription = `현재 총점 ${result.total}점(평균 ${avgScore}점)으로 **높은 수준의 스트레스** 상태입니다.`;
      immediateActions = `**즉시 실행:** 하루 10분 명상, 충분한 수면(7-8시간), 스트레스 요인 정리`;
      professionalHelp = `⚠️ **전문가 상담이 강력히 권장됩니다.**`;
    } else if (risk === 'medium') {
      riskDescription = `현재 총점 ${result.total}점(평균 ${avgScore}점)으로 **중간 수준의 스트레스** 상태입니다.`;
      immediateActions = `**권장사항:** 규칙적 운동(주 3회), 취미 활동, 스트레스 해소법 찾기`;
      professionalHelp = `스트레스가 지속되면 전문가 상담을 고려하세요.`;
    } else {
      riskDescription = `현재 총점 ${result.total}점(평균 ${avgScore}점)으로 **건강한 수준**입니다.`;
      immediateActions = `**유지 권장:** 현재 생활 패턴 유지, 정기적 자기 점검`;
      professionalHelp = `현재 상태를 잘 유지하세요!`;
    }
    
    longTermStrategies = `**장기 전략:** 규칙적 생활, 사회적 관계 유지, 긍정적 사고 훈련`;

    return `**1. 스트레스 상태 평가**\n\n${riskDescription}\n\n**2. ${immediateActions}**\n\n**3. ${longTermStrategies}**\n\n**4. ${professionalHelp}**`;
  };

  const [analysis, setAnalysis] = useState<string>(generateDetailedFallbackAnalysis());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>(calculateRiskLevel());
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  // 자동 저장 - AI 분석 포함
  useAutoSaveTestResult({
    testType: '스트레스 검사',
    results: { total: result.total, average: result.average, answers: result.answers },
    analysis: analysis,
    severity: result.severity
  });

  // 백그라운드에서 AI 분석 로드 (선택적 - 사용자 경험 개선)
  useEffect(() => {
    const fetchAIAnalysis = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('stress-analyzer', {
          body: {
            answers: result.answers,
            totalScore: result.total,
            average: result.average,
            severity: result.severity
          }
        });

        if (!error && data?.analysis) {
          setAnalysis(data.analysis);
          if (data.riskLevel) setRiskLevel(data.riskLevel);
        }
      } catch (error) {
        console.error('Background AI analysis error:', error);
        // 실패해도 이미 기본 분석이 표시되어 있으므로 무시
      }
    };

    // 3초 후 백그라운드에서 AI 분석 시도 (사용자는 이미 결과를 보고 있음)
    const timeoutId = setTimeout(fetchAIAnalysis, 3000);
    return () => clearTimeout(timeoutId);
  }, [result]);

  const handleShare = async () => {
    const shareText = isEnglish 
      ? `Stress Self-Assessment Result\nScore: ${result.total}\nStatus: ${result.severity}\n\nTry it yourself!`
      : `스트레스 자가진단 결과\n총점: ${result.total}점\n상태: ${result.severity}\n\n나도 테스트해보기!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: isEnglish ? 'Stress Self-Assessment Result' : '스트레스 자가진단 결과',
          text: shareText,
          url: `${window.location.origin}/assessment/stress-test`,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      const shareUrl = `${window.location.origin}/assessment/stress-test`;
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast({
        title: isEnglish ? "Result copied" : "결과가 복사되었습니다",
        description: isEnglish ? "Copied to clipboard!" : "클립보드에 결과를 복사했습니다!",
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
            title: isEnglish ? "PDF Download Complete" : "PDF 다운로드 완료",
            description: isEnglish ? "Stress test result saved." : "스트레스 검사 결과가 저장되었습니다.",
          });
        },
        (error) => {
          toast({
            title: isEnglish ? "Download Failed" : "다운로드 실패",
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
        level: isEnglish ? "Low" : "낮음",
        description: isEnglish ? "Your stress level is in a healthy range." : "현재 스트레스 수준이 건강한 범위에 있습니다.",
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200",
        icon: CheckCircle,
        advice: isEnglish ? "Maintain your good state with regular exercise and adequate rest." : "현재의 좋은 상태를 유지하기 위해 규칙적인 운동과 충분한 휴식을 취하세요."
      };
    } else if (result.total <= 32) {
      return {
        level: isEnglish ? "Moderate" : "보통",
        description: isEnglish ? "Your stress is slightly elevated. Management is needed." : "스트레스가 조금 높은 상태입니다. 관리가 필요합니다.",
        color: "text-orange-600",
        bgColor: "bg-orange-50 border-orange-200",
        icon: AlertTriangle,
        advice: isEnglish ? "Try stress management techniques: meditation, deep breathing, light exercise." : "스트레스 관리 기법을 시작해보세요. 명상, 깊은 호흡, 가벼운 운동이 도움됩니다."
      };
    } else {
      return {
        level: isEnglish ? "High" : "높음",
        description: isEnglish ? "Your stress is high. Active management is required." : "스트레스가 높은 상태입니다. 적극적인 관리가 필요합니다.",
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200",
        icon: AlertTriangle,
        advice: isEnglish ? "Consider seeking professional help. It's important to start stress management immediately." : "전문가의 도움을 받는 것을 고려해보세요. 즉시 스트레스 관리를 시작하는 것이 중요합니다."
      };
    }
  };

  const stressInfo = getStressLevel();
  const IconComponent = stressInfo.icon;

  // Create chart data
  const radarData = [
    { domain: isEnglish ? 'Emotional Stability' : '정서적 안정성', score: Math.max(1, 5 - (result.answers[0] + result.answers[2]) / 2) },
    { domain: isEnglish ? 'Problem Solving' : '문제해결능력', score: Math.max(1, 5 - (result.answers[3] + result.answers[6]) / 2) },
    { domain: isEnglish ? 'Physical Health' : '신체적 건강', score: Math.max(1, 5 - (result.answers[11] + result.answers[5]) / 2) },
    { domain: isEnglish ? 'Social Relations' : '사회적 관계', score: Math.max(1, 5 - (result.answers[10] + result.answers[8]) / 2) },
    { domain: isEnglish ? 'Future Outlook' : '미래 전망', score: Math.max(1, 5 - (result.answers[7] + result.answers[4]) / 2) },
    { domain: isEnglish ? 'Coping Skills' : '스트레스 대처', score: Math.max(1, 5 - (result.answers[1] + result.answers[9]) / 2) }
  ];

  const lineData = result.answers.map((score, index) => ({
    question: `Q${index + 1}`,
    score: score,
    reversed: score <= 2 ? 4 - score : score
  }));

  if (isAnalyzing) {
    return <AnalysisLoadingScreen testName={isEnglish ? "Stress Analysis" : "스트레스 분석"} estimatedSeconds={20} />;
  }

  return (
    <div id="stress-result-content" className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-4 md:py-8">
      <div className="container mx-auto px-3 md:px-4 max-w-6xl">
        <PDFHeader testName={isEnglish ? "Stress Expert Analysis Result" : "스트레스 전문가 분석 결과"} />
        
        {/* 모바일 최적화 헤더 */}
        <div className="mb-4 md:mb-8">
          {/* 모바일 */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-2">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack} className="h-8 px-2 -ml-2">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span className="text-xs">{isEnglish ? 'Back' : '뒤로'}</span>
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
              <h1 className="text-lg font-bold">{isEnglish ? 'Stress Analysis Result' : '스트레스 분석 결과'}</h1>
            </div>
          </div>
          
          {/* 데스크톱 */}
          <div className="hidden md:block text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Brain className="w-8 h-8 text-blue-500" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold">{isEnglish ? 'Stress Expert Analysis Result' : '스트레스 전문가 분석 결과'}</h1>
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
                  {isEnglish ? 'Stress:' : '스트레스:'} {stressInfo.level}
                </CardTitle>
              </div>
              <p className="text-muted-foreground text-sm md:text-lg">
                {isEnglish ? `Score ${result.total} / Avg ${result.average.toFixed(1)}` : `총점 ${result.total}점 / 평균 ${result.average.toFixed(1)}점`}
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
                  <span>{isEnglish ? 'Stress Level' : '스트레스 수준'}</span>
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
                {isEnglish ? 'Domain Analysis' : '영역별 분석'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-6 pt-0">
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="domain" tick={{ fontSize: 9 }} />
                  <PolarRadiusAxis domain={[0, 5]} tick={false} />
                  <Radar
                    name={isEnglish ? "Score" : "점수"}
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
                {isEnglish ? '* Higher = better stress management' : '* 높을수록 스트레스 관리가 잘 됨'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 문항별 패턴 - 모바일에서 숨김 또는 축소 */}
        <Card className="mb-4 md:mb-6 hidden md:block">
          <CardHeader className="p-3 md:p-6 pb-2">
            <CardTitle className="text-sm md:text-base">{isEnglish ? 'Response Pattern by Question' : '문항별 응답 패턴'}</CardTitle>
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
              {isEnglish ? '* Score per question (0: Good, 4: Poor)' : '* 각 문항별 응답 점수 (0: 좋음, 4: 나쁨)'}
            </p>
          </CardContent>
        </Card>

        {/* AI 분석 - 모바일 최적화 */}
        <Card className="mb-4 md:mb-6">
          <CardHeader className="p-3 md:p-6 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm md:text-base">{isEnglish ? 'AI Expert Analysis' : 'AI 전문가 분석'}</CardTitle>
              {!isAnalyzing && analysis && (
                <TextToSpeechButton text={analysis} />
              )}
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-4 md:py-8">
                <Loader2 className="w-5 h-5 md:w-8 md:h-8 animate-spin text-primary" />
                <span className="ml-2 text-xs md:text-sm text-muted-foreground">{isEnglish ? 'Analyzing...' : 'AI 분석 중...'}</span>
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
              {isEnglish ? 'Share with Friends' : '친구들에게 공유하기'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isEnglish ? '"Where did you take this?" Your friends will ask! 🔥' : '"이거 어디서 했어?" 친구들이 물어볼 거예요! 🔥'}
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
              <span className="text-[10px]">{isEnglish ? 'Save PDF' : 'PDF 저장'}</span>
            </Button>

            {/* 카카오톡 */}
            <Button
              onClick={() => {
                const message = isEnglish 
                  ? `📊 Stress Self-Assessment\n\nScore: ${result.total}\nStatus: ${result.severity}\n\n🔗 Try it: ${window.location.origin}/assessment/stress-test`
                  : `📊 스트레스 자가진단 결과\n\n총점: ${result.total}점\n상태: ${result.severity}\n\n🔗 나도 해보기: ${window.location.origin}/assessment/stress-test\n\n#스트레스테스트 #자가진단 #AIHPRO`;
                if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                  window.location.href = `kakaotalk://send?text=${encodeURIComponent(message)}`;
                } else {
                  navigator.clipboard.writeText(message);
                  toast({ title: isEnglish ? "Copied! Paste in your messenger 💬" : "카카오톡에 붙여넣기 하세요! 💬" });
                }
              }}
              className="flex-col h-auto py-3 bg-yellow-400 hover:bg-yellow-500 text-black"
            >
              <MessageCircle className="w-5 h-5 mb-1" />
              <span className="text-[10px]">{isEnglish ? 'Message' : '카카오톡'}</span>
            </Button>

            {/* 인스타그램 */}
            <Button
              onClick={() => {
                handlePDFDownload();
                toast({ title: isEnglish ? "PDF saved!" : "PDF를 저장했어요!", description: isEnglish ? "Upload to your Instagram story 📸" : "인스타 스토리에 업로드하세요 📸" });
              }}
              className="flex-col h-auto py-3 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:opacity-90"
            >
              <Instagram className="w-5 h-5 mb-1" />
              <span className="text-[10px]">{isEnglish ? 'Insta' : '인스타'}</span>
            </Button>

            {/* 공유하기 */}
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex-col h-auto py-3"
            >
              <Share2 className="w-5 h-5 mb-1" />
              <span className="text-[10px]">{isEnglish ? 'More' : '더보기'}</span>
            </Button>
          </div>

          {/* 링크 복사 */}
          <Button
            onClick={() => {
              const message = isEnglish 
                ? `📊 Stress Assessment: ${result.severity}\n\nTry it 👉 ${window.location.origin}/assessment/stress-test`
                : `📊 스트레스 자가진단: ${result.severity}\n\n테스트 해보기 👉 ${window.location.origin}/assessment/stress-test`;
              navigator.clipboard.writeText(message);
              toast({ title: isEnglish ? "Copied!" : "복사 완료!", description: isEnglish ? "Share with friends 💌" : "친구에게 공유하세요 💌" });
            }}
            variant="outline"
            className="w-full mb-3"
            size="sm"
          >
            <Copy className="w-4 h-4 mr-2" />
            {isEnglish ? 'Copy Result Link' : '결과 링크 복사하기'}
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
                {isEnglish ? 'Back' : '뒤로'}
              </Button>
            )}
            <Button 
              variant="ghost" 
              onClick={onRestart || (() => navigate(localePath('/assessment')))}
              className="flex-1"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {isEnglish ? 'Retry' : '다시하기'}
            </Button>
          </div>
        </Card>

        {/* 바이럴 유도 메시지 */}
        <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <p className="text-sm">
            💡 <strong>{isEnglish ? 'If your friends take the test too,' : '친구도 테스트하면'}</strong> {isEnglish ? 'you can compare results!' : '서로 결과 비교할 수 있어요!'}
          </p>
        </div>
        
        {/* 비로그인 사용자: 가입 유도 오버레이로 하단 가림 */}
        {isLoggedIn === false ? (
          <div className="relative mt-6">
            {/* 흐릿한 배경으로 실제 콘텐츠 힌트 */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              <div className="blur-sm opacity-30">
                <div className="bg-gradient-to-br from-primary/10 to-primary-glow/10 p-6 rounded-2xl">
                  <div className="h-24 bg-muted/50 rounded-lg mb-4"></div>
                  <div className="h-32 bg-muted/50 rounded-lg mb-4"></div>
                  <div className="h-20 bg-muted/50 rounded-lg"></div>
                </div>
              </div>
            </div>
            
            {/* 가입 유도 카드 */}
            <Card className="relative z-10 border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary-glow/5 shadow-xl">
              <CardContent className="p-6 md:p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl md:text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  {isEnglish ? 'Unlock Full Results' : '전체 결과를 확인하세요'}
                </h3>
                
                <p className="text-muted-foreground mb-6 text-sm md:text-base">
                  {isEnglish ? 'Sign up free for personalized expert recommendations and detailed analysis.' : <>무료 회원가입으로 맞춤 전문가 추천과<br />더 상세한 분석 결과를 받아보세요</>}
                </p>
                
                {/* 혜택 리스트 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                  <div className="flex items-center gap-2 p-3 bg-background/80 rounded-lg border">
                    <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <span className="text-sm font-medium">{isEnglish ? 'Expert Matching' : '맞춤 전문가 추천'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-background/80 rounded-lg border">
                    <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm font-medium">{isEnglish ? 'Save Results' : '결과 영구 저장'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-background/80 rounded-lg border">
                    <Brain className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <span className="text-sm font-medium">{isEnglish ? 'Deep AI Analysis' : '심층 AI 분석'}</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 shadow-lg"
                    onClick={() => navigate(localePath('/auth?mode=signup'))}
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    {isEnglish ? 'Free Sign Up' : '무료 회원가입'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigate(localePath('/auth'))}
                  >
                    {isEnglish ? 'Log In' : '로그인'}
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground mt-4">
                  🔒 {isEnglish ? 'Your data is securely protected' : '개인정보는 안전하게 보호됩니다'}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* 로그인 사용자: 맞춤 추천 및 B2B 제안 */
          <PersonalizedProductRecommendation 
            testType="stress"
            testResult={result}
          />
        )}
      </div>
    </div>
  );
};

export default StressTestResult;