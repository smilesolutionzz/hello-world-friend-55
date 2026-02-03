import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// 상품 정의
export const PRODUCTS = {
  // 프리미엄 패스
  pass_30: { 
    id: 'pass_30', 
    type: 'pass', 
    name: '프리미엄 패스 30일', 
    description: '30일 무제한 이용',
    price: 29900, 
    originalPrice: 49900, 
    discount: 40 
  },
  // 캐시 충전 (1 token = 100원)
  cash_5000: { 
    id: 'cash_5000', 
    type: 'cash', 
    name: '5,000원 캐시', 
    description: '캐시 5,000원 충전',
    price: 5000, 
    tokens: 50, 
    bonus: 0 
  },
  cash_10000: { 
    id: 'cash_10000', 
    type: 'cash', 
    name: '11,000원 캐시', 
    description: '캐시 11,000원 충전 (10% 보너스)',
    price: 10000, 
    tokens: 110, 
    bonus: 10 
  },
  // 전문가 상담
  consult_30: { 
    id: 'consult_30', 
    type: 'consult', 
    name: '전문가 상담 30분', 
    description: '전문 심리상담사 30분 상담',
    price: 35000 
  },
  consult_60: { 
    id: 'consult_60', 
    type: 'consult', 
    name: '전문가 상담 60분', 
    description: '전문 심리상담사 60분 상담',
    price: 65000 
  },
  // B2B 소액 상품
  b2b_proposal_premium: {
    id: 'b2b_proposal_premium',
    type: 'b2b',
    name: '프리미엄 제안서 PDF',
    description: '맞춤형 기관용 제안서 PDF 다운로드',
    price: 30000
  },
  b2b_sample_report: {
    id: 'b2b_sample_report',
    type: 'b2b',
    name: '샘플 리포트 세트',
    description: '기관용 샘플 리포트 5종 세트',
    price: 99000
  },
  b2b_consulting_1hr: {
    id: 'b2b_consulting_1hr',
    type: 'b2b',
    name: '1시간 컨설팅',
    description: 'B2B 솔루션 도입 전문 컨설팅',
    price: 200000
  },
  b2b_pilot_deposit: {
    id: 'b2b_pilot_deposit',
    type: 'b2b_deposit',
    name: '파일럿 프로그램 예치금',
    description: '3개월 파일럿 시작 예치금 (정식 계약 시 차감)',
    price: 500000
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

  // 통합 결제 함수
  const pay = useCallback(async (productId: ProductId | string, customPrice?: number) => {
    const product = PRODUCTS[productId as ProductId];
    
    if (!product && !customPrice) {
      toast({
        title: '상품 오류',
        description: '잘못된 상품입니다.',
        variant: 'destructive'
      });
      return false;
    }

    if (!state.clientKey) {
      toast({
        title: '결제 준비 중',
        description: '잠시 후 다시 시도해주세요.',
        variant: 'destructive'
      });
      return false;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast({
          title: '로그인 필요',
          description: '로그인 후 결제해주세요.'
        });
        navigate('/auth');
        return false;
      }

      // 결제 정보 생성
      const { data, error } = await supabase.functions.invoke('unified-payment', {
        headers: { Authorization: `Bearer ${session.session.access_token}` },
        body: { 
          action: 'create-payment',
          productId: product?.id || productId,
          productType: product?.type || 'custom',
          productName: product?.name || '맞춤 결제',
          amount: customPrice || product?.price,
          tokens: (product as any)?.tokens || 0,
        }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || '결제 준비에 실패했습니다.');
      }

      // 토스페이먼츠 결제 요청
      const tossPayments = await loadTossPayments(state.clientKey);
      
      const baseFailUrl = `${window.location.origin}/payment-complete?status=fail&type=${product?.type || 'custom'}`;
      
      await tossPayments.requestPayment('카드', {
        amount: data.paymentData.amount,
        orderId: data.paymentData.orderId,
        orderName: data.paymentData.orderName,
        customerEmail: data.paymentData.customerEmail,
        customerName: data.paymentData.customerName,
        successUrl: `${window.location.origin}/payment-complete?type=${product?.type || 'custom'}`,
        // 토스페이먼츠는 실패시 자동으로 code, message 파라미터를 추가함
        failUrl: baseFailUrl,
      });

      return true;
    } catch (err: any) {
      const message = err.message || '결제 중 오류가 발생했습니다.';
      setState(prev => ({ ...prev, error: message }));
      toast({
        title: '결제 오류',
        description: message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.clientKey, navigate, toast]);

  // 간편 결제 함수들
  const payPass = useCallback((passId: 'pass_30') => {
    return pay(passId);
  }, [pay]);

  const payCash = useCallback((cashId: 'cash_5000' | 'cash_10000') => {
    return pay(cashId);
  }, [pay]);

  const payConsult = useCallback((consultId: 'consult_30' | 'consult_60') => {
    return pay(consultId);
  }, [pay]);

  // 결제 페이지로 이동 (상품 선택 UI 필요시)
  const goToPayment = useCallback((productId?: ProductId) => {
    if (productId) {
      const product = PRODUCTS[productId];
      navigate(`/token-purchase?type=${product.type}&id=${productId}&price=${product.price}`);
    } else {
      navigate('/token-subscription');
    }
  }, [navigate]);

  return {
    ...state,
    pay,
    payPass,
    payCash,
    payConsult,
    goToPayment,
    products: PRODUCTS,
    isReady: !!state.clientKey && !state.loading,
  };
}

export default usePayment;
