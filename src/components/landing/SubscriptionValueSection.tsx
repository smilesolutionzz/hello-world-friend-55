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

const SubscriptionValueSection = () => {
  const navigate = useNavigate();
  const { localePath, isEnglish } = useLanguage();

  // Countdown timer - resets daily
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

  const benefits = isEnglish ? [
    'Unlimited AI psychological assessments',
    'Expert-level deep analysis reports',
    'Priority expert consultation booking',
    'Ad-free experience',
  ] : [
    '모든 AI 심리검사 무제한 이용',
    '전문가급 심층 분석 리포트',
    '전문가 상담 우선 예약',
    '광고 없는 쾌적한 환경',
  ];

  const valueProps = isEnglish ? [
    { icon: Brain, title: 'AI Deep Analysis', desc: '9 professional domain reports', save: 'Save $500+ in clinic fees' },
    { icon: FileText, title: 'Unlimited Reports', desc: 'No usage limits', save: 'Worth $30 each' },
    { icon: Users, title: 'Expert Access', desc: 'Priority booking & discounts', save: '30% off consultations' },
    { icon: Sparkles, title: 'Custom Solutions', desc: 'AI-powered personalized guides', save: 'Worth $1,000/mo' },
  ] : [
    { icon: Brain, title: 'AI 심층 분석', desc: '9가지 전문 영역 리포트', save: '병원비 50만원+ 절약' },
    { icon: FileText, title: '무제한 리포트', desc: '횟수 제한 없이 자유롭게', save: '건당 3만원 상당' },
    { icon: Users, title: '전문가 연결', desc: '우선 예약 & 할인 혜택', save: '상담비 30% 할인' },
    { icon: Sparkles, title: '맞춤 솔루션', desc: 'AI 기반 개인화 가이드', save: '월 100만원 가치' },
  ];

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-slate-900 via-[#0f0a1e] to-slate-900">
      <div className="container mx-auto max-w-4xl">
        {/* Top Badge */}
        <motion.div initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <Badge className="bg-violet-500/20 text-violet-300 border border-violet-500/40 px-5 py-1.5 text-sm">
            <Crown className="w-3.5 h-3.5 mr-1.5" />
            {isEnglish ? 'Special Discount Today Only' : '오늘만 특별 할인 진행 중'}
            오늘만 특별 할인 진행 중
          </Badge>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl border border-violet-500/30 bg-gradient-to-br from-slate-800/90 via-violet-950/40 to-slate-800/90 backdrop-blur-xl p-8 md:p-10 shadow-2xl shadow-violet-500/10"
        >
          {/* Glow effect */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-violet-500/20 via-purple-500/10 to-violet-500/20 blur-sm -z-10" />

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left - Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5 text-violet-400" />
                <span className="text-violet-400 font-semibold text-sm tracking-wide">프리미엄 패스</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                지금 바로 <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">시작하세요</span>
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                전문가급 AI 분석으로 아이의 발달을 체계적으로 관리하세요
              </p>

              <div className="space-y-3 mb-8">
                {benefits.map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-200 text-sm">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              {/* Price */}
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-black text-white">₩19,900</span>
                <span className="text-slate-400 text-sm pb-1">/월</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-slate-500 line-through text-sm">₩39,900</span>
                <Badge className="bg-rose-500/90 text-white border-0 text-xs font-bold">50% OFF</Badge>
              </div>
              <p className="text-xs text-slate-500">런칭 특별가 · 언제든 해지 가능</p>
            </div>

            {/* Right - Timer + CTA */}
            <div className="flex flex-col items-center gap-6">
              {/* Countdown */}
              <div className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-violet-400" />
                  <span className="text-violet-300 font-semibold text-sm">특별 할인 마감까지</span>
                </div>
                <div className="flex justify-center gap-3">
                  {[
                    { val: pad(timeLeft.hours), label: '시간' },
                    { val: pad(timeLeft.minutes), label: '분' },
                    { val: pad(timeLeft.seconds), label: '초' },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="bg-slate-900 border border-slate-600/50 rounded-lg w-16 h-16 flex items-center justify-center mb-1">
                        <span className="text-2xl font-black text-white tabular-nums">{item.val}</span>
                      </div>
                      <span className="text-xs text-slate-500">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Button
                onClick={() => navigate(localePath('/token-subscription'))}
                className="w-full bg-gradient-to-r from-violet-500 via-purple-500 to-violet-600 hover:from-violet-600 hover:via-purple-600 hover:to-violet-700 text-white font-bold py-7 text-base shadow-xl shadow-violet-500/30 rounded-xl"
                size="lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                프리미엄 구독 시작하기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 언제든 해지 가능
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" /> 안전한 결제
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Value Props */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="mt-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {valueProps.map((prop, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4 hover:border-violet-500/40 transition-all"
              >
                <div className="p-2 bg-violet-500/10 rounded-lg w-fit mb-3">
                  <prop.icon className="w-4 h-4 text-violet-400" />
                </div>
                <h4 className="font-bold text-white text-sm mb-1">{prop.title}</h4>
                <p className="text-xs text-slate-400 mb-2">{prop.desc}</p>
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {prop.save}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Social Proof */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="mt-8 text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-slate-400 text-sm">
            이미 <strong className="text-violet-300">3,247명</strong>의 부모님이 프리미엄을 선택했습니다
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SubscriptionValueSection;
