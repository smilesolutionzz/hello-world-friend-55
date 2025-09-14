import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Zap, Star, Crown, Check, Sparkles, Brain, Rocket, Trophy, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription, type SubscriptionPlan } from '@/hooks/useSubscription';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';

const Subscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription, availablePlans, loading: subLoading } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [purchasingPlanId, setPurchasingPlanId] = useState<string | null>(null);

  const handlePlanSelect = async (plan: SubscriptionPlan) => {
    if (plan.type === 'free') {
      // 무료 플랜은 바로 대시보드로 이동
      navigate('/');
      return;
    }

    console.log('=== Plan selection started for:', plan.name);
    setPurchasingPlanId(plan.id);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({ 
          title: "로그인 필요", 
          description: "구독하려면 먼저 로그인해주세요." 
        });
        navigate('/auth');
        return;
      }

      // Toss Payments를 사용한 구독 결제 처리
      const { data, error } = await supabase.functions.invoke('create-toss-payment', {
        body: {
          planId: plan.id,
          subscriptionType: plan.type
        }
      });

      if (error) throw error;

      if (data?.paymentData && data?.clientKey) {
        // 동적으로 Toss Payments SDK 로드
        const script = document.createElement('script');
        script.src = 'https://js.tosspayments.com/v1/payment-widget';
        script.onload = () => {
          const paymentWidget = (window as any).PaymentWidget(data.clientKey, (window as any).PaymentWidget.ANONYMOUS);
          
          paymentWidget.renderPaymentMethods('#payment-widget', {
            value: data.paymentData.amount,
            currency: 'KRW',
            country: 'KR'
          });

          // 결제 요청
          paymentWidget.requestPayment({
            orderId: data.paymentData.orderId,
            orderName: data.paymentData.orderName,
            amount: data.paymentData.amount,
            successUrl: `${window.location.origin}/payment-success`,
            failUrl: `${window.location.origin}/payment-fail`,
            customerEmail: session.user.email,
            customerName: session.user.user_metadata?.display_name || '사용자'
          });
        };
        document.head.appendChild(script);
      }

    } catch (error: any) {
      console.error('=== Subscription error:', error);
      toast({ 
        title: "오류", 
        description: error.message || "구독 처리 중 오류가 발생했습니다.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
      setPurchasingPlanId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'free':
        return <Heart className="h-8 w-8 text-green-500" />;
      case 'premium':
        return <Crown className="h-8 w-8 text-purple-500" />;
      default:
        return <Rocket className="h-8 w-8 text-blue-500" />;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'free':
        return 'from-green-100 to-emerald-100';
      case 'premium':
        return 'from-purple-100 to-pink-100';
      default:
        return 'from-blue-100 to-cyan-100';
    }
  };

  const isCurrentPlan = (planId: string) => {
    return subscription?.plan_id === planId;
  };

  const getButtonText = (plan: SubscriptionPlan) => {
    if (isCurrentPlan(plan.id)) {
      return '현재 이용 중';
    }
    if (plan.type === 'free') {
      return '무료로 시작하기';
    }
    return `${plan.name} 시작하기`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <UnifiedNavigation />
      
      {/* Payment Widget Container (hidden) */}
      <div id="payment-widget" style={{ display: 'none' }}></div>
      
      {/* 구독제 전환 안내 배너 */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-6 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-pulse"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="bg-white/20 rounded-full p-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">🚀 새로운 구독 시스템 런칭!</h2>
            </div>
            <p className="text-xl font-medium">
              더 간편하고 합리적인 월간 구독제로 변경되었습니다
            </p>
            <p className="text-lg">
              복잡한 토큰 계산 없이, <span className="font-bold text-yellow-300">월정액으로 무제한 이용하세요!</span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            구독 플랜 선택
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            필요에 맞는 플랜을 선택하여 AI 심리 분석 서비스를 이용하세요
          </p>
          
          {subscription && (
            <div className="flex justify-center mb-8">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">현재 구독</div>
                  <div className="text-2xl font-bold text-primary">
                    {subscription.plan?.name || subscription.subscription_type}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    상태: {subscription.status === 'active' ? '활성' : '비활성'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Plans */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {subLoading ? (
            // Loading state
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="text-center pb-6 pt-12">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded mx-auto w-24"></div>
                    <div className="h-4 bg-gray-200 rounded mx-auto w-32"></div>
                    <div className="h-8 bg-gray-200 rounded mx-auto w-20"></div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pb-8">
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded flex-1"></div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4">
                    <div className="w-full h-12 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : availablePlans.length === 0 ? (
            // No plans state
            <div className="col-span-full text-center py-16">
              <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-auto">
                <div className="text-muted-foreground mb-4">
                  <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">구독 플랜이 없습니다</h3>
                <p className="text-muted-foreground mb-4">
                  현재 사용 가능한 구독 플랜이 없습니다.
                </p>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="mx-auto"
                >
                  다시 시도
                </Button>
              </div>
            </div>
          ) : (
            availablePlans.map((plan, index) => (
              <Card 
                key={plan.id} 
                className={`relative group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  plan.type === 'premium' 
                    ? 'border-2 border-purple-400 shadow-lg scale-105' 
                    : isCurrentPlan(plan.id)
                    ? 'border-2 border-green-400 shadow-lg'
                    : 'border border-border hover:border-primary/20'
                }`}
                style={{ overflow: 'visible' }}
              >
                {plan.type === 'premium' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
                      🌟 추천
                    </Badge>
                  </div>
                )}
                
                {isCurrentPlan(plan.id) && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
                      ✓ 이용 중
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6 pt-12">
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full bg-gradient-to-br ${getPlanColor(plan.type)}`}>
                      {getPlanIcon(plan.type)}
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                  
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-foreground">
                      {plan.price === 0 ? '무료' : `₩${formatPrice(plan.price)}`}
                    </div>
                    {plan.price > 0 && (
                      <div className="text-sm text-muted-foreground">
                        월간 구독
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pb-8">
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Button 
                      className={`w-full py-3 text-lg font-bold ${
                        isCurrentPlan(plan.id)
                          ? 'bg-green-500 hover:bg-green-600 text-white cursor-default'
                          : plan.type === 'premium'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                          : plan.type === 'free'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                      }`}
                      disabled={loading || isCurrentPlan(plan.id)}
                      onClick={() => handlePlanSelect(plan)}
                    >
                      <div className="flex items-center gap-2">
                        {purchasingPlanId === plan.id ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            처리 중...
                          </>
                        ) : (
                          <>
                            {!isCurrentPlan(plan.id) && <Rocket className="w-5 h-5" />}
                            {getButtonText(plan)}
                          </>
                        )}
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 구독제 장점 안내 */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold">구독제의 장점</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-medium">복잡한 토큰 계산 불필요</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-medium">월정액으로 예측 가능한 비용</span>
                </div>
              </div>
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-medium">무제한 서비스 이용</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-medium">언제든 취소 가능</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20" id="faq">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">자주 묻는 질문</h2>
            <div className="space-y-6">
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-lg mb-2">토큰제에서 구독제로 변경된 이유는?</h3>
                <p className="text-muted-foreground">
                  사용자 피드백을 바탕으로 더 간편하고 예측 가능한 요금제를 제공하기 위해 변경되었습니다. 
                  복잡한 토큰 계산 없이 월정액으로 모든 서비스를 자유롭게 이용할 수 있습니다.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-lg mb-2">기존 토큰은 어떻게 되나요?</h3>
                <p className="text-muted-foreground">
                  기존에 보유하신 토큰은 구독 전환 시점까지 정상적으로 사용 가능합니다. 
                  구독 후에는 토큰 없이 자유롭게 서비스를 이용하실 수 있습니다.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-lg mb-2">언제든 취소할 수 있나요?</h3>
                <p className="text-muted-foreground">
                  네, 언제든지 구독을 취소할 수 있습니다. 취소 후에도 현재 결제 주기가 끝날 때까지는 계속 서비스를 이용하실 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;