import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionGuard } from '@/components/subscription/SubscriptionGuard';
import { ResultPaywall } from '@/components/subscription/ResultPaywall';
import { Button } from '@/components/ui/button';
import { Crown, Heart, Clock, Star, Brain, Sparkles, Weight, Pill, Target, CheckCircle, Users, Zap, Shield, Activity, Smile, Phone, Moon, UtensilsCrossed } from 'lucide-react';
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
import { useLanguage } from '@/i18n/LanguageContext';

type TestType = 'none' | 'quick' | 'premium' | 'diet' | 'autism' | 'adhd' | 'intellectual' | 'atopy' | 'stress' | 'women';
type TestState = 'select' | 'testing' | 'result';

const HanMedicineTestInner = () => {
  const [currentTest, setCurrentTest] = useState<TestType>('none');
  const [testState, setTestState] = useState<TestState>('select');
  const [testResult, setTestResult] = useState<any>(null);
  const { isEnglish } = useLanguage();

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
          <SasangConstitutionTest onComplete={handleTestComplete} onBack={handleRestart} />
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
      return (<div><UnifiedNavigation /><AutismTest onComplete={handleTestComplete} onBack={handleRestart} /></div>);
    } else if (currentTest === 'adhd') {
      return (<div><UnifiedNavigation /><AdhdTest onComplete={handleTestComplete} onBack={handleRestart} /></div>);
    } else if (currentTest === 'intellectual') {
      return (<div><UnifiedNavigation /><IntellectualDisabilityTest onComplete={handleTestComplete} onBack={handleRestart} /></div>);
    } else if (currentTest === 'atopy') {
      return (<div><UnifiedNavigation /><AtopyTest onComplete={handleTestComplete} onBack={handleRestart} /></div>);
    } else if (currentTest === 'stress') {
      return (<div><UnifiedNavigation /><StressTest onComplete={handleTestComplete} onBack={handleRestart} /></div>);
    } else if (currentTest === 'women') {
      return (<div><UnifiedNavigation /><WomensHealthTest onComplete={handleTestComplete} onBack={handleRestart} /></div>);
    }
  }

  if (testState === 'result' && testResult) {
    const resultContent = (() => {
      if (currentTest === 'quick') {
        return (<div className="relative"><HerbalClinic3DBackground /><UnifiedNavigation /><EnhancedConstitutionResult result={testResult} onRestart={handleRestart} /></div>);
      } else if (currentTest === 'premium') {
        return (<div><UnifiedNavigation /><HanMedicinePremiumResult result={testResult} onRestart={handleRestart} /></div>);
      } else if (currentTest === 'diet') {
        return (<div><UnifiedNavigation /><DietAnalysisResult result={testResult} onRestart={handleRestart} /></div>);
      } else if (currentTest === 'women') {
        return (<div><UnifiedNavigation /><WomensHealthResult result={testResult} onRestart={handleRestart} /></div>);
      } else if (['autism', 'adhd', 'intellectual', 'atopy', 'stress'].includes(currentTest)) {
        return (<div><UnifiedNavigation /><HanMedicineResult result={testResult} onRestart={handleRestart} /></div>);
      }
      return null;
    })();
    return <ResultPaywall>{resultContent}</ResultPaywall>;
  }

  const t = {
    banner: isEnglish ? 'Ancient Wisdom × AI Technology' : '千年의 智慧 × AI 技術',
    title: isEnglish ? 'Constitution & Lifestyle Coaching Center' : '체질·라이프스타일 코칭 센터',
    subtitle: isEnglish ? 'Traditional Korean wellness wisdom meets AI to coach your daily lifestyle (educational use only).' : '전통 한방 웰니스 지혜와 AI가 만나 일상 라이프스타일을 코칭합니다 (교육·자기이해 목적).',
    tag1: isEnglish ? 'Wellness Tradition Insights' : '한의학 기반 인사이트',
    tag2: isEnglish ? 'AI Constitution Insights' : 'AI 체질 분석',
    tag3: isEnglish ? 'Personalized Lifestyle Plan' : '맞춤 라이프스타일 플랜',
    findTitle: isEnglish ? 'Discover Your Constitution for Better Lifestyle' : '나만의 體質을 찾아 더 나은 일상으로',
    findSubtitle: isEnglish ? 'Ancient Korean wellness wisdom meets modern AI for <strong>your personalized lifestyle plan</strong>' : '千年의 한의학 지혜와 현대 AI가 만나 <strong>당신만의 맞춤 라이프스타일 플랜</strong>을 제공합니다',
    card1Title: isEnglish ? 'Tailored Lifestyle Plan' : '내 몸에 딱 맞는 라이프스타일 플랜',
    card1f1: isEnglish ? 'Constitution-based diet guide' : '체질별 맞춤 식단 가이드',
    card1f2: isEnglish ? 'Personalized exercise guide' : '개인별 운동 가이드',
    card1f3: isEnglish ? 'Lifestyle improvement coaching' : '생활습관 개선 코칭',
    card2Title: isEnglish ? 'AI Constitution Insights' : 'AI 정밀 체질 분석',
    card2f1: isEnglish ? 'Sasang constitution insights' : '한의학 사상체질 인사이트',
    card2f2: isEnglish ? 'Metabolism type insights' : '대사 타입 인사이트',
    card2f3: isEnglish ? 'Nutrient absorption insights' : '영양소 흡수 경향 인사이트',
    card3Title: isEnglish ? 'Trusted Coaching' : '신뢰받는 코칭',
    card3f1: isEnglish ? '97% satisfaction rate' : '97% 만족도',
    card3f2: isEnglish ? 'Expert reviewed' : '전문가 검토 완료',
    card3f3: isEnglish ? 'Continuous care system' : '지속적 관리 시스템',
    programTitle: isEnglish ? 'Select a Program' : '체질 코칭 프로그램 선택',
    recommended: '推薦',
    quickTitle: isEnglish ? '3-Min Quick Constitution Check' : '3분 빠른 체질 체크',
    quickDesc: isEnglish ? 'Quick and simple lifestyle insights' : '간편하고 빠른 라이프스타일 인사이트',
    quickF1: isEnglish ? 'Basic Sasang constitution insights' : '기본 사상체질 인사이트',
    quickF2: isEnglish ? 'Constitution-friendly food suggestions' : '체질별 음식 추천',
    quickF3: isEnglish ? 'Basic lifestyle guide' : '기본 생활습관 가이드',
    quickBtn: isEnglish ? 'Start in 3 minutes →' : '3분만에 시작하기 →',
    specialTitle: isEnglish ? 'Specialized Coaching Programs' : '특화 체질 코칭 프로그램',
    specialDesc: isEnglish ? 'Custom self-checks for personalized lifestyle coaching' : '맞춤 라이프스타일 코칭을 위한 자가 체크',
    dietTitle: isEnglish ? 'Diet Constitution Insights' : '다이어트 체질 인사이트',
    dietDesc: isEnglish ? 'Constitution-friendly diet coaching' : '체질별 맞춤 다이어트 코칭',
    fatigueTitle: isEnglish ? 'Fatigue Recovery Check' : '피로 회복 체질 체크',
    fatigueDesc: isEnglish ? 'Lifestyle coaching for chronic fatigue' : '만성피로 개선 라이프스타일 코칭',
    insomniaTitle: isEnglish ? 'Sleep Constitution Check' : '수면 체질 체크',
    insomniaDesc: isEnglish ? 'Sleep improvement lifestyle guide' : '수면 개선 라이프스타일 가이드',
    digestTitle: isEnglish ? 'Digestive Health Check' : '소화기 건강 체크',
    digestDesc: isEnglish ? 'Digestive lifestyle coaching' : '위장 기능 개선 라이프스타일 코칭',
    womenTitle: isEnglish ? "Women's Wellness Check" : '여성 웰니스 체크',
    womenDesc: isEnglish ? 'Cycle & menopause lifestyle coaching' : '생리·갱년기 라이프스타일 코칭',
    immuneTitle: isEnglish ? 'Immunity Lifestyle Check' : '면역력 라이프스타일 체크',
    immuneDesc: isEnglish ? 'Immune-supportive lifestyle guide' : '면역력 증진 라이프스타일 가이드',
    startBtn: isEnglish ? 'Start' : '시작하기',
    provenTitle: isEnglish ? 'Trusted Wellness Coaching' : '신뢰받는 웰니스 코칭',
    stat1: isEnglish ? 'User satisfaction' : '사용자 만족도',
    stat2: isEnglish ? 'Total checks completed' : '누적 체크 건수',
    stat3: isEnglish ? 'Partner clinics' : '협력 한의원',
    partnerLabel: isEnglish ? 'Expert Consultation' : '전문가 상담',
    partnerName: isEnglish ? 'Licensed Korean Medicine Expert Consultation' : '면허 한의사 전문가 상담',
    partnerDesc: isEnglish ? 'Receive a 1:1 personalized consultation with a licensed traditional medicine specialist based on your insights.' : '체질 인사이트를 바탕으로 면허 한의사와 1:1 맞춤 상담을 받아보세요 (모든 의료 행위는 면허 전문가를 통해서만 이루어집니다).',
    contactBtn: isEnglish ? 'View Experts' : '전문가 보기',
    bookBtn: isEnglish ? 'Book Expert Consultation →' : '전문가 상담 예약 →',
    trustBadge: isEnglish ? 'experts trust our AI wellness coaching system' : '전문가가 신뢰하는 AI 웰니스 코칭 시스템',
  };

  return (
    <div className="relative bg-gradient-to-br from-[hsl(var(--herbal-bg))] via-[hsl(var(--herbal-bg-warm))] to-[hsl(var(--herbal-bg))]">
      <HerbalClinic3DBackground />
      <UnifiedNavigation />
      <div className="min-h-screen py-8 sm:py-12 px-4 pt-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16 flex flex-col items-center px-2">
            <div className="inline-block mb-6 px-8 py-3 bg-gradient-to-r from-[hsl(var(--herbal-primary))] to-[hsl(var(--herbal-primary-light))] rounded-full shadow-lg">
              <span className="text-white font-bold text-sm tracking-wider">{t.banner}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: "'Noto Serif KR', 'Gowun Batang', serif", color: "hsl(var(--herbal-text-dark))" }}>
              {t.title}
            </h1>
            <p className="text-base sm:text-xl mb-6" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-secondary))" }}>
              {t.subtitle}
            </p>
            <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--herbal-primary))]"></div>
                <span className="text-[hsl(var(--herbal-text-dark))]">{t.tag1}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--herbal-accent))]"></div>
                <span className="text-[hsl(var(--herbal-text-dark))]">{t.tag2}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--herbal-secondary))]"></div>
                <span className="text-[hsl(var(--herbal-text-dark))]">{t.tag3}</span>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="mb-12 sm:mb-16 flex flex-col items-center text-center px-2">
            <div className="mb-6">
              <h2 className="text-[1.25rem] sm:text-4xl font-bold mb-4 whitespace-nowrap" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>
                {isEnglish ? t.findTitle : <>나만의 <span style={{ color: "hsl(var(--herbal-primary))" }}>體質</span>을 찾아 건강해지세요</>}
              </h2>
              <div className="w-24 h-1 mx-auto bg-gradient-to-r from-transparent via-[hsl(var(--herbal-accent))] to-transparent rounded-full"></div>
            </div>
            <p className="text-base sm:text-xl mb-12 max-w-2xl" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-secondary))" }} dangerouslySetInnerHTML={{ __html: t.findSubtitle }} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 w-full max-w-5xl">
              {[
                { icon: Heart, title: t.card1Title, features: [t.card1f1, t.card1f2, t.card1f3], gradient: "linear-gradient(135deg, hsl(var(--herbal-primary-light)), hsl(var(--herbal-primary)))" },
                { icon: Brain, title: t.card2Title, features: [t.card2f1, t.card2f2, t.card2f3], gradient: "linear-gradient(135deg, hsl(var(--herbal-accent)), hsl(var(--herbal-secondary)))" },
                { icon: Target, title: t.card3Title, features: [t.card3f1, t.card3f2, t.card3f3], gradient: "linear-gradient(135deg, hsl(var(--herbal-secondary)), hsl(var(--herbal-text-dark)))" },
              ].map((card, i) => (
                <Card key={i} className="text-center border-2 transition-all hover:shadow-xl bg-white/80 backdrop-blur-sm" style={{ borderColor: "hsl(var(--herbal-border))" }}>
                  <CardContent className="pt-8 pb-8">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: card.gradient }}>
                      <card.icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>{card.title}</h3>
                    <div className="space-y-3">
                      {card.features.map((f, j) => (
                        <div key={j} className="flex items-center justify-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground text-left">{f}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <ExpertValidationBanner />
          </div>

          {/* Quick Test */}
          <div className="mb-12 sm:mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>{t.programTitle}</h2>
              <div className="w-24 h-1 mx-auto bg-gradient-to-r from-transparent via-[hsl(var(--herbal-primary))] to-transparent rounded-full"></div>
            </div>
            
            <div className="flex justify-center mb-12">
              <Card className="relative overflow-hidden border-3 transition-all group w-full max-w-lg shadow-xl bg-white/90 backdrop-blur-sm" style={{ borderColor: "hsl(var(--herbal-primary))" }}>
                <div className="absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg" style={{ background: "linear-gradient(135deg, hsl(var(--herbal-accent)), hsl(var(--herbal-primary-light)))" }}>
                  {t.recommended}
                </div>
                <div className="absolute top-0 left-0 w-full h-2" style={{ background: "linear-gradient(90deg, hsl(var(--herbal-primary)), hsl(var(--herbal-accent)), hsl(var(--herbal-primary)))" }}></div>
                <CardHeader className="pb-4 pt-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, hsl(var(--herbal-primary-light)), hsl(var(--herbal-primary)))" }}>
                      <Clock className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>{t.quickTitle}</CardTitle>
                      <p className="text-base" style={{ color: "hsl(var(--herbal-secondary))" }}>{t.quickDesc}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {[t.quickF1, t.quickF2, t.quickF3].map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">{f}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full text-white text-lg font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    style={{ background: "linear-gradient(135deg, hsl(var(--herbal-primary)), hsl(var(--herbal-primary-light)))", fontFamily: "'Noto Serif KR', serif" }}
                    onClick={() => handleTestSelection('quick')}
                  >
                    {t.quickBtn}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Specialized Programs */}
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>{t.specialTitle}</h3>
                <p className="text-base" style={{ color: "hsl(var(--herbal-secondary))" }}>{t.specialDesc}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: Weight, title: t.dietTitle, desc: t.dietDesc, gradient: "linear-gradient(135deg, hsl(var(--herbal-accent)), hsl(var(--herbal-secondary)))", border: "hsl(var(--herbal-accent))", test: 'diet' as TestType },
                  { icon: Activity, title: t.fatigueTitle, desc: t.fatigueDesc, gradient: "linear-gradient(135deg, #f97316, #fb923c)", border: "#f97316", test: 'stress' as TestType },
                  { icon: Moon, title: t.insomniaTitle, desc: t.insomniaDesc, gradient: "linear-gradient(135deg, #6366f1, #818cf8)", border: "#6366f1", test: 'stress' as TestType },
                  { icon: UtensilsCrossed, title: t.digestTitle, desc: t.digestDesc, gradient: "linear-gradient(135deg, #10b981, #34d399)", border: "#10b981", test: 'stress' as TestType },
                  { icon: Heart, title: t.womenTitle, desc: t.womenDesc, gradient: "linear-gradient(135deg, #ec4899, #f472b6)", border: "#ec4899", test: 'women' as TestType },
                  { icon: Shield, title: t.immuneTitle, desc: t.immuneDesc, gradient: "linear-gradient(135deg, hsl(var(--herbal-primary)), hsl(var(--herbal-primary-light)))", border: "hsl(var(--herbal-primary))", test: 'stress' as TestType },
                ].map((item, i) => (
                  <Card key={i} className="border-2 transition-all hover:shadow-lg bg-white/80 backdrop-blur-sm group" style={{ borderColor: "hsl(var(--herbal-border))" }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: item.gradient }}>
                          <item.icon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-lg" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>{item.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4" style={{ color: "hsl(var(--herbal-secondary))" }}>{item.desc}</p>
                      <Button 
                        variant="outline" size="sm" 
                        className="w-full font-bold border-2 transition-all group-hover:text-white"
                        style={{ borderColor: item.border, color: "hsl(var(--herbal-text-dark))" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = item.gradient}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        onClick={() => handleTestSelection(item.test)}
                      >
                        {t.startBtn}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="text-center mb-12 px-4 py-12 rounded-3xl" style={{ background: "linear-gradient(135deg, hsl(var(--herbal-bg)), hsl(var(--herbal-bg-warm)))" }}>
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>{t.provenTitle}</h2>
              <div className="w-24 h-1 mx-auto bg-gradient-to-r from-transparent via-[hsl(var(--herbal-accent))] to-transparent rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { value: '97%', label: t.stat1, gradient: "linear-gradient(135deg, hsl(var(--herbal-primary)), hsl(var(--herbal-accent)))" },
                { value: '50,000+', label: t.stat2, gradient: "linear-gradient(135deg, hsl(var(--herbal-accent)), hsl(var(--herbal-secondary)))" },
                { value: '5+', label: t.stat3, gradient: "linear-gradient(135deg, hsl(var(--herbal-secondary)), hsl(var(--herbal-primary)))" },
              ].map((stat, i) => (
                <div key={i} className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm shadow-lg">
                  <div className="text-4xl sm:text-5xl font-bold mb-3" style={{ background: stat.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{stat.value}</div>
                  <p className="text-base font-medium" style={{ color: "hsl(var(--herbal-text-dark))" }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mb-12 p-8 rounded-3xl shadow-xl" style={{ background: "linear-gradient(135deg, hsl(var(--herbal-primary-light)), hsl(var(--herbal-primary)))" }}>
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-4">{t.partnerLabel}</span>
            </div>
            <h3 className="text-xl sm:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Noto Serif KR', serif" }}>{t.partnerName}</h3>
            <p className="text-white/90 mb-8 text-lg">{t.partnerDesc}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => window.location.href = '/expert-hiring'}
                className="px-8 py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                style={{ background: "white", color: "hsl(var(--herbal-primary))", fontFamily: "'Noto Serif KR', serif" }}
              >
                <Star className="h-5 w-5" />
                {t.contactBtn}
              </Button>
              <Button 
                onClick={() => window.location.href = '/expert-hiring'}
                className="px-8 py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                style={{ background: "rgba(255, 255, 255, 0.2)", color: "white", border: "2px solid white", fontFamily: "'Noto Serif KR', serif" }}
              >
                {t.bookBtn}
              </Button>
            </div>
          </div>

          {/* Trust badge */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full shadow-lg" style={{ background: "linear-gradient(135deg, hsl(var(--herbal-bg)), hsl(var(--herbal-bg-warm)))" }}>
              <span className="text-2xl">✨</span>
              <span className="font-bold text-lg" style={{ fontFamily: "'Noto Serif KR', serif", color: "hsl(var(--herbal-text-dark))" }}>
                <span style={{ color: "hsl(var(--herbal-accent))" }}>5+</span> {t.trustBadge}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HanMedicineTest = () => (
  <SubscriptionGuard consumeAt="result" featureName={
    window.location.pathname.startsWith('/en') ? 'Herbal Constitution Analysis' : '한방 체질분석'
  } trialKey="HAN_MEDICINE_TEST">
    <HanMedicineTestInner />
  </SubscriptionGuard>
);

export default HanMedicineTest;
