import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Zap, Star, Crown, Check, ArrowRight, TrendingUp, Brain, Target, Users, Sparkles, Shield, Clock, Coins, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTokens } from '@/hooks/useTokens';
import Navigation from '@/components/Navigation';
import TokenBalance from '@/components/TokenBalance';

interface TokenPlan {
  id: string;
  name: string;
  token_count: number;
  price_krw: number;
  is_popular?: boolean;
  description: string;
  features: string[];
}

const TokenSubscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tokenBalance } = useTokens();
  const [plans, setPlans] = useState<TokenPlan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('token_subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_krw', { ascending: true });

      if (error) throw error;
      
      // Transform data to match interface
      const transformedPlans = (data || []).map(plan => ({
        id: plan.id,
        name: plan.name,
        token_count: plan.token_count,
        price_krw: plan.price_krw,
        is_popular: plan.is_popular,
        description: plan.description,
        features: Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features as string)
      }));
      
      setPlans(transformedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "오류",
        description: "플랜을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleSubscribe = async (planId: string, planName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ 
        title: "로그인 필요", 
        description: "토큰을 구매하려면 먼저 로그인해주세요." 
      });
      navigate('/auth');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-token-payment', {
        body: { 
          planId, 
          subscriptionType: 'one_time'
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
      console.error('Payment error:', error);
      toast({ 
        title: "오류", 
        description: error.message || "결제 처리 중 오류가 발생했습니다.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getPlanIcon = (tokenCount: number) => {
    if (tokenCount <= 100) return <Zap className="h-8 w-8 text-blue-500" />;
    if (tokenCount <= 500) return <Sparkles className="h-8 w-8 text-purple-500" />;
    return <Crown className="h-8 w-8 text-yellow-500" />;
  };

  const getValuePerToken = (price: number, tokenCount: number) => {
    return Math.round(price / tokenCount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        {/* 헤더 섹션 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <Brain className="w-4 h-4" />
            AIHPRO 토큰 시스템
          </div>
          
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            토큰 기반 AIH 맞춤분석
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            필요한 만큼만 사용하고, 더 스마트하게 맞춤 분석을 받아보세요.<br />
            각 분석마다 정확한 토큰만 소모되어 효율적이고 투명합니다.
          </p>
          
          {/* 현재 토큰 잔액 표시 */}
          <div className="flex justify-center mb-8">
            <TokenBalance showPurchaseButton={false} />
          </div>
        </div>

        {/* 토큰 사용량 가이드 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">토큰 사용량 가이드</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">3분 기본 테스트</CardTitle>
                <CardDescription>빠른 심리상태 진단</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">5토큰</div>
                <p className="text-sm text-slate-600">기본적인 심리 상태, 꿈해몽, 사주분석</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">AI 맞춤 분석</CardTitle>
                <CardDescription>깊이 있는 개인 분석</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-2">10토큰</div>
                <p className="text-sm text-slate-600">개인 맞춤형 심층 심리 분석</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">전문가급 분석</CardTitle>
                <CardDescription>종합적인 심층 분석</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">30토큰</div>
                <p className="text-sm text-slate-600">전문가 수준의 종합 심리 진단</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 토큰 구매 플랜 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4">토큰 구매 플랜</h2>
          <p className="text-center text-slate-600 mb-12">필요에 맞는 토큰 팩을 선택하세요. 한 번 구매로 영구 사용 가능합니다.</p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const valuePerToken = getValuePerToken(plan.price_krw, plan.token_count);
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                    plan.is_popular ? 'border-2 border-purple-500 shadow-lg' : 'border border-slate-200'
                  }`}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-500 text-white px-4 py-1 text-sm">
                        🔥 인기 선택
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-6">
                    <div className="flex justify-center mb-4">
                      {getPlanIcon(plan.token_count)}
                    </div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                    
                    <div className="mt-6">
                      <div className="text-4xl font-bold text-slate-900 mb-2">
                        ₩{formatPrice(plan.price_krw)}
                      </div>
                      <div className="text-lg font-semibold text-purple-600 mb-2">
                        {plan.token_count}개 토큰
                      </div>
                      <div className="text-sm text-slate-500">
                        토큰당 ₩{valuePerToken}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pb-6">
                    {plan.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </CardContent>

                  <div className="p-6 pt-0">
                    <Button 
                      className={`w-full py-3 text-base font-semibold ${
                        plan.is_popular 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                      disabled={loading}
                      onClick={() => handleSubscribe(plan.id, plan.name)}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                          처리중...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Plus className="w-5 h-5" />
                          지금 구매하기
                        </div>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 왜 토큰 시스템인가? */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">왜 토큰 시스템을 선택해야 할까요?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">정확한 사용량</h3>
              <p className="text-sm text-slate-600">필요한 만큼만 정확히 결제하세요</p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">투명한 요금</h3>
              <p className="text-sm text-slate-600">숨겨진 비용 없이 명확한 가격책정</p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">무기한 사용</h3>
              <p className="text-sm text-slate-600">구매한 토큰은 영구적으로 사용 가능</p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">유연한 확장</h3>
              <p className="text-sm text-slate-600">언제든 필요한 만큼 추가 구매</p>
            </Card>
          </div>
        </div>

        {/* FAQ 섹션 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">자주 묻는 질문</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="p-6">
              <h3 className="font-semibold mb-3 text-lg">🤔 토큰은 언제까지 사용할 수 있나요?</h3>
              <p className="text-slate-600">
                구매한 토큰은 <strong>영구적으로 사용</strong>할 수 있습니다. 만료 기간이 없어 언제든 원할 때 사용하세요.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3 text-lg">💳 결제는 어떻게 진행되나요?</h3>
              <p className="text-slate-600">
                <strong>토스페이먼츠</strong>를 통해 안전하게 결제됩니다. 카드, 계좌이체, 간편결제 등을 지원합니다.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3 text-lg">🔄 토큰이 부족하면 어떻게 되나요?</h3>
              <p className="text-slate-600">
                토큰이 부족하면 기능 이용이 제한됩니다. <strong>언제든 추가 구매</strong>하여 계속 이용하실 수 있습니다.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3 text-lg">📊 토큰 사용 내역을 확인할 수 있나요?</h3>
              <p className="text-slate-600">
                네! 대시보드에서 <strong>실시간 토큰 잔액</strong>과 사용 내역을 상세히 확인할 수 있습니다.
              </p>
            </Card>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">지금 시작해보세요!</h2>
          <p className="text-xl mb-8 opacity-90">
            첫 구매 시 보너스 토큰을 드립니다. 더 스마트한 심리분석의 시작!
          </p>
          <Button 
            size="lg" 
            className="bg-white text-purple-600 hover:bg-slate-100 px-8 py-4 text-lg font-semibold"
            onClick={() => {
              const plansSection = document.querySelector('.grid.md\\:grid-cols-3');
              plansSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            토큰 구매하기
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TokenSubscription;