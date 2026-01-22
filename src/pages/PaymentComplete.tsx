import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Home, Sparkles, Coins } from 'lucide-react';

const PaymentComplete = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const status = searchParams.get('status');
  const productType = searchParams.get('type');

  useEffect(() => {
    const confirmPayment = async () => {
      // 실패 상태로 리다이렉트된 경우
      if (status === 'fail') {
        setLoading(false);
        setSuccess(false);
        return;
      }

      if (!paymentKey || !orderId || !amount) {
        setLoading(false);
        setSuccess(false);
        return;
      }

      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          toast({
            title: '로그인 필요',
            description: '로그인 후 다시 시도해주세요.',
            variant: 'destructive'
          });
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase.functions.invoke('unified-payment', {
          headers: { Authorization: `Bearer ${session.session.access_token}` },
          body: {
            action: 'confirm-payment',
            paymentKey,
            orderId,
            amount: parseInt(amount),
          }
        });

        if (error || !data?.success) {
          throw new Error(data?.error || error?.message || '결제 확인에 실패했습니다.');
        }

        setSuccess(true);
        setPaymentInfo(data);
        
        toast({
          title: '🎉 결제 완료!',
          description: getSuccessMessage(data.productType),
        });

      } catch (err: any) {
        console.error('Payment confirmation error:', err);
        setSuccess(false);
        toast({
          title: '결제 확인 실패',
          description: err.message || '결제 확인 중 오류가 발생했습니다.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [paymentKey, orderId, amount, status, navigate, toast]);

  const getSuccessMessage = (type: string) => {
    switch (type) {
      case 'pass':
        return '프리미엄 패스가 활성화되었습니다.';
      case 'cash':
        return '캐시가 충전되었습니다.';
      case 'consult':
        return '상담 예약이 완료되었습니다.';
      default:
        return '결제가 완료되었습니다.';
    }
  };

  const getSuccessIcon = () => {
    switch (productType) {
      case 'pass':
        return <Sparkles className="w-16 h-16 text-amber-500" />;
      case 'cash':
        return <Coins className="w-16 h-16 text-emerald-500" />;
      default:
        return <CheckCircle2 className="w-16 h-16 text-emerald-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <Card className="p-8 text-center max-w-md mx-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-bold mb-2">결제 확인 중...</h2>
          <p className="text-muted-foreground">잠시만 기다려주세요.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="p-8 text-center max-w-md w-full">
        {success ? (
          <>
            <div className="mb-6 flex justify-center">
              {getSuccessIcon()}
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">
              결제 완료!
            </h2>
            <p className="text-muted-foreground mb-6">
              {getSuccessMessage(paymentInfo?.productType || productType)}
            </p>
            
            {paymentInfo?.paymentResult && (
              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">주문번호</span>
                  <span className="font-medium">{orderId?.slice(-12)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">결제금액</span>
                  <span className="font-bold text-primary">₩{parseInt(amount || '0').toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">결제수단</span>
                  <span>{paymentInfo.paymentResult.method || '카드'}</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {productType === 'pass' && (
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/dashboard')}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  대시보드로 이동
                </Button>
              )}
              {productType === 'cash' && (
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/token-subscription')}
                >
                  <Coins className="w-4 h-4 mr-2" />
                  서비스 이용하기
                </Button>
              )}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/')}
              >
                <Home className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 flex justify-center">
              <XCircle className="w-16 h-16 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">
              결제 실패
            </h2>
            <p className="text-muted-foreground mb-6">
              결제 처리 중 문제가 발생했습니다.<br />
              다시 시도해주세요.
            </p>
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => navigate('/token-subscription')}
              >
                다시 시도
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/')}
              >
                <Home className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default PaymentComplete;
