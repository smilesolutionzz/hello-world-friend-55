import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Baby, Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ParentChildPlayTestProps {
  onComplete: (result: any, testType: string) => void;
  onBack: () => void;
}

// 연령대별 질문 세트
const questionsByAge = {
  infant: [ // 0-2세
    {
      id: 1,
      question: "아기와 놀이할 때 주로 어떻게 하시나요?",
      options: [
        { value: "a", text: "아기의 반응을 관찰하며 따라합니다" },
        { value: "b", text: "제가 먼저 보여주고 따라하게 합니다" },
        { value: "c", text: "아기와 눈을 맞추며 상호작용합니다" },
        { value: "d", text: "장난감을 주고 혼자 놀도록 합니다" }
      ]
    },
    {
      id: 2,
      question: "아기가 울거나 보챌 때 어떻게 하시나요?",
      options: [
        { value: "a", text: "바로 안아주고 달래줍니다" },
        { value: "b", text: "잠시 지켜보다가 필요시 개입합니다" },
        { value: "c", text: "함께 감정을 읽어주며 위로합니다" },
        { value: "d", text: "스스로 진정하도록 기다립니다" }
      ]
    },
    {
      id: 3,
      question: "아기와의 놀이 시간은 주로?",
      options: [
        { value: "a", text: "하루 30분 미만" },
        { value: "b", text: "하루 30분~1시간" },
        { value: "c", text: "하루 1~2시간" },
        { value: "d", text: "하루 2시간 이상" }
      ]
    },
    {
      id: 4,
      question: "아기가 새로운 장난감에 관심을 보일 때?",
      options: [
        { value: "a", text: "바로 사용법을 보여줍니다" },
        { value: "b", text: "스스로 탐색하도록 지켜봅니다" },
        { value: "c", text: "함께 만지며 탐색합니다" },
        { value: "d", text: "안전만 확인하고 놔둡니다" }
      ]
    },
    {
      id: 5,
      question: "아기의 움직임 발달을 위해 주로?",
      options: [
        { value: "a", text: "자유롭게 움직이도록 공간을 만듭니다" },
        { value: "b", text: "발달 단계에 맞는 활동을 시킵니다" },
        { value: "c", text: "함께 몸을 움직이며 놀아줍니다" },
        { value: "d", text: "특별히 신경쓰지 않습니다" }
      ]
    }
  ],
  child: [ // 3-6세
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
      question: "아이와 놀이할 때 가장 중요하게 생각하는 것은?",
      options: [
        { value: "a", text: "놀이를 통한 학습과 발달" },
        { value: "b", text: "즐거운 시간과 추억 만들기" },
        { value: "c", text: "아이의 창의성과 상상력 발휘" },
        { value: "d", text: "부모-자녀 간 유대감 형성" }
      ]
    }
  ],
  school: [ // 7-12세
    {
      id: 1,
      question: "아이와 함께 시간을 보낼 때 주로?",
      options: [
        { value: "a", text: "아이가 하고 싶어하는 활동을 지지합니다" },
        { value: "b", text: "교육적으로 유익한 활동을 권유합니다" },
        { value: "c", text: "함께 의논해서 활동을 정합니다" },
        { value: "d", text: "각자 하고 싶은 일을 합니다" }
      ]
    },
    {
      id: 2,
      question: "아이가 과제나 프로젝트에서 어려움을 겪을 때?",
      options: [
        { value: "a", text: "해결책을 직접 알려줍니다" },
        { value: "b", text: "힌트를 주고 스스로 해결하게 합니다" },
        { value: "c", text: "함께 고민하며 문제를 해결합니다" },
        { value: "d", text: "완전히 독립적으로 해결하도록 합니다" }
      ]
    },
    {
      id: 3,
      question: "아이와 대화할 때 주로?",
      options: [
        { value: "a", text: "학교 생활과 성적에 대해 묻습니다" },
        { value: "b", text: "아이의 감정과 생각을 들어줍니다" },
        { value: "c", text: "하루 일과를 간단히 확인합니다" },
        { value: "d", text: "필요한 얘기만 합니다" }
      ]
    },
    {
      id: 4,
      question: "아이가 친구 관계에서 문제가 생겼을 때?",
      options: [
        { value: "a", text: "어떻게 해야 할지 조언합니다" },
        { value: "b", text: "아이의 이야기를 들어주고 공감합니다" },
        { value: "c", text: "함께 해결 방법을 생각해봅니다" },
        { value: "d", text: "스스로 해결할 수 있다고 믿습니다" }
      ]
    },
    {
      id: 5,
      question: "주말이나 방학에 아이와?",
      options: [
        { value: "a", text: "학원이나 교육 활동을 계획합니다" },
        { value: "b", text: "아이가 원하는 대로 놀게 합니다" },
        { value: "c", text: "가족 활동을 함께 합니다" },
        { value: "d", text: "각자 시간을 보냅니다" }
      ]
    },
    {
      id: 6,
      question: "아이의 관심사나 취미에 대해?",
      options: [
        { value: "a", text: "적극적으로 함께 배우고 참여합니다" },
        { value: "b", text: "격려하고 지원합니다" },
        { value: "c", text: "관심은 있지만 개입하지 않습니다" },
        { value: "d", text: "잘 모르거나 관심이 없습니다" }
      ]
    }
  ]
};

