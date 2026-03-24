import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ClipboardCheck, Brain, FileBarChart, Users, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'floating_onboarding_completed';
const STEP_DELAY = 800; // ms before showing first toast

interface OnboardingStep {
  id: number;
  emoji: string;
  icon: React.ElementType;
  title: string;
  description: string;
  route: string;
  gradient: string;
  iconBg: string;
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    emoji: '💬',
    icon: MessageSquare,
    title: 'AI 채팅상담',
    description: 'AI 전문 상담사와 대화를 시작해보세요',
    route: '/ai-assistant',
    gradient: 'from-violet-500/20 to-purple-500/20',
    iconBg: 'bg-violet-500',
  },
  {
    id: 2,
    emoji: '✅',
    icon: ClipboardCheck,
    title: '간편검사',
    description: '3분 만에 현재 마음 상태를 확인하세요',
    route: '/assessment',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconBg: 'bg-emerald-500',
  },
  {
    id: 3,
    emoji: '🧠',
    icon: Brain,
    title: '심층검사',
    description: '전문가 수준의 정밀 분석을 받아보세요',
    route: '/premium-assessment',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconBg: 'bg-blue-500',
  },
  {
    id: 4,
    emoji: '📊',
    icon: FileBarChart,
    title: '리포트',
    description: 'AI가 분석한 맞춤형 리포트를 확인하세요',
    route: '/dashboard',
    gradient: 'from-amber-500/20 to-orange-500/20',
    iconBg: 'bg-amber-500',
  },
  {
    id: 5,
    emoji: '👨‍⚕️',
    icon: Users,
    title: '전문가 상담',
    description: '실제 전문가와 1:1 상담을 연결하세요',
    route: '/experts',
    gradient: 'from-rose-500/20 to-pink-500/20',
    iconBg: 'bg-rose-500',
  },
];

export const FloatingOnboardingGuide: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (completed) {
      setIsDismissed(true);
      return;
    }
    const timer = setTimeout(() => setIsVisible(true), STEP_DELAY);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleDismiss();
    }
  }, [currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setIsDismissed(true);
      localStorage.setItem(STORAGE_KEY, 'true');
    }, 300);
  }, []);

  const handleGoToStep = useCallback((route: string) => {
    navigate(route);
    handleDismiss();
  }, [navigate, handleDismiss]);

  if (isDismissed) return null;

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 md:bottom-8 left-4 right-4 md:left-auto md:right-6 md:w-[380px] z-[60]"
        >
          <div className="relative bg-background/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl overflow-hidden">
            {/* Top progress bar */}
            <div className="flex gap-1 px-4 pt-3">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full flex-1 transition-all duration-500 ${
                    i < currentStep
                      ? 'bg-primary'
                      : i === currentStep
                      ? 'bg-primary animate-pulse'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="p-4 pt-3"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`${step.iconBg} w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <span className="text-lg">{step.emoji}</span>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        {currentStep + 1}/{steps.length}단계
                      </span>
                    </div>
                    <h4 className="font-bold text-foreground text-base leading-tight mb-1">
                      {step.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-snug">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePrev}
                      disabled={currentStep === 0}
                      className="h-8 px-2 text-xs"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                      이전
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDismiss}
                      className="h-8 px-2 text-xs text-muted-foreground"
                    >
                      닫기
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGoToStep(step.route)}
                      className="h-8 text-xs"
                    >
                      바로가기
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleNext}
                      className="h-8 text-xs"
                    >
                      {currentStep < steps.length - 1 ? '다음' : '완료'}
                      {currentStep < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5 ml-0.5" />}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingOnboardingGuide;
