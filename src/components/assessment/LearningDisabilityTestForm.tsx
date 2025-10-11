import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LearningDisabilityTestFormProps {
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
  "아이가 또래에 비해 읽기 능력이 현저히 부족한가요?",
  "아이가 글자를 거꾸로 쓰거나 순서를 바꿔서 쓰는 경우가 자주 있나요?",
  "아이가 단순한 계산 문제도 어려워하나요?",
  "아이가 숫자의 순서나 개념을 이해하는 데 어려움이 있나요?",
  "아이가 지시사항을 듣고 기억하는 데 어려움이 있나요?",
  "아이가 학습한 내용을 금방 잊어버리는 경우가 많나요?",
  "아이가 집중해야 할 때 주의가 쉽게 산만해지나요?",
  "아이가 과제를 끝까지 완성하는 데 어려움이 있나요?",
  "아이가 글쓰기나 받아쓰기에 특별한 어려움을 보이나요?",
  "아이가 시간 개념(어제, 오늘, 내일 등)을 이해하기 어려워하나요?",
  "아이가 공간 지각(위, 아래, 좌, 우 등)에 어려움이 있나요?",
  "아이가 순서나 단계를 기억하고 따르는 데 어려움이 있나요?",
  "아이가 새로운 학습 내용을 받아들이는 속도가 매우 느린가요?",
  "아이가 또래와의 학습 격차가 점점 벌어지고 있나요?",
  "아이가 학습에 대한 의욕이나 자신감이 부족한가요?",
  "아이가 문제 해결을 위한 전략을 스스로 찾지 못하나요?",
  "아이가 언어적 설명을 이해하는 데 어려움이 있나요?",
  "아이가 시각적 정보 처리에 어려움을 보이나요?",
  "아이가 추상적 개념 이해가 어려운가요?",
  "아이가 학습 관련 스트레스나 불안을 자주 보이나요?"
];

const LearningDisabilityTestForm = ({ onComplete, onBack }: LearningDisabilityTestFormProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill("")); // 빈 문자열로 초기화
  const { toast } = useToast();

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    
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

  const handleComplete = (finalAnswers = answers) => {
    // 문자열 답변을 숫자로 변환
    const numericAnswers = finalAnswers.map(a => {
      const parsed = parseInt(a);
      return isNaN(parsed) ? 0 : parsed;
    });
    
    const total = numericAnswers.reduce((sum, answer) => sum + answer, 0);
    const average = total / numericAnswers.length;
    
    let severity = "정상";
    if (total >= 60) severity = "심각";
    else if (total >= 40) severity = "중등도";
    else if (total >= 20) severity = "경미";

    onComplete({
      answers: numericAnswers,
      total,
      average,
      ageGroup: "학령기",
      severity
    });
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
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
            value={answers[currentQuestion]}
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

export default LearningDisabilityTestForm;