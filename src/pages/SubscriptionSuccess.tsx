import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, Settings, RefreshCw, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const confirmPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        toast({
          title: "잘못된 접근",
          description: "세션 정보가 없습니다.",
          variant: "destructive",
        });
        navigate('/subscription');
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase.functions.invoke('confirm-stripe-payment', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: { sessionId }
        });

        if (error) throw error;

        setSubscriptionData(data.subscription);
        setConfirmed(true);
        
        toast({
          title: "구독 완료!",
          description: `${data.subscription.tokens_added}개 캐시가 지급되었습니다.`,
        });
      } catch (error: any) {
        console.error('Payment confirmation error:', error);
        toast({
          title: "확인 실패",
          description: error.message || "결제 확인 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [searchParams, toast, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">결제 확인 중...</h2>
          <p className="text-muted-foreground">잠시만 기다려 주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            {confirmed ? '구독 완료!' : '결제 실패'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {confirmed && subscriptionData ? (
            <>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">월 구독이 성공적으로 시작되었습니다!</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold">캐시 지급 완료</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {subscriptionData.tokens_added}개 캐시
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    즉시 사용 가능합니다
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>구독 상태:</span>
                  <span className="font-medium text-green-600">활성</span>
                </div>
                <div className="flex justify-between">
                  <span>다음 결제일:</span>
                  <span className="font-medium">
                    {new Date(subscriptionData.current_period_end).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/ai-analysis')}
                  className="w-full"
                >
                  <Coins className="w-4 h-4 mr-2" />
                  AI 분석 시작하기
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/subscription')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    구독 관리
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/')}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    홈으로
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-red-600">결제 확인에 실패했습니다</p>
                <p className="text-sm text-muted-foreground">
                  고객센터로 문의해 주세요.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/subscription')}
                  className="w-full"
                >
                  다시 시도하기
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  홈으로 돌아가기
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}