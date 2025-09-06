import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useTokens } from '@/hooks/useTokens';
import { supabase } from '@/integrations/supabase/client';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Coins, RefreshCw, AlertTriangle, CheckCircle, XCircle, Database, Activity } from 'lucide-react';

const TokenTestDashboard = () => {
  const { user } = useAuthGuard();
  const { balance, loading, fetchBalance, consumeTokens, checkTokenAvailability } = useTokens();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [dbTokenState, setDbTokenState] = useState<any>(null);

  // 데이터베이스에서 직접 토큰 상태 조회
  const fetchDirectTokenState = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      setDbTokenState(data);
    } catch (error) {
      console.error('Direct DB query failed:', error);
    }
  };

  // 토큰 시스템 종합 테스트
  const runComprehensiveTest = async () => {
    if (!user || !balance) return;
    
    setIsRunningTests(true);
    const results: any[] = [];
    
    try {
      // 테스트 1: 토큰 잔액 일치성 검사
      await fetchDirectTokenState();
      const balanceMatch = balance.current_tokens === dbTokenState?.current_tokens;
      results.push({
        test: 'Balance Consistency',
        passed: balanceMatch,
        message: balanceMatch 
          ? `Hook balance (${balance.current_tokens}) matches DB (${dbTokenState?.current_tokens})`
          : `Hook balance (${balance.current_tokens}) != DB (${dbTokenState?.current_tokens})`,
        severity: balanceMatch ? 'success' : 'error'
      });

      // 테스트 2: 토큰 가용성 검사
      const hasTokens = checkTokenAvailability(1);
      const shouldHaveTokens = balance.current_tokens > 0;
      const availabilityTest = hasTokens === shouldHaveTokens;
      results.push({
        test: 'Token Availability Check',
        passed: availabilityTest,
        message: availabilityTest 
          ? 'Token availability check is working correctly'
          : `Availability check failed: has=${hasTokens}, should=${shouldHaveTokens}`,
        severity: availabilityTest ? 'success' : 'error'
      });

      // 테스트 3: 토큰 소모 테스트 (실제로는 수행하지 않고 시뮬레이션)
      const initialTokens = balance.current_tokens;
      if (initialTokens >= 1) {
        const canConsume = checkTokenAvailability(1);
        results.push({
          test: 'Token Consumption Simulation',
          passed: canConsume,
          message: canConsume 
            ? 'Ready to consume 1 token'
            : 'Cannot consume token - insufficient balance',
          severity: canConsume ? 'success' : 'warning'
        });
      }

      // 테스트 4: 실시간 업데이트 테스트
      const beforeRefresh = balance.current_tokens;
      await fetchBalance();
      const afterRefresh = balance.current_tokens;
      const refreshTest = beforeRefresh === afterRefresh;
      results.push({
        test: 'Real-time Update Test',
        passed: refreshTest,
        message: refreshTest 
          ? 'Token balance remained consistent after refresh'
          : `Balance changed during refresh: ${beforeRefresh} -> ${afterRefresh}`,
        severity: refreshTest ? 'success' : 'warning'
      });

      // 테스트 5: 데이터베이스 연결성 테스트
      try {
        const { data, error } = await supabase
          .from('usage_tracking')
          .select('count(*)')
          .eq('user_id', user.id)
          .limit(1);
        
        results.push({
          test: 'Database Connectivity',
          passed: !error,
          message: error ? `DB Error: ${error.message}` : 'Database connection is healthy',
          severity: error ? 'error' : 'success'
        });
      } catch (error: any) {
        results.push({
          test: 'Database Connectivity',
          passed: false,
          message: `DB Connection failed: ${error.message}`,
          severity: 'error'
        });
      }

    } catch (error: any) {
      results.push({
        test: 'Test Suite Execution',
        passed: false,
        message: `Test suite failed: ${error.message}`,
        severity: 'error'
      });
    }

    setTestResults(results);
    setIsRunningTests(false);
  };

  useEffect(() => {
    if (user) {
      fetchDirectTokenState();
    }
  }, [user, balance]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (severity: string) => {
    switch (severity) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            토큰 시스템 안정성 테스트
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 현재 상태 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Hook State
              </h3>
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Current Tokens:</span>
                  <Badge variant="secondary">{balance?.current_tokens || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Purchased:</span>
                  <span className="text-sm">{balance?.total_purchased || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Used:</span>
                  <span className="text-sm">{balance?.total_used || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Database className="w-4 h-4" />
                Database State
              </h3>
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Current Tokens:</span>
                  <Badge variant="secondary">{dbTokenState?.current_tokens || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Purchased:</span>
                  <span className="text-sm">{dbTokenState?.total_purchased || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Last Updated:</span>
                  <span className="text-xs text-muted-foreground">
                    {dbTokenState?.updated_at ? new Date(dbTokenState.updated_at).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 테스트 실행 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">토큰 시스템 종합 테스트</h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchDirectTokenState}
                  disabled={isRunningTests}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  상태 새로고침
                </Button>
                <Button 
                  onClick={runComprehensiveTest}
                  disabled={isRunningTests}
                >
                  {isRunningTests ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Activity className="w-4 h-4 mr-2" />
                  )}
                  테스트 실행
                </Button>
              </div>
            </div>

            {/* 테스트 결과 */}
            {testResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">테스트 결과:</h4>
                {testResults.map((result, index) => (
                  <Alert key={index} className={`
                    ${result.severity === 'success' ? 'border-green-200 bg-green-50' : ''}
                    ${result.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' : ''}
                    ${result.severity === 'error' ? 'border-red-200 bg-red-50' : ''}
                  `}>
                    <div className="flex items-start gap-2">
                      {getStatusIcon(result.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{result.test}</span>
                          <Badge 
                            variant={result.passed ? "default" : "destructive"}
                            className="h-5"
                          >
                            {result.passed ? "PASS" : "FAIL"}
                          </Badge>
                        </div>
                        <AlertDescription className="mt-1 text-xs">
                          {result.message}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            )}
          </div>

          {/* 일치성 경고 */}
          {balance && dbTokenState && balance.current_tokens !== dbTokenState.current_tokens && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>토큰 불일치 감지!</strong><br />
                Hook 상태 ({balance.current_tokens})와 데이터베이스 상태 ({dbTokenState.current_tokens})가 일치하지 않습니다.
                이는 토큰 시스템의 불안정성을 나타낼 수 있습니다.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenTestDashboard;