import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export default function SubscriptionSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // 결제 성공 후 구독 상태 갱신
    const updateSubscription = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          await supabase.functions.invoke('check-subscription', {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
        }
      } catch (error) {
        console.error('Failed to update subscription:', error);
      }
    };

    updateSubscription();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">구독 완료!</CardTitle>
          <CardDescription>
            프리미엄 구독이 성공적으로 활성화되었습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700 font-medium">이제 사용 가능한 기능:</p>
            <ul className="text-sm text-green-700 mt-2 space-y-1">
              <li>• 무제한 심리 검사</li>
              <li>• 고급 AI 분석</li>
              <li>• 전문가 피드백</li>
              <li>• PDF 리포트 다운로드</li>
            </ul>
          </div>
          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full"
            >
              대시보드로 이동
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/subscription')} 
              className="w-full"
            >
              구독 관리
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}