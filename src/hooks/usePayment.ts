import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SUBSCRIPTION_PRICE } from '@/constants/tokenCosts';

// 상품 정의 - 구독 단일화
export const PRODUCTS = {
  subscription_monthly: { 
    id: 'subscription_monthly', 
    type: 'subscription', 
    name: '월간 구독', 
    description: '30일 무제한 이용',
    price: SUBSCRIPTION_PRICE,
    originalPrice: 29900, 
    discount: 33 
  },
  // 하위 호환성
  pass_30: { 
    id: 'subscription_monthly', 
    type: 'subscription', 
    name: '월간 구독', 
    description: '30일 무제한 이용',
    price: SUBSCRIPTION_PRICE, 
    originalPrice: 29900, 
    discount: 33 
  },
} as const;

export type ProductId = keyof typeof PRODUCTS;
export type Product = typeof PRODUCTS[ProductId];

interface PaymentState {
  loading: boolean;
  clientKey: string | null;
  error: string | null;
}

export function usePayment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<PaymentState>({
    loading: false,
    clientKey: null,
    error: null,
  });

  // Toss Client Key 로드
  useEffect(() => {
    const fetchClientKey = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) return;

        const { data, error } = await supabase.functions.invoke('unified-payment', {
          headers: { Authorization: `Bearer ${session.session.access_token}` },
          body: { action: 'get-client-key' }
        });

        if (!error && data?.clientKey) {
          setState(prev => ({ ...prev, clientKey: data.clientKey }));
        }
      } catch (err) {
        console.error('Client key 로드 실패:', err);
      }
    };

    fetchClientKey();
  }, []);

  const pay = useCallback(async (productId: ProductId | string, customPrice?: number) => {
    const product = PRODUCTS[productId as ProductId];
    
    if (!product && !customPrice) {
      toast({ title: '상품 오류', description: '잘못된 상품입니다.', variant: 'destructive' });
      return false;
    }

    if (!state.clientKey) {
      toast({ title: '결제 준비 중', description: '잠시 후 다시 시도해주세요.', variant: 'destructive' });
      return false;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast({ title: '로그인 필요', description: '로그인 후 결제해주세요.' });
        navigate('/auth');
        return false;
      }

      const { data, error } = await supabase.functions.invoke('unified-payment', {
        headers: { Authorization: `Bearer ${session.session.access_token}` },
        body: { 
          action: 'create-payment',
          productId: product?.id || productId,
          productType: product?.type || 'subscription',
          productName: product?.name || '월간 구독',
          amount: customPrice || product?.price,
          tokens: 0,
        }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || '결제 준비에 실패했습니다.');
      }

      const tossPayments = await loadTossPayments(state.clientKey);
      const baseFailUrl = `${window.location.origin}/payment-complete?status=fail&type=subscription`;
      
      await tossPayments.requestPayment('카드', {
        amount: data.paymentData.amount,
        orderId: data.paymentData.orderId,
        orderName: data.paymentData.orderName,
        customerEmail: data.paymentData.customerEmail,
        customerName: data.paymentData.customerName,
        successUrl: `${window.location.origin}/payment-complete?type=subscription`,
        failUrl: baseFailUrl,
      });

      return true;
    } catch (err: any) {
      const message = err.message || '결제 중 오류가 발생했습니다.';
      setState(prev => ({ ...prev, error: message }));
      toast({ title: '결제 오류', description: message, variant: 'destructive' });
      return false;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.clientKey, navigate, toast]);

  const paySubscription = useCallback(() => {
    return pay('subscription_monthly');
  }, [pay]);

  const goToPayment = useCallback(() => {
    navigate('/token-subscription');
  }, [navigate]);

  return {
    ...state,
    pay,
    paySubscription,
    goToPayment,
    products: PRODUCTS,
    isReady: !!state.clientKey && !state.loading,
  };
}

export default usePayment;
