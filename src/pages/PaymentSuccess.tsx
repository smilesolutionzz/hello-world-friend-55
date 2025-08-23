import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');

      if (!paymentKey || !orderId || !amount) {
        toast({
          title: "오류",
          description: "결제 정보가 올바르지 않습니다.",
          variant: "destructive"
        });
        navigate('/token-subscription');
        return;
      }

      try {
        console.log('Confirming payment:', { paymentKey, orderId, amount });
        
        const { data, error } = await supabase.functions.invoke('confirm-toss-payment', {
          body: { paymentKey, orderId, amount: parseInt(amount) }
        });

        if (error) throw error;

        if (data.success) {
          setPaymentConfirmed(true);
          toast({
            title: "결제 완료",
            description: "구독이 성공적으로 활성화되었습니다!",
          });
        } else {
          throw new Error(data.error || "결제 확인에 실패했습니다.");
        }
      } catch (error: any) {
        console.error('Payment confirmation error:', error);
        toast({
          title: "결제 확인 실패",
          description: error.message || "결제 확인 중 오류가 발생했습니다.",
          variant: "destructive"
        });
        navigate('/token-subscription');
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [searchParams, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-center text-muted-foreground">결제를 확인하고 있습니다...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">결제 완료!</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              구독이 성공적으로 활성화되었습니다. 이제 모든 프리미엄 기능을 이용하실 수 있어요!
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Receipt className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">주문번호</p>
                <p className="text-sm text-muted-foreground">{searchParams.get('orderId')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">서비스 시작</p>
                <p className="text-sm text-muted-foreground">즉시 이용 가능</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={() => navigate('/dashboard')}
            >
              대시보드로 이동
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/')}
            >
              홈으로 돌아가기
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>결제 관련 문의사항이 있으시면 고객센터로 연락해주세요.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;