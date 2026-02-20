import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface LifeAchievementTestProps {
  onComplete: (result: any, testType: string) => void;
  onBack: () => void;
}

const achievementsKo = [
  {
    id: 'career', title: '💼 경력 & 커리어',
    questions: [
      { q: '현재 직업/일에 만족하시나요?', options: [
        { text: '매우 만족 (내 꿈의 직업이에요)', value: 100 }, { text: '만족 (안정적이고 괜찮아요)', value: 75 },
        { text: '보통 (그저 그래요)', value: 50 }, { text: '불만족 (바꾸고 싶어요)', value: 25 }, { text: '매우 불만족 또는 무직', value: 0 }
      ]},
      { q: '원하는 연봉/수입을 달성했나요?', options: [
        { text: '목표 이상 달성', value: 100 }, { text: '거의 달성 (80% 이상)', value: 75 },
        { text: '절반 정도', value: 50 }, { text: '아직 멀었어요', value: 25 }, { text: '전혀 아님', value: 0 }
      ]}
    ]
  },
  {
    id: 'family', title: '👨‍👩‍👧 가족 & 연애',
    questions: [
      { q: '결혼/연애 상태는?', options: [
        { text: '행복한 결혼 생활 중', value: 100 }, { text: '좋은 연인과 교제 중', value: 80 },
        { text: '결혼했지만 평범해요', value: 60 }, { text: '솔로지만 괜찮아요', value: 40 }, { text: '외롭고 힘들어요', value: 0 }
      ]},
      { q: '자녀 계획은 어떤가요?', options: [
        { text: '원하는 만큼 낳았어요', value: 100 }, { text: '계획대로 진행 중', value: 75 },
        { text: '고민 중이에요', value: 50 }, { text: '아직 계획 없음', value: 25 }, { text: '해당 없음', value: 50 }
      ]}
    ]
  },
  {
    id: 'finance', title: '💰 재정 & 자산',
    questions: [
      { q: '내 집 마련은?', options: [
        { text: '집 있고 대출도 없어요', value: 100 }, { text: '집 있지만 대출 있어요', value: 75 },
        { text: '전세/월세 살아요', value: 30 }, { text: '부모님 집에 살아요', value: 10 }, { text: '주거가 불안정해요', value: 0 }
      ]},
      { q: '비상금/저축은?', options: [
        { text: '1년 이상 생활 가능', value: 100 }, { text: '6개월 정도 가능', value: 75 },
        { text: '3개월 정도', value: 50 }, { text: '거의 없어요', value: 25 }, { text: '빚이 있어요', value: 0 }
      ]}
    ]
  },
  {
    id: 'health', title: '🏃 건강 & 체력',
    questions: [
      { q: '규칙적인 운동을 하시나요?', options: [
        { text: '주 5회 이상 운동해요', value: 100 }, { text: '주 3-4회 운동해요', value: 75 },
        { text: '주 1-2회 정도', value: 50 }, { text: '거의 안 해요', value: 25 }, { text: '전혀 안 해요', value: 0 }
      ]},
      { q: '건강 상태는 어떤가요?', options: [
        { text: '매우 건강해요', value: 100 }, { text: '건강한 편이에요', value: 75 },
        { text: '보통이에요', value: 50 }, { text: '약간 안 좋아요', value: 25 }, { text: '건강이 많이 안 좋아요', value: 0 }
      ]}
    ]
  },
  {
    id: 'hobby', title: '🎨 취미 & 여가',
    questions: [
      { q: '취미 생활을 즐기시나요?', options: [
        { text: '열정적으로 즐겨요', value: 100 }, { text: '꾸준히 즐겨요', value: 75 },
        { text: '가끔 해요', value: 50 }, { text: '거의 못 해요', value: 25 }, { text: '취미가 없어요', value: 0 }
      ]},
      { q: '여행은 자주 가시나요?', options: [
        { text: '자주 가요 (분기 1회 이상)', value: 100 }, { text: '1년에 2-3번', value: 75 },
        { text: '1년에 1번 정도', value: 50 }, { text: '거의 못 가요', value: 25 }, { text: '전혀 못 가요', value: 0 }
      ]}
    ]
  },
  {
    id: 'social', title: '👥 인간관계',
    questions: [
      { q: '친구 관계는 어떤가요?', options: [
        { text: '친한 친구 5명 이상', value: 100 }, { text: '친한 친구 3-4명', value: 75 },
        { text: '친한 친구 1-2명', value: 50 }, { text: '친구가 거의 없어요', value: 25 }, { text: '외로워요', value: 0 }
      ]},
      { q: '가족 관계는 좋으신가요?', options: [
        { text: '매우 좋아요', value: 100 }, { text: '좋은 편이에요', value: 75 },
        { text: '보통이에요', value: 50 }, { text: '안 좋아요', value: 25 }, { text: '단절 상태에요', value: 0 }
      ]}
    ]
  }
];

