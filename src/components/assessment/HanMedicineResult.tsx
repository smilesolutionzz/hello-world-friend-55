import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Phone, 
  Download, 
  Share2, 
  RotateCcw, 
  Heart, 
  Pill, 
  Activity, 
  Home,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface HanMedicineResultProps {
  result: any;
  onRestart: () => void;
}

export const HanMedicineResult: React.FC<HanMedicineResultProps> = ({ result, onRestart }) => {
  const { toast } = useToast();
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [enhancedAnalysis, setEnhancedAnalysis] = useState<string | null>(null);
  const [clinicInfo, setClinicInfo] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const generateEnhancedAnalysis = async () => {
    setIsGeneratingAnalysis(true);
    setAnalysisError(null);
    
    try {
      console.log('Generating enhanced analysis for:', result.type);
      
      const { data, error } = await supabase.functions.invoke('han-medicine-analyzer', {
        body: {
          testType: result.type,
          score: result.score,
          maxScore: result.maxScore,
          percentage: result.percentage,
          answers: result.answers,
          severity: result.severity
        }
      });

      console.log('Analysis response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data && data.analysis) {
        setEnhancedAnalysis(data.analysis);
        setClinicInfo(data.clinicInfo);
        toast({
          title: "AI 분석 완료",
          description: "30년 경력 한의사 수준의 전문 분석이 완료되었습니다.",
        });
      } else {
        // 실패한 경우에도 기본 분석 제공
        setEnhancedAnalysis(data?.analysis || generateBasicAnalysis());
        setAnalysisError("AI 분석 중 일부 문제가 발생했지만, 기본 분석을 제공합니다.");
        toast({
          title: "기본 분석 제공",
          description: "네트워크 문제로 기본 분석을 제공합니다.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('분석 생성 중 오류:', error);
      setEnhancedAnalysis(generateBasicAnalysis());
      setAnalysisError("AI 분석 서비스 일시 중단. 기본 분석을 제공합니다.");
      toast({
        title: "기본 분석 제공",
        description: "현재 AI 분석 서비스에 일시적 문제가 있어 기본 분석을 제공합니다.",
        variant: "default"
      });
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  const generateBasicAnalysis = () => {
    const testNames = {
      adhd: 'ADHD',
      autism: '자폐 스펙트럼',
      atopy: '아토피',
      intellectual: '인지능력',
      stress: '스트레스'
    };

    const testName = testNames[result.type as keyof typeof testNames] || '한방';

    return `🔍 **${testName} 검사 결과 분석**

📊 **검사 점수**: ${result.score}/${result.maxScore}점 (${result.percentage}%)
🏥 **심각도**: ${result.severity} 단계

💊 **한의학적 접근법**:
검사 결과를 바탕으로 한의학적 체질 진단과 맞춤형 치료가 필요합니다. ${result.severity === '높음' ? '즉시 전문 한의사와 상담하여 정밀 진단을 받으시길 권합니다.' : '정기적인 관리와 예방 차원의 한방 치료를 고려해보세요.'}

🌿 **추천 관리법**:
- 개인 체질에 맞는 한약 처방
- 생활습관 개선 및 식이요법
- 스트레스 관리와 충분한 휴식
- 정기적인 전문 상담

⚕️ **전문 상담 권장**:
더 정확한 진단과 맞춤 치료를 위해 가까이한의원에서 전문 한의사와 상담받으시길 권합니다.

📞 상담 예약: 가까이한의원 1588-1234`;
  };

  const goHome = () => {
    window.location.href = '/';
  };

  const downloadResults = () => {
    const content = `
한방 검사 결과
검사 유형: ${getTestTypeName(result.type)}
점수: ${result.score}/${result.maxScore}점 (${result.percentage}%)
심각도: ${result.severity}

분석 내용:
${enhancedAnalysis || result.analysis}

추천사항:
${result.recommendations.map((rec: string, index: number) => `${index + 1}. ${rec}`).join('\n')}

가까이한의원 상담 링크: https://naver.me/xk1XPBhl
    `;
    
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = '한방검사결과.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const shareResults = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '한방 검사 결과',
          text: `한방 검사 결과: ${result.percentage}% - 가까이한의원에서 전문 상담 받으세요!`,
          url: 'https://naver.me/xk1XPBhl'
        });
      } catch (error) {
        console.log('공유 취소됨');
      }
    } else {
      navigator.clipboard.writeText('https://naver.me/xk1XPBhl');
      toast({
        title: "링크 복사됨",
        description: "가까이한의원 상담 링크가 클립보드에 복사되었습니다.",
      });
    }
  };

  const getTestTypeName = (type: string) => {
    const names: Record<string, string> = {
      autism: '자폐 스펙트럼 진단',
      adhd: 'ADHD 진단',
      intellectual: '인지능력 진단',
      atopy: '아토피 진단',
      stress: '스트레스 진단'
    };
    return names[type] || '한방 진단';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case '높음': return 'bg-red-100 text-red-800';
      case '중간': return 'bg-yellow-100 text-yellow-800';
      case '경미': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTestIcon = (type: string) => {
    switch (type) {
      case 'autism': return <Heart className="h-6 w-6 text-blue-500" />;
      case 'adhd': return <Activity className="h-6 w-6 text-orange-500" />;
      case 'intellectual': return <Pill className="h-6 w-6 text-purple-500" />;
      case 'atopy': return <Heart className="h-6 w-6 text-rose-500" />;
      case 'stress': return <Activity className="h-6 w-6 text-teal-500" />;
      default: return <Heart className="h-6 w-6 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              {getTestIcon(result.type)}
              <CardTitle className="text-2xl ml-3">{getTestTypeName(result.type)} 결과</CardTitle>
            </div>
            <div className="flex items-center justify-center space-x-4">
              <Badge className={getSeverityColor(result.severity)}>
                {result.severity} 단계
              </Badge>
              <span className="text-3xl font-bold text-primary">
                {result.percentage}%
              </span>
              <span className="text-sm text-muted-foreground">
                ({result.score}/{result.maxScore}점)
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* AI 분석 생성 버튼 */}
        {!enhancedAnalysis && (
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">AI</span>
                </div>
                <h3 className="text-lg font-semibold">전문 한의사 수준 AI 분석</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                🏥 <strong>GPT-4.1</strong>이 30년 경력 한의사의 전문 지식으로 <br/>
                체질별 맞춤 진단과 치료법을 제공합니다
              </p>
              <div className="flex items-center justify-center mb-4 space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  장부변증 분석
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                  맞춤 한약재 추천
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
                  생활요법 처방
                </div>
              </div>
              <Button 
                onClick={generateEnhancedAnalysis}
                disabled={isGeneratingAnalysis}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
              >
                {isGeneratingAnalysis ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    전문 분석 생성 중... (약 30초)
                  </>
                ) : (
                  '🔍 전문 분석 받기 (무료)'
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 분석 결과 */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Pill className="h-5 w-5 mr-2 text-primary" />
              {enhancedAnalysis ? '🏥 전문 한의사 수준 AI 분석' : '기본 한의학적 분석'}
            </CardTitle>
            {analysisError && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">⚠️ {analysisError}</p>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none">
              {enhancedAnalysis ? (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-l-4 border-primary">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{enhancedAnalysis}</div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{result.analysis}</p>
                </div>
              )}
            </div>
            {enhancedAnalysis && clinicInfo && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">📋 연계 전문 상담 가능</h4>
                <p className="text-sm text-green-700">
                  위 분석을 바탕으로 {clinicInfo.name}에서 더 정밀한 진단과 맞춤 치료를 받으실 수 있습니다.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 추천사항 */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-rose-500" />
              치료 추천사항
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {result.recommendations.map((recommendation: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 가까이한의원 연계 섹션 */}
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Phone className="h-5 w-5 mr-2" />
              가까이한의원 전문 상담
            </CardTitle>
            <CardDescription>
              검사 결과를 바탕으로 전문 한의사의 맞춤 상담을 받아보세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-800">제공 서비스</h4>
                <ul className="text-sm space-y-1">
                  <li>• 개별 체질 진단</li>
                  <li>• 맞춤 한약 처방</li>
                  <li>• 지속적 관리 프로그램</li>
                  <li>• 생활습관 개선 지도</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-green-800">상담 혜택</h4>
                <ul className="text-sm space-y-1">
                  <li>• 검사 결과 무료 해석</li>
                  <li>• 초회 상담료 할인</li>
                  <li>• 맞춤 치료 계획 제공</li>
                  <li>• 24시간 상담 가능</li>
                </ul>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => window.open('https://naver.me/xk1XPBhl', '_blank')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Phone className="h-4 w-4 mr-2" />
                맞춤한방 전화상담받기
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open('https://naver.me/xk1XPBhl', '_blank')}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                온라인 예약
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 액션 버튼들 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" onClick={goHome} className="flex items-center">
            <Home className="h-4 w-4 mr-2" />
            홈으로
          </Button>
          <Button variant="outline" onClick={downloadResults} className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            결과 저장
          </Button>
          <Button variant="outline" onClick={shareResults} className="flex items-center">
            <Share2 className="h-4 w-4 mr-2" />
            공유하기
          </Button>
          <Button variant="outline" onClick={onRestart} className="flex items-center">
            <RotateCcw className="h-4 w-4 mr-2" />
            다시 검사
          </Button>
        </div>

        {/* 신뢰성 표시 */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full px-6 py-3">
            <span className="text-lg">✨</span>
            <span className="font-medium text-foreground">
              <span className="text-brand-gradient font-bold">가까이한의원</span> 전문 한의사 검증 완료
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};