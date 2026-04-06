import React, { useState, useEffect, useRef } from 'react';
import SEOHead from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { motion } from 'framer-motion';
import {
  FileText, Crown, Brain, Heart, TrendingUp, Target, LineChart,
  Users, Shield, Activity, BarChart3, ArrowRight, Lock,
  AlertTriangle, CheckCircle2, Zap, Clock, Star, ChevronDown,
  Sparkles, Eye, ArrowLeft
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useLanguage } from '@/i18n/LanguageContext';
import { SUBSCRIPTION_PRICE, SINGLE_REPORT_PRICE } from '@/constants/tokenCosts';

// 레이더 차트 샘플 데이터
const radarData = [
  { subject: '인지', value: 72, fullMark: 100 },
  { subject: '정서', value: 58, fullMark: 100 },
  { subject: '사회성', value: 65, fullMark: 100 },
  { subject: '언어', value: 80, fullMark: 100 },
  { subject: '운동', value: 75, fullMark: 100 },
];

// 바 차트 샘플 데이터
const barData = [
  { name: '집중력', score: 45, avg: 70 },
  { name: '감정조절', score: 38, avg: 65 },
  { name: '자존감', score: 55, avg: 72 },
  { name: '사회적응', score: 60, avg: 68 },
];

const ReportGenerator = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isPremiumUser, loading: subLoading } = useSubscription();
  const { isEnglish, localePath } = useLanguage();
  const ctaRef = useRef<HTMLDivElement>(null);

  const isPremium = isPremiumUser();

  useEffect(() => { loadUserData(); }, []);

  const loadUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsLoggedIn(false); setIsLoading(false); return; }
      setIsLoggedIn(true);
      const [{ data: assessments }, { data: observations }] = await Promise.all([
        supabase.from('assessments').select('age_group, risk_level, results, created_at').or(`user_id.eq.${session.user.id},profile_id.eq.${session.user.id}`).order('created_at', { ascending: false }).limit(5),
        supabase.from('observation_logs').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(5),
      ]);
      setUserData({
        assessmentCount: assessments?.length || 0,
        observationCount: observations?.length || 0,
        latestRisk: assessments?.[0]?.risk_level || null,
        latestAgeGroup: assessments?.[0]?.age_group || null,
      });
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handlePayment = () => {
    if (!isLoggedIn) {
      localStorage.setItem('auth_redirect_after', localePath('/report-generator'));
      navigate(localePath('/auth'));
      return;
    }
    navigate(localePath('/token-subscription'));
  };

  const scrollToCTA = () => {
    ctaRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading || subLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
          <Brain className="w-6 h-6 text-primary-foreground" />
        </motion.div>
      </div>
    );
  }

  // 프리미엄 사용자는 기존 리포트 생성 플로우로
  if (isPremium && isLoggedIn) {
    navigate(localePath('/report-generator-pro'));
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="AI 종합 리포트 - AIHPRO | 행동 데이터 기반 심층 분석"
        description="검사 결과 기반 AI 행동 분석 리포트. 기질 유형, 정서 상태, 위험 신호, 부모 맞춤 대응 전략까지."
        keywords="심리리포트,행동분석,AI리포트,발달평가,심리검사결과"
        canonicalUrl="https://aihpro.app/report-generator"
      />

      <div className="max-w-lg mx-auto px-4 pb-32">
        {/* 뒤로가기 */}
        <Button onClick={() => navigate(localePath('/'))} variant="ghost" className="mt-4 mb-2 text-muted-foreground hover:text-foreground gap-2 text-sm px-2">
          <ArrowLeft className="w-4 h-4" /> 뒤로
        </Button>

        {/* ─── 섹션 1: 결과 리마인드 ─── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">분석 완료</p>
                <h2 className="text-lg font-bold text-foreground">아이의 분석 결과가 생성되었습니다</h2>
              </div>
            </div>

            {/* 기질/정서 미리보기 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-100 dark:border-blue-900/50">
                <Brain className="w-5 h-5 text-blue-500 mb-2" />
                <p className="text-xs text-muted-foreground">기질 유형</p>
                <p className="text-sm font-bold text-foreground">민감-탐색형</p>
                <div className="mt-2 h-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-full overflow-hidden">
                  <div className="h-full w-[72%] bg-blue-500 rounded-full" />
                </div>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-4 border border-rose-100 dark:border-rose-900/50">
                <Heart className="w-5 h-5 text-rose-500 mb-2" />
                <p className="text-xs text-muted-foreground">정서 상태</p>
                <p className="text-sm font-bold text-foreground">주의 관찰 필요</p>
                <div className="mt-2 h-1.5 bg-rose-100 dark:bg-rose-900/50 rounded-full overflow-hidden">
                  <div className="h-full w-[58%] bg-rose-500 rounded-full" />
                </div>
              </div>
            </div>

            {/* 데이터 기반 강조 */}
            {userData && userData.assessmentCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                <BarChart3 className="w-4 h-4 text-primary" />
                <p className="text-xs text-muted-foreground">
                  검사 {userData.assessmentCount}건 · 관찰 {userData.observationCount}건의 행동 데이터 분석 완료
                </p>
              </div>
            )}
          </div>
        </motion.section>

        {/* ─── 섹션 2: 부족함 강조 ─── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/50 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-foreground">지금 보신 결과는 일부입니다</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  전체 리포트에는 아래 항목이 포함되어 있지만,<br/>
                  아직 확인하지 않으셨습니다.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { icon: AlertTriangle, text: '문제 원인 분석 및 위험 신호 감지', color: 'text-red-500' },
                { icon: Target, text: '맞춤형 개입 방법 및 해결 전략', color: 'text-purple-500' },
                { icon: Users, text: '부모 행동 가이드 및 양육 코칭', color: 'text-blue-500' },
                { icon: Shield, text: '전문가 수준의 임상 소견서', color: 'text-teal-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-background/80 rounded-xl px-4 py-3 border border-border/50">
                  <Lock className="w-4 h-4 text-muted-foreground/50" />
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-sm text-foreground/80">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ─── 섹션 3: 프리미엄 리포트 해결책 ─── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <div className="text-center mb-5">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
              <Crown className="w-3 h-3 mr-1" /> 프리미엄 리포트
            </Badge>
            <h3 className="text-xl font-black text-foreground">
              전체 분석 리포트에서<br/>확인할 수 있는 것들
            </h3>
          </div>

          <div className="space-y-3">
            {[
              { icon: Brain, title: '행동 패턴 심층 분석', desc: '15개 심리이론 기반 인지·정서·사회성 종합 프로파일', gradient: 'from-blue-500 to-cyan-500' },
              { icon: AlertTriangle, title: '문제 가능성 진단', desc: 'DSM-5 기반 위험 신호 조기 감지 및 경고 시스템', gradient: 'from-red-500 to-orange-500' },
              { icon: Target, title: '부모 맞춤 대응 전략', desc: 'ABA·CBT·Floortime 기반 가정 내 개입 프로그램', gradient: 'from-purple-500 to-violet-500' },
              { icon: Shield, title: '전문가 연결 가이드', desc: '아이의 상태에 맞는 전문가 유형 및 기관 추천', gradient: 'from-teal-500 to-emerald-500' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-4 bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.gradient} shrink-0`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ─── 섹션 4: 리포트 샘플 UI ─── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 text-center">
              <p className="text-xs text-white/60 mb-1">리포트 미리보기</p>
              <h4 className="text-base font-bold text-white">AI 종합 분석 리포트 샘플</h4>
            </div>

            <div className="p-5 space-y-5">
              {/* 레이더 차트 */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> 5대 영역 발달 프로파일
                </p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="점수" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 바 차트 */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5" /> 핵심 지표 vs 또래 평균
                </p>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="score" name="아이 점수" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="avg" name="또래 평균" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 텍스트 분석 미리보기 - 블러 처리 */}
              <div className="relative">
                <div className="space-y-2 blur-sm select-none pointer-events-none">
                  <p className="text-sm text-foreground font-semibold">📋 종합 소견</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    대상 아동은 전조작기에서 구체적 조작기로의 전환 과정에 있으며, 
                    근접발달영역 관점에서 적절한 지원이 제공될 경우 인지 발달의 
                    비약적 성장이 예상됩니다. AI 인지패턴 분석 결과...
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    주의력 관련 항목에서 경계선 수준의 반응이 관찰되었으며,
                    애착유형 기반 정서적 안정감 분석에서...
                  </p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-card/90 backdrop-blur-sm px-5 py-3 rounded-xl border border-border shadow-lg flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">전체 내용은 리포트에서 확인</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ─── 섹션 5: 가격 + 긴급성 ─── */}
        <motion.section ref={ctaRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
          <div className="bg-card rounded-2xl border-2 border-primary/30 p-6 space-y-5">
            {/* 긴급성 뱃지 */}
            <div className="flex items-center justify-center gap-2">
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full border border-red-200 dark:border-red-900/50 text-xs font-bold">
                <Clock className="w-3.5 h-3.5" /> 초기 사용자 한정 특별가
              </motion.div>
            </div>

            {/* 가격 */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-3">
                <span className="text-lg text-muted-foreground line-through">₩14,900</span>
                <Badge variant="destructive" className="text-xs font-bold">-73%</Badge>
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-black text-foreground">₩{SINGLE_REPORT_PRICE.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">/1회</span>
              </div>
              <p className="text-xs text-muted-foreground">
                또는 월 ₩{SUBSCRIPTION_PRICE.toLocaleString()}으로 무제한 이용
              </p>
            </div>

            {/* 포함 항목 */}
            <div className="space-y-2">
              {[
                '9가지 전문 분석 섹션 (박사급 임상 수준)',
                '500+ 논문 기반 행동 데이터 분석',
                'PDF 다운로드 · 이메일 공유',
                '전문가 연결 가이드 포함',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs text-foreground">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA 버튼 */}
            <Button onClick={handlePayment} size="lg"
              className="w-full h-14 text-base font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/20">
              <Crown className="w-5 h-5 mr-2" />
              {isLoggedIn ? '지금 전체 리포트 확인하기' : '회원가입하고 리포트 받기'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            {/* 신뢰 배지 */}
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> 안전 결제</span>
              <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> 즉시 생성</span>
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> 만족도 96%</span>
            </div>
          </div>
        </motion.section>

        {/* ─── 섹션 6: 전문가 상담 연결 CTA ─── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-8">
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">리포트 확인 후</p>
              <h3 className="text-base font-bold text-foreground">전문가 상담으로 구체적인 방향 확인</h3>
              <p className="text-xs text-muted-foreground">
                아이의 행동 데이터를 기반으로 전문가가<br/>맞춤 솔루션을 제안합니다
              </p>
            </div>
            <Button onClick={() => navigate(localePath('/expert-hiring'))} variant="outline"
              className="w-full rounded-xl border-border hover:bg-muted/50 text-sm font-semibold h-11">
              전문가 상담 연결하기 <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.section>

        {/* ─── 섹션 7: 변화 추적 CTA ─── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-8">
          <div className="bg-muted/30 rounded-2xl border border-border p-6 space-y-3 text-center">
            <Activity className="w-8 h-8 text-primary mx-auto" />
            <h4 className="text-sm font-bold text-foreground">지속적인 변화 추적</h4>
            <p className="text-xs text-muted-foreground">
              아이의 행동 데이터를 기반으로<br/>정기적인 분석과 변화 리포트를 제공합니다
            </p>
            <Button onClick={() => navigate(localePath('/observation-log'))} variant="ghost"
              className="text-primary text-xs font-semibold hover:bg-primary/5">
              변화 추적 시작하기 <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </motion.section>

        {/* 법적 고지 */}
        <div className="text-center py-6">
          <p className="text-[10px] text-muted-foreground/60">
            본 분석은 AI 기반 자동 분석이며, 의학적 진단을 대체하지 않습니다.<br/>
            © 2025 AIHPRO. All Rights Reserved.
          </p>
        </div>
      </div>

      {/* ─── Sticky CTA ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border px-4 py-3 safe-area-inset-bottom">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground line-through">₩14,900</span>
              <span className="text-xl font-black text-foreground">₩{SINGLE_REPORT_PRICE.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate">오늘만 특별가 · 초기 사용자 한정</p>
          </div>
          <Button onClick={handlePayment} size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 rounded-xl shadow-lg shadow-primary/20 shrink-0">
            <Crown className="w-4 h-4 mr-1.5" />
            리포트 받기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
