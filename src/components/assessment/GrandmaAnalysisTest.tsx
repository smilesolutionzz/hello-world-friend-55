import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Zap } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: { value: number; text: string; emoji: string }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "집안일 분담은 어떻게 하나?",
    options: [
      { value: 1, text: "나 혼자 다 함... 머슴 생활", emoji: "😤" },
      { value: 2, text: "서로 알아서 척척", emoji: "✨" },
      { value: 3, text: "하기 싫은 일만 서로 미룸", emoji: "🙄" },
      { value: 4, text: "분담표 붙여놨는데 안 지킴", emoji: "📋" }
    ]
  },
  {
    id: 2,
    question: "싸울 때 누가 더 독하나?",
    options: [
      { value: 1, text: "나는 조용히 화남, 상대는 폭발", emoji: "🌋" },
      { value: 2, text: "둘 다 불꽃 튀는 성격", emoji: "🔥" },
      { value: 3, text: "나는 말발, 상대는 무시", emoji: "🗣️" },
      { value: 4, text: "둘 다 귀여운 수준", emoji: "😊" }
    ]
  },
  {
    id: 3,
    question: "상대방의 가장 짜증나는 습관은?",
    options: [
      { value: 1, text: "이불 뺏어가기", emoji: "🛏️" },
      { value: 2, text: "화장실 휴지 안 갈아끼움", emoji: "🧻" },
      { value: 3, text: "핸드폰만 봄", emoji: "📱" },
      { value: 4, text: "잔소리 끝이 없음", emoji: "🗯️" }
    ]
  },
  {
    id: 4,
    question: "먹을 것 관련 갈등은?",
    options: [
      { value: 1, text: "내 과자 몰래 먹어서 빡침", emoji: "🍪" },
      { value: 2, text: "매운 거 VS 안 매운 거 전쟁", emoji: "🌶️" },
      { value: 3, text: "배달비 아까워서 싸움", emoji: "💸" },
      { value: 4, text: "뭐 먹을지 2시간 고민", emoji: "🤔" }
    ]
  },
  {
    id: 5,
    question: "연락 스타일은?",
    options: [
      { value: 1, text: "나만 계속 톡하고 답 안 옴", emoji: "💔" },
      { value: 2, text: "둘 다 답장 느린 거북이", emoji: "🐢" },
      { value: 3, text: "초당 10톡씩 폭탄", emoji: "💣" },
      { value: 4, text: "읽씹 vs 안읽씹 갈등", emoji: "👻" }
    ]
  },
  {
    id: 6,
    question: "잠자리에서 갈등은?",
    options: [
      { value: 1, text: "코골이 vs 이갈이", emoji: "😴" },
      { value: 2, text: "에어컨 온도 조절 전쟁", emoji: "❄️" },
      { value: 3, text: "침대 자리 차지 경쟁", emoji: "🛏️" },
      { value: 4, text: "한 명은 야행성, 한 명은 아침형", emoji: "🦉" }
    ]
  }
];

interface GrandmaAnalysisTestProps {
  onComplete: (results: any) => void;
  onBack: () => void;
}

export const GrandmaAnalysisTest = ({ onComplete, onBack }: GrandmaAnalysisTestProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const totalScore = newAnswers.reduce((sum, answer) => sum + answer, 0);
      const result = analyzeResults(totalScore, newAnswers);
      onComplete(result);
    }
  };

  const analyzeResults = (totalScore: number, answers: number[]) => {
    let analysisType = "";
    let grandmaComment = "";
    let harshAdvice = "";
    let percentage = 0;

    if (totalScore >= 20) {
      analysisType = "골치 아픈 커플";
      grandmaComment = "어이고야... 이 것들아, 이게 뭔 난리냐? 하루가 멀다 하고 싸우면서 왜 사냐? 근데 또 싸우고 나서 금방 붙어있으면서... 참 별 것들 다 봤네!";
      harshAdvice = "야 이것들아! 서로 좀 봐주고 살아라. 완벽한 사람이 어디 있냐? 티격태격해도 정 떨어지면 끝이야!";
      percentage = 30;
    } else if (totalScore >= 16) {
      analysisType = "중간은 가는 커플";
      grandmaComment = "그럭저럭 봐줄 만하네... 가끔 속 터지는 일 있어도 참고 사는 거지 뭐. 완전 막장은 아니고 그렇다고 완벽하지도 않고 딱 그 정도야.";
      harshAdvice = "조금만 더 노력하면 되겠는데? 서로 이해심 좀 늘리고, 잔소리 좀 줄여봐라!";
      percentage = 60;
    } else if (totalScore >= 12) {
      analysisType = "괜찮은 커플";
      grandmaComment = "어머나, 요즘 젊은이들 치고는 괜찮네? 서로 배려도 하고 챙겨주기도 하고... 그래도 가끔은 혈압 오르는 일이 있긴 하지?";
      harshAdvice = "이 정도면 장한데? 그냥 지금처럼만 살아라. 너무 완벽하려고 하지 말고!";
      percentage = 80;
    } else {
      analysisType = "신혼부부급 커플";
      grandmaComment = "뭐야 이것들... 아직도 신혼이야? 서로 얼마나 잘 맞춰주길래... 할머니가 봐도 보기 좋네. 근데 너무 달달하면 충치 생겨!";
      harshAdvice = "야, 너희들 부럽다! 그냥 지금 이대로만 가면 돼. 근데 가끔은 혼내기도 해야 한다고!";
      percentage = 95;
    }

    return {
      type: 'grandma-analysis',
      totalScore,
      analysisType,
      grandmaComment,
      harshAdvice,
      percentage,
      answers
    };
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 p-6">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="absolute left-6 top-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로
          </Button>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl">👵</span>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              할머니의 독설 커플 진단
            </h1>
            <span className="text-4xl">💥</span>
          </div>
          
          <p className="text-gray-600 mb-4">
            촌철살인 욕쟁이 할머니가 너희 커플 상태를 팩트로 분석해준다!
          </p>
          
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="destructive" className="bg-red-500">
              <Zap className="w-4 h-4 mr-1" />
              독설 주의
            </Badge>
            <Badge variant="outline">
              {currentQuestion + 1} / {questions.length}
            </Badge>
          </div>
          
          <Progress value={progress} className="mb-6" />
        </div>

        <Card className="p-8 bg-white/80 backdrop-blur-sm border-orange-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Q{currentQuestion + 1}. {questions[currentQuestion].question}
            </h2>
          </div>

          <div className="space-y-4">
            {questions[currentQuestion].options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full p-6 h-auto text-left hover:bg-orange-50 hover:border-orange-300 transition-all"
                onClick={() => handleAnswer(option.value)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-lg">{option.text}</span>
                </div>
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};