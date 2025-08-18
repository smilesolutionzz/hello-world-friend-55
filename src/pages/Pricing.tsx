import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, TrendingUp, BarChart3, FileText, MessageSquare, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PricingPage = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free",
      price: "무료",
      period: "",
      description: "월 3회 요약 리포트",
      features: [
        "월 3회 관찰일지 작성",
        "기본 AI 요약 리포트",
        "미디어 파일 업로드",
        "간단한 대시보드"
      ],
      buttonText: "무료 시작하기",
      buttonVariant: "outline" as const,
      popular: false,
      current: true
    },
    {
      name: "Premium",
      price: "29,900원",
      period: "월",
      yearlyPrice: "299,000원",
      discount: "연간 결제 시 2개월 무료",
      description: "월 5회 + 차트 + PDF + 전문가 코멘트 1회",
      features: [
        "월 5회 관찰일지 작성",
        "심화 AI 분석 리포트",
        "차트 및 추이 분석",
        "PDF 리포트 다운로드",
        "전문가 코멘트 1회",
        "우선 고객지원"
      ],
      buttonText: "Premium 구독하기",
      buttonVariant: "default" as const,
      popular: true,
      current: false
    },
    {
      name: "Pro",
      price: "99,000원",
      period: "월",
      yearlyPrice: "990,000원",
      discount: "연간 결제 시 2개월 무료",
      description: "무제한 + 전체 차트 + PDF + 전문가 코멘트 무제한",
      features: [
        "무제한 관찰일지 작성",
        "전체 차트 및 추이 분석",
        "PDF 리포트 다운로드",
        "전문가 코멘트 무제한",
        "맞춤형 리포트 템플릿",
        "전담 계정 매니저",
        "24/7 우선 지원"
      ],
      buttonText: "Pro 구독하기",
      buttonVariant: "outline" as const,
      popular: false,
      current: false
    }
  ];

  const handlePlanSelect = (planName: string) => {
    if (planName === "Free") {
      navigate('/dashboard');
    } else if (planName === "Premium") {
      // 토스 결제 페이지로 이동 (자리표시 링크)
      window.open('https://tosspayments.com/pricing/premium', '_blank');
    } else if (planName === "Pro") {
      // 토스 결제 페이지로 이동 (자리표시 링크)
      window.open('https://tosspayments.com/pricing/pro', '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            요금제 선택
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            기록할수록 패턴이 보입니다. 4회차부터는 장기 추적/전문가 코멘트가 열립니다.
          </p>
        </div>

        {/* Feature Comparison */}
        <div className="mb-12 bg-muted/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-center">왜 프리미엄을 선택해야 할까요?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium mb-2">장기 패턴 분석</h4>
              <p className="text-sm text-muted-foreground">
                3개월, 6개월 단위 변화 추이를 한눈에 파악
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium mb-2">전문가급 분석</h4>
              <p className="text-sm text-muted-foreground">
                AI가 제공하는 심화 인사이트와 맞춤 권고사항
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium mb-2">전문가 피드백</h4>
              <p className="text-sm text-muted-foreground">
                실제 전문가가 검토하는 개별 코멘트와 조언
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''} ${plan.current ? 'border-muted' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    가장 인기
                  </Badge>
                </div>
              )}
              
              {plan.current && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge variant="secondary" className="px-4 py-1">
                    현재 플랜
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {plan.name === "프리미엄" && <Crown className="w-5 h-5 text-primary mr-2" />}
                  {plan.name === "전문기관" && <Sparkles className="w-5 h-5 text-purple-600 mr-2" />}
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className={`text-3xl font-bold ${plan.popular ? 'text-primary' : ''}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground">/{plan.period}</span>
                    )}
                  </div>
                  
                  {plan.yearlyPrice && (
                    <div className="text-sm text-muted-foreground">
                      연간: {plan.yearlyPrice}
                    </div>
                  )}
                  
                  {plan.discount && (
                    <Badge variant="secondary" className="text-xs">
                      {plan.discount}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.buttonVariant}
                  className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                  size="lg"
                  onClick={() => handlePlanSelect(plan.name)}
                  disabled={plan.current}
                >
                  {plan.current ? '현재 이용 중' : plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center space-y-4">
          <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
            <h4 className="font-medium mb-2">🎁 첫 달 특별 혜택</h4>
            <p className="text-sm text-muted-foreground">
              프리미엄 가입 시 첫 7일 무료 체험 + 첫 달 50% 할인 혜택을 제공합니다.<br />
              언제든지 취소 가능하며, 데이터는 안전하게 보관됩니다.
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span>✓ 안전한 결제</span>
            <span>✓ 언제든 취소</span>
            <span>✓ 데이터 보호</span>
            <span>✓ 24/7 지원</span>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            ← 대시보드로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;