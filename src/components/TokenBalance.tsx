import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Coins, Plus, TrendingUp, Gift, Info, BarChart3, Calendar, Clock, History } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [dailyBonusInfo, setDailyBonusInfo] = useState<any>(null);
  const [showDailyBonusAlert, setShowDailyBonusAlert] = useState(false);

  // 일일 보너스 정보 조회
  useEffect(() => {
    const checkDailyBonus = async () => {
      if (!tokenBalance?.user_id) return;
      
      try {
        const { data, error } = await supabase
          .from('usage_tracking')
          .select('*')
          .eq('user_id', tokenBalance.user_id)
          .eq('feature_type', 'daily_bonus')
          .gte('usage_date', new Date().toISOString().split('T')[0])
          .order('created_at', { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          setDailyBonusInfo(data[0]);
          
          // 오늘 처음 접속하고 일일 보너스를 받았다면 알림 표시
          const bonusTime = new Date(data[0].created_at);
          const now = new Date();
          const timeDiff = now.getTime() - bonusTime.getTime();
          const minutesDiff = timeDiff / (1000 * 60);
          
          // 5분 이내에 받은 보너스라면 알림 표시
          if (minutesDiff <= 5) {
            setShowDailyBonusAlert(true);
            toast.success(`🎉 일일 보너스 ${data[0].count}토큰이 지급되었습니다!`);
          }
        }
      } catch (error) {
        console.error('일일 보너스 정보 조회 실패:', error);
      }
    };

    checkDailyBonus();
  }, [tokenBalance?.user_id]);

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
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <Badge 
              variant={isLowBalance ? "destructive" : "secondary"}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <Coins className="w-3 h-3" />
              {currentTokens}개
            </Badge>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80" side="bottom" align="start">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary" />
                토큰 보유 현황
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 현재 보유 토큰 */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">현재 보유</span>
                <div className="text-xl font-bold text-primary">{currentTokens}개</div>
              </div>

              {/* 토큰 사용 통계 */}
              {tokenBalance && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">총 구매</span>
                    <span className="font-medium">{tokenBalance.total_purchased}개</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">총 사용</span>
                    <span className="font-medium">{tokenBalance.total_used}개</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">추천 보너스</span>
                    <span className="font-medium text-green-600">{tokenBalance.referral_bonus}개</span>
                  </div>
                </div>
              )}

              {/* 경고 메시지 */}
              {isLowBalance && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <Info className="w-4 h-4" />
                    토큰이 부족합니다. 서비스 이용을 위해 충전해주세요.
                  </div>
                </div>
              )}

              {/* 일일 보너스 정보 */}
              {dailyBonusInfo && (
                <Alert className="bg-green-50 border-green-200">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>오늘의 일일 보너스</strong><br />
                    {dailyBonusInfo.count}토큰이 지급되었습니다 ({new Date(dailyBonusInfo.created_at).toLocaleTimeString()})
                  </AlertDescription>
                </Alert>
              )}

              {/* 대시보드 버튼 */}
              <Button
                onClick={() => navigate('/token-history')}
                className="w-full"
                variant="outline"
              >
                <History className="w-4 h-4 mr-2" />
                토큰 내역 보기
              </Button>

              {/* 충전 버튼 */}
              <Button
                onClick={() => navigate('/token-subscription')}
                className="w-full"
                variant={isLowBalance ? "default" : "outline"}
              >
                <Plus className="w-4 h-4 mr-2" />
                토큰 충전하기
              </Button>

              {/* 추천 혜택 안내 */}
              <Button
                onClick={() => navigate('/?section=referral')}
                variant="secondary"
                size="sm"
                className="w-full bg-gradient-to-r from-secondary/10 to-primary/10 hover:from-secondary/20 hover:to-primary/20 border border-secondary/20"
              >
                <Gift className="w-3 h-3 mr-1" />
                친구 추천시 10토큰 무료 지급!
              </Button>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
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
                onClick={() => navigate('/token-subscription')}
                className="w-full"
                variant={isLowBalance ? "default" : "outline"}
              >
                <Plus className="w-3 h-3 mr-1" />
                토큰 충전
              </Button>
              {tokenBalance && (
                <div className="text-xs text-center text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1 justify-center">
                    <TrendingUp className="w-3 h-3" />
                    총 사용: {tokenBalance.total_used}개
                  </div>
                  {/* 일일 보너스 표시 */}
                  {tokenBalance.last_daily_bonus_date === new Date().toISOString().split('T')[0] && (
                    <div className="flex items-center gap-1 justify-center text-green-600">
                      <Gift className="w-3 h-3" />
                      오늘 일일보너스 3토큰 지급됨
                    </div>
                  )}
                  <Button
                    onClick={() => navigate('/?section=referral')}
                    variant="ghost"
                    size="sm"
                    className="text-xs h-auto p-1 text-primary/60 hover:text-primary hover:bg-primary/5"
                  >
                    <Gift className="w-3 h-3 mr-1" />
                    친구 추천시 10토큰
                  </Button>
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