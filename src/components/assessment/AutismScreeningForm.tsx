import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { developmentalScreeningQuestions } from "@/data/assessmentQuestions";
import TokenGate from "@/components/TokenGate";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { useTokens } from "@/hooks/useTokens";

interface DevelopmentalScreeningFormProps {
  ageGroup: 'child' | 'adult';
  onComplete: (results: {answers: number[], total: number, average: number, ageGroup: string, concernLevel: string, strengthAreas: string[], challengeAreas: string[]}) => void;
  onBack: () => void;
}

const DevelopmentalScreeningForm = ({ ageGroup, onComplete, onBack }: DevelopmentalScreeningFormProps) => {
  const questions = ageGroup === 'child' ? developmentalScreeningQuestions.child : developmentalScreeningQuestions.adult;
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
    const success = await consumeTokens(TOKEN_COSTS.DEVELOPMENTAL_SCREENING);
    if (success) {
      setHasStarted(true);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // AIH 발달특성 선별체크 결과 분석
      const total = answers.reduce((sum, answer) => sum + answer, 0);
      const average = Math.round((total / answers.length) * 10) / 10;
      
      // 발달특성 수준 평가 (창작형 기준)
      let concernLevel = "";
      let strengthAreas: string[] = [];
      let challengeAreas: string[] = [];
      
      if (ageGroup === 'child') {
        // 아동용 평가 기준
        if (total <= 3) {
          concernLevel = "일반적 발달";
          strengthAreas = ["사회적 상호작용", "환경 적응"];
        } else if (total <= 6) {
          concernLevel = "관찰 권장";
          strengthAreas.push("창의적 사고");
          challengeAreas.push("사회적 상호작용 지원");
        } else if (total <= 9) {
          concernLevel = "지원 필요";
          challengeAreas.push("사회성 개발", "환경 적응");
        } else {
          concernLevel = "전문가 상담 권장";
          challengeAreas.push("전반적 발달 지원", "개별화 교육");
        }
      } else {
        // 성인용 평가 기준
        if (total <= 2) {
          concernLevel = "일반적 특성";
          strengthAreas = ["사회적 적응", "유연한 사고"];
        } else if (total <= 4) {
          concernLevel = "개인적 특성";
          strengthAreas.push("체계적 사고");
          challengeAreas.push("사회적 기술 향상");
        } else if (total <= 7) {
          concernLevel = "지원 고려";
          challengeAreas.push("사회적 상황 적응", "감각 조절");
        } else {
          concernLevel = "전문 상담 권장";
          challengeAreas.push("포괄적 지원", "개인별 전략");
        }
      }

      // 영역별 세부 분석
      const socialScore = answers.slice(0, 4).reduce((a, b) => a + b, 0);
      const adaptabilityScore = answers.slice(4, 8).reduce((a, b) => a + b, 0);
      const sensoryScore = answers.slice(8).reduce((a, b) => a + b, 0);

      if (socialScore >= 3) challengeAreas.push("사회적 의사소통");
      if (adaptabilityScore >= 3) challengeAreas.push("환경 적응성");
      if (sensoryScore >= 2) challengeAreas.push("감각 처리");

      if (socialScore <= 1) strengthAreas.push("사회적 소통");
      if (adaptabilityScore <= 1) strengthAreas.push("적응 능력");
      if (sensoryScore <= 1) strengthAreas.push("감각 통합");

      onComplete({
        answers,
        total,
        average,
        ageGroup: ageGroup === 'child' ? '아동청소년' : '성인',
        concernLevel,
        strengthAreas,
        challengeAreas
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
        tokensRequired={TOKEN_COSTS.DEVELOPMENTAL_SCREENING}
        featureName="AIH 발달특성 선별체크"
        onProceed={handleStartTest}
      >
        <div className="space-y-4 text-center">
          <div className="text-lg font-semibold">AIH 발달특성 선별체크 특징</div>
          <ul className="space-y-2 text-sm text-muted-foreground max-w-md mx-auto">
            <li>• {ageGroup === 'child' ? '아동청소년용' : '성인용'} 맞춤 문항</li>
            <li>• 총 {questions.length}문항, 약 5분 소요</li>
            <li>• 사회적 특성 및 개인적 강점 분석</li>
            <li>• 발달센터 연계 정보 제공</li>
            <li>• 개별 맞춤 지원 방향 제시</li>
            <li>• AIH 독자 개발 선별도구</li>
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

export default DevelopmentalScreeningForm;