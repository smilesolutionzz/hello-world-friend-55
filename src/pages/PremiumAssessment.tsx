import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, Sparkles, Clock, Users, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthenticationGuard from "@/components/observation/AuthenticationGuard";
import { MedicalDisclaimer } from "@/components/legal/MedicalDisclaimer";
import { useEventTracking } from "@/hooks/useEventTracking";
import PremiumAssessmentCard from "@/components/assessment/PremiumAssessmentCard";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
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
import { InsuranceAnalysisForm } from "@/components/assessment/InsuranceAnalysisForm";
import { InsuranceAnalysisResult } from "@/components/assessment/InsuranceAnalysisResult";
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

  const handleStartAssessment = (assessmentKey: string) => {
    
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
      navigate('/assessment');
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
        <PremiumAdhdForm
          onComplete={handleAdhdAssessmentComplete}
          onBack={handleBack}
        />
      );
    }

    if (selectedAssessment === 'parentingStyle') {
      return (
        <ParentingStyleForm
          onComplete={handleAssessmentComplete}
          onBack={handleBack}
        />
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

  return (
    <AuthenticationGuard fallbackMessage="프리미엄 심리검사를 이용하려면 로그인이 필요합니다." redirectPath="/auth">
      <div>
        <UnifiedNavigation />
        <div className="min-h-screen relative overflow-hidden pt-4">
        {/* Modern Premium Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-subtle via-background to-accent/10" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-32 right-16 w-[500px] h-[500px] bg-primary-glow/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-accent/6 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10 container mx-auto px-6 pt-8 pb-16 max-w-7xl">
        {/* Header - Mobile Optimized */}
        <div className="mb-10">
          {/* Back Button - 모바일에서 가장 위에 독립 배치 */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="flex items-center gap-2 hover:bg-primary/10 transition-colors px-4 py-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium text-base">뒤로가기</span>
            </Button>
          </div>
          
          {/* Title Section - 가로 정렬 */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 sm:gap-3 mb-4">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl shadow-lg flex-shrink-0">
                <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent whitespace-nowrap">
                프리미엄 AIH 자기 체크리스트
              </h1>
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl shadow-lg flex-shrink-0">
                <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground font-medium px-4">
              전문적이고 정밀한 성향 파악을 위한 AIH전문가의 창작 도구들
            </p>
          </div>
        </div>

        {/* Premium Features Banner - Redesigned */}
        <div className="max-w-6xl mx-auto mb-14">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-glow to-primary" />
            
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }} />
            </div>
            
            {/* Glow Effects */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary-glow/30 rounded-full blur-3xl" />
            
            {/* Content */}
            <div className="relative z-10 p-10 text-white">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
                <h2 className="text-3xl font-bold">구독자 전용 프리미엄 AIH 검사</h2>
                <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
              </div>
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div className="group">
                  <div className="text-3xl font-bold mb-2 group-hover:scale-110 transition-transform">14가지</div>
                  <div className="text-sm opacity-90 font-medium">전문 검사</div>
                </div>
                <div className="group">
                  <div className="text-3xl font-bold mb-2 group-hover:scale-110 transition-transform">정밀분석</div>
                  <div className="text-sm opacity-90 font-medium">과학적 근거</div>
                </div>
                <div className="group">
                  <div className="text-3xl font-bold mb-2 group-hover:scale-110 transition-transform">맞춤형</div>
                  <div className="text-sm opacity-90 font-medium">개인별 해석</div>
                </div>
                <div className="group">
                  <div className="text-3xl font-bold mb-2 group-hover:scale-110 transition-transform">PDF</div>
                  <div className="text-sm opacity-90 font-medium">상세 보고서</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Cards Grid - Enhanced Spacing */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* 오트로버트 테스트 - 1위 NEW */}
            <Card className="relative overflow-hidden hover-glow transition-all duration-300 hover:scale-[1.02]">
              {/* 인기 순위 배지 */}
              <div className="absolute top-2 right-2 z-10 flex gap-1">
                <Badge className="bg-pink-500 text-white border-0 text-xs px-2 py-1">
                  NEW
                </Badge>
                <Badge className="bg-red-500 text-white border-0 text-xs px-2 py-1">
                  <Crown className="w-2.5 h-2.5 mr-1" />
                  1위
                </Badge>
              </div>

              {/* Header with Dark Gradient - AIH 스타일 */}
              <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-6 pr-24 text-white relative">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">🎭 오트로버트 성격 진단</CardTitle>
                      <p className="text-sm opacity-90">ASES-OT (Otrovert Spectrum Early Screening)</p>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  외향? 내향? NO! 당신은 오트로버트일 수 있습니다. MBTI보다 정확한 20문항 정밀 분석으로 새로운 성격 유형을 발견하세요! 🔥
                </p>

                <p className="text-sm text-muted-foreground">
                  AI 분석으로 재미있는 결과를 제공합니다
                </p>

                {/* Test Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    약 5-8분
                  </div>
                  <div className="text-muted-foreground">
                    20개 문항
                  </div>
                </div>

                {/* Premium Features */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">프리미엄 분석 내용</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span className="text-muted-foreground">외향성-내향성 스펙트럼 정밀 분석</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span className="text-muted-foreground">91% 이상 정확도의 AI 분석</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span className="text-muted-foreground">성격 차원별 레이더 차트 제공</span>
                    </div>
                    <div className="text-xs text-muted-foreground ml-5">
                      외 3가지...
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  <Button 
                    onClick={() => setCurrentTest('otrovert')}
                    className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:opacity-90"
                  >
                    검사 시작하기
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {Object.entries(premiumAssessmentInfo).map(([key, info]) => (
              <PremiumAssessmentCard
                key={key}
                assessmentKey={key}
                info={info}
                onStart={handleStartAssessment}
                isSubscribed={isSubscribed}
              />
            ))}

            {/* 보험보장분석 카드 */}
            <Card className="relative overflow-hidden hover-glow transition-all duration-300 hover:scale-[1.02]"
              onClick={() => setCurrentTest('insurance-analysis')}
            >
              <div className="absolute top-2 right-2 z-10">
                <Badge className="bg-blue-500 text-white border-0 text-xs px-2 py-1">
                  AI 전문가
                </Badge>
              </div>

              <div className="bg-gradient-to-r from-blue-700 to-cyan-600 p-6 pr-24 text-white relative">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">💙 보험보장분석</CardTitle>
                      <p className="text-sm opacity-90">Insurance Analysis</p>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  증권 사진만 업로드하면 AI가 가족 보장을 분석합니다.
                </p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    약 5분
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={() => setCurrentTest('insurance-analysis')}
                    className="w-full bg-gradient-to-r from-blue-700 to-cyan-600"
                  >
                    분석 시작
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Subscription CTA for Non-subscribers */}
        {!isSubscribed && (
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-8 text-center">
              <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-yellow-800 mb-2">
                프리미엄 회원이 되어보세요
              </h3>
              <p className="text-yellow-700 mb-6">
                전문적인 심리검사와 상세한 분석 보고서를 받아보실 수 있습니다
              </p>
              <Button 
                onClick={() => navigate('/token-subscription')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-3"
                size="lg"
              >
                구독하기
              </Button>
            </div>
          </div>
        )}

        {/* Medical Disclaimer */}
        <div className="max-w-4xl mx-auto mt-8">
          <MedicalDisclaimer variant="full" />
        </div>
        </div>
      </div>
      </div>
    </AuthenticationGuard>
  );
};

export default PremiumAssessment;