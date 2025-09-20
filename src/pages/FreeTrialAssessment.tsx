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
    {
      id: 'personality-simple',
      title: '간단 성격유형 테스트',
      subtitle: '나는 어떤 성격일까요?',
      description: '외향성, 내향성, 감정 표현 방식 등 기본적인 성격 특성을 알아볼 수 있습니다.',
      duration: '5-7분',
      questions: 25,
      icon: Target,
      gradient: 'from-green-500 to-teal-600',
      badge: '신규',
      route: '/assessment/personality-love-test'
    }
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4 max-w-2xl mx-auto">
            <div className="flex items-start gap-2">
              <div className="text-lg">💡</div>
              <div className="text-sm text-yellow-800">
                <p className="font-bold mb-1">무료 vs 구독 해석 차이점:</p>
                <div className="grid md:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/50 rounded p-2">
                    <p className="font-medium text-gray-600">🆓 무료 해석</p>
                    <p>• 일반적인 기본 해석</p>
                    <p>• 단순한 결과 제공</p>
                  </div>
                  <div className="bg-white/50 rounded p-2">
                    <p className="font-medium text-blue-600">💎 구독자 해석</p>
                    <p>• AI 초정밀 분석</p>
                    <p>• 전문가급 상세 해석</p>
                  </div>
                </div>
              </div>
            </div>
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

                    {/* 해석 레벨 안내 */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="text-xs text-gray-600">
                        <p className="font-medium mb-1">📄 일반 해석만 제공</p>
                        <p>기본적인 분석 결과를 확인하실 수 있습니다</p>
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
          <h3 className="text-2xl font-bold mb-4">AI 초정밀 전문가급 해석이 필요하시다면?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            구독하시면 <strong className="text-primary">AI 초정밀 분석 + 전문가급 상세 해석</strong>을 받으실 수 있습니다.
            무료 해석과는 완전히 다른 퀄리티의 분석 결과를 경험해보세요.
          </p>
          
          {/* 차별화 포인트 강조 */}
          <div className="bg-white/70 rounded-xl p-4 mb-6 max-w-3xl mx-auto">
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <h4 className="font-bold text-gray-600 flex items-center gap-2">
                  🆓 무료 해석 (현재)
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 기본적인 일반 해석</li>
                  <li>• 단순한 결과 요약</li>
                  <li>• 표면적 분석</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-blue-600 flex items-center gap-2">
                  💎 구독자 해석 (업그레이드)
                </h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• <strong>AI 초정밀 3중 분석</strong></li>
                  <li>• <strong>전문가급 상세 해석</strong></li>
                  <li>• <strong>개인 맞춤 개선안</strong></li>
                  <li>• <strong>심층 심리 패턴 분석</strong></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button 
              onClick={() => navigate('/token-subscription')}
              className="flex-1 bg-gradient-to-r from-primary to-primary-glow text-white"
              size="lg"
            >
              🚀 AI 초정밀 해석 받기
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