import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '@/hooks/useSubscription';
import { MIND_TRACK_PRICE } from '@/constants/tokenCosts';

/**
 * 하단 고정 CTA 바 — 30일 마음 변화 트랙 단일 상품 (₩19,900)
 * 구독자에게는 표시하지 않음
 */
const StickyConversionBar = () => {
  const navigate = useNavigate();
  const { isPremiumUser, isLifetimeUser } = useSubscription();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isPremium = isPremiumUser() || isLifetimeUser();

  useEffect(() => {
    if (isPremium || dismissed) return;
    const handleScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPremium, dismissed]);

  if (isPremium || dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50 px-4 py-3 safe-area-pb"
        >
          <div className="container mx-auto max-w-5xl flex items-center justify-between gap-3">
            <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <div>
                <p className="text-white text-sm font-bold">30일 마음 변화 트랙</p>
                <p className="text-slate-400 text-xs">AI 분석 + 전문가 코칭 · 일시불 ₩{MIND_TRACK_PRICE.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                onClick={() => navigate('/mind-track')}
                size="lg"
                className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-sm sm:text-base px-4 sm:px-6 h-11"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                30일 트랙 시작 ₩{MIND_TRACK_PRICE.toLocaleString()}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <button
                onClick={() => setDismissed(true)}
                className="p-1.5 text-slate-500 hover:text-white transition-colors flex-shrink-0"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyConversionBar;
