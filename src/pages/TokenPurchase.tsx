import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { loadTossPayments } from '@tosspayments/payment-sdk';

const TOSS_CLIENT_KEY = 'live_gck_ma60RZbIrqo1lKlBKmjW3wzYWBn1';

interface PaymentInfo {
  tokenAmount: number;
  price: number;
}

const TokenPurchase = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [processing, setProcessing] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);

  useEffect(() => {
    // URL에서 결제 정보 추출
    const stateInfo = location.state as PaymentInfo | undefined;
    const urlTokens = searchParams.get('tokens');
    const urlPrice = searchParams.get('price');

    if (stateInfo?.tokenAmount && stateInfo?.price) {
      setPaymentInfo(stateInfo);
    } else if (urlTokens && urlPrice) {
      setPaymentInfo({
        tokenAmount: parseInt(urlTokens),
        price: parseInt(urlPrice)
      });
    } else {
      toast({
        title: "결제 정보 오류",
        description: "결제 정보를 찾을 수 없습니다.",
        variant: "destructive"
      });
      navigate('/token-subscription');
    }
  }, [location.state, searchParams, navigate, toast]);

  const handlePayment = async () => {
    if (!paymentInfo) return;

    setProcessing(true);

    try {
      // 로그인 확인
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "로그인 필요",
          description: "결제를 진행하려면 로그인이 필요합니다.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      // 주문 ID 생성 (토큰 수량 포함)
      const orderId = `TOKEN_${paymentInfo.tokenAmount}_${Date.now()}_${session.user.id.substring(0, 8)}`;

      console.log('🎯 결제 시작:', {
        orderId,
        amount: paymentInfo.price,
        tokens: paymentInfo.tokenAmount,
        clientKey: TOSS_CLIENT_KEY
      });

      // 토스페이먼츠 SDK 로드
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);

      // 결제창 호출
      await tossPayments.requestPayment('카드', {
        amount: paymentInfo.price,
        orderId: orderId,
        orderName: `토큰 ${paymentInfo.tokenAmount}개`,
        customerName: session.user.email || '고객',
        customerEmail: session.user.email,
        successUrl: `${window.location.origin}/payment-success`,
        failUrl: `${window.location.origin}/token-subscription?payment=failed`,
      });

    } catch (error: any) {
      console.error('❌ 결제 오류:', error);
      
      let errorMessage = '결제 중 오류가 발생했습니다.';
      
      if (error.code === 'USER_CANCEL') {
        errorMessage = '결제가 취소되었습니다.';
      } else if (error.code === 'INVALID_CARD_COMPANY') {
        errorMessage = '유효하지 않은 카드사입니다.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "결제 실패",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!paymentInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* 뒤로가기 버튼 */}
        <Button
          variant="ghost"
          onClick={() => navigate('/token-subscription')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          토큰 선택으로 돌아가기
        </Button>

        {/* 결제 정보 카드 */}
        <Card className="shadow-xl border-2">
          <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold">토큰 구매</CardTitle>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            {/* 구매 정보 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="text-lg font-medium">구매 토큰</span>
                <span className="text-2xl font-bold text-primary">
                  {paymentInfo.tokenAmount.toLocaleString()} 토큰
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="text-lg font-medium">결제 금액</span>
                <span className="text-2xl font-bold text-primary">
                  ₩{paymentInfo.price.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <span className="text-sm text-muted-foreground">토큰당 가격</span>
                <span className="text-lg font-semibold">
                  ₩{Math.round(paymentInfo.price / paymentInfo.tokenAmount)}
                </span>
              </div>
            </div>

            {/* 결제 버튼 */}
            <Button
              onClick={handlePayment}
              disabled={processing}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  결제 처리중...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  카드로 결제하기
                </>
              )}
            </Button>

            {/* 안내 문구 */}
            <div className="text-center text-sm text-muted-foreground space-y-2 pt-4 border-t">
              <p>• 결제는 토스페이먼츠를 통해 안전하게 처리됩니다</p>
              <p>• 구매한 토큰은 구매일로부터 1년간 사용 가능합니다</p>
              <p>• 토큰 미사용시 구매일로부터 1주 이내 환불 가능합니다</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TokenPurchase;
