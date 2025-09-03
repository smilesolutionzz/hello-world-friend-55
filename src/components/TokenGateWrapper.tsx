import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Crown, Lock, TrendingUp, BarChart3 } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface TokenGateWrapperProps {
  onProceed: () => void;
  requiredTokens?: number;
  featureName?: string;
}

const TokenGateWrapper: React.FC<TokenGateWrapperProps> = ({ 
  onProceed, 
  requiredTokens = 1,
  featureName = "이 기능"
}) => {
  const { balance, checkTokenAvailability, loading } = useTokens();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const hasEnoughTokens = checkTokenAvailability(requiredTokens);
  const currentTokens = balance?.current_tokens || 0;

  // 토큰이 충분한 경우
  if (hasEnoughTokens) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {featureName} 이용 가능
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Badge variant="default" className="px-4 py-2">
              현재 토큰: {currentTokens}개 (필요 토큰: {requiredTokens}개)
            </Badge>
            <p className="text-muted-foreground">
              토큰을 사용하여 {featureName}을 이용하실 수 있습니다.
            </p>
            <Button onClick={onProceed} className="w-full" size="lg">
              {requiredTokens}개 토큰 사용하고 시작하기
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 토큰이 부족한 경우
  return (
    <Card className="w-full max-w-2xl mx-auto border-primary/20">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          토큰 부족
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="secondary" className="px-4 py-2">
            보유 토큰: {currentTokens}개 / 필요 토큰: {requiredTokens}개
          </Badge>
          <p className="text-muted-foreground">
            {featureName}을 이용하려면 {requiredTokens - currentTokens}개의 토큰이 더 필요합니다.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-primary flex items-center gap-2">
              <Crown className="w-4 h-4" />
              토큰 구매 혜택
            </h4>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>즉시 사용 가능</span>
              </li>
              <li className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span>다양한 AI 분석 서비스</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>추천인 보너스 토큰</span>
              </li>
              <li className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span>매일 무료 토큰 지급</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-4 text-center">
            <p className="font-medium text-primary mb-2">특별 할인 혜택</p>
            <p className="text-sm text-muted-foreground">
              첫 구매 시 <span className="font-bold text-primary">20% 추가 토큰</span> 지급
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate('/token-subscription')}
            className="w-full"
            size="lg"
          >
            <Crown className="w-4 h-4 mr-2" />
            토큰 구매하기
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="w-full"
          >
            대시보드로 돌아가기
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          매일 3개 무료 토큰 지급 • 추천인 보너스 토큰
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenGateWrapper;