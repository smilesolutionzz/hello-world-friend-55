import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Heart, Clock, Star, Brain, Sparkles, Weight, Pill, Target, CheckCircle, Users, Zap, Shield, Activity, Smile, Phone } from 'lucide-react';
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
import { WomensHealthTest } from '@/components/assessment/WomensHealthTest';
import { WomensHealthResult } from '@/components/assessment/WomensHealthResult';
import { EnhancedConstitutionResult } from '@/components/assessment/EnhancedConstitutionResult';

type TestType = 'none' | 'quick' | 'premium' | 'diet' | 'autism' | 'adhd' | 'intellectual' | 'atopy' | 'stress' | 'women';
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
    } else if (currentTest === 'women') {
      return <WomensHealthTest onComplete={handleTestComplete} onBack={handleRestart} />;
    }
  }

  if (testState === 'result' && testResult) {
    if (currentTest === 'quick') {
      return <EnhancedConstitutionResult result={testResult} onRestart={handleRestart} />;
    } else if (currentTest === 'premium') {
      return <HanMedicinePremiumResult result={testResult} onRestart={handleRestart} />;
    } else if (currentTest === 'diet') {
      return <DietAnalysisResult result={testResult} onRestart={handleRestart} />;
    } else if (currentTest === 'women') {
      return <WomensHealthResult result={testResult} onRestart={handleRestart} />;
    } else if (['autism', 'adhd', 'intellectual', 'atopy', 'stress'].includes(currentTest)) {
      return <HanMedicineResult result={testResult} onRestart={handleRestart} />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-4 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 - 가운데 정렬 */}
        <div className="text-center mb-8 sm:mb-12 flex flex-col items-center px-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            한방다이어트 - AIH 체질분석 센터
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
            전문 AI가 당신의 체질과 대사를 정확히 분석하여 맞춤형 다이어트 솔루션을 제공합니다
          </p>
        </div>

        {/* 나만의 체질 찾기 섹션 - 완전 가운데 정렬 */}
        <div className="mb-12 sm:mb-16 flex flex-col items-center text-center px-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            나만의 <span className="text-primary">체질을 찾아</span> 건강해지세요
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-12 max-w-2xl">
            천 년의 한의학 지혜와 현대 AI가 만나 <strong>당신만의 맞춤 솔루션</strong>을 제공합니다
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12 w-full max-w-5xl">
            <Card className="text-center border-2 hover:border-primary/30 transition-colors">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">내 몸에 딱 맞는 처방</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground text-left">사상체질별 맞춤 식단</span>
                  </div>
                  <div className="flex items-center justify-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground text-left">개인별 생활습관 처방</span>
                  </div>
                  <div className="flex items-center justify-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground text-left">체질개선 운동법</span>
                  </div>
                  <div className="flex items-center justify-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground text-left">한방차 추천</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
              <CardContent className="pt-8 pb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 animate-pulse"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-4 text-primary">한의사와 비대면 진료</h3>
                  <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-6">
                    <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <span className="text-xs font-medium">체질분석</span>
                    </div>
                    <div className="w-3 sm:w-6 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
                        <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <span className="text-xs font-medium">맞춤처방</span>
                    </div>
                    <div className="w-3 sm:w-6 h-0.5 bg-gradient-to-r from-purple-500 to-green-500"></div>
                    <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                        <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <span className="text-xs font-medium">비대면진료</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-sm font-medium text-emerald-700">실시간 전문가 연결</span>
                    </div>
                    <p className="text-sm text-emerald-700 font-medium">
                      ✅ 24시간 온라인 상담 가능
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-3">
                    <div className="text-xs text-blue-700 font-medium mb-1">
                      🏥 전국 1,200+ 한의원 제휴
                    </div>
                    <div className="text-xs text-purple-700">
                      🎯 맞춤 처방 즉시 배송
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-primary/30 transition-colors">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">오늘의 진료 현황</h3>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">진료 진행중</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">LIVE</span>
                  </div>
                  <div className="text-4xl font-bold text-primary mb-2">2,847건</div>
                  <div className="text-sm text-muted-foreground">누적 비대면 진료 완료</div>
                </div>
                <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span>전문 한의사와 상담하세요</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 rounded-3xl px-4 sm:px-8 py-6 sm:py-8 border-2 border-transparent bg-clip-border max-w-5xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-200/30 via-blue-200/30 to-purple-200/30 animate-pulse rounded-3xl"></div>
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-8">
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start space-x-2 mb-3">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-lg sm:text-xl font-bold text-emerald-700">
                      🌿 전국 한의원과 연결된 스마트 진료 시스템
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 mb-4">
                    AI 체질분석 → 전문 한의사 매칭 → 맞춤 처방 → 약재 배송까지 원스톱 서비스
                  </p>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                    <div className="bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium border border-emerald-200">
                      ⚡ 5분 내 한의사 연결
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
                      📱 비대면 진료
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium border border-purple-200">
                      🚚 당일 배송
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-3">
                  <Button className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-8 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200">
                    <Heart className="h-5 w-5 mr-2" />
                    지금 바로 진료 받기
                  </Button>
                  <div className="text-center">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                      💎 프리미엄 서비스 무료 체험
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* 테스트 선택 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto px-2">
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

          {/* 프리미엄 종합 검사 - 활성화 */}
          <Card className="relative overflow-hidden border-2 border-gradient-to-r from-gold-300 to-amber-300 transition-colors cursor-pointer group bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg">
            <div className="absolute top-4 right-4">
              <Crown className="h-6 w-6 text-amber-500" />
            </div>
            <div className="absolute top-2 left-2">
              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                NEW
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-xl flex items-center text-amber-700">
                <Crown className="h-6 w-6 mr-2 text-amber-500" />
                프리미엄 종합 분석
              </CardTitle>
              <CardDescription className="text-amber-600">
                AI + 전문 한의사가 함께하는 정밀 체질 분석
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">소요시간: 10-15분</span>
                </div>
                <div className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 px-3 py-1 rounded text-xs font-medium border border-amber-200">
                  15토큰
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-amber-700">✓ AI + 한의사 이중 분석</p>
                <p className="text-sm text-amber-700">✓ 오장육부 정밀 진단</p>
                <p className="text-sm text-amber-700">✓ 3D 체질 분석 그래프</p>
                <p className="text-sm text-amber-700">✓ 맞춤 한방 처방전</p>
                <p className="text-sm text-amber-700">✓ 1:1 전문가 화상 상담</p>
                <p className="text-sm text-amber-700">✓ 6개월 건강 관리 플랜</p>
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center justify-center mb-1">
                  <Crown className="h-4 w-4 text-amber-500 mr-2" />
                  <span className="text-sm font-medium text-amber-700">프리미엄 혜택</span>
                </div>
                <p className="text-xs text-amber-600">
                  • 전국 제휴 한의원 20% 할인
                  • 한약 처방 무료 배송
                  • 24시간 전문가 상담
                </p>
              </div>
              <Button 
                onClick={() => handleTestSelection('premium')}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white group-hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Crown className="h-4 w-4 mr-2" />
                프리미엄 분석 시작하기
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

          {/* 여성건강 한방치료 */}
          <Card className="relative overflow-hidden border-2 border-pink-200 hover:border-pink-300 transition-colors cursor-pointer group bg-gradient-to-br from-pink-50 to-rose-50">
            <div className="absolute top-4 right-4">
              <Heart className="h-6 w-6 text-pink-500" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Heart className="h-6 w-6 mr-2 text-pink-500" />
                여성건강 한방치료
              </CardTitle>
              <CardDescription>
                여성 특화 체질 분석과 맞춤 한방 솔루션
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">소요시간: 6분</span>
                </div>
                <div className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs font-medium">
                  4토큰
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">✓ 여성 체질 정밀 분석</p>
                <p className="text-sm text-muted-foreground">✓ 월경 불순 개선법</p>
                <p className="text-sm text-muted-foreground">✓ 여성 질환 한방 처방</p>
                <p className="text-sm text-muted-foreground">✓ 근처 한의원 연계</p>
                <p className="text-sm text-muted-foreground">✓ 비대면 처방 연결</p>
              </div>
              <Button 
                onClick={() => handleTestSelection('women')}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
              >
                여성건강 분석 시작하기
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

          {/* 한의원 제휴 섹션 */}
          <div className="mt-16 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 animate-pulse"></div>
            <div className="relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  🏥 전국 한의원 제휴 프로그램
                </h2>
                <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto">
                  최첨단 AI 체질분석 시스템으로 환자 만족도를 높이고 수익을 극대화하세요
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">환자 유입 증대</h3>
                  <p className="text-blue-100">AI 체질분석으로 월 평균 200% 환자 증가</p>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">진료 효율성</h3>
                  <p className="text-blue-100">사전 분석으로 진료 시간 50% 단축</p>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">만족도 향상</h3>
                  <p className="text-blue-100">정확한 체질분석으로 치료 만족도 95%</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">🚀 제휴 혜택</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                        <span>무료 AI 체질분석 시스템 도입</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                        <span>전용 관리자 패널 제공</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                        <span>환자 DB 및 진료 이력 관리</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                        <span>비대면 진료 플랫폼 연동</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                        <span>마케팅 지원 및 홍보</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl p-6 mb-6">
                      <div className="text-3xl font-bold text-white mb-2">1,200+</div>
                      <div className="text-white">제휴 한의원</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl p-6">
                      <div className="text-3xl font-bold text-white mb-2">95%</div>
                      <div className="text-white">만족도</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="inline-flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200"
                  >
                    <Crown className="h-5 w-5 mr-2" />
                    제휴 문의하기
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-white text-white hover:bg-white hover:text-black px-8 py-4 rounded-full"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    1588-1234
                  </Button>
                </div>
                <p className="text-sm text-blue-100 mt-4">
                  📞 제휴 문의: 평일 9:00-18:00 | 📧 partnership@hanmedicine.ai
                </p>
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