import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Heart, Clock, Star, Brain, Sparkles, Weight, Pill, Target, CheckCircle, Users, Zap, Shield, Activity, Smile } from 'lucide-react';
import ExpertValidationBanner from '@/components/ExpertValidationBanner';
import { SasangConstitutionTest } from '@/components/assessment/SasangConstitutionTest';
import { SasangConstitutionResult } from '@/components/assessment/SasangConstitutionResult';
import { HanMedicinePremiumTest } from '@/components/assessment/HanMedicinePremiumTest';
import { HanMedicinePremiumResult } from '@/components/assessment/HanMedicinePremiumResult';
import { DietAnalysisTest } from '@/components/assessment/DietAnalysisTest';
import { DietAnalysisResult } from '@/components/assessment/DietAnalysisResult';
import { AutismTest } from '@/components/assessment/AutismTest';
import { AdhdTest } from '@/components/assessment/AdhdTest';
import { IntellectualDisabilityTest } from '@/components/assessment/IntellectualDisabilityTest';
import { AtopyTest } from '@/components/assessment/AtopyTest';
import { HanMedicineResult } from '@/components/assessment/HanMedicineResult';
import { StressTest } from '@/components/assessment/StressTest';

type TestType = 'none' | 'quick' | 'premium' | 'diet' | 'autism' | 'adhd' | 'intellectual' | 'atopy' | 'stress';
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
    } else if (currentTest === 'autism') {
      return <AutismTest onComplete={handleTestComplete} onBack={handleRestart} />;
    } else if (currentTest === 'adhd') {
      return <AdhdTest onComplete={handleTestComplete} onBack={handleRestart} />;
    } else if (currentTest === 'intellectual') {
      return <IntellectualDisabilityTest onComplete={handleTestComplete} onBack={handleRestart} />;
    } else if (currentTest === 'atopy') {
      return <AtopyTest onComplete={handleTestComplete} onBack={handleRestart} />;
    } else if (currentTest === 'stress') {
      return <StressTest onComplete={handleTestComplete} onBack={handleRestart} />;
    }
  }

  if (testState === 'result' && testResult) {
    if (currentTest === 'quick') {
      return <SasangConstitutionResult result={testResult} onRestart={handleRestart} />;
    } else if (currentTest === 'premium') {
      return <HanMedicinePremiumResult result={testResult} onRestart={handleRestart} />;
    } else if (currentTest === 'diet') {
      return <DietAnalysisResult result={testResult} onRestart={handleRestart} />;
    } else if (['autism', 'adhd', 'intellectual', 'atopy', 'stress'].includes(currentTest)) {
      return <HanMedicineResult result={testResult} onRestart={handleRestart} />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto ml-auto mr-16">
        {/* 헤더 - 가운데 정렬 */}
        <div className="text-center mb-12 flex flex-col items-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            한방다이어트 - AIH 체질분석 센터
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            전문 AI가 당신의 체질과 대사를 정확히 분석하여 맞춤형 다이어트 솔루션을 제공합니다
          </p>
        </div>

        {/* 나만의 체질 찾기 섹션 - 완전 가운데 정렬 */}
        <div className="mb-16 flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            나만의 <span className="text-primary">체질을 찾아</span> 건강해지세요
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
            천 년의 한의학 지혜와 현대 AI가 만나 <strong>당신만의 맞춤 솔루션</strong>을 제공합니다
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center border-2 hover:border-primary/30 transition-colors">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">내 몸에 딱 맞는 처방</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground text-left">사상체질별 맞춤 식단</span>
                  </div>
                  <div className="flex items-center justify-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground text-left">개인별 생활습관 처방</span>
                  </div>
                  <div className="flex items-center justify-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground text-left">체질개선 운동법</span>
                  </div>
                  <div className="flex items-center justify-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground text-left">한방차 추천</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-primary">3분만에 결과 확인</h3>
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs">간단 질문</span>
                  </div>
                  <div className="w-6 h-0.5 bg-primary"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs">AI분석</span>
                  </div>
                  <div className="w-6 h-0.5 bg-primary"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs">즉시확인</span>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700 font-medium">
                    ✅ 바로 확인: 3분 이내
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-primary/30 transition-colors">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">오늘의 분석 현황</h3>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">분석 진행중</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">실시간</span>
                  </div>
                  <div className="text-4xl font-bold text-primary mb-2">1,247건</div>
                  <div className="text-sm text-muted-foreground">누적 체질분석 완료</div>
                </div>
                <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span>지금 바로 시작해보세요</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl px-8 py-6 border border-emerald-200 max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-semibold text-emerald-700">
                🌿 내 체질에 맞는 건강법, 지금 확인해보세요!
              </span>
              <div className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                무료 체험
              </div>
            </div>
          </div>
        </div>


        {/* 테스트 선택 카드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
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

          {/* 자폐아동 한방치료 */}
          <Card className="relative overflow-hidden border-2 border-blue-200 hover:border-blue-300 transition-colors cursor-pointer group bg-gradient-to-br from-blue-50 to-sky-50">
            <div className="absolute top-4 right-4">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Users className="h-6 w-6 mr-2 text-blue-500" />
                자폐아동 한방치료
              </CardTitle>
              <CardDescription>
                자폐 스펙트럼 아동을 위한 맞춤 한방 치료
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">소요시간: 12분</span>
                </div>
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  8토큰
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">✓ 아동 체질 분석</p>
                <p className="text-sm text-muted-foreground">✓ 감정 조절 한방 처방</p>
                <p className="text-sm text-muted-foreground">✓ 집중력 향상 치료</p>
                <p className="text-sm text-muted-foreground">✓ 소화기능 개선</p>
                <p className="text-sm text-muted-foreground">✓ 부모 상담 연계</p>
              </div>
              <Button 
                onClick={() => handleTestSelection('autism')}
                className="w-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white group-hover:shadow-lg"
              >
                자폐아동 분석 시작하기
              </Button>
            </CardContent>
          </Card>

          {/* ADHD 한방치료 */}
          <Card className="relative overflow-hidden border-2 border-orange-200 hover:border-orange-300 transition-colors cursor-pointer group bg-gradient-to-br from-orange-50 to-amber-50">
            <div className="absolute top-4 right-4">
              <Zap className="h-6 w-6 text-orange-500" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Zap className="h-6 w-6 mr-2 text-orange-500" />
                ADHD 한방치료
              </CardTitle>
              <CardDescription>
                주의력결핍 과다활동을 위한 한방 솔루션
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">소요시간: 10분</span>
                </div>
                <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                  7토큰
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">✓ 집중력 장애 분석</p>
                <p className="text-sm text-muted-foreground">✓ 안정화 한약 처방</p>
                <p className="text-sm text-muted-foreground">✓ 행동 조절 치료</p>
                <p className="text-sm text-muted-foreground">✓ 학습능력 향상</p>
                <p className="text-sm text-muted-foreground">✓ 가족 케어 가이드</p>
              </div>
              <Button 
                onClick={() => handleTestSelection('adhd')}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white group-hover:shadow-lg"
              >
                ADHD 분석 시작하기
              </Button>
            </CardContent>
          </Card>

          {/* 지능장애 한방치료 */}
          <Card className="relative overflow-hidden border-2 border-purple-200 hover:border-purple-300 transition-colors cursor-pointer group bg-gradient-to-br from-purple-50 to-violet-50">
            <div className="absolute top-4 right-4">
              <Brain className="h-6 w-6 text-purple-500" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Brain className="h-6 w-6 mr-2 text-purple-500" />
                지능장애 한방치료
              </CardTitle>
              <CardDescription>
                인지능력 향상을 위한 맞춤 한방 프로그램
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">소요시간: 15분</span>
                </div>
                <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                  10토큰
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">✓ 인지기능 평가</p>
                <p className="text-sm text-muted-foreground">✓ 두뇌 활성화 한약</p>
                <p className="text-sm text-muted-foreground">✓ 기억력 개선 치료</p>
                <p className="text-sm text-muted-foreground">✓ 발달 촉진 프로그램</p>
                <p className="text-sm text-muted-foreground">✓ 장기 관리 계획</p>
              </div>
              <Button 
                onClick={() => handleTestSelection('intellectual')}
                className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white group-hover:shadow-lg"
              >
                지능장애 분석 시작하기
              </Button>
            </CardContent>
          </Card>

          {/* 아토피 한방치료 */}
          <Card className="relative overflow-hidden border-2 border-rose-200 hover:border-rose-300 transition-colors cursor-pointer group bg-gradient-to-br from-rose-50 to-pink-50">
            <div className="absolute top-4 right-4">
              <Shield className="h-6 w-6 text-rose-500" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Shield className="h-6 w-6 mr-2 text-rose-500" />
                아토피 한방치료
              </CardTitle>
              <CardDescription>
                아토피 피부염 근본 원인 치료
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">소요시간: 8분</span>
                </div>
                <div className="bg-rose-100 text-rose-800 px-2 py-1 rounded text-xs font-medium">
                  6토큰
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">✓ 피부 상태 분석</p>
                <p className="text-sm text-muted-foreground">✓ 해독 한약 처방</p>
                <p className="text-sm text-muted-foreground">✓ 면역력 강화 치료</p>
                <p className="text-sm text-muted-foreground">✓ 알레르기 관리법</p>
                <p className="text-sm text-muted-foreground">✓ 생활습관 개선안</p>
              </div>
              <Button 
                onClick={() => handleTestSelection('atopy')}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white group-hover:shadow-lg"
              >
                아토피 분석 시작하기
              </Button>
            </CardContent>
          </Card>

          {/* 스트레스 한방치료 */}
          <Card className="relative overflow-hidden border-2 border-teal-200 hover:border-teal-300 transition-colors cursor-pointer group bg-gradient-to-br from-teal-50 to-cyan-50">
            <div className="absolute top-4 right-4">
              <Activity className="h-6 w-6 text-teal-500" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Activity className="h-6 w-6 mr-2 text-teal-500" />
                스트레스 한방치료
              </CardTitle>
              <CardDescription>
                스트레스와 정신건강을 위한 한방 케어
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">소요시간: 6분</span>
                </div>
                <div className="bg-teal-100 text-teal-800 px-2 py-1 rounded text-xs font-medium">
                  5토큰
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">✓ 스트레스 지수 측정</p>
                <p className="text-sm text-muted-foreground">✓ 진정 한약 처방</p>
                <p className="text-sm text-muted-foreground">✓ 수면 개선 치료</p>
                <p className="text-sm text-muted-foreground">✓ 마음 안정 요법</p>
                <p className="text-sm text-muted-foreground">✓ 스트레스 관리법</p>
              </div>
              <Button 
                onClick={() => handleTestSelection('stress')}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white group-hover:shadow-lg"
              >
                스트레스 분석 시작하기
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 다이어트 특화 서비스 소개 */}
        <div className="mt-16 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center justify-center">
              <Target className="h-8 w-8 mr-3 text-green-500" />
              전문 한방치료 프로그램
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              각 증상별 전문 분석과 체질에 맞는 맞춤 한방 치료로 근본적인 해결책을 제공합니다
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">체질 분석</h3>
              <p className="text-sm text-muted-foreground">개인별 체질과 증상 특성 정밀 분석</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">맞춤 치료</h3>
              <p className="text-sm text-muted-foreground">연령과 증상에 특화된 개별 치료법</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pill className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">한약 처방</h3>
              <p className="text-sm text-muted-foreground">증상별 맞춤 한약 처방과 복용법</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">전문가 연계</h3>
              <p className="text-sm text-muted-foreground">가까이한의원 직접 연결 서비스</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smile className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="font-semibold mb-2">지속 관리</h3>
              <p className="text-sm text-muted-foreground">장기적 건강 관리와 개선 추적</p>
            </div>
          </div>
        </div>

        {/* 신뢰성 표시 */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full px-6 py-3">
            <span className="text-lg">✨</span>
            <span className="font-medium text-foreground">
              <span className="text-brand-gradient font-bold">100+</span> 한의원에서 신뢰하는 AI 한방치료 시스템
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HanMedicineTest;