import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { advancedAdhdQuestions } from "@/data/advancedAdhdTypes";
import TokenGate from "@/components/TokenGate";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { useTokens } from "@/hooks/useTokens";

interface AdvancedAdhdFormProps {
  onComplete: (results: any) => void;
  onBack: () => void;
}

const AdvancedAdhdForm = ({ onComplete, onBack }: AdvancedAdhdFormProps) => {
  const questions = advancedAdhdQuestions;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [hasStarted, setHasStarted] = useState(false);
  const { consumeTokens } = useTokens();

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = parseInt(value);
    setAnswers(newAnswers);
    
    setTimeout(() => {
      handleNext();
    }, 500);
  };

  const handleStartTest = async () => {
    const success = await consumeTokens(TOKEN_COSTS.FOCUS_CHECK);
    if (success) {
      setHasStarted(true);
    }
  };

  const calculateTypeScores = () => {
    const typeScores: Record<string, number> = {
      classic: 0,
      inattentive: 0,
      overfocused: 0,
      temporal: 0,
      limbic: 0,
      ringOfFire: 0,
      anxious: 0,
      cyclothymic: 0,
      prefrontal: 0,
      hyperfocus: 0,
      sensory: 0,
      postTraumatic: 0
    };

    answers.forEach((answer, index) => {
      if (answer >= 0) {
        const question = questions[index];
        question.targetTypes.forEach(type => {
          typeScores[type] += answer * question.weight;
        });
      }
    });

    // 정규화 (0-54 범위로)
    const maxPossibleScore = questions.length * 3; // 각 질문 최대 3점
    Object.keys(typeScores).forEach(type => {
      typeScores[type] = Math.round((typeScores[type] / maxPossibleScore) * 54);
    });

    return typeScores;
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const typeScores = calculateTypeScores();
      
      onComplete({
        answers,
        typeScores,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const currentAnswer = answers[currentQuestion];
  const canProceed = currentAnswer !== -1;

  if (!hasStarted) {
    return (
      <TokenGate
        tokensRequired={TOKEN_COSTS.FOCUS_CHECK}
        featureName="AIH 고급 ADHD 유형 분석"
        onProceed={handleStartTest}
      >
        <div className="space-y-4 text-center">
          <div className="text-lg font-semibold">12가지 ADHD 유형 분석의 특징</div>
          <ul className="space-y-2 text-sm text-muted-foreground max-w-md mx-auto">
            <li>• 총 {questions.length}문항, 약 5분 소요</li>
            <li>• 12가지 세부 ADHD 유형 분석</li>
            <li>• 각 유형별 맞춤 치료 방향 제시</li>
            <li>• 정확한 증상 프로파일 파악</li>
            <li>• 유형별 심각도 수준 평가</li>
          </ul>
        </div>
      </TokenGate>
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
            {currentQuestion + 1} / {questions.length}
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
            {questions[currentQuestion].text}
          </h2>

          <RadioGroup 
            value={currentAnswer >= 0 ? currentAnswer.toString() : ""} 
            onValueChange={handleAnswer}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="option0" />
              <Label htmlFor="option0" className="text-base cursor-pointer">
                전혀 그렇지 않다 (0점)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="option1" />
              <Label htmlFor="option1" className="text-base cursor-pointer">
                가끔 그렇다 (1점)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="option2" />
              <Label htmlFor="option2" className="text-base cursor-pointer">
                자주 그렇다 (2점)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="option3" />
              <Label htmlFor="option3" className="text-base cursor-pointer">
                매우 자주 그렇다 (3점)
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
          {currentQuestion === questions.length - 1 && canProceed && (
            <Button onClick={handleNext}>
              결과 보기
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AdvancedAdhdForm;
