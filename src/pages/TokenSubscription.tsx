import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Users, Crown, ArrowRight, 
  Check, Sparkles, 
  Zap, Shield, Star, Loader2,
  X, Target, Lock, UserPlus, CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { usePayment } from '@/hooks/usePayment';
import { useAccessControl } from '@/hooks/useAccessControl';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { SUBSCRIPTION_PRICE, SUBSCRIPTION_ORIGINAL_PRICE, SUBSCRIPTION_DISCOUNT_PERCENT, SINGLE_REPORT_PRICE, SINGLE_TEST_PRICE, SUBSCRIPTION_YEARLY_PRICE, SUBSCRIPTION_YEARLY_ORIGINAL_PRICE, SUBSCRIPTION_YEARLY_DISCOUNT_PERCENT, SUBSCRIPTION_YEARLY_MONTHLY_PRICE } from '@/constants/tokenCosts';
import { MobilePaymentFlow } from '@/components/payments/MobilePaymentFlow';

const TokenSubscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isPremiumUser, isLifetimeUser, getSubscriptionLabel } = useSubscription();
  const { pay, loading: paymentLoading, isReady } = usePayment();
  const { reportCredits } = useAccessControl();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const isPremium = isPremiumUser() || isLifetimeUser();
  const subscriptionLabel = getSubscriptionLabel();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handlePaySubscription = async () => {
    const success = await pay('subscription_monthly');
    if (success) toast({ title: "결제 완료", description: "구독해주셔서 감사합니다!" });
  };
  const handlePayYearly = async () => {
    const success = await pay('subscription_yearly');
    if (success) toast({ title: "결제 완료", description: "연간 구독 감사합니다!" });
  };
  const handlePaySingle = async () => {
    const success = await pay('single_report');
    if (success) toast({ title: "결제 완료", description: "리포트 이용권이 추가되었습니다!" });
  };
  const handlePayTest = async () => {
    const success = await pay('single_test');
    if (success) toast({ title: "결제 완료", description: "검사 이용권이 추가되었습니다!" });
  };

  const fade = (delay: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.4 } });

  return (
    <div className="min-h-screen bg-white dark:bg-background text-foreground overflow-x-hidden">
      <div className="md:hidden">
        <MobilePaymentFlow initialStep="plan" />
      </div>

      <div className="hidden md:block">
        <UnifiedNavigation />
        <div className="container mx-auto px-4 pt-28 pb-20 max-w-4xl">

          {/* 비로그인 배너 */}
          {isAuthenticated === false && (
            <motion.div {...fade(0)} className="mb-10 rounded-2xl border border-border bg-white dark:bg-card p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
                  <Lock className="w-5 h-5 text-background" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">로그인 후 이용 가능합니다</p>
                  <p className="text-xs text-muted-foreground">가입 30초 · 모든 내역이 계정에 저장됩니다</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { localStorage.setItem('auth_redirect_after', '/token-subscription'); navigate('/auth?mode=signup'); }} className="bg-foreground hover:bg-foreground/90 text-background">
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />회원가입
                </Button>
                <Button size="sm" variant="outline" onClick={() => { localStorage.setItem('auth_redirect_after', '/token-subscription'); navigate('/auth'); }}>
                  로그인
                </Button>
              </div>
            </motion.div>
          )}

          {/* 구독 중 */}
          {isPremium && (
            <motion.div {...fade(0)} className="flex justify-center mb-10">
              <div className="inline-flex items-center gap-3 border border-emerald-200 dark:border-emerald-800 rounded-full px-6 py-2.5 bg-emerald-50 dark:bg-emerald-950/30">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">{subscriptionLabel} 이용중</span>
                <Badge className="bg-emerald-600 text-white border-0 text-xs">무제한</Badge>
              </div>
            </motion.div>
          )}

          {/* 리포트 크레딧 */}
          {!isPremium && reportCredits > 0 && (
            <motion.div {...fade(0)} className="mb-8 rounded-xl border border-border bg-white dark:bg-card p-4 flex items-center gap-3">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-foreground">리포트 이용권 <strong>{reportCredits}회</strong> 보유 중</span>
              <span className="text-xs text-muted-foreground ml-auto">구독하면 무제한!</span>
            </motion.div>
          )}

          {/* Hero */}
          <motion.div {...fade(0.05)} className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-rose-100 dark:border-rose-900">
              <Sparkles className="w-3 h-3" />
              론칭 특가 {SUBSCRIPTION_DISCOUNT_PERCENT}% 할인
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 text-foreground tracking-tight">
              나에게 맞는 플랜
            </h1>
            <p className="text-muted-foreground text-lg">
              1회만 써보거나, 무제한으로 이용하거나
            </p>
          </motion.div>

          {/* 토글 */}
          <motion.div {...fade(0.1)} className="flex justify-center mb-10">
            <div className="inline-flex items-center bg-secondary rounded-full p-1 gap-0.5">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                월간
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                연간
                <span className="text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">-17%</span>
              </button>
            </div>
          </motion.div>

          {/* 프라이싱 카드 */}
          <div className="grid md:grid-cols-2 gap-5 mb-16">

            {/* 단건 이용권 */}
            <motion.div {...fade(0.15)}>
              <div className="h-full rounded-2xl border border-border bg-white dark:bg-card p-7 flex flex-col">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">단건 이용권</h2>
                    <p className="text-xs text-muted-foreground">필요할 때만 한 번씩</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-6">구독 없이 원하는 기능만 골라서 이용하세요</p>

                {/* 검사 1회 */}
                <div className="rounded-xl border border-border bg-secondary/30 p-4 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-500" />
                      <span className="font-semibold text-sm text-foreground">심리검사 1회</span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">61% 할인</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-muted-foreground line-through">₩4,900</span>
                      <span className="text-2xl font-black text-foreground">₩{SINGLE_TEST_PRICE.toLocaleString()}</span>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handlePayTest} disabled={paymentLoading || !isReady}>
                      {paymentLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '구매'}
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">검사 실시 + 기본 결과 확인</p>
                </div>

                {/* 리포트 1회 */}
                <div className="rounded-xl border border-border bg-secondary/30 p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-sm text-foreground">심층 분석 리포트 1회</span>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full">60% 할인</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-muted-foreground line-through">₩14,900</span>
                      <span className="text-2xl font-black text-foreground">₩{SINGLE_REPORT_PRICE.toLocaleString()}</span>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handlePaySingle} disabled={paymentLoading || !isReady}>
                      {paymentLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '구매'}
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">AI 심층 분석 + PDF 리포트 + 맞춤 솔루션</p>
                </div>

                <div className="mt-auto space-y-2">
                  {['구독 없이 바로 이용', '결제 즉시 사용 가능'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-muted-foreground/60" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* 구독 카드 */}
            <motion.div {...fade(0.2)}>
              <div className="h-full rounded-2xl border-2 border-foreground bg-white dark:bg-card p-7 flex flex-col relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-foreground text-background text-xs font-bold px-4 py-1.5 rounded-full">
                    {billingCycle === 'yearly' ? 'BEST VALUE' : 'POPULAR'}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-5 mt-2">
                  <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
                    <Crown className="w-5 h-5 text-background" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{billingCycle === 'monthly' ? '월간 구독' : '연간 구독'}</h2>
                    <p className="text-xs text-muted-foreground">
                      {billingCycle === 'monthly' ? '모든 기능 무제한' : '월간 대비 17% 절약'}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  {billingCycle === 'monthly'
                    ? '하루 약 330원으로 모든 AI 분석을 무제한 이용'
                    : '하루 약 271원으로 모든 AI 분석을 무제한 이용'}
                </p>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-muted-foreground line-through">
                      ₩{billingCycle === 'monthly' ? SUBSCRIPTION_ORIGINAL_PRICE.toLocaleString() : SUBSCRIPTION_YEARLY_ORIGINAL_PRICE.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-full">
                      {billingCycle === 'monthly' ? SUBSCRIPTION_DISCOUNT_PERCENT : SUBSCRIPTION_YEARLY_DISCOUNT_PERCENT}% OFF
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-foreground">
                      ₩{billingCycle === 'monthly' ? SUBSCRIPTION_PRICE.toLocaleString() : SUBSCRIPTION_YEARLY_PRICE.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-sm">{billingCycle === 'monthly' ? '/월' : '/년'}</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                      월 ₩{SUBSCRIPTION_YEARLY_MONTHLY_PRICE.toLocaleString()} 꼴 · 연 ₩19,800 절약
                    </p>
                  )}
                  {billingCycle === 'monthly' && (
                    <p className="text-xs text-muted-foreground mt-1">3번만 써도 단건보다 이득!</p>
                  )}
                </div>

                <div className="space-y-2.5 mb-6 flex-1">
                  {[
                    { text: '모든 AI 심층 분석 무제한', highlight: true },
                    { text: '20종+ 심리검사 무제한' },
                    { text: '상세 PDF 리포트 무제한' },
                    { text: '맞춤형 솔루션 & 가이드' },
                    { text: '발달 트렌드 추적' },
                    { text: '우선 고객 지원' },
                    ...(billingCycle === 'yearly' ? [{ text: '신규 기능 우선 이용' }, { text: '전문가 상담 할인' }] : []),
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 ${item.highlight ? 'text-foreground' : 'text-emerald-500'}`} />
                      <span className={item.highlight ? 'font-semibold text-foreground' : 'text-muted-foreground'}>{item.text}</span>
                    </div>
                  ))}
                </div>

                <Button
                  size="lg"
                  className="w-full h-13 rounded-xl font-bold text-base bg-foreground hover:bg-foreground/90 text-background transition-all"
                  onClick={billingCycle === 'monthly' ? handlePaySubscription : handlePayYearly}
                  disabled={paymentLoading || !isReady || isPremium}
                >
                  {paymentLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />결제 중...</>
                  ) : isPremium ? (
                    <><Check className="w-4 h-4 mr-2" />이미 이용 중</>
                  ) : (
                    billingCycle === 'monthly'
                      ? `구독 시작 — ₩${SUBSCRIPTION_PRICE.toLocaleString()}/월`
                      : `연간 구독 — ₩${SUBSCRIPTION_YEARLY_PRICE.toLocaleString()}/년`
                  )}
                </Button>
                <p className="text-[11px] text-muted-foreground mt-3 text-center flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" />7일 이내 100% 환불 보장 · 언제든 해지
                </p>
              </div>
            </motion.div>
          </div>

          {/* 가격 비교 */}
          <motion.section {...fade(0.25)} className="mb-16">
            <h3 className="font-bold text-center text-foreground mb-5 text-lg">어떤 플랜이 나에게 맞을까?</h3>
            <div className="rounded-2xl border border-border bg-white dark:bg-card overflow-hidden">
              <div className="grid grid-cols-5 text-center text-sm border-b border-border">
                {[
                  { label: '검사 1회', sub: '단건', price: `₩${SINGLE_TEST_PRICE.toLocaleString()}` },
                  { label: '리포트 1회', sub: '단건', price: `₩${SINGLE_REPORT_PRICE.toLocaleString()}` },
                  { label: '검사+리포트', sub: '각 1회', price: `₩${(SINGLE_TEST_PRICE + SINGLE_REPORT_PRICE).toLocaleString()}` },
                  { label: '무제한', sub: '월간', price: `₩${SUBSCRIPTION_PRICE.toLocaleString()}/월` },
                  { label: '무제한', sub: '연간', price: `₩${SUBSCRIPTION_YEARLY_MONTHLY_PRICE.toLocaleString()}/월`, best: true },
                ].map((item, i) => (
                  <div key={i} className={`p-4 ${item.best ? 'bg-secondary' : ''}`}>
                    <div className="font-semibold text-foreground text-xs">{item.label}</div>
                    <div className="text-muted-foreground text-[11px] mb-1">{item.sub}</div>
                    <div className={`font-bold text-sm ${item.best ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>{item.price}</div>
                    {item.best && <span className="inline-block mt-1 text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">최저가</span>}
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* 무료 vs 구독 */}
          <motion.section {...fade(0.3)} className="mb-16">
            <h3 className="font-bold text-center text-foreground mb-5 text-lg">무료 체험 vs 구독</h3>
            <div className="rounded-2xl border border-border bg-white dark:bg-card overflow-hidden">
              <div className="grid grid-cols-3 text-center text-sm font-semibold border-b border-border">
                <div className="p-4 text-muted-foreground">기능</div>
                <div className="p-4 text-muted-foreground">무료 체험</div>
                <div className="p-4 bg-foreground text-background">구독</div>
              </div>
              {[
                { feature: 'AI 심층 분석', free: '1~2회', premium: '무제한' },
                { feature: '심리검사', free: '1~2회', premium: '무제한' },
                { feature: 'PDF 리포트', free: false, premium: true },
                { feature: '맞춤 솔루션', free: false, premium: true },
                { feature: '전문가 해석', free: false, premium: true },
                { feature: '트렌드 추적', free: false, premium: true },
              ].map((item, idx) => (
                <div key={idx} className="grid grid-cols-3 text-center text-sm border-b border-border/50 last:border-0">
                  <div className="p-4 font-medium text-left text-foreground">{item.feature}</div>
                  <div className="p-4 flex items-center justify-center">
                    {typeof item.free === 'boolean' ? (
                      item.free ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-muted-foreground/30" />
                    ) : (
                      <span className="text-muted-foreground text-xs">{item.free}</span>
                    )}
                  </div>
                  <div className="p-4 bg-secondary/30 flex items-center justify-center">
                    {typeof item.premium === 'boolean' ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <span className="font-semibold text-foreground text-xs">{item.premium}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* 하단 카드 */}
          <div className="grid md:grid-cols-2 gap-5 mb-16">
            <motion.div {...fade(0.35)}>
              <div className="rounded-2xl border border-border bg-white dark:bg-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">전세계 논문 기반 맞춤 큐레이션</h4>
                    <p className="text-[11px] text-muted-foreground">글로벌 연구와 평가도구를 실시간 참고</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['AI 행동분석', '발달규준 비교', '인지패턴 분석', '정서 프로파일링', '학술 연구 기반'].map((tag, i) => (
                    <span key={i} className="text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>
            <motion.div {...fade(0.4)}>
              <div className="rounded-2xl border border-border bg-white dark:bg-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">전문가 1:1 상담</h4>
                    <p className="text-[11px] text-muted-foreground">검증된 심리 전문가 · 별도 요금</p>
                  </div>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {['1:1 화상/전화 상담', '전문가 맞춤 조언', '프로필에서 요금 확인'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground" onClick={() => navigate('/expert-hiring')}>
                  전문가 프로필 보기 <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </motion.div>
          </div>

          {/* 신뢰 배지 */}
          <motion.div {...fade(0.45)} className="rounded-2xl border border-border bg-white dark:bg-card p-6">
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
    </div>
  );
};

export default TokenSubscription;
