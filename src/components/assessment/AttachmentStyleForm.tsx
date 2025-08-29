import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

const questions = [
  {
    id: "attach1",
    text: "다른 사람과 친밀해지는 것이 쉽다",
    dimension: "avoidance",
    reverse: true
  },
  {
    id: "attach2", 
    text: "다른 사람에게 의존하는 것이 편하지 않다",
    dimension: "avoidance",
    reverse: false
  },
  {
    id: "attach3",
    text: "혼자 있는 것이 편하다",
    dimension: "avoidance", 
    reverse: false
  },
  {
    id: "attach4",
    text: "사람들이 나에게 너무 가까워지려 할 때 불편하다",
    dimension: "avoidance",
    reverse: false
  },
  {
    id: "attach5",
    text: "사람들과 가까워지고 싶지만 상처받을까 봐 망설여진다",
    dimension: "anxiety",
    reverse: false
  },
  {
    id: "attach6",
    text: "다른 사람들이 나만큼 가까워지고 싶어하지 않을까 봐 걱정된다",
    dimension: "anxiety",
    reverse: false
  },
  {
    id: "attach7",
    text: "혼자 남겨질까 봐 걱정된다",
    dimension: "anxiety",
    reverse: false
  },
  {
    id: "attach8",
    text: "연인이 나를 진정으로 사랑하는지 의심할 때가 있다",
    dimension: "anxiety",
    reverse: false
  },
  {
    id: "attach9",
    text: "다른 사람에게 의존하는 것은 자연스러운 일이다",
    dimension: "avoidance",
    reverse: true
  },
  {
    id: "attach10",
    text: "가까운 사람들과의 관계에서 편안함을 느낀다",
    dimension: "avoidance",
    reverse: true
  },
  {
    id: "attach11",
    text: "사람들이 나를 받아들여주지 않을까 봐 걱정된다",
    dimension: "anxiety", 
    reverse: false
  },
  {
    id: "attach12",
    text: "나는 사랑받을 가치가 없는 사람이라고 생각할 때가 있다",
    dimension: "anxiety",
    reverse: false
  }
];

interface AttachmentStyleFormProps {
  onComplete: (results: {
    answers: Record<string, number>;
    anxietyScore: number;
    avoidanceScore: number;
    style: string;
    total: number;
    average: number;
  }) => void;
  onBack: () => void;
}

export default function AttachmentStyleForm({ onComplete, onBack }: AttachmentStyleFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
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
    setTimeLeft(30); // 30초 예상
    setAnalysisProgress(0);

    // 진행률 시뮬레이션
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + 3, 95));
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    
    setTimeout(() => {
      let anxietyScore = 0;
      let avoidanceScore = 0;
      let anxietyCount = 0;
      let avoidanceCount = 0;
      
      questions.forEach(question => {
        const answer = parseInt(answers[question.id] || "0");
        const score = question.reverse ? 8 - answer : answer;
        
        if (question.dimension === "anxiety") {
          anxietyScore += score;
          anxietyCount++;
        } else {
          avoidanceScore += score;
          avoidanceCount++;
        }
      });
      
      // 평균 계산
      anxietyScore = anxietyScore / anxietyCount;
      avoidanceScore = avoidanceScore / avoidanceCount;
      
      // 애착 유형 결정
      let style: string;
      if (anxietyScore < 4 && avoidanceScore < 4) {
        style = "안정형";
      } else if (anxietyScore >= 4 && avoidanceScore < 4) {
        style = "불안형";
      } else if (anxietyScore < 4 && avoidanceScore >= 4) {
        style = "회피형";
      } else {
        style = "혼란형";
      }
      
      const answerValues = Object.fromEntries(
        Object.entries(answers).map(([key, value]) => [key, parseInt(value)])
      );
      
      const total = anxietyScore + avoidanceScore;
      const average = total / 2;
      
      onComplete({
        answers: answerValues,
        anxietyScore,
        avoidanceScore,
        style,
        total,
        average
      });
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setTimeLeft(0);
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
              <div className="text-center space-y-3">
                <h3 className="font-semibold text-lg">애착 유형 분석 중...</h3>
                <p className="text-muted-foreground">관계 패턴을 분석하고 있습니다</p>
                
                {/* 진행률 바 */}
                <div className="bg-gray-200 rounded-full h-2 w-full max-w-xs mx-auto">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analysisProgress}%` }}
                  ></div>
                </div>
                
                {timeLeft > 0 && (
                  <p className="text-sm font-medium text-primary">
                    {timeLeft > 60 
                      ? `약 ${Math.ceil(timeLeft / 60)}분 남음`
                      : `약 ${timeLeft}초 남음`
                    }
                  </p>
                )}
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
            <CardTitle className="text-xl">애착 유형 검사</CardTitle>
            <p className="text-sm text-muted-foreground">
              인간관계에서의 나의 패턴을 알아보세요
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
                  { value: "3", label: "약간 그렇지 않다" },
                  { value: "4", label: "보통이다" },
                  { value: "5", label: "약간 그렇다" },
                  { value: "6", label: "그렇다" },
                  { value: "7", label: "매우 그렇다" }
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