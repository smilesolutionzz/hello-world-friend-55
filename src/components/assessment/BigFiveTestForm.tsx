import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/i18n";

// AIHPRO 5대 성격 특성 분석 - 자체 개발 문항 (저작권 안전)
const questionsKo = [
  { id: "e1", text: "사람들과 함께하는 활동에서 에너지를 얻는다", factor: "extraversion", reverse: false },
  { id: "e2", text: "혼자만의 시간을 보내는 것이 더 충전이 된다", factor: "extraversion", reverse: true },
  { id: "e3", text: "새로운 모임에서 먼저 대화를 시작하는 편이다", factor: "extraversion", reverse: false },
  { id: "e4", text: "여러 사람 앞에서 이야기하는 것이 부담스럽다", factor: "extraversion", reverse: true },
  { id: "a1", text: "상대방의 입장에서 생각하려고 노력한다", factor: "agreeableness", reverse: false },
  { id: "a2", text: "상대방의 실수를 지적하는 것이 자연스럽다", factor: "agreeableness", reverse: true },
  { id: "a3", text: "갈등 상황에서 양보하는 편이다", factor: "agreeableness", reverse: false },
  { id: "a4", text: "내 의견을 관철시키는 것이 중요하다", factor: "agreeableness", reverse: true },
  { id: "c1", text: "계획을 세우고 체계적으로 실행한다", factor: "conscientiousness", reverse: false },
  { id: "c2", text: "즉흥적으로 행동하는 경우가 잦다", factor: "conscientiousness", reverse: true },
  { id: "c3", text: "마감 기한을 철저히 지킨다", factor: "conscientiousness", reverse: false },
  { id: "c4", text: "하기 싫은 일은 나중으로 미루게 된다", factor: "conscientiousness", reverse: true },
  { id: "n1", text: "사소한 일에도 마음이 쓰이고 걱정이 된다", factor: "neuroticism", reverse: false },
  { id: "n2", text: "예상치 못한 상황에서도 침착함을 유지한다", factor: "neuroticism", reverse: true },
  { id: "n3", text: "감정의 기복이 큰 편이다", factor: "neuroticism", reverse: false },
  { id: "n4", text: "대부분의 상황에서 평온함을 느낀다", factor: "neuroticism", reverse: true },
  { id: "o1", text: "새로운 아이디어나 관점에 호기심을 느낀다", factor: "openness", reverse: false },
  { id: "o2", text: "익숙한 방식이 가장 편하다", factor: "openness", reverse: true },
  { id: "o3", text: "창의적인 활동에 몰입하는 것을 즐긴다", factor: "openness", reverse: false },
  { id: "o4", text: "실용적이고 검증된 방법을 선호한다", factor: "openness", reverse: true }
];

const questionsEn = [
  { id: "e1", text: "I gain energy from activities with people", factor: "extraversion", reverse: false },
  { id: "e2", text: "Spending time alone recharges me more", factor: "extraversion", reverse: true },
  { id: "e3", text: "I tend to start conversations first at new gatherings", factor: "extraversion", reverse: false },
  { id: "e4", text: "Speaking in front of many people feels burdensome", factor: "extraversion", reverse: true },
  { id: "a1", text: "I try to see things from the other person's perspective", factor: "agreeableness", reverse: false },
  { id: "a2", text: "Pointing out others' mistakes comes naturally to me", factor: "agreeableness", reverse: true },
  { id: "a3", text: "I tend to compromise in conflict situations", factor: "agreeableness", reverse: false },
  { id: "a4", text: "Getting my point across is important to me", factor: "agreeableness", reverse: true },
  { id: "c1", text: "I make plans and execute them systematically", factor: "conscientiousness", reverse: false },
  { id: "c2", text: "I often act on impulse", factor: "conscientiousness", reverse: true },
  { id: "c3", text: "I strictly keep deadlines", factor: "conscientiousness", reverse: false },
  { id: "c4", text: "I tend to put off things I don't want to do", factor: "conscientiousness", reverse: true },
  { id: "n1", text: "Even small things weigh on my mind and worry me", factor: "neuroticism", reverse: false },
  { id: "n2", text: "I stay calm even in unexpected situations", factor: "neuroticism", reverse: true },
  { id: "n3", text: "My mood tends to fluctuate significantly", factor: "neuroticism", reverse: false },
  { id: "n4", text: "I feel peaceful in most situations", factor: "neuroticism", reverse: true },
  { id: "o1", text: "I feel curious about new ideas and perspectives", factor: "openness", reverse: false },
  { id: "o2", text: "Familiar ways feel most comfortable", factor: "openness", reverse: true },
  { id: "o3", text: "I enjoy immersing myself in creative activities", factor: "openness", reverse: false },
  { id: "o4", text: "I prefer practical and proven methods", factor: "openness", reverse: true }
];

const optionsKo = [
  { value: "1", label: "전혀 그렇지 않다" },
  { value: "2", label: "그렇지 않다" },
  { value: "3", label: "보통이다" },
  { value: "4", label: "그렇다" },
  { value: "5", label: "매우 그렇다" }
];

const optionsEn = [
  { value: "1", label: "Strongly disagree" },
  { value: "2", label: "Disagree" },
  { value: "3", label: "Neutral" },
  { value: "4", label: "Agree" },
  { value: "5", label: "Strongly agree" }
];

interface BigFiveTestFormProps {
  onComplete: (results: {
    answers: Record<string, number>;
    scores: Record<string, number>;
    total: number;
    average: number;
  }) => void;
  onBack: () => void;
}

export default function BigFiveTestForm({ onComplete, onBack }: BigFiveTestFormProps) {
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
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        analyzeResultsWithAnswers(newAnswers);
      }
    }, 300);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      analyzeResultsWithAnswers(answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const analyzeResultsWithAnswers = (finalAnswers: Record<string, string>) => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const scores = { extraversion: 0, agreeableness: 0, conscientiousness: 0, neuroticism: 0, openness: 0 };
      
      questions.forEach(question => {
        const answer = parseInt(finalAnswers[question.id] || "0");
        const score = question.reverse ? 6 - answer : answer;
        scores[question.factor as keyof typeof scores] += score;
      });
      
      Object.keys(scores).forEach(key => {
        scores[key as keyof typeof scores] = scores[key as keyof typeof scores] / 4;
      });
      
      const answerValues = Object.fromEntries(
        Object.entries(finalAnswers).map(([key, value]) => [key, parseInt(value)])
      );
      
      const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
      const average = total / 5;
      
      onComplete({ answers: answerValues, scores, total, average });
      setIsAnalyzing(false);
    }, 2000);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  if (!currentQ) return null;

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <h3 className="font-semibold text-lg">{isEnglish ? "Analyzing personality..." : "성격 분석 중..."}</h3>
                <p className="text-muted-foreground">{isEnglish ? "Analyzing your Big Five personality factors" : "빅파이브 성격 요인을 분석하고 있습니다"}</p>
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
            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1} / {questions.length}
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{isEnglish ? "Big Five Personality Test" : "빅파이브 성격검사"}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {isEnglish ? "Select how well each statement describes you" : "각 문항에 대해 자신과 얼마나 일치하는지 선택해주세요"}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-4">{currentQ.text}</h3>
              <RadioGroup
                value={answers[currentQ.id] || ""}
                onValueChange={(value) => handleAnswer(currentQ.id, value)}
                className="space-y-3"
              >
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`bigfive-q${currentQuestion}-opt${index}`} />
                    <Label htmlFor={`bigfive-q${currentQuestion}-opt${index}`} className="cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-start pt-4">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                {isEnglish ? "Previous" : "이전"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
