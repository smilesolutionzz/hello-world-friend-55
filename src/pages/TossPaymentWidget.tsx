import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2, CreditCard, Building2, FileText } from 'lucide-react';

const TOSS_CLIENT_KEY = 'live_gck_ma60RZblrqo1lKlBKmjW3wzYWBn1';

interface PaymentWidgetState {
  tokenAmount: number;
  price: number;
}

type PaymentMethod = '카드' | '계좌이체' | '가상계좌';

const TossPaymentWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('계좌이체');

  const state = location.state as PaymentWidgetState;
  const { tokenAmount = 0, price = 0 } = state || {};

  const paymentMethods = [
    { 
      value: '카드' as PaymentMethod, 
      label: '신용/체크카드', 
      icon: CreditCard,
      description: '카드사 심사 진행중'
    },
    { 
      value: '계좌이체' as PaymentMethod, 
      label: '실시간 계좌이체', 
      icon: Building2,
      description: '즉시 이용 가능'
    },
    { 
      value: '가상계좌' as PaymentMethod, 
      label: '가상계좌', 
      icon: FileText,
      description: '입금 확인 후 이용'
    },
  ];

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
    setProcessing(true);

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

      // orderId 생성 (Stripe처럼 간단)
      const shortUser = session.user.id.slice(0, 8);
      const orderId = `TOKEN_${tokenAmount}_${Date.now().toString(36)}_${shortUser}`;

      // 토스페이먼츠 결제창 SDK 로드
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);

      // 결제창 바로 호출 (선택한 결제 수단으로)
      await tossPayments.requestPayment(selectedMethod, {
        amount: Math.round(price),
        orderId,
        orderName: `토큰 ${tokenAmount}개`,
        successUrl: `${window.location.origin}/payment-success`,
        failUrl: `${window.location.origin}/payment-fail`,
        customerName: session.user.email?.split('@')[0] || '사용자',
      });

    } catch (error: any) {
      console.error('Payment error:', error);
      setProcessing(false);
      
      if (error.code !== 'USER_CANCEL') {
        toast({
          title: '결제 실패',
          description: error?.message || '결제 요청 중 오류가 발생했습니다.',
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

          {/* 결제 수단 선택 */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold mb-3">결제 수단 선택</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.value;
                const isCardDisabled = method.value === '카드';
                
                return (
                  <button
                    key={method.value}
                    onClick={() => !isCardDisabled && setSelectedMethod(method.value)}
                    disabled={isCardDisabled}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all text-left
                      ${isSelected 
                        ? 'border-primary bg-primary/5' 
                        : isCardDisabled
                        ? 'border-muted bg-muted/30 cursor-not-allowed opacity-60'
                        : 'border-muted hover:border-primary/50 hover:bg-muted/50 cursor-pointer'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="flex-1">
                        <div className="font-medium mb-1">{method.label}</div>
                        <div className={`text-xs ${
                          isCardDisabled 
                            ? 'text-muted-foreground' 
                            : isSelected 
                            ? 'text-primary' 
                            : 'text-muted-foreground'
                        }`}>
                          {method.description}
                        </div>
                      </div>
                      {isSelected && !isCardDisabled && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

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
