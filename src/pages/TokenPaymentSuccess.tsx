import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Home, Coins, Clock, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTokens } from '@/hooks/useTokens';

const TokenPaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshTokenBalance } = useTokens();
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [tokenData, setTokenData] = useState<any>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');

      if (!paymentKey || !orderId || !amount) {
        toast({
          title: "결제 정보 오류",
          description: "필수 결제 정보가 누락되었습니다.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('confirm-token-order', {
          body: {
            paymentKey,
            orderId,
            amount: parseInt(amount)
          }
        });

        if (error) throw error;

        setConfirmed(true);
        setTokenData(data);
        
        // 토큰 잔액 새로고침
        await refreshTokenBalance();

        toast({
          title: "토큰 충전 완료!",
          description: `${data.tokens_added}개의 토큰이 성공적으로 충전되었습니다.`,
        });

      } catch (error: any) {
        console.error('Payment confirmation error:', error);
        toast({
          title: "결제 확인 실패",
          description: error.message || "결제 확인 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [searchParams, toast, refreshTokenBalance]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          
          <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
            🎉 토큰 충전 완료!
          </CardTitle>
          <CardDescription className="text-lg text-slate-600">
            결제가 성공적으로 완료되어 토큰이 충전되었습니다.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 충전 정보 */}
          {confirmed && tokenData && (
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Coins className="h-5 w-5" />
                충전 내역
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">충전된 토큰:</span>
                  <div className="font-semibold text-blue-600 text-lg">
                    +{tokenData.tokens_added}개
                  </div>
                </div>
                <div>
                  <span className="text-slate-600">현재 잔액:</span>
                  <div className="font-semibold text-green-600 text-lg">
                    {tokenData.new_balance}개
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 주문 정보 */}
          <div className="bg-slate-50 p-6 rounded-lg">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              주문 정보
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">주문번호:</span>
                <span className="font-mono text-xs bg-white px-2 py-1 rounded border">
                  {searchParams.get('orderId')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">결제금액:</span>
                <span className="font-semibold">
                  ₩{parseInt(searchParams.get('amount') || '0').toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">결제일시:</span>
                <span className="flex items-center gap-1 text-slate-800">
                  <Clock className="h-4 w-4" />
                  {new Date().toLocaleString('ko-KR')}
                </span>
              </div>
            </div>
          </div>

          {/* 다음 단계 안내 */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-3">✨ 이제 무엇을 할 수 있나요?</h3>
            <ul className="space-y-2 text-sm text-purple-800">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                3분 기본 테스트로 빠른 분석 받기 (5토큰)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                AI 맞춤 분석으로 깊이 있는 인사이트 얻기 (10토큰)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                전문가급 종합 분석 받기 (30토큰)
              </li>
            </ul>
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 text-base font-semibold"
              onClick={() => navigate('/assessment')}
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              AI 분석 시작하기
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1 py-3 text-base"
              onClick={() => navigate('/')}
            >
              <Home className="w-5 h-5 mr-2" />
              홈으로 이동
            </Button>
          </div>

          {/* 고객 지원 */}
          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-2">
              결제나 토큰 사용에 문제가 있으신가요?
            </p>
            <Button variant="link" className="text-blue-600 h-auto p-0 text-sm">
              고객 지원센터 →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenPaymentSuccess;