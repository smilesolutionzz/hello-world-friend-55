import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Heart, Clock, Star, Brain, Sparkles } from 'lucide-react';
import { SasangConstitutionTest } from '@/components/assessment/SasangConstitutionTest';
import { SasangConstitutionResult } from '@/components/assessment/SasangConstitutionResult';
import { HanMedicinePremiumTest } from '@/components/assessment/HanMedicinePremiumTest';
import { HanMedicinePremiumResult } from '@/components/assessment/HanMedicinePremiumResult';
import { MentalHealthQuickTest } from '@/components/assessment/MentalHealthQuickTest';
import { MentalHealthQuickResult } from '@/components/assessment/MentalHealthQuickResult';
import { PersonalityLoveTest } from '@/components/assessment/PersonalityLoveTest';
import { PersonalityLoveResult } from '@/components/assessment/PersonalityLoveResult';

type TestType = 'none' | 'quick' | 'premium' | 'mental' | 'love';
type TestState = 'select' | 'testing' | 'result';

const HanMedicineTest = () => {
  const [currentTest, setCurrentTest] = useState<TestType>('none');
  const [testState, setTestState] = useState<TestState>('select');
  const [testResult, setTestResult] = useState<any>(null);

  const handleTestSelection = (testType: TestType) => {
    setCurrentTest(testType);
    setTestState('testing');
  };

  const handleTestComplete = (result: any) => {
    setTestResult(result);
    setTestState('result');
  };

  const handleRestart = () => {
    setCurrentTest('none');
    setTestState('select');
    setTestResult(null);
  };

  if (testState === 'testing') {
    if (currentTest === 'quick') {
      return <SasangConstitutionTest onComplete={handleTestComplete} />;
    } else if (currentTest === 'premium') {
      return <HanMedicinePremiumTest onComplete={handleTestComplete} />;
    } else if (currentTest === 'mental') {
      return <MentalHealthQuickTest onComplete={handleTestComplete} />;
    } else if (currentTest === 'love') {
      return <PersonalityLoveTest onComplete={handleTestComplete} />;
    }
  }

  if (testState === 'result' && testResult) {
    if (currentTest === 'quick') {
      return <SasangConstitutionResult result={testResult} onRestart={handleRestart} />;
    } else if (currentTest === 'premium') {
      return <HanMedicinePremiumResult result={testResult} onRestart={handleRestart} />;
    } else if (currentTest === 'mental') {
      return <MentalHealthQuickResult result={testResult} onRestart={handleRestart} />;
    } else if (currentTest === 'love') {
      return <PersonalityLoveResult result={testResult} onRestart={handleRestart} />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            체질체크 - AI 심리분석 센터
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            전문 AI가 당신의 체질, 정신건강, 성격을 정확히 분석하여 맞춤형 솔루션을 제공합니다
          </p>
        </div>

        {/* 테스트 선택 카드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* 3분 간편 테스트 */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors cursor-pointer group">
            <div className="absolute top-4 right-4">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Heart className="h-6 w-6 mr-2 text-red-500" />
                사상체질 3분 진단
              </CardTitle>
              <CardDescription>
                간단한 질문으로 빠르게 체질을 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">소요시간: 3분</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">✓ 8개의 핵심 질문</p>
                <p className="text-sm text-muted-foreground">✓ AI 체질 분석</p>
                <p className="text-sm text-muted-foreground">✓ 기본 식이요법 가이드</p>
                <p className="text-sm text-muted-foreground">✓ 생활습관 개선안</p>
              </div>
              <Button 
                onClick={() => handleTestSelection('quick')}
                className="w-full group-hover:bg-primary/90"
              >
                3분 진단 시작하기
              </Button>
            </CardContent>
          </Card>

          {/* 정신건강 3분 체크 */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors cursor-pointer group">
            <div className="absolute top-4 right-4">
              <Star className="h-6 w-6 text-purple-500" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Brain className="h-6 w-6 mr-2 text-purple-500" />
                정신건강 3분 체크
              </CardTitle>
              <CardDescription>
                현재 정신건강 상태를 빠르게 진단해보세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">소요시간: 3분</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">✓ 8개의 핵심 질문</p>
                <p className="text-sm text-muted-foreground">✓ 스트레스 수준 분석</p>
                <p className="text-sm text-muted-foreground">✓ 정신건강 상태 진단</p>
                <p className="text-sm text-muted-foreground">✓ 맞춤 관리법 제시</p>
              </div>
              <Button 
                onClick={() => handleTestSelection('mental')}
                className="w-full group-hover:bg-primary/90"
              >
                정신건강 체크하기
              </Button>
            </CardContent>
          </Card>

          {/* 연애 성격 분석 */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors cursor-pointer group">
            <div className="absolute top-4 right-4">
              <Sparkles className="h-6 w-6 text-pink-500" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Heart className="h-6 w-6 mr-2 text-pink-500" />
                연애 성격 분석
              </CardTitle>
              <CardDescription>
                나의 연애 스타일과 궁합을 알아보세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">소요시간: 3분</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">✓ 연애 성격 유형 분석</p>
                <p className="text-sm text-muted-foreground">✓ 궁합 분석</p>
                <p className="text-sm text-muted-foreground">✓ 연애 조언</p>
                <p className="text-sm text-muted-foreground">✓ 소통 스타일 진단</p>
              </div>
              <Button 
                onClick={() => handleTestSelection('love')}
                className="w-full group-hover:bg-primary/90"
              >
                연애 성격 분석하기
              </Button>
            </CardContent>
          </Card>

          {/* 프리미엄 종합 검사 */}
          <Card className="relative overflow-hidden border-2 border-amber-200 hover:border-amber-300 transition-colors cursor-pointer group bg-gradient-to-br from-amber-50 to-orange-50">
            <div className="absolute top-4 right-4">
              <Crown className="h-6 w-6 text-amber-500" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Crown className="h-6 w-6 mr-2 text-amber-500" />
                프리미엄 종합 분석
              </CardTitle>
              <CardDescription>
                오장육부 상태까지 정밀 분석하는 한의학 검사
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">소요시간: 10-15분</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">✓ 체질 + 오장육부 종합 분석</p>
                <p className="text-sm text-muted-foreground">✓ 맞춤 한방 처방 추천</p>
                <p className="text-sm text-muted-foreground">✓ 상세 식이요법 가이드</p>
                <p className="text-sm text-muted-foreground">✓ 혈자리 지압법 안내</p>
                <p className="text-sm text-muted-foreground">✓ 계절별 건강관리법</p>
              </div>
              <Button 
                onClick={() => handleTestSelection('premium')}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white group-hover:shadow-lg"
              >
                프리미엄 분석 시작하기
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 특징 섹션 */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            왜 AI 심리분석 센터를 선택할까요?
          </h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">전문 한의학 AI</h3>
                <p className="text-sm text-muted-foreground">
                  수천 건의 한의학 진료 데이터로 학습한 AI가 정확한 체질 분석을 제공합니다
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Brain className="h-8 w-8 text-purple-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">정신건강 분석</h3>
                <p className="text-sm text-muted-foreground">
                  스트레스, 우울, 불안 등 정신건강 상태를 종합적으로 분석하고 관리법을 제시합니다
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Sparkles className="h-8 w-8 text-pink-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">성격 & 연애분석</h3>
                <p className="text-sm text-muted-foreground">
                  연애 스타일과 성격 특성을 분석하여 더 나은 인간관계를 만들어갑니다
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">실용적 가이드</h3>
                <p className="text-sm text-muted-foreground">
                  일상에서 바로 실천할 수 있는 맞춤형 솔루션과 관리법을 제공합니다
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 신뢰성 표시 */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full px-6 py-3">
            <span className="text-lg">✨</span>
            <span className="font-medium text-foreground">
              <span className="text-brand-gradient font-bold">100+</span> 기관에서 신뢰하는 AI 분석 시스템
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HanMedicineTest;