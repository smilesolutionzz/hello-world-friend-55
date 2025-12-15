import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Check, Sparkles, Brain, Zap, Trophy, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTokens } from '@/hooks/useTokens';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import TokenBalance from '@/components/TokenBalance';
import { PromotionBanner } from '@/components/promotion/PromotionBanner';
import { LifetimeCountdownCard } from '@/components/pricing/LifetimeCountdownCard';

interface TokenPackage {
  name: string;
  tokens: number;
  price: number;
  bonus: number;
  popular?: boolean;
  features: string[];
}

const TOKEN_PACKAGES: TokenPackage[] = [
  {
    name: '토큰팩 50',
    tokens: 50,
    price: 9900,
    bonus: 0,
    features: [
      '기본 심리검사 25회',
      '엔터테인먼트 테스트 50회',
      'AI 상담 50메시지',
      '꿈해석 12회',
      '관찰일지 분석 12회',
      '토큰 영구 보관',
      '부담 없는 시작'
    ]
  },
  {
    name: '토큰팩 150',
    tokens: 150,
    price: 19900,
    bonus: 0,
    popular: true,
    features: [
      '✨ 가장 인기있는 선택',
      '기본 심리검사 75회',
      'AI 상담 150메시지',
      '관찰일지 분석 37회',
      '사주분석 25회',
      '꿈해석 37회',
      '1토큰당 132원으로 가장 합리적',
      '정기적 이용에 최적'
    ]
  },
  {
    name: '토큰팩 400',
    tokens: 400,
    price: 39900,
    bonus: 0,
    features: [
      '기본 심리검사 200회',
      '프리미엄 검사 50회',
      'IEP 생성 8회',
      '종합리포트 2회',
      '모든 기능 자유 이용',
      '토큰당 99원으로 최고 할인율',
      '장기간 안심 이용',
      '전문가급 서비스'
    ]
  }
];

const Subscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tokenBalance, refreshTokenBalance } = useTokens();
  const [loading, setLoading] = useState(false);
  const [purchasingPackage, setPurchasingPackage] = useState<string | null>(null);

  const handlePurchase = async (pkg: TokenPackage) => {
    setPurchasingPackage(pkg.name);
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

      // 토스페이먼츠 결제로 이동
      navigate('/token-subscription');

    } catch (error: any) {
      console.error('토큰 구매 오류:', error);
      toast({ 
        title: "오류", 
        description: error.message || "토큰 구매 중 오류가 발생했습니다.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
      setPurchasingPackage(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getPackageIcon = (index: number) => {
    if (index === 0) return <Zap className="h-8 w-8 text-blue-500" />;
    if (index === 1) return <Sparkles className="h-8 w-8 text-purple-500" />;
    return <Trophy className="h-8 w-8 text-yellow-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <UnifiedNavigation />
      
      {/* 토큰제 안내 배너 */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-6 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-pulse"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="bg-white/20 rounded-full p-2">
                <Coins className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">💰 간편한 캐시제 시스템</h2>
            </div>
            <p className="text-sm md:text-xl font-medium">
              필요한 만큼만 구매하고, 1년간 자유롭게 사용하세요
            </p>
            <div className="flex items-center justify-center gap-2 text-sm md:text-lg">
              <Clock className="w-4 h-4 md:w-5 md:h-5" />
              <span className="whitespace-nowrap">캐시 유효기간: <strong>구매일로부터 1년</strong></span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16">
        {/* 평생이용권 섹션 */}
        <div className="mb-16 max-w-4xl mx-auto">
          <LifetimeCountdownCard onNavigate={() => navigate('/lifetime-payment')} />
        </div>

        {/* 구분선 */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
            <span className="text-muted-foreground font-medium">또는 토큰으로 이용하기</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
          </div>
        </div>

        {/* 프로모션 배너 */}
        <div className="mb-12 max-w-4xl mx-auto">
          <PromotionBanner variant="subscription" />
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            토큰 패키지 선택
          </h1>
          <p className="text-sm md:text-xl text-muted-foreground mb-8 whitespace-nowrap">
            부담 없이 시작하고, 언제든 충전하세요
          </p>
          
          <div className="flex justify-center mb-8">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <TokenBalance showPurchaseButton={false} />
            </div>
          </div>
        </div>

        {/* Token Packages */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {TOKEN_PACKAGES.map((pkg, index) => (
            <Card 
              key={pkg.name}
              className={`relative group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                pkg.popular 
                  ? 'border-2 border-purple-400 shadow-lg scale-105' 
                  : 'border border-border hover:border-primary/20'
              }`}
              style={{ overflow: 'visible' }}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
                    🌟 인기
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6 pt-12">
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-full ${pkg.popular ? 'bg-gradient-to-br from-purple-100 to-pink-100' : 'bg-gradient-to-br from-blue-100 to-cyan-100'}`}>
                    {getPackageIcon(index)}
                  </div>
                </div>
                
                <CardTitle className="text-2xl mb-2">{pkg.name}</CardTitle>
                
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-foreground">
                    {pkg.tokens} <span className="text-xl text-muted-foreground">토큰</span>
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    ₩{formatPrice(pkg.price)}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    토큰당 ₩{Math.round(pkg.price / pkg.tokens)}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-2">
                    <Clock className="w-4 h-4" />
                    <span>1년간 유효</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pb-8">
                <div className="space-y-3">
                  {pkg.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Button 
                    className={`w-full py-3 text-lg font-bold ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                    }`}
                    disabled={loading}
                    onClick={() => handlePurchase(pkg)}
                  >
                    <div className="flex items-center gap-2">
                      {purchasingPackage === pkg.name ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          처리 중...
                        </>
                      ) : (
                        <>
                          <Coins className="w-5 h-5" />
                          구매하기
                        </>
                      )}
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 캐시 사용 안내 */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold">캐시 사용 가이드</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="space-y-2">
                <div className="font-medium text-lg mb-3">📊 기능별 비용</div>
                <div className="text-sm space-y-1">
                  <div>• <strong>엔터테인먼트</strong>: 100원 (전생직업, 동물상 등)</div>
                  <div>• <strong>기본 심리검사</strong>: 200원 (마음상태, 집중력 등)</div>
                  <div>• <strong>AI 코치 세션</strong>: 300원</div>
                  <div>• <strong>꿈해석/관찰분석</strong>: 400원</div>
                  <div>• <strong>사주 분석</strong>: 600원</div>
                  <div>• <strong>프리미엄 검사</strong>: 800원</div>
                  <div>• <strong>IEP 생성</strong>: 5,000원</div>
                  <div>• <strong>종합 리포팅</strong>: 20,000원</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-lg mb-3">✨ 캐시제 장점</div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm">필요한 만큼만 구매</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm">1년간 자유롭게 사용</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm">언제든 추가 구매 가능</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm">캐시 영구 보관</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm">합리적인 가격</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">자주 묻는 질문</h2>
            <div className="space-y-6">
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-sm md:text-lg mb-2">캐시는 언제까지 사용할 수 있나요?</h3>
                <p className="text-muted-foreground text-sm">
                  구매한 캐시는 구매일로부터 <strong>1년간</strong> 사용 가능합니다. 기간 내에 자유롭게 사용하세요.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-sm md:text-lg mb-2">캐시가 부족하면 어떻게 하나요?</h3>
                <p className="text-muted-foreground text-sm">
                  언제든 추가로 캐시를 구매할 수 있습니다. 새로 구매한 캐시는 기존 캐시와 합산되며, 
                  새로운 유효기간이 부여됩니다.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-sm md:text-lg mb-2">환불이 가능한가요?</h3>
                <p className="text-muted-foreground text-sm">
                  캐시를 사용하지 않은 경우, 구매일로부터 7일 이내에 전액 환불이 가능합니다. 
                  일부 사용한 경우, 사용한 금액을 제외하고 환불됩니다.
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