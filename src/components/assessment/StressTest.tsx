import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Activity, ArrowLeft, ArrowRight } from 'lucide-react';

interface StressTestProps {
  onComplete: (result: any) => void;
  onBack?: () => void;
}

const stressQuestions = [
  {
    id: 1,
    question: "최근에 스트레스를 자주 느끼시나요?",
    options: [
      { value: "1", label: "전혀 느끼지 않는다" },
      { value: "2", label: "거의 느끼지 않는다" },
      { value: "3", label: "가끔 느낀다" },
      { value: "4", label: "자주 느낀다" },
      { value: "5", label: "매우 자주 느낀다" }
    ]
  },
  {
    id: 2,
    question: "밤에 잠들기 어려우시거나 자주 깨시나요?",
    options: [
      { value: "1", label: "전혀 그렇지 않다" },
      { value: "2", label: "거의 그렇지 않다" },
      { value: "3", label: "가끔 그렇다" },
      { value: "4", label: "자주 그렇다" },
      { value: "5", label: "매우 자주 그렇다" }
    ]
  },
  {
    id: 3,
    question: "일상생활에서 쉽게 짜증이 나거나 예민해지시나요?",
    options: [
      { value: "1", label: "전혀 그렇지 않다" },
      { value: "2", label: "거의 그렇지 않다" },
      { value: "3", label: "가끔 그렇다" },
      { value: "4", label: "자주 그렇다" },
      { value: "5", label: "매우 자주 그렇다" }
    ]
  },
  {
    id: 4,
    question: "식욕이 없거나 과식을 하는 경우가 있나요?",
    options: [
      { value: "1", label: "전혀 없다" },
      { value: "2", label: "거의 없다" },
      { value: "3", label: "가끔 있다" },
      { value: "4", label: "자주 있다" },
      { value: "5", label: "매우 자주 있다" }
    ]
  },
  {
    id: 5,
    question: "집중력이 떨어지거나 건망증이 심해졌나요?",
    options: [
      { value: "1", label: "전혀 그렇지 않다" },
      { value: "2", label: "거의 그렇지 않다" },
      { value: "3", label: "가끔 그렇다" },
      { value: "4", label: "자주 그렇다" },
      { value: "5", label: "매우 자주 그렇다" }
    ]
  },
  {
    id: 6,
    question: "두통이나 어깨 결림 등 신체적 증상이 있나요?",
    options: [
      { value: "1", label: "전혀 없다" },
      { value: "2", label: "거의 없다" },
      { value: "3", label: "가끔 있다" },
      { value: "4", label: "자주 있다" },
      { value: "5", label: "매우 자주 있다" }
    ]
  },
  {
    id: 7,
    question: "우울하거나 의욕이 없는 느낌이 드시나요?",
    options: [
      { value: "1", label: "전혀 들지 않는다" },
      { value: "2", label: "거의 들지 않는다" },
      { value: "3", label: "가끔 든다" },
      { value: "4", label: "자주 든다" },
      { value: "5", label: "매우 자주 든다" }
    ]
  },
  {
    id: 8,
    question: "소화불량이나 속 쓰림 증상이 있나요?",
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
    question: "피로감이 지속되거나 에너지가 부족하다고 느끼시나요?",
    options: [
      { value: "1", label: "전혀 그렇지 않다" },
      { value: "2", label: "거의 그렇지 않다" },
      { value: "3", label: "가끔 그렇다" },
      { value: "4", label: "자주 그렇다" },
      { value: "5", label: "매우 자주 그렇다" }
    ]
  },
  {
    id: 10,
    question: "대인관계에서 어려움을 느끼거나 회피하고 싶으신가요?",
    options: [
      { value: "1", label: "전혀 그렇지 않다" },
      { value: "2", label: "거의 그렇지 않다" },
      { value: "3", label: "가끔 그렇다" },
      { value: "4", label: "자주 그렇다" },
      { value: "5", label: "매우 자주 그렇다" }
    ]
  }
];

export const StressTest: React.FC<StressTestProps> = ({ onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [stressQuestions[currentQuestion].id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < stressQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // 결과 계산
      const totalScore = Object.values(answers).reduce((sum, score) => sum + parseInt(score), 0);
      const maxScore = stressQuestions.length * 5;
      const percentage = (totalScore / maxScore) * 100;

      let severity = '경미';
      let recommendations = [];

      if (percentage >= 80) {
        severity = '높음';
        recommendations = [
          '신경 안정과 스트레스 완화를 위한 집중 한방 치료',
          '심신 안정과 수면 개선을 위한 특수 한약',
          '소화기능 회복과 기력 보강 치료',
          '마음챙김과 스트레스 관리법 교육'
        ];
      } else if (percentage >= 60) {
        severity = '중간';
        recommendations = [
          '정기적인 한의학적 스트레스 관리',
          '정서 안정과 기력 회복 치료',
          '수면 패턴 개선과 소화기능 강화',
          '생활습관 개선과 휴식법 지도'
        ];
      } else {
        severity = '경미';
        recommendations = [
          '예방적 스트레스 관리와 체력 증진',
          '정신건강 유지를 위한 한방 케어',
          '건강한 생활리듬 형성 지원',
          '정기적인 정서 상태 모니터링'
        ];
      }

      const result = {
        type: 'stress',
        score: totalScore,
        maxScore,
        percentage: Math.round(percentage),
        severity,
        answers,
        recommendations,
        analysis: `스트레스 관련 점수는 ${totalScore}/${maxScore}점(${Math.round(percentage)}%)입니다. 
                  한의학적으로 스트레스는 간(肝)의 소설기능 실조, 심(心)의 신지기능 저하, 비위(脾胃)의 운화기능 장애와 관련이 있습니다.
                  체질에 맞는 한방 치료를 통해 정서적 안정과 전반적인 건강 회복이 가능합니다.`
      };

      onComplete(result);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const progress = ((currentQuestion + 1) / stressQuestions.length) * 100;
  const currentAnswer = answers[stressQuestions[currentQuestion].id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Activity className="h-8 w-8 text-teal-500 mr-3" />
              <CardTitle className="text-2xl text-teal-800">스트레스 한방 진단</CardTitle>
            </div>
            <CardDescription className="text-lg">
              스트레스와 정신건강 상태를 한의학적 관점에서 분석합니다
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 진행률 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>진행률</span>
                <span>{currentQuestion + 1} / {stressQuestions.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* 질문 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                {stressQuestions[currentQuestion].question}
              </h3>

              <RadioGroup value={currentAnswer} onValueChange={handleAnswer}>
                {stressQuestions[currentQuestion].options.map((option) => (
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
                className="bg-teal-500 hover:bg-teal-600 text-white flex items-center"
              >
                {currentQuestion === stressQuestions.length - 1 ? '결과 보기' : '다음'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};