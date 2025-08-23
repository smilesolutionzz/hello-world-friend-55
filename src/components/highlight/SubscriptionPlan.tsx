import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, ArrowLeft, RefreshCw, Zap, Star, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  type: string;
  is_active: boolean;
}

export const SubscriptionPlan = () => {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribed, subscription_tier, loading: subLoading, refreshSubscription } = useSubscription();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });

        if (error) throw error;
        setPlans(data || []);
      } catch (error) {
        console.error('플랜 조회 오류:', error);
        toast({
          title: "플랜 조회 실패",
          description: "구독 플랜을 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, [toast]);

  const handleSubscribe = async (planId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { 
          planId,
          subscriptionType: 'monthly'
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "결제 페이지로 이동",
          description: "Stripe 결제 페이지가 새 창에서 열렸습니다.",
        });
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast({
        title: "구독 오류",
        description: error.message || "구독 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR');
  };

  const getPlanIcon = (planName: string) => {
    if (planName.includes('스타터')) return <Zap className="w-5 h-5" />;
    if (planName.includes('프리미엄')) return <Star className="w-5 h-5" />;
    if (planName.includes('프로')) return <Trophy className="w-5 h-5" />;
    return <Check className="w-5 h-5" />;
  };

  const isPopularPlan = (planName: string) => {
    return planName.includes('프리미엄');
  };

  if (plansLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>구독 플랜을 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
            매월 토큰을 받아 다양한 AI 분석을 체험해보세요
          </p>
          {subscribed && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">
                현재 {subscription_tier === 'premium' ? '프리미엄' : '기본'} 플랜을 사용 중입니다
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshSubscription}
                disabled={subLoading}
                className="mt-2"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${subLoading ? 'animate-spin' : ''}`} />
                구독 상태 새로고침
              </Button>
            </div>
          )}
        </div>

        {/* 무료 플랜 */}
        <div className="mb-8">
          <Card className="relative border-2">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                무료 플랜
              </CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">₩0</span>
                <span className="text-muted-foreground ml-1">/월</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">회원가입 시 10개 토큰 지급</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">매일 3개 토큰 보너스</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">기본 AI 분석</span>
                </li>
              </ul>
              
              <Button
                variant="outline"
                className="w-full"
                disabled
              >
                현재 플랜
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 유료 플랜들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.filter(plan => plan.type === 'paid').map((plan) => (
            <Card 
              key={plan.id}
              className={`relative ${
                isPopularPlan(plan.name) 
                  ? 'border-primary shadow-lg border-2' 
                  : 'border-2'
              }`}
            >
              {isPopularPlan(plan.name) && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Crown className="w-3 h-3 mr-1" />
                    인기
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  {getPlanIcon(plan.name)}
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₩{formatPrice(plan.price)}</span>
                  <span className="text-muted-foreground ml-1">/월</span>
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
                  variant={isPopularPlan(plan.name) ? "default" : "outline"}
                  className="w-full"
                  disabled={loading}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    "구독하기"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold mb-4">월 구독의 혜택</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="space-y-2">
                <p>• 매월 정해진 토큰 자동 지급</p>
                <p>• 결제 완료 시 즉시 토큰 지급</p>
                <p>• 안전한 Stripe 결제 시스템</p>
              </div>
              <div className="space-y-2">
                <p>• 언제든지 구독 취소 가능</p>
                <p>• 구독 기간 중 토큰 누적 가능</p>
                <p>• 24/7 고객 지원</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};