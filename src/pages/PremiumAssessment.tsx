import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Clock, Users, CheckCircle, Star, Coins, ChevronDown, Brain, Heart, Briefcase, DollarSign, UserCheck, AlertTriangle, Eye, Baby, Palette, Shield, ExternalLink, Target, Lock, UserPlus, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MedicalDisclaimer } from "@/components/legal/MedicalDisclaimer";
import { useEventTracking } from "@/hooks/useEventTracking";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { useTokens } from "@/hooks/useTokens";
import { useSubscription } from '@/hooks/useSubscription';
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
import MotorDevelopmentForm from "@/components/assessment/MotorDevelopmentForm";
import MotorDevelopmentResult from "@/components/assessment/MotorDevelopmentResult";
import SocialBehaviorCheckForm from "@/components/assessment/SocialBehaviorCheckForm";
import SocialBehaviorCheckResult from "@/components/assessment/SocialBehaviorCheckResult";
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
import { useTranslation } from "@/i18n/useTranslation";

const PremiumAssessment = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const isEnglish = language === 'en';
  const p = t.premiumPage;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const [currentStep, setCurrentStep] = useState<'list' | 'assessment' | 'result'>(() => {
    const saved = sessionStorage.getItem('premiumAssessmentState');
    if (saved) {
      try { return JSON.parse(saved).currentStep || 'list'; } catch { return 'list'; }
    }
    return 'list';
  });
  const [selectedAssessment, setSelectedAssessment] = useState<string>(() => {
    const saved = sessionStorage.getItem('premiumAssessmentState');
    if (saved) {
      try { return JSON.parse(saved).selectedAssessment || ''; } catch { return ''; }
    }
    return '';
  });
  const [assessmentResults, setAssessmentResults] = useState<any>(() => {
    const saved = sessionStorage.getItem('premiumAssessmentState');
    if (saved) {
      try { return JSON.parse(saved).assessmentResults || {}; } catch { return {}; }
    }
    return {};
  });
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>(() => {
    const saved = sessionStorage.getItem('premiumAssessmentState');
    if (saved) {
      try { return JSON.parse(saved).assessmentAnswers || {}; } catch { return {}; }
    }
    return {};
  });
  const { isPremiumUser, isLifetimeUser } = useSubscription();
  const isSubscribed = isPremiumUser() || isLifetimeUser();
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [insuranceResults, setInsuranceResults] = useState<any>(null);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const { trackTestStart, trackTestComplete, trackPageView } = useEventTracking();
  const { consumeTokens, checkTokenAvailability } = useTokens();

  // Persist result state to sessionStorage
  useEffect(() => {
    if (currentStep === 'result' && Object.keys(assessmentResults).length > 0) {
      sessionStorage.setItem('premiumAssessmentState', JSON.stringify({
        currentStep, selectedAssessment, assessmentResults, assessmentAnswers
      }));
    } else if (currentStep === 'list') {
      sessionStorage.removeItem('premiumAssessmentState');
    }
  }, [currentStep, selectedAssessment, assessmentResults, assessmentAnswers]);

  // i18n overrides for premiumAssessmentInfo
  const getLocalizedInfo = (key: string) => {
    const original = premiumAssessmentInfo[key as keyof typeof premiumAssessmentInfo];
    if (!original || !isEnglish) return original;

    const overrides: Record<string, { title: string; description: string; premium_features: string[] }> = {
      autismSpectrumScreening: { title: p.infoAutismTitle, description: p.infoAutismDesc, premium_features: [...p.infoAutismFeatures] },
      socialBehaviorCheck: { title: p.infoSocialBehaviorTitle, description: p.infoSocialBehaviorDesc, premium_features: [...p.infoSocialBehaviorFeatures] },
      premiumAdhd: { title: p.infoAdhdTitle, description: original.description, premium_features: original.premium_features },
      languageDevelopment: { title: p.infoLangDevTitle, description: p.infoLangDevDesc, premium_features: [...p.infoLangDevFeatures] },
      motorDevelopment: { title: p.infoMotorTitle, description: p.infoMotorDesc, premium_features: [...p.infoMotorFeatures] },
      personality_type: { title: p.infoPersonalityTitle, description: p.infoPersonalityDesc, premium_features: [...p.infoPersonalityFeatures] },
      temperament: { title: p.infoTemperamentTitle, description: p.infoTemperamentDesc, premium_features: [...p.infoTemperamentFeatures] },
      love_personality: { title: p.infoLoveTitle, description: p.infoLoveDesc, premium_features: [...p.infoLoveFeatures] },
      work_stress: { title: p.infoWorkStressTitle, description: p.infoWorkStressDesc, premium_features: [...p.infoWorkStressFeatures] },
      financialPsychology: { title: p.infoFinancialTitle, description: p.infoFinancialDesc, premium_features: [...p.infoFinancialFeatures] },
      cognitive: { title: p.infoCognitiveTitle, description: p.infoCognitiveDesc, premium_features: [...p.infoCognitiveFeatures] },
      teenMentalCompass: { title: p.infoTeenMentalTitle, description: p.infoTeenMentalDesc, premium_features: [...p.infoTeenMentalFeatures] },
      teenGrowthCapacity: { title: p.infoTeenGrowthTitle, description: p.infoTeenGrowthDesc, premium_features: [...p.infoTeenGrowthFeatures] },
      socialDevelopmentScreening: { title: p.infoSocialDevTitle, description: p.infoSocialDevDesc, premium_features: [...p.infoSocialDevFeatures] },
      parentingStyle: { title: p.infoParentingTitle, description: p.infoParentingDesc, premium_features: [...p.infoParentingFeatures] },
    };

    const override = overrides[key];
    if (!override) return original;
    return { ...original, ...override };
  };

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

  const requireAuth = (action: () => void) => {
    if (isAuthenticated) {
      action();
    } else {
      setPendingAction(() => action);
      setShowLoginPrompt(true);
    }
  };

  const handleStartAssessment = async (assessmentKey: string) => {
    requireAuth(async () => {
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
    });
  };

  const handleAssessmentComplete = (results: any, answers?: Record<string, string>) => {
    setAssessmentResults(results);
    if (answers) setAssessmentAnswers(answers);
    setCurrentStep('result');
  };

  const handleAdhdAssessmentComplete = (results: any) => {
    setAssessmentResults(results);
    setCurrentStep('result');
  };

  const handleBack = () => {
    if (currentTest) { setCurrentTest(null); return; }
    if (insuranceResults) { setInsuranceResults(null); return; }
    if (currentStep === 'result') setCurrentStep('list');
    else if (currentStep === 'assessment') setCurrentStep('list');
    else navigate('/dashboard');
  };

  const handleInsuranceComplete = (results: any) => setInsuranceResults(results);

  const handleOtrovertComplete = (result: any, testType: string) => {
    navigate('/fun-test-result', { state: { result, testType } });
  };

  if (currentTest === 'otrovert') return <OtrovertTest onComplete={handleOtrovertComplete} onBack={handleBack} />;

  if (currentTest === 'insurance-analysis') {
    if (insuranceResults) {
      return <InsuranceAnalysisResult results={insuranceResults} onBack={() => { setCurrentTest(null); setInsuranceResults(null); }} />;
    }
    return (
      <div><UnifiedNavigation /><div className="pt-4"><InsuranceAnalysisForm onComplete={handleInsuranceComplete} /></div></div>
    );
  }

  if (currentTest === 'drawing-analysis') {
    return <div><UnifiedNavigation /><div className="pt-4 container mx-auto px-4 max-w-4xl"><DrawingAnalyzer /></div></div>;
  }

  if (currentTest === 'hexaco') {
    if (assessmentResults && Object.keys(assessmentResults).length > 0) {
      return <HexacoResult result={assessmentResults} onBack={() => { setCurrentTest(null); setAssessmentResults({}); }} />;
    }
    return (
      <div><UnifiedNavigation /><div className="pt-4"><HexacoTest onComplete={(results) => setAssessmentResults(results)} onBack={() => setCurrentTest(null)} /></div></div>
    );
  }

  if (currentStep === 'result' && selectedAssessment && Object.keys(assessmentResults).length > 0) {
    if (selectedAssessment === 'languageDevelopment') return <LanguageDevelopmentResult results={assessmentResults} answers={assessmentAnswers} onBack={handleBack} />;
    if (selectedAssessment === 'autismSpectrumScreening') return <AutismSpectrumResult results={assessmentResults} answers={assessmentAnswers} onBack={handleBack} />;
    if (selectedAssessment === 'premiumAdhd') return <PremiumAdhdResult results={assessmentResults} onBack={handleBack} />;
    if (selectedAssessment === 'parentingStyle') return <ParentingStyleResult results={assessmentResults} onBack={handleBack} />;
    if (selectedAssessment === 'motorDevelopment') return <MotorDevelopmentResult results={assessmentResults} onBack={handleBack} />;
    if (selectedAssessment === 'socialBehaviorCheck') return <SocialBehaviorCheckResult results={assessmentResults} answers={assessmentAnswers} onBack={handleBack} />;
    return <PremiumAssessmentResult assessmentType={selectedAssessment} results={assessmentResults} assessmentInfo={premiumAssessmentInfo[selectedAssessment as keyof typeof premiumAssessmentInfo]} onBack={handleBack} />;
  }

  if (currentStep === 'assessment' && selectedAssessment) {
    if (selectedAssessment === 'autismSpectrumScreening') return <div><UnifiedNavigation /><div className="pt-4"><AutismSpectrumForm onComplete={handleAssessmentComplete} onBack={handleBack} /></div></div>;
    if (selectedAssessment === 'languageDevelopment') return <div><UnifiedNavigation /><div className="pt-4"><LanguageDevelopmentForm onComplete={handleAssessmentComplete} onBack={handleBack} /></div></div>;
    if (selectedAssessment === 'premiumAdhd') return <div><UnifiedNavigation /><div className="pt-4"><PremiumAdhdForm onComplete={handleAdhdAssessmentComplete} onBack={handleBack} /></div></div>;
    if (selectedAssessment === 'parentingStyle') return <div><UnifiedNavigation /><div className="pt-4"><ParentingStyleForm onComplete={handleAssessmentComplete} onBack={handleBack} /></div></div>;
    if (selectedAssessment === 'motorDevelopment') return <div><UnifiedNavigation /><div className="pt-4"><MotorDevelopmentForm onComplete={(results: any, answers: Record<string, number>) => { setAssessmentResults(results); setCurrentStep('result'); }} onBack={handleBack} /></div></div>;
    if (selectedAssessment === 'socialBehaviorCheck') return <div><UnifiedNavigation /><div className="pt-4"><SocialBehaviorCheckForm onComplete={handleAssessmentComplete} onBack={handleBack} /></div></div>;
    return <PremiumAssessmentForm assessmentType={selectedAssessment} questions={assessmentData[selectedAssessment as keyof typeof assessmentData]} assessmentInfo={premiumAssessmentInfo[selectedAssessment as keyof typeof premiumAssessmentInfo]} onComplete={handleAssessmentComplete} onBack={handleBack} />;
  }

  // Special test info (i18n)
  const specialTestInfo: Record<string, any> = {
    otrovert: {
      title: p.otrovertTitle, subtitle: p.otrovertSubtitle, description: p.otrovertDesc,
      duration: p.otrovertDuration, questions_count: 20,
      premium_features: [...p.otrovertFeatures],
      onClick: () => requireAuth(() => setCurrentTest('otrovert')),
    },
    mbti: {
      title: p.mbtiTitle, subtitle: p.mbtiSubtitle, description: p.mbtiDesc,
      duration: p.mbtiDuration, questions_count: 25,
      premium_features: [...p.mbtiFeatures],
      onClick: () => requireAuth(() => navigate('/assessment/mbti-test')),
    },
    hexaco: {
      title: p.hexacoTitle, subtitle: p.hexacoSubtitle, description: p.hexacoDesc,
      duration: p.hexacoDuration, questions_count: 48,
      premium_features: [...p.hexacoFeatures],
      onClick: () => requireAuth(() => setCurrentTest('hexaco')),
    },
    drawing: {
      title: p.drawingTitle, subtitle: p.drawingSubtitle, description: p.drawingDesc,
      duration: p.drawingDuration, questions_count: 0,
      premium_features: [...p.drawingFeatures],
      onClick: () => requireAuth(() => setCurrentTest('drawing-analysis')),
    },
    insurance: {
      title: p.insuranceTitle, subtitle: p.insuranceSubtitle, description: p.insuranceDesc,
      duration: p.insuranceDuration, questions_count: 0,
      premium_features: [...p.insuranceFeatures],
      onClick: () => requireAuth(() => setCurrentTest('insurance-analysis')),
    },
    businessMetacognition: {
      title: p.bizMetaTitle, subtitle: p.bizMetaSubtitle, description: p.bizMetaDesc,
      duration: p.bizMetaDuration, questions_count: 20,
      premium_features: [...p.bizMetaFeatures],
      onClick: () => requireAuth(() => navigate('/assessment/business-metacognition')),
    },
  };

  const handleTestClick = (key: string, isSpecial?: boolean) => {
    if (isSpecial) specialTestInfo[key]?.onClick?.();
    else handleStartAssessment(key);
  };

  // Helper to render a collapsible test section
  const renderTestSection = (
    sectionTitle: string,
    sectionBadge: string | null,
    colorKey: string,
    testKeys: string[],
  ) => (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-1.5 h-6 bg-${colorKey}-500 rounded-full`}></div>
        <h2 className="text-lg font-bold text-foreground">{sectionTitle}</h2>
        {sectionBadge && (
          <span className={`text-xs text-${colorKey}-600 bg-${colorKey}-100 dark:bg-${colorKey}-900/30 px-2 py-0.5 rounded font-medium`}>{sectionBadge}</span>
        )}
      </div>
      <div className="space-y-2">
        {testKeys.map((key) => {
          const info = getLocalizedInfo(key);
          if (!info) return null;
          const isExpanded = expandedTest === key;
          return (
            <Collapsible key={key} open={isExpanded} onOpenChange={() => setExpandedTest(isExpanded ? null : key)}>
              <CollapsibleTrigger asChild>
                <button className={`w-full group text-left p-3 md:p-4 rounded-xl border border-border hover:border-${colorKey}-300 hover:bg-${colorKey}-50/50 dark:hover:bg-${colorKey}-950/20 transition-all`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 md:gap-2 mb-0.5">
                        <h3 className={`font-semibold text-sm md:text-base text-foreground group-hover:text-${colorKey}-600 truncate`}>{info.title}</h3>
                        {info.badge && (
                          <Badge className={`bg-${colorKey}-500 text-white text-[9px] md:text-[10px] px-1 md:px-1.5 py-0 flex-shrink-0`}>{info.badge}</Badge>
                        )}
                      </div>
                      <p className="text-[11px] md:text-xs text-muted-foreground truncate">{info.duration} · {info.questions_count}{p.items}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 text-muted-foreground transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mx-2 p-4 bg-muted/30 rounded-b-xl border-x border-b border-border space-y-4">
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                  <div className="space-y-1.5">
                    {info.premium_features.slice(0, 4).map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={() => handleStartAssessment(key)}
                    className={`w-full bg-${colorKey}-500 hover:bg-${colorKey}-600 text-white`}
                  >
                    {p.startTest}
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </section>
  );

  return (
    <div>
      <UnifiedNavigation />
      <div className="min-h-screen bg-background pt-4">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
              <h1 className="text-xl md:text-2xl font-bold text-foreground">{p.pageTitle}</h1>
            </div>
            <p className="text-muted-foreground text-xs md:text-sm mb-2">{p.pageSubtitle}</p>
            <Badge className="bg-purple-500/90 text-white text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1">
              <Coins className="w-3 h-3 mr-1" />
              {p.price}
            </Badge>
          </div>

          {/* Expert Banner */}
          <a 
            href="https://smilesolution.kr" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block mb-6 p-3 md:p-4 bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-700 dark:to-slate-600 rounded-xl border border-slate-600 hover:from-slate-700 hover:to-slate-600 transition-all group shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs md:text-sm text-white leading-relaxed">
                  <span className="font-semibold">{p.expertBanner}</span>{p.expertBannerDesc}<br className="md:hidden" />
                  <span className="underline underline-offset-2">{p.expertBannerLink}</span>{p.expertBannerSuffix}
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-white flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </a>

          {/* Neurodevelopmental */}
          {renderTestSection(p.sectionNeuro, p.sectionNeuroBadge, 'purple', ['autismSpectrumScreening', 'premiumAdhd', 'languageDevelopment', 'motorDevelopment'])}

          {/* Personality */}
          {renderTestSection(p.sectionPersonality, null, 'blue', ['personality_type', 'temperament', 'love_personality'])}

          {/* Work & Finance */}
          {renderTestSection(p.sectionWorkFinance, null, 'orange', ['work_stress', 'financialPsychology', 'cognitive'])}

          {/* Teen */}
          {renderTestSection(p.sectionTeen, null, 'emerald', ['teenMentalCompass', 'teenGrowthCapacity', 'socialDevelopmentScreening'])}

          {/* Special AI Tests */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-6 bg-slate-500 rounded-full"></div>
              <h2 className="text-lg font-bold text-foreground">{p.sectionSpecial}</h2>
              <span className="text-xs text-slate-600 bg-slate-100 dark:bg-slate-900/30 px-2 py-0.5 rounded font-medium">{p.sectionSpecialBadge}</span>
            </div>

            <div className="space-y-2">
              {Object.entries(specialTestInfo).map(([key, info]) => {
                const isExpanded = expandedTest === `special_${key}`;
                return (
                  <Collapsible key={key} open={isExpanded} onOpenChange={() => setExpandedTest(isExpanded ? null : `special_${key}`)}>
                    <CollapsibleTrigger asChild>
                      <button className="w-full group text-left p-3 md:p-4 rounded-xl border border-border hover:border-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 md:gap-2 mb-0.5">
                              <h3 className="font-semibold text-sm md:text-base text-foreground group-hover:text-slate-600 truncate">{info.title}</h3>
                            </div>
                            <p className="text-[11px] md:text-xs text-muted-foreground truncate">{info.duration}{info.questions_count > 0 ? ` · ${info.questions_count}${p.items}` : ''}</p>
                          </div>
                          <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 text-muted-foreground transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
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
                          {p.startTest}
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </section>

          {/* Subscribe CTA */}
          {!isSubscribed && (
            <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 text-center">
              <Crown className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground mb-2">{p.subscribeCta}</h3>
              <p className="text-sm text-muted-foreground mb-4">{p.subscribeDesc}</p>
              <Button 
                onClick={() => navigate('/token-subscription')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              >
                {p.subscribeBtn}
              </Button>
            </div>
          )}

          <div className="mt-8">
            <MedicalDisclaimer variant="full" />
          </div>
        </div>
      </div>

      {/* Login Prompt Modal */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="max-w-sm mx-auto p-0 overflow-hidden border-0">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 px-6 py-5 text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Save className="w-5 h-5 text-white" />
            </div>
            <div>
               <h3 className="text-sm font-bold leading-tight">{p.loginModalTitle}</h3>
              <p className="text-xs text-white/80 mt-0.5">{p.loginModalSubtitle}</p>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="space-y-2.5">
              {[
                { icon: Save, text: p.loginModalBenefit1 },
                { icon: Lock, text: p.loginModalBenefit2 },
                { icon: UserPlus, text: p.loginModalBenefit3 },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm">
                  <item.icon className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">
                {p.loginModalFooter} <strong className="text-foreground">{p.loginModalFooterBold}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={() => {
                  localStorage.setItem('auth_redirect_after', window.location.pathname);
                  navigate('/auth?mode=signup');
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white py-5"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {p.loginModalSignup}
              </Button>
              <Button 
                onClick={() => {
                  localStorage.setItem('auth_redirect_after', window.location.pathname);
                  navigate('/auth');
                }}
                variant="outline"
                className="w-full py-5"
              >
                <Lock className="w-4 h-4 mr-2" />
                {p.loginModalLogin}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PremiumAssessment;
