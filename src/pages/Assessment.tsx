import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import AgeSelector from "@/components/assessment/AgeSelector";
import InfantAssessment from "@/components/assessment/InfantAssessment";
import ChildAssessmentSimplified from "@/components/assessment/ChildAssessmentSimplified";
import AdultAssessment from "@/components/assessment/AdultAssessment";
import InfantAssessmentResult from "@/components/assessment/InfantAssessmentResult";
import ChildAssessmentResult from "@/components/assessment/ChildAssessmentResult";
import AdultAssessmentResult from "@/components/assessment/AdultAssessmentResult";
import LanguageTestForm from "@/components/assessment/LanguageTestForm";
import LanguageTestResult from "@/components/assessment/LanguageTestResult";
import PanicTestForm from "@/components/assessment/PanicTestForm";
import PanicTestResult from "@/components/assessment/PanicTestResult";
import DepressionTestForm from "@/components/assessment/DepressionTestForm";
import DepressionTestResult from "@/components/assessment/DepressionTestResult";
import AdhdTestForm from "@/components/assessment/AdhdTestForm";
import AdhdTestResult from "@/components/assessment/AdhdTestResult";
import StressTestForm from "@/components/assessment/StressTestForm";
import StressTestResult from "@/components/assessment/StressTestResult";
import BigFiveTestForm from "@/components/assessment/BigFiveTestForm";
import BigFiveTestResult from "@/components/assessment/BigFiveTestResult";
import AttachmentStyleForm from "@/components/assessment/AttachmentStyleForm";
import AttachmentStyleResult from "@/components/assessment/AttachmentStyleResult";
import CareerInterestForm from "@/components/assessment/CareerInterestForm";
import CareerInterestResult from "@/components/assessment/CareerInterestResult";
import SelfEsteemTestForm from "@/components/assessment/SelfEsteemTestForm";
import SelfEsteemTestResult from "@/components/assessment/SelfEsteemTestResult";
import DevelopmentalDelayTestForm from "@/components/assessment/DevelopmentalDelayTestForm";
import SensoryIntegrationTestForm from "@/components/assessment/SensoryIntegrationTestForm";
import LearningDisabilityTestForm from "@/components/assessment/LearningDisabilityTestForm";
import SocialDevelopmentTestForm from "@/components/assessment/SocialDevelopmentTestForm";
import DevelopmentalDelayTestResult from "@/components/assessment/DevelopmentalDelayTestResult";
import SensoryIntegrationTestResult from "@/components/assessment/SensoryIntegrationTestResult";
import LearningDisabilityTestResult from "@/components/assessment/LearningDisabilityTestResult";
import SocialDevelopmentTestResult from "@/components/assessment/SocialDevelopmentTestResult";
import DreamInterpretation from "@/components/assessment/DreamInterpretation";
import SajuAnalysis from "@/components/assessment/SajuAnalysis";
import AIChatInterface from "@/components/counseling/AIChatInterface";
import RealTimeChat from "@/components/counseling/RealTimeChat";
import LegalSafetyNotice from "@/components/LegalSafetyNotice";
import AnalysisScreen from "@/components/analysis/AnalysisScreen";
import ExpertMatching from "@/components/analysis/ExpertMatching";
import ConsultationRoom from "@/components/consultation/ConsultationRoom";
import { AIHighlightDashboard } from "@/components/highlight/AIHighlightDashboard";
import { ExpertProfile } from "@/types/assessment";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { Sparkles, Crown, Camera, Heart, Zap, Brain, Target, MessageCircle } from "lucide-react";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";

const Assessment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // URL 파라미터에서 테스트 타입 확인
  const urlTestType = searchParams.get('type');
  const urlTest = searchParams.get('test');
  
  const [currentStep, setCurrentStep] = useState<'test-type' | 'legal-notice' | 'age-select' | 'assessment' | 'language-test' | 'panic-test' | 'depression-test' | 'adhd-test' | 'stress-test' | 'bigfive-test' | 'attachment-test' | 'career-test' | 'selfesteem-test' | 'dream-interpretation' | 'saju-analysis' | 'analysis' | 'matching' | 'consultation' | 'language-result' | 'panic-result' | 'depression-result' | 'adhd-result' | 'stress-result' | 'bigfive-result' | 'attachment-result' | 'career-result' | 'selfesteem-result' | 'child-result' | 'infant-result' | 'adult-result' | 'ai-chat' | 'realtime-chat' | 'developmental-delay-test' | 'sensory-integration-test' | 'learning-disability-test' | 'social-development-test' | 'developmental-delay-result' | 'sensory-integration-result' | 'learning-disability-result' | 'social-development-result'>('test-type');
  const [testType, setTestType] = useState<'psychological' | 'language' | 'panic' | 'depression' | 'adhd' | 'stress' | 'bigfive' | 'attachment' | 'career' | 'selfesteem' | 'dream' | 'saju' | 'developmental-delay' | 'sensory-integration' | 'learning-disability' | 'social-development' | null>(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'infant' | 'child' | 'adult' | null>(null);
  const [selectedAge, setSelectedAge] = useState<number>(0);
  const [assessmentResults, setAssessmentResults] = useState<Record<string, number>>({});
  const [languageResults, setLanguageResults] = useState<{answers: number[], total: number, average: number, ageGroup: string} | null>(null);
  const [panicResults, setPanicResults] = useState<{answers: number[], total: number, average: number, severity: string} | null>(null);
  const [depressionResults, setDepressionResults] = useState<{answers: number[], total: number, average: number, severity: string} | null>(null);
  const [adhdResults, setAdhdResults] = useState<{answers: number[], total: number, average: number, ageGroup: string, severity: string} | null>(null);
  const [stressResults, setStressResults] = useState<{answers: number[], total: number, average: number, severity: string} | null>(null);
  const [selfesteemResults, setSelfesteemResults] = useState<{answers: number[], total: number, average: number, level: string} | null>(null);
  const [bigfiveResults, setBigfiveResults] = useState<{answers: Record<string, number>, scores: Record<string, number>, total: number, average: number} | null>(null);
  const [attachmentResults, setAttachmentResults] = useState<{answers: Record<string, number>, anxietyScore: number, avoidanceScore: number, style: string, total: number, average: number} | null>(null);
  const [careerResults, setCareerResults] = useState<{answers: Record<string, number>, scores: Record<string, number>, topTypes: string[], total: number, average: number} | null>(null);
  const [childResults, setChildResults] = useState<{answers: Record<string, number>, total: number, average: number, ageGroup: string, gameScores: Record<string, number>} | null>(null);
  const [infantResults, setInfantResults] = useState<{answers: Record<string, number>, total: number, average: number, ageGroup: string, categoryScores: Record<string, number>} | null>(null);
  const [adultResults, setAdultResults] = useState<{answers: Record<string, number>, total: number, average: number, ageGroup: string, categoryScores: Record<string, number>} | null>(null);
  const [developmentalDelayResults, setDevelopmentalDelayResults] = useState<{answers: number[], total: number, average: number, ageGroup: string, severity: string} | null>(null);
  const [sensoryIntegrationResults, setSensoryIntegrationResults] = useState<{answers: number[], total: number, average: number, ageGroup: string, severity: string} | null>(null);
  const [learningDisabilityResults, setLearningDisabilityResults] = useState<{answers: number[], total: number, average: number, ageGroup: string, severity: string} | null>(null);
  const [socialDevelopmentResults, setSocialDevelopmentResults] = useState<{answers: number[], total: number, average: number, ageGroup: string, severity: string} | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [selectedExpert, setSelectedExpert] = useState<ExpertProfile | null>(null);
  const [currentAssessmentResults, setCurrentAssessmentResults] = useState<any>(null);

  // URL 파라미터에 따른 초기 설정
  useEffect(() => {
    // URL에서 ?type=fun인 경우 새로운 페이지로 리다이렉트
    if (urlTestType === 'fun') {
      navigate('/fun-tests', { replace: true });
      return;
    }
    
    // URL 경로에 따른 자동 테스트 시작
    if (location.pathname === '/assessment/stress-test') {
      console.log('🔍 Stress test path detected, starting stress test...');
      setTestType('stress');
      setCurrentStep('stress-test');
    }
  }, [urlTestType, navigate, location.pathname]);

  // Timeline에 검사 결과 저장하는 함수
  const saveTestToTimeline = async (testType: string, results: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // 가족 ID 가져오기
      // Mock family data
      const familyMember = { family_id: 'mock-family-id' };
      
      const family_id = familyMember?.family_id || null;

      // 평가 결과를 assessments 테이블에 저장
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          profile_id: profile.id,
          age_group: results.ageGroup || 'adult',
          age_at_assessment: selectedAge || 30,
          results: results,
          analysis: null,
          recommendations: null,
          risk_level: results.severity || 'medium'
        })
        .select()
        .single();

      if (assessmentError) {
        console.error('Error saving assessment:', assessmentError);
      }

      // Timeline에 검사 기록 저장
      const { error } = await supabase
        .from('timeline_activities')
        .insert({
          member_id: profile.id,
          type: 'TEST',
          title: getTestTitle(testType),
          summary: `${getTestTitle(testType)} 완료 - 점수: ${results.total}점, 수준: ${results.severity || results.ageGroup}`,
          score_overall: results.total,
          tags: [testType, results.ageGroup || '성인'],
          files: [],
          actor: {
            role: 'user',
            id: user.id,
            name: null
          },
          meta: {
            testType,
            results: {
              total: results.total,
              average: results.average,
              severity: results.severity,
              ageGroup: results.ageGroup
            }
          }
        });

      if (error) {
        console.error('Timeline 저장 실패:', error);
      } else {
        toast({
          title: "검사 완료",
          description: "검사 결과가 타임라인에 저장되었습니다.",
        });
      }
    } catch (error) {
      console.error('Timeline 저장 중 오류:', error);
    }
  };

  const getTestTitle = (testType: string) => {
    switch (testType) {
      case 'adhd': return '주의집중력 자가체크';
      case 'depression': return '우울감 자가체크';
      case 'panic': return '불안감 수준 확인';
      case 'language': return '언어발달 자가체크';
      case 'stress': return '마음압박지수 측정';
      case 'bigfive': return '5차원 성격 분석';
      case 'attachment': return '관계유형 진단';
      case 'career': return '진로흥미 탐색';
      case 'selfesteem': return '자아가치 측정';
      case 'developmental-delay': return '발달지연 검사';
      case 'sensory-integration': return '감각통합장애 검사';
      case 'learning-disability': return '학습장애 검사';
      case 'social-development': return '사회성 발달 검사';
      default: return '심리상태 체크';
    }
  };

  const handleTestTypeSelect = async (type: 'psychological' | 'language' | 'panic' | 'depression' | 'adhd' | 'stress' | 'bigfive' | 'attachment' | 'career' | 'selfesteem' | 'dream' | 'saju' | 'developmental-delay' | 'sensory-integration' | 'learning-disability' | 'social-development') => {
    // 로그인 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "테스트를 진행하려면 먼저 로그인해주세요.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setTestType(type);
    if (type === 'dream') {
      setCurrentStep('dream-interpretation');
    } else if (type === 'saju') {
      setCurrentStep('saju-analysis');
    } else if (type === 'stress') {
      setCurrentStep('stress-test');
    } else if (type === 'bigfive') {
      setCurrentStep('bigfive-test');
    } else if (type === 'attachment') {
      setCurrentStep('attachment-test');
    } else if (type === 'career') {
      setCurrentStep('career-test');
    } else if (type === 'developmental-delay') {
      setCurrentStep('developmental-delay-test');
    } else if (type === 'sensory-integration') {
      setCurrentStep('sensory-integration-test');
    } else if (type === 'learning-disability') {
      setCurrentStep('learning-disability-test');
    } else if (type === 'social-development') {
      setCurrentStep('social-development-test');
    } else {
      setCurrentStep('legal-notice');
    }
  };

  const handleLegalNoticeAccept = () => {
    setCurrentStep('age-select');
  };

  const handleAgeGroupSelect = (ageGroup: 'infant' | 'child' | 'adult', age: number) => {
    setSelectedAgeGroup(ageGroup);
    setSelectedAge(age);
    
    // 3분 테스트는 나이 그룹에 따라 테스트 타입 자동 설정
    if (testType === 'psychological' || !testType) {
      if (ageGroup === 'infant') {
        setTestType('language');
        setCurrentStep('language-test');
      } else if (ageGroup === 'child' || ageGroup === 'adult') {
        setTestType('adhd');
        setCurrentStep('adhd-test');
      } else {
        setCurrentStep('assessment');
      }
    } else if (testType === 'language') {
      setCurrentStep('language-test');
    } else if (testType === 'panic') {
      setCurrentStep('panic-test');
    } else if (testType === 'depression') {
      setCurrentStep('depression-test');
    } else if (testType === 'adhd') {
      setCurrentStep('adhd-test');
    } else if (testType === 'stress') {
      setCurrentStep('stress-test');
    } else if (testType === 'bigfive') {
      setCurrentStep('bigfive-test');
    } else if (testType === 'attachment') {
      setCurrentStep('attachment-test');
    } else if (testType === 'career') {
      setCurrentStep('career-test');
    } else {
      setCurrentStep('assessment');
    }
  };

  const handleAssessmentComplete = (results: Record<string, number>) => {
    console.log('🔄 Assessment Results:', results);
    setAssessmentResults(results);
    
    // 현재 결과 상태 저장 (뒤로가기 시 복원용)
    setCurrentAssessmentResults({
      testType: 'psychological',
      ageGroup: selectedAgeGroup || 'adult',
      total: Object.values(results).reduce((sum, val) => sum + val, 0),
      average: Object.values(results).reduce((sum, val) => sum + val, 0) / Object.keys(results).length,
      results
    });
    
    // 3분테스트는 AI 분석 단계로 이동 (토큰 차감 포함)
    setCurrentStep('analysis');
  };

  const handleLanguageTestComplete = async (results: {answers: number[], total: number, average: number, ageGroup: string}) => {
    console.log('Language Test Results:', results);
    setLanguageResults(results);
    
    // Timeline에 검사 결과 저장
    await saveTestToTimeline('language', results);
    
    setCurrentStep('language-result');
  };

  const handlePanicTestComplete = async (results: {answers: number[], total: number, average: number, severity: string}) => {
    console.log('Panic Test Results:', results);
    setPanicResults(results);
    
    // Timeline에 검사 결과 저장
    await saveTestToTimeline('panic', results);
    
    setCurrentAssessmentResults({
      testType: 'panic',
      ageGroup: '성인',
      total: results.total,
      average: results.average,
      severity: results.severity
    });
    setCurrentStep('panic-result');
  };

  const handleDepressionTestComplete = async (results: {answers: number[], total: number, average: number, severity: string}) => {
    console.log('Depression Test Results:', results);
    setDepressionResults(results);
    
    // Timeline에 검사 결과 저장
    await saveTestToTimeline('depression', results);
    
    setCurrentAssessmentResults({
      testType: 'depression',
      ageGroup: '성인',
      total: results.total,
      average: results.average,
      severity: results.severity
    });
    setCurrentStep('depression-result');
  };

  const handleAdhdTestComplete = async (results: {answers: number[], total: number, average: number, ageGroup: string, severity: string}) => {
    console.log('ADHD Test Results:', results);
    setAdhdResults(results);
    
    // Timeline에 검사 결과 저장
    await saveTestToTimeline('adhd', results);
    
    setCurrentAssessmentResults({
      testType: 'adhd',
      ageGroup: results.ageGroup,
      total: results.total,
      average: results.average,
      severity: results.severity
    });
    setCurrentStep('adhd-result');
  };

  const handleStressTestComplete = async (results: {answers: number[], total: number, average: number, severity: string}) => {
    console.log('Stress Test Results:', results);
    setStressResults(results);
    
    await saveTestToTimeline('stress', results);
    
    setCurrentAssessmentResults({
      testType: 'stress',
      ageGroup: '성인',
      total: results.total,
      average: results.average,
      severity: results.severity
    });
    setCurrentStep('stress-result');
  };

  const handleBigfiveTestComplete = async (results: {answers: Record<string, number>, scores: Record<string, number>, total: number, average: number}) => {
    console.log('BigFive Test Results:', results);
    setBigfiveResults(results);
    
    await saveTestToTimeline('bigfive', results);
    
    setCurrentStep('bigfive-result');
  };

  const handleAttachmentTestComplete = async (results: {answers: Record<string, number>, anxietyScore: number, avoidanceScore: number, style: string, total: number, average: number}) => {
    console.log('Attachment Test Results:', results);
    setAttachmentResults(results);
    
    await saveTestToTimeline('attachment', results);
    
    setCurrentStep('attachment-result');
  };

  const handleCareerTestComplete = async (results: {answers: Record<string, number>, scores: Record<string, number>, topTypes: string[], total: number, average: number}) => {
    console.log('Career Test Results:', results);
    setCareerResults(results);
    
    await saveTestToTimeline('career', results);
    
    setCurrentStep('career-result');
  };

  const handleSelfesteemTestComplete = async (results: {answers: number[], total: number, average: number, level: string}) => {
    console.log('Self-esteem Test Results:', results);
    setSelfesteemResults(results);
    
    await saveTestToTimeline('selfesteem', results);
    
    setCurrentStep('selfesteem-result');
  };

  const handleStartAIChat = () => {
    // AI 상담 시작 전 현재 결과 상태 저장
    const currentResultState = {
      step: currentStep,
      adhdResults,
      adultResults,
      childResults,
      infantResults,
      depressionResults,
      panicResults,
      languageResults
    };
    
    // 세션 스토리지에 저장하여 뒤로가기 시 복원 가능하도록
    sessionStorage.setItem('lastAssessmentResult', JSON.stringify(currentResultState));
    
    setCurrentStep('ai-chat');
  };

  const handleStartRealTimeChat = () => {
    setCurrentStep('realtime-chat');
  };
  const handleAnalysisComplete = (analysis: string) => {
    setAnalysisResult(analysis);
    
    // 연령대별 결과 데이터 생성 및 결과 화면으로 이동
    if (selectedAgeGroup === 'child') {
      const gameScores = assessmentResults;
      const total = Object.values(gameScores).reduce((sum, score) => sum + score, 0);
      const average = total / Object.keys(gameScores).length;
      
      const childResults = {
        answers: assessmentResults,
        total,
        average,
        ageGroup: `${selectedAge}세`,
        gameScores
      };
      
      setChildResults(childResults);
      setCurrentStep('child-result');
    } else if (selectedAgeGroup === 'infant') {
      const categoryScores = assessmentResults;
      const total = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
      const average = total / Object.keys(categoryScores).length;
      
      const infantResults = {
        answers: assessmentResults,
        total,
        average,
        ageGroup: `${selectedAge}세`,
        categoryScores
      };
      
      setInfantResults(infantResults);
      setCurrentStep('infant-result');
    } else if (selectedAgeGroup === 'adult') {
      const categoryScores = assessmentResults;
      const total = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
      const average = total / Object.keys(categoryScores).length;
      
      const adultResults = {
        answers: assessmentResults,
        total,
        average,
        ageGroup: `${selectedAge}세`,
        categoryScores
      };
      
      setAdultResults(adultResults);
      setCurrentStep('adult-result');
    } else {
      setCurrentStep('matching');
    }
  };

  const handleExpertSelect = (expert: ExpertProfile) => {
    console.log('Selected Expert:', expert);
    setSelectedExpert(expert);
    setCurrentStep('consultation');
  };

  const handleEndSession = () => {
    // 상담 종료 후 홈으로 돌아가기
    navigate('/');
  };


  const handleBack = () => {
    if (currentStep === 'depression-result' || currentStep === 'panic-result' || currentStep === 'adhd-result' || currentStep === 'stress-result' || currentStep === 'bigfive-result' || currentStep === 'attachment-result' || currentStep === 'career-result') {
      // 결과 페이지에서는 결과를 유지하면서 검사 선택으로 돌아가기
      setCurrentStep('test-type');
      // 결과 데이터는 유지 (초기화하지 않음)
    } else if (currentStep === 'dream-interpretation' || currentStep === 'saju-analysis' || currentStep === 'analysis' || currentStep === 'matching' || currentStep === 'consultation' || currentStep === 'language-result' || currentStep === 'child-result' || currentStep === 'infant-result' || currentStep === 'adult-result' || currentStep === 'ai-chat' || currentStep === 'realtime-chat') {
      // 기타 단계에서는 처음부터 다시 시작
      setCurrentStep('test-type');
      setTestType(null);
    } else if (currentStep === 'legal-notice') {
      setCurrentStep('test-type');
      setTestType(null);
      setSelectedAgeGroup(null);
      setSelectedAge(0);
      setAssessmentResults({});
      setLanguageResults(null);
      setPanicResults(null);
      setDepressionResults(null);
      setAdhdResults(null);
      setStressResults(null);
      setBigfiveResults(null);
      setAttachmentResults(null);
      setCareerResults(null);
      setAnalysisResult("");
      setSelectedExpert(null);
    } else if (currentStep === 'age-select') {
      setCurrentStep('test-type');
      setTestType(null);
    } else {
      setCurrentStep('age-select');
      setSelectedAgeGroup(null);
      setSelectedAge(0);
    }
  };

  if (currentStep === 'ai-chat') {
    return (
      <AIChatInterface 
        assessmentResults={currentAssessmentResults}
        onClose={handleBack}
      />
    );
  }

  if (currentStep === 'realtime-chat') {
    return (
      <RealTimeChat 
        assessmentResults={currentAssessmentResults}
        onClose={handleBack}
      />
    );
  }

  if (currentStep === 'analysis') {
    return (
      <AnalysisScreen 
        results={assessmentResults}
        ageGroup={selectedAgeGroup!}
        age={selectedAge}
        onAnalysisComplete={handleAnalysisComplete}
      />
    );
  }

  if (currentStep === 'matching') {
    return (
      <ExpertMatching 
        analysis={analysisResult}
        ageGroup={selectedAgeGroup!}
        age={selectedAge}
        onExpertSelect={handleExpertSelect}
      />
    );
  }
  if (currentStep === 'consultation' && selectedExpert) {
    return (
      <ConsultationRoom 
        expert={selectedExpert}
        onEndSession={handleEndSession}
      />
    );
  }

  if (currentStep === 'test-type') {
    return (
      <div>
        <UnifiedNavigation />
        <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 relative overflow-hidden pt-4">
        
        <div className="relative z-10 container mx-auto px-6 pt-20 pb-16">
          <div className="text-center mb-16 space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              <span className="block text-foreground mb-2">3분으로 시작하는</span>
              <span className="block text-brand-gradient">마음상태 체크</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              어떤 체크를 받고 싶으신가요? (참고용)
            </p>
          </div>


          {/* 최고 중요도 - 전문 심리검사 섹션 */}
          <div className="mb-12">
            {/* 최고 중요도 레이어 */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 rounded-3xl blur-sm"></div>
              <div className="relative bg-gradient-to-r from-red-50 via-orange-50 to-red-50 dark:from-red-950/30 dark:via-orange-950/30 dark:to-red-950/30 rounded-2xl p-8 border-2 border-red-200 dark:border-red-800">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm mb-4">
                    🔥 최고 중요도 - 전문 검사
                  </div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">전문 심리검사</h2>
                  <p className="text-muted-foreground text-lg">
                    AHI 독창적 도구로 정확한 진단을 받아보세요
                  </p>
                </div>

                <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  <div 
                    className="bg-white dark:bg-card hover-glow border-2 border-red-300 dark:border-red-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative shadow-lg"
                    onClick={() => handleTestTypeSelect('psychological')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-blue-500 text-white text-xs px-2 py-1 opacity-80">2토큰</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-brand-gradient mb-3">마음상태 체크</h3>
                    <p className="text-muted-foreground mb-3 text-sm">연령별 맞춤 심리상태 참고 분석 (진단 아님)</p>
                    <ul className="space-y-1 text-sm">
                      <li>• 연령별 맞춤 체크</li>
                      <li>• AI 참고 분석 + 상담사 연결</li>
                      <li>• 종합적인 마음상태 확인</li>
                    </ul>
                  </div>
                  
                  <div 
                    className="bg-white dark:bg-card hover-glow border-2 border-red-300 dark:border-red-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative shadow-lg"
                    onClick={() => handleTestTypeSelect('panic')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-blue-500 text-white text-xs px-2 py-1 opacity-80">2토큰</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-brand-gradient mb-3">불안감 수준 확인</h3>
                    <p className="text-muted-foreground mb-3 text-sm">불안감 증상 자가체크 (참고용)</p>
                    <ul className="space-y-1 text-sm">
                      <li>• AHI-ANXIETY 21문항</li>
                      <li>• 신속한 현재상태 확인</li>
                      <li>• 수준별 참고 분석</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-white dark:bg-card hover-glow border-2 border-red-300 dark:border-red-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative shadow-lg"
                    onClick={() => handleTestTypeSelect('depression')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-blue-500 text-white text-xs px-2 py-1 opacity-80">2토큰</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-brand-gradient mb-3">우울감 자가체크</h3>
                    <p className="text-muted-foreground mb-3 text-sm">우울감 수준 확인 (참고용)</p>
                    <ul className="space-y-1 text-sm">
                      <li>• AHI-MOOD 21문항</li>
                      <li>• AI 참고 분석</li>
                      <li>• 전문적 해석 제공</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-white dark:bg-card hover-glow border-2 border-red-300 dark:border-red-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative shadow-lg"
                    onClick={() => handleTestTypeSelect('adhd')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-blue-500 text-white text-xs px-2 py-1 opacity-80">2토큰</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-brand-gradient mb-3">주의집중력 자가체크</h3>
                    <p className="text-muted-foreground mb-3 text-sm">연령별 ADHD 증상 확인 (참고용)</p>
                    <ul className="space-y-1 text-sm">
                      <li>• 아동청소년/성인 구분</li>
                      <li>• 주의집중력 증상 체크 18문항</li>
                      <li>• 증상 영역별 분석</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-white dark:bg-card hover-glow border-2 border-red-300 dark:border-red-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative shadow-lg"
                    onClick={() => handleTestTypeSelect('selfesteem')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-blue-500 text-white text-xs px-2 py-1 opacity-80">2토큰</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-brand-gradient mb-3">영유아 자아가치 체크</h3>
                    <p className="text-muted-foreground mb-3 text-sm">영유아 연령별 자존감 및 정서발달 확인 (참고용)</p>
                    <ul className="space-y-1 text-sm">
                      <li>• 연령대별 15문항</li>
                      <li>• 정서발달 상태 확인</li>
                      <li>• 자아 발달 분석</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 발달전문검사 섹션 */}
          <div className="mb-12">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/15 via-teal-500/15 to-green-500/15 rounded-3xl blur-sm"></div>
              <div className="relative bg-gradient-to-r from-green-50 via-teal-50 to-green-50 dark:from-green-950/20 dark:via-teal-950/20 dark:to-green-950/20 rounded-2xl p-8 border border-green-200 dark:border-green-800">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm mb-4">
                    🧠 발달전문검사
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">아동 · 청소년 발달검사</h3>
                  <p className="text-muted-foreground">
                    연령별 발달 상태를 전문적으로 확인하는 검사
                  </p>
                </div>
                
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  <div 
                    className="bg-white dark:bg-card hover-glow border border-green-300 dark:border-green-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative shadow-md"
                    onClick={() => handleTestTypeSelect('developmental-delay')}
                  >
                    <h4 className="text-lg font-bold text-brand-gradient mb-3">발달지연 검사</h4>
                    <p className="text-muted-foreground text-sm mb-3">전반적 발달지연 선별진단</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 전반적 발달 상태</li>
                      <li>• 연령별 발달 기준</li>
                      <li>• 조기 선별 가능</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-white dark:bg-card hover-glow border border-green-300 dark:border-green-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative shadow-md"
                    onClick={() => handleTestTypeSelect('language')}
                  >
                    <div className="inline-flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full font-bold text-xs mb-2">
                      2분체크
                    </div>
                    <h4 className="text-lg font-bold text-brand-gradient mb-3">영유아언어발달체크</h4>
                    <p className="text-muted-foreground text-sm mb-3">언어발달 2세부터 · 빠른 현상 확인 (한국어)</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 표현어휘 20단어</li>
                      <li>• 의사표현 단계 분석</li>
                      <li>• 발달 과정 체크</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-white dark:bg-card hover-glow border border-green-300 dark:border-green-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative shadow-md"
                    onClick={() => handleTestTypeSelect('sensory-integration')}
                  >
                    <h4 className="text-lg font-bold text-brand-gradient mb-3">감각통합장애 검사</h4>
                    <p className="text-muted-foreground text-sm mb-3">감각처리 및 통합능력 평가</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 감각 처리 기능</li>
                      <li>• 통합 능력 평가</li>
                      <li>• 일상생활 적응</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-white dark:bg-card hover-glow border border-green-300 dark:border-green-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative shadow-md"
                    onClick={() => handleTestTypeSelect('learning-disability')}
                  >
                    <h4 className="text-lg font-bold text-brand-gradient mb-3">학습장애 검사</h4>
                    <p className="text-muted-foreground text-sm mb-3">학습능력 및 인지기능 평가</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 읽기·쓰기·수학</li>
                      <li>• 인지기능 평가</li>
                      <li>• 학습전략 제안</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-white dark:bg-card hover-glow border border-green-300 dark:border-green-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative shadow-md"
                    onClick={() => handleTestTypeSelect('social-development')}
                  >
                    <h4 className="text-lg font-bold text-brand-gradient mb-3">사회성 발달 검사</h4>
                    <p className="text-muted-foreground text-sm mb-3">사회적 상호작용 및 적응 평가</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 사회적 기술</li>
                      <li>• 대인관계 능력</li>
                      <li>• 적응행동 평가</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 중간 중요도 - AIH 전문가 창작 검사 섹션 */}
          <div className="mb-12">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-blue-500/15 rounded-3xl blur-sm"></div>
              <div className="relative bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-blue-950/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-sm mb-4">
                    ⭐ 높은 중요도 - 3분 검사
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">AIH 전문가 창작 검사</h3>
                  <p className="text-muted-foreground">
                    심리전문가가 직접 개발한 신뢰도 높은 창작 검사
                  </p>
                </div>
                
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {/* 🔥 TOP 인기 3분 테스트 1위 */}
                  <div 
                    className="bg-white dark:bg-card hover-glow border border-blue-300 dark:border-blue-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative shadow-md"
                    onClick={() => setCurrentStep('bigfive-test')}
                  >
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-red-500 text-white font-bold text-xs px-2 py-1">
                        🔥 1위
                      </Badge>
                    </div>
                    <h4 className="text-lg font-bold text-brand-gradient mb-3">5차원 성격 분석</h4>
                    <p className="text-muted-foreground text-sm mb-3">나의 성격 특성 탐색</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 25문항 5분</li>
                      <li>• 5가지 영역</li>
                      <li>• 상세 분석</li>
                    </ul>
                  </div>

                  {/* 🔥 TOP 인기 3분 테스트 2위 */}
                  <div 
                    className="bg-white dark:bg-card hover-glow border border-blue-300 dark:border-blue-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative shadow-md"
                    onClick={() => setCurrentStep('attachment-test')}
                  >
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-orange-500 text-white font-bold text-xs px-2 py-1">
                        🔥 2위
                      </Badge>
                    </div>
                    <h4 className="text-lg font-bold text-brand-gradient mb-3">관계유형 진단</h4>
                    <p className="text-muted-foreground text-sm mb-3">인간관계 패턴 분석</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 20문항 4분</li>
                      <li>• 4가지 유형</li>
                      <li>• 관계 조언</li>
                    </ul>
                  </div>

                  {/* 🔥 TOP 인기 3분 테스트 3위 */}
                  <div 
                    className="bg-white dark:bg-card hover-glow border border-blue-300 dark:border-blue-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative shadow-md"
                    onClick={() => setCurrentStep('stress-test')}
                  >
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-yellow-500 text-white font-bold text-xs px-2 py-1">
                        🔥 3위
                      </Badge>
                    </div>
                    <h4 className="text-lg font-bold text-brand-gradient mb-3">스트레스지수 측정</h4>
                    <p className="text-muted-foreground text-sm mb-3">일상 스트레스 수준 체크</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 12문항 4분</li>
                      <li>• 간편 측정</li>
                      <li>• 즉시 결과</li>
                    </ul>
                  </div>

                  {/* 📈 인기 3분 테스트 4위 */}
                  <div 
                    className="bg-white dark:bg-card hover-glow border border-blue-300 dark:border-blue-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative shadow-md"
                    onClick={() => setCurrentStep('career-test')}
                  >
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-blue-500 text-white font-bold text-xs px-2 py-1">
                        📈 4위
                      </Badge>
                    </div>
                    <h4 className="text-lg font-bold text-brand-gradient mb-3">진로흥미 탐색</h4>
                    <p className="text-muted-foreground text-sm mb-3">나에게 맞는 직업 찾기</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 30문항 6분</li>
                      <li>• 6가지 유형</li>
                      <li>• 직업 추천</li>
                    </ul>
                  </div>

                  {/* ⭐ 추천 3분 테스트 */}
                  <div 
                    className="bg-white dark:bg-card hover-glow border border-blue-300 dark:border-blue-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative shadow-md"
                    onClick={() => setCurrentStep('selfesteem-test')}
                  >
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-purple-500 text-white font-bold text-xs px-2 py-1">
                        ⭐ 추천
                      </Badge>
                    </div>
                    <h4 className="text-lg font-bold text-brand-gradient mb-3">자아가치 측정</h4>
                    <p className="text-muted-foreground text-sm mb-3">나의 자존감 수준 체크</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 15문항 4분</li>
                      <li>• 자존감 분석</li>
                      <li>• 향상 가이드</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 재미용 검사 섹션 - 맨 아래로 이동 */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-sm"></div>
              <div className="relative bg-gradient-to-r from-green-50 via-purple-50 to-pink-50 dark:from-green-950/10 dark:via-purple-950/10 dark:to-pink-950/10 rounded-2xl p-8 border border-green-200 dark:border-green-800">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm mb-4">
                    🎮 재미용 - 엔터테인먼트
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">재미있는 AI 검사</h3>
                  <p className="text-muted-foreground">
                    친구들과 함께 즐길 수 있는 재미있는 AI 검사들
                  </p>
                </div>
                
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <div 
                    className="bg-gradient-to-br from-indigo-500 to-purple-600 hover-glow border border-purple-300 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 text-white relative"
                    onClick={() => handleTestTypeSelect('dream')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-purple-700 text-white text-xs px-2 py-1 opacity-80">5토큰</Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-3">🌙 AI 꿈 해몽</h3>
                    <p className="text-purple-100 mb-3 text-sm">당신의 꿈이 담고 있는 의미를 AI가 해석 (재미용)</p>
                    <ul className="space-y-1 text-sm text-purple-100">
                      <li>• 꿈 내용 입력</li>
                      <li>• AI 즉시 해몽</li>
                      <li>• 심리적 의미 해석</li>
                    </ul>
                  </div>
                  
                  <div 
                    className="bg-gradient-to-br from-orange-500 to-red-600 hover-glow border border-orange-300 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 text-white relative"
                    onClick={() => handleTestTypeSelect('saju')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-red-700 text-white text-xs px-2 py-1 opacity-80">8토큰</Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-3">🔮 AI 사주풀이</h3>
                    <p className="text-orange-100 mb-3 text-sm">생년월일시로 당신의 운세와 사주를 AI가 분석 (재미용)</p>
                    <ul className="space-y-1 text-sm text-orange-100">
                      <li>• 생년월일시 입력</li>
                      <li>• AI 즉시 사주분석</li>
                      <li>• 운세와 성향 해석</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-gradient-to-br from-purple-500 to-pink-600 hover-glow border border-purple-300 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 text-white relative"
                    onClick={() => navigate('/fun-tests?type=past-life-job')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-pink-700 text-white text-xs px-2 py-1 opacity-80">🔥 HOT</Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-3">👑 내 전생은 어떤 직업?</h3>
                    <p className="text-purple-100 mb-3 text-sm">AI가 분석하는 나의 전생 직업과 운명!</p>
                    <ul className="space-y-1 text-sm text-purple-100">
                      <li>• MZ세대 인기</li>
                      <li>• AI 즉시 해석</li>
                      <li>• 신비로운 결과</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-gradient-to-br from-orange-500 to-yellow-600 hover-glow border border-orange-300 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 text-white relative"
                    onClick={() => navigate('/fun-tests?type=animal-face-match')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-yellow-700 text-white text-xs px-2 py-1 opacity-80">📈 TREND</Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-3">📸 내 얼굴 닮은 동물 찾기</h3>
                    <p className="text-orange-100 mb-3 text-sm">카메라로 얼굴을 찍으면 AI가 닮은 동물을 찾아줘!</p>
                    <ul className="space-y-1 text-sm text-orange-100">
                      <li>• 초등·청소년 인기</li>
                      <li>• AI 즉시 분석</li>
                      <li>• 친구들과 비교</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-gradient-to-br from-green-500 to-blue-600 hover-glow border border-green-300 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 text-white relative"
                    onClick={() => navigate('/fun-tests?type=inner-animal')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-blue-700 text-white text-xs px-2 py-1 opacity-80">✨ NEW</Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-3">💚 나의 내면 동물 찾기</h3>
                    <p className="text-green-100 mb-3 text-sm">깊은 심리 분석으로 알아보는 나의 진짜 성격!</p>
                    <ul className="space-y-1 text-sm text-green-100">
                      <li>• 40대+ 인기</li>
                      <li>• AI 심리 분석</li>
                      <li>• 성격 탐구</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-gradient-to-br from-red-500 to-orange-600 hover-glow border border-red-300 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 text-white relative"
                    onClick={() => navigate('/fun-tests?type=grandma-relationship')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-orange-700 text-white text-xs px-2 py-1 opacity-80">🔥 HOT</Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-3">👵 욕쟁이 할머니의 연애 진단</h3>
                    <p className="text-red-100 mb-3 text-sm">할머니가 직설적으로 당신들의 연애를 진단!</p>
                    <ul className="space-y-1 text-sm text-red-100">
                      <li>• 커플·부부</li>
                      <li>• 할머니 독설</li>
                      <li>• 촌철살인 조언</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-gradient-to-br from-blue-500 to-indigo-600 hover-glow border border-blue-300 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 text-white relative"
                    onClick={() => navigate('/fun-tests?type=grandpa-marriage')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-indigo-700 text-white text-xs px-2 py-1 opacity-80">🆕 NEW</Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-3">👴 욕쟁이 할아버지의 부부금술진단</h3>
                    <p className="text-blue-100 mb-3 text-sm">할아버지가 부부싸움에서 누가 잘못했는지 제대로 판단!</p>
                    <ul className="space-y-1 text-sm text-blue-100">
                      <li>• 부부싸움 분석</li>
                      <li>• 할아버지 독설</li>
                      <li>• 배우자 공유 가능</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-gradient-to-br from-orange-500 to-yellow-600 hover-glow border border-orange-300 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 text-white relative"
                    onClick={() => navigate('/fun-tests?type=mz_nagging')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-yellow-700 text-white text-xs px-2 py-1 opacity-80">🔥 TREND</Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-3">🍲 국밥집 이모의 MZ잔소리</h3>
                    <p className="text-orange-100 mb-3 text-sm">이모가 요즘 애들 걱정해서 해주는 따뜻하고 현실적인 잔소리!</p>
                    <ul className="space-y-1 text-sm text-orange-100">
                      <li>• MZ세대 맞춤</li>
                      <li>• 현실적인 조언</li>
                      <li>• 이모의 따뜻한 걱정</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
        </div>
      </div>
    );
  }


  if (currentStep === 'dream-interpretation') {
    return (
      <div>
        <UnifiedNavigation />
        <div className="pt-4">
          <DreamInterpretation onBack={handleBack} />
        </div>
      </div>
    );
  }
  
  if (currentStep === 'saju-analysis') {
    return (
      <div>
        <UnifiedNavigation />
        <div className="pt-4">
          <SajuAnalysis onBack={handleBack} />
        </div>
      </div>
    );
  }

  if (currentStep === 'legal-notice' && testType && testType !== 'dream') {
    return (
      <div>
        <UnifiedNavigation />
        <div className="pt-4">
          <LegalSafetyNotice onAccept={handleLegalNoticeAccept} testType={testType} />
        </div>
      </div>
    );
  }
  
  if (currentStep === 'age-select') {
    return <AgeSelector onAgeGroupSelect={handleAgeGroupSelect} testType={testType as 'psychological' | 'language' | 'panic' | 'depression' | 'adhd'} />;
  }

  if (currentStep === 'language-test') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">언어발달 자가체크 (3분)</h1>
            <p className="text-muted-foreground">연령에 맞춘 20문항 (참고용)</p>
          </div>
          <LanguageTestForm 
            ageGroup={selectedAgeGroup! as 'infant' | 'child'} 
            age={selectedAge}
            onComplete={handleLanguageTestComplete}
            onBack={handleBack}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'language-result' && languageResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <LanguageTestResult 
            results={languageResults}
            onBack={handleBack}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'panic-test') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">불안감 수준 확인 (3분)</h1>
            <p className="text-muted-foreground">AHI-ANXIETY 수준 확인 21문항 (참고용)</p>
          </div>
          <PanicTestForm 
            onComplete={handlePanicTestComplete}
            onBack={handleBack}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'depression-test') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">우울감 자가체크 (3분)</h1>
            <p className="text-muted-foreground">AHI-MOOD 자가체크 21문항 (참고용)</p>
          </div>
          <DepressionTestForm 
            onComplete={handleDepressionTestComplete}
            onBack={handleBack}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'depression-result' && depressionResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <DepressionTestResult 
            results={depressionResults}
            onBack={handleBack}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'panic-result' && panicResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <PanicTestResult 
            results={panicResults}
            onBack={handleBack}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'child-result' && childResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <ChildAssessmentResult 
            results={childResults}
            onBack={handleBack}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'infant-result' && infantResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <InfantAssessmentResult 
            results={infantResults}
            onBack={handleBack}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'adult-result' && adultResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <AdultAssessmentResult 
            results={adultResults}
            onBack={handleBack}
            onStartAIChat={handleStartAIChat}
            onStartRealTimeChat={handleStartRealTimeChat}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'adhd-test') {
    const adhdAgeGroup = selectedAgeGroup === 'infant' ? 'child' : selectedAgeGroup === 'adult' ? 'adult' : 'child';
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">주의집중력 자가체크 (3분)</h1>
            <p className="text-muted-foreground">주의집중력 증상 체크 18문항 (참고용)</p>
          </div>
          <AdhdTestForm 
            ageGroup={adhdAgeGroup}
            onComplete={handleAdhdTestComplete}
            onBack={handleBack}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'adhd-result' && adhdResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <AdhdTestResult 
            results={adhdResults}
            onBack={handleBack}
            onStartAIChat={handleStartAIChat}
            onStartRealTimeChat={handleStartRealTimeChat}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'stress-test') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">스트레스지수 측정 (AHI-STRESS)</h1>
            <p className="text-muted-foreground">AHI 독창적 도구 12문항 (4분)</p>
          </div>
          <StressTestForm 
            onComplete={handleStressTestComplete}
            onBack={handleBack}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'stress-result' && stressResults) {
    return (
      <div>
        <UnifiedNavigation />
        <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6 pt-8">
          <div className="container mx-auto max-w-4xl">
            <StressTestResult 
              result={stressResults}
              onRestart={() => setCurrentStep('stress-test')}
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'bigfive-test') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">빅파이브 성격검사</h1>
            <p className="text-muted-foreground">5요인 성격 모델 44문항 (5분)</p>
          </div>
          <BigFiveTestForm 
            onComplete={handleBigfiveTestComplete}
            onBack={handleBack}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'bigfive-result' && bigfiveResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <BigFiveTestResult 
            result={bigfiveResults}
            onRestart={() => setCurrentStep('bigfive-test')}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'attachment-test') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">애착 유형 검사</h1>
            <p className="text-muted-foreground">관계 패턴 분석 36문항 (4분)</p>
          </div>
          <AttachmentStyleForm 
            onComplete={handleAttachmentTestComplete}
            onBack={handleBack}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'attachment-result' && attachmentResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <AttachmentStyleResult 
            result={attachmentResults}
            onRestart={() => setCurrentStep('attachment-test')}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'career-test') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">직업 흥미 검사</h1>
            <p className="text-muted-foreground">Holland 진로 탐색 60문항 (7분)</p>
          </div>
          <CareerInterestForm 
            onComplete={handleCareerTestComplete}
            onBack={handleBack}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'selfesteem-test') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">자아가치 측정</h1>
            <p className="text-muted-foreground">나의 자존감 수준 체크 15문항 (4분)</p>
          </div>
          <SelfEsteemTestForm 
            onComplete={handleSelfesteemTestComplete}
            onBack={handleBack}
          />
        </div>
      </div>
    );
  }
  
  // 발달 검사 렌더링
  if (currentStep === 'developmental-delay-test') {
    return <DevelopmentalDelayTestForm onComplete={(results) => {
      setDevelopmentalDelayResults(results);
      setCurrentStep('developmental-delay-result');
    }} onBack={handleBack} />;
  }

  if (currentStep === 'sensory-integration-test') {
    return <SensoryIntegrationTestForm onComplete={(results) => {
      setSensoryIntegrationResults(results);
      setCurrentStep('sensory-integration-result');
    }} onBack={handleBack} />;
  }

  if (currentStep === 'learning-disability-test') {
    return <LearningDisabilityTestForm onComplete={(results) => {
      setLearningDisabilityResults(results);
      setCurrentStep('learning-disability-result');
    }} onBack={handleBack} />;
  }

  if (currentStep === 'social-development-test') {
    return <SocialDevelopmentTestForm onComplete={(results) => {
      setSocialDevelopmentResults(results);
      setCurrentStep('social-development-result');
    }} onBack={handleBack} />;
  }

  // 발달 검사 결과 렌더링
  if (currentStep === 'developmental-delay-result' && developmentalDelayResults) {
    return <DevelopmentalDelayTestResult 
      results={developmentalDelayResults} 
      onBack={handleBack} 
      onRestart={() => setCurrentStep('developmental-delay-test')} 
    />;
  }

  if (currentStep === 'sensory-integration-result' && sensoryIntegrationResults) {
    return <SensoryIntegrationTestResult 
      results={sensoryIntegrationResults} 
      onBack={handleBack} 
      onRestart={() => setCurrentStep('sensory-integration-test')} 
    />;
  }

  if (currentStep === 'learning-disability-result' && learningDisabilityResults) {
    return <LearningDisabilityTestResult 
      results={learningDisabilityResults} 
      onBack={handleBack} 
      onRestart={() => setCurrentStep('learning-disability-test')} 
    />;
  }

  if (currentStep === 'social-development-result' && socialDevelopmentResults) {
    return <SocialDevelopmentTestResult 
      results={socialDevelopmentResults} 
      onBack={handleBack} 
      onRestart={() => setCurrentStep('social-development-test')} 
    />;
  }


  if (currentStep === 'career-result' && careerResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <CareerInterestResult 
            result={careerResults}
            onRestart={() => setCurrentStep('career-test')}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <UnifiedNavigation />
      <div className="pt-4">
        {selectedAgeGroup === 'infant' && (
          <InfantAssessment 
            age={selectedAge} 
            onComplete={handleAssessmentComplete}
            onBack={handleBack}
          />
        )}
        {selectedAgeGroup === 'child' && (
          <ChildAssessmentSimplified 
            age={selectedAge} 
            onComplete={handleAssessmentComplete}
            onBack={handleBack}
          />
        )}
        {selectedAgeGroup === 'adult' && (
          <AdultAssessment 
            age={selectedAge} 
            onComplete={handleAssessmentComplete}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
};

export default Assessment;