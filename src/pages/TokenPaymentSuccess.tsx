import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Home, Coins, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const TokenPaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');

      if (!paymentKey || !orderId || !amount) {
        toast({
          title: "결제 정보 오류",
          description: "결제 정보가 누락되었습니다.",
          variant: "destructive"
        });
        navigate('/token-purchase');
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: "인증 필요",
            description: "로그인이 필요합니다.",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }

        console.log('🔄 토스페이먼츠 결제 승인 요청:', { orderId, amount });

        const { data, error } = await supabase.functions.invoke('confirm-toss-payment', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: { 
            paymentKey,
            orderId,
            amount: parseInt(amount)
          }
        });

        if (error) {
          console.error('❌ 결제 확인 에러:', error);
          throw error;
        }

        console.log('✅ 결제 확인 성공:', data);

        if (data.success) {
          setConfirmed(true);
          setPaymentInfo(data.paymentResult);
          
          toast({
            title: "결제 완료!",
            description: "캐시 충전이 완료되었습니다.",
          });
        } else {
          throw new Error(data.error || '결제 처리에 실패했습니다.');
        }

      } catch (error: any) {
        console.error('❌ Payment confirmation error:', error);
        toast({
          title: "결제 확인 실패",
          description: error.message || "결제 확인 중 오류가 발생했습니다.",
          variant: "destructive"
        });
        // 에러 발생 시 실패 페이지로 리다이렉트
        navigate(`/token-payment-fail?code=CONFIRM_ERROR&message=${encodeURIComponent(error.message)}`);
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [searchParams, toast, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <CardTitle>결제 확인 중...</CardTitle>
            <CardDescription>
              토스페이먼츠에서 결제를 확인하고 있습니다.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          
          <CardTitle className="text-3xl font-bold mb-2">
            🎉 캐시 충전 완료!
          </CardTitle>
          <CardDescription className="text-lg">
            결제가 성공적으로 완료되어 캐시가 충전되었습니다.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 결제 정보 */}
          {confirmed && paymentInfo && (
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                결제 정보
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">주문명:</span>
                  <span className="font-semibold">{paymentInfo.orderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">결제 금액:</span>
                  <span className="font-semibold text-primary text-lg">
                    ₩{paymentInfo.amount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">결제 방식:</span>
                  <span className="font-semibold">
                    {paymentInfo.method === 'CARD' ? '카드' : 
                     paymentInfo.method === 'VIRTUAL_ACCOUNT' ? '가상계좌' :
                     paymentInfo.method === 'TRANSFER' ? '계좌이체' :
                     paymentInfo.method === 'MOBILE_PHONE' ? '휴대폰' : paymentInfo.method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">결제 ID:</span>
                  <span className="font-mono text-xs">
                    {searchParams.get('orderId')?.slice(0, 20)}...
                  </span>
                </div>
                {paymentInfo.approvedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">승인 시간:</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(paymentInfo.approvedAt).toLocaleString('ko-KR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 다음 단계 안내 */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 p-6 rounded-lg border">
            <h3 className="font-semibold mb-3">✨ 이제 무엇을 할 수 있나요?</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                3분 기본 테스트로 빠른 분석 받기 (500원)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                AI 맞춤 분석으로 깊이 있는 인사이트 얻기 (1,000원)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                전문가급 종합 분석 받기 (3,000원)
              </li>
            </ul>
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              className="flex-1 py-6 text-base font-semibold"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              대시보드로 이동
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1 py-6 text-base"
              onClick={() => navigate('/')}
            >
              <Home className="w-5 h-5 mr-2" />
              홈으로 이동
            </Button>
          </div>

          {/* 고객 지원 */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              결제나 캐시 사용에 문제가 있으신가요?
            </p>
            <Button variant="link" className="h-auto p-0 text-sm">
              고객 지원센터 →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenPaymentSuccess;
