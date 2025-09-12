import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Brain, ArrowLeft, Loader2 } from 'lucide-react';

interface SimplePersonalityFormProps {
  onComplete: (result: any) => void;
  onBack: () => void;
}

const SimplePersonalityForm = ({ onComplete, onBack }: SimplePersonalityFormProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const questions = [
    {
      id: 1,
      text: "새로운 사람들과 만나는 것을 어떻게 생각하시나요?",
      options: [
        { value: "E", label: "흥미롭고 에너지가 생긴다" },
        { value: "I", label: "부담스럽고 피곤하다" }
      ]
    },
    {
      id: 2,
      text: "문제를 해결할 때 주로 어떤 방식을 선호하시나요?",
      options: [
        { value: "S", label: "경험과 사실을 바탕으로 한다" },
        { value: "N", label: "직감과 가능성을 고려한다" }
      ]
    },
    {
      id: 3,
      text: "결정을 내릴 때 무엇을 더 중요시하시나요?",
      options: [
        { value: "T", label: "논리적이고 객관적인 분석" },
        { value: "F", label: "사람들의 감정과 가치관" }
      ]
    },
    {
      id: 4,
      text: "일을 진행하는 방식은 어떤 것을 선호하시나요?",
      options: [
        { value: "J", label: "계획을 세우고 체계적으로" },
        { value: "P", label: "융통성 있게 상황에 맞춰서" }
      ]
    },
    {
      id: 5,
      text: "주말에 휴식을 취하는 방법은?",
      options: [
        { value: "E", label: "친구들과 함께 활동적으로" },
        { value: "I", label: "혼자서 조용히 취미생활" }
      ]
    },
    {
      id: 6,
      text: "새로운 정보를 받아들일 때",
      options: [
        { value: "S", label: "구체적이고 실용적인 것을 선호한다" },
        { value: "N", label: "개념적이고 이론적인 것을 선호한다" }
      ]
    },
    {
      id: 7,
      text: "갈등 상황에서 나의 모습은",
      options: [
        { value: "T", label: "공정하고 논리적으로 접근한다" },
        { value: "F", label: "조화롭고 배려하며 접근한다" }
      ]
    },
    {
      id: 8,
      text: "여행 계획을 세울 때",
      options: [
        { value: "J", label: "미리 상세하게 계획을 세운다" },
        { value: "P", label: "대략적으로 정하고 즉흥적으로 한다" }
      ]
    },
    {
      id: 9,
      text: "회의나 모임에서 나는",
      options: [
        { value: "E", label: "적극적으로 발언하고 참여한다" },
        { value: "I", label: "신중하게 듣고 필요할 때만 말한다" }
      ]
    },
    {
      id: 10,
      text: "학습할 때 어떤 방식을 선호하나요?",
      options: [
        { value: "S", label: "단계별로 순서대로 배우는 것" },
        { value: "N", label: "전체적인 그림을 먼저 이해하는 것" }
      ]
    },
    {
      id: 11,
      text: "의견을 표현할 때",
      options: [
        { value: "T", label: "사실과 근거를 중심으로" },
        { value: "F", label: "상대방의 기분을 고려하며" }
      ]
    },
    {
      id: 12,
      text: "프로젝트를 할 때",
      options: [
        { value: "J", label: "마감일 전에 미리 완료한다" },
        { value: "P", label: "마감일에 맞춰 완료한다" }
      ]
    }
  ];

  const handleAnswerChange = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
    
    setTimeout(() => {
      handleNext();
    }, 500);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      analyzePersonality();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const analyzePersonality = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
      
      Object.values(answers).forEach(answer => {
        if (counts.hasOwnProperty(answer)) {
          counts[answer as keyof typeof counts]++;
        }
      });

      const personalityType = 
        (counts.E > counts.I ? 'E' : 'I') +
        (counts.S > counts.N ? 'S' : 'N') +
        (counts.T > counts.F ? 'T' : 'F') +
        (counts.J > counts.P ? 'J' : 'P');

      const results = {
        type: personalityType,
        counts,
        answers
      };

      onComplete(results);
      setIsAnalyzing(false);
    }, 2000);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-500/10 to-blue-500/20 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <h3 className="font-semibold text-lg">성격 유형 분석 중...</h3>
                <p className="text-muted-foreground">잠시만 기다려주세요</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-500/10 to-blue-500/20 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              돌아가기
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1} / {questions.length}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-6 h-6 text-purple-500" />
            <h1 className="text-2xl font-bold">간단 성격유형 테스트</h1>
          </div>
          <p className="text-muted-foreground mb-4">
            4가지 차원으로 나의 성격 유형을 파악해보세요
          </p>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {currentQ.text}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={answers[currentQuestion] || ""}
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={option.value} id={`option-${index}`} />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                이전
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { SimplePersonalityForm };