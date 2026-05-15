import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';

interface PaywallOverlayProps {
  featureName: string;
  requiredCash?: number;
  children: React.ReactNode;
  showPreview?: boolean;
  previewPercentage?: number;
  onUnlock?: () => void;
}

export const PaywallOverlay = ({
  featureName,
  requiredCash = 5000,
  children,
  showPreview = true,
  previewPercentage = 30,
  onUnlock
}: PaywallOverlayProps) => {
  const navigate = useNavigate();
  const { isPremiumUser, isLifetimeUser, loading: subLoading } = useSubscription();

  const isPremium = isPremiumUser() || isLifetimeUser();

  if (subLoading || isPremium) {
    return <>{children}</>;
  }

  const handleSubscribe = () => {
    navigate('/subscription');
  };

  return (
    <div className="relative">
      {showPreview && (
        <div className="relative">
          <div className="overflow-hidden" style={{ maxHeight: `${previewPercentage}%` }}>
            {children}
          </div>
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, transparent ${previewPercentage - 10}%, rgba(255,255,255,0.8) ${previewPercentage}%, rgba(255,255,255,0.95) 100%)`,
              backdropFilter: 'blur(4px)'
            }}
          />
        </div>
      )}

      <Card className="relative z-10 mt-4 border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
                <Crown className="w-4 h-4 text-yellow-800" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-1">{featureName} 잠금 해제</h3>
            <p className="text-sm text-muted-foreground">전문가급 심층 분석을 확인하려면 7일 마음 트랙이 필요합니다</p>
          </div>

          <div className="py-3">
            <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-2 text-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              7일 마음 트랙 ₩7,900 (일시불)
            </Badge>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 text-left">
            <p className="text-sm font-medium mb-2 text-center">구독 시 포함:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500" />AI 전문가급 심층 분석 리포트</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500" />영역별 상세 점수 및 해석</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500" />맞춤형 개선 전략 및 추천</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500" />PDF 리포트 다운로드</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleSubscribe}
              className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-lg font-bold"
            >
              <Crown className="w-5 h-5 mr-2" />
              프리미엄 구독 시작하기
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">🔒 안전결제 · 💳 환불보장 · ⚡ 즉시 이용</p>
        </div>
      </Card>
    </div>
  );
};

export default PaywallOverlay;
