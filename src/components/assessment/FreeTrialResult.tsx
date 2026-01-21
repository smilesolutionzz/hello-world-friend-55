import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Brain, Share2, Crown, Lock, ArrowRight, Star, ImageIcon, Loader2, FileDown, AlertTriangle, Wallet, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { useRedFlagDetection } from '@/hooks/useRedFlagDetection';
import RedFlagAlertDialog from './RedFlagAlertDialog';
import { CashBalanceDisplay } from '@/components/paywall/CashBalanceDisplay';
import { BlurredContent } from '@/components/paywall/BlurredContent';
import { useSubscription } from '@/hooks/useSubscription';

interface FreeTrialResultProps {
  result: {
    level?: string;
    color?: string;
    bgColor?: string;
    borderColor?: string;
    description?: string;
    recommendations?: string[];
    personalityType?: any;
    traits?: any;
    pastLifeJob?: any;
    counts?: any;
    testType?: string;
    totalScore?: number;
    averageScore?: number;
    answers?: any;
  };
}

const FreeTrialResult = ({ result }: FreeTrialResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isPremiumUser, isLifetimeUser } = useSubscription();
  const isPremium = isPremiumUser() || isLifetimeUser();
  
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  // 레드플래그 감지
  const { redFlagResult, showAlert, closeAlert, openAlert, hasRedFlags } = useRedFlagDetection({
    result: {
      level: result.level,
      description: result.description,
      totalScore: result.totalScore,
      recommendations: result.recommendations
    },
    testType: result.testType,
    enabled: true
  });

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    try {
      await downloadResultAsPDF(
        'free-trial-result',
        `무료체험결과_${new Date().toISOString().split('T')[0]}`,
        () => {
          toast({
            title: "PDF 다운로드 완료",
            description: "검사 결과가 PDF로 저장되었습니다.",
          });
        },
        (error) => {
          toast({
            title: "PDF 다운로드 실패",
            description: error.message,
            variant: "destructive",
          });
        }
      );
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  // 3분 테스트 결과 자동 저장
  const getTestTypeName = () => {
    if (result.testType === 'mental_health_quick') return '심리상태 3분 체크';
    if (result.testType === 'anxiety_quick_check') return '불안감 3분 체크';
    if (result.testType === 'personality_love') return '연애 성격 분석';
    if (result.testType === 'past_life_job_free') return '전생 직업 테스트';
    if (result.testType === 'communication_style') return '소통 스타일 진단';
    return result.testType || '3분 무료 테스트';
  };

  useAutoSaveTestResult({
    testType: getTestTypeName(),
    results: result && Object.keys(result).length > 0 ? {
      level: result.level,
      description: result.description,
      personalityType: result.personalityType,
      pastLifeJob: result.pastLifeJob,
      totalScore: result.totalScore,
      averageScore: result.averageScore,
      traits: result.traits,
      counts: result.counts,
      answers: result.answers
    } : null,
    severity: result.level || result.personalityType?.type || result.pastLifeJob?.job
  });

  const handleShare = async () => {
    const shareText = `나의 심리테스트 결과를 확인해보세요!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '심리테스트 결과',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.log('공유 취소됨');
      }
    } else {
      navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
      toast({
        title: "링크 복사 완료",
        description: "결과 링크가 클립보드에 복사되었습니다.",
      });
    }
  };

  const handleUpgrade = () => {
    navigate('/auth');
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    try {
      const testTypeName = result.testType === 'personality' ? '성격 테스트' : 
                           result.testType === 'past_life' ? '전생 테스트' : '심리 테스트';
      const prompt = `${testTypeName} 결과를 표현하는 창의적이고 매력적인 일러스트. ${result.level || result.personalityType?.type || '테스트 결과'}를 시각화한 따뜻하고 친근한 분위기의 이미지. 현대적이고 밝은 색감. Ultra high resolution`;
      
      const { data, error } = await supabase.functions.invoke('generate-report-image', {
        body: { prompt }
      });

      if (error) throw error;
      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast({
          title: "이미지 생성 완료",
          description: "무료 체험 결과 일러스트가 생성되었습니다.",
        });
      }
    } catch (error: any) {
      console.error('이미지 생성 실패:', error);
      toast({
        title: "이미지 생성 실패",
        description: error.message || '이미지 생성 중 오류가 발생했습니다.',
        variant: "destructive"
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-500/10 to-blue-500/20 py-8">
      {/* 레드플래그 알림 다이얼로그 */}
      <RedFlagAlertDialog 
        isOpen={showAlert} 
        onClose={closeAlert} 
        redFlagResult={redFlagResult} 
      />

      <div id="free-trial-result" className="container mx-auto px-4 max-w-4xl">
        {/* 상단 캐시 잔액 표시 */}
        <div className="mb-6">
          <CashBalanceDisplay />
        </div>

        {/* 레드플래그 배너 (항상 표시) */}
        {hasRedFlags && (
          <div 
            onClick={openAlert}
            className={`mb-6 p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
              redFlagResult.overallSeverity === 'critical' 
                ? 'bg-destructive/10 border-destructive animate-pulse' 
                : 'bg-orange-50 border-orange-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className={`w-6 h-6 flex-shrink-0 ${
                redFlagResult.overallSeverity === 'critical' ? 'text-destructive' : 'text-orange-600'
              }`} />
              <div className="flex-1">
                <p className={`font-semibold ${
                  redFlagResult.overallSeverity === 'critical' ? 'text-destructive' : 'text-orange-700'
                }`}>
                  {redFlagResult.overallSeverity === 'critical' 
                    ? '⚠️ 즉각적인 전문가 상담이 필요합니다' 
                    : '⚠️ 전문가 상담을 권장드립니다'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  검사 결과에서 중요한 신호가 감지되었습니다. 탭하여 자세히 보기
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-brand-gradient">무료 체험 결과</h1>
          </div>
          <p className="text-muted-foreground">
            기본 분석 결과입니다. 회원가입하면 AI 초정밀 분석을 받으실 수 있어요!
          </p>
          <Button 
            onClick={handleDownloadPDF}
            disabled={isDownloadingPDF}
            variant="outline"
            className="mt-4"
          >
            {isDownloadingPDF ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4 mr-2" />
            )}
            PDF 저장
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Basic Result Card */}
          <Card className="hover-glow transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  📊 기본 분석 결과
                  <Badge className="bg-gray-100 text-gray-600 text-xs">
                    무료 버전
                  </Badge>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {result.level && (
                <div className={`p-4 rounded-lg ${result.bgColor} ${result.borderColor} border`}>
                  <h3 className={`text-lg font-semibold mb-2 ${result.color}`}>
                    {result.level}
                  </h3>
                  <p className="text-gray-700 mb-4">{result.description}</p>
                  
                  {result.recommendations && (
                    <div>
                      <h4 className="font-medium mb-2">기본 권장사항:</h4>
                      <ul className="space-y-1">
                        {result.recommendations.slice(0, 2).map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {result.personalityType && (
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <h3 className="text-lg font-semibold mb-2 text-purple-700">
                    {result.personalityType.type}
                  </h3>
                  <p className="text-gray-700 mb-4">{result.personalityType.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 text-purple-600">주요 특성:</h4>
                      <ul className="space-y-1">
                        {result.personalityType.strengths?.slice(0, 2).map((strength: string, index: number) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-purple-600">발전 방향:</h4>
                      <ul className="space-y-1">
                        {result.personalityType.tips?.slice(0, 2).map((tip: string, index: number) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {result.pastLifeJob && (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <h3 className="text-lg font-semibold mb-2 text-amber-700 flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    {result.pastLifeJob.job}
                  </h3>
                  <p className="text-gray-700 mb-3">{result.pastLifeJob.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-1 text-amber-600">시대적 배경:</h4>
                      <p className="text-sm text-gray-600">{result.pastLifeJob.era}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 text-amber-600">주요 특성:</h4>
                      <div className="grid grid-cols-2 gap-1">
                        {result.pastLifeJob.traits?.slice(0, 4).map((trait: string, index: number) => (
                          <div key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                            {trait}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-amber-100 p-3 rounded-lg">
                      <h4 className="font-medium mb-1 text-amber-700">현재와의 연결점:</h4>
                      <p className="text-sm text-amber-700">{result.pastLifeJob.modernConnection}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI 일러스트 생성 */}
          <Card className="hover-glow transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  검사 결과 일러스트
                </CardTitle>
                {!generatedImage && (
                  <Button 
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isGeneratingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        생성 중...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        일러스트 생성
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedImage ? (
                <img 
                  src={generatedImage} 
                  alt="무료 체험 결과 일러스트" 
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-gradient-to-br from-purple-50/50 to-blue-50/50 rounded-lg border border-dashed border-gray-300">
                  버튼을 눌러 검사 결과를 표현하는 일러스트를 생성해보세요
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upgrade CTA Card */}
          <Card className="relative overflow-hidden border-2 border-transparent bg-clip-border">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-lg"></div>
            <div className="relative z-10">
              <CardHeader>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  <CardTitle className="text-xl text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    AI 초정밀 전문가급 해석 받기
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        NOW
                      </div>
                      현재 무료 해석
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        기본적인 점수 분석
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        일반적인 결과 요약
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        표면적 권장사항
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl border-2 border-transparent bg-clip-border relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl"></div>
                    <div className="relative z-10">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          PRO
                        </div>
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          AI 초정밀 해석
                        </span>
                      </h4>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="font-medium text-blue-700">2000자+ 상세 분석</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="font-medium text-purple-700">전문가급 해석</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="font-medium text-pink-700">개인 맞춤 솔루션</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="font-medium text-blue-700">심층 심리 분석</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-800">
                    ✨ <strong>지금 회원가입하면</strong> 이 테스트도 <strong className="text-amber-900">AI 초정밀 해석</strong>으로 다시 받아보실 수 있어요!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={handleUpgrade}
                    className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 text-white"
                    size="lg"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    AI 초정밀 해석 받기
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <Button 
                    onClick={handleShare}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    결과 공유하기
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline"
              onClick={() => navigate('/free-trial')}
              className="flex-1 max-w-xs"
            >
              다른 무료 테스트 해보기
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1 max-w-xs"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeTrialResult;