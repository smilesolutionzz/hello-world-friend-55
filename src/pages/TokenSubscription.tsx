import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Coins, Check, Sparkles, Crown, Clock, Brain, 
  AlertCircle, Info, Star, Zap, Users, Lock,
  Gift, Infinity, Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTokens } from '@/hooks/useTokens';
import { useSubscription } from '@/hooks/useSubscription';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';

// 캐시 충전 패키지
const CASH_PACKAGES = [
  {
    id: 'cash_5000',
    name: '₩5,000',
    cash: 50,
    price: 5000,
    bonus: 0,
    features: ['AI 분석 12회', '기본 검사 25회', '꿈해석 12회']
  },
  {
    id: 'cash_10000',
    name: '₩10,000',
    cash: 110,
    price: 10000,
    bonus: 10,
    popular: true,
    features: ['AI 분석 27회', '기본 검사 55회', '꿈해석 27회', '+10 보너스 캐시']
  },
  {
    id: 'cash_30000',
    name: '₩30,000',
    cash: 350,
    price: 30000,
    bonus: 50,
    features: ['AI 분석 87회', '기본 검사 175회', '꿈해석 87회', '+50 보너스 캐시']
  }
];

// 프리미엄 패스
const PREMIUM_PASSES = [
  {
    id: 'pass_30',
    name: '30일 패스',
    duration: '30일',
    price: 29900,
    originalPrice: 49900,
    discount: 40,
    features: [
      '모든 AI 분석 무제한',
      '모든 심리검사 무제한',
      '상세 리포트 무제한',
      '결과 저장 무제한',
      '전문가 상담 20% 할인'
    ]
  },
  {
    id: 'pass_365',
    name: '365일 패스',
    duration: '1년',
    price: 199000,
    originalPrice: 598800,
    discount: 67,
    popular: true,
    features: [
      '모든 AI 분석 무제한',
      '모든 심리검사 무제한',
      '상세 리포트 무제한',
      '결과 저장 무제한',
      '전문가 상담 30% 할인',
      '신규 기능 우선 이용'
    ]
  },
  {
    id: 'pass_lifetime',
    name: '평생 패스',
    duration: '평생',
    price: 299000,
    originalPrice: 999000,
    discount: 70,
    best: true,
    features: [
      '평생 모든 기능 무제한',
      '모든 AI 분석 무제한',
      '모든 심리검사 무제한',
      '상세 리포트 무제한',
      '결과 저장 무제한',
      '전문가 상담 40% 할인',
      '신규 기능 평생 무료',
      'VIP 고객 지원'
    ]
  }
];

// 전문가 상담 패키지
const CONSULTATION_PACKAGES = [
  {
    id: 'consult_30',
    name: '30분 상담',
    duration: '30분',
    price: 35000,
    cashPrice: 350,
    features: ['1:1 화상/전화 상담', '전문가 맞춤 조언', '상담 노트 제공']
  },
  {
    id: 'consult_60',
    name: '60분 상담',
    duration: '60분',
    price: 65000,
    cashPrice: 650,
    popular: true,
    features: ['1:1 화상/전화 상담', '심층 분석 및 조언', '상담 노트 제공', '후속 질문 1회']
  },
  {
    id: 'consult_package',
    name: '3회 패키지',
    duration: '30분 x 3회',
    price: 89000,
    cashPrice: 890,
    originalPrice: 105000,
    features: ['30분 상담 3회', '지속적 케어', '할인 적용', '우선 예약']
  }
];

// 프리미엄 기능 미리보기 (블러 효과용)
const PREMIUM_FEATURES = [
  { name: 'MBTI 심층 분석', description: '16가지 성격유형 상세 분석', blur: true },
  { name: '종합 심리 리포트', description: '10페이지 이상 전문 리포트', blur: true },
  { name: 'AI 맞춤 상담', description: '개인화된 AI 상담 서비스', blur: true },
  { name: '발달 추적 분석', description: '장기간 발달 패턴 분석', blur: true },
];

const TokenSubscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tokenBalance } = useTokens();
  const { subscription, isPremiumUser } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('pass');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handlePurchase = async (type: string, id: string, price: number) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({ 
          title: "로그인 필요", 
          description: "구매하려면 먼저 로그인해주세요." 
        });
        navigate('/auth');
        return;
      }

      // 토스페이먼츠 결제 페이지로 이동
      navigate(`/token-purchase?type=${type}&id=${id}&price=${price}`);

    } catch (error: any) {
      console.error('구매 오류:', error);
      toast({ 
        title: "오류", 
        description: error.message || "구매 중 오류가 발생했습니다.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <UnifiedNavigation />
      
      {/* 헤더 배너 */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white py-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,white_0%,transparent_50%)]"></div>
        </div>
        <div className="container mx-auto relative z-10 max-w-4xl text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-10 h-10" />
            <h1 className="text-4xl font-bold">프리미엄 서비스</h1>
          </div>
          <p className="text-xl opacity-90 mb-6">
            더 깊은 분석, 더 정확한 인사이트를 경험하세요
          </p>
          
          {/* 현재 보유 캐시 */}
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
            <Coins className="w-6 h-6" />
            <span className="text-lg font-semibold">
              보유 캐시: {tokenBalance?.current_tokens || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* 탭 네비게이션 */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-14">
            <TabsTrigger value="pass" className="text-base font-semibold gap-2">
              <Crown className="w-5 h-5" />
              프리미엄 패스
            </TabsTrigger>
            <TabsTrigger value="cash" className="text-base font-semibold gap-2">
              <Coins className="w-5 h-5" />
              캐시 충전
            </TabsTrigger>
            <TabsTrigger value="consult" className="text-base font-semibold gap-2">
              <Users className="w-5 h-5" />
              전문가 상담
            </TabsTrigger>
          </TabsList>

          {/* 프리미엄 패스 탭 */}
          <TabsContent value="pass" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">프리미엄 패스로 무제한 이용</h2>
              <p className="text-muted-foreground text-lg">
                한 번 결제로 모든 기능을 마음껏 이용하세요
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {PREMIUM_PASSES.map((pass) => (
                <Card 
                  key={pass.id}
                  className={`relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    pass.best 
                      ? 'border-2 border-amber-400 shadow-lg shadow-amber-100 dark:shadow-amber-900/20' 
                      : pass.popular
                      ? 'border-2 border-purple-400 shadow-lg'
                      : 'border hover:border-primary/30'
                  }`}
                >
                  {pass.best && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
                        🏆 최고 인기
                      </Badge>
                    </div>
                  )}
                  {pass.popular && !pass.best && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
                        ⭐ 추천
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pt-10 pb-4">
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 rounded-full ${
                        pass.best 
                          ? 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30' 
                          : 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30'
                      }`}>
                        {pass.best ? (
                          <Infinity className="w-8 h-8 text-amber-600" />
                        ) : pass.popular ? (
                          <Calendar className="w-8 h-8 text-purple-600" />
                        ) : (
                          <Clock className="w-8 h-8 text-blue-600" />
                        )}
                      </div>
                    </div>
                    
                    <CardTitle className="text-2xl mb-1">{pass.name}</CardTitle>
                    <p className="text-muted-foreground">{pass.duration} 이용</p>
                    
                    <div className="mt-4 space-y-1">
                      <div className="text-sm text-muted-foreground line-through">
                        ₩{formatPrice(pass.originalPrice)}
                      </div>
                      <div className="text-4xl font-bold text-primary">
                        ₩{formatPrice(pass.price)}
                      </div>
                      <Badge variant="destructive" className="mt-2">
                        {pass.discount}% 할인
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pb-8">
                    <div className="space-y-3">
                      {pass.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      className={`w-full py-6 text-lg font-bold ${
                        pass.best
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                      }`}
                      disabled={loading}
                      onClick={() => handlePurchase('pass', pass.id, pass.price)}
                    >
                      {pass.best ? '🏆 평생 이용하기' : '구매하기'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 프리미엄 기능 미리보기 (블러 효과) */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-center mb-8">
                프리미엄 전용 기능 미리보기
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {PREMIUM_FEATURES.map((feature, idx) => (
                  <Card 
                    key={idx} 
                    className="relative overflow-hidden group cursor-pointer"
                    onClick={() => !isPremiumUser() && toast({ 
                      title: "프리미엄 전용", 
                      description: "이 기능은 프리미엄 패스가 필요합니다." 
                    })}
                  >
                    <CardContent className="p-6 relative">
                      {/* 블러 오버레이 */}
                      {!isPremiumUser() && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-10 group-hover:bg-background/70 transition-all">
                          <div className="text-center">
                            <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">프리미엄 전용</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Sparkles className="w-6 h-6 text-purple-500" />
                        <h4 className="font-semibold">{feature.name}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 캐시 충전 탭 */}
          <TabsContent value="cash" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">캐시 충전</h2>
              <p className="text-muted-foreground text-lg">
                필요한 만큼만 충전하고 원하는 기능을 이용하세요
              </p>
              <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full">
                <Info className="w-4 h-4" />
                <span className="text-sm">1캐시 = ₩100 상당</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {CASH_PACKAGES.map((pkg) => (
                <Card 
                  key={pkg.id}
                  className={`relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    pkg.popular 
                      ? 'border-2 border-blue-400 shadow-lg' 
                      : 'border hover:border-primary/30'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
                        💎 인기
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pt-10 pb-4">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                        <Coins className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    
                    <CardTitle className="text-2xl mb-2">{pkg.name}</CardTitle>
                    
                    <div className="space-y-1">
                      <div className="text-4xl font-bold text-primary">
                        {pkg.cash} <span className="text-xl">캐시</span>
                      </div>
                      {pkg.bonus > 0 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          <Gift className="w-3 h-3 mr-1" />
                          +{pkg.bonus} 보너스
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pb-8">
                    <div className="space-y-2">
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      className="w-full py-5 text-base font-bold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                      disabled={loading}
                      onClick={() => handlePurchase('cash', pkg.id, pkg.price)}
                    >
                      <Coins className="w-5 h-5 mr-2" />
                      충전하기
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 캐시 사용 안내 */}
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-2xl p-8 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6 text-blue-600" />
                캐시 사용 가이드
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <div className="font-medium text-base mb-3">기능별 캐시 소비</div>
                  <div>• <strong>엔터테인먼트</strong>: 무료</div>
                  <div>• <strong>기본 심리검사</strong>: 2캐시</div>
                  <div>• <strong>AI 분석</strong>: 4캐시</div>
                  <div>• <strong>사주 분석</strong>: 6캐시</div>
                  <div>• <strong>프리미엄 검사</strong>: 20캐시</div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium text-base mb-3">캐시 혜택</div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>1년간 유효</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>언제든 추가 충전 가능</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>충전 금액에 따른 보너스</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 전문가 상담 탭 */}
          <TabsContent value="consult" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">전문가 1:1 상담</h2>
              <p className="text-muted-foreground text-lg">
                검증된 전문가와 깊이 있는 상담을 받아보세요
              </p>
              {isPremiumUser() && (
                <Badge className="mt-4 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  <Crown className="w-4 h-4 mr-1" />
                  프리미엄 회원 할인 적용
                </Badge>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {CONSULTATION_PACKAGES.map((pkg) => (
                <Card 
                  key={pkg.id}
                  className={`relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    pkg.popular 
                      ? 'border-2 border-green-400 shadow-lg' 
                      : 'border hover:border-primary/30'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
                        🌟 인기
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pt-10 pb-4">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
                        <Users className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    
                    <CardTitle className="text-2xl mb-1">{pkg.name}</CardTitle>
                    <p className="text-muted-foreground">{pkg.duration}</p>
                    
                    <div className="mt-4 space-y-1">
                      {pkg.originalPrice && (
                        <div className="text-sm text-muted-foreground line-through">
                          ₩{formatPrice(pkg.originalPrice)}
                        </div>
                      )}
                      <div className="text-3xl font-bold text-primary">
                        ₩{formatPrice(pkg.price)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        또는 {pkg.cashPrice} 캐시
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pb-8">
                    <div className="space-y-2">
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Button 
                        className="w-full py-5 text-base font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                        disabled={loading}
                        onClick={() => handlePurchase('consult', pkg.id, pkg.price)}
                      >
                        카드/계좌로 결제
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full py-5 text-base font-medium"
                        disabled={loading || (tokenBalance?.current_tokens || 0) < pkg.cashPrice}
                        onClick={() => handlePurchase('consult_cash', pkg.id, pkg.cashPrice)}
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        {pkg.cashPrice} 캐시로 결제
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 상담사 소개 */}
            <div className="mt-12 text-center">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/expert-hiring')}
                className="gap-2"
              >
                <Users className="w-5 h-5" />
                전문 상담사 보기
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* 환불 정책 */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold mb-3 text-amber-900 dark:text-amber-100">환불 정책</h3>
                  <div className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                    <p>• <strong>캐시:</strong> 구매 후 7일 이내, 미사용 시 전액 환불</p>
                    <p>• <strong>프리미엄 패스:</strong> 구매 후 7일 이내, 서비스 미이용 시 전액 환불</p>
                    <p>• <strong>전문가 상담:</strong> 상담 24시간 전까지 취소 시 전액 환불</p>
                    <p className="text-amber-600 dark:text-amber-400">* 서비스 이용 후에는 환불이 불가합니다</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TokenSubscription;
