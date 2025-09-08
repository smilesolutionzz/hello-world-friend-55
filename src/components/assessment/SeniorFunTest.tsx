import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Smile, Coffee } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: { value: number; text: string; emoji: string }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "젊은 시절과 지금, 가장 달라진 점은?",
    options: [
      { value: 1, text: "체력은 줄었지만 지혜는 늘었다", emoji: "🧠" },
      { value: 2, text: "예전엔 못 보던 게 다 보인다", emoji: "👁️" },
      { value: 3, text: "잔소리 실력이 프로급이 됐다", emoji: "🗣️" },
      { value: 4, text: "수면 시간이 새벽 5시로 고정됐다", emoji: "🌅" }
    ]
  },
  {
    id: 2,
    question: "요즘 젊은 세대를 보면?",
    options: [
      { value: 1, text: "대단하다! 나도 배우고 싶다", emoji: "👍" },
      { value: 2, text: "우리 때와는 참 다르네", emoji: "🤔" },
      { value: 3, text: "걱정된다... 괜찮을까?", emoji: "😰" },
      { value: 4, text: "폰만 보고 있어서 답답하다", emoji: "📱" }
    ]
  },
  {
    id: 3,
    question: "가장 자랑스러운 순간은?",
    options: [
      { value: 1, text: "자식들이 잘 컸을 때", emoji: "👨‍👩‍👧‍👦" },
      { value: 2, text: "손자 손녀 처음 봤을 때", emoji: "👶" },
      { value: 3, text: "새로운 취미를 시작했을 때", emoji: "🎨" },
      { value: 4, text: "스마트폰을 정복했을 때", emoji: "📲" }
    ]
  },
  {
    id: 4,
    question: "건강 관리의 비결은?",
    options: [
      { value: 1, text: "매일 산책이 최고야!", emoji: "🚶‍♂️" },
      { value: 2, text: "좋은 음식을 골고루", emoji: "🥗" },
      { value: 3, text: "스트레스 받지 않기", emoji: "😌" },
      { value: 4, text: "정기검진은 필수!", emoji: "🏥" }
    ]
  },
  {
    id: 5,
    question: "은퇴 후 가장 즐거운 일은?",
    options: [
      { value: 1, text: "손자손녀와 놀아주기", emoji: "🎠" },
      { value: 2, text: "새로운 취미 생활", emoji: "🎯" },
      { value: 3, text: "여행 다니기", emoji: "✈️" },
      { value: 4, text: "늦잠 자기", emoji: "😴" }
    ]
  },
  {
    id: 6,
    question: "요즘 기술에 대한 생각은?",
    options: [
      { value: 1, text: "정말 신기하고 편리해!", emoji: "🤖" },
      { value: 2, text: "어렵지만 배워보려고", emoji: "📚" },
      { value: 3, text: "너무 빨라서 따라가기 힘들어", emoji: "💨" },
      { value: 4, text: "예전이 더 좋았는데...", emoji: "📰" }
    ]
  },
  {
    id: 7,
    question: "젊은 사람들에게 해주고 싶은 말?",
    options: [
      { value: 1, text: "건강이 제일 중요해!", emoji: "💪" },
      { value: 2, text: "인생은 마라톤이야", emoji: "🏃‍♀️" },
      { value: 3, text: "가족을 소중히 해라", emoji: "👪" },
      { value: 4, text: "돈보다 사람이 먼저야", emoji: "🤝" }
    ]
  },
  {
    id: 8,
    question: "인생의 황금기는 언제였나요?",
    options: [
      { value: 1, text: "지금이 가장 편하고 좋아", emoji: "🌟" },
      { value: 2, text: "30-40대가 최고였지", emoji: "💼" },
      { value: 3, text: "매 순간이 다 소중했어", emoji: "⏰" },
      { value: 4, text: "아직 더 좋아질 거야", emoji: "🚀" }
    ]
  }
];

interface SeniorFunTestProps {
  onComplete: (results: any) => void;
  onBack: () => void;
}

export const SeniorFunTest = ({ onComplete, onBack }: SeniorFunTestProps) => {
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
    let seniorType = "";
    let description = "";
    let advice = "";
    let charm = "";

    if (totalScore >= 28) {
      seniorType = "🌈 낙천적 인생 선배";
      description = "인생을 긍정적으로 바라보는 멋진 어르신! 젊은 마음과 따뜻한 미소로 주변을 환하게 만드는 분이에요. 나이는 숫자일 뿐, 마음만은 20대!";
      advice = "💫 이런 긍정 에너지로 더 많은 사람들에게 희망을 전해주세요!";
      charm = "어디서나 인기 만점! 손자손녀들의 최고 친구";
    } else if (totalScore >= 22) {
      seniorType = "🎯 현실적 지혜왕";
      description = "경험에서 우러나온 깊은 지혜를 가진 분! 현실적이면서도 따뜻한 조언으로 가족들의 든든한 기둥 역할을 하고 계시네요.";
      advice = "📚 젊은 세대와의 소통을 늘려보시면 더욱 멋진 시니어가 되실 거예요!";
      charm = "가족들이 가장 의지하는 든든한 어른";
    } else if (totalScore >= 16) {
      seniorType = "🌱 도전하는 시니어";
      description = "새로운 것에 도전하는 용기 있는 분! 나이에 구애받지 않고 계속 배우고 성장하려는 모습이 정말 멋져요. 진정한 평생학습자!";
      advice = "🚀 호기심을 잃지 마세요. 배움에는 나이가 없어요!";
      charm = "젊은이들도 부러워하는 도전 정신";
    } else {
      seniorType = "🏠 편안함 추구형";
      description = "평온하고 안정적인 삶을 좋아하는 분! 급하지 않게, 여유롭게 인생을 즐기는 방법을 아시는 진짜 어른이에요. 내면의 평화가 느껴져요.";
      advice = "🍵 가끔은 새로운 경험도 해보시면 더욱 풍성한 인생이 될 거예요!";
      charm = "차분하고 안정감 있는 어른의 품격";
    }

    return {
      type: 'senior-fun',
      totalScore,
      seniorType,
      description,
      advice,
      charm,
      answers
    };
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 p-6">
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
            <Coffee className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-amber-700">👴👵 시니어 매력 테스트</h1>
            <Coffee className="w-8 h-8 text-amber-600" />
          </div>
          
          <p className="text-gray-600 mb-4">인생 선배님의 숨겨진 매력을 발견해보세요!</p>
          
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-amber-200 text-amber-800">
              <Smile className="w-4 h-4 mr-1" />
              즐거운 시간
            </Badge>
            <Badge variant="outline">
              {currentQuestion + 1} / {questions.length}
            </Badge>
          </div>
          
          <Progress value={progress} className="mb-6" />
        </div>

        <Card className="p-8 bg-white/80 backdrop-blur-sm border-amber-200">
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
                className="w-full p-6 h-auto text-left hover:bg-amber-50 hover:border-amber-300 transition-all"
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