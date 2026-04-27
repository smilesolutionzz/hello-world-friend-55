import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, ArrowRight, Check, Shield, Lock, UserPlus, CheckCircle,
  Calendar, Target, Heart,
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { usePayment } from '@/hooks/usePayment';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import {
  MIND_TRACK_PRICE,
  MIND_TRACK_ORIGINAL_PRICE,
  MIND_TRACK_DISCOUNT_PERCENT,
} from '@/constants/tokenCosts';
import BeforeAfterCard from '@/components/mind-track/BeforeAfterCard';
import DailyMissionPreview from '@/components/mind-track/DailyMissionPreview';
import WeeklyReportPreview from '@/components/mind-track/WeeklyReportPreview';
import ExpertCreditFlow from '@/components/mind-track/ExpertCreditFlow';

/**
 * 결제 페이지 — 30일 마음 변화 트랙 (₩19,900 일시불)
 *
 * 구조: 한 줄 정체성 → 히어로(고민 칩 + 가격) → Before/After
 *      → 데일리 미션 미리보기 → 주간 리포트 미리보기 → 전문가 상담권 흐름
 *      → 환불 보장 + FAQ + 최종 CTA
 */

const CONCERN_CHIPS = [
  { id: 'depression', label: '우울', emoji: '😔' },
  { id: 'anxiety', label: '불안', emoji: '😰' },
  { id: 'sleep', label: '수면', emoji: '😴' },
  { id: 'selfworth', label: '자존감', emoji: '💪' },
  { id: 'relationship', label: '관계', emoji: '❤️' },
  { id: 'parenting', label: '육아', emoji: '👶' },
];

const FAQS = [
  {
    q: '결제 후 자동으로 다시 결제되나요?',
    a: '아니요. 30일 일시불 상품으로 자동 갱신·정기 결제가 일절 없습니다.',
  },
  {
    q: '30일이 끝나면 어떻게 되나요?',
    a: '데이터·리포트는 모두 보존되며, 원하면 다시 30일 트랙을 결제할 수 있어요. 강제 연장은 없습니다.',
  },
  {
    q: '환불은 어떻게 받나요?',
    a: '결제 후 7일 이내 100% 환불 보장입니다. 마이페이지 → 결제 내역 → 환불 요청 한 번이면 됩니다.',
  },
];

