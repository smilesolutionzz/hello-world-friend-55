import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  DollarSign, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  RefreshCw,
  Settings,
  BarChart,
  Users,
  Coins
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AutomationRule {
  id: string;
  type: 'refund' | 'payment_retry' | 'fraud_detection' | 'token_adjustment';
  enabled: boolean;
  conditions: Record<string, any>;
  action: string;
  name: string;
  description: string;
}

interface PendingTransaction {
  id: string;
  user_email: string;
  type: 'refund_request' | 'payment_failed' | 'suspicious_activity' | 'token_anomaly';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  details: string;
  auto_processable: boolean;
}

interface FinancialStats {
  total_revenue_today: number;
  pending_refunds: number;
  failed_payments: number;
  auto_processed: number;
  manual_review_needed: number;
}

export function FinancialAutomation() {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [financialStats, setFinancialStats] = useState<FinancialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const defaultRules: AutomationRule[] = [
    {
      id: '1',
      type: 'refund',
      enabled: true,
      conditions: { amount_limit: 50000, time_since_purchase: 7 },
      action: 'auto_approve',
      name: '자동 환불 처리',
      description: '5만원 이하, 구매 후 7일 이내 환불 요청 자동 승인'
    },
    {
      id: '2',
      type: 'payment_retry',
      enabled: true,
      conditions: { retry_count: 3, retry_interval: 24 },
      action: 'auto_retry',
      name: '결제 재시도',
      description: '결제 실패 시 24시간 간격으로 최대 3회 자동 재시도'
    },
    {
      id: '3',
      type: 'fraud_detection',
      enabled: true,
      conditions: { unusual_pattern_threshold: 5 },
      action: 'freeze_account',
      name: '이상 거래 탐지',
      description: '비정상적인 거래 패턴 감지 시 계정 임시 동결'
    },
    {
      id: '4',
      type: 'token_adjustment',
      enabled: false,
      conditions: { adjustment_limit: 1000 },
      action: 'auto_adjust',
      name: '토큰 자동 조정',
      description: '시스템 오류로 인한 토큰 손실 자동 보상'
    }
  ];

  const fetchFinancialData = async () => {
    try {
      setLoading(true);

      // 실제 환경에서는 이 데이터들을 실제 테이블에서 가져옵니다
      const mockTransactions: PendingTransaction[] = [
        {
          id: '1',
          user_email: 'user1@example.com',
          type: 'refund_request',
          amount: 30000,
          status: 'pending',
          created_at: new Date().toISOString(),
          details: '테스트 결제 취소 요청',
          auto_processable: true
        },
        {
          id: '2',
          user_email: 'user2@example.com',
          type: 'payment_failed',
          amount: 15000,
          status: 'processing',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          details: '카드 한도 초과',
          auto_processable: true
        },
        {
          id: '3',
          user_email: 'user3@example.com',
          type: 'suspicious_activity',
          amount: 100000,
          status: 'pending',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          details: '단시간 다량 구매',
          auto_processable: false
        }
      ];

      const mockStats: FinancialStats = {
        total_revenue_today: 2450000,
        pending_refunds: 5,
        failed_payments: 12,
        auto_processed: 28,
        manual_review_needed: 3
      };

      setPendingTransactions(mockTransactions);
      setFinancialStats(mockStats);
      setAutomationRules(defaultRules);

    } catch (error) {
      console.error('금융 자동화 데이터 로딩 실패:', error);
      toast({
        title: "데이터 로딩 실패",
        description: "금융 자동화 데이터를 불러올 수 없습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRule = async (ruleId: string, updates: Partial<AutomationRule>) => {
    setAutomationRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
    
    toast({
      title: "규칙 업데이트",
      description: "자동화 규칙이 업데이트되었습니다.",
    });
  };

  const processTransaction = async (transactionId: string, action: 'approve' | 'reject') => {
    setPendingTransactions(prev => prev.map(transaction =>
      transaction.id === transactionId 
        ? { ...transaction, status: action === 'approve' ? 'completed' : 'failed' }
        : transaction
    ));

    toast({
      title: action === 'approve' ? "거래 승인" : "거래 거부",
      description: `거래가 ${action === 'approve' ? '승인' : '거부'}되었습니다.`,
    });
  };

  const runBulkProcessing = async () => {
    const autoProcessableCount = pendingTransactions.filter(t => 
      t.auto_processable && t.status === 'pending'
    ).length;

    setPendingTransactions(prev => prev.map(transaction =>
      transaction.auto_processable && transaction.status === 'pending'
        ? { ...transaction, status: 'completed' }
        : transaction
    ));

    toast({
      title: "일괄 처리 완료",
      description: `${autoProcessableCount}건의 거래가 자동 처리되었습니다.`,
    });
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>금융 자동화</CardTitle>
          <CardDescription>결제, 환불, 토큰 관리 자동화</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({length: 4}).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드들 */}
      {financialStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">₩{financialStats.total_revenue_today.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">오늘 매출</p>
                </div>
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{financialStats.pending_refunds}</p>
                  <p className="text-sm text-muted-foreground">대기 환불</p>
                </div>
                <TrendingDown className="h-6 w-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{financialStats.failed_payments}</p>
                  <p className="text-sm text-muted-foreground">결제 실패</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{financialStats.auto_processed}</p>
                  <p className="text-sm text-muted-foreground">자동 처리</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{financialStats.manual_review_needed}</p>
                  <p className="text-sm text-muted-foreground">수동 검토</p>
                </div>
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">대기 거래</TabsTrigger>
          <TabsTrigger value="rules">자동화 규칙</TabsTrigger>
          <TabsTrigger value="analytics">분석</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>대기 중인 거래</CardTitle>
                <CardDescription>수동 처리가 필요한 거래들을 관리합니다</CardDescription>
              </div>
              <Button onClick={runBulkProcessing} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                자동 처리 가능한 거래 일괄 승인
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사용자</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>금액</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>시간</TableHead>
                    <TableHead>자동처리</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.user_email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {transaction.type === 'refund_request' ? '환불요청' :
                           transaction.type === 'payment_failed' ? '결제실패' :
                           transaction.type === 'suspicious_activity' ? '의심거래' : '토큰이상'}
                        </Badge>
                      </TableCell>
                      <TableCell>₩{transaction.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={
                          transaction.status === 'completed' ? 'default' :
                          transaction.status === 'processing' ? 'secondary' :
                          transaction.status === 'failed' ? 'destructive' : 'outline'
                        }>
                          {transaction.status === 'completed' ? '완료' :
                           transaction.status === 'processing' ? '처리중' :
                           transaction.status === 'failed' ? '실패' : '대기'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.created_at).toLocaleString('ko-KR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.auto_processable ? 'default' : 'secondary'}>
                          {transaction.auto_processable ? '가능' : '불가능'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => processTransaction(transaction.id, 'approve')}
                            >
                              승인
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => processTransaction(transaction.id, 'reject')}
                            >
                              거부
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                금융 자동화 규칙
              </CardTitle>
              <CardDescription>
                결제, 환불, 토큰 관리를 위한 자동화 규칙을 설정합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {automationRules.map((rule) => (
                <div key={rule.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{rule.name}</h4>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) => updateRule(rule.id, { enabled: checked })}
                    />
                  </div>

                  {rule.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rule.type === 'refund' && (
                        <>
                          <div>
                            <Label>최대 자동 승인 금액 (원)</Label>
                            <Input
                              type="number"
                              value={rule.conditions.amount_limit}
                              onChange={(e) => updateRule(rule.id, {
                                conditions: { ...rule.conditions, amount_limit: parseInt(e.target.value) }
                              })}
                            />
                          </div>
                          <div>
                            <Label>구매 후 경과일 제한 (일)</Label>
                            <Input
                              type="number"
                              value={rule.conditions.time_since_purchase}
                              onChange={(e) => updateRule(rule.id, {
                                conditions: { ...rule.conditions, time_since_purchase: parseInt(e.target.value) }
                              })}
                            />
                          </div>
                        </>
                      )}

                      {rule.type === 'payment_retry' && (
                        <>
                          <div>
                            <Label>최대 재시도 횟수</Label>
                            <Input
                              type="number"
                              value={rule.conditions.retry_count}
                              onChange={(e) => updateRule(rule.id, {
                                conditions: { ...rule.conditions, retry_count: parseInt(e.target.value) }
                              })}
                            />
                          </div>
                          <div>
                            <Label>재시도 간격 (시간)</Label>
                            <Input
                              type="number"
                              value={rule.conditions.retry_interval}
                              onChange={(e) => updateRule(rule.id, {
                                conditions: { ...rule.conditions, retry_interval: parseInt(e.target.value) }
                              })}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                금융 자동화 분석
              </CardTitle>
              <CardDescription>자동화 성과 및 트렌드를 분석합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>분석 차트가 곧 추가될 예정입니다.</p>
                <p className="text-sm">자동화 효율성과 성과 지표를 시각화하여 제공합니다.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}