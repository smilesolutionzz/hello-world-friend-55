import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Shield, ArrowLeft, ArrowRight } from 'lucide-react';

interface AtopyTestProps {
  onComplete: (result: any) => void;
  onBack?: () => void;
}

const atopyQuestions = [
  {
    id: 1,
    question: "아이의 피부가 건조하고 거칠어지는 증상이 있나요?",
    options: [
      { value: "1", label: "전혀 없다" },
      { value: "2", label: "거의 없다" },
      { value: "3", label: "가끔 있다" },
      { value: "4", label: "자주 있다" },
      { value: "5", label: "매우 자주 있다" }
    ]
  },
  {
    id: 2,
    question: "아이가 피부 가려움으로 인해 긁는 행동을 자주 하나요?",
    options: [
      { value: "1", label: "전혀 없다" },
      { value: "2", label: "거의 없다" },
      { value: "3", label: "가끔 있다" },
      { value: "4", label: "자주 있다" },
      { value: "5", label: "매우 자주 있다" }
    ]
  },
  {
    id: 3,
    question: "특정 음식을 먹은 후 피부 증상이 악화되나요?",
    options: [
      { value: "1", label: "전혀 악화되지 않는다" },
      { value: "2", label: "거의 악화되지 않는다" },
      { value: "3", label: "가끔 악화된다" },
      { value: "4", label: "자주 악화된다" },
      { value: "5", label: "매우 자주 악화된다" }
    ]
  },
  {
    id: 4,
    question: "계절 변화나 날씨에 따라 피부 상태가 달라지나요?",
    options: [
      { value: "1", label: "전혀 달라지지 않는다" },
      { value: "2", label: "거의 달라지지 않는다" },
      { value: "3", label: "가끔 달라진다" },
      { value: "4", label: "자주 달라진다" },
      { value: "5", label: "매우 자주 달라진다" }
    ]
  },
  {
    id: 5,
    question: "아이가 스트레스를 받으면 피부 증상이 심해지나요?",
    options: [
      { value: "1", label: "전혀 심해지지 않는다" },
      { value: "2", label: "거의 심해지지 않는다" },
      { value: "3", label: "가끔 심해진다" },
      { value: "4", label: "자주 심해진다" },
      { value: "5", label: "매우 자주 심해진다" }
    ]
  },
  {
    id: 6,
    question: "아이가 밤에 가려움으로 인해 잠을 설치나요?",
    options: [
      { value: "1", label: "전혀 설치지 않는다" },
      { value: "2", label: "거의 설치지 않는다" },
      { value: "3", label: "가끔 설친다" },
      { value: "4", label: "자주 설친다" },
      { value: "5", label: "매우 자주 설친다" }
    ]
  },
  {
    id: 7,
    question: "관절 부위(팔꿈치, 무릎 뒤 등)에 발진이나 습진이 생기나요?",
    options: [
      { value: "1", label: "전혀 생기지 않는다" },
      { value: "2", label: "거의 생기지 않는다" },
      { value: "3", label: "가끔 생긴다" },
      { value: "4", label: "자주 생긴다" },
      { value: "5", label: "매우 자주 생긴다" }
    ]
  },
  {
    id: 8,
    question: "아이가 알레르기 비염이나 천식 증상도 함께 있나요?",
    options: [
      { value: "1", label: "전혀 없다" },
      { value: "2", label: "거의 없다" },
      { value: "3", label: "가끔 있다" },
      { value: "4", label: "자주 있다" },
      { value: "5", label: "매우 자주 있다" }
    ]
  },
  {
    id: 9,
    question: "아이가 소화불량이나 변비를 자주 겪나요?",
    options: [
      { value: "1", label: "전혀 겪지 않는다" },
      { value: "2", label: "거의 겪지 않는다" },
      { value: "3", label: "가끔 겪는다" },
      { value: "4", label: "자주 겪는다" },
      { value: "5", label: "매우 자주 겪는다" }
    ]
  },
  {
    id: 10,
    question: "가족 중에 아토피나 알레르기 질환을 가진 사람이 있나요?",
    options: [
      { value: "1", label: "전혀 없다" },
      { value: "2", label: "거의 없다" },
      { value: "3", label: "한 두 명 있다" },
      { value: "4", label: "여러 명 있다" },
      { value: "5", label: "많은 가족이 있다" }
    ]
  }
];

export const AtopyTest: React.FC<AtopyTestProps> = ({ onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [atopyQuestions[currentQuestion].id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < atopyQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // 결과 계산
      const totalScore = Object.values(answers).reduce((sum, score) => sum + parseInt(score), 0);
      const maxScore = atopyQuestions.length * 5;
      const percentage = (totalScore / maxScore) * 100;

      let severity = '경미';
      let recommendations = [];

      if (percentage >= 80) {
        severity = '높음';
        recommendations = [
          '피부 염증 완화와 해독을 위한 집중 한방 치료',
          '면역력 조절과 알레르기 체질 개선 한약',
          '소화기능 강화와 독소 배출 촉진',
          '생활환경 관리와 식이요법 교육'
        ];
      } else if (percentage >= 60) {
        severity = '중간';
        recommendations = [
          '정기적인 한의학적 피부 관리',
          '체질 개선과 면역력 강화 치료',
          '스트레스 완화와 수면 개선',
          '알레르기 유발 요소 관리법 교육'
        ];
      } else {
        severity = '경미';
        recommendations = [
          '예방적 체질 관리와 면역력 강화',
          '피부 건강 유지를 위한 한방 케어',
          '건강한 생활습관 형성 지원',
          '정기적인 피부 상태 모니터링'
        ];
      }

      const result = {
        type: 'atopy',
        score: totalScore,
        maxScore,
        percentage: Math.round(percentage),
        severity,
        answers,
        recommendations,
        analysis: `아토피 관련 증상 점수는 ${totalScore}/${maxScore}점(${Math.round(percentage)}%)입니다. 
                  한의학적으로 아토피는 폐(肺)의 선발기능 저하, 비위(脾胃)의 운화기능 실조, 간(肝)의 소설기능 장애와 관련이 있습니다.
                  체질에 맞는 한방 치료를 통해 근본적인 체질 개선과 면역력 조절이 가능합니다.`
      };

      onComplete(result);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const progress = ((currentQuestion + 1) / atopyQuestions.length) * 100;
  const currentAnswer = answers[atopyQuestions[currentQuestion].id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-rose-500 mr-3" />
              <CardTitle className="text-2xl text-rose-800">아토피 한방 진단</CardTitle>
            </div>
            <CardDescription className="text-lg">
              아토피 피부염 증상을 한의학적 관점에서 분석합니다
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 진행률 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>진행률</span>
                <span>{currentQuestion + 1} / {atopyQuestions.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* 질문 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                {atopyQuestions[currentQuestion].question}
              </h3>

              <RadioGroup value={currentAnswer || ""} onValueChange={handleAnswer}>
                {atopyQuestions[currentQuestion].options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="text-sm cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* 버튼 */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={currentQuestion === 0 ? onBack : handlePrevious}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {currentQuestion === 0 ? '뒤로' : '이전'}
              </Button>

              <Button
                onClick={handleNext}
                disabled={!currentAnswer}
                className="bg-rose-500 hover:bg-rose-600 text-white flex items-center"
              >
                {currentQuestion === atopyQuestions.length - 1 ? '결과 보기' : '다음'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};