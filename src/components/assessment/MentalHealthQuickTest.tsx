import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, Star, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { TOKEN_COSTS } from '@/constants/tokenCosts';
import { useTokens } from '@/hooks/useTokens';

const questions = [
  {
    id: 'stress_level',
    question: '최근 한 달간 스트레스 수준은?',
    options: [
      { value: 'very_low', label: '매우 낮음 (거의 스트레스 없음)' },
      { value: 'low', label: '낮음 (가끔 스트레스 받음)' },
      { value: 'medium', label: '보통 (어느 정도 스트레스 있음)' },
      { value: 'high', label: '높음 (자주 스트레스 받음)' },
      { value: 'very_high', label: '매우 높음 (심각한 스트레스)' }
    ]
  },
  {
    id: 'energy_level',
    question: '평소 에너지 수준은?',
    options: [
      { value: 'very_energetic', label: '매우 활기참 (하루 종일 에너지 넘침)' },
      { value: 'energetic', label: '활기참 (대부분 시간에 활력적)' },
      { value: 'normal', label: '보통 (평균적인 에너지)' },
      { value: 'tired', label: '피곤함 (자주 피로감 느낌)' },
      { value: 'exhausted', label: '매우 피곤함 (항상 지쳐있음)' }
    ]
  },
  {
    id: 'sleep_quality',
    question: '수면의 질은 어떤가요?',
    options: [
      { value: 'excellent', label: '매우 좋음 (깊게 잘 자고 개운함)' },
      { value: 'good', label: '좋음 (대부분 잘 잠)' },
      { value: 'fair', label: '보통 (가끔 못 잠)' },
      { value: 'poor', label: '나쁨 (자주 못 자거나 자주 깸)' },
      { value: 'very_poor', label: '매우 나쁨 (불면이나 심각한 수면장애)' }
    ]
  },
  {
    id: 'mood_state',
    question: '전반적인 기분 상태는?',
    options: [
      { value: 'very_positive', label: '매우 긍정적 (항상 행복하고 밝음)' },
      { value: 'positive', label: '긍정적 (대체로 기분 좋음)' },
      { value: 'neutral', label: '보통 (기복이 있음)' },
      { value: 'negative', label: '부정적 (자주 우울하거나 짜증남)' },
      { value: 'very_negative', label: '매우 부정적 (심각한 우울감)' }
    ]
  },
  {
    id: 'social_connection',
    question: '사회적 관계는 어떤가요?',
    options: [
      { value: 'very_connected', label: '매우 좋음 (친밀한 관계 많음)' },
      { value: 'connected', label: '좋음 (만족스러운 인간관계)' },
      { value: 'moderate', label: '보통 (평범한 수준)' },
      { value: 'isolated', label: '고립감 있음 (관계에서 소외감)' },
      { value: 'very_isolated', label: '매우 고립됨 (심각한 외로움)' }
    ]
  },
  {
    id: 'work_satisfaction',
    question: '일/학업에 대한 만족도는?',
    options: [
      { value: 'very_satisfied', label: '매우 만족 (일/공부가 즐거움)' },
      { value: 'satisfied', label: '만족 (대체로 좋음)' },
      { value: 'neutral', label: '보통 (그럭저럭)' },
      { value: 'dissatisfied', label: '불만족 (스트레스 많음)' },
      { value: 'very_dissatisfied', label: '매우 불만족 (심각한 번아웃)' }
    ]
  },
  {
    id: 'physical_symptoms',
    question: '신체적 증상이 있나요?',
    options: [
      { value: 'none', label: '없음 (건강함)' },
      { value: 'mild', label: '가벼운 증상 (가끔 두통, 피로 등)' },
      { value: 'moderate', label: '보통 증상 (자주 아프거나 불편함)' },
      { value: 'severe', label: '심한 증상 (일상생활에 지장)' },
      { value: 'chronic', label: '만성 증상 (지속적인 건강문제)' }
    ]
  },
  {
    id: 'coping_ability',
    question: '문제 해결 능력은?',
    options: [
      { value: 'excellent', label: '매우 좋음 (문제를 잘 해결함)' },
      { value: 'good', label: '좋음 (대부분 문제 해결 가능)' },
      { value: 'average', label: '보통 (때에 따라 다름)' },
      { value: 'poor', label: '부족함 (문제 해결에 어려움)' },
      { value: 'very_poor', label: '매우 부족함 (문제에 압도됨)' }
    ]
  }
];

