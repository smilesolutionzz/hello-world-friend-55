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
  ageGroup?: 'child' | 'adolescent' | 'adult';
  onComplete: (results: {answers: number[], total: number, average: number, severity: string, ageGroup: string}) => void;
  onBack: () => void;
}

// 아동용 우울검사 질문 (7-12세)
const childDepressionQuestions = [
  "나는 슬프지 않다",
  "나는 앞으로 좋은 일이 생길 거라고 생각한다",
  "나는 실패한 것 같은 느낌이 들지 않는다",
  "나는 예전처럼 놀이나 활동이 재미있다",
  "나는 내가 나쁜 아이라고 생각하지 않는다",
  "나는 혼날 것 같은 느낌이 들지 않는다",
  "나는 나 자신이 싫지 않다",
  "나는 나쁜 일이 일어나면 내 탓이라고 생각하지 않는다",
  "나는 평소보다 더 울지 않는다",
  "나는 평소보다 더 걱정하지 않는다",
  "나는 친구들과 노는 것이 좋다",
  "나는 결정을 잘 내릴 수 있다",
  "나는 내 외모가 괜찮다고 생각한다",
  "나는 숙제나 공부를 할 수 있다",
  "나는 잠을 잘 잔다",
  "나는 평소처럼 힘이 있다",
  "나는 밥을 잘 먹는다",
  "나는 아프지 않다",
  "나는 외롭지 않다",
  "나는 학교 가는 것이 싫지 않다",
  "나는 가족들과 지내는 것이 좋다"
];

// 청소년용 우울검사 질문 (13-18세)
const adolescentDepressionQuestions = [
  "나는 슬프지 않다",
  "나는 앞날에 대해 낙담하거나 실망하지 않는다",
  "나는 실패자라는 느낌이 들지 않는다",
  "나는 예전과 똑같이 일상생활에서 만족과 기쁨을 느낀다",
  "나는 특별히 죄책감을 느끼지 않는다",
  "나는 벌을 받고 있다는 느낌이 들지 않는다",
  "나는 나 자신에 대해 실망하거나 혐오감을 느끼지 않는다",
  "나는 일상적인 일들에 대해 평소보다 나 자신을 더 탓하지 않는다",
  "나는 자해에 대한 생각이 없다",
  "나는 평소보다 더 울지 않는다",
  "나는 평소보다 더 초조하거나 불안하지 않다",
  "나는 친구들에 대한 관심을 잃지 않았다",
  "나는 평소만큼 쉽게 결정을 내린다",
  "나는 내 외모에 대해 걱정하지 않는다",
  "나는 예전처럼 학업이나 활동을 할 수 있다",
  "나는 평소처럼 잠을 잘 잔다",
  "나는 평소보다 더 피곤하지 않다",
  "나는 평소와 다름없이 식욕이 좋다",
  "나는 최근에 체중이 별로 줄지 않았다",
  "나는 평소보다 내 건강을 더 염려하지 않는다",
  "나는 취미활동에 대한 관심이 평소와 다르지 않다"
];

// 성인용 우울검사 질문 (19세 이상)
const adultDepressionQuestions = [
  "나는 슬프지 않다",
  "나는 앞날에 대해 낙담하거나 실망하지 않는다",
  "나는 실패자라는 느낌이 들지 않는다",
  "나는 예전과 똑같이 일상생활에서 만족과 기쁨을 느낀다",
  "나는 특별히 죄책감을 느끼지 않는다",
  "나는 벌을 받고 있다는 느낌이 들지 않는다",
  "나는 나 자신에 대해 실망하거나 혐오감을 느끼지 않는다",
  "나는 일상적인 일들에 대해 평소보다 나 자신을 더 탓하지 않는다",
  "나는 자해에 대한 생각이 없다",
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
  "나는 일상 활동에 대한 흥미가 평소와 다르지 않다"
];

const getQuestionsByAgeGroup = (ageGroup: 'child' | 'adolescent' | 'adult') => {
  switch (ageGroup) {
    case 'child':
      return childDepressionQuestions;
    case 'adolescent':
      return adolescentDepressionQuestions;
    case 'adult':
    default:
      return adultDepressionQuestions;
  }
};

