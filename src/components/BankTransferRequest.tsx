import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { CheckCircle, CreditCard } from 'lucide-react';

const BankTransferRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthGuard();

  const tokenPrices = [
    { tokens: 5, price: 9900, priceId: "price_1QgOkB2MaIV7qwPqJHLrqN3z", name: "스타터 팩" },
    { tokens: 10, price: 19000, priceId: "price_1QgOl22MaIV7qwPqgXv5cUzi", name: "베이직 팩" },
    { tokens: 30, price: 49000, priceId: "price_1QgOlP2MaIV7qwPqvDJLEkm5", name: "프리미엄 팩" }
  ];

  const handlePurchase = async (priceId: string, tokens: number) => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "토큰 구매를 위해서는 로그인이 필요합니다.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, mode: 'payment' }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "결제 페이지로 이동",
          description: "새 창에서 결제를 진행해주세요.",
        });
      }
    } catch (error) {
      console.error('결제 오류:', error);
      toast({
        title: "결제 실패",
        description: "결제 처리 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 토큰 가격표 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            토큰 구매
          </CardTitle>
          <CardDescription>원하는 토큰 패키지를 선택하고 카드로 안전하게 결제하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {tokenPrices.map((plan) => (
              <Card key={plan.tokens} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-primary mt-2">
                    {plan.tokens}토큰
                  </div>
                  <div className="text-2xl font-semibold mt-2">
                    ₩{plan.price.toLocaleString()}
                  </div>
                  <CardDescription className="mt-2">
                    토큰당 ₩{Math.round(plan.price / plan.tokens).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    className="w-full"
                    onClick={() => handlePurchase(plan.priceId, plan.tokens)}
                    disabled={isLoading}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {isLoading ? '처리 중...' : '카드로 구매하기'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 안내사항 */}
      <Card>
        <CardHeader>
          <CardTitle>구매 안내</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <p>결제는 안전한 Stripe 결제 시스템을 통해 처리됩니다.</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <p>구매한 토큰은 즉시 계정에 충전됩니다.</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <p>토큰은 구매일로부터 1년간 유효합니다.</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <p>결제 관련 문의사항은 고객센터(aihpro@naver.com)로 연락주세요.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankTransferRequest;