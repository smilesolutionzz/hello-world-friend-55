import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Clock, Star, Zap, Heart, Brain, Target, TrendingUp, Info, CheckCircle } from 'lucide-react';
import { TOKEN_COSTS, TOKEN_COST_DESCRIPTIONS } from '@/constants/tokenCosts';
import { useNavigate } from 'react-router-dom';
import { tokenToCash, formatCash } from '@/utils/tokenToCash';

interface TokenUsageGuideProps {
  compact?: boolean;
  showRecommendations?: boolean;
}

// 캐시 형태로 표시하는 헬퍼 함수
const getCashLabel = (tokens: number) => {
  if (tokens === 0) return '무료';
  return `${formatCash(tokenToCash(tokens))}원`;
};

const TokenUsageGuide: React.FC<TokenUsageGuideProps> = ({ 
  compact = false, 
  showRecommendations = true 
}) => {
  const navigate = useNavigate();

  // 기능별 그룹화 (현재 가격 정책 반영)
  const freeServices = [
    { key: 'DREAM_INTERPRETATION', name: '꿈 해석', icon: Star, category: '무료 서비스' },
    { key: 'SAJU_ANALYSIS', name: '사주 분석', icon: Star, category: '무료 서비스' },
    { key: 'IEP_GENERATION', name: 'IEP 생성', icon: Brain, category: '무료 서비스' },
    { key: 'CRISIS_DETECTION', name: '위기감지', icon: Zap, category: '무료 서비스' },
  ];

  const entertainmentTests = [
    { key: 'PAST_LIFE_JOB', name: '전생 직업 분석', icon: Star, category: '엔터테인먼트' },
    { key: 'ANIMAL_FACE_MATCH', name: '얼굴 닮은 동물 찾기', icon: Heart, category: '엔터테인먼트' },
    { key: 'INNER_ANIMAL', name: '내면 동물 찾기', icon: Heart, category: '엔터테인먼트' },
  ];

  const basicTests = [
    { key: 'PSYCHOLOGICAL_TEST', name: '마음상태 체크', icon: Brain, category: '기본 심리검사' },
    { key: 'FOCUS_CHECK', name: 'AIH 집중력 자가점검', icon: Target, category: '기본 심리검사' },
    { key: 'DEPRESSION_TEST', name: '우울감 자가체크', icon: Heart, category: '기본 심리검사' },
    { key: 'PANIC_TEST', name: '불안감 수준 확인', icon: Zap, category: '기본 심리검사' },
  ];

  const expertTests = [
    { key: 'FIVE_D_PERSONALITY', name: '5D 성격 분석', icon: Brain, category: 'AIH 전문가 창작' },
    { key: 'RELATIONSHIP_TYPE', name: '관계유형 진단', icon: Heart, category: 'AIH 전문가 창작' },
    { key: 'STRESS_INDEX', name: '스트레스 지수 측정', icon: Zap, category: 'AIH 전문가 창작' },
    { key: 'AI_COACH', name: 'AI 코치 세션', icon: Target, category: 'AIH 전문가 창작' },
  ];

  const premiumServices = [
    { key: 'OBSERVATION_ANALYSIS', name: '관찰 분석', icon: Brain, category: '프리미엄' },
    { key: 'PREMIUM_ASSESSMENT', name: '프리미엄 종합테스트', icon: Star, category: '프리미엄' },
  ];

  const comprehensiveServices = [
    { key: 'COMPREHENSIVE_REPORT', name: '종합 리포팅 (20,000원)', icon: Star, category: '최고급' },
  ];

  const getCostBadgeColor = (cost: number) => {
    if (cost === 0) return 'bg-green-100 text-green-800 border-green-200';
    if (cost === 1) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (cost === 5) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (cost === 20) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getCostLabel = (cost: number) => {
    if (cost === 0) return '무료';
    return `${(cost * 100).toLocaleString()}캐시`;
  };

  const getRecommendedPath = () => [
    { step: 1, service: 'DREAM_INTERPRETATION', reason: '무료로 먼저 상담받기' },
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
            서비스별 이용 요금
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 무료 서비스 */}
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">무료 서비스</span>
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

          {/* 엔터테인먼트 */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">엔터테인먼트 (100원)</h4>
            {entertainmentTests.map(service => (
              <div key={service.key} className="flex items-center justify-between text-sm">
                <span>{service.name}</span>
                <Badge className={getCostBadgeColor(TOKEN_COSTS[service.key as keyof typeof TOKEN_COSTS])}>
                  {getCashLabel(TOKEN_COSTS[service.key as keyof typeof TOKEN_COSTS])}
                </Badge>
              </div>
            ))}
          </div>

          {/* 기본 검사 */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">기본 심리검사 (500원)</h4>
            {basicTests.map(service => (
              <div key={service.key} className="flex items-center justify-between text-sm">
                <span>{service.name}</span>
                <Badge className={getCostBadgeColor(TOKEN_COSTS[service.key as keyof typeof TOKEN_COSTS])}>
                  {getCashLabel(TOKEN_COSTS[service.key as keyof typeof TOKEN_COSTS])}
                </Badge>
              </div>
            ))}
          </div>

          {/* AIH 전문가 창작 */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">AIH 전문가 창작 (500원)</h4>
            {expertTests.map(service => (
              <div key={service.key} className="flex items-center justify-between text-sm">
                <span>{service.name}</span>
                <Badge className={getCostBadgeColor(TOKEN_COSTS[service.key as keyof typeof TOKEN_COSTS])}>
                  {getCashLabel(TOKEN_COSTS[service.key as keyof typeof TOKEN_COSTS])}
                </Badge>
              </div>
            ))}
          </div>

          {/* 프리미엄 서비스 */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">프리미엄 (2,000원)</h4>
            {premiumServices.map(service => (
              <div key={service.key} className="flex items-center justify-between text-sm">
                <span>{service.name}</span>
                <Badge className={getCostBadgeColor(TOKEN_COSTS[service.key as keyof typeof TOKEN_COSTS])}>
                  {getCashLabel(TOKEN_COSTS[service.key as keyof typeof TOKEN_COSTS])}
                </Badge>
              </div>
            ))}
          </div>

          {/* 최고급 서비스 */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">최고급 서비스 (20,000원)</h4>
            {comprehensiveServices.map(service => (
              <div key={service.key} className="flex items-center justify-between text-sm">
                <span>{service.name}</span>
                <Badge className={getCostBadgeColor(TOKEN_COSTS[service.key as keyof typeof TOKEN_COSTS])}>
                  {getCashLabel(TOKEN_COSTS[service.key as keyof typeof TOKEN_COSTS])}
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
              💡 추천 이용 경로
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              가장 효율적인 서비스 이용 순서를 제안합니다
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {getRecommendedPath().map((item, index) => {
              const cost = TOKEN_COSTS[item.service as keyof typeof TOKEN_COSTS];
              const allServices = [...freeServices, ...entertainmentTests, ...basicTests, ...expertTests, ...premiumServices, ...comprehensiveServices];
              const serviceName = allServices.find(s => s.key === item.service)?.name || item.service;
              
              return (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{serviceName}</span>
                      <Badge className={getCostBadgeColor(cost)}>
                        {getCashLabel(cost)}
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
                <span className="font-medium">총 예상 비용: 1,000원 (무료 서비스 제외)</span>
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

      {/* 엔터테인먼트 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-600" />
            엔터테인먼트 테스트 (100원)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            재미있고 가벼운 심리 테스트
          </p>
        </CardHeader>
        <CardContent className="grid gap-3">
          {entertainmentTests.map(service => {
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
                    <p className="text-sm text-muted-foreground">{service.category}</p>
                  </div>
                </div>
                <Badge className={getCostBadgeColor(cost)}>
                  {getCashLabel(cost)}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 기본 심리검사 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-orange-600" />
            기본 심리검사 (500원)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            전문 심리검사 및 발달검사
          </p>
        </CardHeader>
        <CardContent className="grid gap-3">
          {basicTests.map(service => {
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
                    <p className="text-sm text-muted-foreground">{service.category}</p>
                  </div>
                </div>
                <Badge className={getCostBadgeColor(cost)}>
                  {getCashLabel(cost)}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* AIH 전문가 창작 검사 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            AIH 전문가 창작 검사 (500원)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            발달 심리전문가가 직접 개발한 신뢰도 높은 검사
          </p>
        </CardHeader>
        <CardContent className="grid gap-3">
          {expertTests.map(service => {
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
                    <p className="text-sm text-muted-foreground">{service.category}</p>
                  </div>
                </div>
                <Badge className={getCostBadgeColor(cost)}>
                  {getCashLabel(cost)}
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
            <Star className="w-5 h-5 text-purple-600" />
            프리미엄 서비스 (2,000원)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            전문가급 분석 및 리포트
          </p>
        </CardHeader>
        <CardContent className="grid gap-3">
          {premiumServices.map(service => {
            const IconComponent = service.icon;
            const cost = TOKEN_COSTS[service.key as keyof typeof TOKEN_COSTS];
            return (
              <div key={service.key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <IconComponent className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-muted-foreground">{service.category}</p>
                  </div>
                </div>
                <Badge className={getCostBadgeColor(cost)}>
                  {getCashLabel(cost)}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 최고급 서비스 */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-red-600" />
            최고급 종합 서비스 (20,000원)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            모든 데이터 종합 박사급 분석 리포트 (3일내 휴대폰 전송)
          </p>
        </CardHeader>
        <CardContent className="grid gap-3">
          {comprehensiveServices.map(service => {
            const IconComponent = service.icon;
            const cost = TOKEN_COSTS[service.key as keyof typeof TOKEN_COSTS];
            return (
              <div key={service.key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <IconComponent className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-muted-foreground">{service.category}</p>
                  </div>
                </div>
                <Badge className={getCostBadgeColor(cost)}>
                  {getCashLabel(cost)}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 캐시 충전 안내 */}
      <Card className="border-primary/20">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Coins className="w-6 h-6" />
            <span className="text-lg font-semibold">캐시가 부족하신가요?</span>
          </div>
          <p className="text-muted-foreground">
            다양한 요금제로 합리적인 가격에 캐시를 충전하세요
          </p>
          <Button 
            onClick={() => navigate('/token-subscription')}
            className="w-full max-w-xs mx-auto"
          >
            캐시 충전하러 가기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenUsageGuide;
