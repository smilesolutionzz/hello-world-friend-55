import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Sparkles, Zap, Star, Clock, Users, Infinity, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewPricingPlans = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'lifetime'>('lifetime');

  const plans = [
    {
      id: 'free',
      name: '무료 체험',
      monthlyPrice: 0,
      yearlyPrice: 0,
      lifetimePrice: 0,
      originalMonthlyPrice: null,
      originalYearlyPrice: null,
      originalLifetimePrice: null,
      badge: '무료',
      badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      icon: Sparkles,
      iconColor: 'text-green-600',
      features: [
        '무료 10토큰 제공',
        '심리검사 2-3회 체험',
        '기본 관찰일지 5회',
        'AI 기본 분석',
        '커뮤니티 접근'
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
      monthlyPrice: 9900,
      yearlyPrice: 99000,
      lifetimePrice: 89000,
      originalMonthlyPrice: 19900,
      originalYearlyPrice: 238800,
      originalLifetimePrice: 299000,
      badge: billingCycle === 'lifetime' ? '70% 할인' : '50% 할인',
      badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
      icon: Zap,
      iconColor: 'text-blue-600',
      popular: billingCycle === 'lifetime',
      yearlyDiscount: '연 2개월 무료',
      lifetimeDiscount: '평생 무제한',
      features: [
        '모든 심리테스트 무제한',
        '관찰일지 무제한',
        'AI 고급 분석',
        '상세 PDF 리포트',
        '전문 해석 및 솔루션',
        '진행상황 추적',
        '우선 고객지원',
        billingCycle === 'lifetime' ? '✨ 평생 업데이트 포함' : ''
      ].filter(Boolean),
      ctaText: billingCycle === 'lifetime' ? '평생이용권 구매' : '베이직 시작하기',
      ctaAction: () => navigate('/subscription', { state: { billingCycle, plan: 'basic' } })
    },
    {
      id: 'premium',
      name: '프리미엄',
      monthlyPrice: 19900,
      yearlyPrice: 199000,
      lifetimePrice: 119000,
      originalMonthlyPrice: 39900,
      originalYearlyPrice: 478800,
      originalLifetimePrice: 499000,
      badge: billingCycle === 'lifetime' ? '🔥 베스트' : '인기',
      badgeColor: billingCycle === 'lifetime' 
        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      icon: Crown,
      iconColor: 'text-purple-600',
      popular: billingCycle !== 'lifetime',
      yearlyDiscount: '연 2개월 무료',
      lifetimeDiscount: '평생 무제한',
      features: [
        '베이직 플랜 모든 기능',
        '전문가 1:1 상담 (월 1회)',
        '24시간 AI 채팅 상담',
        '가족 계정 관리',
        '위기상황 즉시 알림',
        '맞춤형 개선 프로그램',
        '전문의 추천 서비스',
        billingCycle === 'lifetime' ? '✨ 평생 프리미엄 혜택' : ''
      ].filter(Boolean),
      ctaText: billingCycle === 'lifetime' ? '평생이용권 구매' : '프리미엄 시작하기',
      ctaAction: () => navigate('/subscription', { state: { billingCycle, plan: 'premium' } })
    }
  ];

  const getCurrentPrice = (plan: typeof plans[0]) => {
    if (billingCycle === 'monthly') return plan.monthlyPrice;
    if (billingCycle === 'yearly') return plan.yearlyPrice;
    return plan.lifetimePrice;
  };

  const getOriginalPrice = (plan: typeof plans[0]) => {
    if (billingCycle === 'monthly') return plan.originalMonthlyPrice;
    if (billingCycle === 'yearly') return plan.originalYearlyPrice;
    return plan.originalLifetimePrice;
  };

  const getDiscountPercent = (plan: typeof plans[0]) => {
    const original = getOriginalPrice(plan);
    const current = getCurrentPrice(plan);
    if (!original || original === 0) return 0;
    return Math.round((1 - current / original) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">더 접근하기 쉬운 가격으로</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          모든 사람이 마음 건강 관리를 받을 수 있도록 <span className="font-semibold text-primary">론칭 특가</span>로 제공합니다
        </p>
        
        {/* Lifetime Special Banner */}
        {billingCycle === 'lifetime' && (
          <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-xl p-6 border-2 border-primary/30 animate-pulse-slow">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Gift className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-primary">평생이용권 특별 할인</span>
              <Gift className="w-6 h-6 text-primary" />
            </div>
            <p className="text-lg font-medium mb-2">
              <span className="text-2xl font-bold text-primary">8-12만원</span>의 일회성 결제로{' '}
              <span className="underline decoration-wavy decoration-primary">평생 무제한</span> 이용!
            </p>
            <p className="text-sm text-muted-foreground">
              월 구독 대비 <span className="font-bold text-green-600">최대 70% 절약</span> • 
              추가 결제 없음 • 평생 업데이트 포함
            </p>
          </div>
        )}
        
        {/* Urgency Banner */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <Clock className="w-4 h-4 text-orange-600" />
            <span className="text-orange-900 dark:text-orange-100">
              🎉 <span className="text-primary font-bold">론칭 기념 최대 70% 할인</span> - 선착순 <span className="font-bold text-red-600">500명</span> 한정!
            </span>
          </div>
          <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>현재 <span className="font-bold text-primary">387명</span>이 신청했습니다</span>
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2 rounded-full font-medium transition-all text-sm ${
              billingCycle === 'monthly'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            월간 결제
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-5 py-2 rounded-full font-medium transition-all relative text-sm ${
              billingCycle === 'yearly'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            연간 결제
            <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5">
              2개월 무료
            </Badge>
          </button>
          <button
            onClick={() => setBillingCycle('lifetime')}
            className={`px-5 py-2 rounded-full font-medium transition-all relative text-sm ${
              billingCycle === 'lifetime'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Infinity className="w-4 h-4 inline mr-1" />
            평생이용권
            <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] px-1.5 py-0.5 animate-pulse">
              🔥 추천
            </Badge>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const discountPercent = getDiscountPercent(plan);
          
          return (
            <Card 
              key={plan.id}
              className={`relative transition-all duration-300 hover:scale-[1.02] ${
                plan.popular 
                  ? billingCycle === 'lifetime'
                    ? 'border-2 border-transparent bg-gradient-to-b from-purple-500/10 to-pink-500/10 ring-2 ring-primary shadow-xl'
                    : 'border-2 border-primary shadow-lg'
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className={`px-4 py-1 ${
                    billingCycle === 'lifetime' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-primary text-white'
                  }`}>
                    <Star className="w-3 h-3 mr-1" />
                    {billingCycle === 'lifetime' ? '최고 인기' : '가장 인기'}
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
                      <span className="text-3xl font-bold">₩{getCurrentPrice(plan).toLocaleString()}</span>
                      <span className="text-muted-foreground">
                        {billingCycle === 'monthly' ? '/월' : billingCycle === 'yearly' ? '/년' : ''}
                      </span>
                    </div>
                    {billingCycle === 'lifetime' && plan.id !== 'free' && (
                      <div className="text-sm font-medium text-primary">
                        평생 1회 결제
                      </div>
                    )}
                    {getOriginalPrice(plan) && (
                      <div className="text-sm text-muted-foreground">
                        <span className="line-through">₩{getOriginalPrice(plan)?.toLocaleString()}</span>
                        <span className="text-green-600 font-medium ml-2">{discountPercent}% 절약</span>
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
                  className={`w-full ${
                    plan.popular && billingCycle === 'lifetime'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg'
                      : plan.popular 
                        ? 'bg-primary' 
                        : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                >
                  {plan.ctaText}
                </Button>
                
                {plan.id !== 'free' && (
                  <p className="text-xs text-center text-muted-foreground">
                    {billingCycle === 'lifetime' 
                      ? '✓ 추가 결제 없음 • 평생 업데이트 포함' 
                      : '언제든 취소 가능 • 첫 7일 무료 체험'}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Lifetime Guarantee Banner */}
      {billingCycle === 'lifetime' && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl p-6 border border-green-200 dark:border-green-800 text-center">
          <h3 className="font-bold text-lg mb-2 text-green-800 dark:text-green-200">
            💯 100% 만족 보장
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300">
            구매 후 7일 이내 불만족 시 전액 환불 • 평생 무료 업데이트 • 평생 고객 지원
          </p>
        </div>
      )}
      
      {/* FAQ 섹션 */}
      <div className="bg-muted/30 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4 text-center">자주 묻는 질문</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium mb-1">Q. 평생이용권이란?</p>
            <p className="text-muted-foreground">1회 결제로 평생 모든 기능을 이용할 수 있습니다. 추가 결제 없이 향후 업데이트도 포함됩니다.</p>
          </div>
          <div>
            <p className="font-medium mb-1">Q. 무료 체험 기간이 끝나면?</p>
            <p className="text-muted-foreground">자동 결제되지 않습니다. 직접 구독 선택 시에만 결제됩니다.</p>
          </div>
          <div>
            <p className="font-medium mb-1">Q. 할인 혜택은 언제까지인가요?</p>
            <p className="text-muted-foreground">론칭 기념 특가는 선착순 500명 한정입니다. 조기 마감될 수 있습니다.</p>
          </div>
          <div>
            <p className="font-medium mb-1">Q. 환불이 가능한가요?</p>
            <p className="text-muted-foreground">구매 후 7일 이내 전액 환불 가능합니다. 불만족 시 100% 환불 보장합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPricingPlans;