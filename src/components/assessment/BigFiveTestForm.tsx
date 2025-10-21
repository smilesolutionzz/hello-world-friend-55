import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

const questions = [
  // 외향성 (Extraversion)
  { id: "e1", text: "파티에서 많은 사람들과 어울리는 것을 좋아한다", factor: "extraversion", reverse: false },
  { id: "e2", text: "조용한 환경을 선호한다", factor: "extraversion", reverse: true },
  { id: "e3", text: "활기차고 에너지가 넘친다", factor: "extraversion", reverse: false },
  { id: "e4", text: "말을 많이 하지 않는다", factor: "extraversion", reverse: true },
  
  // 친화성 (Agreeableness) 
  { id: "a1", text: "다른 사람들을 신뢰한다", factor: "agreeableness", reverse: false },
  { id: "a2", text: "다른 사람들의 결점을 찾는 경향이 있다", factor: "agreeableness", reverse: true },
  { id: "a3", text: "관대하고 이해심이 많다", factor: "agreeableness", reverse: false },
  { id: "a4", text: "논쟁을 좋아한다", factor: "agreeableness", reverse: true },
  
  // 성실성 (Conscientiousness)
  { id: "c1", text: "일을 철저히 한다", factor: "conscientiousness", reverse: false },
  { id: "c2", text: "게으른 경향이 있다", factor: "conscientiousness", reverse: true },
  { id: "c3", text: "효율적으로 일을 처리한다", factor: "conscientiousness", reverse: false },
  { id: "c4", text: "일을 미루는 편이다", factor: "conscientiousness", reverse: true },
  
  // 신경성 (Neuroticism)
  { id: "n1", text: "걱정을 많이 한다", factor: "neuroticism", reverse: false },
  { id: "n2", text: "감정적으로 안정되어 있다", factor: "neuroticism", reverse: true },
  { id: "n3", text: "스트레스를 잘 받는다", factor: "neuroticism", reverse: false },
  { id: "n4", text: "침착하고 차분하다", factor: "neuroticism", reverse: true },
  
  // 개방성 (Openness)
  { id: "o1", text: "새로운 경험을 추구한다", factor: "openness", reverse: false },
  { id: "o2", text: "예술적 경험에 관심이 적다", factor: "openness", reverse: true },
  { id: "o3", text: "상상력이 풍부하다", factor: "openness", reverse: false },
  { id: "o4", text: "전통적인 방식을 선호한다", factor: "openness", reverse: true }
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
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    handleNext();
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      analyzeResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const analyzeResults = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const scores = {
        extraversion: 0,
        agreeableness: 0,
        conscientiousness: 0,
        neuroticism: 0,
        openness: 0
      };
      
      // 각 요인별 점수 계산
      questions.forEach(question => {
        const answer = parseInt(answers[question.id] || "0");
        const score = question.reverse ? 6 - answer : answer;
        scores[question.factor as keyof typeof scores] += score;
      });
      
      // 각 요인당 4문항이므로 4로 나누어 평균 계산
      Object.keys(scores).forEach(key => {
        scores[key as keyof typeof scores] = scores[key as keyof typeof scores] / 4;
      });
      
      const answerValues = Object.fromEntries(
        Object.entries(answers).map(([key, value]) => [key, parseInt(value)])
      );
      
      const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
      const average = total / 5;
      
      onComplete({
        answers: answerValues,
        scores,
        total,
        average
      });
      
      setIsAnalyzing(false);
    }, 2000);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const isAnswered = answers[currentQ.id] !== undefined;

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <h3 className="font-semibold text-lg">성격 분석 중...</h3>
                <p className="text-muted-foreground">빅파이브 성격 요인을 분석하고 있습니다</p>
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
              돌아가기
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1} / {questions.length}
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">빅파이브 성격검사</CardTitle>
            <p className="text-sm text-muted-foreground">
              각 문항에 대해 자신과 얼마나 일치하는지 선택해주세요
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
                {[
                  { value: "1", label: "전혀 그렇지 않다" },
                  { value: "2", label: "그렇지 않다" },
                  { value: "3", label: "보통이다" },
                  { value: "4", label: "그렇다" },
                  { value: "5", label: "매우 그렇다" }
                ].map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-start pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                이전
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}