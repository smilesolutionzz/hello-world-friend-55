import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DevelopmentalDelayTestFormProps {
  onComplete: (results: {
    answers: number[];
    total: number;
    average: number;
    ageGroup: string;
    severity: string;
  }) => void;
  onBack: () => void;
}

const questions = [
  "아이가 또래 아이들과 비교해 언어 발달이 늦다고 느끼시나요?",
  "아이가 간단한 지시사항을 이해하고 따르는 데 어려움이 있나요?",
  "아이가 걸음마를 시작한 시기가 늦었다고 생각하시나요?",
  "아이가 눈맞춤을 잘 하지 않거나 피하는 경향이 있나요?",
  "아이가 놀이에 집중하는 시간이 매우 짧나요?",
  "아이가 새로운 환경이나 사람에 대한 적응이 어려운가요?",
  "아이가 또래와의 상호작용에 관심을 보이지 않나요?",
  "아이가 반복적인 행동이나 관심사에 집착하는 경향이 있나요?",
  "아이가 감정 표현이나 조절에 어려움을 보이나요?",
  "아이가 소근육 발달(그리기, 블록 쌓기 등)이 늦다고 느끼시나요?",
  "아이가 대근육 발달(뛰기, 점프 등)이 늦다고 느끼시나요?",
  "아이가 일상생활 기술(식사, 옷 입기 등) 습득이 어려운가요?",
  "아이가 학습 능력이나 기억력에 문제가 있다고 생각하시나요?",
  "아이가 주의 집중에 어려움을 보이나요?",
  "아이가 사회적 상황에서 적절한 반응을 보이지 못하나요?",
  "아이가 변화에 대한 적응력이 떨어지나요?",
  "아이가 문제 해결 능력이 또래에 비해 부족하다고 느끼시나요?",
  "아이가 창의적 놀이나 상상놀이에 관심이 적나요?",
  "아이가 규칙적인 일과나 루틴을 따르는 데 어려움이 있나요?",
  "전반적으로 아이의 발달이 걱정스럽다고 느끼시나요?"
];

const DevelopmentalDelayTestForm = ({ onComplete, onBack }: DevelopmentalDelayTestFormProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const { toast } = useToast();

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = parseInt(value);
    setAnswers(newAnswers);
    
    // 선택 후 자동으로 다음으로 넘어가기
    toast({
      description: "답변이 저장되었습니다",
      duration: 1000,
    });
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        handleComplete(newAnswers);
      }
    }, 500);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleComplete = (finalAnswers = answers) => {
    const total = finalAnswers.reduce((sum, answer) => sum + answer, 0);
    const average = total / finalAnswers.length;
    
    let severity = "정상";
    if (total >= 60) severity = "심각";
    else if (total >= 40) severity = "중등도";
    else if (total >= 20) severity = "경미";

    onComplete({
      answers: finalAnswers,
      total,
      average,
      ageGroup: "아동",
      severity
    });
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          뒤로가기
        </Button>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>질문 {currentQuestion + 1} / {questions.length}</span>
            <span>{Math.round(progress)}% 완료</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {questions[currentQuestion]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion] >= 0 ? answers[currentQuestion].toString() : undefined}
            onValueChange={handleAnswerChange}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="option0" />
              <Label htmlFor="option0" className="cursor-pointer">전혀 그렇지 않다</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="option1" />
              <Label htmlFor="option1" className="cursor-pointer">거의 그렇지 않다</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="option2" />
              <Label htmlFor="option2" className="cursor-pointer">가끔 그렇다</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="option3" />
              <Label htmlFor="option3" className="cursor-pointer">자주 그렇다</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4" id="option4" />
              <Label htmlFor="option4" className="cursor-pointer">매우 그렇다</Label>
            </div>
          </RadioGroup>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              이전
            </Button>
            
            <div className="text-sm text-muted-foreground">
              답변을 선택하면 자동으로 다음으로 넘어갑니다
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevelopmentalDelayTestForm;