import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adhdTypes } from "@/data/advancedAdhdTypes";
import { Home, Download, ImageIcon, Loader2, RefreshCw, Crown, Wallet, Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { CashBalanceDisplay } from '@/components/paywall/CashBalanceDisplay';
import { BlurredContent } from '@/components/paywall/BlurredContent';
import { useSubscription } from '@/hooks/useSubscription';

interface AdvancedAdhdResultProps {
  results: {
    typeScores: Record<string, number>;
    timestamp: string;
  };
  onBack?: () => void;
  onRestart?: () => void;
}

const AdvancedAdhdResult = ({ results, onBack, onRestart }: AdvancedAdhdResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { typeScores } = results;
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // 가장 높은 점수의 유형 찾기
  const dominantType = Object.entries(typeScores).reduce((a, b) => 
    typeScores[a[0]] > typeScores[b[0]] ? a : b
  )[0];

  // 자동 저장
  useAutoSaveTestResult({
    testType: '고급 ADHD 유형 검사',
    results: {
      typeScores: results.typeScores,
      dominantType,
      timestamp: results.timestamp,
    },
    severity: typeScores[dominantType] > 30 ? '높음' : typeScores[dominantType] > 15 ? '보통' : '양호',
    ageGroup: 'adult',
  });

  const dominantTypeData = adhdTypes[dominantType];

  // 각 유형의 심각도 레벨 결정
  const getSeverityLevel = (score: number, type: string) => {
    const levels = adhdTypes[type].severityLevels;
    for (const [level, data] of Object.entries(levels)) {
      if (score >= data.range[0] && score <= data.range[1]) {
        return { level, ...data };
      }
    }
    return { level: "보통", percentage: 0, range: [0, 0] };
  };

  const getColorByScore = (score: number) => {
    if (score <= 10) return "bg-blue-500";
    if (score <= 20) return "bg-cyan-500";
    if (score <= 30) return "bg-purple-500";
    if (score <= 40) return "bg-pink-500";
    return "bg-red-500";
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    try {
      const prompt = `12가지 ADHD 유형 분석 결과를 시각화하는 전문적인 심리 검사 일러스트를 그려주세요.
주요 ADHD 유형: ${dominantTypeData.name}
${dominantTypeData.description}
따뜻하고 희망적인 분위기로 ADHD를 가진 사람들이 자신을 이해하고 성장할 수 있다는 메시지를 전달해주세요.
전문적인 의료 및 심리 검사 리포트 스타일의 일러스트로 표현해주세요.
파스텔 톤의 밝고 편안한 색상을 사용하세요.
- 텍스트 없이
- 고해상도로`;

      const { data, error } = await supabase.functions.invoke('generate-report-image', {
        body: { prompt }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast({
          title: "이미지 생성 완료!",
          description: "AI가 ADHD 유형 분석을 시각화했습니다.",
        });
      }
    } catch (error) {
      console.error('이미지 생성 오류:', error);
      toast({
        title: "이미지 생성 실패",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDownload = async () => {
    try {
      const content = `
# 12가지 ADHD 유형 분석 결과

검사 일시: ${new Date(results.timestamp).toLocaleString('ko-KR')}

## 주요 ADHD 유형
**${dominantTypeData.name}**
${dominantTypeData.description}

### 특징
${dominantTypeData.characteristics.map((c, i) => `${i + 1}. ${c}`).join('\n')}

### 권장 치료 접근
${dominantTypeData.treatmentApproach.map((t, i) => `${i + 1}. ${t}`).join('\n')}

## 전체 유형별 점수

${Object.entries(typeScores).map(([typeId, score]) => {
  const typeData = adhdTypes[typeId];
  const severity = getSeverityLevel(score, typeId);
  return `### ${typeData.name}\n점수: ${score}/54\n심각도: ${severity.level}\n`;
}).join('\n')}

---
본 결과는 참고용이며, 정확한 진단은 전문가 상담이 필요합니다.
      `;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ADHD_유형분석_${new Date().toLocaleDateString('ko-KR').replace(/\./g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('다운로드 오류:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <Card className="p-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">12가지 ADHD 유형 분석 결과</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            검사 완료: {new Date(results.timestamp).toLocaleString('ko-KR')}
          </p>
        </Card>

        {/* AI 일러스트 생성 */}
        <Card className="p-6 md:p-8 border-2 border-primary/20">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">AI 일러스트</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              AI가 당신의 ADHD 유형 분석을 시각적으로 표현한 일러스트를 생성합니다.
            </p>
            
            {!generatedImage && (
              <Button 
                onClick={handleGenerateImage}
                disabled={isGeneratingImage}
                className="w-full"
                size="lg"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    이미지 생성 중...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    일러스트 생성하기
                  </>
                )}
              </Button>
            )}

            {generatedImage && (
              <div className="space-y-3">
                <img 
                  src={generatedImage} 
                  alt="AI 생성 ADHD 유형 일러스트"
                  className="w-full rounded-lg shadow-lg"
                />
                <Button 
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  다시 생성하기
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Dominant Type Card */}
        <Card className="p-6 md:p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold mb-2">주요 ADHD 유형</h2>
              <div className={`inline-block px-4 py-2 md:px-6 md:py-3 rounded-full bg-gradient-to-r ${dominantTypeData.colorGradient} text-white text-base md:text-xl font-semibold`}>
                {dominantTypeData.name}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-4">
                {dominantTypeData.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">주요 특징</h3>
                <ul className="space-y-2">
                  {dominantTypeData.characteristics.map((char, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span className="text-sm">{char}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">권장 치료 접근</h3>
                <ul className="space-y-2">
                  {dominantTypeData.treatmentApproach.map((approach, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span className="text-sm">{approach}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* All Types Visualization */}
        <Card className="p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">전체 ADHD 유형 프로파일</h2>
          
          <div className="space-y-6">
            {Object.entries(typeScores)
              .sort(([, a], [, b]) => b - a)
              .map(([typeId, score]) => {
                const typeData = adhdTypes[typeId];
                const severity = getSeverityLevel(score, typeId);
                const percentage = (score / 54) * 100;

                return (
                  <div key={typeId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm md:text-base font-medium">{typeData.name}</div>
                        <div className="text-xs md:text-sm text-muted-foreground">
                          {score}/54 • {severity.level} ({severity.percentage}%)
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-8 overflow-hidden">
                      <div 
                        className={`h-full ${getColorByScore(score)} transition-all duration-1000 flex items-center justify-end pr-3`}
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="text-white text-xs font-semibold">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    </div>

                    {/* Severity markers */}
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>매우낮음</span>
                      <span>낮음</span>
                      <span>보통</span>
                      <span>높음</span>
                      <span>매우높음</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>

        {/* Important Notice */}
        <Card className="p-6 bg-amber-50 border-amber-200">
          <h3 className="font-semibold mb-2 text-amber-900">중요 안내사항</h3>
          <ul className="space-y-1 text-sm text-amber-800">
            <li>• 본 검사는 선별 도구로, 정확한 진단은 전문가 상담이 필요합니다</li>
            <li>• ADHD는 다양한 유형이 복합적으로 나타날 수 있습니다</li>
            <li>• 증상이 심각하거나 일상생활에 지장이 있다면 전문가와 상담하세요</li>
            <li>• 각 유형에 맞는 맞춤 치료가 가장 효과적입니다</li>
          </ul>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-3xl mx-auto">
          {onRestart && (
            <Button
              size="lg"
              variant="outline"
              onClick={onRestart}
              className="flex items-center gap-2 flex-1"
            >
              <RefreshCw className="w-4 h-4" />
              다시 검사하기
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            onClick={handleDownload}
            className="flex items-center gap-2 flex-1"
          >
            <Download className="w-4 h-4" />
            결과 다운로드
          </Button>
          <Button
            size="lg"
            onClick={() => navigate('/expert-counseling')}
            className="flex-1"
          >
            전문 상담 연결
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onBack || (() => navigate('/'))}
            className="flex items-center gap-2 flex-1"
          >
            <Home className="w-4 h-4" />
            {onBack ? '뒤로가기' : '홈으로'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAdhdResult;
