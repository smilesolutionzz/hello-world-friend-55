import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = 'https://hrcqxjetmzxoephgyjlb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyY3F4amV0bXp4b2VwaGd5amxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NjUzNDAsImV4cCI6MjA3MTI0MTM0MH0.LPXwumPDk6kq5W7jRI6yx39ajYxXw15yTQvfKYtmzzg';

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
        // 1) 서버 승인
        const confirmRes = await supabase.functions.invoke('toss-payments-confirm', {
          body: { paymentKey, orderId, amount }
        });

        if (confirmRes.error) {
          alert(`결제 승인 실패: ${confirmRes.error.message || '알 수 없는 오류'}`);
          setLoading(false);
          return;
        }

        const result = confirmRes.data;

        // 2) Supabase payments 테이블에 저장
        const saveRes = await fetch(`${SUPABASE_URL}/rest/v1/payments`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
          },
          body: JSON.stringify({
            order_id: orderId,
            token_pack: pack,
            amount: amount,
            customer_name: 'AI Highlight 사용자',
            payment_key: paymentKey,
            method: result.method || 'CARD',
            approved_at: result.approvedAt
          })
        });

        if (!saveRes.ok) {
          const err = await saveRes.json().catch(() => ({}));
          console.warn('DB 저장 실패', err);
        }

        setPaymentData({
          pack,
          amount,
          orderId,
          approvedAt: result.approvedAt
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
            <h2 className="text-2xl font-bold mb-4">결제 처리 실패</h2>
            <p className="text-muted-foreground mb-6">다시 시도해주세요.</p>
            <Button onClick={() => navigate('/')} style={{ backgroundColor: '#0064FF' }}>
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
              <span>{paymentData.pack || '토큰팩'}</span>
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
            style={{ backgroundColor: '#0064FF' }}
          >
            홈으로 돌아가기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
