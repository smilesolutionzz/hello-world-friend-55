import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SocialDevelopmentTestFormProps {
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
  "아이가 또래와 함께 놀이하는 것을 선호하나요?",
  "아이가 다른 사람의 감정을 이해하고 공감하나요?",
  "아이가 친구들과 갈등이 생겼을 때 적절히 해결하나요?",
  "아이가 자신의 의견을 또래에게 적절히 표현하나요?",
  "아이가 집단 활동에 적극적으로 참여하나요?",
  "아이가 규칙이나 약속을 잘 지키나요?",
  "아이가 다른 사람과 물건을 나누어 사용할 수 있나요?",
  "아이가 새로운 친구를 사귀는 데 어려움이 없나요?",
  "아이가 어른과의 대화에서 예의를 지키나요?",
  "아이가 도움이 필요할 때 적절히 요청할 수 있나요?",
  "아이가 다른 사람의 입장을 고려하여 행동하나요?",
  "아이가 협력이 필요한 활동을 잘 해내나요?",
  "아이가 사회적 상황에서 적절한 행동을 보이나요?",
  "아이가 감정을 적절히 표현하고 조절하나요?",
  "아이가 리더십을 발휘하거나 따르는 역할을 할 수 있나요?",
  "아이가 타인의 권리와 경계를 존중하나요?",
  "아이가 사과하거나 용서하는 것을 할 수 있나요?",
  "아이가 다양한 사회적 상황에 적응하나요?",
  "아이가 또래들 사이에서 인기가 있거나 잘 어울리나요?",
  "아이가 사회적 단서(표정, 몸짓 등)를 잘 읽고 반응하나요?"
];

const SocialDevelopmentTestForm = ({ onComplete, onBack }: SocialDevelopmentTestFormProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(0));

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = parseInt(value);
    setAnswers(newAnswers);
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

  const handleComplete = () => {
    const total = answers.reduce((sum, answer) => sum + answer, 0);
    const average = total / answers.length;
    
    let severity = "우수";
    if (total <= 20) severity = "관심필요";
    else if (total <= 40) severity = "보통";
    else if (total <= 60) severity = "양호";

    onComplete({
      answers,
      total,
      average,
      ageGroup: "아동청소년",
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
            value={answers[currentQuestion]?.toString() || ""}
            onValueChange={handleAnswerChange}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="option0" />
              <Label htmlFor="option0">전혀 그렇지 않다</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="option1" />
              <Label htmlFor="option1">거의 그렇지 않다</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="option2" />
              <Label htmlFor="option2">가끔 그렇다</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="option3" />
              <Label htmlFor="option3">자주 그렇다</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4" id="option4" />
              <Label htmlFor="option4">매우 그렇다</Label>
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
            
            <Button
              onClick={handleNext}
              disabled={answers[currentQuestion] === 0 && answers[currentQuestion] !== 0}
              className="bg-primary hover:bg-primary/90"
            >
              {currentQuestion === questions.length - 1 ? "완료" : "다음"}
              {currentQuestion < questions.length - 1 && (
                <ChevronRight className="w-4 h-4 ml-2" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialDevelopmentTestForm;