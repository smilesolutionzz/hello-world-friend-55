import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Clock, Star, Zap, Heart, Brain, Target, TrendingUp, Info, CheckCircle } from 'lucide-react';
import { TOKEN_COSTS, TOKEN_COST_DESCRIPTIONS } from '@/constants/tokenCosts';
import { useNavigate } from 'react-router-dom';

interface TokenUsageGuideProps {
  compact?: boolean;
  showRecommendations?: boolean;
}

const TokenUsageGuide: React.FC<TokenUsageGuideProps> = ({ 
  compact = false, 
  showRecommendations = true 
}) => {
  const navigate = useNavigate();

  // 기능별 그룹화
  const basicTests = [
    { key: 'FOCUS_CHECK', name: 'AIH 집중력 자가점검', icon: Target, category: '기본 검사' },
    { key: 'DEPRESSION_TEST', name: '우울감 자가체크', icon: Heart, category: '기본 검사' },
    { key: 'PANIC_TEST', name: '불안감 수준 확인', icon: Zap, category: '기본 검사' },
    { key: 'LANGUAGE_TEST', name: '언어발달 자가체크', icon: Brain, category: '기본 검사' },
  ];

  const premiumTests = [
    { key: 'PSYCHOLOGICAL_TEST', name: '마음상태 체크 (종합)', icon: Brain, category: '심화 검사' },
    { key: 'DREAM_INTERPRETATION', name: '꿈 해석', icon: Star, category: '특수 서비스' },
    { key: 'SAJU_ANALYSIS', name: '사주 분석', icon: Star, category: '특수 서비스' },
    { key: 'PREMIUM_ASSESSMENT', name: '프리미엄 종합검사', icon: Star, category: '프리미엄' },
  ];

  const freeServices = [
    { key: 'AI_COUNSELOR_CHAT', name: 'AI 상담사 채팅', icon: Heart, category: '무료 서비스' },
    { key: 'CRISIS_DETECTION', name: '위기감지', icon: Zap, category: '무료 서비스' },
  ];

  const getCostBadgeColor = (cost: number) => {
    if (cost === 0) return 'bg-green-100 text-green-800 border-green-200';
    if (cost <= 2) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (cost <= 5) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getCostLabel = (cost: number) => {
    if (cost === 0) return '무료';
    return `${cost}토큰`;
  };

  const getRecommendedPath = () => [
    { step: 1, service: 'AI_COUNSELOR_CHAT', reason: '무료로 먼저 상담받기' },
    { step: 2, service: 'FOCUS_CHECK', reason: '개인 집중력 패턴 확인하기' },
    { step: 3, service: 'PSYCHOLOGICAL_TEST', reason: '종합적인 마음상태 확인' },
    { step: 4, service: 'AI_COACH', reason: '개인맞춤 코칭 받기' },
  ];

  if (compact) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            서비스별 토큰 비용
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 무료 서비스 강조 */}
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">무료로 시작하세요!</span>
            </div>
            <div className="space-y-1 text-sm">
              {freeServices.map(service => (
                <div key={service.key} className="flex items-center justify-between">
                  <span className="text-green-700">{service.name}</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">무료</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* 기본 검사 */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">기본 검사 (2토큰)</h4>
            {basicTests.map(service => (
              <div key={service.key} className="flex items-center justify-between text-sm">
                <span>{service.name}</span>
                <Badge className={getCostBadgeColor(TOKEN_COSTS[service.key as keyof typeof TOKEN_COSTS])}>
                  {getCostLabel(TOKEN_COSTS[service.key as keyof typeof TOKEN_COSTS])}
                </Badge>
              </div>
            ))}
          </div>

          {/* 프리미엄 서비스 */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">프리미엄 서비스</h4>
            {premiumTests.map(service => (
              <div key={service.key} className="flex items-center justify-between text-sm">
                <span>{service.name}</span>
                <Badge className={getCostBadgeColor(TOKEN_COSTS[service.key as keyof typeof TOKEN_COSTS])}>
                  {getCostLabel(TOKEN_COSTS[service.key as keyof typeof TOKEN_COSTS])}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 추천 사용 경로 */}
      {showRecommendations && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              💡 BM 전문가 추천 경로
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              가장 효율적인 서비스 이용 순서를 제안합니다
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {getRecommendedPath().map((item, index) => {
              const cost = TOKEN_COSTS[item.service as keyof typeof TOKEN_COSTS];
              return (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {freeServices.find(s => s.key === item.service)?.name ||
                         basicTests.find(s => s.key === item.service)?.name ||
                         premiumTests.find(s => s.key === item.service)?.name ||
                         'AI 코치'}
                      </span>
                      <Badge className={getCostBadgeColor(cost)}>
                        {getCostLabel(cost)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.reason}</p>
                  </div>
                </div>
              );
            })}
            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 text-primary text-sm">
                <Info className="w-4 h-4" />
                <span className="font-medium">총 예상 비용: 8토큰 (무료 서비스 제외)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 무료 서비스 */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            🎉 무료로 이용 가능한 서비스
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {freeServices.map(service => {
            const IconComponent = service.icon;
            return (
              <div key={service.key} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <IconComponent className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800">{service.name}</h4>
                    <p className="text-sm text-green-600">{service.category}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">무료</Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 기본 검사 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            기본 자가체크 (2토큰)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            저렴한 비용으로 빠른 자가진단이 가능합니다
          </p>
        </CardHeader>
        <CardContent className="grid gap-3">
          {basicTests.map(service => {
            const IconComponent = service.icon;
            const cost = TOKEN_COSTS[service.key as keyof typeof TOKEN_COSTS];
            return (
              <div key={service.key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <IconComponent className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-muted-foreground">{TOKEN_COST_DESCRIPTIONS[cost as keyof typeof TOKEN_COST_DESCRIPTIONS]}</p>
                  </div>
                </div>
                <Badge className={getCostBadgeColor(cost)}>
                  {getCostLabel(cost)}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 프리미엄 서비스 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-orange-500" />
            심화 & 프리미엄 서비스
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            전문적이고 상세한 분석이 필요할 때 이용하세요
          </p>
        </CardHeader>
        <CardContent className="grid gap-3">
          {premiumTests.map(service => {
            const IconComponent = service.icon;
            const cost = TOKEN_COSTS[service.key as keyof typeof TOKEN_COSTS];
            return (
              <div key={service.key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <IconComponent className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-muted-foreground">{TOKEN_COST_DESCRIPTIONS[cost as keyof typeof TOKEN_COST_DESCRIPTIONS]}</p>
                  </div>
                </div>
                <Badge className={getCostBadgeColor(cost)}>
                  {getCostLabel(cost)}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 토큰 충전 안내 */}
      <Card className="border-primary/20">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Coins className="w-6 h-6" />
            <span className="text-lg font-semibold">토큰이 부족하신가요?</span>
          </div>
          <p className="text-muted-foreground">
            다양한 요금제로 합리적인 가격에 토큰을 충전하세요
          </p>
          <Button 
            onClick={() => navigate('/token-subscription')}
            className="w-full max-w-xs mx-auto"
          >
            토큰 충전하러 가기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenUsageGuide;