import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(true);
  const [success, setSuccess] = useState(false);
  const [tokensPurchased, setTokensPurchased] = useState(0);

  useEffect(() => {
    confirmPayment();
  }, []);

  const confirmPayment = async () => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (!paymentKey || !orderId || !amount) {
      toast({
        title: '오류',
        description: '결제 정보가 올바르지 않습니다.',
        variant: 'destructive',
      });
      setConfirming(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('로그인이 필요합니다');
      }

      // Edge Function을 통해 결제 승인
      const { data, error } = await supabase.functions.invoke('toss-payments-confirm', {
        body: {
          paymentKey,
          orderId,
          amount: parseInt(amount),
        },
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setSuccess(true);
        setTokensPurchased(data.tokensPurchased);
        toast({
          title: '결제 완료!',
          description: `${data.tokensPurchased}개의 토큰이 충전되었습니다.`,
        });
      } else {
        throw new Error(data.error || '결제 승인에 실패했습니다');
      }
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      toast({
        title: '결제 승인 실패',
        description: error.message || '결제 승인 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
      setSuccess(false);
    } finally {
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">결제 처리 중</h2>
          <p className="text-muted-foreground">
            잠시만 기다려주세요...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <Card className="p-12 text-center max-w-md">
        {success ? (
          <>
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">결제 완료!</h1>
            <p className="text-lg text-muted-foreground mb-2">
              {tokensPurchased}개의 토큰이
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              성공적으로 충전되었습니다
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full"
                size="lg"
              >
                대시보드로 이동
              </Button>
              <Button
                onClick={() => navigate('/token-subscription')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                추가 충전하기
              </Button>
            </div>
          </>
        ) : (
          <>
            <XCircle className="w-20 h-20 text-destructive mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">결제 실패</h1>
            <p className="text-lg text-muted-foreground mb-8">
              결제 처리 중 문제가 발생했습니다
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/token-subscription')}
                className="w-full"
                size="lg"
              >
                다시 시도하기
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                대시보드로 이동
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default PaymentSuccess;
