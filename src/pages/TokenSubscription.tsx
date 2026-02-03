import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Brain, Users, Crown, ArrowRight, 
  Check, Coins, Clock, Gift, Sparkles, 
  MessageCircle, Zap, Shield, Star, Loader2,
  Infinity, TrendingUp, Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTokens } from '@/hooks/useTokens';
import { useSubscription } from '@/hooks/useSubscription';
import { usePayment, PRODUCTS } from '@/hooks/usePayment';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { motion } from 'framer-motion';

const TokenSubscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tokenBalance } = useTokens();
  const { isPremiumUser, isLifetimeUser, getSubscriptionLabel } = useSubscription();
  const { pay, loading: paymentLoading, isReady } = usePayment();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const isPremium = isPremiumUser() || isLifetimeUser();
  const subscriptionLabel = getSubscriptionLabel();

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

  // 프리미엄 패스 상품
  const passProducts = [
    {
      id: 'pass_30',
      name: '30일 패스',
      price: 29900,
      originalPrice: 49900,
      discount: 40,
      duration: '30일',
      icon: Zap,
      gradient: 'from-blue-500 to-cyan-500',
      features: ['모든 AI 분석 무제한', '모든 심리검사 무제한', '상세 리포트 무제한'],
      popular: true,
    },
  ];

  // 캐시 충전 상품
  const cashProducts = [
    {
      id: 'cash_5000',
      name: '5,000원 캐시',
      price: 5000,
      tokens: 50,
      bonus: 0,
      features: ['AI 심층분석 1회', '즉시 사용 가능'],
    },
    {
      id: 'cash_10000',
      name: '11,000원 캐시',
      price: 10000,
      tokens: 110,
      bonus: 10,
      features: ['AI 심층분석 2회+', '10% 보너스 포함', '즉시 사용 가능'],
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
      features: ['1:1 화상/전화 상담', '전문가 맞춤 조언', '상담 노트 제공'],
    },
    {
      id: 'consult_60',
      name: '60분 상담',
      price: 65000,
      duration: '60분',
      features: ['1:1 화상/전화 상담', '심층 분석 및 조언', '상담 노트 제공', '후속 질문 1회 포함'],
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-6xl">
        {/* 현재 상태 표시 */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          {isPremium ? (
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
          ) : (
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl px-6 py-3 shadow-md">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xs text-amber-600 dark:text-amber-400">현재 보유 캐시</div>
                <div className="text-xl font-black text-amber-700 dark:text-amber-300">
                  {((tokenBalance?.current_tokens || 0) * 100).toLocaleString()}원
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
            프리미엄 멤버십
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI 분석, 전문가 상담, 모든 프리미엄 기능을 바로 이용하세요
          </p>
        </motion.div>

        {/* 프리미엄 패스 섹션 */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold">프리미엄 패스</h2>
            <Badge variant="secondary" className="bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0">
              최대 67% 할인
            </Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {passProducts.map((product, index) => (
              <Card 
                key={product.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  product.popular 
                    ? 'ring-2 ring-violet-400 shadow-lg shadow-purple-500/20'
                    : ''
                }`}
              >
                {product.popular && (
                  <Badge className="absolute top-3 right-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0">
                    인기
                  </Badge>
                )}
                
                <CardContent className="p-6 pt-6">
                  <div className="text-center mb-6">
                    <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${product.gradient} mb-4`}>
                      <product.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">{product.name}</h3>
                    <div className="text-sm text-muted-foreground">{product.duration} 무제한</div>
                  </div>

                  <div className="text-center mb-6">
                    <div className="text-sm text-muted-foreground line-through">
                      ₩{product.originalPrice.toLocaleString()}
                    </div>
                    <div className="text-4xl font-black">
                      ₩{product.price.toLocaleString()}
                    </div>
                    <Badge className="mt-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0">
                      {product.discount}% 할인
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-6">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full h-12 rounded-xl font-bold transition-all ${
                      product.popular
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white'
                    }`}
                    onClick={() => handlePayment(product.id)}
                    disabled={paymentLoading || !isReady}
                  >
                    {isLoading(product.id) ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        결제 중...
                      </>
                    ) : (
                      <>결제하기</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* 캐시 충전 섹션 */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold">캐시 충전</h2>
            <span className="text-sm text-muted-foreground">필요한 만큼만 구매</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
            {cashProducts.map((product) => (
              <Card 
                key={product.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  product.popular ? 'ring-2 ring-blue-400' : ''
                }`}
              >
                {product.popular && (
                  <Badge className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                    <Gift className="w-3 h-3 mr-1" />
                    +10% 보너스
                  </Badge>
                )}
                
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      ₩{product.price.toLocaleString()}
                    </div>
                    <div className="text-lg font-bold text-muted-foreground">
                      {((product.tokens) * 100).toLocaleString()}원 충전
                      {product.bonus > 0 && (
                        <span className="text-emerald-500 ml-1">(+{product.bonus * 100}원)</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold"
                    onClick={() => handlePayment(product.id)}
                    disabled={paymentLoading || !isReady}
                  >
                    {isLoading(product.id) ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        결제 중...
                      </>
                    ) : (
                      <>충전하기</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* 전문가 상담 섹션 */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold">전문가 1:1 상담</h2>
            <span className="text-sm text-muted-foreground">검증된 전문가와 상담</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
            {consultProducts.map((product) => (
              <Card 
                key={product.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  product.popular ? 'ring-2 ring-emerald-400' : ''
                }`}
              >
                {product.popular && (
                  <Badge className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
                    추천
                  </Badge>
                )}
                
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 text-muted-foreground mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{product.duration}</span>
                    </div>
                    <div className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      ₩{product.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold"
                    onClick={() => handlePayment(product.id)}
                    disabled={paymentLoading || !isReady}
                  >
                    {isLoading(product.id) ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        결제 중...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        예약하기
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 전문가 리스트 링크 */}
          <div className="mt-6">
            <Button 
              variant="outline"
              className="rounded-xl"
              onClick={() => navigate('/expert-hiring')}
            >
              <Users className="w-4 h-4 mr-2" />
              전문가 프로필 보기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.section>

        {/* 신뢰 배지 & 보장 */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-3xl p-8"
        >
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold">100% 환불 보장</div>
                <div className="text-sm text-muted-foreground">7일 이내 전액 환불</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold">즉시 이용</div>
                <div className="text-sm text-muted-foreground">결제 즉시 활성화</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold">안전한 결제</div>
                <div className="text-sm text-muted-foreground">토스페이먼츠 보안</div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-center mb-8">자주 묻는 질문</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="p-6">
              <h3 className="font-bold mb-2">프리미엄 패스와 캐시 차이점은?</h3>
              <p className="text-sm text-muted-foreground">
                프리미엄 패스는 기간 내 모든 기능 무제한 이용이고, 캐시는 필요한 만큼만 구매하여 사용합니다.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold mb-2">환불이 가능한가요?</h3>
              <p className="text-sm text-muted-foreground">
                구매 후 7일 이내, 서비스 미사용시 전액 환불이 가능합니다.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold mb-2">평생이용권은 정말 평생인가요?</h3>
              <p className="text-sm text-muted-foreground">
                네, 한 번 구매하시면 서비스 운영 기간 동안 평생 무료로 이용 가능합니다.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold mb-2">결제 수단은 무엇이 있나요?</h3>
              <p className="text-sm text-muted-foreground">
                신용/체크카드, 계좌이체, 휴대폰 결제, 카카오페이 등 다양한 결제 수단을 지원합니다.
              </p>
            </Card>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default TokenSubscription;
