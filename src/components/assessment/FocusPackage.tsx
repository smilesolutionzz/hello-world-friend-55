import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Star, CheckCircle, Home } from 'lucide-react';
import { TOKEN_COSTS } from '@/constants/tokenCosts';

export const FocusPackage = () => {
  const navigate = useNavigate();

  const focusTests = [
    {
      id: 1,
      title: '주의집중력 자가체크',
      duration: '8분',
      tokens: 2,
      status: 'ADHD체크',
      statusColor: 'bg-orange-500',
      description: 'ADHD 증상 및 집중력 수준 측정',
      path: '/assessment?type=adhd'
    },
    {
      id: 2,
      title: '5차원 성격 분석',
      duration: '5분',
      tokens: 2,
      status: '🔥 1위',
      statusColor: 'bg-red-500',
      description: '집중력에 영향하는 성격 특성 분석',
      path: '/assessment?test=bigfive'
    },
    {
      id: 3,
      title: '마음압박지수 측정',
      duration: '3분',
      tokens: 2,
      status: '🔥 3위',
      statusColor: 'bg-yellow-500',
      description: '집중 방해 요소인 스트레스 측정',
      path: '/assessment?test=stress'
    },
    {
      id: 4,
      title: 'AI 집중력 코칭',
      duration: '30분',
      tokens: 0,
      status: '맞춤코칭',
      statusColor: 'bg-green-500',
      description: '개인별 집중력 향상 전략 제공',
      path: '/ai-counselor?mode=focus'
    }
  ];

  const benefits = [
    'ADHD 증상 조기 발견',
    '집중력 방해 요소 파악',
    '성격별 맞춤 학습법 제공',
    '일상 집중력 향상 전략',
    '전문가 연계 상담 지원'
  ];

  const handleStartTest = (testPath: string) => {
    navigate(testPath);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Home CTA Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm border border-gray-200 hover:bg-white shadow-lg"
        >
          <Home className="w-4 h-4 mr-2" />
          홈으로
        </Button>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              집중력 문제 <span className="text-primary">맞춤 패키지</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            ADHD, 주의산만, 과잉행동에 최적화된 솔루션
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">추천 테스트 코스</h2>
            </div>
            
            <div className="space-y-4">
              {focusTests.map((test) => (
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
                              <span className="text-primary font-medium">{test.tokens}토큰</span>
                              <span className="text-xs">🎯</span>
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
                          className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white border-0"
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
                  <p><strong>집중력 문제가 있다면:</strong></p>
                  <p>• ADHD 자가진단으로 시작</p>
                  <p>• 종합평가로 정밀진단</p>
                  <p>• 행동일지로 지속관리</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/10 mx-auto mb-3 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs">👨‍👩‍👧‍👦</span>
                  </div>
                </div>
                <h3 className="font-semibold mb-2">가족 지원</h3>
                <p className="text-sm text-muted-foreground">
                  ADHD는 가족 전체의 이해와 지원이 중요합니다. 가족케어 서비스도 함께 이용하세요.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};