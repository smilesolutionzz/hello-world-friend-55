import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/i18n";

const questionsKo = [
  { id: "selfesteem1", text: "우리 아이는 다른 아이들처럼 가치 있는 아이라고 생각하는 것 같다", reverse: false },
  { id: "selfesteem2", text: "우리 아이는 좋은 장점들을 많이 가지고 있다", reverse: false },
  { id: "selfesteem3", text: "우리 아이는 자신을 실패자라고 생각하는 경향이 있다", reverse: true },
  { id: "selfesteem4", text: "우리 아이는 다른 아이들만큼 일을 잘 할 수 있다", reverse: false },
  { id: "selfesteem5", text: "우리 아이는 자랑할 것이 별로 없다고 느끼는 것 같다", reverse: true },
  { id: "selfesteem6", text: "우리 아이는 자신에 대해 긍정적인 태도를 가지고 있다", reverse: false },
  { id: "selfesteem7", text: "우리 아이는 자기 자신에게 만족하는 것 같다", reverse: false },
  { id: "selfesteem8", text: "우리 아이는 자신을 좀 더 존중했으면 하는 것 같다", reverse: true },
  { id: "selfesteem9", text: "우리 아이는 때때로 자신이 쓸모없다고 느끼는 것 같다", reverse: true },
  { id: "selfesteem10", text: "우리 아이는 때때로 자신이 좋지 않은 아이라고 생각하는 것 같다", reverse: true },
  { id: "selfesteem11", text: "우리 아이는 자신의 능력을 믿고 있다", reverse: false },
  { id: "selfesteem12", text: "우리 아이는 자신만의 독특한 매력이 있다", reverse: false },
  { id: "selfesteem13", text: "우리 아이는 다른 사람들이 자신을 어떻게 생각하는지 자주 걱정한다", reverse: true },
  { id: "selfesteem14", text: "우리 아이는 어려운 상황에서도 자신을 믿는다", reverse: false },
  { id: "selfesteem15", text: "우리 아이는 자신의 결정에 대해 확신을 가지고 있다", reverse: false }
];

const questionsEn = [
  { id: "selfesteem1", text: "My child seems to feel they are as valuable as other children", reverse: false },
  { id: "selfesteem2", text: "My child has many good qualities", reverse: false },
  { id: "selfesteem3", text: "My child tends to think of themselves as a failure", reverse: true },
  { id: "selfesteem4", text: "My child can do things as well as other children", reverse: false },
  { id: "selfesteem5", text: "My child seems to feel they don't have much to be proud of", reverse: true },
  { id: "selfesteem6", text: "My child has a positive attitude about themselves", reverse: false },
  { id: "selfesteem7", text: "My child seems satisfied with themselves", reverse: false },
  { id: "selfesteem8", text: "My child seems to wish they respected themselves more", reverse: true },
  { id: "selfesteem9", text: "My child sometimes feels useless", reverse: true },
  { id: "selfesteem10", text: "My child sometimes thinks they're not a good kid", reverse: true },
  { id: "selfesteem11", text: "My child believes in their abilities", reverse: false },
  { id: "selfesteem12", text: "My child has their own unique charm", reverse: false },
  { id: "selfesteem13", text: "My child often worries about what others think of them", reverse: true },
  { id: "selfesteem14", text: "My child believes in themselves even in difficult situations", reverse: false },
  { id: "selfesteem15", text: "My child is confident about their decisions", reverse: false }
];

const optionsKo = [{ value: "1", label: "전혀 그렇지 않다" },{ value: "2", label: "그렇지 않다" },{ value: "3", label: "보통이다" },{ value: "4", label: "그렇다" },{ value: "5", label: "매우 그렇다" }];
const optionsEn = [{ value: "1", label: "Strongly disagree" },{ value: "2", label: "Disagree" },{ value: "3", label: "Neutral" },{ value: "4", label: "Agree" },{ value: "5", label: "Strongly agree" }];

interface SelfEsteemTestFormProps {
  onComplete: (results: { answers: number[]; total: number; average: number; level: string; }) => void;
  onBack: () => void;
}

export default function SelfEsteemTestForm({ onComplete, onBack }: SelfEsteemTestFormProps) {
  const { isEnglish } = useLanguage();
  const questions = isEnglish ? questionsEn : questionsKo;
  const options = isEnglish ? optionsEn : optionsKo;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) setCurrentQuestion(prev => prev + 1);
      else analyzeResultsWithAnswers(newAnswers);
    }, 300);
  };

  const handlePrevious = () => { if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1); };
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(prev => prev + 1);
    else analyzeResultsWithAnswers(answers);
  };

  const analyzeResultsWithAnswers = (finalAnswers: Record<string, string>) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const scores = questions.map((question) => {
        const rawScore = parseInt(finalAnswers[question.id]) || 1;
        return question.reverse ? 6 - rawScore : rawScore;
      });
      const total = scores.reduce((sum, score) => sum + score, 0);
      const average = total / scores.length;
      
      let level: string;
      if (average >= 4.5) level = isEnglish ? "Very High" : "매우 높음";
      else if (average >= 3.5) level = isEnglish ? "High" : "높음";
      else if (average >= 2.5) level = isEnglish ? "Average" : "보통";
      else if (average >= 1.5) level = isEnglish ? "Low" : "낮음";
      else level = isEnglish ? "Very Low" : "매우 낮음";
      
      onComplete({ answers: scores, total, average, level });
      setIsAnalyzing(false);
    }, 2000);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  if (!currentQ) return null;
  const isAnswered = answers[currentQ.id] !== undefined;

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <h3 className="font-semibold text-lg">{isEnglish ? "Analyzing child's self-worth..." : "자녀 자아가치 수준 분석 중..."}</h3>
                <p className="text-muted-foreground">{isEnglish ? "Please wait a moment" : "잠시만 기다려주세요"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {isEnglish ? "Back" : "돌아가기"}
            </Button>
            <span className="text-sm text-muted-foreground">{currentQuestion + 1} / {questions.length}</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{isEnglish ? "Child Self-Worth Assessment (Parent Report)" : "자녀 자아가치 검사 (부모용)"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-4">{currentQ.text}</h3>
              <RadioGroup value={answers[currentQ.id] || ""} onValueChange={(value) => handleAnswer(currentQ.id, value)} className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`selfesteem-q${currentQuestion}-opt${index}`} />
                    <Label htmlFor={`selfesteem-q${currentQuestion}-opt${index}`} className="cursor-pointer">{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                {isEnglish ? "Previous" : "이전"}
              </Button>
              <Button onClick={handleNext} disabled={!isAnswered} className="flex items-center gap-2">
                {currentQuestion === questions.length - 1 ? (isEnglish ? "View Results" : "결과 보기") : (isEnglish ? "Next" : "다음")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
