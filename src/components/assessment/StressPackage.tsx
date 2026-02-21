import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Brain, Star, CheckCircle, Home } from 'lucide-react';
import { TOKEN_COSTS } from '@/constants/tokenCosts';
import { useLanguage } from '@/i18n/LanguageContext';

export const StressPackage = () => {
  const navigate = useNavigate();
  const { isEnglish, localePath } = useLanguage();

  const stressTests = isEnglish ? [
    { id: 1, title: '3-Min Stress Check', duration: '3 min', tokens: TOKEN_COSTS.PSYCHOLOGICAL_TEST, status: 'Quick Check', statusColor: 'bg-blue-500', description: 'Accurate stress level measurement', path: '/assessment?test=stress' },
    { id: 2, title: 'Workplace Stress Test', duration: '15 min', tokens: TOKEN_COSTS.OBSERVATION_ANALYSIS, status: 'For Workers', statusColor: 'bg-purple-500', description: 'In-depth analysis based on results', path: '/assessment?test=stress' },
    { id: 3, title: 'Self-Worth Assessment', duration: '4 min', tokens: 2, status: 'Self-Esteem', statusColor: 'bg-green-500', description: 'Self-esteem level and improvement guide', path: '/assessment?test=selfesteem' },
    { id: 4, title: 'AI Stress Counseling', duration: '30 min', tokens: 0, status: 'Instant', statusColor: 'bg-green-500', description: 'Professional counseling if needed', path: '/ai-counselor' },
  ] : [
    { id: 1, title: '3분 스트레스 체크', duration: '3분', tokens: TOKEN_COSTS.PSYCHOLOGICAL_TEST, status: '빠른체크', statusColor: 'bg-blue-500', description: '스트레스 수준 정확한 측정', path: '/assessment?test=stress' },
    { id: 2, title: '직장 스트레스 검사', duration: '15분', tokens: TOKEN_COSTS.OBSERVATION_ANALYSIS, status: '직장인 추천', statusColor: 'bg-purple-500', description: '결과에 따라 심화 검사 제공', path: '/assessment?test=stress' },
    { id: 3, title: '자아가치 측정', duration: '4분', tokens: 2, status: '자존감', statusColor: 'bg-green-500', description: '자존감 수준과 향상 가이드', path: '/assessment?test=selfesteem' },
    { id: 4, title: 'AI 스트레스 상담', duration: '30분', tokens: 0, status: '즉시상담', statusColor: 'bg-green-500', description: '필요시 전문가 상담', path: '/ai-counselor' },
  ];

  const benefits = isEnglish
    ? ['Accurate stress level measurement', 'Personalized self-esteem guide', 'Customized solutions', 'Actionable management tips', '24/7 AI counseling support']
    : ['스트레스 수준 정확한 측정', '자존감 향상 맞춤 가이드', '개인별 맞춤 해결책 제공', '즉시 실행 가능한 관리법', '24시간 AI 상담 지원'];

  const handleStartTest = (testPath: string) => {
    navigate(localePath(testPath));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="fixed top-4 left-4 z-50">
        <Button onClick={() => navigate(localePath('/'))} variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm border border-gray-200 hover:bg-white shadow-lg">
          <Home className="w-4 h-4 mr-2" />
          {isEnglish ? 'Home' : '홈으로'}
        </Button>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEnglish ? <>Stress Management <span className="text-primary">Package</span></> : <>스트레스 관리 <span className="text-primary">맞춤 패키지</span></>}
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            {isEnglish ? 'Optimized solutions for daily stress, burnout, and fatigue' : '일상 스트레스, 번아웃, 피로감에 최적화된 솔루션'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">{isEnglish ? 'Recommended Test Course' : '추천 테스트 코스'}</h2>
            </div>
            
            <div className="space-y-4">
              {stressTests.map((test) => (
                <Card key={test.id} className="relative overflow-hidden border-border/50 hover:border-primary/20 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">{test.id}</div>
                        <div>
                          <h3 className="font-semibold text-lg text-foreground mb-1">{test.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{test.duration}</div>
                            <div className="flex items-center gap-1">
                              {test.tokens > 0 ? (
                                <span className="text-primary font-medium">{test.tokens * 100}{isEnglish ? ' KRW' : '원'}</span>
                              ) : (
                                <span className="text-green-500 font-medium">{isEnglish ? 'Free' : '무료'}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${test.statusColor} text-white border-0`}>{test.status}</Badge>
                        <Button onClick={() => handleStartTest(test.path)} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0">
                          {isEnglish ? 'Start' : '시작하기'} <span className="ml-1">→</span>
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
                  <h3 className="font-semibold">{isEnglish ? 'Expected Benefits' : '이런 효과를 기대할 수 있어요'}</h3>
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
                  <div className="p-2 rounded-full bg-yellow-500/10"><Star className="w-4 h-4 text-yellow-500" /></div>
                  <h3 className="font-semibold">{isEnglish ? 'Recommended Order' : '추천 순서'}</h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>{isEnglish ? 'If this is your first time:' : '처음이신다면:'}</strong></p>
                  <p>• {isEnglish ? 'Start with basic test' : '기본 검사로 시작'}</p>
                  <p>• {isEnglish ? 'Advanced test based on results' : '결과에 따라 심화 검사'}</p>
                  <p>• {isEnglish ? 'Professional consultation if needed' : '필요시 전문가 상담'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/10 mx-auto mb-3 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs">👤</span>
                  </div>
                </div>
                <h3 className="font-semibold mb-2">{isEnglish ? 'Expert Support' : '전문가 지원'}</h3>
                <p className="text-sm text-muted-foreground">
                  {isEnglish ? 'All test results are reviewed by counseling professionals to provide accurate feedback.' : '모든 테스트 결과는 심리상담 전문가가 검토하여 정확한 피드백을 제공합니다.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