const getAgeGroupLabel = (ageGroup: 'child' | 'adolescent' | 'adult') => {
  switch (ageGroup) {
    case 'child':
      return '아동 (7-12세)';
    case 'adolescent':
      return '청소년 (13-18세)';
    case 'adult':
    default:
      return '성인 (19세 이상)';
  }
};

const DepressionTestForm = ({ ageGroup = 'adult', onComplete, onBack }: DepressionTestFormProps) => {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'child' | 'adolescent' | 'adult' | null>(ageGroup !== 'adult' ? ageGroup : null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const { consumeTokens } = useTokens();

  const questions = selectedAgeGroup ? getQuestionsByAgeGroup(selectedAgeGroup) : [];
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const handleAgeGroupSelect = (group: 'child' | 'adolescent' | 'adult') => {
    setSelectedAgeGroup(group);
    setAnswers(new Array(getQuestionsByAgeGroup(group).length).fill(""));
  };

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    
    // 자동으로 다음 문항으로 이동
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      // 마지막 문항인 경우 결과 계산
      setTimeout(() => {
        calculateResults(newAnswers);
      }, 300);
    }
  };

  const calculateResults = (finalAnswers: string[]) => {
    // 모든 답변을 숫자로 변환하고 역전시킴 (질문이 부정형이므로)
    const numericAnswers = finalAnswers.map(a => {
      const parsed = parseInt(a);
      if (isNaN(parsed)) return 0;
      // 3점(그렇다) -> 0점(정상), 2점(보통) -> 1점, 1점(그렇지 않다) -> 2점(우울함)으로 역전
      return 3 - parsed;
    });
    
    // 총점 계산 (0-42점 범위)
    const total = numericAnswers.reduce((sum, answer) => sum + answer, 0);
    const average = total > 0 
      ? Math.round((total / questions.length) * 10) / 10 
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
      severity,
      ageGroup: getAgeGroupLabel(selectedAgeGroup!)
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults(answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const currentAnswer = answers[currentQuestion] || "";
  const canProceed = currentAnswer !== "";

  const handleStartTest = async () => {
    const success = await consumeTokens(TOKEN_COSTS.DEPRESSION_TEST);
    if (success) {
      setHasStarted(true);
    }
  };

  // 연령대 선택 화면
  if (!selectedAgeGroup) {
    return (
      <Card className="max-w-2xl mx-auto p-8">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">연령대를 선택해주세요</h2>
            <p className="text-muted-foreground">연령에 맞는 검사 문항이 제공됩니다</p>
          </div>
          
          <div className="grid gap-4">
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start text-left hover:bg-primary/5 hover:border-primary"
              onClick={() => handleAgeGroupSelect('child')}
            >
              <span className="text-lg font-semibold">아동 (7-12세)</span>
              <span className="text-sm text-muted-foreground">초등학생 대상 문항</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start text-left hover:bg-primary/5 hover:border-primary"
              onClick={() => handleAgeGroupSelect('adolescent')}
            >
              <span className="text-lg font-semibold">청소년 (13-18세)</span>
              <span className="text-sm text-muted-foreground">중고등학생 대상 문항</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start text-left hover:bg-primary/5 hover:border-primary"
              onClick={() => handleAgeGroupSelect('adult')}
            >
              <span className="text-lg font-semibold">성인 (19세 이상)</span>
              <span className="text-sm text-muted-foreground">성인 대상 문항</span>
            </Button>
          </div>
          
          <Button variant="ghost" onClick={onBack} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>
        </div>
      </Card>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6 flex items-center justify-center">
        <TokenGate
          tokensRequired={TOKEN_COSTS.DEPRESSION_TEST}
          featureName={`우울증 자가체크 - ${getAgeGroupLabel(selectedAgeGroup)} (21문항)`}
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
          <div className="text-right">
            <span className="text-xs text-muted-foreground block">{getAgeGroupLabel(selectedAgeGroup)}</span>
            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1} / {questions.length}
            </span>
          </div>
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
            {questions[currentQuestion]}
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
        <div className="flex justify-between items-center pt-6">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            이전
          </Button>
          <span className="text-sm text-muted-foreground">
            답변 선택 시 자동으로 넘어갑니다
          </span>
        </div>
      </div>
    </Card>
  );
};

export default DepressionTestForm;