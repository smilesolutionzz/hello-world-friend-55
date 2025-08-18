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
      name: "무료 체험",
      price: "무료",
      period: "3회까지",
      description: "기본 관찰일지 체험",
      features: [
        "관찰일지 작성 3회",
        "기본 AI 요약 리포트",
        "미디어 파일 업로드",
        "간단한 대시보드"
      ],
      buttonText: "체험하기",
      buttonVariant: "outline" as const,
      popular: false,
      current: true
    },
    {
      name: "프리미엄",
      price: "29,000원",
      period: "월",
      originalPrice: "58,000원",
      discount: "50% 할인",
      description: "무제한 관찰 및 심화 분석",
      features: [
        "무제한 관찰일지 작성",
        "심화 AI 분석 리포트",
        "레이더차트 및 추이 분석",
        "전문가급 PDF 다운로드",
        "누적 데이터 비교 분석",
        "전문가 피드백 요청",
        "이메일 주간 리포트",
        "우선 고객지원"
      ],
      buttonText: "프리미엄 시작하기",
      buttonVariant: "default" as const,
      popular: true,
      current: false
    },
    {
      name: "전문기관",
      price: "문의",
      period: "",
      description: "기관/팀 단위 맞춤 솔루션",
      features: [
        "무제한 사용자 추가",
        "기관 전용 대시보드",
        "전문가 협업 도구",
        "맞춤형 리포트 템플릿",
        "API 연동 지원",
        "전담 계정 매니저",
        "온사이트 교육 지원"
      ],
      buttonText: "문의하기",
      buttonVariant: "outline" as const,
      popular: false,
      current: false
    }
  ];

  const handlePlanSelect = (planName: string) => {
    if (planName === "무료 체험") {
      navigate('/dashboard');
    } else if (planName === "프리미엄") {
      // TODO: Implement Stripe checkout
      console.log('Starting premium checkout...');
    } else {
      // Contact form for enterprise
      console.log('Opening contact form...');
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
                    {plan.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {plan.originalPrice}
                      </span>
                    )}
                    <span className={`text-3xl font-bold ${plan.popular ? 'text-primary' : ''}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground">/{plan.period}</span>
                    )}
                  </div>
                  
                  {plan.discount && (
                    <Badge variant="destructive" className="text-xs">
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