const ParentChildPlayTest = ({ onComplete, onBack }: ParentChildPlayTestProps) => {
  const [ageGroup, setAgeGroup] = useState<'infant' | 'child' | 'school' | null>(null);
  const [childAge, setChildAge] = useState<number>(3);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const questions = ageGroup ? questionsByAge[ageGroup] : [];

  const handleAgeGroupSelect = (group: 'infant' | 'child' | 'school', age: number) => {
    setAgeGroup(group);
    setChildAge(age);
  };

  const handleOptionSelect = async (value: string) => {
    setSelectedOption(value);
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);
    
    // 자동으로 다음 문항으로 이동
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedOption(newAnswers[currentQuestion + 1] || '');
      } else {
        // 마지막 문항 완료
        completeTest(newAnswers);
      }
    }, 300); // 300ms 딜레이로 선택 피드백 제공
  };

  const completeTest = async (allAnswers: Record<number, string>) => {
    setIsAnalyzing(true);
    
    try {
      const basicResult = calculateBasicResult(allAnswers);
      
      // AI 분석 요청
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-play-assessment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            answers: allAnswers,
            ageGroup,
            childAge,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('AI 분석 실패');
      }

      const { analysis } = await response.json();
      
      const result = {
        ...basicResult,
        aiAnalysis: analysis,
        ageGroup,
        childAge,
      };

      onComplete(result, 'parent_child_play');
    } catch (error) {
      console.error('분석 오류:', error);
      toast({
        title: "분석 실패",
        description: "AI 분석에 실패했습니다. 기본 결과를 표시합니다.",
        variant: "destructive",
      });
      
      // 기본 결과로 진행
      const result = calculateBasicResult(allAnswers);
      onComplete({ ...result, ageGroup, childAge }, 'parent_child_play');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateBasicResult = (allAnswers: Record<number, string>) => {
    const scores = {
      collaborative: 0,
      supportive: 0,
      directive: 0,
      observant: 0
    };

    Object.values(allAnswers).forEach((answer, index) => {
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
    });

    const maxScore = Math.max(...Object.values(scores));
    const dominantStyle = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] || 'collaborative';

    const styleDescriptions = {
      collaborative: {
        title: "협력적 놀이 파트너",
        description: "아이와 함께 아이디어를 나누며 평등한 관계로 놀이를 즐기시는 스타일입니다.",
      },
      supportive: {
        title: "지원적 안내자",
        description: "아이의 자율성을 존중하면서도 적절한 도움을 제공하는 균형잡힌 스타일입니다.",
      },
      directive: {
        title: "교육적 리더",
        description: "놀이를 통한 학습과 발달을 중요시하며, 구조화된 활동을 선호하는 스타일입니다.",
      },
      observant: {
        title: "관찰적 지지자",
        description: "아이의 자율성을 최대한 존중하며, 필요할 때만 개입하는 스타일입니다.",
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

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedOption(answers[currentQuestion - 1] || '');
    }
  };

  const progress = ageGroup ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  // 연령대 선택 화면
  if (!ageGroup) {
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
              <div className="flex items-center gap-3">
                <Baby className="w-8 h-8" />
                <CardTitle className="text-2xl">부모아동 놀이성향 체크</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-6 text-center">아이의 나이를 선택해주세요</h3>
              
              <div className="space-y-4">
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-500"
                  onClick={() => handleAgeGroupSelect('infant', 1)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">👶</div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-blue-600">영아기 (0-2세)</h4>
                        <p className="text-sm text-muted-foreground">아기의 발달과 애착 형성에 중점을 둔 평가</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-purple-500"
                  onClick={() => handleAgeGroupSelect('child', 4)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">🧒</div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-purple-600">유아기 (3-6세)</h4>
                        <p className="text-sm text-muted-foreground">상상놀이와 사회성 발달 중심 평가</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-indigo-500"
                  onClick={() => handleAgeGroupSelect('school', 8)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">👦</div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-indigo-600">학령기 (7-12세)</h4>
                        <p className="text-sm text-muted-foreground">의사소통과 관계 형성 중심 평가</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 분석 중 화면
  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-16 h-16 animate-spin text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">AI 분석 중...</h3>
            <p className="text-muted-foreground">
              답변을 바탕으로 맞춤형 피드백을 생성하고 있습니다
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                onValueChange={handleOptionSelect}
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
                    onClick={() => handleOptionSelect(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
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

            {/* 이전 버튼 */}
            {currentQuestion > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                이전 질문
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 안내 문구 */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ 안내:</strong> 이 체크는 부모와 아이의 놀이 상호작용 스타일을 이해하기 위한 참고 자료입니다. 
              답변을 선택하면 자동으로 다음 질문으로 넘어갑니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentChildPlayTest;
