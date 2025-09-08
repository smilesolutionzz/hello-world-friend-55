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

interface GrandpaMarriageDiagnosisProps {
  onComplete: (result: any, testType: string) => void;
  onBack: () => void;
}

const questions = [
  {
    id: "recent_fight",
    question: "최근에 뭐 때문에 싸웠나?",
    options: [
      { value: "housework", label: "집안일 분담 문제" },
      { value: "parenting", label: "육아 방식 차이" },
      { value: "money", label: "돈 쓰는 문제" },
      { value: "in_laws", label: "시댁/친정 문제" },
      { value: "time", label: "시간 안 내주는 문제" }
    ]
  },
  {
    id: "who_started",
    question: "누가 먼저 시비를 걸었나?",
    options: [
      { value: "wife", label: "아내가 먼저" },
      { value: "husband", label: "남편이 먼저" },
      { value: "both", label: "둘 다 동시에" },
      { value: "unknown", label: "누가 먼저인지 모르겠음" }
    ]
  },
  {
    id: "husband_excuse",
    question: "남편은 뭐라고 변명했나?",
    options: [
      { value: "tired", label: "피곤하다고 함" },
      { value: "work", label: "일이 힘들다고 함" },
      { value: "didnt_know", label: "몰랐다고 함" },
      { value: "silent", label: "조용히 있음" },
      { value: "counter_attack", label: "오히려 따지고 들었음" }
    ]
  },
  {
    id: "wife_reaction",
    question: "아내는 어떻게 반응했나?",
    options: [
      { value: "explosive", label: "폭발적으로 화냄" },
      { value: "cold", label: "차갑게 무시함" },
      { value: "crying", label: "울면서 호소함" },
      { value: "logical", label: "논리적으로 따짐" },
      { value: "gave_up", label: "포기하고 체념함" }
    ]
  },
  {
    id: "kids_reaction",
    question: "아이들은 어떻게 했나?",
    options: [
      { value: "hide", label: "무서워서 숨음" },
      { value: "interfere", label: "중간에서 말림" },
      { value: "ignore", label: "모른 척 함" },
      { value: "no_kids", label: "아직 아이 없음" },
      { value: "join_fight", label: "같이 끼어들었음" }
    ]
  },
  {
    id: "resolution",
    question: "어떻게 화해했나?",
    options: [
      { value: "husband_apologized", label: "남편이 사과함" },
      { value: "wife_apologized", label: "아내가 사과함" },
      { value: "both_apologized", label: "둘 다 사과함" },
      { value: "time_solved", label: "시간이 지나서 자연스럽게" },
      { value: "still_fighting", label: "아직도 싸우는 중" }
    ]
  },
  {
    id: "frequency",
    question: "이런 싸움이 얼마나 자주?",
    options: [
      { value: "daily", label: "거의 매일" },
      { value: "weekly", label: "일주일에 한두 번" },
      { value: "monthly", label: "한 달에 한두 번" },
      { value: "rarely", label: "가끔씩" },
      { value: "first_time", label: "이번이 처음" }
    ]
  },
  {
    id: "main_issue",
    question: "진짜 문제가 뭐라고 생각하나?",
    options: [
      { value: "communication", label: "소통 부족" },
      { value: "stress", label: "둘 다 스트레스 많음" },
      { value: "expectations", label: "서로 기대치가 다름" },
      { value: "personality", label: "성격 차이" },
      { value: "external", label: "외부 압박 (시댁, 직장 등)" }
    ]
  }
];

export default function GrandpaMarriageDiagnosis({ onComplete, onBack }: GrandpaMarriageDiagnosisProps) {
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
          description: "욕쟁이 할아버지 진단을 받으려면 토큰이 필요해요!",
          variant: "destructive"
        });
        return;
      }

      const success = await consumeTokens(TOKEN_COSTS.INNER_ANIMAL);
      if (!success) {
        throw new Error("토큰 차감에 실패했습니다");
      }

      // 할아버지의 다양한 진단 결과들
      const grandpaAnalyses = [
        {
          verdict: "완전 남편 잘못",
          grandpa_rant: "야 이 멍청한 놈아! 아내가 얼마나 힘든데 너는 뭐하고 있었냐? 피곤하다고? 그럼 아내는 안 피곤한 줄 아냐? 애 키우고 집안일 하는 게 놀이인 줄 아냐? 이런 바보 같은 남편은 처음 봤다! 당장 아내한테 가서 무릎 꿇고 사과해라!",
          detailed_analysis: "이 남편은 완전히 정신을 놓고 있어. 아내가 SOS 신호를 보내는데도 눈치도 못 채고, 오히려 자기가 힘들다고 징징거리고 있으니 어이가 없지. 특히 육아는 혼자 하는 게 아니라고! 둘이 만들어놓고 왜 혼자 키우라고 하냐? 이런 남편은 군대 다시 보내서 정신교육 시켜야 해!",
          solution: "남편아, 당장 아내한테 가서 '미안해, 내가 바보였어. 앞으로는 내가 더 도울게'라고 해라. 그리고 말만 하지 말고 실제로 행동으로 보여줘. 설거지, 빨래, 아기 기저귀 갈기 - 이런 건 기본이야! 아내가 웃을 때까지 계속 노력해라!",
          blame_percentage: { husband: 85, wife: 15 }
        },
        {
          verdict: "아내도 좀 과했다",
          grandpa_rant: "자, 아내야. 남편이 잘못한 건 맞지만 너도 좀 과격하지 않았냐? 남자들은 원래 눈치가 없어. 그걸 알고 결혼했잖아? 폭발하기 전에 차근차근 말해줘야지. 물론 남편이 더 잘못했지만 말이야. 둘 다 조금씩 양보해야 해!",
          detailed_analysis: "이 부부는 둘 다 서로를 이해하려는 노력이 부족해. 남편은 눈치가 없고, 아내는 너무 감정적으로 반응하고. 하지만 남편이 70% 잘못했어. 아내 마음을 몰라주는 게 제일 큰 문제야. 그래도 아내도 좀 더 차분하게 말할 필요가 있어.",
          solution: "남편은 미안하다고 하고, 아내는 앞으로는 화내기 전에 한 번 더 말해줘. 그리고 둘 다 육아는 팀워크라는 걸 명심해라. 혼자 하는 게 아니야!",
          blame_percentage: { husband: 70, wife: 30 }
        },
        {
          verdict: "둘 다 미쳤다",
          grandpa_rant: "야 너희들! 둘 다 뭐하는 거야? 애 앞에서 싸우면 되냐? 아이가 얼마나 무서워하는데! 남편은 눈치 없고, 아내는 폭발적이고... 이런 식으로 싸우면 아이 정서에 안 좋다고! 둘 다 반성하고 아이한테 먼저 사과해라!",
          detailed_analysis: "이 부부는 둘 다 문제가 있어. 스트레스 받는 건 이해하지만, 아이 앞에서는 절대 싸우면 안 돼. 아이는 부모가 싸우는 걸 보면 자기 잘못인 줄 알고 상처받는다고. 육아 스트레스는 서로 나눠서 해결해야지, 서로한테 화풀이하면 어떡해?",
          solution: "일단 아이한테 사과하고, 앞으로는 아이 안 보는 데서 대화해. 그리고 육아 분담표를 만들어서 확실하게 역할을 나눠라. 감정적으로 말하지 말고 차분하게!",
          blame_percentage: { husband: 50, wife: 50 }
        },
        {
          verdict: "남편 완전 개념없음",
          grandpa_rant: "이 남편 진짜 답이 없다! 아내가 울면서 호소하는데도 모른 척 하고, 오히려 따지고 들어? 이런 놈은 내가 젊었을 때 같으면 한 대 때렸을 거야! 아내 마음도 모르고 자기 변명만 늘어놓고... 이런 게 남편이냐?",
          detailed_analysis: "이 남편은 정말 심각해. 공감 능력이 제로야. 아내가 힘들어하는 걸 보면서도 '나도 힘들어'라고만 하니까 답이 없지. 이런 남편은 교육이 필요해. 아내 입장에서 생각해보는 연습부터 다시 해야 해.",
          solution: "남편아, 네가 잘못했어. 인정해라. 그리고 아내 말을 끝까지 들어줘. 변명하지 말고 일단 들어. 그 다음에 '어떻게 도와줄까?'라고 물어봐. 이게 기본이야!",
          blame_percentage: { husband: 90, wife: 10 }
        },
        {
          verdict: "그래도 사랑하는 부부",
          grandpa_rant: "야 너희들, 싸우긴 했지만 서로 사랑하는 게 보여. 다만 표현이 서툴러서 그래. 남편도 나름 노력하고 있고, 아내도 가족을 위해 힘들어하고 있고. 이런 정도면 금방 화해할 수 있어. 서로 조금만 더 배려하면 돼!",
          detailed_analysis: "이 부부는 기본적으로 서로를 사랑해. 다만 스트레스 때문에 예민해져서 작은 일로 싸운 거야. 이런 건 시간이 지나면 웃으면서 얘기할 수 있는 추억이 될 거야. 서로 노력하는 마음이 보이니까 걱정 안 해도 돼.",
          solution: "서로 고생한다고 인정해주고, 가끔은 데이트도 하고 둘만의 시간도 가져. 육아는 중요하지만 부부 관계도 중요하거든. 서로 사랑한다는 말도 자주 해!",
          blame_percentage: { husband: 45, wife: 35, external: 20 }
        }
      ];

      // 답변에 따라 결과 선택 (랜덤 + 일부 로직)
      let selectedAnalysis;
      
      if (answers.who_started === 'husband' && answers.husband_excuse !== 'silent') {
        selectedAnalysis = grandpaAnalyses[0]; // 남편 완전 잘못
      } else if (answers.wife_reaction === 'explosive' && answers.kids_reaction === 'hide') {
        selectedAnalysis = grandpaAnalyses[2]; // 둘 다 미쳤다
      } else if (answers.resolution === 'both_apologized' || answers.resolution === 'time_solved') {
        selectedAnalysis = grandpaAnalyses[4]; // 사랑하는 부부
      } else {
        selectedAnalysis = grandpaAnalyses[Math.floor(Math.random() * grandpaAnalyses.length)];
      }

      onComplete(selectedAnalysis, 'grandpa_marriage');

      toast({
        title: "할아버지 진단 완료!",
        description: "할아버지의 독설을 확인해보세요!"
      });

    } catch (error) {
      console.error('Grandpa marriage diagnosis error:', error);
      toast({
        title: "진단 실패",
        description: "할아버지가 화나셨습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = questions[currentQuestion]?.id ? !!answers[questions[currentQuestion].id] : false;

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-2xl border-2 border-blue-200">
        <CardContent className="flex flex-col items-center justify-center p-12 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <h3 className="text-xl font-semibold text-center">
            {currentQuestion < questions.length - 1 
              ? "할아버지 분석 중..." 
              : "할아버지가 누구 잘못인지 판단 중... 😤"
            }
          </h3>
          <p className="text-muted-foreground text-center">
            잠시만 기다려보세요. 할아버지가 제대로 혼내줄게요!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="text-center space-y-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-t-lg">
          <Button
            variant="ghost"
            onClick={onBack}
            className="absolute left-4 top-4 text-blue-600 hover:bg-blue-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageCircle className="w-8 h-8 text-blue-600 animate-bounce" />
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              욕쟁이 할아버지의 부부금술진단
            </CardTitle>
          </div>
          <p className="text-muted-foreground">
            👴 할아버지가 누가 잘못했는지 제대로 판단해드립니다!
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
            <h3 className="text-lg font-semibold mb-6 text-center text-blue-800">
              {questions[currentQuestion]?.question}
            </h3>

            <RadioGroup
              value={answers[questions[currentQuestion]?.id] || ""}
              onValueChange={handleAnswer}
              className="space-y-4"
            >
              {questions[currentQuestion]?.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 p-4 rounded-lg border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
                  <RadioGroupItem value={option.value} id={option.value} className="text-blue-600" />
                  <Label 
                    htmlFor={option.value} 
                    className="flex-1 cursor-pointer font-medium text-blue-800"
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
              className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4" />
              이전
            </Button>

            <div className="text-center">
              <p className="text-sm text-blue-600 font-medium">
                💰 소모 토큰: {TOKEN_COSTS.INNER_ANIMAL}개 | 👴 할아버지가 제대로 판단해드려요!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}