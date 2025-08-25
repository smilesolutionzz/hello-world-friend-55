import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const questions = [
  {
    id: 'body_type',
    question: '당신의 체형은 어떤 편인가요?',
    options: [
      { value: 'thin', label: '마른 편', points: { soyang: 2, soeum: 3, taeyang: 1, taeeum: 0 } },
      { value: 'average', label: '보통', points: { soyang: 1, soeum: 1, taeyang: 1, taeeum: 1 } },
      { value: 'sturdy', label: '건장한 편', points: { soyang: 1, soeum: 0, taeyang: 3, taeeum: 2 } },
      { value: 'heavy', label: '뚱뚱한 편', points: { soyang: 0, soeum: 0, taeyang: 1, taeeum: 3 } }
    ]
  },
  {
    id: 'personality',
    question: '당신의 성격은 어떤 편인가요?',
    options: [
      { value: 'active', label: '활발하고 적극적', points: { soyang: 3, soeum: 0, taeyang: 2, taeeum: 1 } },
      { value: 'calm', label: '차분하고 신중', points: { soyang: 0, soeum: 3, taeyang: 1, taeeum: 2 } },
      { value: 'outgoing', label: '외향적이고 사교적', points: { soyang: 2, soeum: 0, taeyang: 3, taeeum: 1 } },
      { value: 'introverted', label: '내성적이고 조용', points: { soyang: 1, soeum: 3, taeyang: 0, taeeum: 2 } }
    ]
  },
  {
    id: 'appetite',
    question: '평소 식욕은 어떤가요?',
    options: [
      { value: 'strong', label: '식욕이 왕성함', points: { soyang: 2, soeum: 0, taeyang: 1, taeeum: 3 } },
      { value: 'normal', label: '보통', points: { soyang: 1, soeum: 1, taeyang: 1, taeeum: 1 } },
      { value: 'weak', label: '식욕이 부족함', points: { soyang: 1, soeum: 3, taeyang: 2, taeeum: 0 } },
      { value: 'irregular', label: '불규칙함', points: { soyang: 2, soeum: 2, taeyang: 1, taeeum: 1 } }
    ]
  },
  {
    id: 'digestion',
    question: '소화는 어떤 편인가요?',
    options: [
      { value: 'good', label: '소화가 잘 됨', points: { soyang: 2, soeum: 1, taeyang: 1, taeeum: 3 } },
      { value: 'normal', label: '보통', points: { soyang: 1, soeum: 1, taeyang: 1, taeeum: 1 } },
      { value: 'poor', label: '소화가 잘 안됨', points: { soyang: 1, soeum: 3, taeyang: 2, taeeum: 0 } },
      { value: 'bloating', label: '자주 더부룩함', points: { soyang: 0, soeum: 2, taeyang: 1, taeeum: 2 } }
    ]
  },
  {
    id: 'cold_heat',
    question: '평소 추위와 더위 중 어느 것을 더 못 견디나요?',
    options: [
      { value: 'cold', label: '추위를 못 견딤', points: { soyang: 0, soeum: 3, taeyang: 1, taeeum: 2 } },
      { value: 'heat', label: '더위를 못 견딤', points: { soyang: 3, soeum: 0, taeyang: 2, taeeum: 1 } },
      { value: 'both', label: '둘 다 견디기 힘듦', points: { soyang: 1, soeum: 1, taeyang: 1, taeeum: 1 } },
      { value: 'neither', label: '둘 다 잘 견딤', points: { soyang: 1, soeum: 1, taeyang: 2, taeeum: 2 } }
    ]
  },
  {
    id: 'sweat',
    question: '땀을 흘리는 정도는?',
    options: [
      { value: 'much', label: '땀을 많이 흘림', points: { soyang: 3, soeum: 0, taeyang: 1, taeeum: 2 } },
      { value: 'normal', label: '보통', points: { soyang: 1, soeum: 1, taeyang: 1, taeeum: 1 } },
      { value: 'little', label: '땀을 적게 흘림', points: { soyang: 0, soeum: 3, taeyang: 2, taeeum: 1 } },
      { value: 'none', label: '거의 땀을 안 흘림', points: { soyang: 0, soeum: 2, taeyang: 3, taeeum: 0 } }
    ]
  },
  {
    id: 'sleep',
    question: '잠자는 패턴은?',
    options: [
      { value: 'deep', label: '깊게 잘 잠', points: { soyang: 1, soeum: 2, taeyang: 2, taeeum: 3 } },
      { value: 'light', label: '얕게 잠', points: { soyang: 2, soeum: 3, taeyang: 1, taeeum: 1 } },
      { value: 'difficulty', label: '잠들기 어려움', points: { soyang: 3, soeum: 2, taeyang: 1, taeeum: 0 } },
      { value: 'irregular', label: '불규칙한 수면', points: { soyang: 2, soeum: 1, taeyang: 1, taeeum: 1 } }
    ]
  },
  {
    id: 'stress_response',
    question: '스트레스를 받을 때 주로 어떤 증상이 나타나나요?',
    options: [
      { value: 'headache', label: '두통이나 어지러움', points: { soyang: 3, soeum: 1, taeyang: 2, taeeum: 0 } },
      { value: 'digestion', label: '소화불량이나 속쓰림', points: { soyang: 2, soeum: 2, taeyang: 1, taeeum: 1 } },
      { value: 'fatigue', label: '피로감이나 무기력', points: { soyang: 0, soeum: 3, taeyang: 1, taeeum: 2 } },
      { value: 'insomnia', label: '불면이나 예민함', points: { soyang: 3, soeum: 2, taeyang: 1, taeeum: 0 } }
    ]
  }
];

interface SasangConstitutionTestProps {
  onComplete: (result: any) => void;
}

export const SasangConstitutionTest: React.FC<SasangConstitutionTestProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

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
      // 체질별 점수 계산
      const scores = { soyang: 0, soeum: 0, taeyang: 0, taeeum: 0 };
      
      questions.forEach(question => {
        const answer = answers[question.id];
        const option = question.options.find(opt => opt.value === answer);
        if (option) {
          scores.soyang += option.points.soyang;
          scores.soeum += option.points.soeum;
          scores.taeyang += option.points.taeyang;
          scores.taeeum += option.points.taeeum;
        }
      });

      // 최고 점수의 체질 결정
      const maxScore = Math.max(...Object.values(scores));
      const constitution = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0];

      const result = {
        constitution,
        scores,
        answers,
        testType: 'sasang_constitution',
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
          <p className="text-lg font-medium">사상체질을 분석하고 있습니다...</p>
          <p className="text-sm text-muted-foreground mt-2">
            AI가 당신의 체질을 정확히 분석하여 맞춤 건강관리법을 제공합니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">사상체질 3분 진단</CardTitle>
        <CardDescription className="text-center">
          간단한 질문으로 당신의 사상체질을 진단합니다
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