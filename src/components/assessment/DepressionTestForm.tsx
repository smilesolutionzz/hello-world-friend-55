import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";

interface DepressionTestFormProps {
  onComplete: (results: {answers: number[], total: number, average: number, severity: string}) => void;
  onBack: () => void;
}

const depressionQuestions = [
  "슬픔: 나는 슬프지 않다",
  "비관: 나는 앞날에 대해 낙담하거나 실망하지 않는다",
  "과거의 실패: 나는 실패자라는 느낌이 들지 않는다",
  "만족감의 상실: 나는 예전과 똑같이 일상생활에서 만족과 기쁨을 느낀다",
  "죄책감: 나는 특별히 죄책감을 느끼지 않는다",
  "처벌받는다는 느낌: 나는 벌을 받고 있다는 느낌이 들지 않는다",
  "자기혐오: 나는 나 자신에 대해 실망하거나 혐오감을 느끼지 않는다",
  "자기비난: 나는 일상적인 일들에 대해 평소보다 나 자신을 더 탓하지 않는다",
  "자살사고: 나는 자살할 생각이 없다",
  "울음: 나는 평소보다 더 울지 않는다",
  "초조함: 나는 평소보다 더 초조하거나 불안하지 않다",
  "사회적 관심의 상실: 나는 다른 사람들에 대한 관심을 잃지 않았다",
  "우유부단: 나는 평소만큼 쉽게 결정을 내린다",
  "외모에 대한 걱정: 나는 내가 예전보다 더 못생겨 보인다고 걱정하지 않는다",
  "일에 대한 관심상실: 나는 예전처럼 일을 할 수 있다",
  "수면장애: 나는 평소처럼 잠을 잘 잔다",
  "피로감: 나는 평소보다 더 피곤하지 않다",
  "식욕상실: 나는 평소와 다름없이 식욕이 좋다",
  "체중감소: 나는 최근에 체중이 별로 줄지 않았다",
  "건강에 대한 염려: 나는 평소보다 내 건강을 더 염려하지 않는다",
  "성적 관심의 상실: 나는 성(sex)에 대한 관심이 평소와 별로 다르지 않다"
];

const DepressionTestForm = ({ onComplete, onBack }: DepressionTestFormProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(21).fill(2)); // 기본값 2점 (보통)

  const progress = ((currentQuestion + 1) / depressionQuestions.length) * 100;

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = parseInt(value);
    setAnswers(newAnswers);
    
    // 자동으로 다음 문항으로 이동 (0.5초 지연)
    setTimeout(() => {
      handleNext();
    }, 500);
  };

  const handleNext = () => {
    if (currentQuestion < depressionQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 테스트 완료
      const total = answers.reduce((sum, answer) => sum + answer, 0);
      const average = Math.round((total / answers.length) * 10) / 10;
      
      let severity = "";
      if (total <= 30) {
        severity = "정상";
      } else if (total <= 42) {
        severity = "가벼운 우울";
      } else if (total <= 54) {
        severity = "중등도 우울";
      } else {
        severity = "심한 우울";
      }
      
      onComplete({
        answers,
        total,
        average,
        severity
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const currentAnswer = answers[currentQuestion];
  const canProceed = currentAnswer >= 1; // 1점 이상이어야 함

  return (
    <Card className="max-w-4xl mx-auto p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentQuestion + 1} / {depressionQuestions.length}
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-center text-sm text-muted-foreground">
            진행률: {Math.round(progress)}%
          </p>
        </div>

        {/* Question */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-center">
            {depressionQuestions[currentQuestion]}
          </h2>

          <RadioGroup 
            value={currentAnswer.toString()} 
            onValueChange={handleAnswer}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="option1" />
              <Label htmlFor="option1" className="text-base cursor-pointer">
                그렇지 않다 (1점)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="option2" />
              <Label htmlFor="option2" className="text-base cursor-pointer">
                보통이다 (2점)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="option3" />
              <Label htmlFor="option3" className="text-base cursor-pointer">
                그렇다 (3점)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            이전
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!canProceed}
            className="btn-brand"
          >
            {currentQuestion === depressionQuestions.length - 1 ? '결과 보기' : '다음'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DepressionTestForm;