import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    const processPayment = async () => {
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = Number(searchParams.get('amount'));
      const pack = searchParams.get('pack') || null;

      if (!paymentKey || !orderId || !amount) {
        alert('필수 값 누락. 홈으로 이동합니다.');
        navigate('/');
        return;
      }

      try {
        // 🔒 인증된 세션으로 결제 승인
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          alert('로그인이 필요합니다.');
          navigate('/auth');
          return;
        }

        const { data: result, error } = await supabase.functions.invoke('unified-payment', {
          headers: { Authorization: `Bearer ${session.session.access_token}` },
          body: {
            action: 'confirm-payment',
            paymentKey,
            orderId,
            amount,
          }
        });

        if (error || !result?.success) {
          alert(`결제 승인 실패: ${result?.error || error?.message || '알 수 없는 오류'}`);
          setLoading(false);
          return;
        }

        setPaymentData({
          pack,
          amount,
          orderId,
          approvedAt: result.paymentResult?.approvedAt,
          method: result.paymentResult?.method || 'CARD',
        });
        setSuccess(true);
      } catch (error: any) {
        console.error('Payment processing error:', error);
        alert(`오류: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">결제 처리 실패</h2>
            <p className="text-muted-foreground mb-6">다시 시도해주세요.</p>
            <Button onClick={() => navigate('/')} className="w-full">
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-2">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-6">결제가 완료되었습니다</h2>
          
          <div className="space-y-3 text-left mb-6">
            <div className="flex justify-between p-3 bg-muted rounded">
              <span className="font-medium">상품명</span>
              <span>{paymentData.pack || '구독'}</span>
            </div>
            <div className="flex justify-between p-3 bg-muted rounded">
              <span className="font-medium">결제금액</span>
              <span className="font-bold">₩{paymentData.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-3 bg-muted rounded">
              <span className="font-medium">주문번호</span>
              <span className="text-sm">{paymentData.orderId}</span>
            </div>
            <div className="flex justify-between p-3 bg-muted rounded">
              <span className="font-medium">승인시각</span>
              <span className="text-sm">{paymentData.approvedAt || ''}</span>
            </div>
          </div>

          <Button 
            onClick={() => navigate('/')} 
            className="w-full"
          >
            홈으로 돌아가기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
