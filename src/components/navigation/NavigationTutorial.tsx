import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  Mic, 
  FileText, 
  TrendingUp, 
  Crown, 
  Brain,
  UserCheck,
  Zap,
  Heart,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  menuName: string;
  color: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'aih-agent',
    title: 'AIH 에이전트',
    description: 'AI 기반 상담, 메타버스 음성 대화, 관찰일지 자동 생성 등 다양한 AI 서비스를 이용할 수 있습니다.',
    icon: MessageCircle,
    menuName: 'AIH 에이전트',
    color: 'bg-primary/10 text-primary'
  },
  {
    id: 'assessment',
    title: '3분테스트',
    description: '간단한 테스트로 발달, 심리, 체질 등을 빠르게 분석받을 수 있습니다. 프리미엄 테스트도 제공됩니다.',
    icon: TrendingUp,
    menuName: '3분테스트',
    color: 'bg-orange-500/10 text-orange-600'
  },
  {
    id: 'expert-service',
    title: '전문가 서비스',
    description: '검증된 발달/심리 전문가를 직접 고용하고, 토큰을 충전하여 서비스를 이용할 수 있습니다.',
    icon: UserCheck,
    menuName: '전문가 서비스',
    color: 'bg-blue-500/10 text-blue-600'
  },
  {
    id: 'my-data',
    title: '나의 DATA',
    description: '고민 저장소와 검사 결과를 한 곳에서 확인하고 관리할 수 있습니다.',
    icon: Heart,
    menuName: '나의 DATA',
    color: 'bg-pink-500/10 text-pink-600'
  }
];

interface NavigationTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const NavigationTutorial: React.FC<NavigationTutorialProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = tutorialSteps.length;
  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('navigation_tutorial_completed', 'true');
    onComplete?.();
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('navigation_tutorial_completed', 'true');
    onClose();
  };

  // Reset step when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/* Header with step counter */}
        <div className="flex items-center justify-between px-6 pt-6">
          <span className="text-sm text-muted-foreground font-medium">
            {currentStep + 1} / {totalSteps}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 py-8 text-center">
          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl ${step.color} mb-6`}>
            <Icon className="h-8 w-8" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-3">{step.title}</h3>

          {/* Description */}
          <p className="text-muted-foreground text-sm leading-relaxed">
            {step.description}
          </p>

          {/* Menu highlight indicator */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">
              상단 메뉴에서 "{step.menuName}"을 찾아보세요
            </span>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pb-4">
          {tutorialSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentStep 
                  ? 'w-6 h-2 bg-primary' 
                  : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-center gap-3 px-6 pb-6">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            건너뛰기
          </Button>
          
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            이전
          </Button>
          
          <Button
            onClick={handleNext}
            className="gap-1 bg-primary hover:bg-primary/90"
          >
            {currentStep === totalSteps - 1 ? '완료' : '다음'}
            {currentStep < totalSteps - 1 && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook to manage tutorial state
export const useNavigationTutorial = () => {
  const [isOpen, setIsOpen] = useState(false);

  const showTutorial = () => setIsOpen(true);
  const hideTutorial = () => setIsOpen(false);

  const hasSeenTutorial = () => {
    return localStorage.getItem('navigation_tutorial_completed') === 'true';
  };

  const resetTutorial = () => {
    localStorage.removeItem('navigation_tutorial_completed');
  };

  return {
    isOpen,
    showTutorial,
    hideTutorial,
    hasSeenTutorial,
    resetTutorial
  };
};

export default NavigationTutorial;
