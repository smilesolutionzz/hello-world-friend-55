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
import { MIND_TRACK_7_PRICE, MIND_TRACK_7_ORIGINAL_PRICE, MIND_TRACK_7_DISCOUNT_PERCENT, MIND_TRACK_PRICE } from '@/constants/tokenCosts';
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
    '7 days of unlimited in-depth assessments',
    'Unlimited expert-level AI analysis reports',
    'Personalized 7-day mind kickstart roadmap',
    '7-day completion report (PDF) included',
    'Optional +23 day extension after Day 7',
  ] : [
    '7일간 모든 심층 검사 무제한 이용',
    '전문가급 AI 분석 리포트 무제한',
    '개인 맞춤 7일 마음 킥오프 로드맵',
    '7일 완주 리포트(PDF) 제공',
    '7일 완주 후 +23일 연장 옵션',
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

        {/* 단일 상품 — 30일 마음 변화 트랙 */}
        <div className="max-w-xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl border-2 border-violet-500/40 bg-gradient-to-br from-slate-800/90 via-violet-950/30 to-slate-800/90 backdrop-blur-xl p-8 shadow-2xl shadow-violet-500/10"
          >
            <Badge className="absolute -top-3 right-6 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 px-4 py-1">
              {isEnglish ? `${MIND_TRACK_7_DISCOUNT_PERCENT}% OFF · One-time` : `${MIND_TRACK_7_DISCOUNT_PERCENT}% 할인 · 일시불`}
            </Badge>
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-violet-500/20 via-purple-500/10 to-violet-500/20 blur-sm -z-10" />

            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-violet-400" />
              <span className="text-violet-400 font-semibold text-sm">
                {isEnglish ? '7-Day Mind Kickstart Track' : '7일 마음 트랙 (메인)'}
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 break-keep">
              {isEnglish ? 'Start small. Feel the shift in 7 days.' : '7일이면 충분해요, 가볍게 시작'}
            </h3>
            <p className="text-slate-400 text-xs md:text-sm mb-6 break-keep">
              {isEnglish 
                ? 'No subscriptions, no recurring charges. Everything you need for the first 7 days.' 
                : '복잡한 구독 없이, 첫 7일에 필요한 모든 것을 한 번에'}
            </p>

            <div className="flex items-end gap-2 mb-1">
              <span className="text-base text-slate-500 line-through pb-1">₩{MIND_TRACK_7_ORIGINAL_PRICE.toLocaleString()}</span>
              <span className="text-3xl font-black text-white">₩{MIND_TRACK_7_PRICE.toLocaleString()}</span>
              <span className="text-slate-400 text-sm pb-1">{isEnglish ? '/ one-time' : '/ 일시불'}</span>
            </div>
            <p className="text-xs text-emerald-400 mb-6">
              {isEnglish
                ? `Just ₩${Math.round(MIND_TRACK_7_PRICE / 7).toLocaleString()} per day · Auto-renewal disabled`
                : `하루 약 ₩${Math.round(MIND_TRACK_7_PRICE / 7).toLocaleString()} · 자동 결제 없음`}
            </p>

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
              onClick={() => navigate(localePath('/quiz'))}
              className="w-full py-6 bg-gradient-to-r from-violet-500 via-purple-500 to-violet-600 hover:from-violet-600 hover:via-purple-600 hover:to-violet-700 text-white font-bold shadow-xl shadow-violet-500/30 rounded-xl"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {isEnglish ? 'Start 30-Day Mind Track' : '1분 무료 진단으로 시작'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <div className="flex items-center justify-center gap-3 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {isEnglish ? '30-day money-back' : '30일 환불 보장'}</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {isEnglish ? 'No auto-renewal' : '자동 결제 없음'}</span>
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

        {/* Social Proof 제거됨 — 실제 데이터 확보 전까지 비활성화 */}
      </div>

      <PaymentModal open={paymentOpen} onOpenChange={setPaymentOpen} mode="single" />
    </section>
  );
};

export default SubscriptionValueSection;