const achievementsEn = [
  {
    id: 'career', title: '💼 Career',
    questions: [
      { q: 'Are you satisfied with your current job?', options: [
        { text: 'Very satisfied (dream job)', value: 100 }, { text: 'Satisfied (stable and fine)', value: 75 },
        { text: 'Average', value: 50 }, { text: 'Dissatisfied (want to change)', value: 25 }, { text: 'Very dissatisfied or unemployed', value: 0 }
      ]},
      { q: 'Have you achieved your desired income?', options: [
        { text: 'Exceeded my goal', value: 100 }, { text: 'Almost there (80%+)', value: 75 },
        { text: 'About half', value: 50 }, { text: 'Still far away', value: 25 }, { text: 'Not at all', value: 0 }
      ]}
    ]
  },
  {
    id: 'family', title: '👨‍👩‍👧 Family & Love',
    questions: [
      { q: 'What is your relationship status?', options: [
        { text: 'Happily married', value: 100 }, { text: 'In a great relationship', value: 80 },
        { text: 'Married but average', value: 60 }, { text: 'Single but fine', value: 40 }, { text: 'Lonely and struggling', value: 0 }
      ]},
      { q: 'How about children plans?', options: [
        { text: 'Had as many as I wanted', value: 100 }, { text: 'On track', value: 75 },
        { text: 'Thinking about it', value: 50 }, { text: 'No plans yet', value: 25 }, { text: 'Not applicable', value: 50 }
      ]}
    ]
  },
  {
    id: 'finance', title: '💰 Finance & Assets',
    questions: [
      { q: 'Do you own a home?', options: [
        { text: 'Own a home, no mortgage', value: 100 }, { text: 'Own a home with mortgage', value: 75 },
        { text: 'Renting', value: 30 }, { text: 'Living with parents', value: 10 }, { text: 'Unstable housing', value: 0 }
      ]},
      { q: 'How are your savings?', options: [
        { text: 'Can live 1+ year without income', value: 100 }, { text: 'About 6 months', value: 75 },
        { text: 'About 3 months', value: 50 }, { text: 'Almost none', value: 25 }, { text: 'In debt', value: 0 }
      ]}
    ]
  },
  {
    id: 'health', title: '🏃 Health & Fitness',
    questions: [
      { q: 'Do you exercise regularly?', options: [
        { text: '5+ times/week', value: 100 }, { text: '3-4 times/week', value: 75 },
        { text: '1-2 times/week', value: 50 }, { text: 'Rarely', value: 25 }, { text: 'Never', value: 0 }
      ]},
      { q: 'How is your health?', options: [
        { text: 'Very healthy', value: 100 }, { text: 'Mostly healthy', value: 75 },
        { text: 'Average', value: 50 }, { text: 'Somewhat poor', value: 25 }, { text: 'Very poor', value: 0 }
      ]}
    ]
  },
  {
    id: 'hobby', title: '🎨 Hobbies & Leisure',
    questions: [
      { q: 'Do you enjoy hobbies?', options: [
        { text: 'Passionately', value: 100 }, { text: 'Regularly', value: 75 },
        { text: 'Occasionally', value: 50 }, { text: 'Rarely', value: 25 }, { text: 'No hobbies', value: 0 }
      ]},
      { q: 'Do you travel often?', options: [
        { text: 'Often (quarterly+)', value: 100 }, { text: '2-3 times/year', value: 75 },
        { text: 'Once a year', value: 50 }, { text: 'Rarely', value: 25 }, { text: 'Never', value: 0 }
      ]}
    ]
  },
  {
    id: 'social', title: '👥 Relationships',
    questions: [
      { q: 'How are your friendships?', options: [
        { text: '5+ close friends', value: 100 }, { text: '3-4 close friends', value: 75 },
        { text: '1-2 close friends', value: 50 }, { text: 'Almost no friends', value: 25 }, { text: 'Lonely', value: 0 }
      ]},
      { q: 'How is your family relationship?', options: [
        { text: 'Very good', value: 100 }, { text: 'Good', value: 75 },
        { text: 'Average', value: 50 }, { text: 'Not good', value: 25 }, { text: 'Estranged', value: 0 }
      ]}
    ]
  }
];

export default function LifeAchievementTest({ onComplete, onBack }: LifeAchievementTestProps) {
  const { isEnglish } = useLanguage();
  const achievements = isEnglish ? achievementsEn : achievementsKo;
  const [currentCategory, setCurrentCategory] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});

  const category = achievements[currentCategory];
  const question = category.questions[currentQuestion];
  const totalQuestions = achievements.reduce((sum, cat) => sum + cat.questions.length, 0);
  const answeredQuestions = Object.values(answers).reduce((sum, arr) => sum + arr.length, 0);
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers };
    if (!newAnswers[category.id]) newAnswers[category.id] = [];
    newAnswers[category.id].push(value);
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestion < category.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else if (currentCategory < achievements.length - 1) {
        setCurrentCategory(currentCategory + 1);
        setCurrentQuestion(0);
      } else {
        calculateResults(newAnswers);
      }
    }, 300);
  };

  const calculateResults = (finalAnswers: Record<string, number[]>) => {
    const results = achievements.map(cat => {
      const categoryAnswers = finalAnswers[cat.id] || [];
      const avgScore = categoryAnswers.reduce((a, b) => a + b, 0) / categoryAnswers.length;
      return { category: cat.title, score: Math.round(avgScore), questions: cat.questions.length };
    });
    const totalScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const level = Math.floor(totalScore / 10) + 1;
    onComplete({ results, totalScore: Math.round(totalScore), level, timestamp: new Date().toISOString() }, 'life_achievement');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button onClick={onBack} variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {isEnglish ? 'Go Back' : '뒤로 가기'}
        </Button>

        <Card className="border-2 border-purple-200 shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="w-8 h-8" />
              <CardTitle className="text-2xl">
                {isEnglish ? 'Life Achievement Test' : '인생 업적 달성률 테스트'}
              </CardTitle>
            </div>
            <Progress value={progress} className="h-3 bg-white/30" />
            <p className="text-sm mt-2">
              {answeredQuestions} / {totalQuestions} {isEnglish ? 'completed' : '완료'}
            </p>
          </CardHeader>

          <CardContent className="p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-purple-800 mb-2">{category.title}</h3>
              <p className="text-lg text-gray-700 mb-6">{question.q}</p>
              <div className="space-y-3">
                {question.options.map((option, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border-2 transition-all cursor-pointer border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                    onClick={() => handleAnswer(option.value)}
                  >
                    <p className="text-base text-gray-700">{option.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
