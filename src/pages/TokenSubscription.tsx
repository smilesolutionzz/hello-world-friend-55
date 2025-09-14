import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Zap, Star, Crown, Check, Sparkles, Brain, Coins, Rocket, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTokens } from '@/hooks/useTokens';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import TokenBalance from '@/components/TokenBalance';

interface TokenPackage {
  id: string;
  name: string;
  description: string;
  token_count: number;
  price_krw: number;
  is_popular: boolean;
}

const TokenSubscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tokenBalance } = useTokens();
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    console.log('=== Fetching token packages...');
    setPackagesLoading(true);
    try {
      const { data, error } = await supabase
        .from('token_packages')
        .select('*')
        .eq('is_active', true)
        .order('price_krw', { ascending: true });

      console.log('=== Packages data:', data);
      console.log('=== Packages error:', error);

      if (error) throw error;
      setPackages(data || []);
      
      if (!data || data.length === 0) {
        console.warn('=== No token packages found');
        toast({
          title: "알림",
          description: "사용 가능한 토큰 패키지가 없습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('=== Error fetching packages:', error);
      toast({
        title: "오류",
        description: "토큰 패키지를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setPackagesLoading(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    console.log('=== Token purchase started for package:', packageId);
    
    setPurchasingPackageId(packageId);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({ 
          title: "로그인 필요", 
          description: "토큰을 구매하려면 먼저 로그인해주세요." 
        });
        navigate('/auth');
        return;
      }

      // 토큰팩 토스페이먼츠 결제 처리
      await handleTossPayment('token-pack', 'tokens');

    } catch (error: any) {
      console.error('=== Token purchase error:', error);
      toast({ 
        title: "오류", 
        description: error.message || "결제 처리 중 오류가 발생했습니다.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
      setPurchasingPackageId(null);
    }
  };

  const handleSubscriptionPurchase = async (planType: string) => {
    console.log('=== Subscription purchase started for plan:', planType);
    
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

      // 구독 토스페이먼츠 결제 처리
      await handleTossPayment(planType, 'subscription');

    } catch (error: any) {
      console.error('=== Subscription purchase error:', error);
      toast({ 
        title: "오류", 
        description: error.message || "결제 처리 중 오류가 발생했습니다.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTossPayment = async (planId: string, subscriptionType: string) => {
    try {
      // 토스페이먼츠 결제 요청
      const { data, error } = await supabase.functions.invoke('create-toss-payment', {
        body: { 
          planId: planId,
          subscriptionType: subscriptionType 
        }
      });

      if (error) throw error;

      if (data.success) {
        // 토스페이먼츠 SDK 동적 로딩
        const script = document.createElement('script');
        script.src = 'https://js.tosspayments.com/v1/payment-widget';
        script.onload = () => {
          const clientKey = data.clientKey;
          const paymentWidget = (window as any).PaymentWidget(clientKey, (window as any).PaymentWidget.ANONYMOUS);
          
          // 결제 위젯 렌더링
          paymentWidget.renderPaymentMethods('#payment-widget', data.amount);
          
          // 결제 버튼 클릭 처리
          document.getElementById('payment-button')?.addEventListener('click', () => {
            paymentWidget.requestPayment({
              orderId: data.orderId,
              orderName: data.orderName,
              successUrl: window.location.origin + '/payment/success',
              failUrl: window.location.origin + '/payment/fail',
            });
          });
        };
        document.head.appendChild(script);

        // 결제 위젯 표시
        const paymentContainer = document.getElementById('payment-container');
        if (paymentContainer) {
          paymentContainer.style.display = 'block';
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getPlanIcon = (tokenCount: number) => {
    if (tokenCount <= 100) return <Zap className="h-8 w-8 text-blue-500" />;
    if (tokenCount <= 500) return <Sparkles className="h-8 w-8 text-purple-500" />;
    return <Trophy className="h-8 w-8 text-yellow-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <UnifiedNavigation />
      
      {/* 하이브리드 모델 1단계 안내 배너 */}
      <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 text-white py-4 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-blue-400/20 to-purple-400/20 animate-pulse"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="bg-white/20 rounded-full p-2">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">🎯 1단계: 하이브리드 모델 런칭!</h2>
            </div>
            <p className="text-lg font-medium">
              토큰제와 구독제를 모두 제공합니다. 본인에게 맞는 방식을 선택하세요!
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-bold">🆓 무료 체험</div>
                <div>월 1회 무료 체험</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-bold">🪙 토큰팩</div>
                <div>9,900원/50토큰 (시험용)</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-bold">💎 베이직</div>
                <div>19,900원/월 무제한</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            하이브리드 모델 선택
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            토큰제와 구독제 중 본인에게 맞는 방식을 선택하세요
          </p>
          
          <div className="flex justify-center mb-8">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <TokenBalance showPurchaseButton={false} />
            </div>
          </div>
        </div>

        {/* 하이브리드 선택 섹션 */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-8">어떤 방식이 나에게 맞을까요?</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
            {/* 무료 체험 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">무료 체험</h3>
                <div className="text-2xl font-bold text-blue-600 mb-2">무료</div>
                <p className="text-muted-foreground">월 1회 체험</p>
              </div>
              <div className="space-y-2 text-left mb-6">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">월 1회 무료 검사</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">AI 기본 분석</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">결과 요약 제공</span>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/tests')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3"
              >
                무료 체험 시작
              </Button>
            </div>
            
            {/* 토큰팩 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-200">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">토큰팩</h3>
                <div className="text-2xl font-bold text-purple-600 mb-2">9,900원</div>
                <p className="text-muted-foreground">50토큰</p>
              </div>
              <div className="space-y-2 text-left mb-6">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">필요한 만큼만 결제</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">토큰 영구 보관</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">서비스 체험용</span>
                </div>
              </div>
              <Button 
                onClick={async () => {
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) {
                    navigate('/auth');
                    return;
                  }
                  handlePurchase('token-pack');
                }}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3"
              >
                토큰팩 구매하기
              </Button>
            </div>
            
            {/* 프로 구독 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-green-300 relative transform hover:scale-105 transition-all duration-300 shadow-2xl">
              {/* 최고 인기 배지 */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg animate-pulse">
                  🔥 최고 인기
                </div>
              </div>
              
              {/* 한정 특가 배지 */}
              <div className="absolute -top-2 -right-2">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
                  💎 한정특가
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-green-800">프로 구독</h3>
                <div className="mb-3">
                  <span className="text-lg text-gray-500 line-through">39,800원</span>
                  <div className="text-3xl font-black text-green-600 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    19,900원/월
                  </div>
                  <div className="text-red-600 font-bold text-sm">⚡ 50% 런칭 할인</div>
                </div>
                <p className="text-green-700 font-semibold">무제한 + VIP 혜택</p>
              </div>

              <div className="space-y-3 text-left mb-6">
                <div className="flex items-center gap-3 bg-white/50 rounded-lg p-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">🔥 무제한 검사 + 심화분석</span>
                </div>
                <div className="flex items-center gap-3 bg-white/50 rounded-lg p-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">📝 무제한 관찰일지 분석</span>
                </div>
                <div className="flex items-center gap-3 bg-white/50 rounded-lg p-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">🤖 초개인화에이전트 모드 제공</span>
                </div>
                <div className="flex items-center gap-3 bg-white/50 rounded-lg p-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">📊 월간 성장 리포트</span>
                </div>
                <div className="flex items-center gap-3 bg-white/50 rounded-lg p-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">⚡ 우선 예약 + 빠른 상담</span>
                </div>
                <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-2">
                  <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-yellow-900">🎁 VIP 전용 혜택</span>
                </div>
                <div className="flex items-center gap-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg p-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-blue-900">🆓 첫 달 무료 체험</span>
                </div>
              </div>

              <div className="text-center mb-4">
                <div className="bg-red-100 border border-red-300 rounded-lg p-2 mb-3">
                  <div className="text-red-600 font-bold text-sm">⏰ 런칭 특가 종료까지</div>
                  <div className="text-red-800 font-black text-lg">7일 남음</div>
                </div>
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-3">
                  <div className="text-blue-800 font-bold text-sm">💰 1년 결제 시 추가 할인</div>
                  <div className="text-blue-900 text-lg">연간 179,000원 (월 14,916원)</div>
                  <div className="text-blue-600 text-xs">월 결제 대비 25% 절약!</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 mb-4">
                <Button 
                  onClick={async () => {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) {
                      navigate('/auth');
                      return;
                    }
                    handleSubscriptionPurchase('basic');
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 text-lg shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  🚀 월 결제로 시작하기
                </Button>
                
                <Button 
                  onClick={async () => {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) {
                      navigate('/auth');
                      return;
                    }
                    handleSubscriptionPurchase('basic-annual');
                  }}
                  variant="outline"
                  className="w-full border-2 border-green-500 text-green-700 hover:bg-green-50 font-bold py-3 shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  💎 연간 결제로 25% 절약하기
                </Button>
              </div>
              
              <div className="text-center mt-3">
                <p className="text-xs text-green-700 font-medium">
                  💰 매월 10회 이상 이용시 <span className="font-bold">40% 절약</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 토큰제 vs 구독제 비교 */}
        <div className="mt-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">하이브리드 모델 1단계 비교</h2>
            <div className="bg-gradient-to-br from-background to-muted/30 rounded-3xl p-8 shadow-lg border border-border">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">🆓 무료 체험</div>
                  <div className="text-sm text-muted-foreground mb-4">
                    월 1회 무료로 체험하세요
                  </div>
                  <ul className="text-sm space-y-1 text-left">
                    <li>• 월 1회 심리검사</li>
                    <li>• AI 기본 분석</li>
                    <li>• 결과 요약 제공</li>
                  </ul>
                </div>
                
                <div className="text-center border-l border-r border-border px-6">
                  <div className="text-2xl font-bold mb-2">🪙 토큰팩</div>
                  <div className="text-sm text-muted-foreground mb-4">
                    9,900원으로 50토큰 (시험용)
                  </div>
                  <ul className="text-sm space-y-1 text-left">
                    <li>• 필요한 만큼만 결제</li>
                    <li>• 토큰 영구 보관</li>
                    <li>• 서비스 체험에 최적</li>
                    <li>• 무통장입금 지원</li>
                  </ul>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">💎 베이직 구독</div>
                  <div className="text-sm text-muted-foreground mb-4">
                    19,900원/월 무제한 이용
                  </div>
                  <ul className="text-sm space-y-1 text-left">
                    <li>• 무제한 검사 및 분석</li>
                    <li>• 전문가 상담 연결</li>
                    <li>• 24/7 고객 지원</li>
                    <li>• 정기 이용자에게 최적</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-lg font-semibold text-primary mb-4">
                  🎯 어떤 방식이 나에게 맞을까요?
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="font-bold text-purple-800 mb-2">토큰팩이 적합한 분</div>
                    <ul className="text-purple-700 space-y-1">
                      <li>• 월 9회 이하 이용 예정</li>
                      <li>• 서비스를 먼저 체험하고 싶은 분</li>
                      <li>• 필요할 때만 결제하고 싶은 분</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="font-bold text-green-800 mb-2">베이직 구독이 적합한 분</div>
                    <ul className="text-green-700 space-y-1">
                      <li>• 월 10회 이상 이용 예정</li>
                      <li>• 정기적인 관리가 필요한 분</li>
                      <li>• 전문가 상담까지 원하는 분</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 창립자의 손편지 */}
        <div className="mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 rounded-3xl p-8 shadow-lg border border-orange-200">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">창립자의 손편지</h2>
                <p className="text-muted-foreground">아이들의 미래를 위한 진심어린 메시지</p>
              </div>
              
              <div className="bg-white/70 rounded-2xl p-6 shadow-sm">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-orange-800 mb-2">데이터로 읽는 마음,</h3>
                  <h2 className="text-3xl font-bold text-orange-900 mb-1">AI 하이라이트 프로</h2>
                  <p className="text-lg text-orange-700 font-semibold">불안을 데이터로 안심을 리포트로</p>
                </div>
                
                <p className="text-lg leading-relaxed mb-4 text-orange-800">
                  안녕하세요.<br />
                  AI 하이라이트 프로 창립자 이수석입니다.
                </p>
                
                <p className="text-base leading-relaxed mb-4">
                  저는 지난 14년 동안 유소년 스포츠클럽, 발달센터, 심리상담센터, 
                  그리고 병원 발달클리닉을 운영하며 수많은 아이들과 부모님, 
                  성인과 어르신들을 만나왔습니다. 그 과정에서 늘 같은 고민을 들었습니다.
                </p>
                
                <div className="bg-orange-50 p-4 rounded-lg mb-4 border-l-4 border-orange-400">
                  <p className="text-sm text-orange-800 italic">
                    "아이의 언어 발달이 늦는 건 아닐까?"<br />
                    "직장 스트레스 때문에 무너지지 않을까?"<br />
                    "부모님이 혹시 기억력이나 생활 능력에 변화를 겪고 계시진 않을까?"
                  </p>
                </div>
                
                <p className="text-base leading-relaxed mb-4">
                  누구나 한 번쯤은 이런 걱정을 하지만, 막상 전문가를 찾기까지는 쉽지 않았습니다. 
                  몇 달을 기다려야 하는 예약, 부담스러운 검사 비용, 상담실을 향한 두려움... 
                  이런 이유로 많은 분들이 마음 건강을 챙기지 못하고 계셨습니다.
                </p>
                
                <p className="text-base leading-relaxed mb-4">
                  저는 이 현실을 바꾸고 싶었습니다. 그래서 직접 100% 개발하며 밤을 새워 만든 것이 바로 
                  <span className="font-bold text-orange-800">AIHPRO(하이라이트 프로)</span> 입니다. 
                  <span className="font-bold text-blue-600">단 3분이면 충분합니다.</span>
                </p>
                
                <p className="text-base leading-relaxed mb-4">
                  AIHPRO는 병원급 정밀도를 가진 딥러닝 AI가 단 3분 만에 마음 상태를 분석하고, 
                  필요하다면 검증된 전문가가 마지막으로 코멘트를 더해주는 새로운 방식의 심리케어 플랫폼입니다.
                </p>
                
                <p className="text-base leading-relaxed mb-4">
                  작은 기록이 쌓이면, 큰 변화를 미리 막을 수 있습니다. 
                  AIHPRO는 그 변화를 빠르게 감지하고, 필요할 때 전문가가 연결해 드립니다.
                </p>
                
                <div className="bg-amber-50 p-4 rounded-lg mb-4 border-l-4 border-amber-400">
                  <p className="text-base text-amber-800 italic font-medium">
                    "기술은 차갑지만, 치유는 따뜻해야 한다"<br />
                    는 마음으로 시작했습니다.
                  </p>
                </div>
                
                <p className="text-base leading-relaxed mb-4">
                  AI가 먼저 빠르고 정확하게 마음을 읽어내고, 전문가는 그 위에 따뜻한 손길을 얹습니다. 
                  이 과정에서 고객님은 "나는 혼자가 아니구나"라는 안도감을 느끼실 수 있습니다.
                </p>
                
                <p className="text-base leading-relaxed mb-4">
                  저희의 목표는 거창하지 않습니다. 단지 모든 가족이, 모든 사람의 마음의 무게를 
                  혼자 지지 않아도 되는 세상을 만드는 것입니다.
                </p>
                
                <p className="text-base leading-relaxed text-orange-800 font-medium mb-6">
                  오늘 남긴 짧은 기록이 내일의 안심으로 이어지기를, 
                  그렇게 가족이 건강하게 성장하고, 행복하게 살아가시기를 바라는 마음으로 
                  AIHPRO를 만들었습니다.
                </p>
                
                <div className="bg-gradient-to-r from-orange-100 to-amber-100 p-4 rounded-lg">
                  <p className="text-base text-orange-900 font-bold text-center">
                    당신의 마음과 가족의 행복을 지키는 든든한 동반자,<br />
                    AI 하이라이트 프로가 늘 함께하겠습니다.
                  </p>
                </div>
                
                <div className="text-right mt-6">
                  <p className="text-sm text-muted-foreground">AI 하이라이트 프로 창립자 이수석 드림</p>
                </div>
                
                {/* 창립자 상세 경력사항 */}
                <div className="mt-8 text-center">
                  <h4 className="text-lg font-bold text-orange-800 mb-3">이수석 대표가 걸어온 길</h4>
                  <img 
                    src="/src/assets/founder-detailed-career.png" 
                    alt="이수석 대표 상세 경력사항" 
                    className="mx-auto max-w-lg w-full rounded-xl shadow-lg"
                  />
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
                <h3 className="font-semibold text-lg mb-2">하이브리드 모델이란 무엇인가요?</h3>
                <p className="text-muted-foreground">
                  토큰제와 구독제를 모두 제공하는 시스템입니다. 
                  사용 패턴에 따라 본인에게 맞는 방식을 선택할 수 있어 더욱 경제적입니다.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-lg mb-2">어떤 방식을 선택해야 하나요?</h3>
                <p className="text-muted-foreground">
                  월 10회 이상 이용 예정이시면 베이직 구독이, 
                  월 9회 이하 또는 가끔 이용하시면 토큰팩이 더 경제적입니다.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-lg mb-2">나중에 방식을 변경할 수 있나요?</h3>
                <p className="text-muted-foreground">
                  네, 언제든지 변경 가능합니다. 
                  토큰은 영구 보관되므로 구독으로 변경 후에도 기존 토큰을 사용할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 토스페이먼츠 결제 위젯 */}
        <div id="payment-container" style={{ display: 'none' }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">결제하기</h3>
            <div id="payment-widget"></div>
            <div className="flex gap-2 mt-4">
              <Button id="payment-button" className="flex-1">결제하기</Button>
              <Button variant="outline" onClick={() => {
                const container = document.getElementById('payment-container');
                if (container) container.style.display = 'none';
              }}>취소</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenSubscription;