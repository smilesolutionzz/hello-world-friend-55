import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, FileText, Users, ChevronRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WelcomeOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    icon: Brain,
    title: '3분 심리검사',
    description: '간단한 질문으로 나의 심리상태를 빠르게 파악해보세요',
    action: '검사 시작하기',
    path: '/assessment'
  },
  {
    icon: FileText,
    title: '관찰일지 작성',
    description: '일상의 행동이나 감정을 기록하고 AI 분석을 받아보세요',
    action: '일지 작성하기',
    path: '/observation'
  },
  {
    icon: Users,
    title: '전문가 상담',
    description: '필요시 전문가와 1:1 상담을 통해 깊이 있는 도움을 받으세요',
    action: '전문가 찾기',
    path: '/experts'
  }
];

export const WelcomeOnboarding: React.FC<WelcomeOnboardingProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleStartJourney = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            AI HPRO에 오신 것을 환영합니다! 🎉
          </DialogTitle>
          <DialogDescription className="text-center">
            3단계로 시작하는 나의 마음 건강 여정
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* 진행 상황 표시 */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 현재 단계 카드 */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                {React.createElement(steps[currentStep].icon, { className: "h-6 w-6 text-primary" })}
              </div>
              <CardTitle className="text-lg">{steps[currentStep].title}</CardTitle>
              <CardDescription className="text-sm">
                {steps[currentStep].description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              <Button
                onClick={() => handleStartJourney(steps[currentStep].path)}
                className="w-full mb-3"
              >
                {steps[currentStep].action}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* 완료된 단계들 미리보기 */}
          {currentStep > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">이미 경험할 수 있는 기능:</p>
              {steps.slice(0, currentStep).map((step, index) => (
                <div key={index} className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>{step.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            건너뛰기
          </Button>
          <Button onClick={handleNext}>
            {currentStep < steps.length - 1 ? '다음' : '시작하기'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};