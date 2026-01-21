import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { Check, CreditCard, Sparkles, Zap, Crown, Gift, Shield, Clock, Users, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TOKEN_PACKAGES, TOKEN_COSTS } from '@/constants/tokenCosts';
import { Badge } from '@/components/ui/badge';

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // 캐시 패키지 (tokenCosts.ts 기반)
  const cashPackages = [
    {
      id: 'starter',
      ...TOKEN_PACKAGES.STARTER,
      icon: Zap,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'pro',
      ...TOKEN_PACKAGES.PRO,
      icon: Crown,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'premium',
      ...TOKEN_PACKAGES.PREMIUM,
      icon: Sparkles,
      color: 'from-amber-500 to-orange-500'
    }
  ];

  // 서비스별 캐시 사용량 안내
  const serviceUsage = [
    { name: '3분 심리검사', cost: TOKEN_COSTS.PSYCHOLOGICAL_TEST, desc: '마음상태, 집중력, 우울감 등' },
    { name: '심층 프리미엄 분석', cost: TOKEN_COSTS.PREMIUM_ASSESSMENT, desc: '전문가급 상세 리포트' },
    { name: '종합 리포팅', cost: TOKEN_COSTS.COMPREHENSIVE_REPORT, desc: '박사급 심층 분석' },
    { name: 'AI 상담', cost: TOKEN_COSTS.AI_COUNSELOR_CHAT, desc: '10메시지당' },
    { name: '엔터테인먼트', cost: TOKEN_COSTS.PAST_LIFE_JOB, desc: '전생직업, 닮은동물 등' },
    { name: '꿈해석/사주분석', cost: TOKEN_COSTS.DREAM_INTERPRETATION, desc: '무료 제공' },
  ];

  const handlePayment = async (packageId: string, price: number, tokens: number) => {
    try {
      setLoading(true);
      toast({
        title: "결제 준비 중",
        description: `캐시팩 ${tokens} 결제가 곧 가능합니다. 토스페이먼츠 연동 진행 중입니다.`,
      });
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "결제 오류",
        description: "결제 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/10 to-soft-mint/20">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 py-24 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Gift className="w-3 h-3 mr-1" />
            런칭 특가 진행중
          </Badge>
          <h1 className="text-4xl font-bold mb-4">캐시 충전하고 자유롭게 이용하세요</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            한 번 충전하면 영구 보관! 필요할 때 원하는 서비스만 골라서 사용하세요
          </p>
        </div>

        {/* 비즈니스 모델 핵심 가치 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Brain, title: '전문가급 AI 분석', desc: '10년 경력 수준' },
            { icon: Clock, title: '3분 만에 결과', desc: '빠른 인사이트' },
            { icon: Shield, title: '익명 보장', desc: '개인정보 안전' },
            { icon: Users, title: '전문가 연결', desc: '1:1 상담 가능' },
          ].map((item, i) => (
            <Card key={i} className="text-center p-4">
              <item.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {cashPackages.map((pkg) => {
            const isPopular = pkg.id === 'pro';
            return (
              <Card 
                key={pkg.id} 
                className={`relative hover:shadow-xl transition-all ${isPopular ? 'ring-2 ring-primary scale-105' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      가장 인기
                    </Badge>
                  </div>
                )}
              <CardHeader className="text-center pb-2">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${pkg.color} flex items-center justify-center`}>
                  <pkg.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <CardDescription>{pkg.recommended_for}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{pkg.price.toLocaleString()}</span>
                  <span className="text-muted-foreground">원</span>
                </div>
                <p className="text-sm text-primary font-medium mt-1">
                  {pkg.tokens}캐시 제공
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium text-primary">{pkg.value_highlight}</p>
                </div>
                <ul className="space-y-2">
                  {pkg.best_for.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-1 pt-2 border-t">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="text-xs text-muted-foreground">{feature}</li>
                  ))}
                </ul>
                <Button
                  onClick={() => handlePayment(pkg.id, pkg.price, pkg.tokens)}
                  disabled={loading}
                  className={`w-full ${isPopular ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' : ''}`}
                  size="lg"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  충전하기
                </Button>
              </CardContent>
            </Card>
            );
          })}
        </div>

        {/* 서비스별 캐시 사용량 */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              서비스별 캐시 사용량
            </CardTitle>
            <CardDescription>1캐시 = 100원 기준으로 합리적인 가격에 이용하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {serviceUsage.map((service, i) => (
                <div key={i} className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="font-semibold text-lg">
                    {service.cost === 0 ? '무료' : `${service.cost}캐시`}
                  </p>
                  <p className="text-sm font-medium">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>결제 및 이용 안내</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">💰 캐시 정책</h4>
              <p>충전한 캐시는 영구 보관되며, 환불 요청 시 미사용 캐시에 대해 100% 환불됩니다.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">🔒 안전한 결제</h4>
              <p>토스페이먼츠를 통한 안전한 결제 서비스를 제공합니다. 신용카드, 계좌이체, 간편결제 등 다양한 결제 수단을 이용하실 수 있습니다.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">📞 문의</h4>
              <p>결제 관련 문의: aihpro@naver.com</p>
            </div>
          </CardContent>
        </Card>

        {/* 토스페이먼츠 상점 정보 */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>상점아이디(MID): aihpror1lo</p>
          <p className="mt-1">운영: (AI)하이라이트 | 대표: 이수석 | 사업자등록번호: 206-12-62002</p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
