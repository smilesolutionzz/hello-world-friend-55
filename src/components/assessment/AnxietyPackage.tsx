import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Shield, Star, CheckCircle } from 'lucide-react';
import { TOKEN_COSTS } from '@/constants/tokenCosts';

export const AnxietyPackage = () => {
  const navigate = useNavigate();

  const anxietyTests = [
    {
      id: 1,
      title: '불안장애 검사',
      duration: '8분',
      tokens: TOKEN_COSTS.PSYCHOLOGICAL_TEST,
      status: '필수검사',
      statusColor: 'bg-orange-500',
      description: '불안 유형별 정확한 진단',
      path: '/assessment?type=panic'
    },
    {
      id: 2,
      title: '불안증 종합분석',
      duration: '20분',
      tokens: TOKEN_COSTS.OBSERVATION_ANALYSIS,
      status: '정밀분석',
      statusColor: 'bg-purple-500',
      description: '공황발작 대처 방법',
      path: '/premium-assessment?type=anxiety'
    },
    {
      id: 3,
      title: 'AI 즉시 지원',
      duration: '즉시',
      tokens: 0,
      status: '응급지원',
      statusColor: 'bg-red-600',
      description: '24시간 위기개입 지원',
      path: '/ai-counselor?mode=crisis'
    }
  ];

  const benefits = [
    '불안 유형별 정확한 진단',
    '공황발작 대처 방법',
    '즉시 안정화 기법 제공',
    '24시간 위기개입 지원'
  ];

  const handleStartTest = (testPath: string) => {
    navigate(testPath);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              불안·걱정 관리 <span className="text-primary">맞춤 패키지</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            불안감, 공황, 사회불안에 최적화된 솔루션
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">추천 테스트 코스</h2>
            </div>
            
            <div className="space-y-4">
              {anxietyTests.map((test) => (
                <Card key={test.id} className="relative overflow-hidden border-border/50 hover:border-primary/20 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                          {test.id}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-foreground mb-1">
                            {test.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {test.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              {test.tokens > 0 ? (
                                <span className="text-primary font-medium">{test.tokens}토큰</span>
                              ) : (
                                <span className="text-green-500 font-medium">무료</span>
                              )}
                              <span className="text-xs">🛡️</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge 
                          className={`${test.statusColor} text-white border-0`}
                        >
                          {test.status}
                        </Badge>
                        <Button 
                          onClick={() => handleStartTest(test.path)}
                          className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white border-0"
                        >
                          시작하기
                          <span className="ml-1">→</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-semibold">이런 효과를 기대할 수 있어요</h3>
                </div>
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-full bg-yellow-500/10">
                    <Star className="w-4 h-4 text-yellow-500" />
                  </div>
                  <h3 className="font-semibold">추천 순서</h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>불안이 심하다면:</strong></p>
                  <p>• 불안장애 검사로 시작</p>
                  <p>• 종합분석으로 심화진단</p>
                  <p>• 응급시 즉시 AI 지원</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/10 mx-auto mb-3 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs">🆘</span>
                  </div>
                </div>
                <h3 className="font-semibold mb-2">응급 지원</h3>
                <p className="text-sm text-muted-foreground">
                  공황발작이나 심한 불안 상황에서 즉시 AI 상담을 통해 응급 지원을 받으실 수 있습니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};