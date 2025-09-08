import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Heart, ArrowLeft, Laugh } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: { value: number; text: string; emoji: string }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "집에서 TV 리모컨을 누가 잡고 있나요?",
    options: [
      { value: 1, text: "나! 내가 채널권의 절대 황제", emoji: "👑" },
      { value: 2, text: "상대방... 난 그냥 따라만 봄", emoji: "😅" },
      { value: 3, text: "치열한 쟁탈전 매일 발생", emoji: "⚔️" },
      { value: 4, text: "평화롭게 번갈아 가며", emoji: "🕊️" }
    ]
  },
  {
    id: 2,
    question: "데이트할 때 길을 누가 찾나요?",
    options: [
      { value: 1, text: "내가 길치라서... 상대방이", emoji: "🗺️" },
      { value: 2, text: "둘 다 길치라 함께 헤맴", emoji: "🌀" },
      { value: 3, text: "내가 인간 네비게이션", emoji: "🧭" },
      { value: 4, text: "폰 네비만 믿는다", emoji: "📱" }
    ]
  },
  {
    id: 3,
    question: "치킨 먹을 때 다리 VS 날개 선호도는?",
    options: [
      { value: 1, text: "둘 다 다리파 - 평화로움", emoji: "🍗" },
      { value: 2, text: "나 다리, 상대방 날개 - 완벽", emoji: "🤝" },
      { value: 3, text: "둘 다 날개파 - 전쟁 발발", emoji: "💥" },
      { value: 4, text: "누가 더 빨리 먹나 게임", emoji: "🏃‍♂️" }
    ]
  },
  {
    id: 4,
    question: "아침에 누가 먼저 일어나나요?",
    options: [
      { value: 1, text: "나는 새벽형, 상대는 올빼미", emoji: "🌅" },
      { value: 2, text: "둘 다 잠꾸러기", emoji: "😴" },
      { value: 3, text: "눈 뜨는 순간부터 경쟁", emoji: "⏰" },
      { value: 4, text: "알람이 우리의 구세주", emoji: "📢" }
    ]
  },
  {
    id: 5,
    question: "싸웠을 때 누가 먼저 화해 신호를 보내나요?",
    options: [
      { value: 1, text: "내가 항상 먼저... 마음이 약해", emoji: "🥺" },
      { value: 2, text: "상대방이 먼저 - 나는 츤데레", emoji: "😤" },
      { value: 3, text: "둘 다 자존심 세서 시간 소요", emoji: "🐌" },
      { value: 4, text: "음식으로 화해 - 배고프면 져", emoji: "🍕" }
    ]
  },
  {
    id: 6,
    question: "서로의 가족 앞에서는?",
    options: [
      { value: 1, text: "나만 어색해함", emoji: "😳" },
      { value: 2, text: "둘 다 완전 어색", emoji: "😰" },
      { value: 3, text: "상대방만 어색해함", emoji: "😏" },
      { value: 4, text: "둘 다 자연스러움", emoji: "😊" }
    ]
  },
  {
    id: 7,
    question: "데이트 비용은?",
    options: [
      { value: 1, text: "더치페이 - 현실적", emoji: "💰" },
      { value: 2, text: "내가 주로 내는 편", emoji: "💳" },
      { value: 3, text: "상대방이 주로 내는 편", emoji: "🤲" },
      { value: 4, text: "가위바위보로 결정", emoji: "✂️" }
    ]
  },
  {
    id: 8,
    question: "커플룩에 대한 생각은?",
    options: [
      { value: 1, text: "적극 찬성! 온 세상이 알아라", emoji: "👕" },
      { value: 2, text: "은근히 좋지만 부끄러워", emoji: "😊" },
      { value: 3, text: "절대 반대 - 개성 중시", emoji: "🙅‍♂️" },
      { value: 4, text: "특별한 날에만", emoji: "🎉" }
    ]
  }
];

interface CoupleCompatibilityTestProps {
  onComplete: (results: any) => void;
  onBack: () => void;
}

export const CoupleCompatibilityTest = ({ onComplete, onBack }: CoupleCompatibilityTestProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 테스트 완료
      const totalScore = newAnswers.reduce((sum, answer) => sum + answer, 0);
      const result = analyzeResults(totalScore, newAnswers);
      onComplete(result);
    }
  };

  const analyzeResults = (totalScore: number, answers: number[]) => {
    let compatibilityType = "";
    let description = "";
    let advice = "";
    let percentage = 0;

    if (totalScore >= 28) {
      compatibilityType = "환상의 콤비 커플";
      description = "너희는 진짜 천생연분이야! 이런 케미는 로또 맞을 확률이야. 서로 다른 점도 매력으로 승화시키는 마법사들 ✨";
      advice = "💡 조언: 이대로만 쭉~ 가세요. 주변에서 부러워할 수 있으니 과시는 적당히!";
      percentage = 95;
    } else if (totalScore >= 22) {
      compatibilityType = "현실적 케미 커플";
      description = "현실적이면서도 재미있는 커플! 가끔 티격태격하지만 그게 또 매력이야. 서로의 다름을 인정하는 어른스러운 관계 👫";
      advice = "💡 조언: 가끔은 깜짝 이벤트로 상대방을 놀래켜 보세요!";
      percentage = 80;
    } else if (totalScore >= 16) {
      compatibilityType = "성장형 커플";
      description = "아직 서로를 알아가는 중인 커플! 싸우면서도 정이 들어가는 중이야. 시간이 갈수록 더 찰떡궁합이 될 예정 🌱";
      advice = "💡 조언: 서로의 취향을 더 알아가는 시간을 늘려보세요!";
      percentage = 65;
    } else {
      compatibilityType = "극과 극 매력 커플";
      description = "정반대의 매력! 자석의 S극과 N극처럼 서로 다르지만 그래서 더 끌리는 신비한 관계야. 다양성이 최고의 스파이스! 🧲";
      advice = "💡 조언: 차이점을 단점이 아닌 새로운 경험의 기회로 생각해보세요!";
      percentage = 50;
    }

    return {
      type: 'couple-compatibility',
      totalScore,
      compatibilityType,
      description,
      advice,
      percentage,
      answers
    };
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-red-100 p-6">
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
            <Heart className="w-8 h-8 text-pink-500" />
            <h1 className="text-3xl font-bold text-pink-600">💕 커플 케미 테스트</h1>
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
          
          <p className="text-gray-600 mb-4">우리의 알콩달콩 케미를 과학적으로(?) 분석해보자!</p>
          
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-pink-200 text-pink-800">
              <Laugh className="w-4 h-4 mr-1" />
              재미용
            </Badge>
            <Badge variant="outline">
              {currentQuestion + 1} / {questions.length}
            </Badge>
          </div>
          
          <Progress value={progress} className="mb-6" />
        </div>

        <Card className="p-8 bg-white/80 backdrop-blur-sm border-pink-200">
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
                className="w-full p-6 h-auto text-left hover:bg-pink-50 hover:border-pink-300 transition-all"
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