import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { MessageCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useTokens } from "@/hooks/useTokens";
import { useToast } from "@/hooks/use-toast";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { supabase } from "@/integrations/supabase/client";

interface GrandmaRelationshipTestProps {
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
    id: "first_meeting",
    question: "첫 만남에서 어떤 느낌을 받았나요?",
    options: [
      { value: "love_at_first", label: "첫눈에 반했다 💕" },
      { value: "comfortable", label: "편안하고 자연스러웠다" },
      { value: "awkward", label: "어색했지만 매력적이었다" },
      { value: "friend_zone", label: "그냥 친구같았다" }
    ]
  },
  {
    id: "date_planning",
    question: "데이트 계획은 주로 누가 세우나요?",
    options: [
      { value: "me_always", label: "항상 내가 다 계획한다" },
      { value: "partner_always", label: "상대방이 다 알아서 한다" },
      { value: "together", label: "함께 상의해서 정한다" },
      { value: "no_plan", label: "그냥 만나서 아무거나 한다" }
    ]
  },
  {
    id: "money_spending",
    question: "돈 쓰는 패턴은 어떤가요?",
    options: [
      { value: "dutch_pay", label: "항상 더치페이" },
      { value: "take_turns", label: "번갈아 가면서 낸다" },
      { value: "one_pays", label: "한 명이 주로 낸다" },
      { value: "fight_over", label: "내겠다고 싸운다" }
    ]
  },
  {
    id: "phone_habits",
    question: "연락하는 패턴은?",
    options: [
      { value: "constant", label: "하루종일 연락한다" },
      { value: "good_morning_night", label: "아침저녁 인사는 꼭 한다" },
      { value: "when_needed", label: "필요할 때만 연락한다" },
      { value: "forget_often", label: "자주 깜빡한다" }
    ]
  },
  {
    id: "fights",
    question: "싸울 때는 어떤가요?",
    options: [
      { value: "explosive", label: "불 같이 싸우고 금세 풀린다" },
      { value: "cold_war", label: "냉전상태가 길어진다" },
      { value: "talk_it_out", label: "끝까지 대화로 해결한다" },
      { value: "avoid", label: "싸우는 걸 피한다" }
    ]
  },
  {
    id: "future_talk",
    question: "미래에 대한 이야기는?",
    options: [
      { value: "detailed_plans", label: "구체적으로 계획을 세운다" },
      { value: "vague_dreams", label: "막연하게 꿈만 이야기한다" },
      { value: "avoid_topic", label: "그런 얘기는 피한다" },
      { value: "different_views", label: "서로 생각이 다르다" }
    ]
  },
  {
    id: "affection",
    question: "애정 표현은 어떻게 하나요?",
    options: [
      { value: "physical", label: "스킨십으로 표현한다" },
      { value: "words", label: "말로 자주 표현한다" },
      { value: "actions", label: "행동으로 보여준다" },
      { value: "gifts", label: "선물이나 깜짝선물로" }
    ]
  },
  {
    id: "jealousy",
    question: "질투에 대해서는?",
    options: [
      { value: "very_jealous", label: "둘 다 질투가 심하다" },
      { value: "one_sided", label: "한쪽만 질투한다" },
      { value: "healthy", label: "적당한 수준이다" },
      { value: "no_jealousy", label: "질투 안 한다" }
    ]
  },
  {
    id: "family_friends",
    question: "주변 사람들 반응은?",
    options: [
      { value: "everyone_loves", label: "모두가 좋아한다" },
      { value: "mixed_reaction", label: "반반이다" },
      { value: "some_concern", label: "걱정하는 사람들이 있다" },
      { value: "strong_opposition", label: "강하게 반대한다" }
    ]
  },
  {
    id: "relationship_status",
    question: "현재 관계 상태는?",
    options: [
      { value: "perfect", label: "완벽하다!" },
      { value: "mostly_good", label: "대체로 좋다" },
      { value: "ups_downs", label: "기복이 있다" },
      { value: "rocky", label: "험난하다" }
    ]
  }
];

export default function GrandmaRelationshipTest({ onComplete, onBack }: GrandmaRelationshipTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
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
        title: "토큰이 부족합니다",
        description: `이 테스트를 위해서는 ${TOKEN_COSTS.INNER_ANIMAL}토큰이 필요합니다.`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await consumeTokens(TOKEN_COSTS.INNER_ANIMAL);
      if (!success) {
        throw new Error("토큰 차감에 실패했습니다");
      }

      // Create a mock analysis for now - you can replace with actual AI function later
      const mockAnalysis = {
        relationship_type: "궁합 최악",
        grandma_verdict: "야 이것들아, 이거 완전 망했다!",
        detailed_analysis: "할머니가 보기에는 너희 둘이 완전 안 맞아. 하나는 개같고 하나는 닭같아서 어떻게 잘 살겠니?",
        advice: "그냥 헤어져라. 아니면 둘 다 성격을 완전히 바꿔야 할 거야.",
        compatibility_score: 15
      };

      onComplete(mockAnalysis, 'grandma_relationship');

      toast({
        title: "할머니 분석 완료!",
        description: "할머니의 독설을 확인해보세요!"
      });

    } catch (error) {
      console.error('Grandma relationship analysis error:', error);
      toast({
        title: "분석 실패",
        description: "할머니가 화나셨습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = answers[questions[currentQuestion]?.id];
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto p-6 max-w-2xl">
        <Card className="border-2 border-red-200 shadow-xl">
          <CardHeader className="text-center pb-4 bg-gradient-to-r from-red-100 to-orange-100">
            <Button
              variant="ghost"
              onClick={onBack}
              className="absolute left-4 top-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로가기
            </Button>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <MessageCircle className="w-8 h-8 text-red-600 animate-bounce" />
              <CardTitle className="text-2xl bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                욕쟁이 할머니의 연애 진단
              </CardTitle>
            </div>
            <p className="text-muted-foreground">
              👵 할머니가 직설적으로 당신들 관계를 진단해드립니다 (각오하세요!)
            </p>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>진행률</span>
                <span>{currentQuestion + 1} / {questions.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-8">
            <div className="min-h-[300px]">
              <h3 className="text-lg font-semibold mb-6 text-center text-red-800">
                {questions[currentQuestion]?.question}
              </h3>

              <RadioGroup
                value={answers[questions[currentQuestion]?.id] || ""}
                onValueChange={handleAnswer}
                className="space-y-4"
              >
                {questions[currentQuestion]?.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2 p-4 rounded-lg border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200">
                    <RadioGroupItem value={option.value} id={option.value} className="text-red-600" />
                    <Label 
                      htmlFor={option.value} 
                      className="flex-1 cursor-pointer font-medium text-red-800"
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
                className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
              >
                <ArrowLeft className="w-4 h-4" />
                이전
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canProceed || isLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
              >
                {isLoading ? (
                  "할머니 분석 중..."
                ) : isLastQuestion ? (
                  "할머니 독설 듣기 😱"
                ) : (
                  <>
                    다음
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              💰 소모 토큰: {TOKEN_COSTS.INNER_ANIMAL}개 | 👵 할머니의 솔직한 조언을 들을 준비 되셨나요?
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}