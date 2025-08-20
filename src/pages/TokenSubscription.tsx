import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Crown, Sparkles, Users, Coins, Zap, TrendingUp, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { useTokens } from "@/hooks/useTokens";
import TokenBalance from "@/components/TokenBalance";

interface TokenPlan {
  id: string;
  name: string;
  price: number;
  yearly_price: number;
  tokens_included: number;
  features: string[];
  popular: boolean;
}

const TokenSubscription = () => {
  const [plans, setPlans] = useState<TokenPlan[]>([]);
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const { tokenBalance, refreshTokenBalance } = useTokens();
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    // Mock token subscription plans
    const data = [
      { id: '1', name: '토큰 100개', tokens: 100, price: 19900, yearly_price: 199000, tokens_included: 100, features: ['기본 토큰'], popular: false },
      { id: '2', name: '토큰 500개', tokens: 500, price: 89900, yearly_price: 899000, tokens_included: 500, features: ['대량 토큰'], popular: true }
    ];
    const error = null;

    if (error) {
      toast({ 
        title: "오류", 
        description: "구독 플랜을 불러올 수 없습니다.", 
        variant: "destructive" 
      });
      return;
    }

    const plansData = (data || []).map(plan => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      yearly_price: plan.yearly_price,
      tokens_included: plan.tokens_included,
      features: Array.isArray(plan.features) ? plan.features.map(f => String(f)) : [],
      popular: plan.popular || false
    }));
    
    setPlans(plansData);
  };

  const handleSubscribe = async (planId: string, planName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ 
        title: "로그인 필요", 
        description: "구독하려면 먼저 로그인해주세요." 
      });
      return;
    }

    setLoading(true);

    try {
      // 무료 플랜인 경우 특별 처리
      const plan = plans.find(p => p.id === planId);
      if (plan?.price === 0) {
        toast({ 
          title: "이미 무료 토큰을 받으셨습니다", 
          description: "추가 토큰이 필요하시면 유료 플랜을 선택해주세요." 
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-token-payment', {
        body: { 
          planId, 
          subscriptionType: isYearly ? 'yearly' : 'monthly' 
        }
      });

      if (error) throw error;

      // 토스페이먼츠 결제 진행
      const script = document.createElement('script');
      script.src = 'https://js.tosspayments.com/v1/payment-widget';
      script.async = true;
      script.onload = () => {
        try {
          const clientKey = data.clientKey;
          const paymentWidget = (window as any).PaymentWidget(clientKey, 'ANONYMOUS');
          
          // 모달 생성
          const modal = document.createElement('div');
          modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
          modal.innerHTML = `
            <div class="bg-white p-6 rounded-lg max-w-md w-full relative">
              <button class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl" onclick="this.closest('.fixed').remove()">&times;</button>
              <h3 class="text-lg font-semibold mb-4">${planName} 토큰 충전</h3>
              <div id="payment-method" class="mb-4"></div>
              <div id="agreement" class="mb-4"></div>
              <button id="pay-button" class="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90">
                결제하기
              </button>
            </div>
          `;
          
          document.body.appendChild(modal);

          // 위젯 렌더링
          paymentWidget.renderPaymentMethods(
            '#payment-method',
            { value: data.paymentData.amount },
            { variantKey: 'DEFAULT' }
          );

          paymentWidget.renderAgreement('#agreement', { variantKey: 'AGREEMENT' });

          // 결제 버튼 이벤트
          const payButton = modal.querySelector('#pay-button') as HTMLButtonElement;
          payButton.onclick = async () => {
            try {
              await paymentWidget.requestPayment({
                orderId: data.paymentData.orderId,
                orderName: data.paymentData.orderName,
                customerName: data.paymentData.customerName,
                customerEmail: data.paymentData.customerEmail,
                successUrl: data.paymentData.successUrl,
                failUrl: data.paymentData.failUrl,
              });
            } catch (error) {
              console.error('결제 요청 실패:', error);
              toast({
                title: "결제 실패",
                description: "결제 처리 중 오류가 발생했습니다.",
                variant: "destructive"
              });
            }
          };

        } catch (error) {
          console.error('Payment widget initialization error:', error);
          toast({
            title: "결제 위젯 오류",
            description: "결제 시스템을 불러올 수 없습니다.",
            variant: "destructive"
          });
        }
      };
      
      script.onerror = () => {
        toast({
          title: "스크립트 로드 실패",
          description: "토스페이먼츠 결제 시스템을 불러올 수 없습니다.",
          variant: "destructive"
        });
      };
      
      document.head.appendChild(script);

    } catch (error: any) {
      console.error('Subscription error:', error);
      toast({ 
        title: "오류", 
        description: error.message || "구독 처리 중 오류가 발생했습니다.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getDiscountPercent = (monthly: number, yearly: number) => {
    if (monthly === 0) return 0;
    return Math.round((1 - (yearly / 12) / monthly) * 100);
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case '무료 체험': return <Users className="h-6 w-6" />;
      case 'Starter': return <Zap className="h-6 w-6" />;
      case 'Pro': return <Sparkles className="h-6 w-6" />;
      case 'Premium': return <Crown className="h-6 w-6" />;
      default: return <Star className="h-6 w-6" />;
    }
  };

  const getTokensText = (tokens: number) => {
    if (tokens === -1) return '무제한';
    return `${tokens}개`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-brand-gradient">
            토큰 기반 AI 심리분석
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            필요한 만큼만 사용하고, 더 스마트하게 심리 분석을 받아보세요
          </p>
          
          {/* 현재 토큰 잔액 표시 */}
          <div className="flex justify-center mb-8">
            <TokenBalance showPurchaseButton={false} />
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className={`text-sm ${!isYearly ? 'font-semibold' : ''}`}>월간</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={`text-sm ${isYearly ? 'font-semibold' : ''}`}>연간</span>
            <Badge variant="secondary" className="ml-2">연간 결제 시 최대 17% 할인</Badge>
          </div>
        </div>

        {/* 토큰 사용량 안내 */}
        <div className="bg-card rounded-lg p-6 mb-12 border">
          <h2 className="text-xl font-semibold mb-4 text-center">토큰 사용량 안내</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-blue-500" />
                <span className="font-medium">3분 테스트</span>
              </div>
              <Badge variant="outline">3 토큰</Badge>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-purple-500" />
                <span className="font-medium">AI 꿈해몽</span>
              </div>
              <Badge variant="outline">5 토큰</Badge>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-green-500" />
                <span className="font-medium">사주 분석</span>
              </div>
              <Badge variant="outline">8 토큰</Badge>
            </div>
          </div>
        </div>

        {/* 구독 플랜 카드들 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const displayPrice = isYearly ? plan.yearly_price : plan.price;
            const monthlyPrice = isYearly ? Math.round(plan.yearly_price / 12) : plan.price;
            const discount = getDiscountPercent(plan.price, plan.yearly_price);
            
            return (
              <Card 
                key={plan.id} 
                className={`relative transition-all duration-200 hover:shadow-lg ${
                  plan.popular ? 'border-primary shadow-lg scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                    추천
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-3">
                    {getPlanIcon(plan.name)}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>
                    {getTokensText(plan.tokens_included)} 토큰
                  </CardDescription>
                  
                  <div className="mt-4">
                    {plan.price === 0 ? (
                      <div className="text-2xl font-bold">무료</div>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-2xl font-bold">
                            ₩{formatPrice(monthlyPrice)}
                          </span>
                          <span className="text-sm text-muted-foreground">/월</span>
                        </div>
                        {isYearly && discount > 0 && (
                          <div className="text-sm text-muted-foreground">
                            <span className="line-through">₩{formatPrice(plan.price)}</span>
                            <Badge variant="destructive" className="ml-2 text-xs">
                              {discount}% 할인
                            </Badge>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span className="text-xs">{feature}</span>
                    </div>
                  ))}
                </CardContent>

                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? 'default' : 'outline'}
                    disabled={loading}
                    onClick={() => handleSubscribe(plan.id, plan.name)}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        처리중...
                      </div>
                    ) : plan.price === 0 ? (
                      '무료로 시작'
                    ) : (
                      `${plan.name} 구독하기`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* 업그레이드 여정 플로우차트 */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">업그레이드 여정</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-4 items-center">
              <div className="bg-card rounded-lg p-4 border">
                <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-semibold mb-1">무료 체험</h3>
                <p className="text-xs text-muted-foreground">5개 토큰으로 시작</p>
              </div>
              
              <TrendingUp className="hidden md:block w-6 h-6 mx-auto text-primary" />
              
              <div className="bg-card rounded-lg p-4 border border-blue-200">
                <Zap className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <h3 className="font-semibold mb-1">Starter</h3>
                <p className="text-xs text-muted-foreground">50개 토큰/월</p>
              </div>
              
              <TrendingUp className="hidden md:block w-6 h-6 mx-auto text-primary" />
              
              <div className="bg-card rounded-lg p-4 border border-primary">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Pro</h3>
                <p className="text-xs text-muted-foreground">150개 토큰/월</p>
              </div>
              
              <TrendingUp className="hidden md:block w-6 h-6 mx-auto text-primary" />
              
              <div className="bg-card rounded-lg p-4 border border-yellow-300">
                <Crown className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <h3 className="font-semibold mb-1">Premium</h3>
                <p className="text-xs text-muted-foreground">무제한 토큰</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ 섹션 */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">자주 묻는 질문</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">토큰은 어떻게 사용하나요?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  각 AI 분석 기능마다 정해진 토큰이 소모됩니다. 3분 테스트는 3토큰, AI 꿈해몽은 5토큰, 사주 분석은 8토큰이 필요합니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">토큰이 부족하면 어떻게 되나요?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  토큰이 부족하면 기능 사용이 제한됩니다. 언제든지 추가 토큰을 구매하거나 상위 플랜으로 업그레이드하실 수 있습니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">구독을 취소할 수 있나요?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  네, 언제든지 구독을 취소하실 수 있습니다. 현재 결제 주기가 끝날 때까지는 토큰을 계속 사용하실 수 있어요.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">결제는 어떻게 이루어지나요?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  토스페이먼츠를 통해 안전하게 결제됩니다. 카드, 계좌이체, 간편결제 등 다양한 결제 수단을 지원합니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenSubscription;