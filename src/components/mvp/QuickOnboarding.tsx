import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  ArrowLeft, 
  Heart, 
  Baby, 
  Users, 
  Sparkles 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickOnboardingProps {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

interface OnboardingData {
  targetUser: '부모' | '성인';
  primaryConcern: string;
  familySize: string;
  experience: string;
}

export const QuickOnboarding = ({ onComplete, onSkip }: QuickOnboardingProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<Partial<OnboardingData>>({});

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(data as OnboardingData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateData = (key: keyof OnboardingData, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return data.targetUser;
      case 2: return data.primaryConcern;
      case 3: return data.familySize;
      case 4: return data.experience;
      default: return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">맞춤 서비스를 위한 간단 설문</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">어떤 분이신가요?</h2>
              <p className="text-muted-foreground">
                맞춤형 서비스 제공을 위해 필요한 정보입니다
              </p>
            </div>

            <RadioGroup 
              value={data.targetUser} 
              onValueChange={(value) => updateData('targetUser', value as '부모' | '성인')}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="부모" id="parent" />
                <Label htmlFor="parent" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Baby className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium">자녀를 둔 부모</div>
                      <div className="text-sm text-muted-foreground">아이의 발달과 마음 상태가 궁금해요</div>
                    </div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="성인" id="adult" />
                <Label htmlFor="adult" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="font-medium">성인 개인</div>
                      <div className="text-sm text-muted-foreground">나 자신의 심리 상태를 이해하고 싶어요</div>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">주요 관심사는 무엇인가요?</h2>
              <p className="text-muted-foreground">
                가장 궁금하거나 걱정되는 영역을 선택해주세요
              </p>
            </div>

            <RadioGroup 
              value={data.primaryConcern} 
              onValueChange={(value) => updateData('primaryConcern', value)}
              className="space-y-3"
            >
              {(data.targetUser === '부모' ? [
                { value: '발달지연', label: '발달 지연 우려', desc: '또래보다 발달이 느린 것 같아요' },
                { value: '행동문제', label: '행동 문제', desc: '떼쓰기, 공격성, 산만함 등' },
                { value: '정서문제', label: '정서적 어려움', desc: '불안, 우울, 위축 등' },
                { value: '사회성', label: '사회성 발달', desc: '친구관계, 적응 문제' },
                { value: '학습', label: '학습 관련', desc: '집중력, 학습 능력 등' }
              ] : [
                { value: '스트레스', label: '스트레스 관리', desc: '일상의 스트레스가 심해요' },
                { value: '우울감', label: '우울감', desc: '기분이 계속 가라앉아 있어요' },
                { value: '불안', label: '불안감', desc: '막연한 불안이나 걱정이 많아요' },
                { value: '대인관계', label: '대인관계', desc: '사람들과의 관계가 어려워요' },
                { value: '자기이해', label: '자기 이해', desc: '나 자신을 더 잘 알고 싶어요' }
              ]).map((option) => (
                <div key={option.value} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.desc}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">가족 구성은 어떻게 되시나요?</h2>
              <p className="text-muted-foreground">
                더 나은 분석을 위해 필요한 정보입니다
              </p>
            </div>

            <RadioGroup 
              value={data.familySize} 
              onValueChange={(value) => updateData('familySize', value)}
              className="space-y-3"
            >
              {[
                { value: '1인', label: '1인 가구', desc: '혼자 살고 있어요' },
                { value: '2인', label: '2인 가구', desc: '부부 또는 1자녀' },
                { value: '3-4인', label: '3-4인 가구', desc: '일반적인 가족 구성' },
                { value: '5인이상', label: '5인 이상', desc: '대가족이에요' }
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.desc}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">심리검사 경험이 있으신가요?</h2>
              <p className="text-muted-foreground">
                서비스 수준을 맞춤화하기 위한 질문입니다
              </p>
            </div>

            <RadioGroup 
              value={data.experience} 
              onValueChange={(value) => updateData('experience', value)}
              className="space-y-3"
            >
              {[
                { value: '없음', label: '전혀 없어요', desc: '처음 이용하는 서비스입니다' },
                { value: '온라인', label: '온라인 검사만', desc: '간단한 온라인 테스트 정도만' },
                { value: '전문기관', label: '전문기관 이용', desc: '병원이나 상담센터를 이용해봤어요' },
                { value: '정기적', label: '정기적 이용', desc: '꾸준히 심리 서비스를 이용하고 있어요' }
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.desc}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">30초 맞춤 설정</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onSkip}>
            건너뛰기
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>진행 상황</span>
            <span>{currentStep} / {totalSteps}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        {renderStep()}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="w-24"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            이전
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="w-24"
          >
            {currentStep === totalSteps ? '완료' : '다음'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickOnboarding;