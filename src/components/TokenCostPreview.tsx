import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Coins, Calculator, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { TOKEN_COSTS } from '@/constants/tokenCosts';
import { useTokens } from '@/hooks/useTokens';

interface Service {
  key: keyof typeof TOKEN_COSTS;
  name: string;
  description: string;
  category: 'basic' | 'premium' | 'free';
  recommended?: boolean;
}

const services: Service[] = [
  { key: 'AI_COUNSELOR_CHAT', name: 'AI 상담사 채팅', description: '무료로 마음 상담받기', category: 'free', recommended: true },
  { key: 'ADHD_TEST', name: '주의집중력 자가체크', description: '간단한 기본 검사', category: 'basic', recommended: true },
  { key: 'DEPRESSION_TEST', name: '우울감 자가체크', description: '우울 수준 확인', category: 'basic' },
  { key: 'PANIC_TEST', name: '불안감 수준 확인', description: '불안 정도 측정', category: 'basic' },
  { key: 'LANGUAGE_TEST', name: '언어발달 자가체크', description: '언어 발달 상태 확인', category: 'basic' },
  { key: 'PSYCHOLOGICAL_TEST', name: '마음상태 체크', description: '종합적인 심리상태 분석', category: 'premium', recommended: true },
  { key: 'DREAM_INTERPRETATION', name: '꿈 해석', description: 'AI 꿈 해석 서비스', category: 'premium' },
  { key: 'SAJU_ANALYSIS', name: '사주 분석', description: 'AI 사주 운세 분석', category: 'premium' },
  { key: 'AI_COACH', name: 'AI 코치', description: '개인맞춤 코칭', category: 'premium', recommended: true },
  { key: 'OBSERVATION_ANALYSIS', name: '관찰 분석', description: '행동 관찰 분석', category: 'premium' },
  { key: 'EXPERT_MATCHING', name: '전문가 매칭', description: '전문가 연결 서비스', category: 'basic' },
  { key: 'PREMIUM_ASSESSMENT', name: '프리미엄 종합검사', description: '종합 심리검사', category: 'premium' },
  { key: 'PROFESSIONAL_REPORT', name: '전문가 리포트', description: '전문 분석 리포트', category: 'premium' },
];

interface TokenCostPreviewProps {
  compact?: boolean;
  showRecommended?: boolean;
}

const TokenCostPreview: React.FC<TokenCostPreviewProps> = ({ 
  compact = false, 
  showRecommended = true 
}) => {
  const [selectedServices, setSelectedServices] = useState<Set<keyof typeof TOKEN_COSTS>>(new Set());
  const { tokenBalance } = useTokens();

  const handleServiceToggle = (serviceKey: keyof typeof TOKEN_COSTS) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceKey)) {
      newSelected.delete(serviceKey);
    } else {
      newSelected.add(serviceKey);
    }
    setSelectedServices(newSelected);
  };

  const totalCost = Array.from(selectedServices).reduce((sum, key) => {
    return sum + TOKEN_COSTS[key];
  }, 0);

  const currentTokens = tokenBalance?.current_tokens || 0;
  const canAfford = currentTokens >= totalCost;
  const remainingTokens = currentTokens - totalCost;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'free': return 'bg-green-100 text-green-800 border-green-200';
      case 'basic': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'premium': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCostBadgeColor = (cost: number) => {
    if (cost === 0) return 'bg-green-500 text-white';
    if (cost <= 2) return 'bg-blue-500 text-white';
    if (cost <= 5) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  // 추천 서비스 자동 선택
  const selectRecommended = () => {
    const recommendedKeys = services
      .filter(service => service.recommended)
      .map(service => service.key);
    setSelectedServices(new Set(recommendedKeys));
  };

  if (compact) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            서비스 비용 계산기
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 빠른 추천 선택 */}
          <Button 
            onClick={selectRecommended}
            variant="outline" 
            className="w-full"
            size="sm"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            추천 서비스 선택 ({services.filter(s => s.recommended).reduce((sum, s) => sum + TOKEN_COSTS[s.key], 0)}토큰)
          </Button>

          {/* 총 비용 표시 */}
          {selectedServices.size > 0 && (
            <div className={`p-3 rounded-lg border ${canAfford ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">총 예상 비용</span>
                <Badge className={getCostBadgeColor(totalCost)}>{totalCost}토큰</Badge>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">현재 보유</span>
                  <span>{currentTokens}토큰</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">사용 후 잔액</span>
                  <span className={remainingTokens < 0 ? 'text-red-600' : 'text-green-600'}>
                    {remainingTokens}토큰
                  </span>
                </div>
              </div>
              {!canAfford && (
                <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  토큰이 {Math.abs(remainingTokens)}개 부족합니다
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-primary" />
            🧮 토큰 사용량 계산기
          </CardTitle>
          <p className="text-muted-foreground">
            이용하고 싶은 서비스를 선택하여 필요한 토큰량을 미리 확인해보세요
          </p>
        </CardHeader>
        <CardContent>
          {/* 빠른 추천 선택 */}
          {showRecommended && (
            <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="font-medium">BM 전문가 추천 패키지</span>
                </div>
                <Button onClick={selectRecommended} variant="outline" size="sm">
                  추천 선택
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                효율적인 서비스 이용을 위한 추천 조합
              </p>
              <div className="flex flex-wrap gap-2">
                {services.filter(s => s.recommended).map(service => (
                  <Badge key={service.key} variant="secondary" className="text-xs">
                    {service.name} ({TOKEN_COSTS[service.key]}토큰)
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 서비스 선택 */}
          <div className="space-y-4">
            {/* 무료 서비스 */}
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                무료 서비스
              </h3>
              <div className="grid gap-2">
                {services.filter(s => s.category === 'free').map(service => (
                  <label key={service.key} className="flex items-center p-3 rounded-lg border border-green-200 bg-green-50/50 cursor-pointer hover:bg-green-50">
                    <Checkbox
                      checked={selectedServices.has(service.key)}
                      onCheckedChange={() => handleServiceToggle(service.key)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{service.name}</span>
                        <Badge className="bg-green-500 text-white">무료</Badge>
                        {service.recommended && (
                          <Badge variant="secondary" className="text-xs">추천</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 기본 서비스 */}
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Coins className="w-4 h-4 text-blue-600" />
                기본 서비스
              </h3>
              <div className="grid gap-2">
                {services.filter(s => s.category === 'basic').map(service => (
                  <label key={service.key} className="flex items-center p-3 rounded-lg border hover:bg-muted/30 cursor-pointer">
                    <Checkbox
                      checked={selectedServices.has(service.key)}
                      onCheckedChange={() => handleServiceToggle(service.key)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{service.name}</span>
                        <Badge className={getCostBadgeColor(TOKEN_COSTS[service.key])}>
                          {TOKEN_COSTS[service.key]}토큰
                        </Badge>
                        {service.recommended && (
                          <Badge variant="secondary" className="text-xs">추천</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 프리미엄 서비스 */}
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                프리미엄 서비스
              </h3>
              <div className="grid gap-2">
                {services.filter(s => s.category === 'premium').map(service => (
                  <label key={service.key} className="flex items-center p-3 rounded-lg border hover:bg-muted/30 cursor-pointer">
                    <Checkbox
                      checked={selectedServices.has(service.key)}
                      onCheckedChange={() => handleServiceToggle(service.key)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{service.name}</span>
                        <Badge className={getCostBadgeColor(TOKEN_COSTS[service.key])}>
                          {TOKEN_COSTS[service.key]}토큰
                        </Badge>
                        {service.recommended && (
                          <Badge variant="secondary" className="text-xs">추천</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 비용 요약 */}
      {selectedServices.size > 0 && (
        <Card className={`${canAfford ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              비용 요약
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 선택된 서비스 목록 */}
            <div>
              <h4 className="font-medium mb-2">선택된 서비스 ({selectedServices.size}개)</h4>
              <div className="space-y-2">
                {Array.from(selectedServices).map(key => {
                  const service = services.find(s => s.key === key);
                  if (!service) return null;
                  return (
                    <div key={key} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="text-sm">{service.name}</span>
                      <Badge className={getCostBadgeColor(TOKEN_COSTS[key])}>
                        {TOKEN_COSTS[key] === 0 ? '무료' : `${TOKEN_COSTS[key]}토큰`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 총 비용 및 잔액 */}
            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>총 필요 토큰</span>
                <Badge className={`${getCostBadgeColor(totalCost)} text-base px-3 py-1`}>
                  {totalCost}토큰
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">현재 보유 토큰</span>
                  <span className="font-medium">{currentTokens}토큰</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">사용 후 잔액</span>
                  <span className={`font-medium ${remainingTokens < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {remainingTokens}토큰
                  </span>
                </div>
              </div>

              {!canAfford && (
                <div className="p-3 rounded-lg bg-red-100 border border-red-200">
                  <div className="flex items-center gap-2 text-red-700 text-sm font-medium mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    토큰이 부족합니다
                  </div>
                  <p className="text-red-600 text-sm">
                    {Math.abs(remainingTokens)}개의 토큰이 추가로 필요합니다. 토큰을 충전해주세요.
                  </p>
                </div>
              )}

              {canAfford && totalCost > 0 && (
                <div className="p-3 rounded-lg bg-green-100 border border-green-200">
                  <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    선택한 모든 서비스를 이용할 수 있습니다!
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 도움말 */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-blue-800">💡 토큰 절약 팁</p>
              <ul className="text-blue-700 space-y-1">
                <li>• 먼저 무료 AI 상담사로 상담받아보세요</li>
                <li>• 기본 검사(2토큰)로 시작한 후 필요시 프리미엄 서비스 이용</li>
                <li>• 친구 추천시 10토큰 무료 지급!</li>
                <li>• 매일 로그인하면 일일 보너스 토큰 지급</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenCostPreview;