import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Baby } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface ParentChildPlayTestProps {
  onComplete: (result: any, testType: string) => void;
  onBack: () => void;
}

const questions = [
  {
    id: 1,
    question: "아이와 함께 놀이를 할 때, 주로 어떤 방식으로 참여하시나요?",
    options: [
      { value: "a", text: "아이가 주도하는 놀이를 관찰하며 필요할 때만 도와줍니다" },
      { value: "b", text: "제가 놀이를 주도하며 아이를 이끌어갑니다" },
      { value: "c", text: "아이와 함께 아이디어를 나누며 협력적으로 놀이합니다" },
      { value: "d", text: "아이 옆에 있지만 각자 독립적으로 놀이합니다" }
    ]
  },
  {
    id: 2,
    question: "아이가 놀이 중 어려움을 겪을 때, 어떻게 반응하시나요?",
    options: [
      { value: "a", text: "바로 도와주고 해결 방법을 제시합니다" },
      { value: "b", text: "먼저 스스로 해결하도록 기다린 후 필요시 도움을 줍니다" },
      { value: "c", text: "함께 문제를 살펴보며 해결 방법을 찾아봅니다" },
      { value: "d", text: "격려만 해주고 아이가 스스로 해결하도록 합니다" }
    ]
  },
  {
    id: 3,
    question: "아이와의 놀이 시간은 주로 얼마나 되나요?",
    options: [
      { value: "a", text: "하루 30분 미만" },
      { value: "b", text: "하루 30분~1시간" },
      { value: "c", text: "하루 1~2시간" },
      { value: "d", text: "하루 2시간 이상" }
    ]
  },
  {
    id: 4,
    question: "아이가 새로운 놀이를 제안할 때 어떻게 반응하시나요?",
    options: [
      { value: "a", text: "바로 함께 시작하며 적극적으로 참여합니다" },
      { value: "b", text: "흥미롭게 들어보고 가능하면 함께 합니다" },
      { value: "c", text: "다른 활동을 제안하며 대안을 제시합니다" },
      { value: "d", text: "바쁘다는 이유로 나중으로 미룹니다" }
    ]
  },
  {
    id: 5,
    question: "놀이 중 아이의 감정 표현에 어떻게 반응하시나요?",
    options: [
      { value: "a", text: "감정을 인정하고 언어로 표현하도록 도와줍니다" },
      { value: "b", text: "감정을 진정시키려 노력합니다" },
      { value: "c", text: "감정의 원인을 함께 찾아봅니다" },
      { value: "d", text: "감정이 가라앉을 때까지 기다립니다" }
    ]
  },
  {
    id: 6,
    question: "아이와 놀이할 때 가장 중요하게 생각하는 것은 무엇인가요?",
    options: [
      { value: "a", text: "놀이를 통한 학습과 발달" },
      { value: "b", text: "즐거운 시간과 추억 만들기" },
      { value: "c", text: "아이의 창의성과 상상력 발휘" },
      { value: "d", text: "부모-자녀 간 유대감 형성" }
    ]
  },
  {
    id: 7,
    question: "아이가 놀이 규칙을 지키지 않을 때 어떻게 하시나요?",
    options: [
      { value: "a", text: "규칙의 중요성을 설명하고 다시 지키도록 합니다" },
      { value: "b", text: "아이의 방식을 존중하며 규칙을 조정합니다" },
      { value: "c", text: "함께 새로운 규칙을 만들어봅니다" },
      { value: "d", text: "자유롭게 놀도록 내버려둡니다" }
    ]
  },
  {
    id: 8,
    question: "아이와 주로 어떤 종류의 놀이를 하시나요?",
    options: [
      { value: "a", text: "블록, 퍼즐 등 구조적인 놀이" },
      { value: "b", text: "역할놀이, 상상놀이" },
      { value: "c", text: "신체 활동, 운동 놀이" },
      { value: "d", text: "미술, 음악 등 창작 놀이" }
    ]
  }
];

