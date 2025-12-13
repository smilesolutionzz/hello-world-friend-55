import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const questions = [
  {
    id: 'relationship_preference',
    question: '이상적인 관계 스타일은?',
    options: [
      { value: 'passionate', label: '열정적이고 로맨틱한 관계' },
      { value: 'stable', label: '안정적이고 신뢰할 수 있는 관계' },
      { value: 'fun', label: '재미있고 자유로운 관계' },
      { value: 'deep', label: '깊이 있고 진솔한 관계' }
    ]
  },
  {
    id: 'conflict_style',
    question: '갈등 상황에서 나의 대처법은?',
    options: [
      { value: 'direct', label: '직접적으로 문제를 해결하려 함' },
      { value: 'avoid', label: '갈등을 피하고 시간이 해결하길 기다림' },
      { value: 'compromise', label: '서로 양보하는 선에서 타협점을 찾음' },
      { value: 'emotional', label: '감정을 솔직하게 표현하며 대화함' }
    ]
  },
  {
    id: 'communication_style',
    question: '소통할 때 중요하게 생각하는 것은?',
    options: [
      { value: 'words', label: '언어적 표현과 대화' },
      { value: 'actions', label: '행동으로 보여주는 것' },
      { value: 'time', label: '함께 보내는 시간' },
      { value: 'gifts', label: '선물이나 서프라이즈' },
      { value: 'touch', label: '스킨십과 신체적 접촉' }
    ]
  },
  {
    id: 'jealousy_level',
    question: '질투심 정도는?',
    options: [
      { value: 'none', label: '거의 질투하지 않음' },
      { value: 'low', label: '가끔 가벼운 질투' },
      { value: 'moderate', label: '보통 수준의 질투' },
      { value: 'high', label: '자주 질투하는 편' },
      { value: 'extreme', label: '매우 질투가 심함' }
    ]
  },
  {
    id: 'independence_level',
    question: '관계에서 독립성은?',
    options: [
      { value: 'very_independent', label: '매우 독립적 (개인 시간 중시)' },
      { value: 'independent', label: '어느 정도 독립적' },
      { value: 'balanced', label: '함께함과 독립 사이 균형' },
      { value: 'dependent', label: '상대방과 많은 시간을 보내고 싶음' },
      { value: 'very_dependent', label: '항상 함께 있고 싶음' }
    ]
  },
  {
    id: 'future_planning',
    question: '미래 계획에 대한 성향은?',
    options: [
      { value: 'detailed', label: '구체적이고 체계적인 계획 선호' },
      { value: 'flexible', label: '유연하고 상황에 맞춰 조정' },
      { value: 'spontaneous', label: '즉흥적이고 자유로운 스타일' },
      { value: 'dreamy', label: '꿈과 이상을 중시하는 스타일' }
    ]
  },
  {
    id: 'emotional_expression',
    question: '감정 표현 방식은?',
    options: [
      { value: 'open', label: '감정을 솔직하게 표현함' },
      { value: 'reserved', label: '감정을 내면에 간직하는 편' },
      { value: 'dramatic', label: '감정 표현이 풍부하고 드라마틱' },
      { value: 'practical', label: '현실적이고 실용적으로 표현' }
    ]
  },
  {
    id: 'social_preference',
    question: '사회적 활동 선호도는?',
    options: [
      { value: 'extroverted', label: '사람들과 어울리는 것을 좋아함' },
      { value: 'introverted', label: '조용하고 평화로운 환경 선호' },
      { value: 'selective', label: '가까운 사람들과만 깊은 관계' },
      { value: 'adaptable', label: '상황에 따라 유연하게 적응' }
    ]
  },
  {
    id: 'affection_expression',
    question: '애정 표현을 어떻게 하시나요?',
    options: [
      { value: 'words', label: '달콤한 말과 편지로' },
      { value: 'actions', label: '행동과 배려로' },
      { value: 'gifts', label: '선물과 서프라이즈로' },
      { value: 'time', label: '함께하는 시간으로' },
      { value: 'touch', label: '스킨십과 포옹으로' }
    ]
  },
  {
    id: 'trust_building',
    question: '신뢰를 쌓는 방식은?',
    options: [
      { value: 'gradual', label: '천천히 시간을 두고' },
      { value: 'open', label: '처음부터 열린 마음으로' },
      { value: 'proven', label: '행동으로 증명받아야' },
      { value: 'intuitive', label: '직감을 믿고' }
    ]
  },
  {
    id: 'romance_importance',
    question: '로맨스의 중요도는?',
    options: [
      { value: 'essential', label: '관계의 핵심 요소' },
      { value: 'important', label: '중요하지만 균형 필요' },
      { value: 'occasional', label: '가끔씩 있으면 좋음' },
      { value: 'practical', label: '현실적인 것이 더 중요' }
    ]
  },
  {
    id: 'growth_mindset',
    question: '관계 발전에 대한 믿음은?',
    options: [
      { value: 'constant', label: '끊임없이 발전해야 함' },
      { value: 'stable', label: '안정적 유지가 최우선' },
      { value: 'natural', label: '자연스럽게 흘러가야' },
      { value: 'effort', label: '노력하면 더 좋아질 것' }
    ]
  },
  {
    id: 'stress_response',
    question: '스트레스받을 때 관계에서는?',
    options: [
      { value: 'withdraw', label: '혼자 있는 시간 필요' },
      { value: 'seek', label: '상대방에게 의지하고 싶음' },
      { value: 'talk', label: '대화로 해결하려 함' },
      { value: 'space', label: '서로 공간을 주고받음' }
    ]
  },
  {
    id: 'commitment_style',
    question: '헌신과 약속에 대한 태도는?',
    options: [
      { value: 'total', label: '전적으로 헌신하는 타입' },
      { value: 'balanced', label: '균형있게 헌신' },
      { value: 'careful', label: '신중하게 약속' },
      { value: 'flexible', label: '상황에 따라 유연하게' }
    ]
  },
  {
    id: 'intimacy_preference',
    question: '가장 중요한 친밀감은?',
    options: [
      { value: 'emotional', label: '마음과 감정의 교감' },
      { value: 'physical', label: '신체적 접촉과 스킨십' },
      { value: 'intellectual', label: '생각과 가치관 공유' },
      { value: 'spiritual', label: '영적·정신적 연결' }
    ]
  }
];

interface PersonalityLoveTestProps {
  onComplete: (result: any) => void;
}

export const PersonalityLoveTest: React.FC<PersonalityLoveTestProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    // 즉시 다음 문항으로 이동
    handleNext();
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      analyzeResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const analyzeResults = async () => {
    setIsAnalyzing(true);
    try {
      // 간단한 성격 분석
      const traits = {
        passionate: 0,
        stable: 0,
        independent: 0,
        emotional: 0,
        social: 0,
        organized: 0
      };

      // 답변에 따른 성격 점수 계산
      Object.entries(answers).forEach(([questionId, answer]) => {
        switch (questionId) {
          case 'relationship_preference':
            if (answer === 'passionate') traits.passionate += 2;
            if (answer === 'stable') traits.stable += 2;
            if (answer === 'deep') traits.emotional += 1;
            break;
          case 'conflict_style':
            if (answer === 'direct') traits.independent += 1;
            if (answer === 'avoid') traits.stable += 1;
            if (answer === 'emotional') traits.emotional += 2;
            break;
          case 'independence_level':
            if (answer.includes('independent')) traits.independent += 2;
            if (answer.includes('dependent')) traits.emotional += 1;
            break;
          case 'social_preference':
            if (answer === 'extroverted') traits.social += 2;
            if (answer === 'introverted') traits.independent += 1;
            break;
          case 'future_planning':
            if (answer === 'detailed') traits.organized += 2;
            if (answer === 'spontaneous') traits.passionate += 1;
            break;
        }
      });

      // 주요 성격 유형 결정
      const maxTrait = Object.entries(traits).reduce((a, b) => traits[a[0] as keyof typeof traits] > traits[b[0] as keyof typeof traits] ? a : b);
      
      const personalityTypes = {
        passionate: {
          type: '열정적인 로맨티스트',
          description: '사랑에 대한 열정이 강하고 감정 표현이 풍부한 타입',
          strengths: ['열정적', '로맨틱', '표현력 풍부', '감수성 뛰어남'],
          tips: ['감정의 균형 유지하기', '상대방의 속도 배려하기', '현실적 계획도 중요']
        },
        stable: {
          type: '안정적인 동반자',
          description: '신뢰할 수 있고 일관성 있는 사랑을 추구하는 타입',
          strengths: ['신뢰성', '일관성', '책임감', '안정감'],
          tips: ['때로는 로맨틱한 서프라이즈도 필요', '감정 표현 늘리기', '새로운 시도 해보기']
        },
        independent: {
          type: '독립적인 개인주의자',
          description: '개인의 공간을 중시하며 균형 잡힌 관계를 원하는 타입',
          strengths: ['독립성', '자립성', '균형감각', '객관성'],
          tips: ['친밀감 표현하기', '상대방과의 시간 늘리기', '감정적 유대 강화']
        },
        emotional: {
          type: '감성적인 공감형',
          description: '깊은 감정적 연결을 중시하는 따뜻한 타입',
          strengths: ['공감능력', '따뜻함', '이해심', '정서적 지지'],
          tips: ['감정 조절하기', '논리적 사고도 중요', '객관적 시각 기르기']
        },
        social: {
          type: '사교적인 활동가',
          description: '사람들과의 교류를 즐기고 활발한 관계를 선호하는 타입',
          strengths: ['사교성', '활발함', '적응력', '재미'],
          tips: ['깊이 있는 소통하기', '일대일 시간 중요시하기', '진솔한 감정 나누기']
        },
        organized: {
          type: '계획적인 현실주의자',
          description: '체계적이고 계획적인 관계를 선호하는 실용적 타입',
          strengths: ['계획성', '현실성', '신중함', '목표지향'],
          tips: ['즉흥성도 필요', '감정적 표현 늘리기', '유연성 기르기']
        }
      };

      const personalityType = personalityTypes[maxTrait[0] as keyof typeof personalityTypes];

      // AI 분석 요청
      try {
        const { data: aiAnalysis, error } = await supabase.functions.invoke('personality-love-analyzer', {
          body: {
            answers,
            personalityType
          }
        });

        if (error) {
          console.error('AI 분석 오류:', error);
        }

        const result = {
          personalityType,
          traits,
          answers,
          aiAnalysis: aiAnalysis?.analysis || null,
          testType: 'personality_love',
          completedAt: new Date().toISOString()
        };

        // 무료 체험 결과 페이지로 이동
        navigate('/free-trial-result', { state: { testResult: result } });
      } catch (aiError) {
        console.error('AI 분석 실패:', aiError);
        // AI 분석 실패 시에도 기본 결과는 제공
        const result = {
          personalityType,
          traits,
          answers,
          aiAnalysis: null,
          testType: 'personality_love',
          completedAt: new Date().toISOString()
        };
        navigate('/free-trial-result', { state: { testResult: result } });
      }
    } catch (error) {
      console.error('분석 중 오류:', error);
      toast({
        title: "오류 발생",
        description: "분석 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const currentAnswer = answers[currentQ.id];

  if (isAnalyzing) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-lg font-medium">AI가 당신의 연애 스타일을 분석하고 있습니다...</p>
          <p className="text-sm text-muted-foreground mt-2">
            개인 맞춤 연애 조언을 생성하고 있어요.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center">
          <Sparkles className="h-5 w-5 mr-2 text-pink-500" />
          연애 성격 분석 테스트
        </CardTitle>
        <CardDescription className="text-center">
          나의 연애 스타일과 성격 유형을 알아보세요
        </CardDescription>
        <Progress value={progress} className="mt-4" />
        <p className="text-sm text-center text-muted-foreground">
          {currentQuestion + 1} / {questions.length}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{currentQ.question}</h3>
          
          <RadioGroup
            value={currentAnswer || ''}
            onValueChange={(value) => handleAnswer(currentQ.id, value)}
          >
            {currentQ.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="cursor-pointer">
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
          >
            이전
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={!currentAnswer}
          >
            {currentQuestion === questions.length - 1 ? '결과 보기' : '다음'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};