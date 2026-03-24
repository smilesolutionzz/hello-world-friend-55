import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Sparkles, CheckCircle, LogIn, UserPlus } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useFreeTrial } from '@/hooks/useFreeTrial';
import { useGuestFreeTrial } from '@/hooks/useGuestFreeTrial';
import { useNavigate } from 'react-router-dom';
import { SUBSCRIPTION_PRICE } from '@/constants/tokenCosts';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n';

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
  const { canGuestUseFree, getGuestRemaining, recordGuestUsage } = useGuestFreeTrial();
  const navigate = useNavigate();
  const { isEnglish } = useLanguage();
  const [isGuest, setIsGuest] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsGuest(!session);
    });
  }, []);

  const loading = isGuest === null || (!isGuest && (subLoading || trialLoading));

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

  const key = featureKey || featureName;

  // === 게스트 모드 ===
  if (isGuest) {
    const guestCanUse = canGuestUseFree();
    const guestRemaining = getGuestRemaining();

    if (guestCanUse) {
      const handleGuestProceed = () => {
        recordGuestUsage(key);
        onProceed();
      };

      return (
        <Card className="w-full max-w-2xl mx-auto border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {featureName}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-3 min-w-0">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium">
                    {isEnglish ? 'Free Trial' : '무료 체험'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isEnglish 
                      ? `${guestRemaining} free trial(s) remaining` 
                      : `남은 무료 횟수: ${guestRemaining}회`}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="whitespace-nowrap flex-shrink-0 ml-2">
                {isEnglish ? 'Guest' : '게스트'}
              </Badge>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {isEnglish 
                  ? '💡 Sign up to save your results and unlock more features!' 
                  : '💡 회원가입하면 결과가 저장되고 더 많은 검사를 이용할 수 있어요!'}
              </p>
            </div>

            {children}

            <Button onClick={handleGuestProceed} className="w-full" size="lg">
              <CheckCircle className="w-4 h-4 mr-2" />
              {isEnglish ? 'Start Now' : '시작하기'}
            </Button>
          </CardContent>
        </Card>
      );
    }

    // 게스트 무료 소진 → 가입 유도
    return (
      <Card className="w-full max-w-2xl mx-auto border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            {isEnglish ? 'Free trials used up' : '무료 체험이 끝났습니다'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <p className="text-center text-muted-foreground">
            {isEnglish 
              ? 'You\'ve used all 2 free trials. Sign up to continue!' 
              : '2회 무료 체험을 모두 사용하셨습니다. 가입하면 더 많은 검사를 이용할 수 있어요!'}
          </p>

          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 text-center space-y-4">
            <UserPlus className="w-12 h-12 mx-auto text-primary" />
            <div>
              <h3 className="text-lg font-semibold mb-1">
                {isEnglish ? 'Sign up for free' : '무료 회원가입'}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {isEnglish 
                  ? 'Save results · AI analysis reports · Expert consultation' 
                  : '결과 저장 · AI 분석 리포트 · 전문가 상담까지'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={() => navigate('/auth')} className="w-full" size="lg">
              <LogIn className="w-4 h-4 mr-2" />
              {isEnglish ? 'Sign Up / Login' : '회원가입 / 로그인'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              {isEnglish ? 'Back to Home' : '홈으로 돌아가기'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // === 로그인 사용자 ===
  const isPremium = isPremiumUser() || isLifetimeUser();
  const hasFreeTrial = canUseFree(key);
  const remaining = getRemainingTrials(key);

  // 구독자 또는 무료 체험 가능 → 진행
  if (isPremium || hasFreeTrial) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {featureName}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-3 min-w-0">
              {isPremium ? (
                <Crown className="w-5 h-5 text-primary flex-shrink-0" />
              ) : (
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="font-medium">
                  {isPremium 
                    ? (isEnglish ? 'Subscribed · Unlimited' : '구독중 · 무제한 이용') 
                    : (isEnglish ? 'Free Trial' : '무료 체험')}
                </p>
                {!isPremium && remaining !== Infinity && (
                  <p className="text-sm text-muted-foreground">
                    {isEnglish ? `${remaining} free trial(s) remaining` : `남은 무료 횟수: ${remaining}회`}
                  </p>
                )}
              </div>
            </div>
            <Badge variant="secondary" className="whitespace-nowrap flex-shrink-0 ml-2">
              {isPremium ? (isEnglish ? 'Premium' : '프리미엄') : (isEnglish ? 'Free' : '무료')}
            </Badge>
          </div>

          {children}

          <Button onClick={onProceed} className="w-full" size="lg">
            <CheckCircle className="w-4 h-4 mr-2" />
            {isEnglish ? 'Start' : '시작하기'}
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
          {isEnglish ? 'Free trials used up' : '무료 체험이 끝났습니다'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <p className="text-center text-muted-foreground">
          {isEnglish 
            ? <>You've used all free trials for <strong>{featureName}</strong>.</> 
            : <><strong>{featureName}</strong>의 무료 체험 횟수를 모두 사용하셨습니다.</>}
        </p>

        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-6 text-center space-y-4">
          <Crown className="w-12 h-12 mx-auto text-primary" />
          <div>
            <h3 className="text-lg font-semibold mb-1">
              {isEnglish ? 'Unlimited access with subscription' : '월간 구독으로 무제한 이용'}
            </h3>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-black text-primary">₩{SUBSCRIPTION_PRICE.toLocaleString()}</span>
              <span className="text-muted-foreground">{isEnglish ? '/mo' : '/월'}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {isEnglish 
                ? 'All AI analysis · Assessments · PDF reports unlimited' 
                : '모든 AI 분석 · 심리검사 · PDF 리포트 무제한'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={() => navigate('/token-subscription')} className="w-full" size="lg">
            <Crown className="w-4 h-4 mr-2" />
            {isEnglish ? 'Subscribe Now' : '구독 시작하기'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full">
            {isEnglish ? 'Back to Dashboard' : '대시보드로 돌아가기'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenGate;
