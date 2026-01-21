import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Sparkles, Wallet, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useTokens } from '@/hooks/useTokens';
import { formatTokenAsCash } from '@/utils/tokenToCash';

interface PaywallOverlayProps {
  featureName: string;
  requiredCash?: number;
  children: React.ReactNode;
  showPreview?: boolean; // 일부 내용만 보여주고 나머지 블러
  previewPercentage?: number; // 보여줄 비율 (0-100)
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
  const { balance, loading: tokenLoading } = useTokens();

  const isPremium = isPremiumUser() || isLifetimeUser();
  const hasEnoughCash = (balance || 0) >= (requiredCash / 100); // 토큰 = 캐시/100
  const isLoading = subLoading || tokenLoading;

  // 프리미엄 유저이거나 충분한 캐시가 있으면 전체 보여주기
  if (isLoading) {
    return <>{children}</>;
  }

  if (isPremium) {
    return <>{children}</>;
  }

  const handlePurchaseCash = () => {
    navigate('/token-purchase?type=cash&id=cash_5000&price=5000');
  };

  const handleSubscribe = () => {
    navigate('/token-subscription');
  };

  return (
    <div className="relative">
      {/* 미리보기 콘텐츠 (블러 처리) */}
      {showPreview && (
        <div className="relative">
          <div 
            className="overflow-hidden"
            style={{ maxHeight: `${previewPercentage}%` }}
          >
            {children}
          </div>
          {/* 그라데이션 블러 오버레이 */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, transparent ${previewPercentage - 10}%, rgba(255,255,255,0.8) ${previewPercentage}%, rgba(255,255,255,0.95) 100%)`,
              backdropFilter: 'blur(4px)'
            }}
          />
        </div>
      )}

      {/* 잠금 오버레이 */}
      <Card className="relative z-10 mt-4 border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 p-6">
        <div className="text-center space-y-4">
          {/* 잠금 아이콘 */}
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

          {/* 제목 */}
          <div>
            <h3 className="text-xl font-bold mb-1">
              {featureName} 잠금 해제
            </h3>
            <p className="text-sm text-muted-foreground">
              전문가급 심층 분석을 확인하려면 결제가 필요합니다
            </p>
          </div>

          {/* 잔여 캐시 표시 */}
          <div className="flex items-center justify-center gap-2 py-2 px-4 bg-muted/50 rounded-full mx-auto w-fit">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              내 캐시: <span className="text-primary font-bold">{formatTokenAsCash(balance || 0)}</span>
            </span>
          </div>

          {/* 가격 표시 */}
          <div className="py-3">
            <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-2 text-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              {requiredCash.toLocaleString()}원으로 잠금해제
            </Badge>
          </div>

          {/* 포함 내용 */}
          <div className="bg-muted/30 rounded-lg p-4 text-left">
            <p className="text-sm font-medium mb-2 text-center">잠금 해제 시 포함:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                AI 전문가급 심층 분석 리포트
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                영역별 상세 점수 및 해석
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                맞춤형 개선 전략 및 추천
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                PDF 리포트 다운로드
              </li>
            </ul>
          </div>

          {/* 버튼들 */}
          <div className="space-y-3">
            {hasEnoughCash ? (
              <Button 
                onClick={onUnlock}
                className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-lg font-bold"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {requiredCash.toLocaleString()}원으로 잠금해제
              </Button>
            ) : (
              <Button 
                onClick={handlePurchaseCash}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-primary hover:opacity-90 text-lg font-bold"
              >
                <Wallet className="w-5 h-5 mr-2" />
                캐시 충전하기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted-foreground/20" />
              </div>
              <span className="relative bg-background px-3 text-xs text-muted-foreground">
                또는
              </span>
            </div>

            <Button 
              onClick={handleSubscribe}
              variant="outline"
              className="w-full h-10 border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50"
            >
              <Crown className="w-4 h-4 mr-2" />
              프리미엄 패스로 무제한 이용
              <Badge className="ml-2 bg-red-500 text-white text-xs">70% 할인</Badge>
            </Button>
          </div>

          {/* 보증 뱃지 */}
          <p className="text-xs text-muted-foreground">
            🔒 안전결제 · 💳 환불보장 · ⚡ 즉시 이용
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PaywallOverlay;
