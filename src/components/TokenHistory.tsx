import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Coins, 
  Gift, 
  ShoppingCart, 
  TrendingDown, 
  Calendar,
  Clock,
  RefreshCw,
  History,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { toast } from 'sonner';

interface TokenHistoryItem {
  id: string;
  feature_type: string;
  count: number;
  usage_date: string;
  created_at: string;
}

interface TokenOrder {
  id: string;
  tokens_purchased: number;
  amount: number;
  status: string;
  created_at: string;
}

export const TokenHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuthGuard();
  const [tokenHistory, setTokenHistory] = useState<TokenHistoryItem[]>([]);
  const [tokenOrders, setTokenOrders] = useState<TokenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBalance, setCurrentBalance] = useState<any>(null);

  const fetchTokenHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 토큰 사용 내역 조회
      const { data: historyData, error: historyError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (historyError) throw historyError;

      // 토큰 주문 내역 조회
      const { data: ordersData, error: ordersError } = await supabase
        .from('token_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersError) throw ordersError;

      // 현재 토큰 잔액 조회
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (balanceError) throw balanceError;

      setTokenHistory(historyData || []);
      setTokenOrders(ordersData || []);
      setCurrentBalance(balanceData);
    } catch (error) {
      console.error('토큰 내역 조회 실패:', error);
      toast.error('토큰 내역을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenHistory();
  }, [user]);

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'daily_bonus':
        return {
          icon: <Gift className="w-4 h-4 text-green-600" />,
          label: '일일 보너스',
          description: '매일 자동 지급',
          color: 'text-green-600',
          isIncrease: true
        };
      case 'referral_bonus':
        return {
          icon: <Gift className="w-4 h-4 text-blue-600" />,
          label: '추천 보너스',
          description: '친구 추천 보상',
          color: 'text-blue-600',
          isIncrease: true
        };
      case 'referral_signup_bonus':
        return {
          icon: <Gift className="w-4 h-4 text-purple-600" />,
          label: '추천가입 보너스',
          description: '추천으로 가입',
          color: 'text-purple-600',
          isIncrease: true
        };
      case 'assessment_analysis':
        return {
          icon: <TrendingDown className="w-4 h-4 text-red-600" />,
          label: '심리테스트 분석',
          description: '검사 결과 분석',
          color: 'text-red-600',
          isIncrease: false
        };
      case 'observation_analysis':
        return {
          icon: <TrendingDown className="w-4 h-4 text-red-600" />,
          label: '관찰일지 분석',
          description: '관찰 데이터 분석',
          color: 'text-red-600',
          isIncrease: false
        };
      default:
        return {
          icon: <Coins className="w-4 h-4 text-gray-600" />,
          label: type,
          description: '기타 사용',
          color: 'text-gray-600',
          isIncrease: false
        };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 현재 토큰 상태 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            토큰 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-primary/5">
              <div className="text-2xl font-bold text-primary">
                {currentBalance?.current_tokens || 0}
              </div>
              <div className="text-sm text-muted-foreground">현재 보유</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-600">
                {currentBalance?.total_purchased || 0}
              </div>
              <div className="text-sm text-muted-foreground">총 획득</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50">
              <div className="text-2xl font-bold text-red-600">
                {currentBalance?.total_used || 0}
              </div>
              <div className="text-sm text-muted-foreground">총 사용</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">
                {currentBalance?.referral_bonus || 0}
              </div>
              <div className="text-sm text-muted-foreground">추천 보너스</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 토큰 사용 내역 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            토큰 사용 내역
          </CardTitle>
          <Button onClick={fetchTokenHistory} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {tokenHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              아직 토큰 사용 내역이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {tokenHistory.map((item) => {
                const typeInfo = getTypeInfo(item.feature_type);
                return (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {typeInfo.icon}
                      <div>
                        <div className="font-medium">{typeInfo.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {typeInfo.description}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {typeInfo.isIncrease ? (
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-600" />
                      )}
                      <Badge 
                        variant={typeInfo.isIncrease ? "default" : "destructive"}
                        className={typeInfo.isIncrease ? "bg-green-100 text-green-800" : ""}
                      >
                        {typeInfo.isIncrease ? '+' : '-'}{item.count}토큰
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 토큰 구매 내역 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            구매 내역
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tokenOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              아직 구매 내역이 없습니다.
              <div className="mt-4">
                <Button onClick={() => navigate('/token-subscription')}>
                  토큰 구매하기
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {tokenOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium">
                        {order.tokens_purchased}토큰 구매
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.amount.toLocaleString()}원
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={order.status === 'completed' ? 'default' : 
                             order.status === 'pending' ? 'secondary' : 'destructive'}
                  >
                    {order.status === 'completed' ? '완료' :
                     order.status === 'pending' ? '대기중' : '실패'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 안내 사항 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-blue-100">
              <Coins className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">토큰 시스템 안내</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 매일 3토큰씩 무료로 지급됩니다</li>
                <li>• 친구 추천시 추천인은 10토큰, 가입자는 5토큰을 받습니다</li>
                <li>• 심리테스트 및 관찰일지 분석시 토큰이 차감됩니다</li>
                <li>• 토큰은 유효기간이 없으며, 언제든지 사용할 수 있습니다</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};