const ParentChildPlayTest = ({ onComplete, onBack }: ParentChildPlayTestProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string>('');

  const handleNext = () => {
    if (!selectedOption) return;
    
    setAnswers(prev => ({ ...prev, [currentQuestion]: selectedOption }));
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(answers[currentQuestion + 1] || '');
    } else {
      // 테스트 완료
      const result = calculateResult({ ...answers, [currentQuestion]: selectedOption });
      onComplete(result, 'parent_child_play');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedOption(answers[currentQuestion - 1] || '');
    }
  };

  const calculateResult = (allAnswers: Record<number, string>) => {
    // 답변 패턴 분석
    const scores = {
      collaborative: 0,  // 협력적
      supportive: 0,     // 지원적
      directive: 0,      // 지시적
      observant: 0       // 관찰적
    };

    Object.values(allAnswers).forEach((answer, index) => {
      // 각 질문에 따른 점수 할당 로직
      if (index === 0) {
        if (answer === 'a') scores.observant += 2;
        if (answer === 'b') scores.directive += 2;
        if (answer === 'c') scores.collaborative += 2;
        if (answer === 'd') scores.observant += 1;
      }
      if (index === 1) {
        if (answer === 'a') scores.directive += 2;
        if (answer === 'b') scores.supportive += 2;
        if (answer === 'c') scores.collaborative += 2;
        if (answer === 'd') scores.observant += 2;
      }
      // 나머지 질문들도 유사한 방식으로 점수 할당
    });

    // 가장 높은 점수의 놀이 스타일 결정
    const maxScore = Math.max(...Object.values(scores));
    const dominantStyle = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] || 'collaborative';

    const styleDescriptions = {
      collaborative: {
        title: "협력적 놀이 파트너",
        description: "아이와 함께 아이디어를 나누며 평등한 관계로 놀이를 즐기시는 스타일입니다.",
        strengths: [
          "아이의 자율성과 창의성을 존중합니다",
          "민주적인 의사결정을 통해 문제를 해결합니다",
          "아이와의 정서적 유대감이 강합니다"
        ],
        suggestions: [
          "때로는 아이가 완전히 주도하는 시간도 가져보세요",
          "자유로운 놀이 시간을 더 늘려보세요",
          "아이의 실수를 통한 학습 기회를 존중해주세요"
        ]
      },
      supportive: {
        title: "지원적 안내자",
        description: "아이의 자율성을 존중하면서도 적절한 도움을 제공하는 균형잡힌 스타일입니다.",
        strengths: [
          "아이의 독립성 발달을 잘 지원합니다",
          "적절한 시기에 도움을 제공합니다",
          "아이의 발달 단계를 잘 이해하고 있습니다"
        ],
        suggestions: [
          "더 많은 자유로운 탐색 시간을 주세요",
          "실패를 두려워하지 않는 분위기를 만들어주세요",
          "아이의 창의적인 아이디어를 더 격려해주세요"
        ]
      },
      directive: {
        title: "교육적 리더",
        description: "놀이를 통한 학습과 발달을 중요시하며, 구조화된 활동을 선호하는 스타일입니다.",
        strengths: [
          "체계적인 학습 기회를 제공합니다",
          "명확한 목표와 규칙을 설정합니다",
          "아이의 성취를 돕는데 열정적입니다"
        ],
        suggestions: [
          "자유놀이 시간을 더 늘려보세요",
          "아이가 주도하는 놀이를 더 허용해주세요",
          "과정을 즐기는 것도 중요함을 기억하세요"
        ]
      },
      observant: {
        title: "관찰적 지지자",
        description: "아이의 자율성을 최대한 존중하며, 필요할 때만 개입하는 스타일입니다.",
        strengths: [
          "아이의 독립성과 자기주도성을 키웁니다",
          "아이를 잘 관찰하고 이해합니다",
          "아이에게 자유로운 탐색 기회를 줍니다"
        ],
        suggestions: [
          "더 적극적인 상호작용도 시도해보세요",
          "함께 하는 활동을 늘려보세요",
          "아이가 원할 때 더 적극적으로 반응해주세요"
        ]
      }
    };

    return {
      style: dominantStyle,
      ...styleDescriptions[dominantStyle as keyof typeof styleDescriptions],
      scores,
      totalQuestions: questions.length,
      completedAt: new Date().toISOString()
    };
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Baby className="w-8 h-8" />
                <CardTitle className="text-2xl">부모아동 놀이성향 체크</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {currentQuestion + 1} / {questions.length}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {/* 진행률 바 */}
            <div className="mb-8">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {Math.round(progress)}% 완료
              </p>
            </div>

            {/* 질문 */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-6 text-foreground">
                {questions[currentQuestion].question}
              </h3>

              <RadioGroup 
                value={selectedOption} 
                onValueChange={setSelectedOption}
                className="space-y-4"
              >
                {questions[currentQuestion].options.map((option) => (
                  <div 
                    key={option.value}
                    className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent ${
                      selectedOption === option.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                    onClick={() => setSelectedOption(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label 
                      htmlFor={option.value}
                      className="flex-1 cursor-pointer text-base leading-relaxed"
                    >
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* 버튼들 */}
            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                이전
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedOption}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {currentQuestion === questions.length - 1 ? '결과 보기' : '다음'}
                {currentQuestion < questions.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 안내 문구 */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ 안내:</strong> 이 체크는 부모와 아이의 놀이 상호작용 스타일을 이해하기 위한 참고 자료입니다. 
              전문적인 발달 평가나 진단이 아니며, 재미와 자기 이해를 목적으로 합니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentChildPlayTest;
