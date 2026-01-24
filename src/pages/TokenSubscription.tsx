import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Crown, ArrowRight, Check, Coins, Sparkles, 
  MessageCircle, Zap, Loader2, Infinity, TrendingUp, 
  Shield, Star, Building2, Users, Brain, Award, Gift
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTokens } from '@/hooks/useTokens';
import { useSubscription } from '@/hooks/useSubscription';
import { usePayment } from '@/hooks/usePayment';
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

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      
      <div className="pt-20">
        {/* Hero Section - Clean & Modern */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              {/* Current Status Badge */}
              {isPremium ? (
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full px-4 py-2 mb-6">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300 font-medium">{subscriptionLabel} 이용중</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
                  <Coins className="w-4 h-4 text-white/70" />
                  <span className="text-white/70">현재 캐시: </span>
                  <span className="text-white font-bold">
                    {((tokenBalance?.current_tokens || 0) * 100).toLocaleString()}원
                  </span>
                </div>
              )}

              <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                우리 아이 발달, 
                <br className="md:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  전문가처럼 분석하세요
                </span>
              </h1>
              <p className="text-lg text-white/60 mb-8 max-w-xl mx-auto">
                AI 심층 분석으로 발달 상태를 정확히 파악하고
                <br className="hidden md:block" />
                검증된 전문가의 1:1 상담을 받아보세요
              </p>

              {!isPremium && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-full px-8"
                    onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    요금제 보기
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>SSL 암호화 결제</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                <span>4.9 / 5.0 만족도</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span>10,000+ 가정 이용</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-500" />
                <span>전문가 검증 AI</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Pricing Section */}
        <section id="pricing" className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Section Header */}
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                Simple Pricing
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                필요한 만큼만 선택하세요
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                복잡한 요금제 없이, 딱 필요한 서비스만 구매하세요
              </p>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid lg:grid-cols-3 gap-6 mb-16">
              {/* AI Analysis Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-2 hover:border-blue-500/50 transition-all hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">AI 심층분석</h3>
                        <p className="text-xs text-muted-foreground">건당 결제</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black">₩5,000</span>
                        <span className="text-muted-foreground">/회</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        필요할 때마다 1회씩 이용
                      </p>
                    </div>

                    <div className="space-y-3 mb-6">
                      {[
                        'Gemini 2.5 기반 고급 분석',
                        '발달/언어/ADHD 심층 리포트',
                        '개인 맞춤 추천 솔루션',
                        'PDF 다운로드 가능'
                      ].map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                      onClick={() => handlePayment('cash_5000')}
                      disabled={paymentLoading || !isReady}
                    >
                      {isLoading('cash_5000') ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        '캐시 충전하기'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Premium Pass Card - Highlighted */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <Card className="h-full border-2 border-violet-500 shadow-xl shadow-violet-500/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-center py-2 text-sm font-bold">
                    <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                    가장 인기
                  </div>
                  <CardContent className="p-6 pt-12">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">프리미엄 패스</h3>
                        <p className="text-xs text-muted-foreground">월 정액제</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-muted-foreground line-through">₩49,900</span>
                        <Badge className="bg-rose-500 text-white border-0 text-xs">40% 할인</Badge>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black">₩29,900</span>
                        <span className="text-muted-foreground">/월</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {[
                        '모든 AI 분석 무제한',
                        '모든 심리검사 무제한',
                        '상세 리포트 무제한',
                        '전문가 상담 30% 할인',
                        '가족 공유 기능'
                      ].map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold"
                      onClick={() => handlePayment('pass_30')}
                      disabled={paymentLoading || !isReady}
                    >
                      {isLoading('pass_30') ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Crown className="w-4 h-4 mr-2" />
                          프리미엄 시작하기
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Expert Consult Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Card className="h-full border-2 hover:border-emerald-500/50 transition-all hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">전문가 상담</h3>
                        <p className="text-xs text-muted-foreground">1:1 화상상담</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black">₩35,000</span>
                        <span className="text-muted-foreground">~</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        30분 / 60분 선택 가능
                      </p>
                    </div>

                    <div className="space-y-3 mb-6">
                      {[
                        '발달전문가 1:1 상담',
                        '개인 맞춤 조언',
                        '상담 노트 제공',
                        '후속 질문 지원'
                      ].map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                      onClick={() => handlePayment('consult_30')}
                      disabled={paymentLoading || !isReady}
                    >
                      {isLoading('consult_30') ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        '상담 예약하기'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Lifetime Pass - Special Offer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto"
            >
              <Card className="border-2 border-amber-500/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-amber-500 text-white border-0">
                          <Award className="w-3 h-3 mr-1" />
                          한정 특가
                        </Badge>
                      </div>
                      <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                        <Infinity className="w-6 h-6 text-amber-600" />
                        평생이용권
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        한 번 결제로 평생 모든 기능을 무제한 이용하세요
                      </p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1">
                          <Check className="w-4 h-4 text-amber-600" />
                          평생 무제한
                        </span>
                        <span className="flex items-center gap-1">
                          <Check className="w-4 h-4 text-amber-600" />
                          신규 기능 무료
                        </span>
                        <span className="flex items-center gap-1">
                          <Check className="w-4 h-4 text-amber-600" />
                          VIP 지원
                        </span>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <div className="text-sm text-muted-foreground line-through">₩299,000</div>
                      <div className="text-3xl font-black text-amber-600">₩99,000</div>
                      <Badge className="mt-1 bg-rose-500 text-white border-0">67% 할인</Badge>
                      <Button
                        className="w-full md:w-auto mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-8"
                        onClick={() => handlePayment('pass_lifetime')}
                        disabled={paymentLoading || !isReady}
                      >
                        {isLoading('pass_lifetime') ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          '평생이용권 구매'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* B2B Section - Redesigned */}
        <section className="py-16 bg-slate-900 text-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">
                For Business
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                기관 · 센터 · 기업용
              </h2>
              <p className="text-white/60 max-w-xl mx-auto">
                학원, 어린이집, 발달센터, 기업 EAP까지
                <br />
                기관 맞춤 솔루션을 제공합니다
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Building2,
                  title: '학원 / 센터',
                  desc: '아동 발달 모니터링 및 부모 리포팅 자동화',
                  price: '월 30만원~',
                  link: '/b2b-academy'
                },
                {
                  icon: Users,
                  title: '기업 EAP',
                  desc: '임직원 자녀 발달 지원 프로그램',
                  price: '맞춤 견적',
                  link: '/eap-service'
                },
                {
                  icon: Zap,
                  title: '발달재활센터',
                  desc: '바우처 연동 관찰기록 · 보고서 자동화',
                  price: '월 50만원~',
                  link: '/b2b-consulting'
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all h-full cursor-pointer group"
                    onClick={() => navigate(item.link)}
                  >
                    <CardContent className="p-6">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 w-fit mb-4">
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-white/60 mb-4">{item.desc}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-400 font-bold">{item.price}</span>
                        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => navigate('/b2b-consulting')}
              >
                기관 도입 상담 신청
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ or Guarantee Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2">자주 묻는 질문</h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: '결제 후 바로 이용할 수 있나요?',
                  a: '네, 결제 완료 즉시 모든 기능을 이용하실 수 있습니다.'
                },
                {
                  q: '환불은 어떻게 하나요?',
                  a: '결제 후 7일 이내, 서비스 미이용 시 전액 환불이 가능합니다.'
                },
                {
                  q: '프리미엄과 캐시 충전의 차이는?',
                  a: '프리미엄은 월정액으로 무제한 이용, 캐시는 필요할 때마다 충전해서 사용합니다.'
                },
                {
                  q: '평생이용권은 정말 평생인가요?',
                  a: '네, 한 번 구매하시면 서비스가 운영되는 한 평생 무제한으로 이용하실 수 있습니다.'
                }
              ].map((item, idx) => (
                <div key={idx} className="border rounded-xl p-4 bg-muted/30">
                  <h4 className="font-semibold mb-1">{item.q}</h4>
                  <p className="text-sm text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 bg-gradient-to-r from-violet-600 to-purple-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-white/80 mb-6">
              우리 아이의 발달, AI와 전문가가 함께합니다
            </p>
            <Button
              size="lg"
              className="bg-white text-violet-600 hover:bg-white/90 font-bold rounded-full px-8"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              요금제 선택하기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TokenSubscription;
