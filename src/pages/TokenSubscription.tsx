import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Brain, Users, Crown, ArrowRight, 
  Check, Clock, Sparkles, 
  Zap, Shield, Star, Loader2,
  TrendingUp, Award, X, Heart, Target, Rocket, Lock, UserPlus, CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { usePayment } from '@/hooks/usePayment';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { SUBSCRIPTION_PRICE, SUBSCRIPTION_ORIGINAL_PRICE, SUBSCRIPTION_DISCOUNT_PERCENT } from '@/constants/tokenCosts';

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handlePayment = async () => {
    const success = await pay('subscription_monthly');
    if (success) {
      toast({ title: "결제 완료", description: "구독해주셔서 감사합니다!" });
    }
  };

  const comparisonItems = [
    { feature: 'AI 심층 분석', free: '1~2회 체험', premium: '무제한' },
    { feature: '심리검사', free: '1~2회 체험', premium: '무제한' },
    { feature: 'PDF 리포트', free: false, premium: true },
    { feature: '맞춤 솔루션', free: false, premium: true },
    { feature: '전문가 해석', free: false, premium: true },
    { feature: '트렌드 추적', free: false, premium: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/20 text-slate-900 dark:text-slate-100">
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
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">로그인 후 구독 가능합니다</h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300">가입 30초 · 모든 이용 내역이 계정에 저장됩니다</p>
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

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-10">
          <Badge className="mb-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 text-sm px-4 py-1">
            🎉 론칭 특가 {SUBSCRIPTION_DISCOUNT_PERCENT}% 할인
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent leading-tight">
            월간 구독
          </h1>
          <p className="text-lg text-slate-700 dark:text-slate-300">
            모든 AI 분석과 심리검사를 <span className="font-bold text-slate-900 dark:text-white">하루 약 660원</span>에 무제한
          </p>
        </motion.div>

        {/* 메인 구독 카드 */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
          <Card className="relative overflow-hidden border-2 border-violet-400 shadow-2xl shadow-violet-500/20 bg-gradient-to-br from-white via-violet-50/50 to-purple-50/50 dark:from-slate-900 dark:via-violet-950/30 dark:to-purple-950/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-400/20 to-rose-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <Badge className="absolute top-4 left-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 text-sm px-3 py-1 shadow-lg">
              <Rocket className="w-3 h-3 mr-1" />BEST
            </Badge>

            <CardContent className="relative p-8 md:p-10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white">월간 구독</h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400">모든 기능 무제한</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 justify-center md:justify-start">
                      <span className="text-lg text-slate-500 dark:text-slate-400 line-through">₩{SUBSCRIPTION_ORIGINAL_PRICE.toLocaleString()}</span>
                      <Badge className="bg-rose-500 text-white border-0">{SUBSCRIPTION_DISCOUNT_PERCENT}% OFF</Badge>
                    </div>
                    <div className="flex items-baseline gap-1 justify-center md:justify-start">
                      <span className="text-5xl md:text-6xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                        ₩{SUBSCRIPTION_PRICE.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      하루 <span className="font-bold text-violet-600 dark:text-violet-400">약 660원</span> · 30일간 무제한
                    </p>
                  </div>

                  <Button
                    size="lg"
                    className="w-full md:w-auto h-14 px-10 rounded-2xl font-bold text-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-xl shadow-violet-500/30 transition-all hover:scale-[1.02]"
                    onClick={handlePayment}
                    disabled={paymentLoading || !isReady || isPremium}
                  >
                    {paymentLoading ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" />결제 중...</>
                    ) : isPremium ? (
                      <><Check className="w-5 h-5 mr-2" />이미 이용 중</>
                    ) : (
                      <><Zap className="w-5 h-5 mr-2" />지금 구독하기</>
                    )}
                  </Button>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 flex items-center justify-center md:justify-start gap-1">
                    <Shield className="w-3 h-3" />7일 이내 100% 환불 보장
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: Brain, text: '모든 AI 심층 분석 무제한', highlight: true },
                    { icon: Target, text: '20종+ 심리검사 무제한' },
                    { icon: Award, text: '상세 PDF 리포트 다운로드' },
                    { icon: Heart, text: '맞춤형 솔루션 & 가이드' },
                    { icon: TrendingUp, text: '발달 트렌드 추적' },
                    { icon: Sparkles, text: '우선 고객 지원' },
                  ].map((item, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        item.highlight 
                          ? 'bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 border border-violet-200 dark:border-violet-800' 
                          : 'bg-white/60 dark:bg-slate-800/60'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${item.highlight ? 'bg-gradient-to-br from-violet-500 to-purple-500' : 'bg-slate-100 dark:bg-slate-700'}`}>
                        <item.icon className={`w-4 h-4 ${item.highlight ? 'text-white' : 'text-violet-600 dark:text-violet-400'}`} />
                      </div>
                      <span className={`font-semibold ${item.highlight ? 'text-violet-800 dark:text-violet-200' : 'text-slate-800 dark:text-slate-200'}`}>
                        {item.text}
                      </span>
                      {item.highlight && <Badge className="ml-auto bg-violet-500 text-white text-xs border-0">핵심</Badge>}
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 무료 vs 구독 비교 */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-12">
          <h3 className="text-xl font-bold text-center mb-6 text-slate-900 dark:text-white">
            무료 체험 vs <span className="text-violet-600 dark:text-violet-400">구독</span>
          </h3>
          
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-3 text-center text-sm font-bold border-b bg-slate-100 dark:bg-slate-800">
                <div className="p-4 text-slate-900 dark:text-white">기능</div>
                <div className="p-4 text-slate-700 dark:text-slate-300">무료 체험</div>
                <div className="p-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white">구독</div>
              </div>
              
              {comparisonItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-3 text-center text-sm border-b last:border-0">
                  <div className="p-4 font-semibold text-left text-slate-800 dark:text-slate-200">{item.feature}</div>
                  <div className="p-4 flex items-center justify-center">
                    {typeof item.free === 'boolean' ? (
                      item.free ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-slate-300" />
                    ) : (
                      <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">{item.free}</span>
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

        {/* 맞춤형 리포트 분석 강조 */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-12">
          <Card className="overflow-hidden border-2 border-amber-400/50 bg-gradient-to-br from-amber-50 via-orange-50/50 to-yellow-50/30 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-foreground">맞춤형 AI 리포트 분석</h4>
                  <p className="text-xs text-muted-foreground">구독자 전용 심층 리포트</p>
                </div>
                <Badge className="ml-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">구독 포함</Badge>
              </div>
              <p className="text-sm text-foreground mb-4">
                단순 점수가 아닌, <span className="font-bold text-amber-600 dark:text-amber-400">아이 맞춤형 심층 분석과 구체적인 솔루션</span>을 PDF로 제공합니다.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Brain, text: '발달 영역별 세부 분석' },
                  { icon: Target, text: '맞춤 교육 전략 제안' },
                  { icon: TrendingUp, text: '성장 추이 시각화' },
                  { icon: Sparkles, text: 'AI 기반 조기 감지' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/60 dark:bg-slate-800/60">
                    <item.icon className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* 전문가 상담 안내 */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-12">
          <Card className="overflow-hidden border border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">전문가 1:1 상담</h4>
                  <p className="text-xs text-white/70 dark:text-white/70">검증된 심리 전문가</p>
                </div>
              </div>
              <p className="text-sm text-white dark:text-white mb-3">전문가별 상담 요금이 상이합니다</p>
              <ul className="space-y-1.5 mb-4">
                {['1:1 화상/전화 상담', '전문가 맞춤 조언', '전문가 프로필에서 요금 확인'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/expert-hiring')}>
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
                  <div className="font-bold text-sm text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default TokenSubscription;
