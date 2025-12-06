import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Brain, FileText, Users, ChevronRight, Sparkles, Heart, Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    icon: Sparkles,
    emoji: '👋',
    title: '환영합니다!',
    subtitle: 'AI HPRO',
    description: '3분 만에 나의 마음 상태를\n파악할 수 있어요',
    gradient: 'from-violet-500 to-purple-600',
    bgPattern: 'radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
  },
  {
    icon: Brain,
    emoji: '🧠',
    title: '심리검사',
    subtitle: '첫 번째 단계',
    description: '간단한 질문에 답하면\nAI가 분석해드려요',
    action: '검사 시작하기',
    path: '/assessment',
    gradient: 'from-blue-500 to-cyan-500',
    bgPattern: 'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
  },
  {
    icon: FileText,
    emoji: '📝',
    title: '관찰일지',
    subtitle: '두 번째 단계',
    description: '일상을 기록하면\nAI가 패턴을 분석해요',
    action: '일지 작성하기',
    path: '/observation',
    gradient: 'from-emerald-500 to-teal-500',
    bgPattern: 'radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
  },
  {
    icon: Users,
    emoji: '👨‍⚕️',
    title: '전문가 상담',
    subtitle: '세 번째 단계',
    description: '필요할 때 전문가와\n1:1 상담을 받을 수 있어요',
    action: '전문가 보기',
    path: '/experts',
    gradient: 'from-orange-500 to-rose-500',
    bgPattern: 'radial-gradient(circle at 80% 80%, rgba(249, 115, 22, 0.3) 0%, transparent 50%)',
  },
  {
    icon: Heart,
    emoji: '✨',
    title: '준비 완료!',
    subtitle: '시작해볼까요?',
    description: '지금 바로 심리검사로\n여정을 시작해보세요',
    action: '검사 시작하기',
    path: '/assessment',
    gradient: 'from-pink-500 to-rose-500',
    bgPattern: 'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
  },
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

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleStartJourney = (path: string) => {
    navigate(path);
    onClose();
  };

  const step = steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[380px] p-0 border-0 overflow-hidden bg-transparent shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`relative bg-gradient-to-br ${step.gradient} rounded-2xl overflow-hidden`}
            style={{ background: step.bgPattern }}
          >
            {/* 배경 그라데이션 */}
            <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-90`} />
            
            {/* 데코레이션 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            
            {/* 콘텐츠 */}
            <div className="relative z-10 p-8 text-white min-h-[480px] flex flex-col">
              {/* 건너뛰기 버튼 */}
              <div className="flex justify-end">
                <button
                  onClick={handleSkip}
                  className="text-white/70 text-sm hover:text-white transition-colors"
                >
                  건너뛰기
                </button>
              </div>
              
              {/* 메인 콘텐츠 */}
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                {/* 이모지 */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="text-6xl mb-6"
                >
                  {step.emoji}
                </motion.div>
                
                {/* 서브타이틀 */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-white/70 text-sm font-medium mb-2"
                >
                  {step.subtitle}
                </motion.p>
                
                {/* 타이틀 */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold mb-4"
                >
                  {step.title}
                </motion.h2>
                
                {/* 설명 */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-white/90 text-lg leading-relaxed whitespace-pre-line"
                >
                  {step.description}
                </motion.p>
              </div>
              
              {/* 하단 영역 */}
              <div className="space-y-4">
                {/* 액션 버튼 (있는 경우) */}
                {step.action && step.path && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      onClick={() => handleStartJourney(step.path!)}
                      className="w-full bg-white text-gray-900 hover:bg-white/90 font-semibold h-12 rounded-xl shadow-lg"
                    >
                      {step.action}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
                
                {/* 네비게이션 */}
                <div className="flex items-center justify-between">
                  {/* 이전 버튼 */}
                  <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className={`text-sm font-medium transition-colors ${
                      currentStep === 0 ? 'text-white/30 cursor-not-allowed' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    이전
                  </button>
                  
                  {/* 진행 표시 */}
                  <div className="flex gap-1.5">
                    {steps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentStep(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          index === currentStep 
                            ? 'w-6 bg-white' 
                            : index < currentStep
                            ? 'w-1.5 bg-white/70'
                            : 'w-1.5 bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* 다음 버튼 */}
                  <button
                    onClick={handleNext}
                    className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                  >
                    {currentStep < steps.length - 1 ? '다음' : '완료'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
