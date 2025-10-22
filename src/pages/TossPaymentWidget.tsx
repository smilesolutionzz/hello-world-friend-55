import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2 } from 'lucide-react';

const TOSS_CLIENT_KEY = 'test_ck_ORzdMaqN3w22D5wkBxAP85AkYXQG';

interface PaymentWidgetState {
  tokenAmount: number;
  price: number;
}

const TossPaymentWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [paymentWidget, setPaymentWidget] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [uiReady, setUiReady] = useState(false);

  const state = location.state as PaymentWidgetState;
  const { tokenAmount = 0, price = 0 } = state || {};

  useEffect(() => {
    if (!tokenAmount || !price) {
      toast({
        title: '잘못된 접근',
        description: '결제 정보가 없습니다.',
        variant: 'destructive',
      });
      navigate('/token-subscription');
      return;
    }

    initializePaymentWidget();
  }, []);

  const initializePaymentWidget = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: '로그인 필요',
          description: '결제하려면 로그인이 필요합니다.',
        });
        navigate('/auth');
        return;
      }

      const shortUser = session.user.id.slice(0, 8);
      const generatedOrderId = `OT_${tokenAmount}_${Date.now().toString(36)}_${shortUser}`;
      setOrderId(generatedOrderId);

      const paymentWidget = await loadPaymentWidget(TOSS_CLIENT_KEY, session.user.id);
      
      setPaymentWidget(paymentWidget);
      
      // 결제수단 렌더링
      await paymentWidget.renderPaymentMethods('#payment-widget', {
        value: Math.round(price),
        currency: 'KRW',
        country: 'KR'
      });
      
      // 약관 동의 섹션 렌더링
      await paymentWidget.renderAgreement('#agreement');
      
      setLoading(false);
      
      // UI가 완전히 렌더링될 때까지 대기 (DOM 렌더링 + iframe 로드 시간)
      setTimeout(() => {
        setUiReady(true);
        console.log('✅ Payment widget UI ready');
      }, 5000);

    } catch (error: any) {
      console.error('Payment widget initialization error:', error);
      setLoading(false);
      toast({
        title: '결제 위젯 로딩 실패',
        description: error?.message || '결제 위젯을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        variant: 'destructive',
      });
    }
  };

  const handlePayment = async () => {
    if (!paymentWidget || !uiReady) {
      toast({
        title: '잠시만 기다려주세요',
        description: '결제 위젯이 아직 준비 중입니다.',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);

    try {
      // 결제 요청 전 2초 대기로 UI 안정화
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await paymentWidget.requestPayment({
        orderId,
        orderName: `토큰 ${tokenAmount}개`,
        successUrl: `${window.location.origin}/payment-success`,
        failUrl: `${window.location.origin}/payment-fail`,
      });
      
      console.log('Payment result:', result);
    } catch (error: any) {
      console.error('Payment request error:', error);

      // 결제 UI 미렌더 오류인 경우 1회 자동 복구 후 재시도
      const notRendered =
        error?.code === 'NOT_RENDERED_PAYMENT_METHODS_UI' ||
        error?.message?.includes('NOT_RENDERED_PAYMENT_METHODS_UI') ||
        error?.message?.includes('렌더링되지 않았습니다');

      if (notRendered && paymentWidget) {
        try {
          // 컨테이너 초기화 후 재렌더
          const pw = document.getElementById('payment-widget');
          const agree = document.getElementById('agreement');
          if (pw) pw.innerHTML = '';
          if (agree) agree.innerHTML = '';

          await paymentWidget.renderPaymentMethods('#payment-widget', {
            value: Math.round(price),
            currency: 'KRW',
            country: 'KR',
          });
          await paymentWidget.renderAgreement('#agreement');

          setUiReady(true);
          await new Promise((r) => setTimeout(r, 500));

          // 재시도
          const retry = await paymentWidget.requestPayment({
            orderId,
            orderName: `토큰 ${tokenAmount}개`,
            successUrl: `${window.location.origin}/payment-success`,
            failUrl: `${window.location.origin}/payment-fail`,
          });
          console.log('Payment retry result:', retry);
          return;
        } catch (retryErr: any) {
          console.error('Payment retry failed:', retryErr);
        }
      }

      setProcessing(false);
      toast({
        title: '결제 실패',
        description:
          error?.message || '결제 요청 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로가기
        </Button>

        <Card className="p-8">
          <h1 className="text-2xl font-bold mb-2">토큰 결제</h1>
          <p className="text-muted-foreground mb-8">
            안전한 토스페이먼츠로 결제하세요
          </p>

          {/* 결제 정보 */}
          <div className="bg-muted/50 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">구매 토큰</span>
              <span className="font-bold text-lg">{tokenAmount} 토큰</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">결제 금액</span>
              <span className="font-bold text-2xl text-primary">
                ₩{price.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 토스페이먼츠 위젯 */}
          <div className="mb-6">
            <>
              <div id="payment-widget" />
              <div id="agreement" className="mt-4" />
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
            </>
          </div>

          {/* 결제 버튼 */}
          {!loading && (
            <Button
              onClick={handlePayment}
              disabled={processing || !uiReady}
              className="w-full py-6 text-lg"
              size="lg"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  결제 처리 중...
                </>
              ) : !uiReady ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  결제 위젯 준비 중...
                </>
              ) : (
                `₩${price.toLocaleString()} 결제하기`
              )}
            </Button>
          )}

          {/* 안내 문구 */}
          <div className="mt-6 text-sm text-muted-foreground text-center">
            <p>
              토스페이먼츠의 안전한 결제 시스템을 통해 결제가 진행됩니다.
            </p>
            <p className="mt-2">
              결제 후 토큰이 자동으로 충전됩니다.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TossPaymentWidget;
