import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { childAdhdQuestions, adultAdhdQuestions } from "@/data/assessmentQuestions";

interface AdhdTestFormProps {
  ageGroup: 'child' | 'adult';
  onComplete: (results: {answers: number[], total: number, average: number, ageGroup: string, severity: string}) => void;
  onBack: () => void;
}

const AdhdTestForm = ({ ageGroup, onComplete, onBack }: AdhdTestFormProps) => {
  const questions = ageGroup === 'child' ? childAdhdQuestions : adultAdhdQuestions;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(2)); // 기본값 2점 (보통)

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = parseInt(value);
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 테스트 완료
      const total = answers.reduce((sum, answer) => sum + answer, 0);
      const average = Math.round((total / answers.length) * 10) / 10;
      
      let severity = "";
      if (ageGroup === 'child') {
        if (total <= 18) {
          severity = "정상 범위";
        } else if (total <= 36) {
          severity = "경계선 수준";
        } else if (total <= 54) {
          severity = "중등도 수준";
        } else {
          severity = "심각한 수준";
        }
      } else {
        if (total <= 24) {
          severity = "정상 범위";
        } else if (total <= 42) {
          severity = "경계선 수준";
        } else if (total <= 60) {
          severity = "중등도 수준";
        } else {
          severity = "심각한 수준";
        }
      }
      
      onComplete({
        answers,
        total,
        average,
        ageGroup: ageGroup === 'child' ? '아동청소년' : '성인',
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
            {questions[currentQuestion]}
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
            {currentQuestion === questions.length - 1 ? '결과 보기' : '다음'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AdhdTestForm;