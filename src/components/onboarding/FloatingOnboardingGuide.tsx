import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ClipboardCheck, Brain, FileBarChart, Users, X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'floating_onboarding_step';

const steps = [
  {
    id: 1,
    emoji: '💬',
    icon: MessageSquare,
    title: 'AI 채팅상담',
    description: 'AI 전문 상담사와 대화를 시작해보세요',
    route: '/ai-assistant',
    iconBg: 'bg-violet-500',
  },
  {
    id: 2,
    emoji: '✅',
    icon: ClipboardCheck,
    title: '간편검사',
    description: '3분 만에 현재 마음 상태를 확인하세요',
    route: '/assessment',
    iconBg: 'bg-emerald-500',
  },
  {
    id: 3,
    emoji: '🧠',
    icon: Brain,
    title: '심층검사',
    description: '전문가 수준의 정밀 분석을 받아보세요',
    route: '/premium-assessment',
    iconBg: 'bg-blue-500',
  },
  {
    id: 4,
    emoji: '📊',
    icon: FileBarChart,
    title: '리포트',
    description: 'AI가 분석한 맞춤형 리포트를 확인하세요',
    route: '/dashboard',
    iconBg: 'bg-amber-500',
  },
  {
    id: 5,
    emoji: '👨‍⚕️',
    icon: Users,
    title: '전문가 상담',
    description: '실제 전문가와 1:1 상담을 연결하세요',
    route: '/experts',
    iconBg: 'bg-rose-500',
  },
];

export const FloatingOnboardingGuide: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  // Load saved step
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed < steps.length) {
        setCurrentStep(parsed);
      }
    }
    // Auto-expand on first visit
    if (!saved) {
      const timer = setTimeout(() => setIsExpanded(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Save step progress
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(currentStep));
  }, [currentStep]);

  const progress = Math.round(((currentStep + 1) / steps.length) * 100);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleGoToStep = useCallback((route: string) => {
    navigate(route);
    setIsExpanded(false);
  }, [navigate]);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const step = steps[currentStep];

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 z-[60]">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          /* Expanded panel */
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-[320px]"
          >
            <div className="relative bg-background/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl overflow-hidden">
              {/* Progress bar */}
              <div className="flex gap-1 px-4 pt-3">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`h-1.5 rounded-full flex-1 transition-all duration-500 cursor-pointer ${
                      i < currentStep
                        ? 'bg-primary'
                        : i === currentStep
                        ? 'bg-primary animate-pulse'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Close/minimize */}
              <button
                onClick={toggleExpand}
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
                  transition={{ duration: 0.2 }}
                  className="p-4 pt-3"
                >
                  <div className="flex items-start gap-3">
                    <div className={`${step.iconBg} w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <span className="text-lg">{step.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-muted-foreground">
                        {currentStep + 1}/{steps.length}단계
                      </span>
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
                        disabled={currentStep >= steps.length - 1}
                        className="h-8 text-xs"
                      >
                        다음
                        <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          /* Collapsed pill button */
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={toggleExpand}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold whitespace-nowrap">
              시작 가이드 {progress}%
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingOnboardingGuide;
