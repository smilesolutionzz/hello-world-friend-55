import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { useTokens } from "@/hooks/useTokens";
import TokenGate from "@/components/TokenGate";

interface DepressionTestFormProps {
  onComplete: (results: {answers: number[], total: number, average: number, severity: string}) => void;
  onBack: () => void;
}

const depressionQuestions = [
  "나는 슬프지 않다",
  "나는 앞날에 대해 낙담하거나 실망하지 않는다",
  "나는 실패자라는 느낌이 들지 않는다",
  "나는 예전과 똑같이 일상생활에서 만족과 기쁨을 느낀다",
  "나는 특별히 죄책감을 느끼지 않는다",
  "나는 벌을 받고 있다는 느낌이 들지 않는다",
  "나는 나 자신에 대해 실망하거나 혐오감을 느끼지 않는다",
  "나는 일상적인 일들에 대해 평소보다 나 자신을 더 탓하지 않는다",
  "나는 자살할 생각이 없다",
  "나는 평소보다 더 울지 않는다",
  "나는 평소보다 더 초조하거나 불안하지 않다",
  "나는 다른 사람들에 대한 관심을 잃지 않았다",
  "나는 평소만큼 쉽게 결정을 내린다",
  "나는 내가 예전보다 더 못생겨 보인다고 걱정하지 않는다",
  "나는 예전처럼 일을 할 수 있다",
  "나는 평소처럼 잠을 잘 잔다",
  "나는 평소보다 더 피곤하지 않다",
  "나는 평소와 다름없이 식욕이 좋다",
  "나는 최근에 체중이 별로 줄지 않았다",
  "나는 평소보다 내 건강을 더 염려하지 않는다",
  "나는 성(sex)에 대한 관심이 평소와 별로 다르지 않다"
];

const DepressionTestForm = ({ onComplete, onBack }: DepressionTestFormProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(21).fill("")); // 빈 문자열로 초기화
  const [hasStarted, setHasStarted] = useState(false);
  const { consumeTokens } = useTokens();

  const progress = ((currentQuestion + 1) / depressionQuestions.length) * 100;

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
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
      // 테스트 완료 - 모든 답변을 숫자로 변환하고 유효성 검사
      const numericAnswers = answers.map(a => {
        const parsed = parseInt(a);
        return isNaN(parsed) ? 0 : parsed;
      });
      
      // 유효한 답변만 계산에 포함
      const validAnswers = numericAnswers.filter(a => a > 0);
      const total = validAnswers.reduce((sum, answer) => sum + answer, 0);
      const average = validAnswers.length > 0 
        ? Math.round((total / validAnswers.length) * 10) / 10 
        : 0;
      
      let severity = "";
      if (total <= 13) {
        severity = "정상";
      } else if (total <= 19) {
        severity = "가벼운 우울";
      } else if (total <= 28) {
        severity = "중등도 우울";
      } else {
        severity = "심한 우울";
      }
      
      onComplete({
        answers: numericAnswers,
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
  const canProceed = currentAnswer !== ""; // 빈 문자열이 아니어야 함

  const handleStartTest = async () => {
    const success = await consumeTokens(TOKEN_COSTS.DEPRESSION_TEST);
    if (success) {
      setHasStarted(true);
    }
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6 flex items-center justify-center">
        <TokenGate
          tokensRequired={TOKEN_COSTS.DEPRESSION_TEST}
          featureName="우울증 자가체크 (AHI-MOOD 21문항)"
          onProceed={handleStartTest}
        />
      </div>
    );
  }

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
            value={currentAnswer} 
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
        <div className="flex justify-start pt-6">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            이전
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DepressionTestForm;