const TokenSubscription = () => {
  const navigate = useNavigate();
  const { isPremiumUser, isLifetimeUser, getSubscriptionLabel } = useSubscription();
  const { pay, loading: paymentLoading, isReady } = usePayment();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null);

  const isPremium = isPremiumUser() || isLifetimeUser();
  const subscriptionLabel = getSubscriptionLabel();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
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
  };

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.4 },
  });

  return (
    <div className="min-h-screen bg-white dark:bg-background text-foreground overflow-x-hidden">
      <UnifiedNavigation />

      <div className="container mx-auto px-4 pt-24 md:pt-28 pb-20 max-w-3xl">
        {/* ─────────── 페이지 정체성 한 줄 ─────────── */}
        <motion.div {...fade(0)} className="mb-6">
          <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-foreground/90 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-background" />
            </div>
            <div className="text-sm leading-relaxed text-foreground break-keep">
              <span className="font-bold">결제 페이지</span> · 30일 마음 변화 트랙(₩{MIND_TRACK_PRICE.toLocaleString()})을 한 번 결제하면
              <span className="font-semibold"> 매일 코칭 미션 · 주간 리포트 · 전문가 상담 1회권</span>이 30일간 열립니다.
              <span className="text-muted-foreground"> 자동 결제 없음 · 7일 환불 보장.</span>
            </div>
          </div>
        </motion.div>

        {/* ─────────── 비로그인 배너 ─────────── */}
        {isAuthenticated === false && (
          <motion.div {...fade(0.05)} className="mb-6 rounded-2xl border border-border bg-white dark:bg-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

        {/* ─────────── 이용중 상태 ─────────── */}
        {isPremium && (
          <motion.div {...fade(0.05)} className="mb-8">
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

        {/* ─────────── 히어로 ─────────── */}
        <motion.div {...fade(0.1)} className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-rose-100 dark:border-rose-900">
            <Sparkles className="w-3 h-3" />
            론칭 특가 {MIND_TRACK_DISCOUNT_PERCENT}% 할인
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3 text-foreground tracking-tight break-keep">
            30일이면, 마음이 바뀝니다
          </h1>
          <p className="text-muted-foreground text-base md:text-lg break-keep">
            나의 가장 큰 고민을 골라보세요. 30일 코칭이 거기서 시작됩니다.
          </p>

          {/* 고민 칩 — 사용자가 자기 문제를 인식 */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
            {CONCERN_CHIPS.map((c) => {
              const active = selectedConcern === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedConcern(c.id)}
                  className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                    active
                      ? 'bg-foreground text-background border-foreground scale-105 shadow-md'
                      : 'bg-white dark:bg-card border-border text-foreground hover:border-foreground/40'
                  }`}
                >
                  <span className="mr-1.5">{c.emoji}</span>{c.label}
                </button>
              );
            })}
          </div>
          {selectedConcern && (
            <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ 선택 완료 — 결제 후 이 주제로 매일 미션이 맞춤 발송됩니다
            </p>
          )}
        </motion.div>

        {/* ─────────── 가격 카드 (간결 버전) ─────────── */}
        <motion.div {...fade(0.15)} className="mb-2">
          <div className="rounded-3xl border-2 border-foreground bg-white dark:bg-card p-6 md:p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-foreground text-background text-xs font-bold px-4 py-1.5 rounded-full">
                BEST VALUE · 단일 상품
              </span>
            </div>

            <div className="flex items-center gap-3 mb-5 mt-2">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-foreground">30일 마음 변화 트랙</h2>
                <p className="text-xs text-muted-foreground">AI 코칭 + 전문가 상담 · 일시불</p>
              </div>
            </div>

            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-muted-foreground line-through">₩{MIND_TRACK_ORIGINAL_PRICE.toLocaleString()}</span>
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-full">
                  {MIND_TRACK_DISCOUNT_PERCENT}% OFF
                </span>
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-4xl md:text-5xl font-black text-foreground">₩{MIND_TRACK_PRICE.toLocaleString()}</span>
                <span className="text-muted-foreground text-sm">· 일시불</span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1.5">
                하루 약 ₩{Math.round(MIND_TRACK_PRICE / 30).toLocaleString()} · 자동 결제 없음 · 30일 후 자동 종료
              </p>
            </div>

            <div className="space-y-2.5 mb-6">
              {[
                '매일 오전 8시 박사급 1:1 코칭 메일 (30일)',
                '주간 변화 리포트 (RCI 기반)',
                '전문가 1:1 상담 1회권 포함',
                '20종+ 심리검사 무제한 이용',
                '종료 시 변화 종합 PDF',
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-foreground">{t}</span>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="w-full h-14 rounded-xl font-bold text-base md:text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              onClick={handlePay}
              disabled={paymentLoading || !isReady || isPremium}
            >
              {paymentLoading ? '결제 진행 중...' : isPremium ? (
                <><Check className="w-5 h-5 mr-2" />이미 이용 중</>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  ₩{MIND_TRACK_PRICE.toLocaleString()} 결제하고 내일 아침 8시부터 시작
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            <p className="text-[11px] md:text-xs text-muted-foreground mt-3 text-center flex items-center justify-center gap-1.5">
              <Shield className="w-3 h-3" />
              7일 이내 100% 환불 보장 · 토스페이먼츠 안전 결제
            </p>
          </div>
        </motion.div>

        {/* ─────────── ⭐ Before/After ─────────── */}
        <BeforeAfterCard onPayClick={handlePay} />

        {/* ─────────── ⭐ 데일리 미션 미리보기 ─────────── */}
        <DailyMissionPreview />

        {/* ─────────── ⭐ 주간 리포트 미리보기 ─────────── */}
        <WeeklyReportPreview />

        {/* ─────────── ⭐ 전문가 상담권 흐름 ─────────── */}
        <ExpertCreditFlow />

        {/* ─────────── 환불 보장 카드 ─────────── */}
        <motion.div {...fade(0.1)} className="my-12 rounded-3xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 p-6 md:p-8 text-center">
          <Shield className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
          <h3 className="text-xl md:text-2xl font-black text-foreground mb-2 break-keep">
            7일 이내 100% 환불 보장
          </h3>
          <p className="text-sm md:text-base text-muted-foreground break-keep max-w-md mx-auto">
            결제 후 7일 안에 마음에 들지 않으면, 마이페이지 한 번 클릭으로 전액 환불해 드립니다.
            <strong className="text-foreground"> 부담 없이 시작해보세요.</strong>
          </p>
        </motion.div>

        {/* ─────────── FAQ ─────────── */}
        <motion.div {...fade(0.1)} className="my-12">
          <h2 className="text-xl md:text-2xl font-black text-foreground text-center mb-6 break-keep">
            자주 묻는 질문
          </h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className="rounded-2xl border border-border bg-white dark:bg-card p-5">
                <h3 className="font-bold text-foreground mb-2 flex items-start gap-2 break-keep">
                  <span className="text-primary flex-shrink-0">Q.</span>
                  <span>{f.q}</span>
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed pl-6 break-keep">{f.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─────────── 최종 CTA ─────────── */}
        <motion.div {...fade(0.1)} className="rounded-3xl bg-foreground text-background p-7 md:p-10 text-center">
          <Heart className="w-10 h-10 mx-auto mb-3 text-rose-300" />
          <h2 className="text-2xl md:text-3xl font-black mb-2 break-keep">
            오늘 결제하면, 내일 아침 8시부터 시작합니다
          </h2>
          <p className="text-background/70 text-sm md:text-base mb-6 break-keep">
            30일 후 달라진 마음을 만나보세요. 마음에 들지 않으면 7일 안에 100% 환불.
          </p>
          <Button
            size="lg"
            className="h-14 px-8 rounded-xl font-bold text-base md:text-lg bg-white text-foreground hover:bg-white/90"
            onClick={handlePay}
            disabled={paymentLoading || !isReady || isPremium}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            ₩{MIND_TRACK_PRICE.toLocaleString()} 결제하기
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default TokenSubscription;
