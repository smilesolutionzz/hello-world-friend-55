import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Heart, ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTokens } from "@/hooks/useTokens";
import { useToast } from "@/hooks/use-toast";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { supabase } from "@/integrations/supabase/client";

interface InnerAnimalTestProps {
  onComplete: (result: any, testType: string) => void;
  onBack: () => void;
}

interface Question {
  id: string;
  question: string;
  options: { value: string; label: string }[];
}

const questions: Question[] = [
  {
    id: "stress_response",
    question: "스트레스를 받을 때 주로 어떻게 반응하시나요?",
    options: [
      { value: "fight", label: "정면으로 맞서서 해결하려고 한다" },
      { value: "withdraw", label: "조용한 곳으로 피해서 혼자 생각한다" },
      { value: "seek_help", label: "믿을 만한 사람에게 도움을 요청한다" },
      { value: "analyze", label: "차근차근 분석해서 계획을 세운다" }
    ]
  },
  {
    id: "social_preference",
    question: "사람들과의 관계에서 어떤 역할을 주로 하시나요?",
    options: [
      { value: "leader", label: "앞장서서 이끌어가는 역할" },
      { value: "supporter", label: "뒤에서 든든하게 지지하는 역할" },
      { value: "mediator", label: "갈등을 중재하고 화합시키는 역할" },
      { value: "advisor", label: "조언과 지혜를 제공하는 역할" }
    ]
  },
  {
    id: "decision_style",
    question: "중요한 결정을 내릴 때 가장 중요하게 여기는 것은?",
    options: [
      { value: "instinct", label: "직감과 본능" },
      { value: "emotion", label: "감정과 마음" },
      { value: "relationship", label: "주변 사람들과의 관계" },
      { value: "logic", label: "논리적 분석과 계산" }
    ]
  },
  {
    id: "energy_source",
    question: "에너지를 얻는 방법이 무엇인가요?",
    options: [
      { value: "action", label: "활동적인 일을 하며 몸을 움직일 때" },
      { value: "solitude", label: "혼자만의 시간을 가질 때" },
      { value: "interaction", label: "사람들과 소통하고 교감할 때" },
      { value: "learning", label: "새로운 것을 배우고 탐구할 때" }
    ]
  },
  {
    id: "life_priority",
    question: "인생에서 가장 중요하게 생각하는 가치는?",
    options: [
      { value: "freedom", label: "자유롭게 살아가는 것" },
      { value: "stability", label: "안정적이고 평온한 삶" },
      { value: "love", label: "사랑하는 사람들과의 행복" },
      { value: "achievement", label: "성취와 자아실현" }
    ]
  },
  {
    id: "communication",
    question: "의사소통 스타일은 어떤가요?",
    options: [
      { value: "direct", label: "직설적이고 솔직하게" },
      { value: "gentle", label: "부드럽고 온화하게" },
      { value: "warm", label: "따뜻하고 친근하게" },
      { value: "thoughtful", label: "신중하고 깊이 있게" }
    ]
  },
  {
    id: "work_environment",
    question: "선호하는 업무 환경은?",
    options: [
      { value: "competitive", label: "경쟁적이고 역동적인 환경" },
      { value: "peaceful", label: "조용하고 평화로운 환경" },
      { value: "collaborative", label: "협력적이고 화목한 환경" },
      { value: "structured", label: "체계적이고 질서정연한 환경" }
    ]
  },
  {
    id: "hobby_preference",
    question: "취미나 여가 활동으로 선호하는 것은?",
    options: [
      { value: "outdoor", label: "등산, 스포츠 등 야외 활동" },
      { value: "indoor", label: "독서, 영화 등 실내 활동" },
      { value: "social", label: "모임, 파티 등 사교 활동" },
      { value: "cultural", label: "전시회, 공연 등 문화 활동" }
    ]
  },
  {
    id: "conflict_resolution",
    question: "갈등이나 문제가 생겼을 때 어떻게 해결하시나요?",
    options: [
      { value: "confront", label: "즉시 해결하려고 적극적으로 나선다" },
      { value: "avoid", label: "시간이 지나면 해결될 거라 기다린다" },
      { value: "compromise", label: "양쪽 모두 만족할 해결책을 찾는다" },
      { value: "research", label: "충분히 조사하고 분석한 후 해결한다" }
    ]
  },
  {
    id: "learning_style",
    question: "새로운 것을 배울 때 선호하는 방식은?",
    options: [
      { value: "practice", label: "직접 해보면서 배운다" },
      { value: "observation", label: "관찰하고 모방하면서 배운다" },
      { value: "discussion", label: "다른 사람들과 토론하면서 배운다" },
      { value: "theory", label: "이론을 먼저 이해하고 배운다" }
    ]
  },
  {
    id: "change_attitude",
    question: "변화에 대한 당신의 태도는?",
    options: [
      { value: "embrace", label: "변화를 즐기고 적극적으로 받아들인다" },
      { value: "cautious", label: "신중하게 접근하며 천천히 적응한다" },
      { value: "supportive", label: "주변 사람들과 함께 변화에 적응한다" },
      { value: "analytical", label: "변화의 필요성을 분석해서 판단한다" }
    ]
  },
  {
    id: "life_philosophy",
    question: "인생에 대한 당신의 철학은?",
    options: [
      { value: "adventure", label: "인생은 모험이다, 도전하며 살자" },
      { value: "peace", label: "인생은 평화롭게, 조화롭게 살자" },
      { value: "connection", label: "인생은 함께, 사랑하며 살자" },
      { value: "growth", label: "인생은 성장이다, 배우며 발전하자" }
    ]
  }
];

export default function InnerAnimalTest({ onComplete, onBack }: InnerAnimalTestProps) {
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
    if (!checkTokenAvailability(TOKEN_COSTS.INNER_ANIMAL)) {
      toast({
        title: "캐시가 부족합니다",
        description: `이 테스트를 위해서는 ${TOKEN_COSTS.INNER_ANIMAL * 100}원이 필요합니다.`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await consumeTokens(TOKEN_COSTS.INNER_ANIMAL);
      if (!success) {
        throw new Error("캐시 차감에 실패했습니다");
      }

      const { data, error } = await supabase.functions.invoke('inner-animal-analyzer', {
        body: { answers }
      });

      if (error) throw error;

      const resultData = {
        type: 'inner_animal',
        answers,
        result: data
      };

      console.log('Fun test completed:', {
        result: data,
        testType: 'inner_animal'
      });

      onComplete(data, 'inner_animal');

      toast({
        title: "분석 완료!",
        description: "당신의 내면 동물을 확인해보세요!"
      });

    } catch (error) {
      console.error('Inner animal analysis error:', error);
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
            <Heart className="w-8 h-8 text-primary animate-pulse" />
            <CardTitle className="text-2xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              나의 내면 동물 찾기
            </CardTitle>
          </div>
          <p className="text-muted-foreground">
            깊은 심리 분석을 통해 당신의 진짜 성격을 대변하는 동물을 찾아드립니다
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
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
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
            💰 소모 캐시: {TOKEN_COSTS.INNER_ANIMAL * 100}원
          </div>
        </CardContent>
      </Card>
    </div>
  );
}