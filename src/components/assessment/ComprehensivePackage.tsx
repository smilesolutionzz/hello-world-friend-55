import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Crown, Star, CheckCircle } from 'lucide-react';
import { TOKEN_COSTS } from '@/constants/tokenCosts';

export const ComprehensivePackage = () => {
  const navigate = useNavigate();

  const comprehensiveTests = [
    {
      id: 1,
      title: '프리미엄 종합검사',
      duration: '30분',
      tokens: TOKEN_COSTS.OBSERVATION_ANALYSIS,
      status: '최고급',
      statusColor: 'bg-purple-500',
      description: '15개 영역 종합 분석',
      path: '/premium-assessment'
    },
    {
      id: 2,
      title: '성격유형 분석',
      duration: '20분',
      tokens: 0,
      status: '성격분석',
      statusColor: 'bg-violet-500',
      description: '개인 맞춤 개선 계획',
      path: '/premium-assessment?type=personality'
    },
    {
      id: 3,
      title: 'AIH박사급리포팅',
      duration: '15페이지이상',
      tokens: 50,
      status: '프리미엄',
      statusColor: 'bg-amber-500',
      description: '3개월 추적 관리 서비스',
      path: '/expert-list?type=report'
    }
  ];

  const benefits = [
    '15개 영역 종합 분석',
    '개인 맞춤 개선 계획',
    '전문가급 상세 리포트',
    '3개월 추적 관리 서비스'
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
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              종합 분석 <span className="text-primary">맞춤 패키지</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            전반적인 통합건강 상태 점검에 최적화된 솔루션
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">추천 테스트 코스</h2>
            </div>
            
            <div className="space-y-4">
              {comprehensiveTests.map((test) => (
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
                              <span className="text-xs">👑</span>
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
                          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0"
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
                  <p><strong>전반적인 체크가 필요하다면:</strong></p>
                  <p>• 프리미엄 종합검사로 시작</p>
                  <p>• 성격유형 분석으로 심화</p>
                  <p>• 박사급 리포팅으로 완료</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/10 mx-auto mb-3 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs">📊</span>
                  </div>
                </div>
                <h3 className="font-semibold mb-2">박사급 분석</h3>
                <p className="text-sm text-muted-foreground">
                  AI와 전문가가 협업하여 박사 수준의 상세한 분석 리포트를 제공합니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};