import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Clock, Brain, Heart, Target, Gift, Crown, Lock } from 'lucide-react';

const FreeTrialAssessment = () => {
  const navigate = useNavigate();
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  // 무료 체험 테스트들
  const freeTests = [
    {
      id: 'basic-mental-health',
      title: '기본 심리상태 체크',
      subtitle: '현재 마음 상태를 간단히 확인해보세요',
      description: '스트레스, 기분, 수면 등 기본적인 심리상태를 5분 안에 체크할 수 있습니다.',
      duration: '3-5분',
      questions: 15,
      icon: Brain,
      gradient: 'from-blue-500 to-purple-600',
      badge: '인기',
      route: '/assessment/mental-health-quick-test'
    },
    {
      id: 'stress-check',
      title: '스트레스 자가진단',
      subtitle: '일상의 스트레스 수준을 측정해보세요',
      description: '직장, 학업, 인간관계 등에서 받는 스트레스 정도를 객관적으로 파악할 수 있습니다.',
      duration: '4-6분',
      questions: 20,
      icon: Heart,
      gradient: 'from-red-500 to-pink-600',
      badge: '추천',
      route: '/assessment/stress-test'
    },
  ];

  // 토큰이 필요한 프리미엄 테스트들 (차단됨)
  const premiumTests = [
    {
      id: 'comprehensive',
      title: '종합 심리분석',
      description: '전문가 수준의 상세한 심리분석',
      tokens: 8,
      locked: true
    },
    {
      id: 'adhd-screening',
      title: 'ADHD 정밀검사',
      description: '주의력결핍 과잉행동장애 심층분석',
      tokens: 12,
      locked: true
    },
    {
      id: 'depression-anxiety',
      title: '우울·불안 전문검사',
      description: '임상급 우울증·불안장애 진단',
      tokens: 10,
      locked: true
    }
  ];

  const handleTestStart = (testId: string, route: string) => {
    setSelectedTest(testId);
    // 실제 테스트 라우트로 이동
    navigate(route);
  };

  const handleSignUp = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-brand-gradient">무료 체험 테스트</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            회원가입 없이 3가지 기본 테스트를 무료로 체험해보세요
          </p>
          <div className="bg-primary/10 rounded-lg p-3 mt-4 max-w-md mx-auto">
            <p className="text-sm text-primary font-medium">
              💡 더 정확한 분석이 필요하다면 회원가입 후 프리미엄 테스트를 이용하세요
            </p>
          </div>
        </div>

        {/* 무료 테스트 섹션 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">FREE</span>
            </div>
            무료 체험 테스트
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {freeTests.map((test) => {
              const IconComponent = test.icon;
              return (
                <Card key={test.id} className="relative overflow-hidden hover-glow transition-all duration-300 hover:scale-[1.02] border-primary/20">
                  {/* 무료 배지 */}
                  <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-green-500 text-white text-xs px-2 py-1">
                      {test.badge}
                    </Badge>
                  </div>

                  {/* Header */}
                  <div className={`bg-gradient-to-r ${test.gradient} p-6 pr-16 text-white relative`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold">{test.title}</CardTitle>
                          <p className="text-sm opacity-90">{test.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {test.description}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {test.duration}
                      </div>
                      <div className="text-muted-foreground">
                        {test.questions}개 문항
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleTestStart(test.id, test.route)}
                      className={`w-full bg-gradient-to-r ${test.gradient} hover:opacity-90`}
                    >
                      무료 체험 시작
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 프리미엄 테스트 섹션 (차단됨) */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Crown className="w-8 h-8 text-yellow-500" />
            프리미엄 테스트 (회원가입 필요)
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {premiumTests.map((test) => (
              <Card key={test.id} className="relative overflow-hidden opacity-60 border-muted">
                {/* 잠금 배지 */}
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-gray-500 text-white text-xs px-2 py-1">
                    <Lock className="w-2.5 h-2.5 mr-1" />
                    {test.tokens}토큰
                  </Badge>
                </div>

                <CardContent className="p-6 space-y-4">
                  <div className="text-center space-y-2">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto" />
                    <h3 className="text-lg font-bold text-gray-600">{test.title}</h3>
                    <p className="text-sm text-gray-500">{test.description}</p>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-dashed border-gray-300 text-gray-500"
                    disabled
                  >
                    회원가입 후 이용 가능
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="bg-gradient-to-br from-primary/10 via-white/90 to-secondary/10 rounded-2xl p-8 text-center">
          <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">더 정확한 분석이 필요하시다면?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            회원가입하시면 10개 토큰 무료 지급 + 매일 3개 토큰 추가 지급으로 
            더 전문적이고 상세한 심리분석을 받으실 수 있습니다.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button 
              onClick={handleSignUp}
              className="flex-1 bg-gradient-to-r from-primary to-primary-glow text-white"
              size="lg"
            >
              회원가입 (10토큰 무료)
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1"
              size="lg"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeTrialAssessment;