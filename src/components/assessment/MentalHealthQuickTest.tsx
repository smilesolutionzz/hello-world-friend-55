import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, Shield, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { TOKEN_COSTS } from '@/constants/tokenCosts';
import { useTokens } from '@/hooks/useTokens';

const questions = [
  {
    id: 'worry_frequency',
    question: '걱정이나 불안한 생각이 얼마나 자주 드나요?',
    options: [
      { value: 'never', label: '전혀 없음' },
      { value: 'rarely', label: '거의 없음 (월 1-2회)' },
      { value: 'sometimes', label: '가끔 있음 (주 1-2회)' },
      { value: 'often', label: '자주 있음 (거의 매일)' },
      { value: 'always', label: '항상 있음 (하루 종일)' }
    ]
  },
  {
    id: 'worry_control',
    question: '걱정이나 불안을 조절하기 어려워하나요?',
    options: [
      { value: 'very_easy', label: '매우 쉽게 조절됨' },
      { value: 'easy', label: '대체로 조절 가능' },
      { value: 'moderate', label: '보통 정도' },
      { value: 'difficult', label: '조절하기 어려움' },
      { value: 'impossible', label: '전혀 조절 안됨' }
    ]
  },
  {
    id: 'physical_symptoms',
    question: '불안할 때 몸에 어떤 증상이 나타나나요?',
    options: [
      { value: 'none', label: '특별한 증상 없음' },
      { value: 'mild', label: '가벼운 긴장감' },
      { value: 'moderate', label: '심장 두근거림, 손떨림' },
      { value: 'severe', label: '숨쉬기 어려움, 어지러움' },
      { value: 'panic', label: '심한 공황 증상' }
    ]
  },
  {
    id: 'sleep_disturbance',
    question: '불안 때문에 잠들기 어렵거나 자주 깨나요?',
    options: [
      { value: 'never', label: '전혀 그렇지 않음' },
      { value: 'rarely', label: '거의 그렇지 않음' },
      { value: 'sometimes', label: '가끔 그럼' },
      { value: 'often', label: '자주 그럼' },
      { value: 'always', label: '매일 그럼' }
    ]
  },
  {
    id: 'daily_interference',
    question: '불안감이 일상생활(일, 학업, 관계)에 얼마나 방해가 되나요?',
    options: [
      { value: 'none', label: '전혀 방해 안됨' },
      { value: 'minimal', label: '거의 방해 안됨' },
      { value: 'moderate', label: '어느 정도 방해됨' },
      { value: 'significant', label: '많이 방해됨' },
      { value: 'severe', label: '심각하게 방해됨' }
    ]
  },
  {
    id: 'avoidance_behavior',
    question: '불안하거나 무서운 상황을 피하려고 하나요?',
    options: [
      { value: 'never', label: '전혀 피하지 않음' },
      { value: 'rarely', label: '거의 피하지 않음' },
      { value: 'sometimes', label: '가끔 피함' },
      { value: 'often', label: '자주 피함' },
      { value: 'always', label: '항상 피함' }
    ]
  },
  {
    id: 'concentration_problems',
    question: '불안 때문에 집중하기 어려우신가요?',
    options: [
      { value: 'never', label: '전혀 어렵지 않음' },
      { value: 'rarely', label: '거의 어렵지 않음' },
      { value: 'sometimes', label: '가끔 어려움' },
      { value: 'often', label: '자주 어려움' },
      { value: 'always', label: '항상 어려움' }
    ]
  },
  {
    id: 'future_worries',
    question: '미래에 대한 걱정이나 나쁜 일이 일어날 것 같은 생각을 자주 하나요?',
    options: [
      { value: 'never', label: '전혀 하지 않음' },
      { value: 'rarely', label: '거의 하지 않음' },
      { value: 'sometimes', label: '가끔 함' },
      { value: 'often', label: '자주 함' },
      { value: 'always', label: '항상 함' }
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
    
    // 자동으로 다음 문항으로 이동 (0.5초 지연)
    setTimeout(() => {
      handleNext();
    }, 500);
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

      // 점수 계산 (불안 수준 - 높을수록 불안함)
      const scoreMap = {
        never: 1, rarely: 2, sometimes: 3, often: 4, always: 5,
        very_easy: 1, easy: 2, moderate: 3, difficult: 4, impossible: 5,
        none: 1, minimal: 2, mild: 2, significant: 4, severe: 5, panic: 5
      };

      let totalScore = 0;
      Object.values(answers).forEach(answer => {
        totalScore += scoreMap[answer as keyof typeof scoreMap] || 3;
      });

      const averageScore = totalScore / questions.length;
      let level = 'low';
      let levelText = '정상 범위';
      
      if (averageScore >= 4.0) {
        level = 'severe';
        levelText = '심각한 수준';
      } else if (averageScore >= 3.0) {
        level = 'moderate';
        levelText = '중등도 수준';
      } else if (averageScore >= 2.0) {
        level = 'mild';
        levelText = '경미한 수준';
      } else {
        level = 'low';
        levelText = '정상 범위';
      }

      const result = {
        totalScore,
        averageScore,
        level,
        levelText,
        answers,
        testType: 'anxiety_quick_check',
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
          <p className="text-lg font-medium">불안감 수준을 분석하고 있습니다...</p>
          <p className="text-sm text-muted-foreground mt-2">
            AI가 당신의 불안감 수준을 정확하게 분석합니다.
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
          <Shield className="h-5 w-5 mr-2 text-blue-500" />
          불안감 3분 체크
        </CardTitle>
        <CardDescription className="text-center">
          8가지 간단한 질문으로 현재 불안 수준을 확인해보세요
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