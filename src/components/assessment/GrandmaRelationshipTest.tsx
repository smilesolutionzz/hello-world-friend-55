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

// 답변별 점수 (긍정적일수록 높은 점수)
const answerScores: Record<string, number> = {
  // 1. 첫 만남
  "love_at_first": 10,
  "comfortable": 9,
  "awkward": 6,
  "friend_zone": 3,
  
  // 2. 갈등 해결
  "wife_first": 7,
  "husband_first": 7,
  "both_same": 5,
  "both_avoid": 2,
  
  // 3. 돈 관리
  "plan_together": 10,
  "one_manages_well": 7,
  "flexible": 8,
  "no_plan": 3,
  
  // 4. 집안일
  "share_equally": 10,
  "flexible_help": 9,
  "one_mostly": 5,
  "always_fight": 2,
  
  // 5. 연락 패턴
  "constant": 7,
  "good_morning_night": 9,
  "when_needed": 6,
  "forget_often": 2,
  
  // 6. 배려
  "both_very_considerate": 10,
  "usually_considerate": 8,
  "sometimes": 5,
  "rarely": 2,
  
  // 7. 싸움
  "explosive": 6,
  "cold_war": 3,
  "talk_it_out": 10,
  "avoid": 5,
  
  // 8. 돈 씀씀이
  "both_save": 8,
  "both_spend": 6,
  "balanced": 10,
  "very_different": 3,
  
  // 9. 주변 반응
  "everyone_loves": 10,
  "mixed_reaction": 7,
  "some_concern": 4,
  "strong_opposition": 1,
  
  // 10. 현재 상태
  "perfect": 10,
  "mostly_good": 8,
  "ups_downs": 5,
  "rocky": 2
};

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
    id: "conflict_resolution",
    question: "갈등이 생겼을 때 누가 먼저 화해하나요?",
    options: [
      { value: "wife_first", label: "주로 아내가 먼저 다가간다" },
      { value: "husband_first", label: "주로 남편이 먼저 사과한다" },
      { value: "both_same", label: "둘 다 동시에 화해하려 노력한다" },
      { value: "both_avoid", label: "둘 다 피하다가 시간이 해결한다" }
    ]
  },
  {
    id: "money_management",
    question: "가계 관리는 어떻게 하나요?",
    options: [
      { value: "plan_together", label: "함께 계획하고 관리한다" },
      { value: "one_manages_well", label: "한 명이 관리하지만 투명하게 공유한다" },
      { value: "flexible", label: "각자 쓸 돈은 각자 관리한다" },
      { value: "no_plan", label: "특별한 계획 없이 쓴다" }
    ]
  },
  {
    id: "housework",
    question: "집안일은 어떻게 분담하나요?",
    options: [
      { value: "share_equally", label: "공평하게 역할을 나눈다" },
      { value: "flexible_help", label: "상황에 따라 서로 도와준다" },
      { value: "one_mostly", label: "한쪽이 주로 하지만 불만은 없다" },
      { value: "always_fight", label: "이 문제로 자주 다툰다" }
    ]
  },
  {
    id: "phone_habits",
    question: "연락하는 패턴은?",
    options: [
      { value: "constant", label: "하루종일 소소하게 연락한다" },
      { value: "good_morning_night", label: "아침저녁 인사는 꼭 한다" },
      { value: "when_needed", label: "필요할 때만 연락한다" },
      { value: "forget_often", label: "자주 깜빡한다" }
    ]
  },
  {
    id: "consideration",
    question: "서로에 대한 배려는 어느 정도인가요?",
    options: [
      { value: "both_very_considerate", label: "둘 다 항상 상대를 먼저 생각한다" },
      { value: "usually_considerate", label: "대부분 서로 배려한다" },
      { value: "sometimes", label: "가끔 배려하지만 종종 놓친다" },
      { value: "rarely", label: "각자 바빠서 배려할 여유가 없다" }
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
    id: "spending_pattern",
    question: "돈 쓰는 패턴은 어떤가요?",
    options: [
      { value: "both_save", label: "둘 다 아껴 쓰는 편이다" },
      { value: "both_spend", label: "둘 다 쓸 때는 쓴다" },
      { value: "balanced", label: "한 명은 절약, 한 명은 소비하며 균형을 맞춘다" },
      { value: "very_different", label: "돈에 대한 가치관이 너무 다르다" }
    ]
  },
  {
    id: "family_friends",
    question: "주변 사람들 반응은?",
    options: [
      { value: "everyone_loves", label: "모두가 좋아하고 응원한다" },
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
    
    // 자동으로 다음 문항으로 이동
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }, 300); // 300ms 딜레이로 자연스럽게
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
        description: `이 테스트를 위해서는 ${TOKEN_COSTS.INNER_ANIMAL * 100}캐시가 필요합니다.`,
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

      // 점수 계산
      let totalScore = 0;
      Object.entries(answers).forEach(([questionId, answerValue]) => {
        totalScore += answerScores[answerValue] || 0;
      });
      
      const maxScore = questions.length * 10;
      const compatibilityScore = Math.round((totalScore / maxScore) * 100);

      // 점수에 따른 분석 선택
      let selectedAnalysis;
      
      if (compatibilityScore >= 85) {
        selectedAnalysis = {
          relationship_type: "완벽한 천생연분",
          grandma_verdict: "어머나, 이것들 봐라! 너희 둘 보고 있으면 할머니가 다 기분이 좋아진다. 서로를 바라보는 눈빛부터가 다르더라. 이런 걸 진짜 사랑이라고 하는 거야. 할머니가 젊었을 때도 이런 커플은 흔하지 않았어!",
          detailed_analysis: "너희는 정말 잘 맞아. 서로 다른 점도 있지만 그게 오히려 매력이 되고, 같은 점들은 또 얼마나 많은지. 무엇보다 서로를 존중하고 배려하는 마음이 보여서 할머니가 흐뭇해. 이런 관계라면 오래오래 행복할 수 있을 거야.",
          advice: "지금처럼만 해. 서로를 소중히 여기고 감사하는 마음 잃지 말고. 가끔 작은 다툼이 있어도 금방 화해하는 너희들이니까 걱정 안 해. 할머니가 응원한다!",
          compatibility_score: compatibilityScore
        };
      } else if (compatibilityScore >= 70) {
        selectedAnalysis = {
          relationship_type: "미친 케미의 롤러코스터 커플",
          grandma_verdict: "오호! 너희 둘 케미 좋은데? 서로 다른 점도 있지만 그게 오히려 매력 포인트네. 가끔 티격태격해도 금방 화해하는 모습이 보기 좋아. 이런 게 진짜 부부야!",
          detailed_analysis: "너희는 정말 극과 극을 달리는 커플이야. 감정이 풍부한 건 좋은데 조금 과도할 때도 있네. 사랑할 때는 우주를 다 줄 것처럼 하고, 화날 때는 격하게 표현하고... 그런데 이상하게도 서로한테 매력을 느끼잖아? 이게 바로 사랑이야!",
          advice: "감정 조절을 좀 배우면 더 좋겠어. 화났을 때는 한 번 숨 고르고 말해봐. 너희 사랑은 진짜인 것 같으니까 이런 것만 조절하면 정말 좋은 커플이 될 수 있어!",
          compatibility_score: compatibilityScore
        };
      } else if (compatibilityScore >= 55) {
        selectedAnalysis = {
          relationship_type: "그럭저럭 볼만한 커플",
          grandma_verdict: "음... 나쁘지 않네? 너희 둘이 같이 있는 거 보니까 그럭저럭 어울려. 근데 가끔 보면 답답할 때가 있어. 왜 그렇게 소통을 안 하냐? 서로 마음속으로만 생각하고 말은 안 하면서 상대방이 알아주길 바라고... 이게 뭐냐?",
          detailed_analysis: "너희는 기본적으로는 잘 맞아. 취미도 비슷하고 가치관도 크게 다르지 않고. 근데 문제는 둘 다 너무 착해서 솔직한 말을 안 한다는 거야. 싫은 건 싫다고 하고, 좋은 건 좋다고 해야지. 그래야 진짜 사랑이지, 참고만 있으면 언젠가는 폭발한다고!",
          advice: "좀 더 솔직해져라. 그리고 가끔은 서로에게 깜짝 이벤트도 해주고. 너무 평범하면 재미없잖아. 하지만 전체적으로는 괜찮은 커플이야!",
          compatibility_score: compatibilityScore
        };
      } else if (compatibilityScore >= 35) {
        selectedAnalysis = {
          relationship_type: "어휴 골치 아픈 관계",
          grandma_verdict: "얘들아, 너희 보고 있으면 머리가 지끈지끈해. 서로 맞지 않는 부분이 꽤 많은데 왜 그렇게 참고만 있냐? 하나는 이렇게 하고 싶고 하나는 저렇게 하고 싶은데, 대화는 언제 할 거야?",
          detailed_analysis: "너희 둘은 마치 물과 기름 같아. 섞이지도 않으면서 계속 같은 그릇에 있으려고 하니까 문제지. 하나는 계획적이고 하나는 즉흥적이고, 하나는 아껴 쓰고 하나는 펑펑 쓰고... 이런 차이가 하나둘이냐? 근데 희한하게도 서로한테 끌리는 건 인정해줄게.",
          advice: "많이 많이 대화해라. 그리고 서로의 다른 점을 인정하는 연습을 해. 하지만 너무 힘들면 포기하는 것도 용기야. 할머니는 너희가 행복했으면 좋겠어서 하는 소리야!",
          compatibility_score: compatibilityScore
        };
      } else {
        selectedAnalysis = {
          relationship_type: "궁합 최악 중의 최악",
          grandma_verdict: "야 이것들아! 이건 뭐 원수를 맺은 관계냐? 너희 둘이 만나면 우리나라 GDP가 떨어진다고! 하나는 동쪽을 보면 하나는 서쪽을 보고, 하나는 밥을 먹으면 하나는 똥을 싸는 수준이야. 이런 걸 연애라고 부르는 거냐? 할머니가 봐도 기가 막혀서 혈압약 먹어야겠다!",
          detailed_analysis: "이봐, 너희들이 만나는 건 우주의 질서를 거스르는 일이야. 서로 맞지 않는 게 너무 많아. 게다가 갈등 해결 방식도 완전히 달라. 이런 근본적인 차이를 어떻게 극복하라고? 너희가 같이 있으면 주변 사람들도 다 스트레스 받는다고! 할머니가 젊었을 때도 이런 커플은 못 봤어. 정말로!",
          advice: "그냥 깨끗하게 헤어져라. 아니면 둘 중 하나는 화성으로 이민을 가든지. 만약에 정말정말 사랑한다면, 둘 다 성격을 완전히 갈아엎고 새 사람이 되어야 할 거야. 그런데 그럴 바에야 차라리 새로운 사람을 만나는 게 낫지 않겠어?",
          compatibility_score: compatibilityScore
        };
      }

      onComplete(selectedAnalysis, 'grandma_relationship');

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
                욕쟁이 할머니의 연애 분석
              </CardTitle>
            </div>
            <p className="text-muted-foreground">
              👵 할머니가 직설적으로 당신들 관계를 분석해드립니다 (각오하세요!)
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
              💰 소모 캐시: {TOKEN_COSTS.INNER_ANIMAL * 100}원 | 👵 할머니의 솔직한 조언을 들을 준비 되셨나요?
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}