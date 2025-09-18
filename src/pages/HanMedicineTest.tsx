import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Heart, Clock, Star, Brain, Sparkles, Weight, Pill, Target, CheckCircle } from 'lucide-react';
import ExpertValidationBanner from '@/components/ExpertValidationBanner';
import { SasangConstitutionTest } from '@/components/assessment/SasangConstitutionTest';
import { SasangConstitutionResult } from '@/components/assessment/SasangConstitutionResult';
import { HanMedicinePremiumTest } from '@/components/assessment/HanMedicinePremiumTest';
import { HanMedicinePremiumResult } from '@/components/assessment/HanMedicinePremiumResult';
import { DietAnalysisTest } from '@/components/assessment/DietAnalysisTest';
import { DietAnalysisResult } from '@/components/assessment/DietAnalysisResult';

type TestType = 'none' | 'quick' | 'premium' | 'diet';
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
    } else if (currentTest === 'diet') {
      return <DietAnalysisTest onComplete={handleTestComplete} />;
    }
  }

  if (testState === 'result' && testResult) {
    if (currentTest === 'quick') {
      return <SasangConstitutionResult result={testResult} onRestart={handleRestart} />;
    } else if (currentTest === 'premium') {
      return <HanMedicinePremiumResult result={testResult} onRestart={handleRestart} />;
    } else if (currentTest === 'diet') {
      return <DietAnalysisResult result={testResult} onRestart={handleRestart} />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            한방다이어트 - AIH 체질분석 센터
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            전문 AI가 당신의 체질과 대사를 정확히 분석하여 맞춤형 다이어트 솔루션을 제공합니다
          </p>
        </div>

        {/* 테스트 선택 카드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* 3분 간편 테스트 */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors cursor-pointer group">
            <div className="absolute top-4 right-4">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Heart className="h-6 w-6 mr-2 text-red-500" />
                AI 체질 성향 3분 분석
              </CardTitle>
              <CardDescription>
                간단한 질문으로 빠르게 체질을 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">소요시간: 3분</span>
                </div>
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  2토큰
                </div>
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

          {/* 한방다이어트 체질분석 */}
          <Card className="relative overflow-hidden border-2 border-green-200 hover:border-green-300 transition-colors cursor-pointer group bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="absolute top-4 right-4">
              <Weight className="h-6 w-6 text-green-500" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Weight className="h-6 w-6 mr-2 text-green-500" />
                한방다이어트 체질분석
              </CardTitle>
              <CardDescription>
                체질별 맞춤 다이어트 프로그램 설계
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">소요시간: 7분</span>
                </div>
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                  5토큰
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">✓ 체질별 대사 분석</p>
                <p className="text-sm text-muted-foreground">✓ 맞춤 다이어트 식단</p>
                <p className="text-sm text-muted-foreground">✓ 한방 다이어트 처방</p>
                <p className="text-sm text-muted-foreground">✓ 다이어트약 추천</p>
                <p className="text-sm text-muted-foreground">✓ 전문가 상담 연계</p>
              </div>
              <Button 
                onClick={() => handleTestSelection('diet')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white group-hover:shadow-lg"
              >
                다이어트 분석 시작하기
              </Button>
            </CardContent>
          </Card>

          {/* 프리미엄 종합 검사 - 임시 비활성화 */}
          <Card className="relative overflow-hidden border-2 border-gray-200 transition-colors bg-gray-50 opacity-75">
            <div className="absolute top-4 right-4">
              <Crown className="h-6 w-6 text-gray-400" />
            </div>
            <div className="absolute inset-0 bg-gray-100/50 flex items-center justify-center z-10">
              <div className="bg-white rounded-lg p-4 shadow-lg text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">서비스 점검 중</p>
                <p className="text-xs text-gray-500">곧 다시 만나요!</p>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-xl flex items-center text-gray-500">
                <Crown className="h-6 w-6 mr-2 text-gray-400" />
                프리미엄 종합 분석
              </CardTitle>
              <CardDescription className="text-gray-400">
                오장육부 상태까지 정밀 분석하는 한의학 검사
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">소요시간: 10-15분</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">✓ 체질 + 오장육부 종합 분석</p>
                <p className="text-sm text-gray-400">✓ 맞춤 한방 처방 추천</p>
                <p className="text-sm text-gray-400">✓ 상세 식이요법 가이드</p>
                <p className="text-sm text-gray-400">✓ 혈자리 지압법 안내</p>
                <p className="text-sm text-gray-400">✓ 계절별 건강관리법</p>
              </div>
              <Button 
                disabled
                className="w-full bg-gray-300 text-gray-500 cursor-not-allowed"
              >
                점검 중
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 다이어트 특화 서비스 소개 */}
        <div className="mt-16 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center justify-center">
              <Target className="h-8 w-8 mr-3 text-green-500" />
              한방다이어트 전문 프로그램
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              개인의 체질과 대사 상태를 정확히 분석하여 가장 효과적인 다이어트 방법을 제안합니다
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">체질 분석</h3>
              <p className="text-sm text-muted-foreground">사상체질별 대사 특성과 비만 원인 파악</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Weight className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">맞춤 식단</h3>
              <p className="text-sm text-muted-foreground">체질에 맞는 음식과 피해야 할 음식 안내</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pill className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">한약 처방</h3>
              <p className="text-sm text-muted-foreground">체질별 다이어트 한약과 복용법 추천</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">전문가 연계</h3>
              <p className="text-sm text-muted-foreground">한의원 연계 및 지속 관리 서비스</p>
            </div>
          </div>
        </div>

        {/* 특징 섹션 */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            왜 AIH 한방다이어트를 선택할까요?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">전문 한의학 AI</h3>
                <p className="text-sm text-muted-foreground">
                  수천 건의 한의학 다이어트 임상 데이터로 학습한 AI가 정확한 체질 분석을 제공합니다
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Pill className="h-8 w-8 text-purple-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">맞춤 다이어트약 처방</h3>
                <p className="text-sm text-muted-foreground">
                  개인 체질에 맞는 한방 다이어트약 처방과 복용법을 AI가 정확히 제안해드립니다
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Sparkles className="h-8 w-8 text-pink-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">가까이한의원 연계서비스</h3>
                <p className="text-sm text-muted-foreground">
                  가까이한의원과 연결하여 지속적인 다이어트 관리까지 원스톱 서비스
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 차별점 배너를 하단으로 이동 */}
        <ExpertValidationBanner />

        {/* 신뢰성 표시 */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full px-6 py-3">
            <span className="text-lg">✨</span>
            <span className="font-medium text-foreground">
              <span className="text-brand-gradient font-bold">100+</span> 한의원에서 신뢰하는 AI 다이어트 시스템
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HanMedicineTest;