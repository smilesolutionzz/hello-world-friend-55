import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

const IndexFallback = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-muted">
      <Card className="max-w-md w-full p-8 text-center shadow-lg">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-6" />
        
        <h1 className="text-2xl font-bold mb-3">홈페이지 로딩 문제</h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          일시적인 문제가 발생했습니다. 
          <br />
          잠시 후 다시 시도해주세요.
        </p>
        
        <div className="space-y-3 mb-6">
          <Button onClick={handleRetry} className="w-full" size="lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            페이지 새로고침
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleGoHome} 
            className="w-full"
            size="lg"
          >
            <Home className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>문제가 지속되면 관리자에게 문의해주세요.</p>
          <p className="mt-1">에러 코드: HOME_LOAD_ERROR</p>
        </div>
      </Card>
    </div>
  );
};

export default IndexFallback;