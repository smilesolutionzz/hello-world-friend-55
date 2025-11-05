import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Check, Sparkles, Zap, Trophy, Clock, Brain, AlertCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTokens } from '@/hooks/useTokens';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import TokenBalance from '@/components/TokenBalance';

interface TokenPackage {
  name: string;
  tokens: number;
  price: number;
  popular?: boolean;
  features: string[];
}

const TOKEN_PACKAGES: TokenPackage[] = [
  {
    name: '토큰팩 50',
    tokens: 50,
    price: 9900,
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
    features: [
      '🎉 11월 특별 이벤트: +50 보너스 토큰!',
      '총 450토큰 지급 (400 + 보너스 50)',
      '기본 심리검사 200회',
      '프리미엄 검사 50회',
      'IEP 생성 8회',
      '종합리포트 2회',
      '모든 기능 자유 이용',
      '토큰당 88원으로 최고 할인율',
      '장기간 안심 이용',
      '전문가급 서비스'
    ]
  }
];

const TokenSubscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tokenBalance } = useTokens();
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

      // 토큰 수량을 URL 파라미터로 전달
      navigate(`/token-purchase?tokens=${pkg.tokens}`);

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
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto mb-8">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Info className="w-4 h-4" />
              토큰 구매는 회원가입이 필요합니다
            </p>
          </div>
          
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
                  : index === 2
                  ? 'border-2 border-orange-400 shadow-lg'
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
              {index === 2 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-sm font-bold shadow-lg animate-pulse">
                    🎉 11월 특별
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
                    {index === 2 && (
                      <div className="text-lg text-orange-500 font-semibold mt-1">
                        + 50 보너스 🎁
                      </div>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    ₩{formatPrice(pkg.price)}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {index === 2 ? (
                      <span className="text-orange-600 font-semibold">토큰당 ₩88 (이벤트가)</span>
                    ) : (
                      <span>토큰당 ₩{Math.round(pkg.price / pkg.tokens)}</span>
                    )}
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
                        : index === 2
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
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
                          {index === 2 ? '🎁 특별가로 구매하기' : '구매하기'}
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
                  <div>• <strong>엔터테인먼트</strong>: 무료 (전생직업, 동물상 등)</div>
                  <div>• <strong>기본 심리검사</strong>: 2토큰 (마음상태, 집중력 등)</div>
                  <div>• <strong>AI 코치 세션</strong>: 3토큰</div>
                  <div>• <strong>관찰분석</strong>: 4토큰</div>
                  <div>• <strong>사주 분석</strong>: 6토큰</div>
                  <div>• <strong>프리미엄 검사</strong>: 20토큰</div>
                  <div>• <strong>IEP 생성</strong>: 무료</div>
                  <div>• <strong>종합 리포팅</strong>: 200토큰</div>
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
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">구매일로부터 1년간 유효</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm">합리적인 가격 (최저 99원/토큰)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 환불 정책 섹션 */}
        <div className="mt-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-8 mb-12">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4 text-amber-900 dark:text-amber-100">토큰 환불 정책</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p><strong>환불 가능 기간:</strong> 구매일로부터 1주 이내</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p><strong>환불 조건:</strong> 사용하지 않은 토큰에 한하여 환불 가능</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p><strong>환불 방법:</strong> 결제하셨던 동일한 방법으로 환불 처리됩니다</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p><strong>환불 불가:</strong> 토큰을 1개라도 사용한 경우 환불이 불가능합니다</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p><strong>토큰 양도 불가:</strong> 충전된 토큰은 타인에게 양도할 수 없습니다</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p>환불 문의: 고객센터 (aihpro@naver.com)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">자주 묻는 질문</h2>
            <div className="space-y-6">
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-lg mb-2">토큰은 언제까지 사용할 수 있나요?</h3>
                <p className="text-muted-foreground">
                  토큰의 유효기간은 구매일로부터 <strong>1년</strong>입니다. 유효기간 내에 사용하지 않은 토큰은 자동으로 소멸되며, 
                  환불 가능 기간도 구매일로부터 1년 이내입니다.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-lg mb-2">회원가입 없이도 구매할 수 있나요?</h3>
                <p className="text-muted-foreground">
                  토큰 구매는 회원가입을 해야만 합니다. 구매한 토큰을 실제로 사용하시려면 
                  회원가입 및 로그인이 필요합니다. 구매 시 입력하신 이메일로 가입하시면 자동으로 토큰이 연결됩니다.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-lg mb-2">환불이 가능한가요?</h3>
                <p className="text-muted-foreground">
                  네, 가능합니다. 토큰을 사용하지 않은 경우에 한하여 구매일로부터 1주 이내에 환불 요청이 가능하며, 
                  결제하셨던 동일한 방법으로 환불 처리됩니다. 환불 문의는 고객센터 (aihpro@naver.com)로 연락 주시기 바랍니다.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-lg mb-2">토큰을 다른 사람에게 양도할 수 있나요?</h3>
                <p className="text-muted-foreground">
                  아니요, 충전된 토큰은 타인에게 양도가 불가능합니다. 구매하신 본인만 사용하실 수 있습니다.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-lg mb-2">토큰이 부족하면 어떻게 하나요?</h3>
                <p className="text-muted-foreground">
                  언제든 추가로 토큰을 구매할 수 있습니다. 새로 구매한 토큰도 구매일로부터 1년간 유효합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenSubscription;
