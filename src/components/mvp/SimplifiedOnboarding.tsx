import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, Heart, Brain, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

const SimplifiedOnboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    concern: '',
    target: '',
    goal: ''
  });
  const navigate = useNavigate();

  const steps: OnboardingStep[] = [
    {
      id: 0,
      title: "어떤 것이 가장 궁금하신가요?",
      subtitle: "30초만 투자하시면 맞춤형 분석을 받아보실 수 있어요",
      content: (
        <div className="space-y-4">
          {[
            { icon: Heart, label: "우리 아이 마음 상태", value: "child_emotion" },
            { icon: Brain, label: "내 심리 상태 점검", value: "self_psychology" },
            { icon: Users, label: "가족 관계 개선", value: "family_relationship" }
          ].map((option) => (
            <Button
              key={option.value}
              variant={userData.concern === option.value ? "default" : "outline"}
              className="w-full h-16 justify-start gap-4 text-left"
              onClick={() => setUserData(prev => ({ ...prev, concern: option.value }))}
            >
              <option.icon className="h-6 w-6" />
              <div>
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-muted-foreground">
                  {option.value === 'child_emotion' && "자녀의 감정 발달과 행동 패턴"}
                  {option.value === 'self_psychology' && "나만의 성격과 심리 특성"}
                  {option.value === 'family_relationship' && "가족 구성원 간의 소통과 관계"}
                </div>
              </div>
            </Button>
          ))}
        </div>
      )
    },
    {
      id: 1,
      title: "누구를 위한 분석인가요?",
      subtitle: "더 정확한 분석을 위해 알려주세요",
      content: (
        <div className="space-y-4">
          <Select value={userData.target} onValueChange={(value) => setUserData(prev => ({ ...prev, target: value }))}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="분석 대상을 선택해주세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="child_3_7">우리 아이 (3-7세)</SelectItem>
              <SelectItem value="child_8_13">우리 아이 (8-13세)</SelectItem>
              <SelectItem value="teen_14_19">우리 아이 (14-19세)</SelectItem>
              <SelectItem value="adult_20_40">나 (20-40세)</SelectItem>
              <SelectItem value="adult_40_60">나 (40-60세)</SelectItem>
              <SelectItem value="senior_60">나 (60세 이상)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    },
    {
      id: 2,
      title: "무엇을 가장 개선하고 싶으신가요?",
      subtitle: "맞춤형 솔루션을 제공해드릴게요",
      content: (
        <div className="space-y-3">
          {[
            "감정 조절과 스트레스 관리",
            "소통 방식과 대인관계",
            "집중력과 학습능력",
            "자신감과 자존감",
            "수면과 생활 패턴",
            "기타 (전문가와 상담 후 결정)"
          ].map((goal) => (
            <Button
              key={goal}
              variant={userData.goal === goal ? "default" : "outline"}
              className="w-full justify-start h-12"
              onClick={() => setUserData(prev => ({ ...prev, goal }))}
            >
              {goal}
            </Button>
          ))}
        </div>
      )
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 온보딩 완료 - 무료 체험으로 이동
      const routeMap = {
        'child_emotion': '/observation',
        'self_psychology': '/assessment', 
        'family_relationship': '/family'
      };
      navigate(routeMap[userData.concern as keyof typeof routeMap] || '/observation');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return userData.concern !== '';
      case 1: return userData.target !== '';
      case 2: return userData.goal !== '';
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Progress value={progress} className="w-32" />
            <span className="text-sm text-muted-foreground">
              {currentStep + 1}/{steps.length}
            </span>
          </div>
          <CardTitle className="text-2xl">
            {steps[currentStep].title}
          </CardTitle>
          <p className="text-muted-foreground">
            {steps[currentStep].subtitle}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {steps[currentStep].content}
          
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
              >
                이전
              </Button>
            )}
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  무료 체험 시작
                </>
              ) : (
                <>
                  다음
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
          
          {currentStep === 0 && (
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                🎁 첫 분석은 <span className="font-semibold text-primary">완전 무료</span>입니다
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedOnboarding;