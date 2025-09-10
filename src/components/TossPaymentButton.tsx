import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TossPaymentButtonProps {
  packageId: string;
  amount: number;
  packageName: string;
  className?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    TossPayments: any;
  }
}

const TossPaymentButton: React.FC<TossPaymentButtonProps> = ({
  packageId,
  amount,
  packageName,
  className = '',
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);

  const handleTossPayment = async () => {
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('로그인이 필요합니다.');
        return;
      }

      // 토스페이먼츠 결제 데이터 생성
      const { data, error } = await supabase.functions.invoke('create-toss-payment', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { 
          packageId,
          subscriptionType: 'monthly'
        }
      });

      if (error) throw error;

      if (data?.paymentData && data?.clientKey) {
        // 토스페이먼츠 SDK 로드 및 결제 실행
        const script = document.createElement('script');
        script.src = 'https://js.tosspayments.com/v1/payment';
        script.onload = () => {
          const tossPayments = window.TossPayments(data.clientKey);
          
          // 결제 요청
          tossPayments.requestPayment('카드', {
            amount: data.paymentData.amount,
            orderId: data.paymentData.orderId,
            orderName: data.paymentData.orderName,
            customerName: data.paymentData.customerName,
            customerEmail: data.paymentData.customerEmail,
            successUrl: data.paymentData.successUrl,
            failUrl: data.paymentData.failUrl,
          }).catch((error: any) => {
            console.error('토스페이먼츠 결제 오류:', error);
            toast.error('결제 중 오류가 발생했습니다.');
          });
        };
        
        document.head.appendChild(script);
      } else {
        throw new Error('결제 데이터를 받을 수 없습니다.');
      }
    } catch (error: any) {
      console.error('결제 요청 오류:', error);
      toast.error(error.message || '결제 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleTossPayment}
      disabled={disabled || loading}
      className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 ${className}`}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          결제 준비중...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          토스페이먼츠로 결제하기
        </div>
      )}
    </Button>
  );
};

export default TossPaymentButton;