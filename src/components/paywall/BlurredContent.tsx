import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';

interface BlurredContentProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  requiredCash?: number;
  onUnlock?: () => void;
}

export const BlurredContent = ({
  children,
  title = '프리미엄 콘텐츠',
  description = '전문가급 심층 분석을 확인하세요',
  requiredCash = 5000,
  onUnlock
}: BlurredContentProps) => {
  const navigate = useNavigate();
  const { isPremiumUser, isLifetimeUser } = useSubscription();

  const isPremium = isPremiumUser() || isLifetimeUser();

  // 프리미엄 유저는 전체 내용 표시
  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* 블러 처리된 콘텐츠 */}
      <div className="relative overflow-hidden rounded-lg">
        <div 
          className="filter blur-md opacity-50 pointer-events-none select-none"
          aria-hidden="true"
        >
          {children}
        </div>
        
        {/* 잠금 오버레이 */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-sm">
          <Card className="p-6 text-center max-w-sm mx-4 shadow-2xl border-2 border-primary/20">
            <div className="mb-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mb-3">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h4 className="font-bold text-lg">{title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
            
            <div className="space-y-2">
              {onUnlock ? (
                <Button 
                  onClick={onUnlock}
                  className="w-full bg-gradient-to-r from-primary to-purple-600"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {requiredCash.toLocaleString()}원으로 잠금해제
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate('/pricing')}
                  className="w-full bg-gradient-to-r from-primary to-purple-600"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  캐시 충전하고 확인하기
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => navigate('/token-subscription')}
                className="w-full text-yellow-700"
              >
                <Crown className="w-4 h-4 mr-2" />
                프리미엄 패스로 무제한 이용
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BlurredContent;
