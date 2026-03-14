import { ReactNode, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock, Sparkles, CheckCircle, Gift, Zap, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useFreeTrial } from '@/hooks/useFreeTrial';
import { useAccessControl } from '@/hooks/useAccessControl';
import { Badge } from '@/components/ui/badge';
import { PaymentModal } from '@/components/payments/PaymentModal';
import { SUBSCRIPTION_PRICE, SINGLE_REPORT_PRICE } from '@/constants/tokenCosts';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionGuardProps {
  children: ReactNode;
  featureName: string;
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
  const { toast } = useToast();
  const { isPremiumUser, isLifetimeUser, loading } = useSubscription();
  const { canUseFree, getRemainingTrials, recordUsage, loading: trialLoading } = useFreeTrial();
  const { reportCredits, canAccessPremium, loading: accessLoading, useReportCredit } = useAccessControl();
  const hasRecorded = useRef(false);
  const hasCreditConsumed = useRef(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [creditConsuming, setCreditConsuming] = useState(false);

  const hasAccess = isPremiumUser() || isLifetimeUser();
  const hasCreditAccess = !hasAccess && reportCredits > 0;
  const isTrialAllowed = !hasAccess && !hasCreditAccess && trialKey ? canUseFree(trialKey) : false;
  const trialExhausted = !hasAccess && !hasCreditAccess && trialKey ? !canUseFree(trialKey) : false;
  const remaining = trialKey ? getRemainingTrials(trialKey) : 0;

  // 무료 체험 사용 기록
  useEffect(() => {
    if (isTrialAllowed && !hasRecorded.current) {
      hasRecorded.current = true;
      recordUsage(trialKey!);
    }
  }, [isTrialAllowed, trialKey, recordUsage]);

  // 크레딧 실제 소진
  useEffect(() => {
    if (hasCreditAccess && !hasCreditConsumed.current && !creditConsuming) {
      hasCreditConsumed.current = true;
      setCreditConsuming(true);
      useReportCredit().then((ok) => {
        setCreditConsuming(false);
        if (ok) {
          toast({
            title: '리포트 크레딧 1회 사용',
            description: `남은 크레딧: ${Math.max(0, reportCredits - 1)}회`,
          });
        }
      });
    }
  }, [hasCreditAccess, useReportCredit, reportCredits, creditConsuming, toast]);

  if (loading || trialLoading || accessLoading || creditConsuming) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-center">
          <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">확인 중...</p>
        </div>
      </div>
    );
  }

  // 프리미엄 구독자
  if (hasAccess) return <>{children}</>;

  // 리포트 크레딧 보유자
  if (hasCreditAccess) {
    return (
      <div>
        <div className="container mx-auto px-4 pt-4 max-w-4xl">
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-3 mb-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <span className="text-sm font-medium">
                리포트 이용권 · 남은 횟수: <Badge variant="secondary" className="ml-1">{Math.max(0, reportCredits - 1)}회</Badge>
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/token-subscription')} className="text-xs h-7">
              <Crown className="w-3 h-3 mr-1" />
              구독하면 무제한
            </Button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // 무료체험 잔여
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
            <Button size="sm" variant="outline" onClick={() => navigate('/token-subscription')} className="text-xs h-7">
              <Crown className="w-3 h-3 mr-1" />
              프리미엄으로 무제한 이용
            </Button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // 잠금 화면 — 기능 설명 + 듀얼 CTA
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Lock className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl md:text-3xl mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {trialExhausted ? '무료체험이 종료되었습니다' : `${featureName}`}
            </CardTitle>
            <p className="text-muted-foreground">
              {trialExhausted 
                ? `${featureName}의 무료체험 횟수를 모두 사용했습니다.`
                : fallbackMessage || `${featureName}은(는) 프리미엄 기능입니다.`
              }
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pb-8">
          {/* 이용 안내 - 뭘 얻는지 명확히 */}
          <div className="bg-muted/50 rounded-xl p-5 space-y-3">
            <h4 className="font-bold text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {featureName} 이용 시 제공되는 것
            </h4>
            <div className="grid gap-2">
              {[
                'AI 기반 전문 심층 분석 리포트',
                '개인 맞춤 솔루션 및 행동 가이드',
                '결과 기반 추천 검사 및 전문가 연결',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 듀얼 프라이싱 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 단건 리포트 */}
            <div className="border border-amber-500/30 rounded-xl p-5 bg-amber-500/5 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="font-bold">1회 이용권</span>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>{featureName}</strong> 심층 리포트 1회 열람
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground line-through">₩9,900</span>
                <span className="text-2xl font-black text-foreground">₩{SINGLE_REPORT_PRICE.toLocaleString()}</span>
              </div>
              <Button
                onClick={() => setPaymentOpen(true)}
                variant="outline"
                className="w-full border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
              >
                <Zap className="w-4 h-4 mr-2" />
                이 검사 1회 이용하기
              </Button>
            </div>

            {/* 월간 구독 */}
            <div className="border-2 border-primary rounded-xl p-5 bg-primary/5 space-y-3 relative">
              <Badge className="absolute -top-2.5 right-3 bg-primary text-primary-foreground text-xs">추천</Badge>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                <span className="font-bold">월간 구독</span>
              </div>
              <p className="text-sm text-muted-foreground">
                모든 검사 · 분석 · 리포트 <strong>무제한</strong>
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground line-through">₩19,900</span>
                <span className="text-2xl font-black text-foreground">₩{SUBSCRIPTION_PRICE.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">/월</span>
              </div>
              <Button
                onClick={() => navigate('/token-subscription')}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Crown className="w-4 h-4 mr-2" />
                구독 시작하기
              </Button>
            </div>
          </div>

          {/* 구독 혜택 */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              구독하면 이 모든 것이 무제한
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                'AI 심층 분석 무제한',
                '20종+ 심리검사',
                'PDF 리포트 다운로드',
                '맞춤 솔루션 & 가이드',
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          <Button variant="ghost" onClick={() => navigate('/')} className="w-full text-muted-foreground">
            돌아가기
          </Button>
        </CardContent>
      </Card>

      <PaymentModal 
        open={paymentOpen} 
        onOpenChange={setPaymentOpen} 
        mode="single"
        title={`${featureName} 이용권 구매`}
        description={`${featureName} 심층 분석 리포트 1회를 열람할 수 있습니다.`}
      />
    </div>
  );
};
