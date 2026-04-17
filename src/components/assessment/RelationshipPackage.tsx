import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Heart, Star, CheckCircle, Users, Home } from 'lucide-react';
import { TOKEN_COSTS } from '@/constants/tokenCosts';

export const RelationshipPackage = () => {
  const navigate = useNavigate();

  const relationshipTests = [
    {
      id: 1,
      title: '관계 스타일 진단',
      duration: '5분',
      tokens: 2,
      status: '🔥 NEW',
      statusColor: 'bg-red-500',
      description: '나의 인간관계 패턴과 소통 방식 분석',
      path: '/assessment/relationship-style-test'
    },
    {
      id: 2,
      title: '애착 유형 검사',
      duration: '4분',
      tokens: 2,
      status: '🔥 2위',
      statusColor: 'bg-orange-500',
      description: '어린 시절 형성된 애착 패턴 분석',
      path: '/assessment?test=attachment'
    },
    {
      id: 3,
      title: '소통 스타일 진단',
      duration: '4분',
      tokens: 2,
      status: '⭐ 추천',
      statusColor: 'bg-blue-500',
      description: '의사소통 방식과 갈등 해결 패턴 파악',
      path: '/assessment/communication-style-test'
    },
    {
      id: 4,
      title: '자아가치 측정',
      duration: '4분',
      tokens: 2,
      status: '기본',
      statusColor: 'bg-purple-500',
      description: '건강한 관계의 기초인 자존감 측정',
      path: '/assessment?test=selfesteem'
    },
    {
      id: 5,
      title: '5차원 성격 분석',
      duration: '5분',
      tokens: 2,
      status: '상세분석',
      statusColor: 'bg-green-500',
      description: '관계에서 나타나는 성격 특성 파악',
      path: '/assessment?test=bigfive'
    },
    {
      id: 6,
      title: 'AI 관계 코칭',
      duration: '30분',
      tokens: 0,
      status: '맞춤코칭',
      statusColor: 'bg-emerald-500',
      description: '개인별 관계 개선 전략 제공',
      path: '/ai-counselor?mode=relationship'
    }
  ];

  const benefits = [
    '나의 관계 패턴 정확한 진단',
    '건강한 관계 형성 가이드',
    '자존감 향상 맞춤 솔루션',
    '갈등 해결 구체적 방법',
    '연애/결혼 상담 전문가 연계'
  ];

  const handleStartTest = (testPath: string) => {
    navigate(testPath);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
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
            <div className="p-3 rounded-full bg-pink-500/10">
              <Heart className="w-8 h-8 text-pink-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              연애/관계 <span className="text-pink-500">전문 패키지</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            인간관계, 연애, 자존감, 소통에 특화된 종합 솔루션
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">추천 테스트 코스</h2>
            </div>
            
            <div className="space-y-4">
              {relationshipTests.map((test) => (
                <Card key={test.id} className="relative overflow-hidden border-border/50 hover:border-primary/20 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-500/10 text-pink-500 font-semibold">
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
                              <span className="text-xs">💖</span>
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
                          className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white border-0"
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

            <Card className="border-border/50 bg-gradient-to-br from-pink-500/5 to-rose-500/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-full bg-pink-500/10">
                    <Heart className="w-4 h-4 text-pink-500" />
                  </div>
                  <h3 className="font-semibold">이런 분께 추천</h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• 연애/결혼 관계에서 어려움을 겪는 분</p>
                  <p>• 인간관계가 항상 힘든 분</p>
                  <p>• 자존감이 낮아 관계가 어려운 분</p>
                  <p>• 소통과 갈등 해결이 어려운 분</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-pink-500/10 mx-auto mb-3 flex items-center justify-center">
                  <Users className="w-6 h-6 text-pink-500" />
                </div>
                <h3 className="font-semibold mb-2">전문가 상담</h3>
                <p className="text-sm text-muted-foreground">
                  관계 전문 상담사, 부부상담사, 연애코치 등과 연계하여 실질적인 관계 개선을 도와드립니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};