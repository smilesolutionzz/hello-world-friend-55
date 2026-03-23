import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Brain, Users, Crown, ArrowRight, 
  Check, Sparkles, 
  Zap, Shield, Star, Loader2,
  TrendingUp, Award, X, Heart, Target, Rocket, Lock, UserPlus, CheckCircle
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
    if (success) {
      toast({ title: "결제 완료", description: "구독해주셔서 감사합니다!" });
    }
  };

  const handlePayYearly = async () => {
    const success = await pay('subscription_yearly');
    if (success) {
      toast({ title: "결제 완료", description: "연간 구독 감사합니다!" });
    }
  };

  const handlePaySingle = async () => {
    const success = await pay('single_report');
    if (success) {
      toast({ title: "결제 완료", description: "리포트 이용권이 추가되었습니다!" });
    }
  };

  const handlePayTest = async () => {
    const success = await pay('single_test');
    if (success) {
      toast({ title: "결제 완료", description: "검사 이용권이 추가되었습니다!" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 text-foreground overflow-x-hidden">
      {/* 모바일에서는 MobilePaymentFlow 사용 */}
      <div className="md:hidden">
        <MobilePaymentFlow initialStep="plan" />
      </div>

      {/* 데스크탑에서는 기존 레이아웃 */}
      <div className="hidden md:block">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        {/* 비로그인 상태 */}
        {isAuthenticated === false && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">로그인 후 구독 가능합니다</h3>
                      <p className="text-sm text-muted-foreground">가입 30초 · 모든 이용 내역이 계정에 저장됩니다</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button onClick={() => { localStorage.setItem('auth_redirect_after', '/token-subscription'); navigate('/auth?mode=signup'); }} className="flex-1 md:flex-none bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                      <UserPlus className="w-4 h-4 mr-2" />무료 회원가입
                    </Button>
                    <Button variant="outline" onClick={() => { localStorage.setItem('auth_redirect_after', '/token-subscription'); navigate('/auth'); }} className="flex-1 md:flex-none">
                      <Lock className="w-4 h-4 mr-2" />로그인
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 구독 중 상태 */}
        {isPremium && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-950/40 dark:to-purple-950/40 border border-violet-300 dark:border-violet-700 rounded-2xl px-6 py-3 shadow-lg">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xs text-violet-600 dark:text-violet-400 font-medium">현재 이용중</div>
                <div className="text-xl font-black text-violet-700 dark:text-violet-300 flex items-center gap-2">
                  {subscriptionLabel} <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
              </div>
              <Badge className="ml-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 font-bold">무제한 이용</Badge>
            </div>
          </motion.div>
        )}

        {/* 리포트 크레딧 보유 안내 */}
        {!isPremium && reportCredits > 0 && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="border border-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20">
              <CardContent className="p-4 flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium">리포트 이용권 <Badge variant="secondary">{reportCredits}회</Badge> 보유 중</span>
                <span className="text-xs text-muted-foreground ml-auto">구독하면 무제한!</span>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-10">
          <Badge className="mb-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 text-sm px-4 py-1">
            🎉 론칭 특가 {SUBSCRIPTION_DISCOUNT_PERCENT}% 할인
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent leading-tight">
            나에게 맞는 플랜 선택
          </h1>
          <p className="text-lg text-muted-foreground">
            1회만 써보거나, 무제한으로 이용하거나
          </p>
        </motion.div>

        {/* 월간/연간 토글 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex justify-center mb-8">
          <div className="inline-flex items-center bg-muted rounded-2xl p-1 gap-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              월간
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              연간
              <Badge className="bg-destructive text-destructive-foreground text-[10px] border-0 px-1.5 py-0">-17%</Badge>
            </button>
          </div>
        </motion.div>

        {/* 듀얼 프라이싱 카드 */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* 단건 이용권 */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="h-full border border-border bg-card">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">단건 이용권</h2>
                    <p className="text-xs text-muted-foreground">필요할 때만 한 번씩</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  구독 없이 원하는 기능만 골라서 이용하세요
                </p>

                {/* 검사 1회 */}
                <div className="border border-border rounded-xl p-4 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-500" />
                      <span className="font-bold text-sm">심리검사 1회</span>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs">61% 할인</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-muted-foreground line-through">₩4,900</span>
                      <span className="text-2xl font-black text-foreground">₩{SINGLE_TEST_PRICE.toLocaleString()}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                      onClick={handlePayTest}
                      disabled={paymentLoading || !isReady}
                    >
                      {paymentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '구매'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">검사 실시 + 기본 결과 확인</p>
                </div>

                {/* 리포트 1회 */}
                <div className="border border-border rounded-xl p-4 mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="font-bold text-sm">심층 분석 리포트 1회</span>
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs">60% 할인</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-muted-foreground line-through">₩14,900</span>
                      <span className="text-2xl font-black text-foreground">₩{SINGLE_REPORT_PRICE.toLocaleString()}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                      onClick={handlePaySingle}
                      disabled={paymentLoading || !isReady}
                    >
                      {paymentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '구매'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">AI 심층 분석 + PDF 리포트 + 맞춤 솔루션</p>
                </div>

                <div className="mt-auto space-y-2">
                  {['구독 없이 바로 이용', '결제 즉시 사용 가능'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 구독 카드 (월간/연간 토글) */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
            <Card className="h-full relative overflow-hidden border-2 border-primary shadow-2xl shadow-primary/20 bg-gradient-to-br from-card via-primary/5 to-primary/10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <Badge className="absolute top-4 right-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 text-sm px-3 py-1 shadow-lg">
                <Rocket className="w-3 h-3 mr-1" />{billingCycle === 'yearly' ? 'BEST' : '인기'}
              </Badge>

              <CardContent className="relative p-8 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30">
                    <Crown className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">{billingCycle === 'monthly' ? '월간 구독' : '연간 구독'}</h2>
                    <p className="text-xs text-muted-foreground">
                      {billingCycle === 'monthly' ? '모든 기능 무제한' : '월간 대비 17% 절약'}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  {billingCycle === 'monthly' 
                    ? '하루 약 330원으로 모든 AI 분석, 심리검사, 리포트를 무제한 이용'
                    : '하루 약 271원으로 모든 AI 분석, 심리검사, 리포트를 무제한 이용'
                  }
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-muted-foreground line-through">
                      ₩{billingCycle === 'monthly' ? SUBSCRIPTION_ORIGINAL_PRICE.toLocaleString() : SUBSCRIPTION_YEARLY_ORIGINAL_PRICE.toLocaleString()}
                    </span>
                    <Badge className="bg-destructive text-destructive-foreground border-0">
                      {billingCycle === 'monthly' ? SUBSCRIPTION_DISCOUNT_PERCENT : SUBSCRIPTION_YEARLY_DISCOUNT_PERCENT}% OFF
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-4xl font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      ₩{billingCycle === 'monthly' ? SUBSCRIPTION_PRICE.toLocaleString() : SUBSCRIPTION_YEARLY_PRICE.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-sm">{billingCycle === 'monthly' ? '/월' : '/년'}</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-xs text-primary font-semibold mt-1">
                      월 ₩{SUBSCRIPTION_YEARLY_MONTHLY_PRICE.toLocaleString()} 꼴 · 연 ₩19,800 절약
                    </p>
                  )}
                  {billingCycle === 'monthly' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      3번만 써도 단건보다 이득!
                    </p>
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
                    <div key={i} className={`flex items-center gap-2 text-sm ${item.highlight ? 'font-semibold' : ''}`}>
                      <Check className={`w-4 h-4 flex-shrink-0 ${item.highlight ? 'text-primary' : 'text-emerald-500'}`} />
                      <span className="text-foreground">{item.text}</span>
                      {item.highlight && <Badge className="ml-auto bg-primary text-primary-foreground text-[10px] border-0 px-1.5">핵심</Badge>}
                    </div>
                  ))}
                </div>

                <Button
                  size="lg"
                  className="w-full h-14 rounded-2xl font-bold text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:scale-[1.02]"
                  onClick={billingCycle === 'monthly' ? handlePaySubscription : handlePayYearly}
                  disabled={paymentLoading || !isReady || isPremium}
                >
                  {paymentLoading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />결제 중...</>
                  ) : isPremium ? (
                    <><Check className="w-5 h-5 mr-2" />이미 이용 중</>
                  ) : (
                    <><Crown className="w-5 h-5 mr-2" />
                      {billingCycle === 'monthly' 
                        ? `구독 시작하기 — ₩${SUBSCRIPTION_PRICE.toLocaleString()}/월`
                        : `연간 구독 — ₩${SUBSCRIPTION_YEARLY_PRICE.toLocaleString()}/년`
                      }
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground mt-3 text-center flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" />7일 이내 100% 환불 보장 · 언제든 해지
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 가격 비교 계산 */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-12">
          <Card className="overflow-hidden bg-muted/30 border-border">
            <CardContent className="p-6">
              <h3 className="font-bold text-center mb-4">💡 어떤 플랜이 나에게 맞을까?</h3>
              <div className="grid grid-cols-5 gap-2 text-center text-sm">
                <div className="p-3 rounded-xl bg-background/60">
                  <div className="font-bold text-foreground">검사 1회</div>
                  <div className="text-muted-foreground text-xs mb-1">단건</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">₩{SINGLE_TEST_PRICE.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-xl bg-background/60">
                  <div className="font-bold text-foreground">리포트 1회</div>
                  <div className="text-muted-foreground text-xs mb-1">단건</div>
                  <div className="font-bold text-amber-600 dark:text-amber-400">₩{SINGLE_REPORT_PRICE.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-xl bg-background/60">
                  <div className="font-bold text-foreground">검사+리포트</div>
                  <div className="text-muted-foreground text-xs mb-1">각 1회</div>
                  <div className="font-bold text-foreground">₩{(SINGLE_TEST_PRICE + SINGLE_REPORT_PRICE).toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-xl bg-background/60">
                  <div className="font-bold text-foreground">무제한</div>
                  <div className="text-muted-foreground text-xs mb-1">월간 구독</div>
                  <div className="font-bold text-violet-600 dark:text-violet-400">₩{SUBSCRIPTION_PRICE.toLocaleString()}/월</div>
                </div>
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/30">
                  <div className="font-bold text-primary">무제한</div>
                  <div className="text-muted-foreground text-xs mb-1">연간 구독</div>
                  <div className="font-bold text-primary">₩{SUBSCRIPTION_YEARLY_MONTHLY_PRICE.toLocaleString()}/월</div>
                  <Badge className="mt-1 bg-primary text-primary-foreground text-[10px] border-0">최저가!</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* 무료 vs 구독 비교 */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-12">
          <h3 className="text-xl font-bold text-center mb-6">
            무료 체험 vs <span className="text-violet-600 dark:text-violet-400">구독</span>
          </h3>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-3 text-center text-sm font-bold border-b bg-slate-100 dark:bg-slate-800">
                <div className="p-4">기능</div>
                <div className="p-4 text-muted-foreground">무료 체험</div>
                <div className="p-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white">구독</div>
              </div>
              {[
                { feature: 'AI 심층 분석', free: '1~2회', premium: '무제한' },
                { feature: '심리검사', free: '1~2회', premium: '무제한' },
                { feature: 'PDF 리포트', free: false, premium: true },
                { feature: '맞춤 솔루션', free: false, premium: true },
                { feature: '전문가 해석', free: false, premium: true },
                { feature: '트렌드 추적', free: false, premium: true },
              ].map((item, idx) => (
                <div key={idx} className="grid grid-cols-3 text-center text-sm border-b last:border-0">
                  <div className="p-4 font-semibold text-left">{item.feature}</div>
                  <div className="p-4 flex items-center justify-center">
                    {typeof item.free === 'boolean' ? (
                      item.free ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-slate-300" />
                    ) : (
                      <span className="text-muted-foreground text-xs font-medium">{item.free}</span>
                    )}
                  </div>
                  <div className="p-4 bg-violet-50/50 dark:bg-violet-950/20 flex items-center justify-center">
                    {typeof item.premium === 'boolean' ? (
                      <Check className="w-5 h-5 text-violet-500" />
                    ) : (
                      <span className="font-bold text-violet-700 dark:text-violet-300 text-xs">{item.premium}</span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.section>

        {/* 논문 기반 섹션 */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-12">
          <Card className="overflow-hidden border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50/80 via-background to-indigo-50/50 dark:from-violet-950/40 dark:via-slate-900 dark:to-indigo-950/30">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-black text-lg">전세계 논문 기반 맞춤 큐레이션</h4>
                  <p className="text-sm text-muted-foreground">글로벌 연구와 진단도구를 실시간 참고합니다</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['DSM-5 기반', 'K-CDI 참조', 'Bayley 발달척도', 'CBCL 행동평가', '학술 논문 실시간 반영'].map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-violet-100/50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* 전문가 상담 안내 */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mb-12">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold">전문가 1:1 상담</h4>
                  <p className="text-xs text-muted-foreground">검증된 심리 전문가</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">전문가별 상담 요금이 상이합니다</p>
              <ul className="space-y-1.5 mb-4">
                {['1:1 화상/전화 상담', '전문가 맞춤 조언', '전문가 프로필에서 요금 확인'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/expert-hiring')}>
                전문가 프로필 보기 <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </motion.section>

        {/* 신뢰 배지 */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: Shield, label: '환불 보장', sub: '7일 이내', gradient: 'from-emerald-500 to-teal-500' },
              { icon: Zap, label: '즉시 이용', sub: '결제 즉시', gradient: 'from-blue-500 to-cyan-500' },
              { icon: Star, label: '안전 결제', sub: '토스페이먼츠', gradient: 'from-violet-500 to-purple-500' },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${item.gradient}`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
      </div>
    </div>
  );
};

export default TokenSubscription;