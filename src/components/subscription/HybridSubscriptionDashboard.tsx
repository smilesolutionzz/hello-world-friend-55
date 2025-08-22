import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useHybridSubscription } from '@/hooks/useHybridSubscription';
import { useTokens } from '@/hooks/useTokens';
import { Zap, Crown, TrendingUp, AlertCircle, Gift, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function HybridSubscriptionDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription, plans, usage, loading, getUpgradeGuide } = useHybridSubscription();
  const { tokenBalance } = useTokens();
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('monthly');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const upgradeGuide = getUpgradeGuide();
  const currentPlan = subscription?.plan;

  const formatPrice = (price?: number) => {
    if (!price) return '무료';
    return `₩${(price / 100).toLocaleString()}`;
  };

  const formatFeatures = (features: any) => {
    if (!features) return [];
    return Object.entries(features).map(([key, value]) => {
      const featureNames: Record<string, string> = {
        monthly_assessments: '월간 심리검사',
        assessments: '심리검사',
        ai_analysis: 'AI 분석',
        expert_consultation: '전문가 상담',
        priority_support: '우선 지원',
        family_tracking: '가족 트래킹',
        trend_analysis: '트렌드 분석',
        community_support: '커뮤니티 지원'
      };
      
      const displayName = featureNames[key] || key;
      const displayValue = typeof value === 'number' ? `${value}회` : 
                          value === 'unlimited' ? '무제한' :
                          value === true ? '포함' : value;
      
      return `${displayName}: ${displayValue}`;
    });
  };

  return (
    <div className="space-y-6">
      {/* 현재 구독 상태 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {subscription?.subscription_type === 'monthly_unlimited' && <Crown className="h-5 w-5 text-yellow-500" />}
                {subscription?.subscription_type === 'token_pack' && <Zap className="h-5 w-5 text-blue-500" />}
                현재 플랜: {currentPlan?.name || '무료 체험'}
              </CardTitle>
              <CardDescription>
                {subscription?.subscription_type === 'free' && '무료 체험으로 시작해보세요'}
                {subscription?.subscription_type === 'token_pack' && `보유 토큰: ${tokenBalance?.current_tokens || 0}개`}
                {subscription?.subscription_type === 'monthly_unlimited' && '무제한 이용 중'}
              </CardDescription>
            </div>
            <Badge variant={subscription?.subscription_type === 'free' ? 'secondary' : 'default'}>
              {subscription?.subscription_type === 'free' ? '무료' : 
               subscription?.subscription_type === 'token_pack' ? '토큰팩' : '프리미엄'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* 이번 달 사용량 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>심리검사</span>
                <span>{usage.assessment}회</span>
              </div>
              <Progress 
                value={subscription?.subscription_type === 'free' ? (usage.assessment / 1) * 100 : 0} 
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>AI 분석</span>
                <span>{usage.analysis}회</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>전문가 상담</span>
                <span>{usage.consultation}회</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 업그레이드 추천 */}
      {upgradeGuide && (
        <Card className="border-brand bg-gradient-to-r from-brand/10 to-brand-secondary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand" />
              {upgradeGuide.title}
            </CardTitle>
            <CardDescription>{upgradeGuide.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {upgradeGuide.recommendedPlan && (
              <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                <div>
                  <h4 className="font-semibold">{upgradeGuide.recommendedPlan.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(upgradeGuide.recommendedPlan.price_monthly)}/월
                  </p>
                </div>
                <Button onClick={() => navigate('/subscription')}>
                  업그레이드
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 구독 플랜 옵션 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">구독 플랜 선택</h3>
          <div className="flex items-center gap-2">
            <Button
              variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('monthly')}
            >
              월간
            </Button>
            <Button
              variant={selectedPeriod === 'yearly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('yearly')}
            >
              연간 (할인)
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = subscription?.plan_id === plan.id;
            const price = selectedPeriod === 'monthly' ? plan.price_monthly : plan.price_yearly;
            const isPopular = plan.type === 'token_pack' && plan.token_count === 25;

            return (
              <Card key={plan.id} className={`relative ${isCurrent ? 'border-brand bg-brand/5' : ''}`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-brand to-brand-secondary text-white">
                      <Star className="h-3 w-3 mr-1" />
                      인기
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {isCurrent && <Badge variant="secondary">현재 플랜</Badge>}
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">
                      {formatPrice(price)}
                      {selectedPeriod === 'yearly' && plan.price_yearly && (
                        <span className="text-sm font-normal text-muted-foreground">
                          /년
                        </span>
                      )}
                      {selectedPeriod === 'monthly' && price !== 0 && (
                        <span className="text-sm font-normal text-muted-foreground">
                          /월
                        </span>
                      )}
                    </div>
                    {plan.token_count && (
                      <p className="text-sm text-muted-foreground">
                        {plan.token_count}개 토큰 포함
                      </p>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {formatFeatures(plan.features).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 bg-brand rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {!isCurrent && (
                    <Button 
                      className="w-full"
                      variant={isPopular ? 'default' : 'outline'}
                      onClick={() => {
                        if (plan.type === 'free') {
                          // 무료 플랜으로 다운그레이드
                          // TODO: 구독 취소 로직 구현
                          toast({
                            title: "무료 플랜",
                            description: "무료 플랜은 별도 등록이 필요하지 않습니다.",
                          });
                        } else if (plan.type === 'token_pack') {
                          // 토큰 구매 페이지로 이동
                          navigate('/token-subscription');
                        } else {
                          // 월간 구독 페이지로 이동 (향후 구현)
                          toast({
                            title: "서비스 준비 중",
                            description: "월간 구독 서비스를 준비 중입니다. 토큰팩을 이용해주세요.",
                          });
                        }
                      }}
                    >
                      {plan.type === 'free' ? '무료 시작' : '구독하기'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 토큰팩 vs 월구독 비교 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-brand" />
            어떤 플랜이 나에게 맞을까요?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-blue-600 mb-2">토큰팩을 추천드려요</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 가끔씩만 분석을 받고 싶어요</li>
                <li>• 필요할 때만 사용하고 싶어요</li>
                <li>• 한 번에 많이 분석받지 않아요</li>
                <li>• 월 10회 미만 사용</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-yellow-600 mb-2">월간 무제한을 추천드려요</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 정기적으로 분석을 받고 싶어요</li>
                <li>• 가족 전체를 관리하고 싶어요</li>
                <li>• 전문가 상담도 받고 싶어요</li>
                <li>• 월 15회 이상 사용</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}