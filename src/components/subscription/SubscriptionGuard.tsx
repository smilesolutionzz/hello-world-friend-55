import { ReactNode, useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock, Sparkles, CheckCircle, Gift, Zap, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useFreeTrial } from '@/hooks/useFreeTrial';
import { useAccessControl } from '@/hooks/useAccessControl';
import { Badge } from '@/components/ui/badge';
import { PaymentModal } from '@/components/payments/PaymentModal';
import { SUBSCRIPTION_PRICE, SINGLE_REPORT_PRICE, SINGLE_TEST_PRICE, SUBSCRIPTION_YEARLY_PRICE, SUBSCRIPTION_YEARLY_MONTHLY_PRICE } from '@/constants/tokenCosts';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionGuardProps {
  children: ReactNode;
  featureName: string;
  trialKey?: string;
  requiredTier?: 'premium' | 'pro';
  fallbackMessage?: string;
  /** 크레딧 유형: test(검사) 또는 report(리포트) */
  creditType?: 'test' | 'report';
  /** 
   * 크레딧 소진 시점:
   * - 'enter': 컴포넌트 진입 시 즉시 소진 (기존 방식)
   * - 'result': 결과 확인 시 소진 — children을 자유롭게 보여주다가 결과 확인 시 잠금/차감
   */
  consumeAt?: 'enter' | 'result';
}

