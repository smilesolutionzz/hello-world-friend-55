import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, ArrowRight, Sparkles, Target, BarChart3 } from 'lucide-react';

interface OnboardingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const onboardingSteps = [
  {
    id: 1,
    title: "AI 하이라이트프로에 오신 것을 환영합니다!",
    description: "가족의 심리적 건강을 AI로 분석하고 관리하는 혁신적인 플랫폼입니다.",
    icon: Sparkles,
    color: "bg-blue-500",
    actions: ["무료 체험 시작하기", "대시보드 둘러보기"]
  },
  {
    id: 2,
    title: "3단계로 시작하기",
    description: "간단한 설정으로 개인화된 AI 분석을 받아보세요.",
    icon: Target,
    color: "bg-green-500",
    actions: ["1. 기본 정보 입력", "2. 첫 번째 테스트", "3. AI 분석 결과"]
  },
  {
    id: 3,
    title: "지금 바로 체험해보세요",
    description: "무료 토큰 10개로 모든 기능을 체험할 수 있습니다.",
    icon: BarChart3,
    color: "bg-purple-500",
    actions: ["테스트 시작하기", "AI 분석 받기"]
  }
];

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleNext = () => {
    setCompletedSteps([...completedSteps, currentStep]);
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">시작하기</DialogTitle>
            <Badge variant="outline">{currentStep + 1}/{onboardingSteps.length}</Badge>
          </div>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-4">
            <div className={`w-16 h-16 ${currentStepData.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <currentStepData.icon className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Progress indicators */}
            <div className="flex justify-center space-x-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-primary'
                      : completedSteps.includes(index)
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Action items */}
            <div className="space-y-2">
              {currentStepData.actions.map((action, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{action}</span>
                </div>
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={handleSkip}>
                건너뛰기
              </Button>
              
              <Button onClick={handleNext} className="flex items-center space-x-2">
                <span>{currentStep === onboardingSteps.length - 1 ? '시작하기' : '다음'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};