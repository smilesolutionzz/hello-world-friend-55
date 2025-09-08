import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, MessageCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTokens } from '@/hooks/useTokens';
import { TOKEN_COSTS } from '@/constants/tokenCosts';

interface MZNaggingTestProps {
  onComplete: (result: any, testType: string) => void;
  onBack: () => void;
}

const questions = [
  {
    id: "dating_status",
    question: "연애는 하고 있니?",
    options: [
      { value: "single_choice", label: "혼자가 편해요" },
      { value: "dating", label: "연애 중이에요" },
      { value: "complicated", label: "복잡해요..." },
      { value: "app_dating", label: "앱으로 만나고 있어요" },
      { value: "given_up", label: "포기했어요" }
    ]
  },
  {
    id: "job_situation",
    question: "일은 어떻게 하고 있어?",
    options: [
      { value: "job_hunting", label: "취업 준비 중" },
      { value: "contract", label: "계약직이에요" },
      { value: "full_time", label: "정규직 다녀요" },
      { value: "freelance", label: "프리랜서예요" },
      { value: "part_time", label: "알바만 해요" }
    ]
  },
  {
    id: "money_spending",
    question: "돈은 어떻게 쓰고 있니?",
    options: [
      { value: "delivery", label: "배달음식 자주 시켜먹어요" },
      { value: "coffee", label: "카페에서 많이 써요" },
      { value: "online_shopping", label: "온라인 쇼핑 많이 해요" },
      { value: "travel", label: "여행에 많이 써요" },
      { value: "saving", label: "열심히 모으고 있어요" }
    ]
  },
  {
    id: "living_situation",
    question: "어디서 살고 있어?",
    options: [
      { value: "parents", label: "부모님과 함께" },
      { value: "oneroom", label: "원룸 혼자" },
      { value: "share", label: "룸메이트와 함께" },
      { value: "monthly_rent", label: "월세방" },
      { value: "moving_often", label: "자주 이사 다녀요" }
    ]
  },
  {
    id: "sns_usage",
    question: "SNS는 얼마나 해?",
    options: [
      { value: "addicted", label: "하루 종일 봐요" },
      { value: "moderate", label: "적당히 해요" },
      { value: "posting", label: "자주 올려요" },
      { value: "lurking", label: "보기만 해요" },
      { value: "dont_use", label: "안 해요" }
    ]
  },
  {
    id: "parent_relationship",
    question: "부모님과는 어떻게 지내?",
    options: [
      { value: "close", label: "친해요" },
      { value: "awkward", label: "어색해요" },
      { value: "conflict", label: "자주 갈등 있어요" },
      { value: "independent", label: "독립하고 싶어요" },
      { value: "dependent", label: "의존하고 있어요" }
    ]
  },
  {
    id: "health_habits",
    question: "건강은 어떻게 챙기고 있어?",
    options: [
      { value: "exercise", label: "운동 열심히 해요" },
      { value: "irregular", label: "불규칙하게 살아요" },
      { value: "no_care", label: "신경 안 써요" },
      { value: "stressed", label: "스트레스 많아요" },
      { value: "trying", label: "챙기려고 노력해요" }
    ]
  },
  {
    id: "career_goals",
    question: "앞으로 뭐 하고 싶어?",
    options: [
      { value: "stable_job", label: "안정적인 직장" },
      { value: "own_business", label: "창업하고 싶어요" },
      { value: "no_plan", label: "모르겠어요" },
      { value: "freedom", label: "자유롭게 살고 싶어요" },
      { value: "success", label: "성공하고 싶어요" }
    ]
  },
  {
    id: "cooking_skills",
    question: "요리는 할 줄 알아?",
    options: [
      { value: "cant_cook", label: "전혀 못해요" },
      { value: "ramen_level", label: "라면 정도만" },
      { value: "basic", label: "간단한 건 해요" },
      { value: "good", label: "잘하는 편이에요" },
      { value: "delivery_only", label: "배달만 시켜먹어요" }
    ]
  },
  {
    id: "marriage_thoughts",
    question: "결혼에 대해서는 어떻게 생각해?",
    options: [
      { value: "want_soon", label: "빨리 하고 싶어요" },
      { value: "someday", label: "언젠가는" },
      { value: "no_interest", label: "관심 없어요" },
      { value: "scared", label: "무서워요" },
      { value: "depends", label: "상황 봐서" }
    ]
  },
  {
    id: "stress_relief",
    question: "스트레스는 어떻게 풀어?",
    options: [
      { value: "drinking", label: "술 마셔요" },
      { value: "gaming", label: "게임해요" },
      { value: "shopping", label: "쇼핑해요" },
      { value: "exercise_relief", label: "운동해요" },
      { value: "sleeping", label: "잠만 자요" }
    ]
  },
  {
    id: "future_worries",
    question: "제일 걱정되는 게 뭐야?",
    options: [
      { value: "money", label: "돈 문제" },
      { value: "loneliness", label: "외로움" },
      { value: "career", label: "진로" },
      { value: "aging", label: "나이 먹는 것" },
      { value: "uncertainty", label: "불확실한 미래" }
    ]
  }
];

export default function MZNaggingTest({ onComplete, onBack }: MZNaggingTestProps) {
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
    }, 300);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const hasTokens = await checkTokenAvailability(TOKEN_COSTS.INNER_ANIMAL);
      if (!hasTokens) {
        toast({
          title: "토큰이 부족합니다",
          description: "국밥집 이모 잔소리를 들으려면 토큰이 필요해요!",
          variant: "destructive"
        });
        return;
      }

      const success = await consumeTokens(TOKEN_COSTS.INNER_ANIMAL);
      if (!success) {
        throw new Error("토큰 차감에 실패했습니다");
      }

      // 국밥집 이모의 다양한 잔소리 결과들
      const imoNaggings = [
        {
          type: "연애 걱정형 이모",
          main_nagging: "아이고, 또 혼자가 편하다고? 요즘 애들은 왜 이렇게 혼자 있으려고 하냐? 이모가 볼 때는 좋은 사람 만나서 함께 살아야 인생이 따뜻해져. 앱으로 만난다고? 그런 식으로 만나면 진짜 마음을 어떻게 아냐? 진짜 연애 한 번 제대로 해봐. 혼자 늙어가면 쓸쓸하다고!",
          detailed_advice: "연애가 전부는 아니지만, 사람은 혼자 살 수 없어. 너무 까다롭게 굴지 말고 만나서 대화도 해보고 그래야지. 완벽한 사람은 없어. 서로 맞춰가면서 사는 거야. 그리고 부모님도 걱정하실 텐데, 좋은 사람 있으면 한 번 소개라도 해드려.",
          life_lesson: "이모가 너 나이 때는 말이야, 연애도 하고 친구들과도 어울리고 그랬어. 요즘은 모든 게 디지털이라 사람과 사람 사이가 멀어진 것 같아. 가끔은 핸드폰 내려놓고 사람들과 진짜 대화해봐.",
          worry_score: 85
        },
        {
          type: "취업 걱정형 이모",
          main_nagging: "아직도 취업 준비만 하고 있어? 이모가 볼 때는 너무 좋은 조건만 찾는 것 같아. 요즘 일자리가 어디 쉬워? 일단 들어가서 경험 쌓고 그 다음에 옮기는 것도 방법이야. 프리랜서? 그게 뭐 안정적이야? 나중에 나이 들면 어떻게 할 거야?",
          detailed_advice: "일이라는 게 처음에는 다 어려워. 그런데 하다 보면 늘어. 너무 완벽한 직장만 찾지 말고, 일단 시작해봐. 그리고 돈도 중요하지만 사람들이 어떤지도 봐야 해. 좋은 선배들 만나면 많이 배울 수 있어.",
          life_lesson: "이모도 처음 직장 다닐 때는 힘들었어. 그런데 그때 배운 게 지금까지 도움이 돼. 일은 돈 벌기 위해서도 하지만, 사회 경험 쌓는 거기도 해. 집에만 있으면 안 돼.",
          worry_score: 90
        },
        {
          type: "돈 관리 걱정형 이모",
          main_nagging: "배달음식만 시켜먹고, 카페에서 돈 쓰고... 그렇게 쓰면 언제 돈 모아? 이모가 너 나이 때는 도시락 싸 가지고 다녔어. 커피도 집에서 타서 텀블러에 가져가고. 요즘 애들은 편한 것만 찾아서 문제야. 나중에 집 사고 결혼하려면 돈이 얼마나 들어가는 줄 알아?",
          detailed_advice: "한 달에 얼마 벌고 얼마 쓰는지 가계부라도 써봐. 필요한 것과 원하는 것을 구분해야 해. 가끔 맛있는 거 먹는 건 괜찮지만, 매일 그러면 안 되지. 조금씩이라도 모아놔야 나중에 급할 때 쓸 수 있어.",
          life_lesson: "돈이 전부는 아니지만, 없으면 정말 힘들어. 이모가 경험해봐서 아는데, 젊을 때 조금씩 모아놓은 게 나중에 큰 힘이 돼. 투자도 좋지만, 기본적으로 저축부터 해야지.",
          worry_score: 80
        },
        {
          type: "독립 걱정형 이모",
          main_nagging: "아직도 부모님 집에 살아? 그것도 나쁘지 않지만, 언제까지 그럴 거야? 혼자 살아봐야 진짜 철이 들어. 요리도 못 하고 빨래도 엄마가 해주고... 그러면 언제 어른이 돼? 원룸이라도 나가서 혼자 살아보는 게 좋을 것 같은데?",
          detailed_advice: "독립이 꼭 좋은 건 아니야. 부모님과 사이좋게 지낸다면 함께 사는 것도 괜찮아. 다만 집에서도 집안일 도와드리고, 용돈도 드리고 그래야지. 나중에 결혼하면 어차피 나가게 될 거니까, 미리 연습 삼아 혼자 살아보는 것도 좋고.",
          life_lesson: "이모는 일찍 독립해서 고생 많이 했어. 그런데 그때 배운 게 지금까지 도움이 돼. 요리, 청소, 돈 관리... 이런 건 누가 가르쳐주는 게 아니야. 스스로 해봐야 늘어.",
          worry_score: 70
        },
        {
          type: "건강 걱정형 이모",
          main_nagging: "밤늦게 자고 아침에 못 일어나고... 그러면 몸이 어떻게 버티겠어? 요즘 젊은 애들 보면 다 피곤해 보여. 운동도 안 하고 배달음식만 먹고... 나중에 30 넘으면 몸이 확 달라져. 지금부터 관리해야 해!",
          detailed_advice: "건강이 제일 중요해. 돈 많이 벌어도 아프면 소용없어. 규칙적으로 자고, 밥도 챙겨 먹고, 가끔은 운동도 해야지. 스트레스 받는 것도 이해하지만, 그럴 때일수록 몸 관리를 잘해야 해.",
          life_lesson: "이모도 젊을 때는 밤새고 그랬는데, 나이 들어보니까 그때 무리한 게 지금까지 영향을 줘. 젊다고 방심하지 말고, 몸 아끼면서 살아야 해. 건강해야 하고 싶은 것도 다 할 수 있어.",
          worry_score: 85
        },
        {
          type: "미래 걱정형 이모",
          main_nagging: "계획 없이 하루하루만 살면 어떡해? 5년 후, 10년 후에 뭐 하고 싶은지라도 생각해봤어? 요즘 애들은 너무 자유롭게만 살려고 해. 물론 꿈을 쫓는 것도 좋지만, 현실적인 계획도 있어야지. 나중에 후회하지 말고 지금부터 준비해야 해.",
          detailed_advice: "인생이 계획대로 되는 건 아니지만, 그래도 목표는 있어야 해. 작은 목표부터 세워봐. 이번 달, 올해, 내년... 이런 식으로 차근차근. 그리고 실패해도 괜찮아. 다시 시도하면 돼.",
          life_lesson: "이모가 너 나이 때는 앞만 보고 달렸어. 지금 생각해보면 좀 더 계획적으로 살걸 하는 아쉬움이 있어. 너는 이모보다 똑똑하니까 더 잘할 수 있을 거야. 다만 너무 조급해하지는 말고.",
          worry_score: 75
        }
      ];

      // 답변에 따른 결과 선택 로직
      let selectedNagging;
      
      if (answers.dating_status === 'single_choice' || answers.dating_status === 'given_up') {
        selectedNagging = imoNaggings[0]; // 연애 걱정형
      } else if (answers.job_situation === 'job_hunting' || answers.job_situation === 'part_time') {
        selectedNagging = imoNaggings[1]; // 취업 걱정형
      } else if (answers.money_spending === 'delivery' || answers.money_spending === 'coffee') {
        selectedNagging = imoNaggings[2]; // 돈 관리 걱정형
      } else if (answers.living_situation === 'parents' && answers.cooking_skills === 'cant_cook') {
        selectedNagging = imoNaggings[3]; // 독립 걱정형
      } else if (answers.health_habits === 'irregular' || answers.health_habits === 'no_care') {
        selectedNagging = imoNaggings[4]; // 건강 걱정형
      } else if (answers.career_goals === 'no_plan' || answers.future_worries === 'uncertainty') {
        selectedNagging = imoNaggings[5]; // 미래 걱정형
      } else {
        selectedNagging = imoNaggings[Math.floor(Math.random() * imoNaggings.length)];
      }

      onComplete(selectedNagging, 'mz_nagging');

      toast({
        title: "이모 잔소리 완성!",
        description: "국밥집 이모의 따뜻한 잔소리를 확인해보세요!"
      });

    } catch (error) {
      console.error('MZ nagging test error:', error);
      toast({
        title: "테스트 실패",
        description: "이모가 바빠서 잔소리 못해줘요. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = questions[currentQuestion]?.id ? !!answers[questions[currentQuestion].id] : false;

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-2xl border-2 border-orange-200">
        <CardContent className="flex flex-col items-center justify-center p-12 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600" />
          <h3 className="text-xl font-semibold text-center">
            {currentQuestion < questions.length - 1 
              ? "이모가 잔소리 준비 중..." 
              : "이모가 마음 정리하는 중... 🍲"
            }
          </h3>
          <p className="text-muted-foreground text-center">
            잠깐만, 이모가 따뜻한 잔소리 준비해줄게!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
        <CardHeader className="text-center space-y-4 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-t-lg">
          <Button
            variant="ghost"
            onClick={onBack}
            className="absolute left-4 top-4 text-orange-600 hover:bg-orange-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageCircle className="w-8 h-8 text-orange-600 animate-bounce" />
            <CardTitle className="text-2xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              국밥집 이모의 MZ잔소리
            </CardTitle>
          </div>
          <p className="text-muted-foreground">
            🍲 이모가 요즘 애들 걱정해서 해주는 따뜻한 잔소리입니다
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
            <h3 className="text-lg font-semibold mb-6 text-center text-orange-800">
              {questions[currentQuestion]?.question}
            </h3>

            <RadioGroup
              value={answers[questions[currentQuestion]?.id] || ""}
              onValueChange={handleAnswer}
              className="space-y-4"
            >
              {questions[currentQuestion]?.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 p-4 rounded-lg border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200">
                  <RadioGroupItem value={option.value} id={option.value} className="text-orange-600" />
                  <Label 
                    htmlFor={option.value} 
                    className="flex-1 cursor-pointer font-medium text-orange-800"
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
              className="flex items-center gap-2 border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              <ArrowLeft className="w-4 h-4" />
              이전
            </Button>

            <div className="text-center">
              <p className="text-sm text-orange-600 font-medium">
                💰 소모 토큰: {TOKEN_COSTS.INNER_ANIMAL}개 | 🍲 이모의 따뜻한 잔소리!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}