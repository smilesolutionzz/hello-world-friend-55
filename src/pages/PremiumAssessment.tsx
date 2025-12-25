import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Clock, Users, CheckCircle, Star, Coins, ChevronDown, Brain, Heart, Briefcase, DollarSign, UserCheck, AlertTriangle, Eye, Baby, Palette, Shield, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthenticationGuard from "@/components/observation/AuthenticationGuard";
import { MedicalDisclaimer } from "@/components/legal/MedicalDisclaimer";
import { useEventTracking } from "@/hooks/useEventTracking";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { useTokens } from "@/hooks/useTokens";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import PremiumAssessmentForm from "@/components/assessment/PremiumAssessmentForm";
import PremiumAssessmentResult from "@/components/assessment/PremiumAssessmentResult";
import OtrovertTest from "@/components/assessment/OtrovertTest";
import LanguageDevelopmentForm from "@/components/assessment/LanguageDevelopmentForm";
import LanguageDevelopmentResult from "@/components/assessment/LanguageDevelopmentResult";
import PremiumAdhdForm from "@/components/assessment/PremiumAdhdForm";
import PremiumAdhdResult from "@/components/assessment/PremiumAdhdResult";
import ParentingStyleForm from "@/components/assessment/ParentingStyleForm";
import ParentingStyleResult from "@/components/assessment/ParentingStyleResult";
import AutismSpectrumForm from "@/components/assessment/AutismSpectrumForm";
import AutismSpectrumResult from "@/components/assessment/AutismSpectrumResult";
import { HexacoTest } from "@/components/assessment/HexacoTest";
import { HexacoResult } from "@/components/assessment/HexacoResult";
import { InsuranceAnalysisForm } from "@/components/assessment/InsuranceAnalysisForm";
import { InsuranceAnalysisResult } from "@/components/assessment/InsuranceAnalysisResult";
import { DrawingAnalyzer } from "@/components/ai-analysis/DrawingAnalyzer";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  premiumAssessmentInfo,
  autismSpectrumScreeningQuestions,
  personalityTypeAssessmentQuestions,
  temperamentAssessmentQuestions, 
  cognitiveAssessmentQuestions,
  workStressAssessmentQuestions,
  
  lovePersonalityAssessmentQuestions,
  financialPsychologyAssessmentQuestions,
  teenMentalCompassAssessmentQuestions,
  teenGrowthCapacityAssessmentQuestions,
  socialDevelopmentScreeningQuestions,
  parentingStyleAssessmentQuestions
} from "@/data/premiumAssessmentQuestions";
import { allLanguageDevelopmentQuestions } from "@/data/languageDevelopmentQuestions";
import { premiumAdhdQuestions } from "@/data/premiumAdhdQuestions";

const PremiumAssessment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'list' | 'assessment' | 'result'>('list');
  const [selectedAssessment, setSelectedAssessment] = useState<string>('');
  const [assessmentResults, setAssessmentResults] = useState<any>({});
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});
  const [isSubscribed] = useState(true); // TODO: 실제 구독 상태로 연동
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [insuranceResults, setInsuranceResults] = useState<any>(null);
  const { trackTestStart, trackTestComplete, trackPageView } = useEventTracking();
  const { consumeTokens, checkTokenAvailability } = useTokens();

  const assessmentData = {
    autismSpectrumScreening: Object.values(autismSpectrumScreeningQuestions).flat(),
    premiumAdhd: Object.values(premiumAdhdQuestions).flat(),
    
    personality_type: Object.values(personalityTypeAssessmentQuestions).flat(),
    temperament: Object.values(temperamentAssessmentQuestions).flat(),
    cognitive: Object.values(cognitiveAssessmentQuestions).flat(),
    work_stress: Object.values(workStressAssessmentQuestions).flat(),
    
    love_personality: Object.values(lovePersonalityAssessmentQuestions || {}).flat(),
    financialPsychology: Object.values(financialPsychologyAssessmentQuestions).flat(),
    teenMentalCompass: Object.values(teenMentalCompassAssessmentQuestions).flat(),
    teenGrowthCapacity: Object.values(teenGrowthCapacityAssessmentQuestions).flat(),
    socialDevelopmentScreening: Object.values(socialDevelopmentScreeningQuestions).flat(),
    languageDevelopment: allLanguageDevelopmentQuestions,
    parentingStyle: Object.values(parentingStyleAssessmentQuestions).flat()
  };

  const handleStartAssessment = async (assessmentKey: string) => {
    // 토큰 확인 및 소비
    const hasTokens = await checkTokenAvailability(TOKEN_COSTS.PREMIUM_ASSESSMENT);
    if (!hasTokens) {
      navigate('/token-subscription');
      return;
    }

    const consumed = await consumeTokens(TOKEN_COSTS.PREMIUM_ASSESSMENT);
    if (!consumed) {
      navigate('/token-subscription');
      return;
    }
    
    setSelectedAssessment(assessmentKey);
    setCurrentStep('assessment');
  };

  const handleAssessmentComplete = (results: any, answers?: Record<string, string>) => {
    console.log('Premium Assessment Results:', results);
    setAssessmentResults(results);
    if (answers) {
      setAssessmentAnswers(answers);
    }
    setCurrentStep('result');
  };

  const handleAdhdAssessmentComplete = (results: any) => {
    console.log('Premium ADHD Assessment Results:', results);
    setAssessmentResults(results);
    setCurrentStep('result');
  };

  const handleBack = () => {
    if (currentTest) {
      setCurrentTest(null);
      return;
    }
    if (insuranceResults) {
      setInsuranceResults(null);
      return;
    }
    if (currentStep === 'result') {
      setCurrentStep('list');
    } else if (currentStep === 'assessment') {
      setCurrentStep('list');
    } else {
      navigate('/dashboard');
    }
  };

  const handleInsuranceComplete = (results: any) => {
    console.log('Insurance Analysis Results:', results);
    setInsuranceResults(results);
  };

  const handleOtrovertComplete = (result: any, testType: string) => {
    navigate('/fun-test-result', { 
      state: { result, testType } 
    });
  };

  // 오트로버트 테스트 화면
  if (currentTest === 'otrovert') {
    return <OtrovertTest onComplete={handleOtrovertComplete} onBack={handleBack} />;
  }

  // 보험진단 폼
  if (currentTest === 'insurance-analysis') {
    if (insuranceResults) {
      return (
        <InsuranceAnalysisResult
          results={insuranceResults}
          onBack={() => {
            setCurrentTest(null);
            setInsuranceResults(null);
          }}
        />
      );
    }
    
    return (
      <div>
        <UnifiedNavigation />
        <div className="pt-4">
          <InsuranceAnalysisForm onComplete={handleInsuranceComplete} />
        </div>
      </div>
    );
  }

  // 그림 심리 검사
  if (currentTest === 'drawing-analysis') {
    return (
      <div>
        <UnifiedNavigation />
        <div className="pt-4 container mx-auto px-4 max-w-4xl">
          <DrawingAnalyzer />
        </div>
      </div>
    );
  }

  // HEXACO Test
  if (currentTest === 'hexaco') {
    if (assessmentResults && Object.keys(assessmentResults).length > 0) {
      return (
        <HexacoResult
          result={assessmentResults}
          onBack={() => {
            setCurrentTest(null);
            setAssessmentResults({});
          }}
        />
      );
    }
    
    return (
      <div>
        <UnifiedNavigation />
        <div className="pt-4">
          <HexacoTest
            onComplete={(results) => {
              setAssessmentResults(results);
            }}
            onBack={() => setCurrentTest(null)}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'result' && selectedAssessment && Object.keys(assessmentResults).length > 0) {
    if (selectedAssessment === 'languageDevelopment') {
      return (
        <LanguageDevelopmentResult
          results={assessmentResults}
          answers={assessmentAnswers}
          onBack={handleBack}
        />
      );
    }

    if (selectedAssessment === 'autismSpectrumScreening') {
      return (
        <AutismSpectrumResult
          results={assessmentResults}
          answers={assessmentAnswers}
          onBack={handleBack}
        />
      );
    }

    if (selectedAssessment === 'premiumAdhd') {
      return (
        <PremiumAdhdResult
          results={assessmentResults}
          onBack={handleBack}
        />
      );
    }

    if (selectedAssessment === 'parentingStyle') {
      return (
        <ParentingStyleResult
          results={assessmentResults}
          onBack={handleBack}
        />
      );
    }

    return (
      <PremiumAssessmentResult
        assessmentType={selectedAssessment}
        results={assessmentResults}
        assessmentInfo={premiumAssessmentInfo[selectedAssessment as keyof typeof premiumAssessmentInfo]}
        onBack={handleBack}
      />
    );
  }

  if (currentStep === 'assessment' && selectedAssessment) {
    if (selectedAssessment === 'autismSpectrumScreening') {
      return (
        <div>
          <UnifiedNavigation />
          <div className="pt-4">
            <AutismSpectrumForm
              onComplete={handleAssessmentComplete}
              onBack={handleBack}
            />
          </div>
        </div>
      );
    }

    if (selectedAssessment === 'languageDevelopment') {
      return (
        <div>
          <UnifiedNavigation />
          <div className="pt-4">
            <LanguageDevelopmentForm
              onComplete={handleAssessmentComplete}
              onBack={handleBack}
            />
          </div>
        </div>
      );
    }

    if (selectedAssessment === 'premiumAdhd') {
      return (
        <div>
          <UnifiedNavigation />
          <div className="pt-4">
            <PremiumAdhdForm
              onComplete={handleAdhdAssessmentComplete}
              onBack={handleBack}
            />
          </div>
        </div>
      );
    }

    if (selectedAssessment === 'parentingStyle') {
      return (
        <div>
          <UnifiedNavigation />
          <div className="pt-4">
            <ParentingStyleForm
              onComplete={handleAssessmentComplete}
              onBack={handleBack}
            />
          </div>
        </div>
      );
    }

    return (
      <PremiumAssessmentForm
        assessmentType={selectedAssessment}
        questions={assessmentData[selectedAssessment as keyof typeof assessmentData]}
        assessmentInfo={premiumAssessmentInfo[selectedAssessment as keyof typeof premiumAssessmentInfo]}
        onComplete={handleAssessmentComplete}
        onBack={handleBack}
      />
    );
  }

  // 아코디언 상태 관리
  const [expandedTest, setExpandedTest] = useState<string | null>(null);

  // 검사 카테고리별 정의
  const testCategories = {
    neuroDevelopment: {
      title: "신경발달 검사",
      color: "bg-purple-500",
      hoverColor: "hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/20",
      activeColor: "text-purple-600",
      tests: [
        { key: 'autismSpectrumScreening', icon: Brain, badge: '🧠 AI 91%', badgeColor: 'bg-purple-500' },
        { key: 'premiumAdhd', icon: Brain, badge: '✨ NEW', badgeColor: 'bg-pink-500' },
        { key: 'languageDevelopment', icon: Baby, badge: '🔥 인기', badgeColor: 'bg-red-500' },
      ]
    },
    personality: {
      title: "성격·기질 검사",
      color: "bg-blue-500",
      hoverColor: "hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/20",
      activeColor: "text-blue-600",
      tests: [
        { key: 'personality_type', icon: Brain },
        { key: 'temperament', icon: Users },
        { key: 'love_personality', icon: Heart, badge: '💕 인기', badgeColor: 'bg-pink-500' },
      ]
    },
    lifeWork: {
      title: "직장·금전 검사",
      color: "bg-orange-500",
      hoverColor: "hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-950/20",
      activeColor: "text-orange-600",
      tests: [
        { key: 'work_stress', icon: Briefcase },
        { key: 'financialPsychology', icon: DollarSign },
        { key: 'cognitive', icon: Brain },
      ]
    },
    teen: {
      title: "청소년 검사",
      color: "bg-emerald-500",
      hoverColor: "hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20",
      activeColor: "text-emerald-600",
      tests: [
        { key: 'teenMentalCompass', icon: UserCheck },
        { key: 'teenGrowthCapacity', icon: AlertTriangle },
        { key: 'socialDevelopmentScreening', icon: Eye },
      ]
    },
    special: {
      title: "특수 검사",
      color: "bg-slate-500",
      hoverColor: "hover:border-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-950/20",
      activeColor: "text-slate-600",
      tests: [
        { key: 'otrovert', icon: Users, isSpecial: true, badge: '🎭 1위', badgeColor: 'bg-red-500' },
        { key: 'mbti', icon: Sparkles, isSpecial: true, badge: '🧠 2위', badgeColor: 'bg-blue-500' },
        { key: 'hexaco', icon: Crown, isSpecial: true, badge: '💎 NEW', badgeColor: 'bg-purple-500' },
        { key: 'drawing', icon: Palette, isSpecial: true, badge: 'AI 분석', badgeColor: 'bg-green-500' },
        { key: 'insurance', icon: Shield, isSpecial: true, badge: 'AI 전문가', badgeColor: 'bg-cyan-500' },
      ]
    }
  };

  // 특수 검사 정보
  const specialTestInfo: Record<string, any> = {
    otrovert: {
      title: "🎭 오트로버트 성격 체크",
      subtitle: "ASES-OT (Otrovert Spectrum Early Screening)",
      description: "외향? 내향? NO! 당신은 오트로버트일 수 있습니다. MBTI보다 정확한 20문항 정밀 분석으로 새로운 성격 유형을 발견하세요!",
      duration: "약 5-8분",
      questions_count: 20,
      premium_features: ["외향성-내향성 스펙트럼 정밀 분석", "91% 이상 정확도의 AI 분석", "성격 차원별 레이더 차트 제공"],
      onClick: () => setCurrentTest('otrovert'),
    },
    mbti: {
      title: "🧠 신박한 MBTI 검사",
      subtitle: "AI 분석 기반 창작 성격유형 검사",
      description: "AI가 분석하는 진짜 MBTI! 25문항으로 당신의 성격을 정확하게 파악하고, 기질별 퍼센트 그래프로 시각화합니다",
      duration: "약 5분",
      questions_count: 25,
      premium_features: ["4가지 기질별 퍼센트 분석", "AI 심층 성격 분석", "추천 직업 및 강점/약점 분석"],
      onClick: () => navigate('/assessment/mbti-test'),
    },
    hexaco: {
      title: "💎 퍼스널리티 컴퍼스",
      subtitle: "6차원 성격 나침반 검사",
      description: "진실성, 감성, 사교성, 조화성, 계획성, 탐구성 6가지 차원으로 당신의 성격을 심층 분석합니다",
      duration: "약 8-10분",
      questions_count: 48,
      premium_features: ["6가지 성격 차원 정밀 측정", "직업 및 경력 맞춤 인사이트", "3000자 AI 전문가 리포트"],
      onClick: () => setCurrentTest('hexaco'),
    },
    drawing: {
      title: "🎨 그림 심리 검사",
      subtitle: "HTP / KFD AI Analysis",
      description: "HTP, KFD 등 그림 검사를 AI가 자동으로 분석하여 심리 상태를 파악합니다",
      duration: "약 3-5분",
      questions_count: 0,
      premium_features: ["집-나무-사람(HTP) 분석", "동적 가족화(KFD) 분석", "심리 상태 및 위험도 평가"],
      onClick: () => setCurrentTest('drawing-analysis'),
    },
    insurance: {
      title: "💙 보험보장분석",
      subtitle: "Insurance Analysis",
      description: "증권 사진만 업로드하면 AI가 가족 보장을 분석합니다",
      duration: "약 5분",
      questions_count: 0,
      premium_features: ["보장 내역 자동 추출", "누락 보장 체크", "맞춤형 보완 제안"],
      onClick: () => setCurrentTest('insurance-analysis'),
    },
  };

  const handleTestClick = (key: string, isSpecial?: boolean) => {
    if (isSpecial) {
      specialTestInfo[key]?.onClick?.();
    } else {
      handleStartAssessment(key);
    }
  };

  return (
    <AuthenticationGuard fallbackMessage="프리미엄 심리검사를 이용하려면 로그인이 필요합니다." redirectPath="/auth">
      <div>
        <UnifiedNavigation />
        <div className="min-h-screen bg-background pt-4">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            
            {/* 헤더 */}
            <div className="mb-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                <h1 className="text-xl md:text-2xl font-bold text-foreground">심층테스트</h1>
              </div>
              <p className="text-muted-foreground text-xs md:text-sm mb-2">
                표면적인 결과가 아닌, 진짜 나를 마주하는 시간
              </p>
              <Badge className="bg-purple-500/90 text-white text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1">
                <Coins className="w-3 h-3 mr-1" />
                3,000원
              </Badge>
            </div>

            {/* 공식검사 안내 배너 */}
            <a 
              href="https://smilesolution.kr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block mb-6 p-3 md:p-4 bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-700 dark:to-slate-600 rounded-xl border border-slate-600 hover:from-slate-700 hover:to-slate-600 transition-all group shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-semibold text-white truncate">
                    🏥 공식검사 · 전문가 비대면 해석
                  </p>
                  <p className="text-[10px] md:text-xs text-slate-300 truncate">
                    온라인코드 발급 → 전문가 직접 해석
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-white flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </a>

            {/* ========== 신경발달 검사 섹션 ========== */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                <h2 className="text-lg font-bold text-foreground">신경발달 검사</h2>
                <span className="text-xs text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded font-medium">AI 정밀분석</span>
              </div>

              <div className="space-y-2">
                {['autismSpectrumScreening', 'premiumAdhd', 'languageDevelopment'].map((key) => {
                  const info = premiumAssessmentInfo[key as keyof typeof premiumAssessmentInfo];
                  if (!info) return null;
                  const isExpanded = expandedTest === key;
                  
                  return (
                    <Collapsible key={key} open={isExpanded} onOpenChange={() => setExpandedTest(isExpanded ? null : key)}>
                      <CollapsibleTrigger asChild>
                        <button className="w-full group text-left p-4 rounded-xl border border-border hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground group-hover:text-purple-600">{info.title}</h3>
                                {info.badge && (
                                  <Badge className="bg-purple-500 text-white text-[10px] px-1.5 py-0">{info.badge}</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{info.duration} · {info.questions_count}문항</p>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mx-2 p-4 bg-muted/30 rounded-b-xl border-x border-b border-border space-y-4">
                          <p className="text-sm text-muted-foreground">{info.description}</p>
                          <div className="space-y-1.5">
                            {info.premium_features.slice(0, 4).map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                <span className="text-muted-foreground">{feature}</span>
                              </div>
                            ))}
                          </div>
                          <Button 
                            onClick={() => handleStartAssessment(key)}
                            className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                          >
                            검사 시작하기
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </section>

            {/* ========== 성격·기질 검사 섹션 ========== */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                <h2 className="text-lg font-bold text-foreground">성격·기질 검사</h2>
              </div>

              <div className="space-y-2">
                {['personality_type', 'temperament', 'love_personality'].map((key) => {
                  const info = premiumAssessmentInfo[key as keyof typeof premiumAssessmentInfo];
                  if (!info) return null;
                  const isExpanded = expandedTest === key;
                  
                  return (
                    <Collapsible key={key} open={isExpanded} onOpenChange={() => setExpandedTest(isExpanded ? null : key)}>
                      <CollapsibleTrigger asChild>
                        <button className="w-full group text-left p-4 rounded-xl border border-border hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground group-hover:text-blue-600">{info.title}</h3>
                                {info.badge && (
                                  <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0">{info.badge}</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{info.duration} · {info.questions_count}문항</p>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mx-2 p-4 bg-muted/30 rounded-b-xl border-x border-b border-border space-y-4">
                          <p className="text-sm text-muted-foreground">{info.description}</p>
                          <div className="space-y-1.5">
                            {info.premium_features.slice(0, 4).map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                <span className="text-muted-foreground">{feature}</span>
                              </div>
                            ))}
                          </div>
                          <Button 
                            onClick={() => handleStartAssessment(key)}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            검사 시작하기
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </section>

            {/* ========== 직장·금전 검사 섹션 ========== */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                <h2 className="text-lg font-bold text-foreground">직장·금전 검사</h2>
              </div>

              <div className="space-y-2">
                {['work_stress', 'financialPsychology', 'cognitive'].map((key) => {
                  const info = premiumAssessmentInfo[key as keyof typeof premiumAssessmentInfo];
                  if (!info) return null;
                  const isExpanded = expandedTest === key;
                  
                  return (
                    <Collapsible key={key} open={isExpanded} onOpenChange={() => setExpandedTest(isExpanded ? null : key)}>
                      <CollapsibleTrigger asChild>
                        <button className="w-full group text-left p-4 rounded-xl border border-border hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground group-hover:text-orange-600">{info.title}</h3>
                                {info.badge && (
                                  <Badge className="bg-orange-500 text-white text-[10px] px-1.5 py-0">{info.badge}</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{info.duration} · {info.questions_count}문항</p>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mx-2 p-4 bg-muted/30 rounded-b-xl border-x border-b border-border space-y-4">
                          <p className="text-sm text-muted-foreground">{info.description}</p>
                          <div className="space-y-1.5">
                            {info.premium_features.slice(0, 4).map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                <span className="text-muted-foreground">{feature}</span>
                              </div>
                            ))}
                          </div>
                          <Button 
                            onClick={() => handleStartAssessment(key)}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            검사 시작하기
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </section>

            {/* ========== 청소년 검사 섹션 ========== */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                <h2 className="text-lg font-bold text-foreground">청소년 검사</h2>
              </div>

              <div className="space-y-2">
                {['teenMentalCompass', 'teenGrowthCapacity', 'socialDevelopmentScreening'].map((key) => {
                  const info = premiumAssessmentInfo[key as keyof typeof premiumAssessmentInfo];
                  if (!info) return null;
                  const isExpanded = expandedTest === key;
                  
                  return (
                    <Collapsible key={key} open={isExpanded} onOpenChange={() => setExpandedTest(isExpanded ? null : key)}>
                      <CollapsibleTrigger asChild>
                        <button className="w-full group text-left p-4 rounded-xl border border-border hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground group-hover:text-emerald-600">{info.title}</h3>
                                {info.badge && (
                                  <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0">{info.badge}</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{info.duration} · {info.questions_count}문항</p>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mx-2 p-4 bg-muted/30 rounded-b-xl border-x border-b border-border space-y-4">
                          <p className="text-sm text-muted-foreground">{info.description}</p>
                          <div className="space-y-1.5">
                            {info.premium_features.slice(0, 4).map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                <span className="text-muted-foreground">{feature}</span>
                              </div>
                            ))}
                          </div>
                          <Button 
                            onClick={() => handleStartAssessment(key)}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                          >
                            검사 시작하기
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </section>

            {/* ========== 특수 AI 검사 섹션 ========== */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-6 bg-slate-500 rounded-full"></div>
                <h2 className="text-lg font-bold text-foreground">특수 AI 검사</h2>
                <span className="text-xs text-slate-600 bg-slate-100 dark:bg-slate-900/30 px-2 py-0.5 rounded font-medium">인기</span>
              </div>

              <div className="space-y-2">
                {Object.entries(specialTestInfo).map(([key, info]) => {
                  const isExpanded = expandedTest === `special_${key}`;
                  
                  return (
                    <Collapsible key={key} open={isExpanded} onOpenChange={() => setExpandedTest(isExpanded ? null : `special_${key}`)}>
                      <CollapsibleTrigger asChild>
                        <button className="w-full group text-left p-4 rounded-xl border border-border hover:border-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground group-hover:text-slate-600">{info.title}</h3>
                              </div>
                              <p className="text-xs text-muted-foreground">{info.duration}{info.questions_count > 0 ? ` · ${info.questions_count}문항` : ''}</p>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mx-2 p-4 bg-muted/30 rounded-b-xl border-x border-b border-border space-y-4">
                          <p className="text-sm text-muted-foreground">{info.description}</p>
                          <div className="space-y-1.5">
                            {info.premium_features.map((feature: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                <span className="text-muted-foreground">{feature}</span>
                              </div>
                            ))}
                          </div>
                          <Button 
                            onClick={info.onClick}
                            className="w-full bg-slate-600 hover:bg-slate-700 text-white"
                          >
                            검사 시작하기
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </section>

            {/* 구독 CTA */}
            {!isSubscribed && (
              <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 text-center">
                <Crown className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-foreground mb-2">프리미엄 회원이 되어보세요</h3>
                <p className="text-sm text-muted-foreground mb-4">전문적인 심리검사와 상세한 분석 보고서를 받아보실 수 있습니다</p>
                <Button 
                  onClick={() => navigate('/token-subscription')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                >
                  구독하기
                </Button>
              </div>
            )}

            {/* Medical Disclaimer */}
            <div className="mt-8">
              <MedicalDisclaimer variant="full" />
            </div>
          </div>
        </div>
      </div>
    </AuthenticationGuard>
  );
};

export default PremiumAssessment;