import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Plus, TrendingUp, Gift, Sparkles } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import { useNavigate } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { formatTokenAsCash, formatCash, tokenToCash } from '@/utils/tokenToCash';

interface CashBalanceProps {
  compact?: boolean;
}

const CashBalance: React.FC<CashBalanceProps> = ({ compact = true }) => {
  const { tokenBalance, loading } = useTokens();
  const { user } = useAuthGuard();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5 text-sm animate-pulse bg-muted/50 border border-amber-500/30">
        <Wallet className="w-4 h-4 animate-spin text-amber-500" />
        <div className="w-10 h-4 bg-muted/60 rounded" />
      </Badge>
    );
  }

  const currentTokens = tokenBalance?.current_tokens || 0;
  const cashValue = tokenToCash(currentTokens);
  const isLowBalance = currentTokens <= 5;

  if (!user && compact) {
    return null;
  }

  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer group">
            <Badge 
              variant="outline"
              className={`
                flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold
                transition-all duration-300 ease-out
                hover:scale-105 hover:shadow-lg
                ${isLowBalance 
                  ? 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-400/50 text-red-400 hover:border-red-400' 
                  : 'bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-400/50 text-amber-400 hover:border-amber-400 hover:shadow-amber-500/20'
                }
              `}
            >
              <Wallet className="w-4 h-4" />
              <span className="font-bold">{formatCash(cashValue)}</span>
            </Badge>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" side="bottom" align="end">
          <Card className="border-0 shadow-xl">
            <CardHeader className="pb-2 bg-gradient-to-r from-amber-500/10 to-yellow-500/10">
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-500" />
                내 캐시 잔액
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* 현재 캐시 잔액 */}
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-500/5 to-yellow-500/5 border border-amber-500/20">
                <div className="text-3xl font-bold text-amber-500">
                  {formatCash(cashValue)}
                  <span className="text-lg ml-1">원</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  ({currentTokens}토큰 보유중)
                </div>
              </div>

              {/* 프로모션 배너 */}
              <div className="p-3 rounded-lg bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-500/20">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-medium text-rose-500">
                    🔥 지금 충전하면 50% 추가 적립!
                  </span>
                </div>
              </div>

              {/* 사용 통계 */}
              {tokenBalance && (
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>총 충전</span>
                    <span className="font-medium">{formatTokenAsCash(tokenBalance.total_purchased)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>총 사용</span>
                    <span className="font-medium">{formatTokenAsCash(tokenBalance.total_used)}</span>
                  </div>
                  {tokenBalance.referral_bonus > 0 && (
                    <div className="flex justify-between text-green-500">
                      <span className="flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        추천 보너스
                      </span>
                      <span className="font-medium">+{formatTokenAsCash(tokenBalance.referral_bonus)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* 충전 버튼 */}
              <Button
                onClick={() => navigate('/token-subscription')}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                캐시 충전하기
              </Button>

              {/* 추천 보너스 */}
              <Button
                onClick={() => navigate('/?section=referral')}
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground hover:text-amber-500"
              >
                <Gift className="w-3 h-3 mr-1" />
                친구 추천시 1,000원 무료!
              </Button>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    );
  }

  return null;
};

export default CashBalance;
