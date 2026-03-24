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
    id: "husband_daily_behavior",
    question: "평소 남편 행동은?",
    options: [
      { value: "phone_zombie", label: "집에서 계속 핸드폰만 봄" },
      { value: "tv_addict", label: "TV 보면서 누워있기만 함" },
      { value: "friends_first", label: "친구들과 노는 게 우선" },
      { value: "helpful", label: "나름 도와주려고 함" },
      { value: "workaholic", label: "일만 하고 집에 안 옴" }
    ]
  },
  {
    id: "housework_division",
    question: "집안일 분담은 어떤가?",
    options: [
      { value: "wife_all", label: "아내가 거의 다 함" },
      { value: "husband_some", label: "남편이 조금 도움" },
      { value: "equal", label: "반반 나눠서 함" },
      { value: "argue_always", label: "매번 싸우면서 함" },
      { value: "nobody", label: "둘 다 안 해서 집이 엉망" }
    ]
  },
  {
    id: "money_control",
    question: "돈 관리는 누가?",
    options: [
      { value: "wife_strict", label: "아내가 철저히 관리" },
      { value: "husband_waste", label: "남편이 막 써버림" },
      { value: "separate", label: "각자 알아서" },
      { value: "always_fight", label: "돈 때문에 맨날 싸움" },
      { value: "no_money", label: "관리할 돈이 없음" }
    ]
  },
  {
    id: "mother_in_law",
    question: "시어머니와 관계는?",
    options: [
      { value: "nightmare", label: "완전 지옥" },
      { value: "interferes", label: "자꾸 간섭함" },
      { value: "okay", label: "그럭저럭 괜찮음" },
      { value: "far_away", label: "멀리 살아서 상관없음" },
      { value: "husband_mama_boy", label: "남편이 마마보이임" }
    ]
  },
  {
    id: "sex_life",
    question: "부부생활은... (솔직히)",
    options: [
      { value: "dead", label: "완전 끝남" },
      { value: "rare", label: "가끔씩" },
      { value: "one_sided", label: "한쪽만 원함" },
      { value: "good", label: "좋은 편" },
      { value: "different_needs", label: "서로 원하는 게 달라" }
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
    id: "future_plan",
    question: "앞으로 어떻게 될 것 같나?",
    options: [
      { value: "divorce_thinking", label: "이혼 생각 중" },
      { value: "will_improve", label: "좋아질 것 같음" },
      { value: "same_fights", label: "계속 같은 싸움 반복" },
      { value: "couples_therapy", label: "상담 받을 생각" },
      { value: "give_up", label: "그냥 포기하고 살 예정" }
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
    
    // 즉시 다음 문항으로 이동
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
    setIsLoading(true);
    try {
      const hasTokens = await checkTokenAvailability(TOKEN_COSTS.INNER_ANIMAL);
      if (!hasTokens) {
        toast({
          title: "캐시가 부족합니다",
          description: "욕쟁이 할아버지 진단을 받으려면 캐시가 필요해요!",
          variant: "destructive"
        });
        return;
      }

      const success = await consumeTokens(TOKEN_COSTS.INNER_ANIMAL);
      if (!success) {
        throw new Error("캐시 차감에 실패했습니다");
      }

      // 아이 유무 확인
      const hasKids = answers.kids_reaction !== 'no_kids';

      // 할아버지의 더 강력하고 웃긴 진단 결과들 (아이 유무에 따라 다른 메시지)
      const grandpaAnalyses = [
        {
          verdict: "남편 완전 쓰레기급",
          grandpa_rant: hasKids 
            ? "야 이 개새끼야! 아내가 죽어나가는데 너는 소파에서 핸드폰만 보고 있냐? 피곤하다고? 니가 뭘 해봤다고 피곤해? 아내는 24시간 일하는데 너는 회사에서 놀다 와서 집에서도 놀고... 이런 놈은 아예 결혼하지 말았어야 해! 당장 무릎 꿇고 빌어! 아니면 집에서 나가!"
            : "야 이 개새끼야! 아내가 죽어나가는데 너는 소파에서 핸드폰만 보고 있냐? 피곤하다고? 니가 뭘 해봤다고 피곤해? 아내는 하루종일 일하는데 너는 회사에서 놀다 와서 집에서도 놀고... 이런 놈은 아예 결혼하지 말았어야 해! 당장 무릎 꿇고 빌어!",
          detailed_analysis: hasKids 
            ? "이 남편은 인간 쓰레기 수준이야. 아내가 혼자 애 키우고 집안일 다 하는데 '몰랐다'고? 개소리지! 눈 달린 곳이 어디야? 게다가 시어머니까지 편들고... 완전 마마보이네. 이런 놈은 아내 없으면 혼자 살지도 못할 거야. 부끄러운 줄 알아라!"
            : "이 남편은 인간 쓰레기 수준이야. 아내가 혼자 집안일 다 하는데 '몰랐다'고? 개소리지! 눈 달린 곳이 어디야? 게다가 시어머니까지 편들고... 완전 마마보이네. 이런 놈은 아내 없으면 혼자 살지도 못할 거야. 부끄러운 줄 알아라!",
          solution: hasKids 
            ? "남편아, 당장 아내한테 가서 발가락까지 핥으면서 사과해. 그리고 앞으로 집안일 70% 이상 너가 해. 아내는 이미 충분히 했어. 시어머니한테도 아내 편들고, 친구들과 노는 시간 전부 끊어. 가족이 우선이야, 이 바보야!"
            : "남편아, 당장 아내한테 가서 발가락까지 핥으면서 사과해. 그리고 앞으로 집안일 70% 이상 너가 해. 아내는 이미 충분히 했어. 시어머니한테도 아내 편들고, 친구들과 노는 시간 전부 끊어. 아내가 우선이야, 이 바보야!",
          blame_percentage: { husband: 95, wife: 5 }
        },
        {
          verdict: "남편이 핸드폰 중독자",
          grandpa_rant: "야 이 핸드폰 좀비야! 집에 와서도 핸드폰, 화장실에서도 핸드폰, 밥 먹으면서도 핸드폰... 아내가 말해도 '응응' 하면서 핸드폰만 봐? 니가 핸드폰이랑 결혼했냐? 아내는 가구 취급하고! 이런 놈은 핸드폰 뺏어버려야 해!",
          detailed_analysis: hasKids 
            ? "요즘 남편들 문제가 이거야. SNS, 게임, 유튜브에 빠져서 현실을 못 봐. 아내가 우울해하고 아이가 아빠 관심 끌려고 애쓰는데도 모르고 있어. 이런 식으로 살면 나중에 가족 다 떠나가."
            : "요즘 남편들 문제가 이거야. SNS, 게임, 유튜브에 빠져서 현실을 못 봐. 아내가 우울해하고 관심 끌려고 애쓰는데도 모르고 있어. 이런 식으로 살면 나중에 아내가 떠나가.",
          solution: hasKids 
            ? "핸드폰 시간 정해놓고 써라. 집에서는 가족 시간이 우선이야. 아내랑 대화하고, 아이랑 놀아줘. 핸드폰보다 중요한 게 눈앞에 있다고!"
            : "핸드폰 시간 정해놓고 써라. 집에서는 부부 시간이 우선이야. 아내랑 대화하고 같이 시간 보내. 핸드폰보다 중요한 게 눈앞에 있다고!",
          blame_percentage: { husband: 80, wife: 20 }
        },
        {
          verdict: "아내가 폭발한 이유 있음",
          grandpa_rant: hasKids 
            ? "아내야, 화낼 만했어. 이 바보 남편이 도대체 뭘 해줬는지 모르겠네. 집안일은 다 아내가 하고, 육아도 다 아내가 하고... 남편은 월급쟁이 역할만 하면 끝인 줄 아나 봐. 그래도 애 앞에서는 좀 참았어야지. 근데 이해한다!"
            : "아내야, 화낼 만했어. 이 바보 남편이 도대체 뭘 해줬는지 모르겠네. 집안일은 다 아내가 하고... 남편은 월급쟁이 역할만 하면 끝인 줄 아나 봐. 화낼 만해! 이해한다!",
          detailed_analysis: hasKids 
            ? "이 아내는 혼자서 다 해왔어. 그런데 남편은 고마운 줄도 모르고 '나도 힘들어'라고 하니까 폭발한 거지. 당연해! 하지만 아이한테는 미안한 일이야. 아이는 죄가 없거든."
            : "이 아내는 혼자서 다 해왔어. 그런데 남편은 고마운 줄도 모르고 '나도 힘들어'라고 하니까 폭발한 거지. 당연해! 남편이 정신 차려야 해.",
          solution: hasKids 
            ? "남편은 각성해라. 아내는 앞으로 좀 더 직접적으로 말해줘. '도와줘'가 아니라 '네가 해'라고 해. 그리고 둘 다 아이한테 사과하고!"
            : "남편은 각성해라. 아내는 앞으로 좀 더 직접적으로 말해줘. '도와줘'가 아니라 '네가 해'라고 해.",
          blame_percentage: { husband: 75, wife: 25 }
        },
        {
          verdict: "둘 다 정신 차려",
          grandpa_rant: hasKids 
            ? "야 너희들 정신 차려! 결혼할 때는 언제고 지금은 왜 이래? 서로 사랑해서 결혼했잖아! 돈 때문에 싸우고, 집안일 때문에 싸우고... 애는 뭐 죄야? 부모가 맨날 싸우면 아이가 어떻게 자라겠어? 정신 차리고 화해해라!"
            : "야 너희들 정신 차려! 결혼할 때는 언제고 지금은 왜 이래? 서로 사랑해서 결혼했잖아! 돈 때문에 싸우고, 집안일 때문에 싸우고... 이런 식으로 살면 행복해질 수 없어! 정신 차리고 화해해라!",
          detailed_analysis: hasKids 
            ? "이 부부는 둘 다 원점으로 돌아가야 해. 왜 결혼했는지, 왜 아이를 낳았는지 다시 생각해봐. 작은 일로 싸우면서 큰 것들을 놓치고 있어. 가족이 제일 소중한 거 아냐?"
            : "이 부부는 둘 다 원점으로 돌아가야 해. 왜 결혼했는지 다시 생각해봐. 작은 일로 싸우면서 큰 것들을 놓치고 있어. 서로가 제일 소중한 거 아냐?",
          solution: hasKids 
            ? "둘 다 초심으로 돌아가라. 서로에게 고마워하는 마음 잃지 말고, 아이를 위해서라도 화목하게 살아. 부부싸움은 칼로 물 베기지만 아이한테는 큰 상처야."
            : "둘 다 초심으로 돌아가라. 서로에게 고마워하는 마음 잃지 말고 화목하게 살아. 지금 안 변하면 나중에 후회해.",
          blame_percentage: { husband: 50, wife: 50 }
        },
        {
          verdict: "남편이 마마보이",
          grandpa_rant: "이 마마보이 새끼야! 시어머니가 뭐라고 하면 바로 아내 탓하고... 누구편이야? 결혼하면 아내가 1순위야, 이 바보야! 시어머니 말이 무조건 맞다고 생각하는 거 자체가 병이야. 아내가 힘들어하는데 엄마 편만 들고... 이런 놈은 엄마랑 살아라!",
          detailed_analysis: "마마보이는 치료가 안 돼. 30, 40이 되어서도 엄마 말이 법이라고 생각해. 아내는 바깥사람 취급하고... 이런 남자랑 사는 여자들이 진짜 불쌍해. 독립을 못 한 거야, 정신적으로.",
          solution: "남편아, 이제 어른이야. 엄마 말보다 아내 말을 먼저 들어. 시어머니한테도 아내 편을 들어줘야 해. 그게 진짜 남자야. 계속 마마보이로 살면 아내가 떠날 거야.",
          blame_percentage: { husband: 90, wife: 5, mother_in_law: 5 }
        },
        {
          verdict: "부부생활도 망했네",
          grandpa_rant: "야 너희들 부부생활은 어떻게 되는 거야? 서로 등 돌리고 자고... 이런 식으로 살면 부부가 아니라 룸메이트지! 남편은 관심 없고, 아내는 거부하고... 이런 게 결혼생활이냐? 서로 노력해야지!",
          detailed_analysis: "부부생활이 없으면 진짜 문제야. 이건 사랑의 표현이기도 하고 스트레스 해소이기도 해. 둘 다 너무 바쁘고 피곤하다는 핑계로 서로를 외면하고 있어. 이런 식으로 가면 정말 남남이 될 거야.",
          solution: hasKids 
            ? "둘 다 노력해. 로맨스가 죽으면 부부관계도 죽어. 가끔은 데이트도 하고 서로 신경 써줘. 아이도 중요하지만 부부관계가 먼저야!"
            : "둘 다 노력해. 로맨스가 죽으면 부부관계도 죽어. 가끔은 데이트도 하고 서로 신경 써줘. 부부관계가 제일 중요해!",
          blame_percentage: { husband: 60, wife: 40 }
        },
        {
          verdict: "심각하게 고민해봐",
          grandpa_rant: hasKids 
            ? "야 너희들 진짜 답이 없다. 매일 싸우고, 아이 앞에서 소리지르고, 서로 미워하고... 이런 식으로 살 바에야 진지하게 고민해봐! 아이한테 이런 환경보다 차라리 좋은 이별이 나을 수도 있어. 부부상담도 안 받고, 노력도 안 하고... 포기한 거 같은데?"
            : "야 너희들 진짜 답이 없다. 매일 싸우고, 서로 미워하고... 이런 식으로 살 바에야 진지하게 고민해봐! 부부상담도 안 받고, 노력도 안 하고... 포기한 거 같은데?",
          detailed_analysis: hasKids 
            ? "이 부부는 이미 끝났어. 서로에 대한 사랑도 없고, 존중도 없고, 그냥 습관으로 사는 거야. 아이만 불쌍해. 이런 환경에서 자라면 아이도 결혼에 대해 부정적으로 생각할 거야."
            : "이 부부는 이미 끝났어. 서로에 대한 사랑도 없고, 존중도 없고, 그냥 습관으로 사는 거야. 이런 식으로 시간만 끄는 게 뭔 의미가 있어?",
          solution: hasKids 
            ? "마지막으로 부부상담 받아봐. 그래도 안 되면 깔끔하게 정리하는 것도 방법이야. 아이를 위해서라도 좋은 결정을 해. 미워하면서 사는 것보다 낫지."
            : "마지막으로 부부상담 받아봐. 그래도 안 되면 깔끔하게 정리하는 것도 방법이야. 미워하면서 사는 것보다 낫지.",
          blame_percentage: { husband: 50, wife: 50 }
        }
      ];

      // 답변에 따른 더 정교한 결과 선택 로직
      let selectedAnalysis;
      
      // 남편이 핸드폰만 보거나 TV만 본다면
      if (answers.husband_daily_behavior === 'phone_zombie' || answers.husband_daily_behavior === 'tv_addict') {
        selectedAnalysis = grandpaAnalyses[1]; // 핸드폰 중독자
      }
      // 마마보이인 경우
      else if (answers.mother_in_law === 'husband_mama_boy' || 
               (answers.mother_in_law === 'interferes' && answers.who_started === 'wife')) {
        selectedAnalysis = grandpaAnalyses[4]; // 마마보이
      }
      // 부부생활이 끝난 경우
      else if (answers.sex_life === 'dead' && answers.future_plan === 'divorce_thinking') {
        selectedAnalysis = grandpaAnalyses[6]; // 그냥 이혼해라
      }
      // 남편이 아무것도 안 하는 경우
      else if (answers.housework_division === 'wife_all' && 
               answers.husband_excuse === 'tired' && 
               answers.husband_daily_behavior !== 'helpful') {
        selectedAnalysis = grandpaAnalyses[0]; // 남편 완전 쓰레기급
      }
      // 아내가 폭발한 경우
      else if (answers.wife_reaction === 'explosive' && 
               answers.housework_division === 'wife_all') {
        selectedAnalysis = grandpaAnalyses[2]; // 폭발한 이유 있음
      }
      // 부부생활 문제가 있는 경우
      else if (answers.sex_life === 'dead' || answers.sex_life === 'one_sided') {
        selectedAnalysis = grandpaAnalyses[5]; // 부부생활도 망했네
      }
      // 아이 앞에서 싸운 경우
      else if (answers.kids_reaction === 'hide' || answers.kids_reaction === 'interfere') {
        selectedAnalysis = grandpaAnalyses[3]; // 둘 다 치매 걸렸나
      }
      // 기본적으로 랜덤
      else {
        selectedAnalysis = grandpaAnalyses[Math.floor(Math.random() * grandpaAnalyses.length)];
      }

      onComplete(selectedAnalysis, 'grandpa_marriage');

      toast({
        title: "할아버지 분석 완료!",
        description: "할아버지의 독설을 확인해보세요!"
      });

    } catch (error) {
      console.error('Grandpa marriage diagnosis error:', error);
      toast({
        title: "분석 실패",
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
                💰 소모 캐시: {TOKEN_COSTS.INNER_ANIMAL * 100}원 | 👴 할아버지가 제대로 판단해드려요!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}