import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Shield, CheckCircle } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  yearly_price?: number;
  description: string;
  features: string[];
}

interface TossPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
}

declare global {
  interface Window {
    TossPayments: any;
  }
}

export const TossPaymentModal: React.FC<TossPaymentModalProps> = ({ isOpen, onClose, plan }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState<'monthly' | 'yearly'>('monthly');
  const [tossPayments, setTossPayments] = useState<any>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (isOpen && !tossPayments) {
      // 토스페이먼츠 SDK 로드
      if (!window.TossPayments) {
        const script = document.createElement('script');
        script.src = 'https://js.tosspayments.com/v1/payment';
        script.async = true;
        script.onload = () => {
          // 클라이언트 키 설정은 결제 생성 시 받아옴
          console.log('TossPayments SDK loaded');
        };
        document.head.appendChild(script);
      }
    }
  }, [isOpen, tossPayments]);

  const handlePayment = async () => {
    if (!plan) return;

    try {
      setIsProcessing(true);

      // 결제 요청 생성
      const { data, error } = await supabase.functions.invoke('create-toss-payment', {
        body: {
          planId: plan.id,
          subscriptionType
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || '결제 요청 생성에 실패했습니다.');

      console.log('Payment data received:', data);

      // 무료 플랜인 경우
      if (plan.price === 0) {
        toast({
          title: "구독 활성화 완료",
          description: "무료 플랜이 성공적으로 활성화되었습니다.",
        });
        onClose();
        window.location.reload();
        return;
      }

      // 토스페이먼츠 클라이언트 초기화
      if (!window.TossPayments) {
        throw new Error('토스페이먼츠 SDK가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      }

      const tossPaymentsInstance = window.TossPayments(data.clientKey);
      setTossPayments(tossPaymentsInstance);

      // 결제창 호출
      await tossPaymentsInstance.requestPayment('카드', {
        amount: data.paymentData.amount,
        orderId: data.paymentData.orderId,
        orderName: data.paymentData.orderName,
        customerEmail: data.paymentData.customerEmail,
        customerName: data.paymentData.customerName,
        successUrl: data.paymentData.successUrl,
        failUrl: data.paymentData.failUrl,
      });

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "결제 오류",
        description: error.message || "결제 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!plan) return null;

  const selectedPrice = subscriptionType === 'yearly' ? plan.yearly_price : plan.price;
  const monthlyPrice = subscriptionType === 'yearly' && plan.yearly_price ? plan.yearly_price / 12 : plan.price;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">결제하기</DialogTitle>
        </DialogHeader>
        
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">{plan.name} 플랜</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 구독 유형 선택 (yearly_price가 있는 경우만) */}
            {plan.yearly_price && plan.yearly_price > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={subscriptionType === 'monthly' ? 'default' : 'outline'}
                  onClick={() => setSubscriptionType('monthly')}
                  className="h-auto py-3 px-4"
                >
                  <div className="text-center">
                    <div className="font-semibold">월간</div>
                    <div className="text-sm text-muted-foreground">
                      ₩{plan.price.toLocaleString()}/월
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant={subscriptionType === 'yearly' ? 'default' : 'outline'}
                  onClick={() => setSubscriptionType('yearly')}
                  className="h-auto py-3 px-4 relative"
                >
                  <div className="text-center">
                    <div className="font-semibold">연간</div>
                    <div className="text-sm text-muted-foreground">
                      ₩{Math.round(monthlyPrice).toLocaleString()}/월
                    </div>
                    <Badge className="absolute -top-2 -right-2 text-xs">
                      {Math.round((1 - monthlyPrice / plan.price) * 100)}% 할인
                    </Badge>
                  </div>
                </Button>
              </div>
            )}

            {/* 가격 표시 */}
            <div className="text-center py-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold">
                {selectedPrice ? `₩${selectedPrice.toLocaleString()}` : '무료'}
              </div>
              <div className="text-sm text-muted-foreground">
                {subscriptionType === 'yearly' ? '연간 결제' : '월간 결제'}
              </div>
            </div>

            {/* 주요 기능 */}
            <div className="space-y-2">
              <div className="font-semibold text-sm">포함된 기능</div>
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* 보안 안내 */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>토스페이먼츠의 안전한 결제 시스템을 통해 처리됩니다</span>
            </div>

            {/* 결제 버튼 */}
            <Button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full h-12 text-base"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  결제 처리 중...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  {selectedPrice ? `₩${selectedPrice.toLocaleString()} 결제하기` : '무료로 시작하기'}
                </>
              )}
            </Button>

            {/* 취소 버튼 */}
            <Button variant="outline" onClick={onClose} className="w-full" disabled={isProcessing}>
              취소
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};