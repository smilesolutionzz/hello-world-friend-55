import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Crown, ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTokens } from "@/hooks/useTokens";
import { useToast } from "@/hooks/use-toast";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id: string;
  question: string;
  options: { value: string; label: string }[];
}

const questions: Question[] = [
  {
    id: "personality",
    question: "친구들이 나를 어떻게 묘사할까?",
    options: [
      { value: "leader", label: "리더십이 강하고 결정력이 있다" },
      { value: "creative", label: "창의적이고 상상력이 풍부하다" },
      { value: "caring", label: "배려심이 깊고 따뜻하다" },
      { value: "analytical", label: "논리적이고 분석적이다" }
    ]
  },
  {
    id: "preference",
    question: "가장 끌리는 활동은?",
    options: [
      { value: "adventure", label: "모험과 탐험" },
      { value: "art", label: "예술과 창작" },
      { value: "helping", label: "사람들 돕기" },
      { value: "learning", label: "지식 탐구" }
    ]
  },
  {
    id: "environment",
    question: "어떤 환경에서 가장 편안함을 느끼나요?",
    options: [
      { value: "castle", label: "웅장한 성이나 궁전" },
      { value: "nature", label: "자연 속 고요한 곳" },
      { value: "temple", label: "신성한 사원이나 교회" },
      { value: "library", label: "고서로 가득한 도서관" }
    ]
  },
  {
    id: "decision",
    question: "중요한 결정을 내릴 때 가장 중요하게 생각하는 것은?",
    options: [
      { value: "power", label: "영향력과 권력" },
      { value: "beauty", label: "아름다움과 조화" },
      { value: "morality", label: "도덕과 정의" },
      { value: "truth", label: "진실과 지혜" }
    ]
  },
  {
    id: "legacy",
    question: "후세에 어떻게 기억되고 싶나요?",
    options: [
      { value: "conqueror", label: "위대한 정복자로" },
      { value: "artist", label: "천재 예술가로" },
      { value: "saint", label: "성인이나 구원자로" },
      { value: "scholar", label: "현명한 학자로" }
    ]
  }
];

export default function PastLifeJobTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { consumeTokens, checkTokenAvailability } = useTokens();
  const { toast } = useToast();

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!checkTokenAvailability(TOKEN_COSTS.PAST_LIFE_JOB)) {
      toast({
        title: "토큰이 부족합니다",
        description: `이 테스트를 위해서는 ${TOKEN_COSTS.PAST_LIFE_JOB}토큰이 필요합니다.`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await consumeTokens(TOKEN_COSTS.PAST_LIFE_JOB);
      if (!success) {
        throw new Error("토큰 차감에 실패했습니다");
      }

      const { data, error } = await supabase.functions.invoke('past-life-job-analyzer', {
        body: { answers }
      });

      if (error) throw error;

      const resultData = {
        type: 'past_life_job',
        answers,
        result: data
      };

      navigate('/assessment/result', { 
        state: { 
          result: resultData,
          testType: 'past_life_job'
        }
      });

      toast({
        title: "분석 완료!",
        description: "당신의 전생 직업을 확인해보세요!"
      });

    } catch (error) {
      console.error('Past life job analysis error:', error);
      toast({
        title: "분석 실패",
        description: "테스트 분석 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = answers[questions[currentQuestion]?.id];
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-8 h-8 text-primary" />
            <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              내 전생은 어떤 직업?
            </CardTitle>
          </div>
          <p className="text-muted-foreground">
            AI가 당신의 답변을 분석해 전생의 직업을 알려드립니다
          </p>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>진행률</span>
              <span>{currentQuestion + 1} / {questions.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="min-h-[300px]">
            <h3 className="text-lg font-semibold mb-6 text-center">
              {questions[currentQuestion]?.question}
            </h3>

            <RadioGroup
              value={answers[questions[currentQuestion]?.id] || ""}
              onValueChange={handleAnswer}
              className="space-y-4"
            >
              {questions[currentQuestion]?.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-secondary/50 transition-colors">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label 
                    htmlFor={option.value} 
                    className="flex-1 cursor-pointer font-medium"
                  >
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
              disabled={!canProceed || isLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isLoading ? (
                "분석 중..."
              ) : isLastQuestion ? (
                "결과 보기"
              ) : (
                <>
                  다음
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            💰 소모 토큰: {TOKEN_COSTS.PAST_LIFE_JOB}개
          </div>
        </CardContent>
      </Card>
    </div>
  );
}