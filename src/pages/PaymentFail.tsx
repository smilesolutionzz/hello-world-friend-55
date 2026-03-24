import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, Home, MessageCircle } from 'lucide-react';

const PaymentFail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const message = searchParams.get('message') || '결제가 취소되었거나 실패했습니다.';
  const code = searchParams.get('code');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-foreground">결제 실패</h2>
          <p className="text-muted-foreground mb-2">{decodeURIComponent(message)}</p>
          {code && <p className="text-xs text-muted-foreground/60 mb-6">오류 코드: {code}</p>}
          
          <div className="space-y-3 mt-6">
            <Button 
              onClick={() => navigate('/token-subscription')} 
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
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
          
          <p className="text-xs text-muted-foreground mt-6">
            결제 문제가 지속되면 support@aihpro.app으로 문의해주세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFail;