interface MentalHealthQuickTestProps {
  onComplete: (result: any) => void;
  onBack?: () => void;
}

export const MentalHealthQuickTest: React.FC<MentalHealthQuickTestProps> = ({ onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const { checkTokenAvailability, consumeTokens } = useTokens();
  const navigate = useNavigate();

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      analyzeResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const analyzeResults = async () => {
    setIsAnalyzing(true);
    try {
      // 토큰 잔액 확인
      const tokenCost = TOKEN_COSTS.HAN_MEDICINE_TEST;
      if (!checkTokenAvailability(tokenCost)) {
        toast({
          title: "토큰 부족",
          description: `통합건강 분석을 위해 ${tokenCost}개의 토큰이 필요합니다.`,
          variant: "destructive"
        });
        setIsAnalyzing(false);
        return;
      }

      // 토큰 차감
      const consumed = await consumeTokens(tokenCost);
      if (!consumed) {
        toast({
          title: "토큰 차감 실패",
          description: "토큰 차감 중 오류가 발생했습니다.",
          variant: "destructive"
        });
        setIsAnalyzing(false);
        return;
      }

      // 점수 계산
      const scoreMap = {
        very_positive: 5, very_energetic: 5, excellent: 5, very_connected: 5, very_satisfied: 5, none: 5,
        positive: 4, energetic: 4, good: 4, connected: 4, satisfied: 4, mild: 4,
        neutral: 3, normal: 3, fair: 3, moderate: 3, average: 3,
        negative: 2, tired: 2, poor: 2, isolated: 2, dissatisfied: 2, severe: 2,
        very_negative: 1, exhausted: 1, very_poor: 1, very_isolated: 1, very_dissatisfied: 1, chronic: 1,
        very_low: 5, low: 4, medium: 3, high: 2, very_high: 1
      };

      let totalScore = 0;
      Object.values(answers).forEach(answer => {
        totalScore += scoreMap[answer as keyof typeof scoreMap] || 3;
      });

      const averageScore = totalScore / questions.length;
      let level = 'good';
      let levelText = '양호';
      
      if (averageScore >= 4.5) {
        level = 'excellent';
        levelText = '매우 좋음';
      } else if (averageScore >= 3.5) {
        level = 'good';
        levelText = '양호';
      } else if (averageScore >= 2.5) {
        level = 'fair';
        levelText = '주의 필요';
      } else {
        level = 'poor';
        levelText = '관리 필요';
      }

      const result = {
        totalScore,
        averageScore,
        level,
        levelText,
        answers,
        testType: 'mental_health_quick',
        completedAt: new Date().toISOString()
      };

      onComplete(result);
    } catch (error) {
      console.error('분석 중 오류:', error);
      toast({
        title: "오류 발생",
        description: "분석 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const currentAnswer = answers[currentQ.id];

  if (isAnalyzing) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-lg font-medium">통합건강 상태를 분석하고 있습니다...</p>
          <p className="text-sm text-muted-foreground mt-2">
            AI가 당신의 통합건강 상태를 종합적으로 분석합니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onBack || (() => navigate('/'))}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center"
          >
            <Home className="h-4 w-4 mr-2" />
            홈으로
          </Button>
        </div>
        <CardTitle className="text-center flex items-center justify-center">
          <Star className="h-5 w-5 mr-2 text-purple-500" />
          통합건강 3분 체크
        </CardTitle>
        <CardDescription className="text-center">
          간단한 질문으로 현재 통합건강 상태를 확인해보세요
        </CardDescription>
        <Progress value={progress} className="mt-4" />
        <p className="text-sm text-center text-muted-foreground">
          {currentQuestion + 1} / {questions.length}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{currentQ.question}</h3>
          
          <RadioGroup
            value={currentAnswer || ''}
            onValueChange={(value) => handleAnswer(currentQ.id, value)}
          >
            {currentQ.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            이전
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={!currentAnswer}
          >
            {currentQuestion === questions.length - 1 ? '결과 보기' : '다음'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};