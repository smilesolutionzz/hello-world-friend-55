import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, Brain, FileText, Users, Sparkles, CheckCircle2, ArrowRight,
  Zap, TrendingUp, Shield, Clock, Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n/LanguageContext';
import { SUBSCRIPTION_PRICE, SUBSCRIPTION_ORIGINAL_PRICE, SINGLE_REPORT_PRICE } from '@/constants/tokenCosts';
import { PaymentModal } from '@/components/payments/PaymentModal';

const SubscriptionValueSection = () => {
  const navigate = useNavigate();
  const { localePath, isEnglish } = useLanguage();
  const [paymentOpen, setPaymentOpen] = useState(false);

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const subscriptionBenefits = isEnglish ? [
    'Unlimited AI psychological assessments',
    'Expert-level deep analysis reports',
    'Priority expert consultation booking',
    'Ad-free experience',
  ] : [
    '모든 AI 심리검사 무제한 이용',
    '전문가급 심층 분석 리포트 무제한',
    '전문가 상담 우선 예약',
    '광고 없는 쾌적한 환경',
  ];

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section id="subscription-section" className="py-20 px-4 bg-gradient-to-b from-slate-900 via-[#0f0a1e] to-slate-900">
      <div className="container mx-auto max-w-5xl">
        {/* Top Badge */}
        <motion.div initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <Badge className="bg-violet-500/20 text-violet-300 border border-violet-500/40 px-5 py-1.5 text-sm">
            <Crown className="w-3.5 h-3.5 mr-1.5" />
            {isEnglish ? 'Choose Your Plan' : '나에게 맞는 플랜 선택하기'}
          </Badge>
        </motion.div>

        {/* Dual Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Single Report Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl border border-slate-700/50 bg-slate-800/60 backdrop-blur-xl p-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 font-semibold text-sm">
                {isEnglish ? 'Single Report' : '단건 리포트'}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {isEnglish ? 'Try Once' : '한 번 써보기'}
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              {isEnglish ? 'Get one expert-level AI analysis report' : '전문가급 AI 분석 리포트 1회 이용'}
            </p>

            <div className="flex items-end gap-2 mb-1">
              <span className="text-sm text-slate-500 line-through">₩9,900</span>
              <span className="text-3xl font-black text-white">₩{SINGLE_REPORT_PRICE.toLocaleString()}</span>
            </div>
            <Badge className="mb-6 bg-amber-500/20 text-amber-300 border-amber-500/30">61% {isEnglish ? 'OFF' : '할인'}</Badge>

            <Button
              onClick={() => setPaymentOpen(true)}
              variant="outline"
              className="w-full py-6 bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 font-bold rounded-xl"
              size="lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              {isEnglish ? 'Get Single Report' : '리포트 1회 구매 — ₩5,900'}
            </Button>
            <p className="text-xs text-slate-500 mt-3 text-center">
              {isEnglish ? 'No subscription needed' : '구독 없이 바로 이용'}
            </p>
          </motion.div>

          {/* Subscription Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl border-2 border-violet-500/40 bg-gradient-to-br from-slate-800/90 via-violet-950/30 to-slate-800/90 backdrop-blur-xl p-8 shadow-2xl shadow-violet-500/10"
          >
            <Badge className="absolute -top-3 right-6 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 px-4 py-1">
              {isEnglish ? 'Best Value' : '추천'}
            </Badge>
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-violet-500/20 via-purple-500/10 to-violet-500/20 blur-sm -z-10" />

            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-violet-400" />
              <span className="text-violet-400 font-semibold text-sm">
                {isEnglish ? 'Monthly Subscription' : '월간 구독'}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {isEnglish ? 'Unlimited Access' : '무제한 이용'}
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              {isEnglish ? 'Everything unlimited for 30 days' : '30일간 모든 기능 무제한'}
            </p>

            <div className="flex items-end gap-2 mb-1">
              <span className="text-sm text-slate-500 line-through">₩{SUBSCRIPTION_ORIGINAL_PRICE.toLocaleString()}</span>
              <span className="text-3xl font-black text-white">₩{SUBSCRIPTION_PRICE.toLocaleString()}</span>
              <span className="text-slate-400 text-sm pb-1">/{isEnglish ? 'mo' : '월'}</span>
            </div>
            <Badge className="mb-6 bg-destructive/90 text-destructive-foreground border-0">50% {isEnglish ? 'OFF' : '할인'}</Badge>

            <div className="space-y-2.5 mb-6">
              {subscriptionBenefits.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-200 text-sm">{b}</span>
                </motion.div>
              ))}
            </div>

            <Button
              onClick={() => navigate(localePath('/token-subscription'))}
              className="w-full py-6 bg-gradient-to-r from-violet-500 via-purple-500 to-violet-600 hover:from-violet-600 hover:via-purple-600 hover:to-violet-700 text-white font-bold shadow-xl shadow-violet-500/30 rounded-xl"
              size="lg"
            >
              <Crown className="w-5 h-5 mr-2" />
              {isEnglish ? 'Start Subscription' : '구독 시작하기'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <div className="flex items-center justify-center gap-3 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {isEnglish ? 'Cancel anytime' : '언제든 해지'}</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {isEnglish ? 'Secure' : '안전결제'}</span>
            </div>
          </motion.div>
        </div>

        {/* Countdown Timer */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-md mx-auto mb-8">
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-violet-400" />
              <span className="text-violet-300 font-semibold text-sm">
                {isEnglish ? 'Special offer ends in' : '특별 할인 마감까지'}
              </span>
            </div>
            <div className="flex justify-center gap-3">
              {[
                { val: pad(timeLeft.hours), label: isEnglish ? 'Hours' : '시간' },
                { val: pad(timeLeft.minutes), label: isEnglish ? 'Min' : '분' },
                { val: pad(timeLeft.seconds), label: isEnglish ? 'Sec' : '초' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="bg-slate-900 border border-slate-600/50 rounded-lg w-14 h-14 flex items-center justify-center mb-1">
                    <span className="text-xl font-black text-white tabular-nums">{item.val}</span>
                  </div>
                  <span className="text-xs text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Social Proof */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-slate-400 text-sm">
            {isEnglish 
              ? <>Already <strong className="text-violet-300">3,247</strong> parents chose our service</>
              : <>이미 <strong className="text-violet-300">3,247명</strong>의 부모님이 선택했습니다</>}
          </p>
        </motion.div>
      </div>

      <PaymentModal open={paymentOpen} onOpenChange={setPaymentOpen} mode="single" />
    </section>
  );
};

export default SubscriptionValueSection;
