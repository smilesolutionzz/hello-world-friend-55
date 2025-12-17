import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  menuSelector: string; // CSS selector for the menu button
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'assessment',
    title: '검사도구',
    description: '간편테스트로 발달, 심리, 체질 등을 빠르게 분석받을 수 있습니다. 심층테스트도 제공됩니다.',
    icon: TrendingUp,
    menuSelector: '[data-tutorial="assessment"]'
  },
  {
    id: 'aih-agent',
    title: 'AIH 에이전트',
    description: 'AI 기반 24시간 상담, 메타버스 음성 대화, 발달바우처 관찰일지 자동 생성 등 다양한 AI 서비스를 이용할 수 있습니다.',
    icon: MessageCircle,
    menuSelector: '[data-tutorial="aih-agent"]'
  },
  {
    id: 'expert-service',
    title: '전문가 서비스',
    description: '검증된 발달/심리 전문가를 직접 고용하고, 캐시를 충전하여 프리미엄 서비스를 이용할 수 있습니다.',
    icon: UserCheck,
    menuSelector: '[data-tutorial="expert-service"]'
  },
  {
    id: 'my-data',
    title: '나의 DATA',
    description: '고민 저장소와 검사 결과를 한 곳에서 확인하고 관리할 수 있습니다.',
    icon: Heart,
    menuSelector: '[data-tutorial="my-data"]'
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
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const totalSteps = tutorialSteps.length;
  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  // Find and highlight the target element
  const updateTargetPosition = useCallback(() => {
    const targetElement = document.querySelector(step.menuSelector);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setTargetRect(rect);
    }
  }, [step.menuSelector]);

  useEffect(() => {
    if (isOpen) {
      updateTargetPosition();
      window.addEventListener('resize', updateTargetPosition);
      window.addEventListener('scroll', updateTargetPosition);
      return () => {
        window.removeEventListener('resize', updateTargetPosition);
        window.removeEventListener('scroll', updateTargetPosition);
      };
    }
  }, [isOpen, updateTargetPosition]);

  // Reset step when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  // Calculate popup position
  const getPopupPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    const popupWidth = 400;
    const popupHeight = 320;
    const arrowHeight = 12;
    
    // Position below the target element
    let top = targetRect.bottom + arrowHeight + 8;
    let left = targetRect.left + (targetRect.width / 2) - (popupWidth / 2);
    
    // Keep within viewport
    if (left < 16) left = 16;
    if (left + popupWidth > window.innerWidth - 16) {
      left = window.innerWidth - popupWidth - 16;
    }
    
    return { top: `${top}px`, left: `${left}px` };
  };

  const popupPosition = getPopupPosition();

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Dark overlay with cutout */}
      <div className="absolute inset-0 bg-black/60" onClick={handleSkip} />
      
      {/* Highlight box around target */}
      {targetRect && (
        <>
          {/* Highlight border */}
          <div
            className="absolute border-[3px] border-primary rounded-lg pointer-events-none z-[10000] transition-all duration-300"
            style={{
              top: targetRect.top - 4,
              left: targetRect.left - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)'
            }}
          />
          
          {/* Arrow pointing to target */}
          <div
            className="absolute z-[10001] pointer-events-none"
            style={{
              top: targetRect.bottom + 4,
              left: targetRect.left + targetRect.width / 2 - 8,
            }}
          >
            <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white" />
          </div>
        </>
      )}
      
      {/* Tutorial popup card */}
      <Card
        className="absolute z-[10001] w-[400px] bg-background shadow-2xl border-0 overflow-hidden"
        style={popupPosition}
      >
        {/* Header with step counter */}
        <div className="flex items-center justify-between px-6 pt-5">
          <span className="text-sm text-muted-foreground font-medium">
            {currentStep + 1} / {totalSteps}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-muted"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-5">
            <Icon className="h-7 w-7" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-3 text-primary">{step.title}</h3>

          {/* Description */}
          <p className="text-foreground text-sm leading-relaxed">
            {step.description}
          </p>
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
                  : index < currentStep
                    ? 'w-2 h-2 bg-primary/50'
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
      </Card>
    </div>,
    document.body
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
