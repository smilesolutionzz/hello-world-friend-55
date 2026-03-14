import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, Zap, Crown, ArrowRight, CheckCircle2, Shield } from 'lucide-react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/i18n';
import { useLanguage } from '@/i18n/LanguageContext';
import { SUBSCRIPTION_PRICE, SINGLE_REPORT_PRICE } from '@/constants/tokenCosts';
import { PaymentModal } from '@/components/payments/PaymentModal';

export const MainPromoSection = () => {
  const navigate = useNavigate();
  const { user } = useAuthGuard();
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [paymentOpen, setPaymentOpen] = useState(false);
  const { t } = useTranslation();
  const { localePath } = useLanguage();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      setTimeLeft({ hours: Math.floor(diff / (1000 * 60 * 60)), minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)), seconds: Math.floor((diff % (1000 * 60)) / 1000) });
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1);
      setIsSubscriber(!!data && data.length > 0);
    };
    checkSubscription();
  }, [user]);

  // 이미 구독자면 표시하지 않음
  if (isSubscriber) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 px-4 py-1.5 text-sm font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            {t.mainPromo.badge || '지금 시작하세요'}
          </Badge>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
            커피 한 잔 가격으로<br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              전문가급 분석을 받아보세요
            </span>
          </h2>
        </div>

        {/* Two Column CTA */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Quick Buy - Single */}
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 text-center">
            <Zap className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">심층 분석 1회</h3>
            <p className="text-slate-400 text-sm mb-4">부담 없이 한 번 체험</p>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-slate-500 line-through text-sm">₩9,900</span>
              <span className="text-3xl font-black text-white">₩{SINGLE_REPORT_PRICE.toLocaleString()}</span>
            </div>

            <Button
              onClick={() => {
                if (!user) { navigate(localePath('/auth?redirect=/token-subscription')); return; }
                setPaymentOpen(true);
              }}
              variant="outline"
              className="w-full py-5 bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 font-bold rounded-xl"
              size="lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              리포트 구매
            </Button>
          </div>

          {/* Subscription */}
          <div className="relative bg-gradient-to-br from-violet-950/50 to-slate-800/80 border-2 border-violet-500/40 rounded-2xl p-6 text-center">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 px-3">추천</Badge>
            
            <Crown className="w-8 h-8 text-violet-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">월간 구독</h3>
            <p className="text-slate-400 text-sm mb-4">모든 기능 무제한</p>
            
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-slate-500 line-through text-sm">₩19,900</span>
              <span className="text-3xl font-black text-white">₩{SUBSCRIPTION_PRICE.toLocaleString()}</span>
              <span className="text-slate-400 text-sm">/월</span>
            </div>
            <p className="text-xs text-emerald-400 mb-4">리포트 3회면 구독이 이득!</p>

            <Button
              onClick={() => navigate(localePath('/token-subscription'))}
              className="w-full py-5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-bold shadow-lg shadow-violet-500/25 rounded-xl"
              size="lg"
            >
              <Crown className="w-5 h-5 mr-2" />
              구독 시작하기
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Timer */}
        <div className="max-w-sm mx-auto bg-slate-800/60 border border-slate-700/40 rounded-xl p-4 text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-violet-300 font-semibold text-xs">오늘의 특별 할인 마감</span>
          </div>
          <div className="flex justify-center gap-2">
            {[pad(timeLeft.hours), pad(timeLeft.minutes), pad(timeLeft.seconds)].map((val, i) => (
              <div key={i} className="bg-slate-900 border border-slate-600/50 rounded-lg w-12 h-12 flex items-center justify-center">
                <span className="text-lg font-black text-white tabular-nums">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> 언제든 해지 가능</span>
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> 토스페이먼츠 안전결제</span>
        </div>
      </div>

      <PaymentModal open={paymentOpen} onOpenChange={setPaymentOpen} mode="single" />
    </section>
  );
};

export default MainPromoSection;
