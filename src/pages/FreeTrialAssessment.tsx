import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Clock, Brain, Heart, Target, Gift, Crown, Lock, ImageIcon, ArrowLeft } from 'lucide-react';
import { VisualCounselingUpload } from '@/components/ai-analysis/VisualCounselingUpload';

const FreeTrialAssessment = () => {
  const navigate = useNavigate();
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [showVisualAnalysis, setShowVisualAnalysis] = useState(false);

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
    },
    {
      id: 'past-life-job',
      title: '내 전생은 어떤 직업?',
      subtitle: '재미있는 AI 분석으로 알아보는 전생',
      description: '답변을 토대로 AI가 분석하는 나의 전생 직업과 그 시대의 이야기를 들어보세요.',
      duration: '3-5분',
      questions: 12,
      icon: Crown,
      gradient: 'from-amber-500 to-orange-600',
      badge: '인기',
      route: '/assessment/past-life-job-test'
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

  // 시각 자료 분석 화면
  if (showVisualAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-100 to-pink-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => setShowVisualAnalysis(false)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>
          <VisualCounselingUpload />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-100 to-pink-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Gradient Orbs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/40 to-purple-500/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-gradient-to-bl from-purple-400/40 to-pink-500/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
        <div className="absolute -bottom-32 left-1/4 w-[450px] h-[450px] bg-gradient-to-tr from-pink-400/40 to-orange-400/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
        
        {/* Moving Light Rays */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        
        {/* Decorative Circles */}
        <div className="absolute top-40 left-1/2 w-64 h-64 border-2 border-purple-300/30 rounded-full"></div>
        <div className="absolute bottom-40 right-1/3 w-80 h-80 border-2 border-blue-300/30 rounded-full"></div>
      </div>
      
      <div className="container mx-auto max-w-6xl p-4 relative z-10">
        {/* Hero Section */}
        <section className="pt-16 pb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full mb-6 shadow-lg">
              <Gift className="w-6 h-6" />
              <h1 className="text-2xl font-bold">무료 체험 테스트</h1>
            </div>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
              회원가입 없이 3가지 기본 테스트를 무료로 체험해보세요
            </p>
            
            {/* Value Proposition Card */}
            <div className="relative overflow-hidden rounded-2xl p-8 mt-6 max-w-4xl mx-auto bg-white shadow-2xl border-2 border-purple-200">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50"></div>
              
              <div className="relative z-10">
                <div className="flex items-start gap-3 mb-6">
                  <div className="text-3xl">💎</div>
                  <div>
                    <h3 className="font-bold text-2xl mb-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
                      무료 vs 구독 해석 차이점
                    </h3>
                    <p className="text-gray-600">지금 바로 체험해보고 차이를 느껴보세요</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="p-6 rounded-xl bg-white border-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                        FREE
                      </div>
                      <h4 className="font-bold text-lg text-gray-700">무료 해석</h4>
                    </div>
                    <ul className="text-gray-600 space-y-3">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        기본적인 점수 분석
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        일반적인 결과 요약
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        표면적 분석
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-purple-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          PRO
                        </div>
                        <h4 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">구독자 해석</h4>
                      </div>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                          <span className="font-semibold text-blue-700">AI 초정밀 분석 (2000자+)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                          <span className="font-semibold text-purple-700">전문가급 상세 해석</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full"></div>
                          <span className="font-semibold text-pink-700">개인 맞춤 개선안</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                          <span className="font-semibold text-blue-700">심층 심리 패턴 분석</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl">
                  <p className="text-sm text-amber-900 text-center font-medium">
                    ✨ <strong>지금 회원가입하면</strong> 무료 테스트도 <strong className="text-amber-950">AI 초정밀 해석</strong>으로 업그레이드!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 무료 테스트 섹션 */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-gray-900">무료 체험 테스트</h2>
            <p className="text-gray-600">회원가입 없이 바로 시작하세요</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {freeTests.map((test) => {
              const IconComponent = test.icon;
              return (
                <Card key={test.id} className="relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-2 border-gray-200 bg-white">
                  {/* 무료 배지 */}
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-green-500 text-white font-bold px-3 py-1.5">
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
                        <p className="font-medium mb-1">📊 기본 점수분석 제공</p>
                        <p>회원가입시 <strong className="text-blue-600">2000자+ AI 전문가급 해석</strong> 받기</p>
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
            
            {/* 시각 자료 AI 분석 카드 */}
            <Card 
              className="relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-2 border-purple-200 bg-white cursor-pointer"
              onClick={() => setShowVisualAnalysis(true)}
            >
              <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-purple-500 text-white font-bold px-3 py-1.5">
                  AI 분석
                </Badge>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 pr-16 text-white relative">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">시각 자료 AI 분석</CardTitle>
                      <p className="text-sm opacity-90">Visual Material Analysis</p>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  사진, 일러스트 등 시각 자료를 AI가 상담 관점에서 분석합니다
                </p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    3-5분
                  </div>
                  <div className="text-muted-foreground">
                    이미지 업로드
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="text-xs text-purple-600">
                    <p className="font-medium mb-1">🤖 AI 분석 내용</p>
                    <p>감정적 지표, 심리학적 인사이트, 상담 포인트 제공</p>
                  </div>
                </div>

                <Button 
                  onClick={() => setShowVisualAnalysis(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90"
                >
                  AI 분석 시작
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 프리미엄 테스트 섹션 (차단됨) */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-gray-900 flex items-center justify-center gap-2">
              <Crown className="w-8 h-8 text-yellow-500" />
              프리미엄 테스트
            </h2>
            <p className="text-gray-600">회원가입 후 이용 가능</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
        </section>

        {/* CTA 섹션 */}
        <section className="bg-white rounded-3xl p-10 text-center shadow-2xl border-2 border-purple-200 max-w-5xl mx-auto">
          <Crown className="w-16 h-16 text-purple-600 mx-auto mb-6" />
          <h3 className="text-3xl font-bold mb-4 text-gray-900">AI 초정밀 전문가급 해석이 필요하시다면?</h3>
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
        </section>
      </div>
    </div>
  );
};

export default FreeTrialAssessment;