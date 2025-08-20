import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const SubscriptionPlan = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubscribe = async (planType: 'premium') => {
    setLoading(true);
    try {
      // TODO: Implement Stripe checkout
      toast({
        title: "구독 준비 중",
        description: "결제 시스템을 준비 중입니다.",
      });
    } catch (error: any) {
      toast({
        title: "구독 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: '무료',
      price: '0원',
      period: '영구',
      features: [
        '월 1회 검사',
        '기본 AI 분석',
        '결과 시각화'
      ],
      buttonText: '현재 플랜',
      buttonVariant: 'outline' as const,
      isCurrentPlan: true
    },
    {
      name: '프리미엄',
      price: '29,900원',
      period: '월',
      features: [
        '무제한 검사',
        '고급 AI 분석',
        '전문가 피드백',
        'PDF 리포트 다운로드',
        '카카오 알림톡',
        '우선 고객지원'
      ],
      buttonText: '구독하기',
      buttonVariant: 'default' as const,
      isPremium: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          <h1 className="text-xl font-semibold">구독 관리</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">
            나에게 맞는 플랜을 선택하세요
          </h2>
          <p className="text-muted-foreground">
            더 정확하고 상세한 심리 분석을 받아보세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={`relative ${plan.isPremium ? 'border-primary shadow-lg' : ''}`}
            >
              {plan.isPremium && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Crown className="w-3 h-3 mr-1" />
                    추천
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">/{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  variant={plan.buttonVariant}
                  className="w-full"
                  disabled={plan.isCurrentPlan || loading}
                  onClick={() => plan.isPremium && handleSubscribe('premium')}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold mb-2">자주 묻는 질문</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• 언제든지 구독을 취소할 수 있나요? 네, 언제든지 취소 가능합니다.</p>
              <p>• 결제는 어떻게 이루어지나요? 안전한 Stripe 결제 시스템을 사용합니다.</p>
              <p>• 전문가 피드백은 얼마나 걸리나요? 보통 1-2일 내에 제공됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};