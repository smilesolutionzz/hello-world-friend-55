import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Sparkles, Zap, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewPricingPlans = () => {
  const navigate = useNavigate();

  const plans = [
    {
      id: 'free',
      name: '무료 체험',
      price: 0,
      originalPrice: null,
      period: '평생',
      badge: '무료',
      badgeColor: 'bg-green-100 text-green-800',
      icon: Sparkles,
      iconColor: 'text-green-600',
      features: [
        '기본 심리테스트 5회',
        '기본 관찰일지 5회',
        'AI 기본 분석',
        '커뮤니티 접근',
        '기본 리포트'
      ],
      limitations: [
        '고급 AI 분석 제한',
        'PDF 다운로드 제한',
        '전문가 매칭 제한'
      ],
      ctaText: '무료 시작하기',
      ctaAction: () => navigate('/free-trial')
    },
    {
      id: 'basic',
      name: '베이직',
      price: 9900,
      originalPrice: 19900,
      period: '월',
      badge: '50% 할인',
      badgeColor: 'bg-orange-100 text-orange-800',
      icon: Zap,
      iconColor: 'text-blue-600',
      popular: true,
      features: [
        '모든 심리테스트 무제한',
        '관찰일지 무제한',
        'AI 고급 분석',
        '상세 PDF 리포트',
        '전문 해석 및 솔루션',
        '진행상황 추적',
        '우선 고객지원'
      ],
      ctaText: '베이직 시작하기',
      ctaAction: () => navigate('/subscription')
    },
    {
      id: 'premium',
      name: '프리미엄',
      price: 19900,
      originalPrice: 39900,
      period: '월',
      badge: '인기',
      badgeColor: 'bg-purple-100 text-purple-800',
      icon: Crown,
      iconColor: 'text-purple-600',
      features: [
        '베이직 플랜 모든 기능',
        '전문가 1:1 상담 (월 1회)',
        '24시간 AI 채팅 상담',
        '가족 계정 관리',
        '위기상황 즉시 알림',
        '맞춤형 개선 프로그램',
        '전문의 추천 서비스'
      ],
      ctaText: '프리미엄 시작하기',
      ctaAction: () => navigate('/subscription')
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">더 접근하기 쉬운 가격으로</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          모든 사람이 마음 건강 관리를 받을 수 있도록 <span className="font-semibold text-primary">론칭 특가</span>로 제공합니다
        </p>
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
          <p className="text-sm font-medium">
            🎉 <span className="text-primary">론칭 기념 한정특가</span> - 첫 3개월 50% 할인! (선착순 1000명)
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          
          return (
            <Card 
              key={plan.id}
              className={`relative ${plan.popular ? 'border-2 border-primary shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    가장 인기
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className={`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${plan.iconColor}`} />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <Badge className={plan.badgeColor}>
                      {plan.badge}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold">₩{plan.price.toLocaleString()}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                    {plan.originalPrice && (
                      <div className="text-sm text-muted-foreground">
                        <span className="line-through">₩{plan.originalPrice.toLocaleString()}</span>
                        <span className="text-green-600 font-medium ml-2">50% 절약</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {plan.limitations && (
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-xs text-muted-foreground font-medium">제한사항:</p>
                    {plan.limitations.map((limitation, index) => (
                      <p key={index} className="text-xs text-muted-foreground">
                        • {limitation}
                      </p>
                    ))}
                  </div>
                )}
                
                <Button 
                  onClick={plan.ctaAction}
                  className={`w-full ${plan.popular ? 'bg-primary' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.ctaText}
                </Button>
                
                {plan.id !== 'free' && (
                  <p className="text-xs text-center text-muted-foreground">
                    언제든 취소 가능 • 첫 7일 무료 체험
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* FAQ 섹션 */}
      <div className="bg-muted/30 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4 text-center">자주 묻는 질문</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium mb-1">Q. 무료 체험 기간이 끝나면?</p>
            <p className="text-muted-foreground">자동 결제되지 않습니다. 직접 구독 선택 시에만 결제됩니다.</p>
          </div>
          <div>
            <p className="font-medium mb-1">Q. 언제든 취소 가능한가요?</p>
            <p className="text-muted-foreground">네, 언제든 마이페이지에서 즉시 취소 가능합니다.</p>
          </div>
          <div>
            <p className="font-medium mb-1">Q. 할인 혜택은 언제까지인가요?</p>
            <p className="text-muted-foreground">론칭 기념 특가는 선착순 1000명 한정입니다.</p>
          </div>
          <div>
            <p className="font-medium mb-1">Q. 가족과 함께 사용할 수 있나요?</p>
            <p className="text-muted-foreground">프리미엄 플랜에서 가족 계정 관리 기능을 제공합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPricingPlans;