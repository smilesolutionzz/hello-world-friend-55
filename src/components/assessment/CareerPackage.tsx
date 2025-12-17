import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Briefcase, Star, CheckCircle, Target, TrendingUp, Home } from 'lucide-react';
import { TOKEN_COSTS } from '@/constants/tokenCosts';

export const CareerPackage = () => {
  const navigate = useNavigate();

  const careerTests = [
    {
      id: 1,
      title: '진로흥미 탐색',
      duration: '6분',
      tokens: 2,
      status: '📈 4위',
      statusColor: 'bg-blue-500',
      description: '나에게 맞는 직업과 분야 탐색',
      path: '/assessment?test=career'
    },
    {
      id: 2,
      title: '5차원 성격 분석',
      duration: '5분',
      tokens: 2,
      status: '🔥 1위',
      statusColor: 'bg-red-500',
      description: '직업 적성과 연결되는 성격 특성',
      path: '/assessment?test=bigfive'
    },
    {
      id: 3,
      title: '자아가치 측정',
      duration: '4분',
      tokens: 2,
      status: '⭐ 추천',
      statusColor: 'bg-purple-500',
      description: '커리어 자신감과 성취 동기 분석',
      path: '/assessment?test=selfesteem'
    },
    {
      id: 4,
      title: '마음압박지수 측정',
      duration: '3분',
      tokens: 2,
      status: '직장인',
      statusColor: 'bg-orange-500',
      description: '업무 스트레스와 번아웃 수준 체크',
      path: '/assessment?test=stress'
    },
    {
      id: 5,
      title: 'AI 커리어 코칭',
      duration: '30분',
      tokens: 0,
      status: '맞춤코칭',
      statusColor: 'bg-green-500',
      description: '개인별 커리어 발전 전략 제공',
      path: '/ai-counselor?mode=career'
    }
  ];

  const benefits = [
    '객관적인 적성과 흥미 파악',
    '성격 기반 직업 추천',
    '커리어 자신감 향상 방법',
    '업무 스트레스 관리법',
    '전문 커리어 상담사 연계'
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
            <div className="p-3 rounded-full bg-blue-500/10">
              <Briefcase className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              진로/적성 <span className="text-blue-500">전문 패키지</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            진로탐색, 적성발견, 커리어개발에 특화된 종합 솔루션
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">추천 테스트 코스</h2>
            </div>
            
            <div className="space-y-4">
              {careerTests.map((test) => (
                <Card key={test.id} className="relative overflow-hidden border-border/50 hover:border-primary/20 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 font-semibold">
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
                                <span className="text-primary font-medium">{(test.tokens * 100).toLocaleString()}캐시</span>
                              ) : (
                                <span className="text-green-500 font-medium">무료</span>
                              )}
                              <span className="text-xs">💼</span>
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
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0"
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

            <Card className="border-border/50 bg-gradient-to-br from-blue-500/5 to-indigo-500/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-full bg-blue-500/10">
                    <Target className="w-4 h-4 text-blue-500" />
                  </div>
                  <h3 className="font-semibold">이런 분께 추천</h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• 진로를 고민하는 청소년/대학생</p>
                  <p>• 직업을 바꾸고 싶은 직장인</p>
                  <p>• 적성에 맞는 일을 찾고 싶은 분</p>
                  <p>• 커리어 방향성을 찾고 싶은 분</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 mx-auto mb-3 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">전문가 상담</h3>
                <p className="text-sm text-muted-foreground">
                  커리어 상담사, 진로 전문가와 연계하여 구체적인 진로 설계와 취업 전략을 제공합니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};