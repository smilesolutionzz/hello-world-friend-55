import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, ArrowRight, Check, Shield, Star, Zap,
  Lock, UserPlus, CheckCircle, Calendar, Mail, Target, BookOpen,
  Users, Phone, Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { usePayment } from '@/hooks/usePayment';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { 
  MIND_TRACK_PRICE, 
  MIND_TRACK_ORIGINAL_PRICE, 
  MIND_TRACK_DISCOUNT_PERCENT 
} from '@/constants/tokenCosts';
import AIComparisonTable from '@/components/conversion/AIComparisonTable';

/**
 * 결제 페이지 — 단일 상품 (30일 마음 변화 트랙 ₩19,900 일시불)
 */
const TokenSubscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isPremiumUser, isLifetimeUser, getSubscriptionLabel } = useSubscription();
  const { pay, loading: paymentLoading, isReady } = usePayment();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const isPremium = isPremiumUser() || isLifetimeUser();
  const subscriptionLabel = getSubscriptionLabel();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handlePay = async () => {
    if (!isAuthenticated) {
      localStorage.setItem('auth_redirect_after', '/token-subscription');
      navigate('/auth?mode=signup');
      return;
    }
    const { ensureMindTrackEnrollment } = await import('@/lib/mindTrackEnrollment');
    await ensureMindTrackEnrollment();
    await pay('mind_track_30');
    // Navigation after payment is now handled by /payment-complete (status screen).
  };

  const fade = (delay: number) => ({ 
    initial: { opacity: 0, y: 16 }, 
    animate: { opacity: 1, y: 0 }, 
    transition: { delay, duration: 0.4 } 
  });

  const benefits = [
    { highlight: true, text: '매일 오전 8시 박사급 1:1 코칭 메일 (30일)' },
    { highlight: true, text: '30일 맞춤 마음 변화 로드맵' },
    { text: 'AI 심층 분석 리포트 무제한' },
    { text: '20종+ 심리검사 무제한 이용' },
    { text: '주간 진척도 트래킹 & 리마인더' },
    { text: '전문가 코칭 가이드 동봉' },
    { text: '종료 시 변화 종합 리포트(PDF)' },
    { text: '맞춤형 솔루션 & 실천 가이드' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-background text-foreground overflow-x-hidden">
      <UnifiedNavigation />
      <div className="container mx-auto px-4 pt-24 md:pt-28 pb-20 max-w-3xl">

        {/* 비로그인 배너 */}
        {isAuthenticated === false && (
          <motion.div {...fade(0)} className="mb-8 rounded-2xl border border-border bg-white dark:bg-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-background" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">로그인 후 결제 가능합니다</p>
                <p className="text-xs text-muted-foreground">가입 30초 · 모든 진척도가 계정에 저장됩니다</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button size="sm" onClick={() => { localStorage.setItem('auth_redirect_after', '/token-subscription'); navigate('/auth?mode=signup'); }} className="bg-foreground hover:bg-foreground/90 text-background flex-1 sm:flex-none">
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />회원가입
              </Button>
              <Button size="sm" variant="outline" onClick={() => { localStorage.setItem('auth_redirect_after', '/token-subscription'); navigate('/auth'); }} className="flex-1 sm:flex-none">
                로그인
              </Button>
            </div>
          </motion.div>
        )}

        {/* 이용중 */}
        {isPremium && (
          <motion.div {...fade(0)} className="mb-8">
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-3 border border-emerald-200 dark:border-emerald-800 rounded-full px-6 py-2.5 bg-emerald-50 dark:bg-emerald-950/30">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">{subscriptionLabel} 이용중</span>
                <Badge className="bg-emerald-600 text-white border-0 text-xs">활성</Badge>
              </div>
            </div>
            <Button onClick={() => navigate('/coaching-goals')} className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold">
              <Target className="w-4 h-4 mr-2" />
              데일리 코칭 목표 설정하기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* 페이지 정체성 안내 (이 페이지가 뭐 하는 곳인지 한 줄로) */}
        <motion.div {...fade(0.02)} className="mb-6">
          <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-foreground/90 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-background" />
            </div>
            <div className="text-sm leading-relaxed text-foreground break-keep">
              <span className="font-bold">결제 페이지</span> · 30일 마음 변화 트랙을 한 번 결제(₩{MIND_TRACK_PRICE.toLocaleString()})하면
              <span className="font-semibold"> 모든 심리검사 · AI 심층 리포트 · 매일 코칭 메일</span>이 30일간 무제한 열립니다.
              <span className="text-muted-foreground"> 자동 결제 없음 · 7일 환불 보장.</span>
            </div>
          </div>
        </motion.div>

        {/* Hero */}
        <motion.div {...fade(0.05)} className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-rose-100 dark:border-rose-900">
            <Sparkles className="w-3 h-3" />
            론칭 특가 {MIND_TRACK_DISCOUNT_PERCENT}% 할인
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3 text-foreground tracking-tight break-keep">
            30일이면, 마음이 바뀝니다
          </h1>
          <p className="text-muted-foreground text-base md:text-lg break-keep">
            단 하나의 가격, 모든 기능. 자동 결제 없는 일시불 트랙.
          </p>

          {/* 3단계 이용 흐름 — "뭘 어찌해야 되나" 즉시 이해 */}
          <div className="mt-6 grid grid-cols-3 gap-2 max-w-xl mx-auto">
            {[
              { n: '1', label: '결제', desc: '₩19,900 일시불' },
              { n: '2', label: '목표 선택', desc: '우울·불안·수면 등' },
              { n: '3', label: '30일 코칭', desc: '매일 8시 메일' },
            ].map((s) => (
              <div key={s.n} className="rounded-xl border border-border bg-white dark:bg-card px-2 py-3 text-center">
                <div className="w-6 h-6 mx-auto mb-1.5 rounded-full bg-foreground text-background text-[11px] font-black flex items-center justify-center">
                  {s.n}
                </div>
                <div className="text-xs font-bold text-foreground">{s.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 break-keep">{s.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI 비교표 */}
        <motion.div {...fade(0.1)} className="mb-10">
          <AIComparisonTable variant="compact" />
        </motion.div>

        {/* 🆕 데일리 코칭 메일 가치 섹션 */}
        <motion.div {...fade(0.11)} className="mb-10 rounded-3xl border border-foreground/10 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 bg-white/10 text-white text-[10px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full mb-4">
              <Mail className="w-3 h-3" />
              Daily Coaching · 신규
            </div>
            <h3 className="text-xl md:text-2xl font-black mb-3 break-keep">
              매일 아침 8시, 박사급 1:1 코칭 메일이 도착합니다
            </h3>
            <p className="text-white/70 text-sm md:text-base mb-6 break-keep leading-relaxed">
              30일간 매일 받는 한 줄의 미션과 임상 근거. 임상심리학 기반으로 설계된 AIHPRO만의 데일리 코칭 시스템입니다.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { icon: Target, label: '목표 1개 선택', desc: '우울·불안·수면·ADHD·양육 등' },
                { icon: Mail, label: '매일 1:1 메일', desc: '5분 안에 실천하는 미션' },
                { icon: BookOpen, label: '졸업 워크북', desc: '30일 변화 종합 리포트' },
              ].map((item, i) => (
                <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <item.icon className="w-5 h-5 text-blue-300 mb-2" />
                  <div className="font-bold text-sm mb-1">{item.label}</div>
                  <div className="text-xs text-white/60 break-keep">{item.desc}</div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-white/50 italic mt-5 break-keep">
              ※ 결제 후 코칭 목표 설정 페이지에서 주제를 선택하면 다음 날 오전 8시부터 메일이 시작됩니다.
            </p>
          </div>
        </motion.div>
        <motion.div {...fade(0.12)} className="mb-10 rounded-3xl border border-border bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900/50 dark:to-blue-950/20 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-foreground break-keep">
                왜 ChatGPT가 아닌 AIHPRO여야 할까요?
              </h3>
              <p className="text-[11px] md:text-xs text-slate-700 dark:text-slate-300 font-medium">검증된 임상 통계 모델 기반 분석</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            {[
              { code: 'RCI', name: '신뢰변화지수', desc: 'Jacobson & Truax (1991) — 점수 변화가 진짜 개선인지 측정 오차인지 95% 신뢰수준에서 검증' },
              { code: 'SEM', name: '측정표준오차', desc: '모든 점수에 ±오차 범위를 함께 제시하여 과잉 해석 방지' },
              { code: 'α', name: "Cronbach's Alpha", desc: '검사 문항의 내적 일관성 신뢰도(α ≥ 0.80)를 충족한 도구만 사용' },
              { code: 'T', name: '연령 정규화 점수', desc: '같은 연령대 규준집단(N=1,247) 대비 백분위로 객관적 위치 산출' },
            ].map((m, i) => (
              <div key={i} className="rounded-xl bg-white dark:bg-card border border-border/60 p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded">
                    {m.code}
                  </span>
                  <span className="text-xs font-bold text-foreground">{m.name}</span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed break-keep">{m.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-blue-600/5 border border-blue-200/60 dark:border-blue-800/40 p-4">
            <p className="text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed break-keep">
              <span className="font-bold text-slate-900 dark:text-white">일반 AI 챗봇은 텍스트 패턴만 생성합니다.</span>{' '}
              AIHPRO는 30일 트랙 동안 누적되는 데이터를 <span className="font-semibold text-blue-700 dark:text-blue-400">RCI(신뢰변화지수)</span>로 분석하여,
              "기분 탓"이 아닌 통계적으로 유의미한 변화가 일어났는지 객관적으로 증명합니다.
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300 italic mt-2 break-keep">
              ※ 본 서비스는 발달 코칭 및 의사결정 보조 도구이며, 의료 진단이 아닙니다.
            </p>
          </div>
        </motion.div>

        {/* 단일 상품 카드 */}
        <motion.div {...fade(0.15)} className="mb-12">
          <div className="rounded-3xl border-2 border-foreground bg-white dark:bg-card p-6 md:p-10 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-foreground text-background text-xs font-bold px-4 py-1.5 rounded-full">
                BEST VALUE · 단일 상품
              </span>
            </div>

            <div className="flex items-center gap-3 mb-6 mt-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">30일 마음 변화 트랙</h2>
                <p className="text-xs md:text-sm text-muted-foreground">AI 분석 + 전문가 코칭 · 일시불</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-muted-foreground line-through">
                  ₩{MIND_TRACK_ORIGINAL_PRICE.toLocaleString()}
                </span>
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-full">
                  {MIND_TRACK_DISCOUNT_PERCENT}% OFF
                </span>
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-4xl md:text-5xl font-black text-foreground">
                  ₩{MIND_TRACK_PRICE.toLocaleString()}
                </span>
                <span className="text-muted-foreground text-sm">· 일시불</span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1.5">
                하루 약 ₩{Math.round(MIND_TRACK_PRICE / 30).toLocaleString()} · 자동 결제 없음 · 30일 후 자동 종료
              </p>
            </div>

            <div className="space-y-3 mb-8">
              {benefits.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm md:text-base">
                  <Check className={`w-5 h-5 flex-shrink-0 ${item.highlight ? 'text-foreground' : 'text-emerald-500'}`} />
                  <span className={item.highlight ? 'font-bold text-foreground' : 'text-muted-foreground'}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="w-full h-14 rounded-xl font-bold text-base md:text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all"
              onClick={handlePay}
              disabled={paymentLoading || !isReady || isPremium}
            >
              {paymentLoading ? '결제 진행 중...' : isPremium ? (
                <><Check className="w-5 h-5 mr-2" />이미 이용 중</>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  30일 트랙 시작하기 — ₩{MIND_TRACK_PRICE.toLocaleString()}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            <p className="text-[11px] md:text-xs text-muted-foreground mt-3 text-center flex items-center justify-center gap-1.5">
              <Shield className="w-3 h-3" />
              7일 이내 100% 환불 보장 · 안전 결제 · 자동 갱신 없음
            </p>
          </div>
        </motion.div>

        {/* 구독자 전용 — 실제 전문가 1:1 상담 할인 */}
        <motion.div {...fade(0.22)} className="rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 md:p-8 shadow-lg">
          <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold mb-3">
                <Award className="w-3 h-3" />
                구독자 전용 혜택
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-1.5 break-keep">
                실제 분야별 프로 전문가 1:1 상담을 <span className="text-emerald-600">최대 50% 할인</span>
              </h3>
              <p className="text-sm text-slate-600 break-keep leading-relaxed">
                언어치료·심리상담·발달재활·ABA·미술/감각통합 등 검증된 임상 전문가를 필요할 때 즉시 예약하세요.
                AI 분석 결과만으로 부족할 때, 진짜 사람의 눈으로 한 번 더 짚어드립니다.
              </p>
            </div>
            <div className="hidden md:flex w-14 h-14 rounded-2xl bg-emerald-100 items-center justify-center flex-shrink-0">
              <Users className="w-7 h-7 text-emerald-600" />
            </div>
          </div>

          {/* 4가지 상담 패키지 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            {[
              { icon: '💬', name: '카톡 비동기 상담 (3일)', base: 9900, monthly: 6900, yearly: 4900, badge: '입문' },
              { icon: '⚡', name: '15분 긴급 줌 콜', base: 19900, monthly: 13900, yearly: 9900, badge: '위기 대응' },
              { icon: '📹', name: '리포트 해석 30분', base: 49000, monthly: 34300, yearly: 24500, badge: '인기' },
              { icon: '🎯', name: '월 정기 코칭 (4회)', base: 159000, monthly: 119000, yearly: 79000, badge: 'LTV' },
            ].map((pkg) => (
              <div key={pkg.name} className="rounded-2xl bg-white border border-emerald-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{pkg.icon}</span>
                    <span className="text-xs font-bold text-slate-700">{pkg.name}</span>
                  </div>
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">{pkg.badge}</span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] text-slate-400 line-through">₩{pkg.base.toLocaleString()}</span>
                    <span className="text-base font-black text-emerald-600">₩{pkg.yearly.toLocaleString()}</span>
                    <span className="text-[9px] text-emerald-700 font-semibold">연간</span>
                  </div>
                  <div className="text-[10px] text-slate-600">월간 구독자 ₩{pkg.monthly.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-5">
            {[
              '🎁 월 1회 무료 카톡 상담권 자동 지급 (구독 활성 시)',
              '🤖 AI 매칭으로 고민 한 줄 → 적합 전문가 3명 즉시 추천',
              '💬 카톡(비동기) · 줌(실시간) · 긴급 상담까지 4가지 채널',
              '✅ 평균 8년 이상 검증된 임상 전문가만 매칭',
              '💯 상담 불만족 시 100% 환불 보장',
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="break-keep leading-relaxed">{t}</span>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full h-12 rounded-xl font-bold text-sm md:text-base border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
            onClick={() => navigate('/expert-hiring')}
          >
            <Phone className="w-4 h-4 mr-2" />
            전문가 둘러보기 & 상담 예약
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-[11px] text-slate-500 mt-2.5 text-center">
            * 모든 할인은 활성 구독 상태에서 자동 적용 · 비구독 사용자는 정가 적용
          </p>
        </motion.div>

        {/* 신뢰 배지 */}
        <motion.div {...fade(0.25)} className="rounded-2xl border border-border bg-white dark:bg-card p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: Shield, label: '환불 보장', sub: '7일 이내' },
              { icon: Zap, label: '즉시 이용', sub: '결제 즉시' },
              { icon: Star, label: '안전 결제', sub: '토스페이먼츠' },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">{item.label}</div>
                  <div className="text-[11px] text-muted-foreground">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TokenSubscription;
