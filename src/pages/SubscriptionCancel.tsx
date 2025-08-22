import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SubscriptionCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl text-orange-600">구독 취소</CardTitle>
          <CardDescription>
            구독 신청이 취소되었습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            언제든지 다시 구독하실 수 있습니다. 
            무료 플랜으로도 다양한 기능을 이용해보세요!
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/subscription')} 
              className="w-full"
            >
              구독 플랜 다시 보기
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')} 
              className="w-full"
            >
              대시보드로 돌아가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}