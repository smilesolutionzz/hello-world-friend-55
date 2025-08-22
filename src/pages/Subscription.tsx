import React from 'react';
import Navigation from '@/components/Navigation';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Crown, Zap, Star, Check } from 'lucide-react';

const Subscription = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: '무료 체험',
      price: '₩0',
      period: '영구',
      description: '기본 기능을 체험해보세요',
      features: ['월 1회 심리검사', 'AI 기본 분석', '결과 요약'],
      popular: false,
      buttonText: '현재 플랜',
      disabled: true
    },
    {
      name: '토큰팩 10개',
      price: '₩9,900',
      period: '일회구매',
      description: '필요할 때만 사용하세요',
      features: ['10회 심리검사', 'AI 상세 분석', '결과 저장', '가족 관리'],
      popular: true,
      buttonText: '구매하기',
      disabled: false
    },
    {
      name: '토큰팩 25개',
      price: '₩19,900',
      period: '일회구매',
      description: '가족 모두를 위한 선택',
      features: ['25회 심리검사', 'AI 상세 분석', '결과 저장', '가족 관리', '우선 지원'],
      popular: false,
      buttonText: '구매하기',
      disabled: false
    }
  ];

  const handlePlanSelect = (planName: string) => {
    if (planName.includes('토큰팩')) {
      navigate('/token-subscription');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            홈으로
          </Button>
          <div>
            <h1 className="text-3xl font-bold">구독 플랜</h1>
            <p className="text-muted-foreground">
              당신에게 맞는 최적의 플랜을 선택하세요
            </p>
          </div>
        </div>

        {/* 플랜 카드들 */}
        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white">
                    <Star className="w-3 h-3 mr-1" />
                    인기
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-4">
                  {plan.name.includes('무료') && <Zap className="w-8 h-8 text-gray-500" />}
                  {plan.name.includes('10개') && <Zap className="w-8 h-8 text-blue-500" />}
                  {plan.name.includes('25개') && <Crown className="w-8 h-8 text-yellow-500" />}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <div className="text-3xl font-bold">{plan.price}</div>
                  <div className="text-sm text-muted-foreground">{plan.period}</div>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  disabled={plan.disabled}
                  onClick={() => handlePlanSelect(plan.name)}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 추가 정보 */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold mb-4">자주 묻는 질문</h3>
          <div className="max-w-2xl mx-auto space-y-4 text-sm text-muted-foreground">
            <p>• 토큰은 언제까지 사용할 수 있나요? → 구매 후 1년간 사용 가능합니다.</p>
            <p>• 가족 구성원도 함께 사용할 수 있나요? → 네, 하나의 계정으로 가족 전체를 관리할 수 있습니다.</p>
            <p>• 결제 후 바로 사용할 수 있나요? → 네, 결제 완료 후 즉시 토큰이 충전됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;