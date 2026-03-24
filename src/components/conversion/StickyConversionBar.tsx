import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Zap, X, FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentModal } from '@/components/payments/PaymentModal';
import { useSubscription } from '@/hooks/useSubscription';
import { SINGLE_TEST_PRICE, SINGLE_REPORT_PRICE, SUBSCRIPTION_PRICE } from '@/constants/tokenCosts';

/**
 * 하단 고정 CTA 바 — 스크롤 시 나타나며 단건/구독 전환 유도
 * 구독자에게는 표시하지 않음
 */
const StickyConversionBar = () => {
  const navigate = useNavigate();
  const { isPremiumUser, isLifetimeUser } = useSubscription();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'single' | 'single_test'>('single');

  const isPremium = isPremiumUser() || isLifetimeUser();

  useEffect(() => {
    if (isPremium || dismissed) return;
    
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPremium, dismissed]);

  if (isPremium || dismissed) return null;

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50 px-4 py-3 safe-area-pb"
          >
            <div className="container mx-auto max-w-5xl flex items-center justify-between gap-3">
              <div className="hidden sm:block flex-shrink-0">
                <p className="text-white text-sm font-bold">지금 시작하기</p>
                <p className="text-slate-400 text-xs">커피값으로 전문 분석 받기</p>
              </div>
              
              <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => { setPaymentMode('single_test'); setPaymentOpen(true); }}
                  size="sm"
                  variant="outline"
                  className="flex-1 sm:flex-none bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 text-[11px] sm:text-sm px-2 sm:px-3"
                >
                  <FlaskConical className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1" />
                  검사 ₩{SINGLE_TEST_PRICE.toLocaleString()}
                </Button>
                <Button
                  onClick={() => { setPaymentMode('single'); setPaymentOpen(true); }}
                  size="sm"
                  variant="outline"
                  className="flex-1 sm:flex-none bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-[11px] sm:text-sm px-2 sm:px-3"
                >
                  <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1" />
                  리포트 ₩{SINGLE_REPORT_PRICE.toLocaleString()}
                </Button>
                <Button
                  onClick={() => navigate('/token-subscription')}
                  size="sm"
                  className="flex-1 sm:flex-none bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-[11px] sm:text-sm px-2 sm:px-3"
                >
                  <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1" />
                  무제한 ₩{SUBSCRIPTION_PRICE.toLocaleString()}/월
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

      <PaymentModal 
        open={paymentOpen} 
        onOpenChange={setPaymentOpen} 
        mode="single"
        creditType={paymentMode === 'single_test' ? 'test' : 'report'}
      />
    </>
  );
};

export default StickyConversionBar;