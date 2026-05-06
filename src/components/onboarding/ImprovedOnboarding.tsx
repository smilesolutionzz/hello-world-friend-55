import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  ArrowLeft, 
  Brain, 
  Users, 
  Heart, 
  Target,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  type: 'question' | 'info' | 'selection';
  options?: Array<{
    value: string;
    label: string;
    description?: string;
    icon?: React.ElementType;
  }>;
}

const ImprovedOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [userName, setUserName] = useState('');

  const steps: OnboardingStep[] = [
    {
      id: 0,
      title: "안녕하세요! 마음성장에 오신 걸 환영합니다 🎉",
      description: "30초만 투자해서 당신에게 맞는 맞춤형 서비스를 설정해보세요",
      type: 'info'
    },
    {
      id: 1,
      title: "어떤 분야에 가장 관심이 있으신가요?",
      description: "관심 분야에 따라 맞춤형 추천을 제공해드려요",
      type: 'selection',
      options: [
        {
          value: 'stress',
          label: '스트레스 관리',
          description: '일상의 스트레스를 효과적으로 관리하고 싶어요',
          icon: Brain
        },
        {
          value: 'relationship',
          label: '대인관계',
          description: '사람들과의 관계에서 어려움을 겪고 있어요',
          icon: Users
        },
        {
          value: 'emotion',
          label: '감정조절',
          description: '감정기복이 심하거나 우울감을 느껴요',
          icon: Heart
        },
        {
          value: 'growth',
          label: '자기계발',
          description: '더 나은 나로 성장하고 싶어요',
          icon: Target
        }
      ]
    },
    {
      id: 2,
      title: "현재 마음 상태는 어떠신가요?",
      description: "정확한 분석을 위해 현재 상태를 알려주세요",
      type: 'question',
      options: [
        { value: 'good', label: '아주 좋음', description: '매일이 활기차고 긍정적이에요' },
        { value: 'okay', label: '보통', description: '평범한 일상을 보내고 있어요' },
        { value: 'struggling', label: '힘든 편', description: '요즘 스트레스가 많아요' },
        { value: 'difficult', label: '매우 힘듦', description: '일상생활이 어려운 수준이에요' }
      ]
    },
    {
      id: 3,
      title: "얼마나 자주 심리상태를 체크하고 싶으신가요?",
      description: "사용 패턴에 맞는 알림을 설정해드려요",
      type: 'question',
      options: [
        { value: 'daily', label: '매일', description: '꾸준히 관리하고 싶어요' },
        { value: 'weekly', label: '주 2-3회', description: '정기적으로 체크하고 싶어요' },
        { value: 'monthly', label: '월 2-3회', description: '가끔씩 점검하고 싶어요' },
        { value: 'occasional', label: '필요할 때만', description: '특별한 상황에만 사용할게요' }
      ]
    },
    {
      id: 4,
      title: "설정이 완료되었습니다! 🎉",
      description: "이제 당신만을 위한 맞춤형 심리 케어를 시작해보세요",
      type: 'info'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 온보딩 완료 - 개인화된 추천 페이지로 이동
      const primaryInterest = answers[1];
      const currentState = answers[2];
      
      // 관심분야에 따른 라우팅
      switch (primaryInterest) {
        case 'stress':
          navigate('/assessment/stress-test');
          break;
        case 'relationship':
          navigate('/assessment/relationship-style-test');
          break;
        case 'emotion':
          navigate('/depression-package');
          break;
        case 'growth':
          navigate('/assessment/mbti-test');
          break;
        default:
          navigate('/free-trial');
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentStep]: value
    }));
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = currentStepData.type === 'info' || answers[currentStep];

  // 추천 콘텐츠 생성
  const getRecommendations = () => {
    const interest = answers[1];
    const state = answers[2];
    
    const recommendations = {
      stress: ['스트레스 자가체크', 'ADHD 체크', '직장 적응도 테스트'],
      relationship: ['성격 5요인 분석', '대인관계 테스트', '소통 유형 분석'],
      emotion: ['우울증 자가체크', '불안 척도 검사', '감정조절 능력 테스트'],
      growth: ['성격 5요인 분석', '강점 발견 테스트', '목표설정 검사']
    };

    return recommendations[interest as keyof typeof recommendations] || ['기본 심리상태 체크'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">시작하기</h1>
            <Badge variant="outline">
              {currentStep + 1} / {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content */}
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              {currentStepData.type === 'info' ? (
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
              )}
            </div>
            <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
            <p className="text-muted-foreground">
              {currentStepData.description}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Question/Selection Content */}
            {currentStepData.type === 'selection' && currentStepData.options && (
              <div className="grid gap-4">
                {currentStepData.options.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Card 
                      key={option.value}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        answers[currentStep] === option.value 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : ''
                      }`}
                      onClick={() => handleAnswerChange(option.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {Icon && (
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{option.label}</h4>
                            {option.description && (
                              <p className="text-sm text-muted-foreground">
                                {option.description}
                              </p>
                            )}
                          </div>
                          {answers[currentStep] === option.value && (
                            <CheckCircle className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {currentStepData.type === 'question' && currentStepData.options && (
              <RadioGroup 
                value={answers[currentStep] || ''} 
                onValueChange={handleAnswerChange}
                className="space-y-3"
              >
                {currentStepData.options.map((option) => (
                  <div key={option.value} className="flex items-start space-x-3">
                    <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                    <Label 
                      htmlFor={option.value} 
                      className="cursor-pointer flex-1"
                    >
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </div>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* Final Step Content */}
            {isLastStep && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                  <h4 className="font-bold text-green-800 mb-3">🎯 당신을 위한 맞춤 추천</h4>
                  <div className="space-y-2">
                    {getRecommendations().map((rec, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-primary">
                    🎉 모든 테스트를 <span className="font-bold">무료로 5회</span>까지 체험할 수 있어요!
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={handlePrev}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                이전
              </Button>
              
              <Button 
                onClick={handleNext}
                disabled={!canProceed}
                className={isLastStep ? 'bg-gradient-to-r from-primary to-secondary' : ''}
              >
                {isLastStep ? '맞춤 테스트 시작하기' : '다음'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Footer */}
        {!isLastStep && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ✨ 무료 체험 5회 + 전문가 분석 + 맞춤형 솔루션 제공
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImprovedOnboarding;