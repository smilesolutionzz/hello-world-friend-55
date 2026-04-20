import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, ArrowRight, Check, Shield, Star, Zap,
  Lock, UserPlus, CheckCircle, Calendar
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
    const success = await pay('mind_track_30');
    if (success) {
      toast({ title: '결제 완료', description: '30일 트랙이 시작되었습니다! 코칭 목표를 설정해주세요.' });
      setTimeout(() => navigate('/coaching-goals'), 800);
    }
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
          <motion.div {...fade(0)} className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-3 border border-emerald-200 dark:border-emerald-800 rounded-full px-6 py-2.5 bg-emerald-50 dark:bg-emerald-950/30">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">{subscriptionLabel} 이용중</span>
              <Badge className="bg-emerald-600 text-white border-0 text-xs">활성</Badge>
            </div>
          </motion.div>
        )}

        {/* Hero */}
        <motion.div {...fade(0.05)} className="text-center mb-10">
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
        </motion.div>

        {/* AI 비교표 */}
        <motion.div {...fade(0.1)} className="mb-10">
          <AIComparisonTable variant="compact" />
        </motion.div>

        {/* 임상 통계 신뢰성 섹션 */}
        <motion.div {...fade(0.12)} className="mb-10 rounded-3xl border border-border bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900/50 dark:to-blue-950/20 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-foreground break-keep">
                왜 ChatGPT가 아닌 AIHPRO여야 할까요?
              </h3>
              <p className="text-[11px] md:text-xs text-muted-foreground">검증된 임상 통계 모델 기반 분석</p>
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
                <p className="text-[11px] text-muted-foreground leading-relaxed break-keep">{m.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-blue-600/5 border border-blue-200/60 dark:border-blue-800/40 p-4">
            <p className="text-xs md:text-sm text-foreground/80 leading-relaxed break-keep">
              <span className="font-bold text-foreground">일반 AI 챗봇은 텍스트 패턴만 생성합니다.</span>{' '}
              AIHPRO는 30일 트랙 동안 누적되는 데이터를 <span className="font-semibold text-blue-700 dark:text-blue-400">RCI(신뢰변화지수)</span>로 분석하여,
              "기분 탓"이 아닌 통계적으로 유의미한 변화가 일어났는지 객관적으로 증명합니다.
            </p>
            <p className="text-[10px] text-muted-foreground italic mt-2 break-keep">
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
