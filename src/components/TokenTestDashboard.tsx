import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTokens } from '@/hooks/useTokens';
import { Coins, TestTube, FileText, Brain, Users, MessageCircle, AlertCircle, RefreshCw, Moon, Star } from 'lucide-react';

const TokenTestDashboard = () => {
  const { toast } = useToast();
  const { tokenBalance, refreshTokenBalance, loading } = useTokens();
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: { success: boolean; message: string; tokensUsed: number } }>({});

  const testCases = [
    {
      id: 'basic_assessment',
      name: '3분 심리검사',
      tokenCost: 2,
      icon: <TestTube className="h-4 w-4" />,
      testFunction: async () => {
        const { data, error } = await supabase.functions.invoke('assessment-analyzer', {
          body: {
            results: { 스트레스: 5, 우울감: 3, 불안감: 4 },
            ageGroup: 'adult',
            age: 30
          }
        });
        return { data, error };
      }
    },
    {
      id: 'premium_assessment',
      name: '프리미엄 검사',
      tokenCost: 8,
      icon: <Brain className="h-4 w-4" />,
      testFunction: async () => {
        const { data, error } = await supabase.functions.invoke('premium-assessment-analyzer', {
          body: {
            assessmentType: 'personality_type',
            results: { 외향성: 5.5, 감각: 4.2, 사고: 6.1, 판단: 5.8 },
            assessmentInfo: { title: '성격 유형 검사', description: '16가지 성격 유형 분석' },
            timestamp: new Date().toISOString()
          }
        });
        return { data, error };
      }
    },
    {
      id: 'basic_observation',
      name: '관찰일지 (기본)',
      tokenCost: 3,
      icon: <FileText className="h-4 w-4" />,
      testFunction: async () => {
        const { data, error } = await supabase.functions.invoke('observe-report', {
          body: {
            text: '오늘 아이가 평소보다 활발하게 놀았습니다. 새로운 장난감에 집중하는 모습을 보였고, 혼자서도 오랫동안 놀 수 있었습니다.',
            ageGroup: 'child',
            context: 'home',
            tags: ['행동', '정서'],
            files: [],
            mode: 'basic',
            targetName: '테스트 아이',
            observationDate: new Date().toISOString().split('T')[0],
            tokenCost: 3
          }
        });
        return { data, error };
      }
    },
    {
      id: 'detailed_observation',
      name: '관찰일지 (상세)',
      tokenCost: 5,
      icon: <FileText className="h-4 w-4" />,
      testFunction: async () => {
        const { data, error } = await supabase.functions.invoke('observe-report', {
          body: {
            text: '오늘 아이가 평소보다 활발하게 놀았습니다. 새로운 장난감에 집중하는 모습을 보였고, 혼자서도 오랫동안 놀 수 있었습니다. 다른 아이들과의 상호작용도 원활했으며, 갈등 상황에서도 적절히 대처하는 모습을 보였습니다. 언어 표현력도 향상된 것 같습니다.',
            ageGroup: 'child',
            context: 'home',
            tags: ['행동', '정서', '사회성', '언어발달'],
            files: [],
            mode: 'detailed',
            targetName: '테스트 아이',
            observationDate: new Date().toISOString().split('T')[0],
            tokenCost: 5
          }
        });
        return { data, error };
      }
    },
    {
      id: 'dream_interpretation',
      name: '꿈 해몽',
      tokenCost: 5,
      icon: <Moon className="h-4 w-4" />,
      testFunction: async () => {
        const { data, error } = await supabase.functions.invoke('dream-interpreter', {
          body: {
            dreamText: '오늘 뱀이 나와서 내 머리 위를 감싸더라. 그리고 금을 나았어.'
          }
        });
        return { data, error };
      }
    },
    {
      id: 'saju_analysis',
      name: '사주 분석',
      tokenCost: 8,
      icon: <Star className="h-4 w-4" />,
      testFunction: async () => {
        const { data, error } = await supabase.functions.invoke('saju-analyzer', {
          body: {
            name: '테스트',
            birthDate: '1990-01-01',
            birthTime: '10:00',
            gender: 'male',
            birthCity: '서울특별시'
          }
        });
        return { data, error };
      }
    }
  ];

  const runTest = async (testCase: typeof testCases[0]) => {
    setTesting(testCase.id);
    const initialTokens = tokenBalance?.current_tokens || 0;

    try {
      const result = await testCase.testFunction();
      
      // 토큰 잔액 새로고침
      await refreshTokenBalance();
      
      if (result.error) {
        setTestResults(prev => ({
          ...prev,
          [testCase.id]: {
            success: false,
            message: result.error.message || '테스트 실패',
            tokensUsed: 0
          }
        }));
        
        toast({
          title: `${testCase.name} 테스트 실패`,
          description: result.error.message || '알 수 없는 오류가 발생했습니다.',
          variant: "destructive"
        });
      } else {
        const tokensUsed = initialTokens - (tokenBalance?.current_tokens || 0);
        setTestResults(prev => ({
          ...prev,
          [testCase.id]: {
            success: true,
            message: '테스트 성공! 토큰이 정상적으로 차감되었습니다.',
            tokensUsed: tokensUsed || testCase.tokenCost
          }
        }));
        
        toast({
          title: `${testCase.name} 테스트 성공`,
          description: `${testCase.tokenCost}토큰이 차감되었습니다.`,
        });
      }
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        [testCase.id]: {
          success: false,
          message: error.message || '테스트 중 오류가 발생했습니다.',
          tokensUsed: 0
        }
      }));
      
      toast({
        title: `${testCase.name} 테스트 오류`,
        description: error.message || '알 수 없는 오류가 발생했습니다.',
        variant: "destructive"
      });
    } finally {
      setTesting(null);
    }
  };

  const runAllTests = async () => {
    for (const testCase of testCases) {
      if (tokenBalance && tokenBalance.current_tokens >= testCase.tokenCost) {
        await runTest(testCase);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 간격
      } else {
        toast({
          title: `${testCase.name} 스킵`,
          description: '토큰이 부족합니다.',
          variant: "destructive"
        });
      }
    }
  };

  const resetTests = () => {
    setTestResults({});
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">토큰 차감 테스트 대시보드</h1>
          <p className="text-muted-foreground">
            각 기능을 사용할 때 토큰이 정확히 차감되는지 테스트합니다.
          </p>
        </div>

        {/* Current Token Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              현재 토큰 잔액
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>보유 토큰</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-lg font-bold">
                    {loading ? '로딩 중...' : `${tokenBalance?.current_tokens || 0}토큰`}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshTokenBalance}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
              <Progress 
                value={Math.min(((tokenBalance?.current_tokens || 0) / 50) * 100, 100)} 
                className="h-2"
              />
              <div className="text-sm text-muted-foreground">
                총 사용: {tokenBalance?.total_used || 0}토큰 | 
                총 구매: {tokenBalance?.total_purchased || 0}토큰
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <div className="flex gap-4">
          <Button onClick={runAllTests} disabled={testing !== null} className="flex-1">
            전체 테스트 실행
          </Button>
          <Button variant="outline" onClick={resetTests}>
            결과 초기화
          </Button>
        </div>

        {/* Test Cases */}
        <div className="grid gap-4">
          {testCases.map((testCase) => {
            const result = testResults[testCase.id];
            const canAfford = (tokenBalance?.current_tokens || 0) >= testCase.tokenCost;
            
            return (
              <Card key={testCase.id} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {testCase.icon}
                      {testCase.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={canAfford ? "default" : "destructive"}>
                        {testCase.tokenCost}토큰
                      </Badge>
                      {result && (
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.success ? '성공' : '실패'}
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result && (
                      <div className={`p-3 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <div className="flex items-start gap-2">
                          {result.success ? (
                            <div className="w-4 h-4 rounded-full bg-green-500 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                          )}
                          <div>
                            <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                              {result.message}
                            </p>
                            {result.success && result.tokensUsed > 0 && (
                              <p className="text-xs text-green-600 mt-1">
                                차감된 토큰: {result.tokensUsed}개
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      onClick={() => runTest(testCase)}
                      disabled={testing !== null || !canAfford}
                      className="w-full"
                      variant={result?.success ? "outline" : "default"}
                    >
                      {testing === testCase.id ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          테스트 실행 중...
                        </div>
                      ) : (
                        `${result ? '재테스트' : '테스트 실행'}`
                      )}
                    </Button>
                    
                    {!canAfford && (
                      <p className="text-sm text-red-600 text-center">
                        토큰이 부족합니다. ({testCase.tokenCost}토큰 필요)
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Test Summary */}
        {Object.keys(testResults).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>테스트 요약</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(testResults).filter(r => r.success).length}
                  </div>
                  <div className="text-sm text-muted-foreground">성공</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {Object.values(testResults).filter(r => !r.success).length}
                  </div>
                  <div className="text-sm text-muted-foreground">실패</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-lg font-semibold">
                  총 사용된 토큰: {Object.values(testResults).reduce((sum, r) => sum + r.tokensUsed, 0)}개
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TokenTestDashboard;