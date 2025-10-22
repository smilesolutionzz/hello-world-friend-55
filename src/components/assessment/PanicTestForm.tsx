import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Brain } from "lucide-react";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { useTokens } from "@/hooks/useTokens";
import TokenGate from "@/components/TokenGate";

interface PanicTestFormProps {
  onComplete: (results: {answers: number[], total: number, average: number, severity: string}) => void;
  onBack: () => void;
}

const panicQuestions = [
  { text: "갑작스러운 심장 두근거림이나 심장이 빨리 뛰는 증상이 있습니까?", type: "severity" },
  { text: "땀이 나거나 몸이 떨리는 증상이 있습니까?", type: "severity" },
  { text: "숨이 막히거나 질식할 것 같은 느낌이 있습니까?", type: "severity" },
  { text: "가슴이 답답하거나 아픈 증상이 있습니까?", type: "severity" },
  { text: "메스꺼움이나 복부 불편감이 있습니까?", type: "severity" },
  { text: "어지럽거나 불안정한 느낌, 또는 기절할 것 같은 느낌이 있습니까?", type: "severity" },
  { text: "춥거나 뜨거운 느낌이 있습니까?", type: "severity" },
  { text: "손발이 저리거나 무감각한 느낌이 있습니까?", type: "severity" },
  { text: "자신이 분리된 것 같거나 비현실적인 느낌이 있습니까?", type: "severity" },
  { text: "통제력을 잃거나 미칠 것 같은 두려움이 있습니까?", type: "severity" },
  { text: "죽을 것 같은 두려움이 있습니까?", type: "severity" },
  { text: "이러한 증상들이 갑작스럽게 나타납니까?", type: "severity" },
  { text: "증상이 최고조에 달하는 데 몇 분 정도 걸립니까?", type: "severity" },
  { text: "이런 증상 때문에 일상생활에 지장이 있습니까?", type: "frequency" },
  { text: "특정 장소나 상황을 피하게 됩니까?", type: "severity" },
  { text: "또 다시 이런 증상이 올까봐 걱정이 됩니까?", type: "severity" },
  { text: "이런 증상이 한 달에 몇 번 이상 반복됩니까?", type: "frequency" },
  { text: "증상이 나타나면 즉시 그 자리를 벗어나고 싶어집니까?", type: "severity" },
  { text: "다른 사람들이 이런 증상을 알아챌까봐 걱정됩니까?", type: "severity" },
  { text: "이런 증상 때문에 전문가의 도움을 받고 싶다고 생각합니까?", type: "severity" },
  { text: "증상이 나타날 때 현실감을 잃는 느낌이 있습니까?", type: "severity" }
];

const PanicTestForm = ({ onComplete, onBack }: PanicTestFormProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(21).fill("")); // 빈 문자열로 초기화
  const [hasStarted, setHasStarted] = useState(false);
  const { consumeTokens } = useTokens();

  const progress = ((currentQuestion + 1) / panicQuestions.length) * 100;

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    handleNext();
  };

  const handleNext = () => {
    if (currentQuestion < panicQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 문자열 답변을 숫자로 변환
      const numericAnswers = answers.map(a => {
        const parsed = parseInt(a);
        return isNaN(parsed) ? 0 : parsed;
      });
      
      const total = numericAnswers.reduce((sum, answer) => sum + answer, 0);
      const average = Math.round((total / numericAnswers.length) * 10) / 10;
      
      let severity = "";
      if (total <= 15) {
        severity = "정상";
      } else if (total <= 30) {
        severity = "경미";
      } else if (total <= 45) {
        severity = "중등도";
      } else {
        severity = "심각";
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
  const canProceed = currentAnswer !== "";

  const handleStartTest = async () => {
    const success = await consumeTokens(TOKEN_COSTS.PANIC_TEST);
    if (success) {
      setHasStarted(true);
    }
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8 flex items-center justify-center">
        <TokenGate
          tokensRequired={TOKEN_COSTS.PANIC_TEST}
          featureName="불안장애 자가체크 (21문항)"
          onProceed={handleStartTest}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold">불안 검사</h1>
          </div>
          <p className="text-muted-foreground mb-4">
            불안 증상과 수준을 파악하는 3분 자가진단
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>진행률</span>
              <span>{currentQuestion + 1} / {panicQuestions.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            {/* Back Button - 상단 우측 */}
            <div className="flex justify-end">
              <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                뒤로가기
              </Button>
            </div>

            {/* Question */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-center">
            {panicQuestions[currentQuestion].text}
          </h2>

          <RadioGroup 
            value={currentAnswer} 
            onValueChange={handleAnswer}
            className="space-y-4"
          >
            {panicQuestions[currentQuestion].type === "frequency" ? (
              <>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="option1" />
                  <Label htmlFor="option1" className="text-base cursor-pointer">
                    전혀 없음 (1점)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="option2" />
                  <Label htmlFor="option2" className="text-base cursor-pointer">
                    주 1-2회 (2점)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="option3" />
                  <Label htmlFor="option3" className="text-base cursor-pointer">
                    주 3회 이상 (3점)
                  </Label>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
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
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
          >
            {currentQuestion === panicQuestions.length - 1 ? '결과 보기' : '다음'}
          </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PanicTestForm;