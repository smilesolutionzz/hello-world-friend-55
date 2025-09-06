import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

const questions = [
  {
    id: "stress1",
    text: "갑작스럽게 생긴 일들로 인해 마음이 어수선해진 적이 얼마나 자주 있나요?",
    options: [
      { value: "0", label: "거의 없었어요" },
      { value: "1", label: "가끔 있었어요" },
      { value: "2", label: "종종 있었어요" },
      { value: "3", label: "자주 있었어요" },
      { value: "4", label: "매일같이 있었어요" }
    ]
  },
  {
    id: "stress2", 
    text: "중요한 상황에서 내가 아무것도 할 수 없다는 무력감을 느낀 적이 얼마나 자주 있나요?",
    options: [
      { value: "0", label: "거의 없었어요" },
      { value: "1", label: "가끔 있었어요" },
      { value: "2", label: "종종 있었어요" },
      { value: "3", label: "자주 있었어요" },
      { value: "4", label: "매일같이 있었어요" }
    ]
  },
  {
    id: "stress3",
    text: "작은 일에도 예민하게 반응하거나 짜증이 난 적이 얼마나 자주 있나요?",
    options: [
      { value: "0", label: "거의 없었어요" },
      { value: "1", label: "가끔 있었어요" },
      { value: "2", label: "종종 있었어요" },
      { value: "3", label: "자주 있었어요" },
      { value: "4", label: "매일같이 있었어요" }
    ]
  },
  {
    id: "stress4",
    text: "어려운 문제가 생겨도 '내가 해결할 수 있어'라고 자신감을 느낀 적이 얼마나 자주 있나요?",
    options: [
      { value: "4", label: "거의 없었어요" },
      { value: "3", label: "가끔 있었어요" },
      { value: "2", label: "종종 있었어요" },
      { value: "1", label: "자주 있었어요" },
      { value: "0", label: "매일같이 있었어요" }
    ]
  },
  {
    id: "stress5",
    text: "하루 일과를 마치며 '오늘도 잘 보냈다'는 만족감을 느낀 적이 얼마나 자주 있나요?",
    options: [
      { value: "4", label: "거의 없었어요" },
      { value: "3", label: "가끔 있었어요" },
      { value: "2", label: "종종 있었어요" },
      { value: "1", label: "자주 있었어요" },
      { value: "0", label: "매일같이 있었어요" }
    ]
  },
  {
    id: "stress6",
    text: "해야 할 일들이 산더미처럼 쌓여서 숨이 막힐 것 같다고 느낀 적이 얼마나 자주 있나요?",
    options: [
      { value: "0", label: "거의 없었어요" },
      { value: "1", label: "가끔 있었어요" },
      { value: "2", label: "종종 있었어요" },
      { value: "3", label: "자주 있었어요" },
      { value: "4", label: "매일같이 있었어요" }
    ]
  },
  {
    id: "stress7",
    text: "예상치 못한 문제가 생겨도 '괜찮아, 이것도 해결된다'고 여유를 느낀 적이 얼마나 자주 있나요?",
    options: [
      { value: "4", label: "거의 없었어요" },
      { value: "3", label: "가끔 있었어요" },
      { value: "2", label: "종종 있었어요" },
      { value: "1", label: "자주 있었어요" },
      { value: "0", label: "매일같이 있었어요" }
    ]
  },
  {
    id: "stress8",
    text: "잠자리에 들며 '내일도 좋은 하루가 될 거야'라는 기대감을 느낀 적이 얼마나 자주 있나요?",
    options: [
      { value: "4", label: "거의 없었어요" },
      { value: "3", label: "가끔 있었어요" },
      { value: "2", label: "종종 있었어요" },
      { value: "1", label: "자주 있었어요" },
      { value: "0", label: "매일같이 있었어요" }
    ]
  },
  {
    id: "stress9",
    text: "내 의지와 상관없이 벌어지는 일들로 인해 속이 끓어오른 적이 얼마나 자주 있나요?",
    options: [
      { value: "0", label: "거의 없었어요" },
      { value: "1", label: "가끔 있었어요" },
      { value: "2", label: "종종 있었어요" },
      { value: "3", label: "자주 있었어요" },
      { value: "4", label: "매일같이 있었어요" }
    ]
  },
  {
    id: "stress10",
    text: "문제들이 계속 쌓여서 '이제 정말 한계야'라고 느낀 적이 얼마나 자주 있나요?",
    options: [
      { value: "0", label: "거의 없었어요" },
      { value: "1", label: "가끔 있었어요" },
      { value: "2", label: "종종 있었어요" },
      { value: "3", label: "자주 있었어요" },
      { value: "4", label: "매일같이 있었어요" }
    ]
  },
  {
    id: "stress11",
    text: "주변 사람들과의 관계에서 오해나 갈등으로 마음이 상한 적이 얼마나 자주 있나요?",
    options: [
      { value: "0", label: "거의 없었어요" },
      { value: "1", label: "가끔 있었어요" },
      { value: "2", label: "종종 있었어요" },
      { value: "3", label: "자주 있었어요" },
      { value: "4", label: "매일같이 있었어요" }
    ]
  },
  {
    id: "stress12",
    text: "몸이 피곤하고 지쳐서 일상생활을 하기 힘들다고 느낀 적이 얼마나 자주 있나요?",
    options: [
      { value: "0", label: "거의 없었어요" },
      { value: "1", label: "가끔 있었어요" },
      { value: "2", label: "종종 있었어요" },
      { value: "3", label: "자주 있었어요" },
      { value: "4", label: "매일같이 있었어요" }
    ]
  }
];

interface StressTestFormProps {
  onComplete: (results: {
    answers: number[];
    total: number;
    average: number;
    severity: string;
  }) => void;
  onBack: () => void;
}

export default function StressTestForm({ onComplete, onBack }: StressTestFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // 자동으로 다음 문항으로 이동 (0.5초 지연)
    setTimeout(() => {
      handleNext();
    }, 500);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      analyzeResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const analyzeResults = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const answerValues = Object.values(answers).map(Number);
      const total = answerValues.reduce((sum, value) => sum + value, 0);
      const average = total / answerValues.length;
      
      let severity: string;
      if (total <= 16) {
        severity = "건강한 마음상태";
      } else if (total <= 32) {
        severity = "주의 필요";
      } else {
        severity = "관리 필요";
      }
      
      onComplete({
        answers: answerValues,
        total,
        average,
        severity
      });
      
      setIsAnalyzing(false);
    }, 2000);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const isAnswered = answers[currentQ.id] !== undefined;

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <h3 className="font-semibold text-lg">스트레스 수준 분석 중...</h3>
                <p className="text-muted-foreground">잠시만 기다려주세요</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              돌아가기
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1} / {questions.length}
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">스트레스지수 측정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-4">{currentQ.text}</h3>
              <RadioGroup
                value={answers[currentQ.id] || ""}
                onValueChange={(value) => handleAnswer(currentQ.id, value)}
                className="space-y-3"
              >
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-start pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                이전
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}