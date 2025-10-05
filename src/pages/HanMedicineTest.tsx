import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Heart, Clock, Star, Brain, Sparkles, Weight, Pill, Target, CheckCircle, Users, Zap, Shield, Activity, Smile, Phone } from 'lucide-react';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import ExpertValidationBanner from '@/components/ExpertValidationBanner';
import HerbalClinic3DBackground from '@/components/HerbalClinic3DBackground';
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
      return (
        <div className="relative">
          <HerbalClinic3DBackground />
          <UnifiedNavigation />
          <SasangConstitutionTest onComplete={handleTestComplete} />
        </div>
      );
    } else if (currentTest === 'premium') {
      return (
        <div className="relative">
          <HerbalClinic3DBackground />
          <UnifiedNavigation />
          <HanMedicinePremiumTest onComplete={handleTestComplete} />
        </div>
      );
    } else if (currentTest === 'diet') {
      return (
        <div className="relative">
          <HerbalClinic3DBackground />
          <UnifiedNavigation />
          <DietAnalysisTest onComplete={handleTestComplete} />
        </div>
      );
    } else if (currentTest === 'autism') {
      return (
        <div>
          <UnifiedNavigation />
          <AutismTest onComplete={handleTestComplete} onBack={handleRestart} />
        </div>
      );
    } else if (currentTest === 'adhd') {
      return (
        <div>
          <UnifiedNavigation />
          <AdhdTest onComplete={handleTestComplete} onBack={handleRestart} />
        </div>
      );
    } else if (currentTest === 'intellectual') {
      return (
        <div>
          <UnifiedNavigation />
          <IntellectualDisabilityTest onComplete={handleTestComplete} onBack={handleRestart} />
        </div>
      );
    } else if (currentTest === 'atopy') {
      return (
        <div>
          <UnifiedNavigation />
          <AtopyTest onComplete={handleTestComplete} onBack={handleRestart} />
        </div>
      );
    } else if (currentTest === 'stress') {
      return (
        <div>
          <UnifiedNavigation />
          <StressTest onComplete={handleTestComplete} onBack={handleRestart} />
        </div>
      );
    } else if (currentTest === 'women') {
      return (
        <div>
          <UnifiedNavigation />
          <WomensHealthTest onComplete={handleTestComplete} onBack={handleRestart} />
        </div>
      );
    }
  }

  if (testState === 'result' && testResult) {
    if (currentTest === 'quick') {
      return (
        <div className="relative">
          <HerbalClinic3DBackground />
          <UnifiedNavigation />
          <EnhancedConstitutionResult result={testResult} onRestart={handleRestart} />
        </div>
      );
    } else if (currentTest === 'premium') {
      return (
        <div>
          <UnifiedNavigation />
          <HanMedicinePremiumResult result={testResult} onRestart={handleRestart} />
        </div>
      );
    } else if (currentTest === 'diet') {
      return (
        <div>
          <UnifiedNavigation />
          <DietAnalysisResult result={testResult} onRestart={handleRestart} />
        </div>
      );
    } else if (currentTest === 'women') {
      return (
        <div>
          <UnifiedNavigation />
          <WomensHealthResult result={testResult} onRestart={handleRestart} />
        </div>
      );
    } else if (['autism', 'adhd', 'intellectual', 'atopy', 'stress'].includes(currentTest)) {
      return (
        <div>
          <UnifiedNavigation />
          <HanMedicineResult result={testResult} onRestart={handleRestart} />
        </div>
      );
    }
  }

  return (
    <div className="relative">
      <HerbalClinic3DBackground />
      <UnifiedNavigation />
      <div className="min-h-screen py-4 sm:py-8 px-4 pt-4">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 - 가운데 정렬 */}
          <div className="text-center mb-8 sm:mb-12 flex flex-col items-center px-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              한방솔루션 - AIH 체질분석 센터
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
              전문 AI가 당신의 체질과 대사를 정확히 분석하여 맞춤형 한방솔루션을 제공합니다
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
                      <span className="text-sm text-muted-foreground text-left">체질별 맞춤 식단</span>
                    </div>
                    <div className="flex items-center justify-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground text-left">개인별 운동법</span>
                    </div>
                    <div className="flex items-center justify-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground text-left">생활습관 개선</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center border-2 hover:border-primary/30 transition-colors">
                <CardContent className="pt-8 pb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Brain className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">AI 정밀 체질체크</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground text-left">한의학 사상체질 분석</span>
                    </div>
                    <div className="flex items-center justify-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground text-left">대사 타입 분석</span>
                    </div>
                    <div className="flex items-center justify-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground text-left">영양소 흡수율 분석</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center border-2 hover:border-primary/30 transition-colors">
                <CardContent className="pt-8 pb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">확실한 결과</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground text-left">97% 만족도</span>
                    </div>
                    <div className="flex items-center justify-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground text-left">전문가 검증 완료</span>
                    </div>
                    <div className="flex items-center justify-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground text-left">지속적 관리 시스템</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <ExpertValidationBanner />
          </div>

          {/* 진단 프로그램 메뉴 */}
          <div className="mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-8 sm:mb-12">
              한방체크 프로그램 선택
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
              {/* 3분 빠른 체질 진단 */}
              <Card className="relative overflow-hidden border-2 border-blue-200 hover:border-blue-300 transition-all group">
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  추천
                </div>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-foreground">3분 빠른 체질체크</CardTitle>
                      <p className="text-sm text-muted-foreground">간편하고 빠른 기본 분석</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">기본 사상체질 분석</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">체질별 음식 추천</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">기본 생활습관 가이드</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleTestSelection('quick')}
                  >
                    3분만에 시작하기
                  </Button>
                </CardContent>
              </Card>

              {/* 프리미엄 정밀 체질 진단 - 기능 비활성화로 임시 제거 */}
            </div>

            {/* 추가 특화 진단 프로그램 */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-center text-foreground mb-6">
                특화 체질체크 프로그램
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* 다이어트 체질 분석 */}
                <Card className="border hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Weight className="h-5 w-5 text-orange-600" />
                      <CardTitle className="text-lg">다이어트 체질 분석</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">효과적인 다이어트 방법 찾기</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleTestSelection('diet')}
                    >
                      시작하기
                    </Button>
                  </CardContent>
                </Card>

                {/* 스트레스 진단 */}
                <Card className="border hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-600" />
                      <CardTitle className="text-lg">스트레스 진단</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">스트레스 수준과 관리법</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleTestSelection('stress')}
                    >
                      시작하기
                    </Button>
                  </CardContent>
                </Card>

                {/* 여성 건강 진단 */}
                <Card className="border hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-pink-600" />
                      <CardTitle className="text-lg">여성 건강 진단</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">여성 특화 건강 관리</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleTestSelection('women')}
                    >
                      시작하기
                    </Button>
                  </CardContent>
                </Card>

                {/* 아동 발달 진단 */}
                <Card className="border hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Smile className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">자폐 스펙트럼 진단</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">아동 발달 상태 확인</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleTestSelection('autism')}
                    >
                      시작하기
                    </Button>
                  </CardContent>
                </Card>

                {/* ADHD 진단 */}
                <Card className="border hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      <CardTitle className="text-lg">ADHD 진단</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">주의력 결핍 과잉행동 장애</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleTestSelection('adhd')}
                    >
                      시작하기
                    </Button>
                  </CardContent>
                </Card>

                {/* 지적장애 진단 */}
                <Card className="border hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-indigo-600" />
                      <CardTitle className="text-lg">지적장애 진단</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">인지 능력 평가</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleTestSelection('intellectual')}
                    >
                      시작하기
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* 성과 및 신뢰성 섹션 */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 sm:mb-12">
              검증된 결과
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">97%</div>
                <p className="text-muted-foreground">사용자 만족도</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">50,000+</div>
                <p className="text-muted-foreground">누적 진단 건수</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">100+</div>
                <p className="text-muted-foreground">협력 한의원</p>
              </div>
            </div>
          </div>

          {/* 연락처 및 상담 안내 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 sm:p-8 text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
              전문가 상담이 필요하신가요?
            </h3>
            <p className="text-muted-foreground mb-6">
              한방 전문의와 1:1 맞춤 상담을 받아보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">상담 문의: 1588-1234</span>
              </div>
              <Button variant="outline" size="sm">
                전문가 상담 예약
              </Button>
            </div>
          </div>

          {/* 인증 및 신뢰성 배지 */}
          <div className="text-center mt-8 sm:mt-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full px-6 py-3">
              <span className="text-lg">✨</span>
              <span className="font-medium text-foreground">
                <span className="text-brand-gradient font-bold">100+</span> 한의원에서 신뢰하는 AI 한방치료 시스템
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HanMedicineTest;