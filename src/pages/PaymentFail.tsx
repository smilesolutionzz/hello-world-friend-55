import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, RotateCcw, Home } from "lucide-react";

const PaymentFail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const failCode = searchParams.get('code');
  const failMessage = searchParams.get('message');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-red-600">결제 실패</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              결제 처리 중 문제가 발생했습니다.
            </p>
            
            {failMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  <strong>오류 메시지:</strong> {failMessage}
                </p>
                {failCode && (
                  <p className="text-xs text-red-600 mt-1">
                    오류 코드: {failCode}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={() => navigate('/subscription')}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              다시 시도하기
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>문제가 지속되면 고객센터로 문의해주세요.</p>
            <p className="mt-2">
              <strong>고객센터:</strong> 1588-0000
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFail;