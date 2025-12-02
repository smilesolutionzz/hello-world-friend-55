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
    <div className="relative bg-gradient-to-br from-[hsl(var(--herbal-bg))] via-[hsl(var(--herbal-bg-warm))] to-[hsl(var(--herbal-bg))]">
      <HerbalClinic3DBackground />
      <UnifiedNavigation />
      <div className="min-h-screen py-8 sm:py-12 px-4 pt-4">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 - 한의원 스타일 */}
          <div className="text-center mb-12 sm:mb-16 flex flex-col items-center px-2">
            <div className="inline-block mb-6 px-8 py-3 bg-gradient-to-r from-[hsl(var(--herbal-primary))] to-[hsl(var(--herbal-primary-light))] rounded-full shadow-lg">
              <span className="text-white font-bold text-sm tracking-wider">千年의 智慧 × AI 技術</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: "'Noto Serif KR', 'Gowun Batang', serif", color: "hsl(var(--herbal-text-dark))" }}>
              한방솔루션 체질분석 센터
            </h1>
            <p className="text-lg sm:text-xl mb-6" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-secondary))" }}>
              전통 한의학과 최첨단 AI가 만나 당신만의 맞춤형 건강 솔루션을 제공합니다
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--herbal-primary))]"></div>
                <span className="text-[hsl(var(--herbal-text-dark))]">한의학 기반 분석</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--herbal-accent))]"></div>
                <span className="text-[hsl(var(--herbal-text-dark))]">AI 정밀 진단</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--herbal-secondary))]"></div>
                <span className="text-[hsl(var(--herbal-text-dark))]">맞춤형 처방</span>
              </div>
            </div>
          </div>

          {/* 나만의 체질 찾기 섹션 - 한의원 스타일 */}
          <div className="mb-12 sm:mb-16 flex flex-col items-center text-center px-2">
            <div className="mb-6">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>
                나만의 <span style={{ color: "hsl(var(--herbal-primary))" }}>體質</span>을 찾아 건강해지세요
              </h2>
              <div className="w-24 h-1 mx-auto bg-gradient-to-r from-transparent via-[hsl(var(--herbal-accent))] to-transparent rounded-full"></div>
            </div>
            <p className="text-lg sm:text-xl mb-12 max-w-2xl" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-secondary))" }}>
              千年의 한의학 지혜와 현대 AI가 만나 <strong style={{ color: "hsl(var(--herbal-primary))" }}>당신만의 맞춤 솔루션</strong>을 제공합니다
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 w-full max-w-5xl">
              <Card className="text-center border-2 transition-all hover:shadow-xl bg-white/80 backdrop-blur-sm" style={{ borderColor: "hsl(var(--herbal-border))" }}>
                <CardContent className="pt-8 pb-8">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, hsl(var(--herbal-primary-light)), hsl(var(--herbal-primary)))" }}>
                    <Heart className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>
                    내 몸에 딱 맞는 처방
                  </h3>
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

              <Card className="text-center border-2 transition-all hover:shadow-xl bg-white/80 backdrop-blur-sm" style={{ borderColor: "hsl(var(--herbal-border))" }}>
                <CardContent className="pt-8 pb-8">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, hsl(var(--herbal-accent)), hsl(var(--herbal-secondary)))" }}>
                    <Brain className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>
                    AI 정밀 체질검사
                  </h3>
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

              <Card className="text-center border-2 transition-all hover:shadow-xl bg-white/80 backdrop-blur-sm" style={{ borderColor: "hsl(var(--herbal-border))" }}>
                <CardContent className="pt-8 pb-8">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, hsl(var(--herbal-secondary)), hsl(var(--herbal-text-dark)))" }}>
                    <Target className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>
                    확실한 결과
                  </h3>
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

          {/* 체크 프로그램 메뉴 - 한의원 스타일 */}
          <div className="mb-12 sm:mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>
                한방체크 프로그램 선택
              </h2>
              <div className="w-24 h-1 mx-auto bg-gradient-to-r from-transparent via-[hsl(var(--herbal-primary))] to-transparent rounded-full"></div>
            </div>
            
            <div className="flex justify-center mb-12">
              {/* 3분 빠른 체질 체크 */}
              <Card className="relative overflow-hidden border-3 transition-all group w-full max-w-lg shadow-xl bg-white/90 backdrop-blur-sm" style={{ borderColor: "hsl(var(--herbal-primary))" }}>
                <div className="absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg" style={{ background: "linear-gradient(135deg, hsl(var(--herbal-accent)), hsl(var(--herbal-primary-light)))" }}>
                  推薦
                </div>
                <div className="absolute top-0 left-0 w-full h-2" style={{ background: "linear-gradient(90deg, hsl(var(--herbal-primary)), hsl(var(--herbal-accent)), hsl(var(--herbal-primary)))" }}></div>
                <CardHeader className="pb-4 pt-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, hsl(var(--herbal-primary-light)), hsl(var(--herbal-primary)))" }}>
                      <Clock className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>3분 빠른 체질검사</CardTitle>
                      <p className="text-base" style={{ color: "hsl(var(--herbal-secondary))" }}>간편하고 빠른 기본 분석</p>
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
                    className="w-full text-white text-lg font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    style={{ 
                      background: "linear-gradient(135deg, hsl(var(--herbal-primary)), hsl(var(--herbal-primary-light)))",
                      fontFamily: "'Noto Serif KR', serif"
                    }}
                    onClick={() => handleTestSelection('quick')}
                  >
                    3분만에 시작하기 →
                  </Button>
                </CardContent>
              </Card>

              {/* 프리미엄 정밀 체질 분석 - 기능 비활성화로 임시 제거 */}
            </div>

            {/* 추가 특화 체크 프로그램 - 한의원 스타일 */}
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>
                  특화 체질검사 프로그램
                </h3>
                <p className="text-base" style={{ color: "hsl(var(--herbal-secondary))" }}>증상별 맞춤형 한방 솔루션</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 다이어트 체질 분석 */}
                <Card className="border-2 transition-all hover:shadow-lg bg-white/80 backdrop-blur-sm group" style={{ borderColor: "hsl(var(--herbal-border))" }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--herbal-accent)), hsl(var(--herbal-secondary)))" }}>
                        <Weight className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>다이어트 체질 분석</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4" style={{ color: "hsl(var(--herbal-secondary))" }}>효과적인 다이어트 방법 찾기</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full font-bold border-2 transition-all group-hover:text-white"
                      style={{ 
                        borderColor: "hsl(var(--herbal-accent))",
                        color: "hsl(var(--herbal-text-dark))"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "linear-gradient(135deg, hsl(var(--herbal-accent)), hsl(var(--herbal-secondary)))"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      onClick={() => handleTestSelection('diet')}
                    >
                      시작하기
                    </Button>
                  </CardContent>
                </Card>

                {/* 스트레스 체크 */}
                <Card className="border-2 transition-all hover:shadow-lg bg-white/80 backdrop-blur-sm group" style={{ borderColor: "hsl(var(--herbal-border))" }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--herbal-primary)), hsl(var(--herbal-primary-light)))" }}>
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>스트레스 검사</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4" style={{ color: "hsl(var(--herbal-secondary))" }}>스트레스 수준과 관리법</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full font-bold border-2 transition-all group-hover:text-white"
                      style={{ 
                        borderColor: "hsl(var(--herbal-primary))",
                        color: "hsl(var(--herbal-text-dark))"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "linear-gradient(135deg, hsl(var(--herbal-primary)), hsl(var(--herbal-primary-light)))"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      onClick={() => handleTestSelection('stress')}
                    >
                      시작하기
                    </Button>
                  </CardContent>
                </Card>

                {/* 여성 건강 체크 */}
                <Card className="border-2 transition-all hover:shadow-lg bg-white/80 backdrop-blur-sm group" style={{ borderColor: "hsl(var(--herbal-border))" }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #ec4899, #f472b6)" }}>
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>여성 건강검사</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4" style={{ color: "hsl(var(--herbal-secondary))" }}>여성 특화 건강 관리</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full font-bold border-2 transition-all group-hover:text-white"
                      style={{ 
                        borderColor: "#ec4899",
                        color: "hsl(var(--herbal-text-dark))"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "linear-gradient(135deg, #ec4899, #f472b6)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      onClick={() => handleTestSelection('women')}
                    >
                      시작하기
                    </Button>
                  </CardContent>
                </Card>

                {/* 자폐 스펙트럼 체크 */}
                <Card className="border-2 transition-all hover:shadow-lg bg-white/80 backdrop-blur-sm group" style={{ borderColor: "hsl(var(--herbal-border))" }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3b82f6, #60a5fa)" }}>
                        <Smile className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>발달검사</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4" style={{ color: "hsl(var(--herbal-secondary))" }}>아동 발달 상태 확인</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full font-bold border-2 transition-all group-hover:text-white"
                      style={{ 
                        borderColor: "#3b82f6",
                        color: "hsl(var(--herbal-text-dark))"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "linear-gradient(135deg, #3b82f6, #60a5fa)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      onClick={() => handleTestSelection('autism')}
                    >
                      시작하기
                    </Button>
                  </CardContent>
                </Card>

                {/* ADHD 체크 */}
                <Card className="border-2 transition-all hover:shadow-lg bg-white/80 backdrop-blur-sm group" style={{ borderColor: "hsl(var(--herbal-border))" }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #eab308, #facc15)" }}>
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>ADHD 검사</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4" style={{ color: "hsl(var(--herbal-secondary))" }}>주의력 결핍 과잉행동 확인</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full font-bold border-2 transition-all group-hover:text-white"
                      style={{ 
                        borderColor: "#eab308",
                        color: "hsl(var(--herbal-text-dark))"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "linear-gradient(135deg, #eab308, #facc15)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      onClick={() => handleTestSelection('adhd')}
                    >
                      시작하기
                    </Button>
                  </CardContent>
                </Card>

                {/* 지적발달 체크 */}
                <Card className="border-2 transition-all hover:shadow-lg bg-white/80 backdrop-blur-sm group" style={{ borderColor: "hsl(var(--herbal-border))" }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>지적발달 검사</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4" style={{ color: "hsl(var(--herbal-secondary))" }}>인지 능력 확인</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full font-bold border-2 transition-all group-hover:text-white"
                      style={{ 
                        borderColor: "#6366f1",
                        color: "hsl(var(--herbal-text-dark))"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "linear-gradient(135deg, #6366f1, #818cf8)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      onClick={() => handleTestSelection('intellectual')}
                    >
                      시작하기
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* 성과 및 신뢰성 섹션 - 한의원 스타일 */}
          <div className="text-center mb-12 px-4 py-12 rounded-3xl" style={{ background: "linear-gradient(135deg, hsl(var(--herbal-bg)), hsl(var(--herbal-bg-warm)))" }}>
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>
                검증된 한방 솔루션
              </h2>
              <div className="w-24 h-1 mx-auto bg-gradient-to-r from-transparent via-[hsl(var(--herbal-accent))] to-transparent rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm shadow-lg">
                <div className="text-4xl sm:text-5xl font-bold mb-3" style={{ background: "linear-gradient(135deg, hsl(var(--herbal-primary)), hsl(var(--herbal-accent)))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>97%</div>
                <p className="text-base font-medium" style={{ color: "hsl(var(--herbal-text-dark))" }}>사용자 만족도</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm shadow-lg">
                <div className="text-4xl sm:text-5xl font-bold mb-3" style={{ background: "linear-gradient(135deg, hsl(var(--herbal-accent)), hsl(var(--herbal-secondary)))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>50,000+</div>
                <p className="text-base font-medium" style={{ color: "hsl(var(--herbal-text-dark))" }}>누적 체크 건수</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm shadow-lg">
                <div className="text-4xl sm:text-5xl font-bold mb-3" style={{ background: "linear-gradient(135deg, hsl(var(--herbal-secondary)), hsl(var(--herbal-primary)))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>100+</div>
                <p className="text-base font-medium" style={{ color: "hsl(var(--herbal-text-dark))" }}>협력 한의원</p>
              </div>
            </div>
          </div>

          {/* 전문가 상담 CTA - 한의원 스타일 */}
          <div className="text-center mb-12 p-8 rounded-3xl shadow-xl" style={{ background: "linear-gradient(135deg, hsl(var(--herbal-primary-light)), hsl(var(--herbal-primary)))" }}>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Noto Serif KR', serif" }}>
              한의 전문가 상담이 필요하신가요?
            </h3>
            <p className="text-white/90 mb-8 text-lg">
              천년 한의학 전통의 전문의와 1:1 맞춤 상담을 받아보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                <Phone className="h-5 w-5 text-white" />
                <span className="text-white font-medium">상담 문의: 010-6624-9990</span>
              </div>
              <Button 
                className="px-8 py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                style={{ 
                  background: "white",
                  color: "hsl(var(--herbal-primary))",
                  fontFamily: "'Noto Serif KR', serif"
                }}
              >
                전문가 상담 예약 →
              </Button>
            </div>
          </div>

          {/* 인증 및 신뢰성 배지 - 한의원 스타일 */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full shadow-lg" style={{ background: "linear-gradient(135deg, hsl(var(--herbal-bg)), hsl(var(--herbal-bg-warm)))" }}>
              <span className="text-2xl">✨</span>
              <span className="font-bold text-lg" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>
                <span style={{ color: "hsl(var(--herbal-accent))" }}>100+</span> 한의원에서 신뢰하는 AI 한방 시스템
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HanMedicineTest;