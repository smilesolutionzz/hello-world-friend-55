import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

const questions = [
  // 실무형 (기술/실용)
  { id: "t1", text: "기계나 도구를 다루는 일에 흥미가 있다", type: "technical" },
  { id: "t2", text: "야외에서 몸을 움직이는 활동을 좋아한다", type: "technical" },
  { id: "t3", text: "손으로 무언가를 만들거나 조립하는 것을 즐긴다", type: "technical" },
  { id: "t4", text: "체력을 사용하는 활동에 관심이 많다", type: "technical" },
  
  // 분석형 (연구/탐구)
  { id: "a1", text: "복잡한 문제를 분석하고 해결하는 것을 즐긴다", type: "analytical" },
  { id: "a2", text: "새로운 지식을 탐구하고 연구하는 일에 관심있다", type: "analytical" },
  { id: "a3", text: "논리적이고 체계적으로 사고하는 것을 좋아한다", type: "analytical" },
  { id: "a4", text: "과학이나 수학 관련 활동에 흥미가 있다", type: "analytical" },
  
  // 창작형 (예술/디자인)
  { id: "c1", text: "창작 활동이나 디자인 작업을 즐긴다", type: "creative" },
  { id: "c2", text: "음악, 미술, 문학 등 예술 분야에 관심있다", type: "creative" },
  { id: "c3", text: "자유롭고 창의적인 표현을 하는 것을 좋아한다", type: "creative" },
  { id: "c4", text: "아름다운 것을 만들어내는 일에 매력을 느낀다", type: "creative" },
  
  // 소통형 (교육/상담)
  { id: "s1", text: "다른 사람을 가르치거나 지도하는 것을 좋아한다", type: "social" },
  { id: "s2", text: "사람들의 고민을 듣고 도와주는 일에 관심있다", type: "social" },
  { id: "s3", text: "팀워크를 중시하며 협력하는 것을 즐긴다", type: "social" },
  { id: "s4", text: "봉사활동이나 사회 기여 활동에 의미를 느낀다", type: "social" },
  
  // 리더형 (경영/기획)
  { id: "l1", text: "사업을 기획하고 운영하는 일에 관심있다", type: "leadership" },
  { id: "l2", text: "다른 사람을 이끌고 관리하는 역할을 선호한다", type: "leadership" },
  { id: "l3", text: "설득하고 협상하는 능력을 발휘하고 싶다", type: "leadership" },
  { id: "l4", text: "경쟁적이고 도전적인 환경을 좋아한다", type: "leadership" },
  
  // 체계형 (사무/관리)
  { id: "o1", text: "정확하고 꼼꼼한 사무 업무를 선호한다", type: "organized" },
  { id: "o2", text: "규칙과 절차를 따르는 일에 편안함을 느낀다", type: "organized" },
  { id: "o3", text: "데이터를 정리하고 관리하는 작업을 즐긴다", type: "organized" },
  { id: "o4", text: "체계적이고 조직적인 환경에서 일하는 것을 좋아한다", type: "organized" }
];

interface CareerInterestFormProps {
  onComplete: (results: {
    answers: Record<string, number>;
    scores: Record<string, number>;
    topTypes: string[];
    total: number;
    average: number;
  }) => void;
  onBack: () => void;
}

export default function CareerInterestForm({ onComplete, onBack }: CareerInterestFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // 자동으로 다음 문항으로 이동 (0.5초 지연)
    setTimeout(() => {
      handleNext();
    }, 500);
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
        technical: 0,
        analytical: 0,
        creative: 0,
        social: 0,
        leadership: 0,
        organized: 0
      };
      
      // 각 유형별 점수 계산
      questions.forEach(question => {
        const answer = parseInt(answers[question.id] || "0");
        scores[question.type as keyof typeof scores] += answer;
      });
      
      // 각 유형당 4문항이므로 평균 계산
      Object.keys(scores).forEach(key => {
        scores[key as keyof typeof scores] = scores[key as keyof typeof scores] / 4;
      });
      
      // 상위 3개 유형 찾기
      const sortedTypes = Object.entries(scores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([type]) => type);
      
      const answerValues = Object.fromEntries(
        Object.entries(answers).map(([key, value]) => [key, parseInt(value)])
      );
      
      const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
      const average = total / 6;
      
      onComplete({
        answers: answerValues,
        scores,
        topTypes: sortedTypes,
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
                <h3 className="font-semibold text-lg">직업 성향 분석 중...</h3>
                <p className="text-muted-foreground">AI가 당신의 직업 흥미도를 분석하고 있습니다</p>
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
            <CardTitle className="text-xl">AI 직업 성향 분석</CardTitle>
            <p className="text-sm text-muted-foreground">
              다음 활동에 대한 관심도를 선택해주세요
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
                  { value: "1", label: "전혀 관심없다" },
                  { value: "2", label: "관심없다" },
                  { value: "3", label: "보통이다" },
                  { value: "4", label: "관심있다" },
                  { value: "5", label: "매우 관심있다" }
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

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                이전
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isAnswered}
                className="flex items-center gap-2"
              >
                {currentQuestion === questions.length - 1 ? "결과 보기" : "다음"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}