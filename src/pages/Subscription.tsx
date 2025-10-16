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
    name: '스타터',
    tokens: 50,
    price: 9900,
    bonus: 0,
    features: [
      '관찰일지 16회',
      'AI 분석 10회',
      '심리테스트 16회',
      '1년간 유효'
    ]
  },
  {
    name: '베이직',
    tokens: 100,
    price: 19000,
    bonus: 10,
    popular: true,
    features: [
      '110 토큰 제공',
      '관찰일지 36회',
      'AI 분석 22회',
      '전문가 피드백 5회',
      '1년간 유효'
    ]
  },
  {
    name: '프로',
    tokens: 300,
    price: 49000,
    bonus: 50,
    features: [
      '350 토큰 제공',
      '모든 기능 무제한',
      '전문가 피드백 17회',
      '우선 지원',
      '1년간 유효'
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

      // 무통장입금 페이지로 이동
      navigate('/bank-transfer', { 
        state: { 
          requestType: 'token_purchase',
          tokenAmount: pkg.tokens + pkg.bonus,
          price: pkg.price
        } 
      });

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
              <h2 className="text-2xl font-bold">🪙 간편한 토큰제 시스템</h2>
            </div>
            <p className="text-xl font-medium">
              필요한 만큼만 구매하고, 1년간 자유롭게 사용하세요
            </p>
            <div className="flex items-center justify-center gap-2 text-lg">
              <Clock className="w-5 h-5" />
              <span>토큰 유효기간: <strong>구매일로부터 1년</strong></span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            토큰 패키지 선택
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
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
                    {pkg.tokens + pkg.bonus} <span className="text-xl text-muted-foreground">토큰</span>
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    ₩{formatPrice(pkg.price)}
                  </div>
                  {pkg.bonus > 0 && (
                    <div className="mt-3 p-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <div className="text-sm font-bold text-green-700">
                        🎁 보너스 {pkg.bonus}토큰
                      </div>
                    </div>
                  )}
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

        {/* 토큰 사용 안내 */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold">토큰 사용 가이드</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="space-y-2">
                <div className="font-medium text-lg mb-3">📊 기능별 토큰 소비</div>
                <div className="text-sm space-y-1">
                  <div>• 관찰일지 작성: 3토큰</div>
                  <div>• AI 분석: 5토큰</div>
                  <div>• 기본 심리테스트: 3토큰</div>
                  <div>• 고급 심리테스트: 10토큰</div>
                  <div>• 전문가 피드백: 20토큰</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-lg mb-3">✨ 토큰제 장점</div>
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
                  <span className="text-sm">보너스 토큰 제공</span>
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
                <h3 className="font-semibold text-lg mb-2">토큰은 언제까지 사용할 수 있나요?</h3>
                <p className="text-muted-foreground">
                  구매한 토큰은 구매일로부터 <strong>1년간</strong> 사용 가능합니다. 기간 내에 자유롭게 사용하세요.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-lg mb-2">토큰이 부족하면 어떻게 하나요?</h3>
                <p className="text-muted-foreground">
                  언제든 추가로 토큰을 구매할 수 있습니다. 새로 구매한 토큰은 기존 토큰과 합산되며, 
                  새로운 유효기간이 부여됩니다.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-lg mb-2">환불이 가능한가요?</h3>
                <p className="text-muted-foreground">
                  토큰을 사용하지 않은 경우, 구매일로부터 7일 이내에 전액 환불이 가능합니다. 
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