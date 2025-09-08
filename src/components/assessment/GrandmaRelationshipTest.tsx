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

      // Create a variety of humorous grandma analyses
      const grandmaAnalyses = [
        {
          relationship_type: "궁합 최악 중의 최악",
          grandma_verdict: "야 이것들아! 이건 뭐 원수를 맺은 관계냐? 너희 둘이 만나면 우리나라 GDP가 떨어진다고! 하나는 동쪽을 보면 하나는 서쪽을 보고, 하나는 밥을 먹으면 하나는 똥을 싸는 수준이야. 이런 걸 연애라고 부르는 거냐? 할머니가 봐도 기가 막혀서 혈압약 먹어야겠다!",
          detailed_analysis: "이봐, 너희들이 만나는 건 우주의 질서를 거스르는 일이야. 하나는 개처럼 충성스럽고 하나는 고양이처럼 도도한데, 이게 어떻게 맞겠어? 게다가 하나는 불고기를 좋아하고 하나는 냉면을 좋아하잖아. 이런 근본적인 차이를 어떻게 극복하라고? 너희가 같이 있으면 주변 사람들도 다 스트레스 받는다고! 할머니가 젊었을 때도 이런 커플은 못 봤어. 정말로!",
          advice: "그냥 깨끗하게 헤어져라. 아니면 둘 중 하나는 화성으로 이민을 가든지. 만약에 정말정말 사랑한다면, 둘 다 성격을 완전히 갈아엎고 새 사람이 되어야 할 거야. 그런데 그럴 바에야 차라리 새로운 사람을 만나는 게 낫지 않겠어? 할머니 말이 틀렸나 봐봐!",
          compatibility_score: 8
        },
        {
          relationship_type: "어휴 골치 아픈 관계",
          grandma_verdict: "얘들아, 너희 보고 있으면 머리가 지끈지끈해. 하나는 아침형 인간이고 하나는 밤형 인간이면서 어떻게 만났냐? 이거 완전 시차 적응 안 되는 국제커플 수준이야! 하나는 조용히 책 보는 걸 좋아하고 하나는 클럽에서 신나게 놀고 싶어하는데, 데이트는 어떻게 하려고?",
          detailed_analysis: "너희 둘은 마치 물과 기름 같아. 섞이지도 않으면서 계속 같은 그릇에 있으려고 하니까 문제지. 하나는 계획적이고 하나는 즉흥적이고, 하나는 아껴 쓰고 하나는 펑펑 쓰고... 이런 차이가 하나둘이냐? 근데 희한하게도 서로한테 끌리는 건 인정해줄게. 그게 사랑인지 호기심인지는 모르겠지만 말이야.",
          advice: "많이 많이 대화해라. 그리고 서로의 다른 점을 인정하는 연습을 해. 하지만 너무 힘들면 포기하는 것도 용기야. 할머니는 너희가 행복했으면 좋겠어서 하는 소리야!",
          compatibility_score: 35
        },
        {
          relationship_type: "그럭저럭 볼만한 커플",
          grandma_verdict: "음... 나쁘지 않네? 너희 둘이 같이 있는 거 보니까 그럭저럭 어울려. 근데 가끔 보면 답답할 때가 있어. 왜 그렇게 소통을 안 하냐? 서로 마음속으로만 생각하고 말은 안 하면서 상대방이 알아주길 바라고... 이게 뭐냐?",
          detailed_analysis: "너희는 기본적으로는 잘 맞아. 취미도 비슷하고 가치관도 크게 다르지 않고. 근데 문제는 둘 다 너무 착해서 솔직한 말을 안 한다는 거야. 싫은 건 싫다고 하고, 좋은 건 좋다고 해야지. 그래야 진짜 사랑이지, 참고만 있으면 언젠가는 폭발한다고!",
          advice: "좀 더 솔직해져라. 그리고 가끔은 서로에게 깜짝 이벤트도 해주고. 너무 평범하면 재미없잖아. 하지만 전체적으로는 괜찮은 커플이야!",
          compatibility_score: 68
        },
        {
          relationship_type: "완벽한 천생연분",
          grandma_verdict: "어머나, 이것들 봐라! 너희 둘 보고 있으면 할머니가 다 기분이 좋아진다. 서로를 바라보는 눈빛부터가 다르더라. 이런 걸 진짜 사랑이라고 하는 거야. 할머니가 젊었을 때도 이런 커플은 흔하지 않았어!",
          detailed_analysis: "너희는 정말 잘 맞아. 서로 다른 점도 있지만 그게 오히려 매력이 되고, 같은 점들은 또 얼마나 많은지. 무엇보다 서로를 존중하고 배려하는 마음이 보여서 할머니가 흐뭇해. 이런 관계라면 오래오래 행복할 수 있을 거야.",
          advice: "지금처럼만 해. 서로를 소중히 여기고 감사하는 마음 잃지 말고. 가끔 작은 다툼이 있어도 금방 화해하는 너희들이니까 걱정 안 해. 할머니가 응원한다!",
          compatibility_score: 92
        },
        {
          relationship_type: "미친 케미의 롤러코스터 커플",
          grandma_verdict: "야야야! 너희 둘 뭐야? 만날 때는 세상에서 제일 행복해하더니 싸울 때는 또 왜 그렇게 드라마틱하게 싸우냐? 옆에서 보는 할머니가 다 어지러워. 그런데 또 금방 화해하고... 이게 뭔 드라마야?",
          detailed_analysis: "너희는 정말 극과 극이야. 감정이 풍부한 건 좋은데 조금 과도한 것 같아. 사랑할 때는 우주를 다 줄 것처럼 하고, 화날 때는 지구를 박살낼 것처럼 하고... 그런데 이상하게도 서로한테 매력을 못 느끼겠대? 이해가 안 가!",
          advice: "감정 조절 좀 배워라. 그리고 화났을 때는 한 번 숨 고르고 말해. 너희 사랑은 진짜인 것 같으니까 이런 것만 조절하면 정말 좋은 커플이 될 수 있어!",
          compatibility_score: 74
        }
      ];

      // Randomly select one of the analyses
      const selectedAnalysis = grandmaAnalyses[Math.floor(Math.random() * grandmaAnalyses.length)];

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