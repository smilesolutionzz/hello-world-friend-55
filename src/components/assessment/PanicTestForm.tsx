import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";

interface PanicTestFormProps {
  onComplete: (results: {answers: number[], total: number, average: number, severity: string}) => void;
  onBack: () => void;
}

const panicQuestions = [
  "갑작스러운 심장 두근거림이나 심장이 빨리 뛰는 증상이 있습니까?",
  "땀이 나거나 몸이 떨리는 증상이 있습니까?",
  "숨이 막히거나 질식할 것 같은 느낌이 있습니까?",
  "가슴이 답답하거나 아픈 증상이 있습니까?",
  "메스꺼움이나 복부 불편감이 있습니까?",
  "어지럽거나 불안정한 느낌, 또는 기절할 것 같은 느낌이 있습니까?",
  "춥거나 뜨거운 느낌이 있습니까?",
  "손발이 저리거나 무감각한 느낌이 있습니까?",
  "자신이 분리된 것 같거나 비현실적인 느낌이 있습니까?",
  "통제력을 잃거나 미칠 것 같은 두려움이 있습니까?",
  "죽을 것 같은 두려움이 있습니까?",
  "이러한 증상들이 갑작스럽게 나타납니까?",
  "증상이 최고조에 달하는 데 몇 분 정도 걸립니까?",
  "이런 증상 때문에 일상생활에 지장이 있습니까?",
  "특정 장소나 상황을 피하게 됩니까?",
  "또 다시 이런 증상이 올까봐 걱정이 됩니까?",
  "이런 증상이 한 달에 몇 번 이상 반복됩니까?",
  "증상이 나타나면 즉시 그 자리를 벗어나고 싶어집니까?",
  "다른 사람들이 이런 증상을 알아챌까봐 걱정됩니까?",
  "이런 증상 때문에 전문가의 도움을 받고 싶다고 생각합니까?",
  "증상이 나타날 때 현실감을 잃는 느낌이 있습니까?"
];

const PanicTestForm = ({ onComplete, onBack }: PanicTestFormProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(21).fill(-1)); // 기본값 없음

  const progress = ((currentQuestion + 1) / panicQuestions.length) * 100;

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
    if (currentQuestion < panicQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 테스트 완료
      const total = answers.reduce((sum, answer) => sum + answer, 0);
      const average = Math.round((total / answers.length) * 10) / 10;
      
      let severity = "";
      if (total <= 14) {
        severity = "정상";
      } else if (total <= 28) {
        severity = "경미";
      } else if (total <= 42) {
        severity = "중등도";
      } else {
        severity = "심각";
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
  const canProceed = currentAnswer >= 1;

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
            {currentQuestion + 1} / {panicQuestions.length}
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
            {panicQuestions[currentQuestion]}
          </h2>

          <RadioGroup 
            value={currentAnswer >= 1 ? currentAnswer.toString() : ""} 
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
            {currentQuestion === panicQuestions.length - 1 ? '결과 보기' : '다음'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PanicTestForm;