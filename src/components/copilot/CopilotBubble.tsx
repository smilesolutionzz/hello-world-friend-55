import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Sparkles, ArrowRight, MessageCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { copilotFlows, type CopilotStep, type CopilotOption } from './copilotFlows';

const KAKAO_CHANNEL_URL = 'https://open.kakao.com/o/sHLdK3Ch';

interface HistoryEntry {
  question: string;
  selectedLabel: string;
}

export const CopilotBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepId, setCurrentStepId] = useState<string>('root');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const navigate = useNavigate();

  const currentStep = copilotFlows[currentStepId];

  const handleSelect = useCallback((option: CopilotOption) => {
    // Record history
    if (currentStep) {
      setHistory(prev => [...prev, {
        question: currentStep.question,
        selectedLabel: option.label,
      }]);
    }

    // Handle action
    if (option.action === 'navigate' && option.route) {
      navigate(option.route);
      setIsOpen(false);
      resetFlow();
    } else if (option.action === 'kakao') {
      window.open(KAKAO_CHANNEL_URL, '_blank');
    } else if (option.action === 'payment') {
      navigate('/token-subscription');
      setIsOpen(false);
      resetFlow();
    } else if (option.nextStep) {
      setCurrentStepId(option.nextStep);
    }
  }, [currentStep, navigate]);

  const resetFlow = useCallback(() => {
    setCurrentStepId('root');
    setHistory([]);
  }, []);

  if (!currentStep) return null;

  return (
    <>
      {/* Floating Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-20 left-4 z-50 md:bottom-6 md:left-6"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="group relative flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary/80 px-4 py-3 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-semibold">무엇이 궁금하세요?</span>
              {/* Pulse */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copilot Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 left-4 right-4 z-50 md:left-6 md:right-auto md:w-[380px] md:bottom-6"
          >
            <div className="rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/20 to-transparent border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">발달심리 코파일럿</p>
                    <p className="text-[10px] text-white/50">14년 전문가 설계 엔진</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {history.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={resetFlow}
                      className="text-white/60 hover:text-white hover:bg-white/10"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setIsOpen(false)}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <ScrollArea className="max-h-[60vh]">
                <div className="p-4 space-y-4">
                  {/* History - collapsed */}
                  {history.length > 0 && (
                    <div className="space-y-1.5">
                      {history.map((entry, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-white/40">
                          <span className="shrink-0">✓</span>
                          <span className="truncate">{entry.selectedLabel}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Current Question */}
                  <div className="space-y-1">
                    {currentStep.emoji && (
                      <span className="text-2xl">{currentStep.emoji}</span>
                    )}
                    <h3 className="text-base font-bold text-white leading-snug">
                      {currentStep.question}
                    </h3>
                    {currentStep.subtitle && (
                      <p className="text-xs text-white/50">{currentStep.subtitle}</p>
                    )}
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    {currentStep.options.map((option, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        onClick={() => handleSelect(option)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                          "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/40",
                          "group"
                        )}
                      >
                        {option.emoji && (
                          <span className="text-lg shrink-0">{option.emoji}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{option.label}</p>
                          {option.description && (
                            <p className="text-[11px] text-white/40 mt-0.5 line-clamp-1">{option.description}</p>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-primary shrink-0 transition-colors" />
                      </motion.button>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  {currentStepId === 'root' && (
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => window.open(KAKAO_CHANNEL_URL, '_blank')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#FEE500]/10 text-[#FEE500] text-xs font-medium hover:bg-[#FEE500]/20 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        카톡 상담
                      </button>
                      <button
                        onClick={() => { navigate('/token-subscription'); setIsOpen(false); resetFlow(); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        이용권 보기
                      </button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
