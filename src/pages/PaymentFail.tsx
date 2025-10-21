import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

const PaymentFail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <Card className="p-12 text-center max-w-md">
        <XCircle className="w-20 h-20 text-destructive mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">결제 실패</h1>
        
        {errorMessage && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-destructive font-medium">
              {decodeURIComponent(errorMessage)}
            </p>
            {errorCode && (
              <p className="text-xs text-muted-foreground mt-2">
                오류 코드: {errorCode}
              </p>
            )}
          </div>
        )}

        <p className="text-muted-foreground mb-8">
          결제가 취소되었거나 오류가 발생했습니다
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => navigate('/token-subscription')}
            className="w-full"
            size="lg"
          >
            다시 시도하기
          </Button>
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="w-full"
            size="lg"
          >
            대시보드로 이동
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentFail;
