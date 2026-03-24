import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Brain, ArrowLeft, ArrowRight } from 'lucide-react';

interface IntellectualDisabilityTestProps {
  onComplete: (result: any) => void;
  onBack?: () => void;
}

const intellectualQuestions = [
  {
    id: 1,
    question: "아이가 새로운 것을 배우는 데 시간이 오래 걸리나요?",
    options: [
      { value: "1", label: "전혀 그렇지 않다" },
      { value: "2", label: "거의 그렇지 않다" },
      { value: "3", label: "보통이다" },
      { value: "4", label: "자주 그렇다" },
      { value: "5", label: "매우 자주 그렇다" }
    ]
  },
  {
    id: 2,
    question: "아이가 기억력에 어려움을 보이나요?",
    options: [
      { value: "1", label: "전혀 어려움 없다" },
      { value: "2", label: "거의 어려움 없다" },
      { value: "3", label: "보통이다" },
      { value: "4", label: "자주 어려워한다" },
      { value: "5", label: "매우 어려워한다" }
    ]
  },
  {
    id: 3,
    question: "아이가 문제 해결 능력이 또래에 비해 부족한가요?",
    options: [
      { value: "1", label: "전혀 부족하지 않다" },
      { value: "2", label: "거의 부족하지 않다" },
      { value: "3", label: "보통이다" },
      { value: "4", label: "자주 부족하다" },
      { value: "5", label: "매우 부족하다" }
    ]
  },
  {
    id: 4,
    question: "아이가 추상적인 개념을 이해하는 데 어려움이 있나요?",
    options: [
      { value: "1", label: "전혀 어려움 없다" },
      { value: "2", label: "거의 어려움 없다" },
      { value: "3", label: "보통이다" },
      { value: "4", label: "자주 어려워한다" },
      { value: "5", label: "매우 어려워한다" }
    ]
  },
  {
    id: 5,
    question: "아이가 일상생활 기술을 습득하는 데 어려움이 있나요?",
    options: [
      { value: "1", label: "전혀 어려움 없다" },
      { value: "2", label: "거의 어려움 없다" },
      { value: "3", label: "보통이다" },
      { value: "4", label: "자주 어려워한다" },
      { value: "5", label: "매우 어려워한다" }
    ]
  },
  {
    id: 6,
    question: "아이가 언어 발달이 또래에 비해 늦나요?",
    options: [
      { value: "1", label: "전혀 늦지 않다" },
      { value: "2", label: "거의 늦지 않다" },
      { value: "3", label: "보통이다" },
      { value: "4", label: "자주 늦다" },
      { value: "5", label: "매우 늦다" }
    ]
  },
  {
    id: 7,
    question: "아이가 사회적 상황을 이해하는 데 어려움이 있나요?",
    options: [
      { value: "1", label: "전혀 어려움 없다" },
      { value: "2", label: "거의 어려움 없다" },
      { value: "3", label: "보통이다" },
      { value: "4", label: "자주 어려워한다" },
      { value: "5", label: "매우 어려워한다" }
    ]
  },
  {
    id: 8,
    question: "아이가 주의 집중 시간이 짧나요?",
    options: [
      { value: "1", label: "전혀 짧지 않다" },
      { value: "2", label: "거의 짧지 않다" },
      { value: "3", label: "보통이다" },
      { value: "4", label: "자주 짧다" },
      { value: "5", label: "매우 짧다" }
    ]
  },
  {
    id: 9,
    question: "아이가 소화기능이 약하거나 식욕이 부족한가요?",
    options: [
      { value: "1", label: "전혀 그렇지 않다" },
      { value: "2", label: "거의 그렇지 않다" },
      { value: "3", label: "보통이다" },
      { value: "4", label: "자주 그렇다" },
      { value: "5", label: "매우 자주 그렇다" }
    ]
  },
  {
    id: 10,
    question: "아이가 쉽게 피로해하거나 기력이 부족한가요?",
    options: [
      { value: "1", label: "전혀 그렇지 않다" },
      { value: "2", label: "거의 그렇지 않다" },
      { value: "3", label: "보통이다" },
      { value: "4", label: "자주 그렇다" },
      { value: "5", label: "매우 자주 그렇다" }
    ]
  }
];

export const IntellectualDisabilityTest: React.FC<IntellectualDisabilityTestProps> = ({ onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(intellectualQuestions.length).fill("")); // 빈 문자열로 초기화

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < intellectualQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // 결과 계산
      const totalScore = answers.map(a => parseInt(a)).reduce((sum, score) => sum + score, 0);
      const maxScore = intellectualQuestions.length * 5;
      const percentage = (totalScore / maxScore) * 100;

      let severity = '경미';
      let recommendations = [];

      if (percentage >= 80) {
        severity = '높음';
        recommendations = [
          '두뇌 기능 활성화를 위한 집중적 한방 치료',
          '인지능력 향상과 기억력 강화 한약',
          '소화기능 개선과 영양 흡수 증진',
          '개별 맞춤 발달 촉진 프로그램'
        ];
      } else if (percentage >= 60) {
        severity = '중간';
        recommendations = [
          '정기적인 한의학적 발달 관리',
          '뇌 기능 향상과 집중력 개선 치료',
          '체력 증진과 면역력 강화',
          '가족과 함께하는 발달 지원 교육'
        ];
      } else {
        severity = '경미';
        recommendations = [
          '예방적 두뇌 발달 관리',
          '인지능력 향상을 위한 한방 케어',
          '건강한 성장 발달 촉진',
          '정기적인 발달 상태 모니터링'
        ];
      }

      const answerObj = answers.reduce((acc, val, idx) => {
        acc[intellectualQuestions[idx].id] = val;
        return acc;
      }, {} as Record<number, string>);

      const result = {
        type: 'intellectual',
        score: totalScore,
        maxScore,
        percentage: Math.round(percentage),
        severity,
        answers: answerObj,
        recommendations,
        analysis: `인지능력 관련 점수는 ${totalScore}/${maxScore}점(${Math.round(percentage)}%)입니다. 
                  한의학적으로 지능발달은 신(腎)의 정(精)과 심(心)의 신(神), 비(脾)의 운화기능과 밀접한 관련이 있습니다.
                  체질에 맞는 한방 치료를 통해 두뇌 기능 향상과 전반적인 발달 촉진이 가능합니다.`
      };

      onComplete(result);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const progress = ((currentQuestion + 1) / intellectualQuestions.length) * 100;
  const currentAnswer = answers[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-purple-500 mr-3" />
              <CardTitle className="text-2xl text-purple-800">인지능력 한방 체크</CardTitle>
            </div>
            <CardDescription className="text-lg">
              인지능력과 발달 상태를 한의학적 관점에서 분석합니다
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 진행률 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>진행률</span>
                <span>{currentQuestion + 1} / {intellectualQuestions.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* 질문 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                {intellectualQuestions[currentQuestion].question}
              </h3>

              <RadioGroup value={currentAnswer} onValueChange={handleAnswer}>
                {intellectualQuestions[currentQuestion].options.map((option) => (
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
                className="bg-purple-500 hover:bg-purple-600 text-white flex items-center"
              >
                {currentQuestion === intellectualQuestions.length - 1 ? '결과 보기' : '다음'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};