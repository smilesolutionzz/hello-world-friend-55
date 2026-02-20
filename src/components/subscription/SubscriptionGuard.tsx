import { ReactNode, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock, Sparkles, CheckCircle, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useFreeTrial } from '@/hooks/useFreeTrial';
import { Badge } from '@/components/ui/badge';

interface SubscriptionGuardProps {
  children: ReactNode;
  featureName: string;
  /** FREE_TRIAL_LIMITS 키와 매핑. 지정 시 무료체험 횟수가 남아있으면 접근 허용 */
  trialKey?: string;
  requiredTier?: 'premium' | 'pro';
  fallbackMessage?: string;
}

export const SubscriptionGuard = ({ 
  children, 
  featureName,
  trialKey,
  requiredTier = 'premium',
  fallbackMessage 
}: SubscriptionGuardProps) => {
  const navigate = useNavigate();
  const { isPremiumUser, isLifetimeUser, loading } = useSubscription();
  const { canUseFree, getRemainingTrials, recordUsage, loading: trialLoading } = useFreeTrial();
  const hasRecorded = useRef(false);

  const hasAccess = isPremiumUser() || isLifetimeUser();
  const isTrialAllowed = !hasAccess && trialKey ? canUseFree(trialKey) : false;
  const trialExhausted = !hasAccess && trialKey ? !canUseFree(trialKey) : false;
  const remaining = trialKey ? getRemainingTrials(trialKey) : 0;

  // 무료체험 통과 시 사용량 자동 기록
  useEffect(() => {
    if (isTrialAllowed && !hasRecorded.current) {
      hasRecorded.current = true;
      recordUsage(trialKey!);
    }
  }, [isTrialAllowed, trialKey, recordUsage]);

  if (loading || trialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-center">
          <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">구독 상태 확인 중...</p>
        </div>
      </div>
    );
  }

  // 프리미엄 구독자는 바로 통과
  if (hasAccess) {
    return <>{children}</>;
  }

  // 무료체험 잔여 횟수가 있으면 통과 + 안내 배너
  if (isTrialAllowed) {
    return (
      <div>
        <div className="container mx-auto px-4 pt-4 max-w-4xl">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-3 mb-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm font-medium">
                무료체험 중 · 남은 횟수: <Badge variant="secondary" className="ml-1">{remaining === Infinity ? '무제한' : `${remaining}회`}</Badge>
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/token-subscription')}
              className="text-xs h-7"
            >
              <Crown className="w-3 h-3 mr-1" />
              프리미엄으로 무제한 이용
            </Button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // 무료체험 소진 or 체험 미지원 → 구독 유도
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Lock className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-3xl mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {trialExhausted ? '무료체험이 종료되었습니다' : '프리미엄 전용 기능'}
            </CardTitle>
            <p className="text-lg text-muted-foreground">
              {trialExhausted 
                ? `${featureName}의 무료체험 횟수를 모두 사용하셨습니다. 프리미엄 구독으로 무제한 이용하세요!`
                : fallbackMessage || `${featureName}은(는) 구독자 전용 프리미엄 기능입니다`
              }
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">{featureName} 기능</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  전문적인 AI 분석과 개별화된 계획 수립을 통해 최적의 발달 및 교육 지원을 제공합니다.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              프리미엄 구독 혜택
            </h4>
            <div className="grid gap-2">
              {[
                'IEP 생성기 - AI 기반 개별교육계획 자동 작성',
                '무제한 프리미엄 테스트 이용',
                '전문가 우선 매칭 및 할인',
                '상세 분석 리포트 및 PDF 다운로드',
                '맞춤형 발달 추적 및 인사이트'
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">프리미엄 플랜</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  ₩19,900
                </span>
                <span className="text-muted-foreground">/월</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => navigate('/token-subscription')}
              className="flex-1 h-12 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Crown className="w-5 h-5 mr-2" />
              프리미엄 구독 시작하기
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1 h-12 text-base"
            >
              돌아가기
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            언제든지 해지 가능
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
