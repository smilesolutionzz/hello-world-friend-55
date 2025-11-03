import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2 } from 'lucide-react';

const TOSS_CLIENT_KEY = 'live_gck_ma60RZblrqo1lKlBKmjW3wzYWBn1';

interface PaymentWidgetState {
  tokenAmount: number;
  price: number;
}

const TossPaymentWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

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
    }
  }, [tokenAmount, price, navigate]);

  const handlePayment = async () => {
    console.log('🔴 결제 버튼 클릭됨');
    setProcessing(true);

    try {
      console.log('🔵 세션 확인 중...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('❌ 세션 없음');
        toast({
          title: '로그인 필요',
          description: '결제하려면 로그인이 필요합니다.',
        });
        navigate('/auth');
        setProcessing(false);
        return;
      }

      console.log('✅ 세션 확인됨:', session.user.email);

      // orderId 생성
      const shortUser = session.user.id.slice(0, 8);
      const orderId = `TOKEN_${tokenAmount}_${Date.now().toString(36)}_${shortUser}`;

      console.log('🔵 결제 정보:', { 
        orderId, 
        amount: Math.round(price), 
        tokenAmount,
        clientKey: TOSS_CLIENT_KEY 
      });

      // 토스페이먼츠 인스턴스 생성
      console.log('🔵 토스페이먼츠 SDK 로드 중...');
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      console.log('✅ 토스페이먼츠 SDK 로드 완료');

      // 결제창 호출
      console.log('🔵 결제창 호출 중...');
      const paymentResult = await tossPayments.requestPayment('카드', {
        amount: Math.round(price),
        orderId,
        orderName: `토큰 ${tokenAmount}개`,
        successUrl: `${window.location.origin}/payment-success`,
        failUrl: `${window.location.origin}/payment-fail`,
        customerName: session.user.email?.split('@')[0] || '사용자',
      });

      console.log('✅ 결제창 호출 성공:', paymentResult);

    } catch (error: any) {
      console.error('❌ 결제 오류:', error);
      console.error('❌ 오류 상세:', {
        code: error?.code,
        message: error?.message,
        stack: error?.stack
      });

      setProcessing(false);

      const code = error?.code || error?.data?.code;
      const inIframe = (() => {
        try { return window.self !== window.top; } catch { return true; }
      })();

      let description = '';
      switch (code) {
        case 'NOT_ALLOWED_ORIGIN':
        case 'NOT_ALLOWED_DOMAIN':
        case 'INVALID_SUCCESS_URL':
        case 'INVALID_FAIL_URL':
          description = `현재 도메인(${window.location.origin})이 토스 대시보드에 허용 URL로 등록되어야 합니다.`;
          break;
        case 'INVALID_CLIENT_KEY':
          description = '토스 클라이언트 키가 유효하지 않습니다. 라이브 클라이언트 키를 확인하세요.';
          break;
        case 'REQUEST_PAY_FAILED':
        case 'PAY_PROCESS_ABORTED':
          description = '결제창을 여는 중 문제가 발생했습니다. 새로고침 후 다시 시도해주세요.';
          break;
        default:
          description = error?.message || '결제 요청 중 오류가 발생했습니다.';
      }

      if (inIframe) {
        description += ' (미리보기/임베드 환경에서는 결제창이 차단될 수 있습니다. 실제 도메인에서 테스트해주세요)';
      }

      if (code !== 'USER_CANCEL') {
        toast({
          title: '결제 실패',
          description,
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/token-subscription')}
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

          {/* 결제 버튼 */}
          <Button
            onClick={handlePayment}
            disabled={processing}
            className="w-full py-6 text-lg"
            size="lg"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                결제창 열기 중...
              </>
            ) : (
              `₩${price.toLocaleString()} 결제하기`
            )}
          </Button>

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
