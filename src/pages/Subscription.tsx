import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Crown, Sparkles, Users, Clock, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  yearly_price: number;
  features: any; // JSON 타입 허용
  max_reports: number;
  expert_consultation: boolean;
  priority_support: boolean;
}

const Subscription = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
    checkCurrentSubscription();
  }, []);

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      toast({ title: "오류", description: "구독 플랜을 불러올 수 없습니다.", variant: "destructive" });
      return;
    }

    setPlans(data || []);
  };

  const checkCurrentSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_subscriptions')
      .select('plan_id, subscription_plans(name)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (data) {
      setCurrentPlan(data.plan_id);
    }
  };

  const handleSubscribe = async (planId: string, planName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "로그인 필요", description: "구독하려면 먼저 로그인해주세요." });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-toss-payment', {
        body: { 
          planId, 
          subscriptionType: isYearly ? 'yearly' : 'monthly' 
        }
      });

      if (error) throw error;

      if (data.success && data.message) {
        // 무료 플랜인 경우
        toast({ title: "구독 완료", description: data.message });
        checkCurrentSubscription();
        return;
      }

      // 유료 플랜인 경우 - 토스페이먼츠 체크아웃 URL로 이동
      if (data.paymentData && data.paymentData.checkoutUrl) {
        window.location.href = data.paymentData.checkoutUrl;
        return;
      }

      // 임시: 성공 페이지로 리다이렉트 (테스트용)
      const successUrl = data.paymentData.successUrl + 
        `?paymentKey=test_payment_key&orderId=${data.paymentData.orderId}&amount=${data.paymentData.amount}`;
      window.location.href = successUrl;

    } catch (error: any) {
      toast({ 
        title: "오류", 
        description: error.message || "구독 처리 중 오류가 발생했습니다.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getDiscountPercent = (monthly: number, yearly: number) => {
    if (monthly === 0) return 0;
    return Math.round((1 - (yearly / 12) / monthly) * 100);
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case '무료': return <Users className="h-6 w-6" />;
      case '프리미엄': return <Sparkles className="h-6 w-6" />;
      case '프로': return <Crown className="h-6 w-6" />;
      default: return <Award className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">AI 심리분석 구독 플랜</h1>
          <p className="text-lg text-muted-foreground mb-8">
            전문가급 AI 분석과 맞춤형 심리 상담으로 더 나은 내일을 만들어보세요
          </p>
          
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className={`text-sm ${!isYearly ? 'font-semibold' : ''}`}>월간</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={`text-sm ${isYearly ? 'font-semibold' : ''}`}>연간</span>
            <Badge variant="secondary" className="ml-2">연간 결제 시 최대 17% 할인</Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            const displayPrice = isYearly ? plan.yearly_price : plan.price;
            const monthlyPrice = isYearly ? Math.round(plan.yearly_price / 12) : plan.price;
            const discount = getDiscountPercent(plan.price, plan.yearly_price);
            
            return (
              <Card key={plan.id} className={`relative ${plan.name === '프리미엄' ? 'border-primary shadow-lg scale-105' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
                {plan.name === '프리미엄' && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                    추천
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-3">
                    {getPlanIcon(plan.name)}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>
                    {plan.max_reports === -1 ? '무제한' : `월 ${plan.max_reports}회`} 리포트
                  </CardDescription>
                  
                  <div className="mt-4">
                    {plan.price === 0 ? (
                      <div className="text-3xl font-bold">무료</div>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-3xl font-bold">
                            ₩{formatPrice(monthlyPrice)}
                          </span>
                          <span className="text-sm text-muted-foreground">/월</span>
                        </div>
                        {isYearly && discount > 0 && (
                          <div className="text-sm text-muted-foreground">
                            <span className="line-through">₩{formatPrice(plan.price)}</span>
                            <Badge variant="destructive" className="ml-2 text-xs">
                              {discount}% 할인
                            </Badge>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {(Array.isArray(plan.features) ? plan.features : []).map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.expert_consultation && (
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">전문가 상담</span>
                    </div>
                  )}
                  
                  {plan.priority_support && (
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">우선 지원</span>
                    </div>
                  )}
                </CardContent>

                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={plan.name === '프리미엄' ? 'default' : 'outline'}
                    disabled={loading || isCurrentPlan}
                    onClick={() => handleSubscribe(plan.id, plan.name)}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        처리중...
                      </div>
                    ) : isCurrentPlan ? (
                      '현재 플랜'
                    ) : plan.price === 0 ? (
                      '무료로 시작하기'
                    ) : (
                      `${plan.name} 구독하기`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">자주 묻는 질문</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">구독을 취소할 수 있나요?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  네, 언제든지 구독을 취소하실 수 있습니다. 현재 결제 주기가 끝날 때까지는 계속 서비스를 이용하실 수 있어요.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">결제는 어떻게 이루어지나요?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  토스페이먼츠를 통해 안전하게 결제됩니다. 카드, 계좌이체, 간편결제 등 다양한 결제 수단을 지원합니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;