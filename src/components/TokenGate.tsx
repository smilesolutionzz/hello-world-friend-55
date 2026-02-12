import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Sparkles, CheckCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useFreeTrial } from '@/hooks/useFreeTrial';
import { useNavigate } from 'react-router-dom';
import { SUBSCRIPTION_PRICE } from '@/constants/tokenCosts';

interface TokenGateProps {
  tokensRequired: number;
  featureName: string;
  featureKey?: string;
  onProceed: () => void;
  children?: React.ReactNode;
  showAlternatives?: boolean;
  category?: 'basic' | 'premium' | 'special';
}

const TokenGate: React.FC<TokenGateProps> = ({ 
  featureName, 
  featureKey,
  onProceed, 
  children,
}) => {
  const { isPremiumUser, isLifetimeUser, loading: subLoading } = useSubscription();
  const { canUseFree, getRemainingTrials, loading: trialLoading } = useFreeTrial();
  const navigate = useNavigate();

  const loading = subLoading || trialLoading;

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

  const isPremium = isPremiumUser() || isLifetimeUser();
  const key = featureKey || featureName;
  const hasFreeTrial = canUseFree(key);
  const remaining = getRemainingTrials(key);

  // 구독자 또는 무료 체험 가능 → 진행
  if (isPremium || hasFreeTrial) {
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
              {isPremium ? (
                <Crown className="w-5 h-5 text-primary" />
              ) : (
                <Sparkles className="w-5 h-5 text-primary" />
              )}
              <div>
                <p className="font-medium">
                  {isPremium ? '구독 중 · 무제한 이용' : `무료 체험`}
                </p>
                {!isPremium && remaining !== Infinity && (
                  <p className="text-sm text-muted-foreground">
                    남은 무료 횟수: {remaining}회
                  </p>
                )}
              </div>
            </div>
            <Badge variant="secondary">
              {isPremium ? '구독자' : '무료 체험'}
            </Badge>
          </div>

          {children}

          <Button onClick={onProceed} className="w-full" size="lg">
            <CheckCircle className="w-4 h-4 mr-2" />
            시작하기
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 무료 체험 소진 → 구독 유도
  return (
    <Card className="w-full max-w-2xl mx-auto border-primary/20">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          무료 체험이 끝났습니다
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <p className="text-center text-muted-foreground">
          <strong>{featureName}</strong>의 무료 체험 횟수를 모두 사용하셨습니다.
        </p>

        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-6 text-center space-y-4">
          <Crown className="w-12 h-12 mx-auto text-primary" />
          <div>
            <h3 className="text-lg font-semibold mb-1">월간 구독으로 무제한 이용</h3>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-black text-primary">₩{SUBSCRIPTION_PRICE.toLocaleString()}</span>
              <span className="text-muted-foreground">/월</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              모든 AI 분석 · 심리검사 · PDF 리포트 무제한
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={() => navigate('/token-subscription')} className="w-full" size="lg">
            <Crown className="w-4 h-4 mr-2" />
            구독 시작하기
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full">
            대시보드로 돌아가기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenGate;
