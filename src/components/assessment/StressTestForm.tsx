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
    text: "지난 한 달 동안, 예상치 못한 일들 때문에 얼마나 자주 스트레스를 받았나요?",
    options: [
      { value: "0", label: "전혀 없음" },
      { value: "1", label: "거의 없음" },
      { value: "2", label: "가끔" },
      { value: "3", label: "꽤 자주" },
      { value: "4", label: "매우 자주" }
    ]
  },
  {
    id: "stress2", 
    text: "지난 한 달 동안, 중요한 일들을 통제할 수 없다고 느낀 적이 얼마나 자주 있었나요?",
    options: [
      { value: "0", label: "전혀 없음" },
      { value: "1", label: "거의 없음" },
      { value: "2", label: "가끔" },
      { value: "3", label: "꽤 자주" },
      { value: "4", label: "매우 자주" }
    ]
  },
  {
    id: "stress3",
    text: "지난 한 달 동안, 신경질적이고 스트레스를 받는다고 느낀 적이 얼마나 자주 있었나요?",
    options: [
      { value: "0", label: "전혀 없음" },
      { value: "1", label: "거의 없음" },
      { value: "2", label: "가끔" },
      { value: "3", label: "꽤 자주" },
      { value: "4", label: "매우 자주" }
    ]
  },
  {
    id: "stress4",
    text: "지난 한 달 동안, 개인적인 문제들을 성공적으로 다룰 수 있다고 느낀 적이 얼마나 자주 있었나요?",
    options: [
      { value: "4", label: "전혀 없음" },
      { value: "3", label: "거의 없음" },
      { value: "2", label: "가끔" },
      { value: "1", label: "꽤 자주" },
      { value: "0", label: "매우 자주" }
    ]
  },
  {
    id: "stress5",
    text: "지난 한 달 동안, 삶이 내 뜻대로 되어간다고 느낀 적이 얼마나 자주 있었나요?",
    options: [
      { value: "4", label: "전혀 없음" },
      { value: "3", label: "거의 없음" },
      { value: "2", label: "가끔" },
      { value: "1", label: "꽤 자주" },
      { value: "0", label: "매우 자주" }
    ]
  },
  {
    id: "stress6",
    text: "지난 한 달 동안, 해야 할 일들을 따라잡을 수 없다고 느낀 적이 얼마나 자주 있었나요?",
    options: [
      { value: "0", label: "전혀 없음" },
      { value: "1", label: "거의 없음" },
      { value: "2", label: "가끔" },
      { value: "3", label: "꽤 자주" },
      { value: "4", label: "매우 자주" }
    ]
  },
  {
    id: "stress7",
    text: "지난 한 달 동안, 성가신 일들을 통제할 수 있다고 느낀 적이 얼마나 자주 있었나요?",
    options: [
      { value: "4", label: "전혀 없음" },
      { value: "3", label: "거의 없음" },
      { value: "2", label: "가끔" },
      { value: "1", label: "꽤 자주" },
      { value: "0", label: "매우 자주" }
    ]
  },
  {
    id: "stress8",
    text: "지난 한 달 동안, 모든 일이 잘 되어간다고 느낀 적이 얼마나 자주 있었나요?",
    options: [
      { value: "4", label: "전혀 없음" },
      { value: "3", label: "거의 없음" },
      { value: "2", label: "가끔" },
      { value: "1", label: "꽤 자주" },
      { value: "0", label: "매우 자주" }
    ]
  },
  {
    id: "stress9",
    text: "지난 한 달 동안, 통제할 수 없는 일들 때문에 화가 난 적이 얼마나 자주 있었나요?",
    options: [
      { value: "0", label: "전혀 없음" },
      { value: "1", label: "거의 없음" },
      { value: "2", label: "가끔" },
      { value: "3", label: "꽤 자주" },
      { value: "4", label: "매우 자주" }
    ]
  },
  {
    id: "stress10",
    text: "지난 한 달 동안, 어려움들이 쌓여서 극복할 수 없다고 느낀 적이 얼마나 자주 있었나요?",
    options: [
      { value: "0", label: "전혀 없음" },
      { value: "1", label: "거의 없음" },
      { value: "2", label: "가끔" },
      { value: "3", label: "꽤 자주" },
      { value: "4", label: "매우 자주" }
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
      if (total <= 13) {
        severity = "낮은 스트레스";
      } else if (total <= 26) {
        severity = "보통 스트레스";
      } else {
        severity = "높은 스트레스";
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
            <CardTitle className="text-xl">마음압박지수 측정</CardTitle>
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