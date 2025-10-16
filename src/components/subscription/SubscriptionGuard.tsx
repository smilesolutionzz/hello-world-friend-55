import { ReactNode, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock, Sparkles, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionGuardProps {
  children: ReactNode;
  featureName: string;
  requiredTier?: 'premium' | 'pro';
  fallbackMessage?: string;
}

export const SubscriptionGuard = ({ 
  children, 
  featureName,
  requiredTier = 'premium',
  fallbackMessage 
}: SubscriptionGuardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // 프로필에서 구독 등급 확인
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('user_id', user.id)
        .single();

      const tier = profile?.subscription_tier || 'free';
      
      // premium 이상 또는 pro 등급 확인
      const isPremium = tier === 'premium' || tier === 'pro';
      const isPro = tier === 'pro';
      
      if (requiredTier === 'pro') {
        setHasAccess(isPro);
      } else {
        setHasAccess(isPremium);
      }
    } catch (error) {
      console.error('구독 확인 오류:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-center">
          <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">구독 상태 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Lock className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-3xl mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                프리미엄 전용 기능
              </CardTitle>
              <p className="text-lg text-muted-foreground">
                {fallbackMessage || `${featureName}은(는) 구독자 전용 프리미엄 기능입니다`}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pb-8">
            {/* 기능 설명 */}
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

            {/* 프리미엄 혜택 */}
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

            {/* 가격 안내 */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">프리미엄 플랜</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    ₩29,900
                  </span>
                  <span className="text-muted-foreground">/월</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  첫 7일 무료 체험
                </p>
              </div>
            </div>

            {/* CTA 버튼 */}
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
                onClick={() => navigate(-1)}
                className="flex-1 h-12 text-base"
              >
                돌아가기
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              언제든지 해지 가능 · 7일 무료 체험 후 자동 결제
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
