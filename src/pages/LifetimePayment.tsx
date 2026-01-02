import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Infinity, ArrowLeft, Loader2, Shield, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { loadTossPayments } from '@tosspayments/payment-sdk';

const LIFETIME_PRICE = 99000;

const LifetimePayment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [hasLifetime, setHasLifetime] = useState(false);

  useEffect(() => {
    checkExistingSubscription();
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // 평생이용권 여부 확인
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_lifetime', true)
        .eq('status', 'active')
        .maybeSingle();

      if (subscription) {
        setHasLifetime(true);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "로그인 필요",
          description: "결제하려면 먼저 로그인해주세요.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      // 평생이용권 결제 생성
      const { data, error } = await supabase.functions.invoke('create-lifetime-payment', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      if (!data.success || !data.paymentData) {
        throw new Error(data.error || '결제 준비에 실패했습니다.');
      }

      // 토스페이먼츠 SDK 로드 및 결제 요청
      const tossPayments = await loadTossPayments(data.clientKey);
      
      await tossPayments.requestPayment('카드', {
        amount: data.paymentData.amount,
        orderId: data.paymentData.orderId,
        orderName: data.paymentData.orderName,
        customerEmail: data.paymentData.customerEmail,
        customerName: data.paymentData.customerName,
        successUrl: data.paymentData.successUrl,
        failUrl: data.paymentData.failUrl,
      });

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "결제 오류",
        description: error.message || "결제 처리 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (hasLifetime) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <UnifiedNavigation />
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="border-2 border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="p-8 text-center">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4 w-16 h-16 mx-auto mb-6">
                <Crown className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-green-700 mb-4">이미 평생이용권을 보유하고 있습니다</h1>
              <p className="text-muted-foreground mb-6">모든 프리미엄 기능을 무제한으로 이용하실 수 있습니다.</p>
              <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700">
                홈으로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-background dark:via-muted/30 dark:to-background">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 뒤로가기 */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로가기
        </Button>

        {/* 메인 카드 */}
        <Card className="relative overflow-hidden border-2 border-yellow-400 shadow-2xl">
          {/* 배경 효과 */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-amber-400/10 to-orange-400/10"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-300/20 rounded-full blur-3xl"></div>
          
          {/* 특가 배지 */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 text-lg font-bold shadow-lg">
              🔥 런칭 특가 🔥
            </Badge>
          </div>

          <CardHeader className="relative z-10 text-center pt-12">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-3xl shadow-lg">
                <Crown className="w-16 h-16 text-white" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
              평생이용권
            </CardTitle>
            <p className="text-muted-foreground flex items-center justify-center gap-2 mt-2">
              <Infinity className="w-5 h-5" /> 한 번 결제로 평생 무제한 이용
            </p>
          </CardHeader>

          <CardContent className="relative z-10 p-8">
            {/* 가격 */}
            <div className="text-center mb-8">
              <div className="text-lg text-muted-foreground line-through">정가 ₩199,000</div>
              <div className="text-5xl font-bold text-orange-600 mt-2">
                ₩{LIFETIME_PRICE.toLocaleString()}
              </div>
              <div className="text-lg text-green-600 font-semibold mt-1">
                50% 할인 중!
              </div>
            </div>

            {/* 혜택 목록 */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                '모든 심리검사 무제한 이용',
                'AI 상담 무제한 이용',
                '프리미엄 기능 전체 해금',
                '향후 업데이트 무료 제공',
                '전문가 상담 우선 배정',
                '평생 프리미엄 멤버 혜택',
                '초기 구매자 특별 혜택',
                '광고 완전 제거'
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 bg-white/50 dark:bg-white/5 rounded-lg p-3">
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* 결제 버튼 */}
            <Button 
              size="lg"
              className="w-full py-8 text-2xl font-bold bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:from-yellow-600 hover:via-amber-600 hover:to-orange-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <Crown className="w-6 h-6 mr-2" />
                  평생이용권 구매하기
                </>
              )}
            </Button>

            {/* 보장 */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-500" />
                <span>100% 만족 보장</span>
              </div>
              <div className="flex items-center gap-1">
                <Gift className="w-4 h-4 text-purple-500" />
                <span>7일 환불 정책</span>
              </div>
            </div>

            {/* 안내문 */}
            <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <p className="mb-2">💳 결제 수단: 신용카드, 체크카드, 간편결제</p>
              <p className="mb-2">📧 결제 완료 후 즉시 평생이용권이 활성화됩니다.</p>
              <p>🔒 토스페이먼츠 안전결제 시스템으로 보호됩니다.</p>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="mt-12 space-y-4">
          <h2 className="text-2xl font-bold text-center mb-6">자주 묻는 질문</h2>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">평생이용권은 정말 평생 사용 가능한가요?</h3>
              <p className="text-muted-foreground text-sm">
                네, 평생이용권은 서비스가 운영되는 한 영구적으로 사용 가능합니다. 
                추가 결제 없이 모든 프리미엄 기능을 무제한으로 이용하실 수 있습니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">환불이 가능한가요?</h3>
              <p className="text-muted-foreground text-sm">
                구매 후 7일 이내에 서비스를 실질적으로 이용하지 않은 경우 전액 환불이 가능합니다. 
                환불을 원하시면 고객센터로 연락해 주세요.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">향후 추가되는 기능도 이용 가능한가요?</h3>
              <p className="text-muted-foreground text-sm">
                네, 평생이용권 구매자는 향후 추가되는 모든 프리미엄 기능도 
                추가 비용 없이 이용하실 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LifetimePayment;
