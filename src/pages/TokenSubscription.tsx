import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Brain, Users, Crown, ArrowRight, 
  Check, Coins, Clock, Gift, Sparkles, 
  MessageCircle, Zap, Shield, Star, Loader2,
  TrendingUp, Award, X, Heart, Target, Rocket, Lock, UserPlus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTokens } from '@/hooks/useTokens';
import { useSubscription } from '@/hooks/useSubscription';
import { usePayment } from '@/hooks/usePayment';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

const TokenSubscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tokenBalance } = useTokens();
  const { isPremiumUser, isLifetimeUser, getSubscriptionLabel } = useSubscription();
  const { pay, loading: paymentLoading, isReady } = usePayment();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const isPremium = isPremiumUser() || isLifetimeUser();
  const subscriptionLabel = getSubscriptionLabel();

  // 인증 상태 확인
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

  const handlePayment = async (productId: string) => {
    setSelectedProduct(productId);
    const success = await pay(productId);
    if (success) {
      toast({ 
        title: "결제 완료", 
        description: "구매해주셔서 감사합니다!" 
      });
    }
    setSelectedProduct(null);
  };

  const isLoading = (productId: string) => paymentLoading && selectedProduct === productId;

  // 무료 vs 프리미엄 비교 항목
  const comparisonItems = [
    { feature: 'AI 심층 분석', free: '결과만 미리보기', premium: '무제한 상세분석' },
    { feature: '심리검사', free: '기본 3종만', premium: '20종+ 전체 이용' },
    { feature: 'PDF 리포트', free: false, premium: true },
    { feature: '맞춤 솔루션', free: false, premium: true },
    { feature: '전문가 해석', free: false, premium: true },
    { feature: '트렌드 추적', free: false, premium: true },
  ];

  // 캐시 충전 상품
  const cashProducts = [
    {
      id: 'cash_5000',
      name: '5,000캐시',
      price: 5000,
      tokens: 50,
      bonus: 0,
      features: ['AI 심층분석 1회', '즉시 사용 가능'],
    },
    {
      id: 'cash_10000',
      name: '11,000캐시',
      price: 10000,
      tokens: 110,
      bonus: 10,
      features: ['AI 심층분석 2회+', '10% 보너스 포함'],
      popular: true,
    },
  ];

  // 상담 상품
  const consultProducts = [
    {
      id: 'consult_30',
      name: '30분 상담',
      price: 35000,
      duration: '30분',
      features: ['1:1 화상/전화 상담', '전문가 맞춤 조언'],
    },
    {
      id: 'consult_60',
      name: '60분 상담',
      price: 65000,
      duration: '60분',
      features: ['심층 분석 및 조언', '후속 질문 포함'],
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/20">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        {/* 비로그인 상태 - 로그인 유도 배너 */}
        {isAuthenticated === false && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">로그인 후 결제 가능합니다</h3>
                      <p className="text-sm text-muted-foreground">
                        가입 30초 · 모든 결제 내역과 이용권이 계정에 저장됩니다
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button 
                      onClick={() => {
                        localStorage.setItem('auth_redirect_after', '/token-subscription');
                        navigate('/auth?mode=signup');
                      }}
                      className="flex-1 md:flex-none bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      무료 회원가입
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        localStorage.setItem('auth_redirect_after', '/token-subscription');
                        navigate('/auth');
                      }}
                      className="flex-1 md:flex-none"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      로그인
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 현재 상태 표시 */}
        {isPremium && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-950/40 dark:to-purple-950/40 border border-violet-300 dark:border-violet-700 rounded-2xl px-6 py-3 shadow-lg">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xs text-violet-600 dark:text-violet-400 font-medium">현재 이용중</div>
                <div className="text-xl font-black text-violet-700 dark:text-violet-300 flex items-center gap-2">
                  {subscriptionLabel}
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
              </div>
              <Badge className="ml-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 font-bold">
                무제한 이용
              </Badge>
            </div>
          </motion.div>
        )}

        {/* Hero Section - 프리미엄 강조 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10"
        >
          <Badge className="mb-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 text-sm px-4 py-1">
            🎉 론칭 기념 40% 할인 중
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent leading-tight">
            프리미엄 멤버십
          </h1>
          <p className="text-lg text-muted-foreground">
            모든 AI 분석과 심리검사를 <span className="font-bold text-foreground">하루 1,000원</span>에 무제한
          </p>
        </motion.div>

        {/* 메인 프리미엄 카드 */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card className="relative overflow-hidden border-2 border-violet-400 shadow-2xl shadow-violet-500/20 bg-gradient-to-br from-white via-violet-50/50 to-purple-50/50 dark:from-slate-900 dark:via-violet-950/30 dark:to-purple-950/30">
            {/* 배경 장식 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-400/20 to-rose-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <Badge className="absolute top-4 left-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 text-sm px-3 py-1 shadow-lg">
              <Rocket className="w-3 h-3 mr-1" />
              BEST
            </Badge>

            <CardContent className="relative p-8 md:p-10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* 왼쪽: 가격 및 CTA */}
                <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black">30일 프리미엄</h2>
                      <p className="text-sm text-muted-foreground">모든 기능 무제한</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 justify-center md:justify-start">
                      <span className="text-lg text-muted-foreground line-through">₩49,900</span>
                      <Badge className="bg-rose-500 text-white border-0">40% OFF</Badge>
                    </div>
                    <div className="flex items-baseline gap-1 justify-center md:justify-start">
                      <span className="text-5xl md:text-6xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                        ₩29,900
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      하루 <span className="font-bold text-violet-600">약 1,000원</span> · 30일간 무제한
                    </p>
                  </div>

                  <Button
                    size="lg"
                    className="w-full md:w-auto h-14 px-10 rounded-2xl font-bold text-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-xl shadow-violet-500/30 transition-all hover:scale-[1.02]"
                    onClick={() => handlePayment('pass_30')}
                    disabled={paymentLoading || !isReady || isPremium}
                  >
                    {isLoading('pass_30') ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        결제 중...
                      </>
                    ) : isPremium ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        이미 이용 중
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        지금 시작하기
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center md:justify-start gap-1">
                    <Shield className="w-3 h-3" />
                    7일 이내 100% 환불 보장
                  </p>
                </div>

                {/* 오른쪽: 혜택 리스트 */}
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
                      <div className={`p-2 rounded-lg ${
                        item.highlight 
                          ? 'bg-gradient-to-br from-violet-500 to-purple-500' 
                          : 'bg-slate-100 dark:bg-slate-700'
                      }`}>
                        <item.icon className={`w-4 h-4 ${item.highlight ? 'text-white' : 'text-violet-600 dark:text-violet-400'}`} />
                      </div>
                      <span className={`font-medium ${item.highlight ? 'text-violet-700 dark:text-violet-300' : ''}`}>
                        {item.text}
                      </span>
                      {item.highlight && (
                        <Badge className="ml-auto bg-violet-500 text-white text-xs border-0">핵심</Badge>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 무료 vs 프리미엄 비교 */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h3 className="text-xl font-bold text-center mb-6">
            무료 vs 프리미엄 <span className="text-violet-600">비교</span>
          </h3>
          
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-3 text-center text-sm font-bold border-b bg-slate-50 dark:bg-slate-800/50">
                <div className="p-4">기능</div>
                <div className="p-4 text-muted-foreground">무료</div>
                <div className="p-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white">프리미엄</div>
              </div>
              
              {comparisonItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-3 text-center text-sm border-b last:border-0">
                  <div className="p-4 font-medium text-left">{item.feature}</div>
                  <div className="p-4 flex items-center justify-center">
                    {typeof item.free === 'boolean' ? (
                      item.free ? (
                        <Check className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300" />
                      )
                    ) : (
                      <span className="text-muted-foreground text-xs">{item.free}</span>
                    )}
                  </div>
                  <div className="p-4 bg-violet-50/50 dark:bg-violet-950/20 flex items-center justify-center">
                    {typeof item.premium === 'boolean' ? (
                      <Check className="w-5 h-5 text-violet-500" />
                    ) : (
                      <span className="font-medium text-violet-600 dark:text-violet-400 text-xs">{item.premium}</span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.section>

        {/* 하단 옵션들 */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h3 className="text-xl font-bold text-center mb-2">다른 옵션</h3>
          <p className="text-center text-muted-foreground text-sm mb-6">필요에 따라 선택하세요</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* 캐시 충전 카드 */}
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                    <Coins className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold">캐시 충전</h4>
                    <p className="text-xs text-muted-foreground">건별 결제 선호시</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {cashProducts.map((product) => (
                    <div 
                      key={product.id}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        product.popular ? 'border-blue-300 bg-blue-50/50 dark:bg-blue-950/20' : 'border-border'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">₩{product.price.toLocaleString()}</span>
                          {product.bonus > 0 && (
                            <Badge className="bg-emerald-500 text-white text-xs border-0">+10%</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{product.features[0]}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={product.popular ? "default" : "outline"}
                        className={product.popular ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0" : ""}
                        onClick={() => handlePayment(product.id)}
                        disabled={paymentLoading || !isReady}
                      >
                        {isLoading(product.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : "충전"}
                      </Button>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mt-4 text-center">
                  현재 보유: <span className="font-bold text-foreground">{((tokenBalance?.current_tokens || 0) * 100).toLocaleString()}원</span>
                </p>
              </CardContent>
            </Card>

            {/* 전문가 상담 카드 */}
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
                
                <div className="space-y-3">
                  {consultProducts.map((product) => (
                    <div 
                      key={product.id}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        product.popular ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-border'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">₩{product.price.toLocaleString()}</span>
                          <Badge variant="secondary" className="text-xs">{product.duration}</Badge>
                          {product.popular && (
                            <Badge className="bg-emerald-500 text-white text-xs border-0">추천</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{product.features[0]}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={product.popular ? "default" : "outline"}
                        className={product.popular ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0" : ""}
                        onClick={() => handlePayment(product.id)}
                        disabled={paymentLoading || !isReady}
                      >
                        {isLoading(product.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : "예약"}
                      </Button>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="ghost"
                  size="sm"
                  className="w-full mt-4 text-muted-foreground"
                  onClick={() => navigate('/expert-hiring')}
                >
                  전문가 프로필 보기
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* 신뢰 배지 */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl p-6"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm">환불 보장</div>
                <div className="text-xs text-muted-foreground">7일 이내</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm">즉시 이용</div>
                <div className="text-xs text-muted-foreground">결제 즉시</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm">안전 결제</div>
                <div className="text-xs text-muted-foreground">토스페이먼츠</div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default TokenSubscription;
