import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Plus, TrendingUp } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import { useNavigate } from 'react-router-dom';

interface TokenBalanceProps {
  showPurchaseButton?: boolean;
  compact?: boolean;
}

const TokenBalance: React.FC<TokenBalanceProps> = ({ 
  showPurchaseButton = true, 
  compact = false 
}) => {
  const { tokenBalance, loading } = useTokens();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className={`${compact ? 'w-auto' : 'w-full max-w-sm'}`}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-20"></div>
            <div className="h-6 bg-muted rounded w-16"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentTokens = tokenBalance?.current_tokens || 0;
  const isLowBalance = currentTokens <= 5;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge 
          variant={isLowBalance ? "destructive" : "secondary"}
          className="flex items-center gap-1"
        >
          <Coins className="w-3 h-3" />
          {currentTokens}개
        </Badge>
        {isLowBalance && showPurchaseButton && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/subscription')}
            className="text-xs px-2 py-1 h-6"
          >
            <Plus className="w-3 h-3 mr-1" />
            충전
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={`${isLowBalance ? 'border-destructive/50' : 'border-primary/20'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Coins className={`w-4 h-4 ${isLowBalance ? 'text-destructive' : 'text-primary'}`} />
              <span className="text-sm font-medium text-muted-foreground">
                보유 토큰
              </span>
            </div>
            <div className="text-2xl font-bold flex items-center gap-2">
              {currentTokens}
              <span className="text-sm font-normal text-muted-foreground">개</span>
            </div>
            {isLowBalance && (
              <p className="text-xs text-destructive">토큰이 부족합니다</p>
            )}
          </div>
          
          {showPurchaseButton && (
            <div className="space-y-2">
              <Button
                size="sm"
                onClick={() => navigate('/subscription')}
                className="w-full"
                variant={isLowBalance ? "default" : "outline"}
              >
                <Plus className="w-3 h-3 mr-1" />
                토큰 충전
              </Button>
              {tokenBalance && (
                <div className="text-xs text-center text-muted-foreground">
                  <div className="flex items-center gap-1 justify-center">
                    <TrendingUp className="w-3 h-3" />
                    총 사용: {tokenBalance.total_used}개
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenBalance;