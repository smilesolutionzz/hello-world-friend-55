import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Coins, Crown, AlertTriangle, Sparkles } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import { useNavigate } from 'react-router-dom';
import TokenBalance from './TokenBalance';

interface TokenGateProps {
  tokensRequired: number;
  featureName: string;
  onProceed: () => void;
  children?: React.ReactNode;
  showAlternatives?: boolean;
  category?: 'basic' | 'premium' | 'special';
}

const TokenGate: React.FC<TokenGateProps> = ({ 
  tokensRequired, 
  featureName, 
  onProceed, 
  children,
  showAlternatives = true,
  category = 'basic'
}) => {
  const { tokenBalance, checkTokenAvailability, loading } = useTokens();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasEnoughTokens = checkTokenAvailability(tokensRequired);
  const currentTokens = tokenBalance?.current_tokens || 0;

  // 토큰이 충분한 경우 - 기능 이용 가능
  if (hasEnoughTokens) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {featureName} 이용하기
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Coins className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">소요 토큰</p>
                <p className="text-sm text-muted-foreground">
                  {tokensRequired}개 (잔여: {currentTokens - tokensRequired}개)
                </p>
              </div>
            </div>
            <Badge variant="secondary">
              사용 가능
            </Badge>
          </div>

          {children}

          <Button onClick={onProceed} className="w-full" size="lg">
            <Coins className="w-4 h-4 mr-2" />
            {tokensRequired}개 토큰으로 시작하기
          </Button>

          <div className="text-center">
            <TokenBalance compact showPurchaseButton={false} />
          </div>
        </CardContent>
      </Card>
    );
  }

  // 토큰이 부족한 경우 - 구독 유도
  return (
    <Card className="w-full max-w-2xl mx-auto border-destructive/20">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Lock className="w-5 h-5 text-destructive" />
          토큰이 부족합니다
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{featureName}</strong>을 이용하려면 <strong>{tokensRequired}개</strong>의 토큰이 필요하지만, 
            현재 <strong>{currentTokens}개</strong>만 보유하고 계십니다.
          </AlertDescription>
        </Alert>

        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-6 text-center space-y-4">
          <Crown className="w-12 h-12 mx-auto text-primary" />
          <div>
            <h3 className="text-lg font-semibold mb-2">토큰을 충전해보세요!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              더 많은 AI 분석과 고급 기능을 무제한으로 이용하실 수 있습니다.
            </p>
          </div>

          <div className="grid gap-3 max-w-md mx-auto">
            <div className="flex items-center justify-between text-sm bg-white/50 rounded p-3">
              <span>Starter 플랜</span>
              <Badge variant="outline">50개 토큰 - ₩9,900/월</Badge>
            </div>
            <div className="flex items-center justify-between text-sm bg-white/50 rounded p-3 border-2 border-primary/30">
              <span>Pro 플랜 (추천)</span>
              <Badge variant="default">150개 토큰 - ₩19,900/월</Badge>
            </div>
            <div className="flex items-center justify-between text-sm bg-white/50 rounded p-3">
              <span>Premium 플랜</span>
              <Badge variant="secondary">무제한 - ₩39,900/월</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate('/token-subscription')}
            className="w-full"
            size="lg"
          >
            <Crown className="w-4 h-4 mr-2" />
            토큰 충전하러 가기
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="w-full"
          >
            대시보드로 돌아가기
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          언제든지 취소 가능 • 안전한 결제 시스템
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenGate;