import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { autismScreeningQuestions } from "@/data/assessmentQuestions";
import TokenGate from "@/components/TokenGate";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { useTokens } from "@/hooks/useTokens";

interface AutismScreeningFormProps {
  ageGroup: 'child' | 'adult';
  onComplete: (results: {answers: number[], total: number, average: number, ageGroup: string, riskLevel: string, concernAreas: string[]}) => void;
  onBack: () => void;
}

const AutismScreeningForm = ({ ageGroup, onComplete, onBack }: AutismScreeningFormProps) => {
  const questions = ageGroup === 'child' ? autismScreeningQuestions.child : autismScreeningQuestions.adult;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(0));
  const [hasStarted, setHasStarted] = useState(false);
  const { consumeTokens } = useTokens();

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = parseInt(value);
    setAnswers(newAnswers);
  };

  const handleStartTest = async () => {
    const success = await consumeTokens(TOKEN_COSTS.AUTISM_SCREENING);
    if (success) {
      setHasStarted(true);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 테스트 완료 및 결과 분석
      const total = answers.reduce((sum, answer) => sum + answer, 0);
      const average = Math.round((total / answers.length) * 10) / 10;
      
      // 위험도 수준 평가
      let riskLevel = "";
      let concernAreas: string[] = [];
      
      if (ageGroup === 'child') {
        // 아동용 평가 기준 (M-CHAT-R 기반)
        if (total <= 2) {
          riskLevel = "낮은 위험도";
        } else if (total <= 7) {
          riskLevel = "중간 위험도";
          concernAreas.push("추가 관찰 필요");
        } else {
          riskLevel = "높은 위험도";
          concernAreas.push("전문가 상담 권장");
        }
      } else {
        // 성인용 평가 기준 (AQ-10 기반)
        if (total <= 3) {
          riskLevel = "낮은 위험도";
        } else if (total <= 6) {
          riskLevel = "중간 위험도";
          concernAreas.push("자세한 평가 고려");
        } else {
          riskLevel = "높은 위험도";
          concernAreas.push("전문가 진단 권장");
        }
      }

      // 영역별 분석
      const socialCommunicationScore = answers.slice(0, Math.floor(questions.length / 3)).reduce((a, b) => a + b, 0);
      const repetitiveBehaviorScore = answers.slice(Math.floor(questions.length / 3), Math.floor(questions.length * 2 / 3)).reduce((a, b) => a + b, 0);
      const sensoryScore = answers.slice(Math.floor(questions.length * 2 / 3)).reduce((a, b) => a + b, 0);

      if (socialCommunicationScore >= 3) concernAreas.push("사회적 의사소통");
      if (repetitiveBehaviorScore >= 3) concernAreas.push("제한적 반복행동");
      if (sensoryScore >= 3) concernAreas.push("감각처리");

      onComplete({
        answers,
        total,
        average,
        ageGroup: ageGroup === 'child' ? '아동청소년' : '성인',
        riskLevel,
        concernAreas
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const currentAnswer = answers[currentQuestion];
  const canProceed = currentAnswer >= 0;

  // 토큰 게이트 표시
  if (!hasStarted) {
    return (
      <TokenGate
        tokensRequired={TOKEN_COSTS.AUTISM_SCREENING}
        featureName="자폐스펙트럼 선별검사"
        onProceed={handleStartTest}
      >
        <div className="space-y-4 text-center">
          <div className="text-lg font-semibold">자폐스펙트럼 선별검사 특징</div>
          <ul className="space-y-2 text-sm text-muted-foreground max-w-md mx-auto">
            <li>• {ageGroup === 'child' ? 'M-CHAT-R 기반 아동용' : 'AQ-10 기반 성인용'} 검사</li>
            <li>• 총 {questions.length}문항, 약 5분 소요</li>
            <li>• 사회적 의사소통 및 반복행동 평가</li>
            <li>• 발달센터 연계 정보 제공</li>
            <li>• 조기 발견을 위한 선별 도구</li>
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

          {questions[currentQuestion].description && (
            <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto">
              {questions[currentQuestion].description}
            </p>
          )}

          <RadioGroup 
            value={currentAnswer.toString()} 
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
                그렇다 (1점)
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

export default AutismScreeningForm;