export const SubscriptionGuard = ({ 
  children, 
  featureName,
  trialKey,
  requiredTier = 'premium',
  fallbackMessage,
  creditType = 'report',
  consumeAt = 'enter',
}: SubscriptionGuardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isPremiumUser, isLifetimeUser, loading } = useSubscription();
  const { canUseFree, getRemainingTrials, recordUsage, loading: trialLoading } = useFreeTrial();
  const { reportCredits, testCredits, canAccessPremium, canAccessTest, loading: accessLoading, useReportCredit, useTestCredit } = useAccessControl();
  const hasRecorded = useRef(false);
  const hasCreditConsumed = useRef(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [creditConsuming, setCreditConsuming] = useState(false);
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const hasAccess = isPremiumUser() || isLifetimeUser();
  
  // 크레딧 타입에 따라 다른 크레딧 확인
  const currentCredits = creditType === 'test' ? testCredits : reportCredits;
  const hasCreditAccess = !hasAccess && currentCredits > 0;
  const isTrialAllowed = !hasAccess && !hasCreditAccess && trialKey ? canUseFree(trialKey) : false;
  const trialExhausted = !hasAccess && !hasCreditAccess && trialKey ? !canUseFree(trialKey) : false;
  const remaining = trialKey ? getRemainingTrials(trialKey) : 0;

  const creditLabel = creditType === 'test' ? '검사' : '리포트';
  const creditPrice = creditType === 'test' ? SINGLE_TEST_PRICE : SINGLE_REPORT_PRICE;
  const creditOriginalPrice = creditType === 'test' ? 3900 : 9900;
  const creditDiscount = creditType === 'test' ? 75 : 60;
  const creditProductId = creditType === 'test' ? 'single_test' : 'single_report';

  // 무료 체험 사용 기록 (enter 모드에서만)
  useEffect(() => {
    if (consumeAt === 'enter' && isTrialAllowed && !hasRecorded.current) {
      hasRecorded.current = true;
      recordUsage(trialKey!);
    }
  }, [consumeAt, isTrialAllowed, trialKey, recordUsage]);

  // 크레딧 실제 소진 (enter 모드에서만 자동 소진)
  useEffect(() => {
    if (consumeAt === 'enter' && hasCreditAccess && !hasCreditConsumed.current && !creditConsuming) {
      hasCreditConsumed.current = true;
      setCreditConsuming(true);
      
      const consumeCredit = creditType === 'test' ? useTestCredit : useReportCredit;
      
      consumeCredit().then((ok) => {
        setCreditConsuming(false);
        if (ok) {
          toast({
            title: `${creditLabel} 크레딧 1회 사용`,
            description: `남은 ${creditLabel} 크레딧: ${Math.max(0, currentCredits - 1)}회`,
          });
        }
      });
    }
  }, [consumeAt, hasCreditAccess, useReportCredit, useTestCredit, currentCredits, creditConsuming, toast, creditType, creditLabel]);

  // result 모드에서 결과 확인 버튼 클릭 시 크레딧 소진
  const handleUnlockResult = useCallback(async () => {
    if (hasAccess) {
      setResultUnlocked(true);
      return;
    }

    if (hasCreditAccess) {
      setCreditConsuming(true);
      const consumeCredit = creditType === 'test' ? useTestCredit : useReportCredit;
      const ok = await consumeCredit();
      setCreditConsuming(false);
      if (ok) {
        setResultUnlocked(true);
        toast({
          title: `${creditLabel} 크레딧 1회 사용`,
          description: `남은 ${creditLabel} 크레딧: ${Math.max(0, currentCredits - 1)}회`,
        });
      }
      return;
    }

    if (isTrialAllowed) {
      recordUsage(trialKey!);
      setResultUnlocked(true);
      return;
    }

    // 크레딧도 무료체험도 없으면 결제 유도
    setPaymentOpen(true);
  }, [hasAccess, hasCreditAccess, isTrialAllowed, creditType, useTestCredit, useReportCredit, toast, creditLabel, currentCredits, recordUsage, trialKey]);

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

  // ===== result 모드 =====
  if (consumeAt === 'result') {
    // 프리미엄 구독자 또는 이미 잠금해제됨
    if (hasAccess || resultUnlocked) return <>{children}</>;

    // 결과 잠금 오버레이
    return (
      <div className="relative">
        {/* 블러 처리된 결과 미리보기 */}
        <div className="filter blur-md pointer-events-none select-none opacity-60 max-h-[500px] overflow-hidden">
          {children}
        </div>
        
        {/* 결과 잠금 오버레이 */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 border-2 border-primary/20 shadow-xl">
            <CardContent className="p-6 space-y-4 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary-foreground" />
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">검사 결과 확인</h3>
                <p className="text-sm text-muted-foreground">
                  {hasCreditAccess
                    ? `${creditLabel} 이용권 1회를 사용하여 결과를 확인하세요`
                    : isTrialAllowed
                    ? `무료체험으로 결과를 확인하세요 (남은 횟수: ${remaining === Infinity ? '무제한' : `${remaining}회`})`
                    : '결과를 확인하려면 이용권이 필요해요'
                  }
                </p>
              </div>

              {(hasCreditAccess || isTrialAllowed) ? (
                <Button
                  onClick={handleUnlockResult}
                  className="w-full h-12 text-base font-semibold"
                  disabled={creditConsuming}
                >
                  {creditConsuming ? '처리 중...' : hasCreditAccess 
                    ? `${creditLabel} 이용권 사용하기 (남은 ${Math.max(0, currentCredits)}회)`
                    : '무료체험으로 결과 보기'
                  }
                </Button>
              ) : (
                <div className="space-y-3">
                  {/* 단건 구매 */}
                  <div className="border border-border rounded-xl p-4 space-y-2">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-sm text-muted-foreground line-through">₩{creditOriginalPrice.toLocaleString()}</span>
                      <span className="text-xl font-black text-foreground">₩{creditPrice.toLocaleString()}</span>
                      <Badge variant="secondary" className="text-xs">{creditDiscount}% 할인</Badge>
                    </div>
                    <Button
                      onClick={() => setPaymentOpen(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {creditLabel} 1회 이용권 구매
                    </Button>
                  </div>

                  {/* 구독 */}
                  <Button
                    onClick={() => navigate('/token-subscription')}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    구독하면 무제한 · ₩{SUBSCRIPTION_PRICE.toLocaleString()}/월
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <PaymentModal 
          open={paymentOpen} 
          onOpenChange={setPaymentOpen} 
          mode="single"
          creditType={creditType}
          title={`${featureName} ${creditLabel} 이용권 구매`}
          description={`${featureName} ${creditLabel} 1회를 이용할 수 있습니다.`}
        />
      </div>
    );
  }

  // ===== enter 모드 (기존 동작) =====

  // 프리미엄 구독자
  if (hasAccess) return <>{children}</>;

  // 크레딧 보유자
  if (hasCreditAccess) {
    return (
      <div>
        <div className="container mx-auto px-4 pt-4 max-w-4xl">
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-3 mb-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <span className="text-sm font-medium">
                {creditLabel} 이용권 · 남은 횟수: <Badge variant="secondary" className="ml-1">{Math.max(0, currentCredits - 1)}회</Badge>
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
          {/* 이용 안내 */}
          <div className="bg-muted/50 rounded-xl p-5 space-y-3">
            <h4 className="font-bold text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {featureName} 이용 시 제공되는 것
            </h4>
            <div className="grid gap-2">
              {(creditType === 'test' ? [
                'AI 기반 정밀 심리검사 분석',
                '점수 및 유형별 상세 해석',
                '맞춤 개선 방안 및 행동 가이드',
              ] : [
                'AI 기반 전문 심층 분석 리포트',
                '개인 맞춤 솔루션 및 행동 가이드',
                '결과 기반 추천 검사 및 전문가 연결',
              ]).map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 듀얼 프라이싱 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 단건 */}
            <div className="border border-amber-500/30 rounded-xl p-5 bg-amber-500/5 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="font-bold">{creditLabel} 1회 이용권</span>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>{featureName}</strong> {creditLabel} 1회 이용
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground line-through">₩{creditOriginalPrice.toLocaleString()}</span>
                <span className="text-2xl font-black text-foreground">₩{creditPrice.toLocaleString()}</span>
                <Badge variant="secondary" className="text-xs">{creditDiscount}% 할인</Badge>
              </div>
              <Button
                onClick={() => setPaymentOpen(true)}
                variant="outline"
                className="w-full border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
              >
                <Zap className="w-4 h-4 mr-2" />
                {creditLabel} 1회 이용하기
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
        creditType={creditType}
        title={`${featureName} ${creditLabel} 이용권 구매`}
        description={`${featureName} ${creditLabel} 1회를 이용할 수 있습니다.`}
      />
    </div>
  );
};
