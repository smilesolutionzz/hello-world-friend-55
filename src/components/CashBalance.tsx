import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Plus, Gift, Sparkles, History, Settings, Crown, ChevronRight, CreditCard } from 'lucide-react';
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
                  : 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-400/50 text-blue-500 dark:text-blue-400 hover:border-blue-400 hover:shadow-blue-500/20'
                }
              `}
            >
              <Wallet className="w-4 h-4" />
              <span className="font-bold">{formatCash(cashValue)}원</span>
            </Badge>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" side="bottom" align="end">
          <Card className="border-0 shadow-xl">
            <CardHeader className="pb-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-500" />
                내 캐시 관리
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* 현재 캐시 잔액 */}
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20">
                <div className="text-3xl font-bold text-blue-500">
                  {formatCash(cashValue)}
                  <span className="text-lg ml-1">원</span>
                </div>
                {isLowBalance && (
                  <div className="text-xs text-red-500 mt-1 flex items-center justify-center gap-1">
                    <span>⚠️</span> 잔액이 부족해요
                  </div>
                )}
              </div>

              {/* 사용 통계 */}
              {tokenBalance && (
                <div className="space-y-1.5 text-sm bg-muted/30 rounded-lg p-3">
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

              {/* 캐시 관리 메뉴 */}
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/token-subscription')}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    캐시 충전하기
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <Button
                  onClick={() => navigate('/concern-storage')}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-bold justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    검사/고민 보관소
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => navigate('/token-history')}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <History className="w-3 h-3 mr-1" />
                    사용내역
                  </Button>
                  <Button
                    onClick={() => navigate('/my-page')}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    계정관리
                  </Button>
                </div>
              </div>

              {/* 프로모션 배너 */}
              <div 
                className="p-3 rounded-lg bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 cursor-pointer hover:border-violet-500/40 transition-colors"
                onClick={() => navigate('/token-subscription')}
              >
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-violet-500" />
                  <span className="text-xs font-medium text-violet-600 dark:text-violet-400">
                    🎉 프리미엄 패스 1개월 무료 체험!
                  </span>
                </div>
              </div>

              {/* 추천 보너스 */}
              <Button
                onClick={() => navigate('/?section=referral')}
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground hover:text-blue-500"
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
