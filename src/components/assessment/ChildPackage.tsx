import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Baby, Star, CheckCircle } from 'lucide-react';
import { TOKEN_COSTS } from '@/constants/tokenCosts';

export const ChildPackage = () => {
  const navigate = useNavigate();

  const childTests = [
    {
      id: 1,
      title: '언어발달 검사',
      duration: '15분',
      tokens: 3,
      status: '발달평가',
      statusColor: 'bg-green-500',
      description: '발달단계별 정확한 평가',
      path: '/assessment?type=language'
    },
    {
      id: 2,
      title: '아동 종합발달검사',
      duration: '25분',
      tokens: TOKEN_COSTS.OBSERVATION_ANALYSIS,
      status: '전문평가',
      statusColor: 'bg-blue-500',
      description: '조기개입 필요성 판단',
      path: '/premium-assessment?type=child'
    },
  ];

  const benefits = [
    '발달단계별 정확한 평가',
    '조기개입 필요성 판단',
    '가정에서 할 수 있는 훈련',
    '전문기관 연계 서비스'
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
              <Baby className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              아동 발달 <span className="text-primary">맞춤 패키지</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            언어발달, 사회성, 학습능력에 최적화된 솔루션
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">추천 테스트 코스</h2>
            </div>
            
            <div className="space-y-4">
              {childTests.map((test) => (
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
                              <span className="text-xs">👶</span>
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
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0"
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
                  <p><strong>아이 발달이 걱정된다면:</strong></p>
                  <p>• 언어발달 검사로 시작</p>
                  <p>• 종합발달검사로 정밀평가</p>
                  <p>• 가족케어로 지속관리</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/10 mx-auto mb-3 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs">🏥</span>
                  </div>
                </div>
                <h3 className="font-semibold mb-2">전문기관 연계</h3>
                <p className="text-sm text-muted-foreground">
                  필요시 아동발달센터, 언어치료실 등 전문기관과 연계하여 체계적인 치료를 받으실 수 있습니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};