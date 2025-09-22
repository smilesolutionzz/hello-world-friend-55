import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Brain, Share2, RotateCcw, AlertTriangle, CheckCircle, Info, Heart, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTestResultActions } from '@/hooks/useTestResultActions';

interface StressTestResultProps {
  result: {
    answers: number[];
    total: number;
    average: number;
    severity: string;
  };
  onRestart?: () => void;
}

const StressTestResult = ({ result, onRestart }: StressTestResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { generatePDFReport, isGeneratingPDF } = useTestResultActions();

  const handleShare = async () => {
    const shareText = `스트레스 자가진단 결과\n총점: ${result.total}점\n상태: ${result.severity}\n\n나도 테스트해보기!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '스트레스 자가진단 결과',
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        console.log('공유 취소됨');
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "결과가 복사되었습니다",
        description: "클립보드에 결과를 복사했습니다!",
      });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-blue-500/10">
              <Brain className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold">스트레스 자가진단 결과</h1>
          </div>
        </div>

        <Card className={`border-2 ${stressInfo.bgColor} max-w-2xl mx-auto`}>
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
          <CardContent className="space-y-6">
            <div className={`p-4 rounded-lg ${stressInfo.bgColor}`}>
              <p className={`text-sm ${stressInfo.color} mb-3`}>
                {stressInfo.description}
              </p>
              <p className={`text-xs ${stressInfo.color} font-medium`}>
                💡 전문가 조언: {stressInfo.advice}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => generatePDFReport({
                  testType: 'stress',
                  results: {
                    ...result,
                    ageGroup: '성인'
                  },
                  analysis: `스트레스 수준: ${stressInfo.level}`,
                  testInfo: {
                    testName: '스트레스 지수 측정',
                    date: new Date().toLocaleDateString('ko-KR')
                  }
                })}
                disabled={isGeneratingPDF}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
              >
                <FileDown className="w-4 h-4 mr-2" />
                {isGeneratingPDF ? 'PDF 생성 중...' : 'PDF 다운로드'}
              </Button>
              <Button 
                onClick={handleShare}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Share2 className="w-4 h-4 mr-2" />
                결과 공유하기
              </Button>
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
      </div>
    </div>
  );
};

export default StressTestResult;