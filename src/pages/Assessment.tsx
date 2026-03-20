import { useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n/useTranslation";
import { BetaBanner } from "@/components/BetaBanner";
import { MedicalDisclaimer } from "@/components/legal/MedicalDisclaimer";
import { useEventTracking } from "@/hooks/useEventTracking";
import { useGuestSession } from "@/hooks/useGuestSession";
import AgeSelector from "@/components/assessment/AgeSelector";
import InfantAssessment from "@/components/assessment/InfantAssessment";
import ChildAssessmentSimplified from "@/components/assessment/ChildAssessmentSimplified";
import AdultAssessment from "@/components/assessment/AdultAssessment";
import InfantAssessmentResult from "@/components/assessment/InfantAssessmentResult";
import ChildAssessmentResult from "@/components/assessment/ChildAssessmentResult";
import AdultAssessmentResult from "@/components/assessment/AdultAssessmentResult";
import InfantLanguageTestForm from "@/components/assessment/InfantLanguageTestForm";
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
import ChallengingBehaviorForm from "@/components/assessment/ChallengingBehaviorForm";
import ChallengingBehaviorResult from "@/components/assessment/ChallengingBehaviorResult";
import AdaptiveBehaviorForm from "@/components/assessment/AdaptiveBehaviorForm";
import AdaptiveBehaviorResult from "@/components/assessment/AdaptiveBehaviorResult";
import ParentChildPlayTest from "@/components/assessment/ParentChildPlayTest";
import DreamInterpretation from "@/components/assessment/DreamInterpretation";
import SajuAnalysis from "@/components/assessment/SajuAnalysis";
import PastLifeJobTest from "@/components/assessment/PastLifeJobTest";
import AnimalFaceTest from "@/components/assessment/AnimalFaceTest";
// 삭제된 재미 검사: InnerAnimalTest, GrandmaRelationshipTest, GrandpaMarriageDiagnosis, MZNaggingTest, WisdomAdviceTest, OtrovertTest
import LifeAchievementTest from "@/components/assessment/LifeAchievementTest";
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
import { Sparkles, Crown, Camera, Heart, Zap, Brain, Target, MessageCircle, Coins, ChevronDown, CheckCircle } from "lucide-react";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import SignupPromptModal from "@/components/guest/SignupPromptModal";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const Assessment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { trackTestStart, trackTestComplete, trackPageView } = useEventTracking();
  const { isGuest, saveGuestResult, guestResults } = useGuestSession();
  const { t } = useTranslation();
  
  // 가입 유도 모달 상태
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [lastCompletedResult, setLastCompletedResult] = useState<{ testTitle: string; score?: number; level?: string } | null>(null);
  
  // URL 파라미터에서 테스트 타입 확인
  const urlTestType = searchParams.get('type');
  const urlTest = searchParams.get('test');
  
  const isPopstateRef = useRef(false);
  const [currentStep, setCurrentStepRaw] = useState<'test-type' | 'legal-notice' | 'age-select' | 'test-selection' | 'assessment' | 'language-test' | 'panic-test' | 'depression-test' | 'adhd-test' | 'stress-test' | 'bigfive-test' | 'attachment-test' | 'career-test' | 'selfesteem-test' | 'emotional-development-test' | 'dream-interpretation' | 'saju-analysis' | 'past-life-job' | 'animal-face-match' | 'inner-animal' | 'grandma-relationship' | 'grandpa-marriage' | 'mz-nagging' | 'wisdom-advice' | 'otrovert' | 'life-achievement' | 'parent-child-play' | 'analysis' | 'matching' | 'consultation' | 'language-result' | 'panic-result' | 'depression-result' | 'adhd-result' | 'stress-result' | 'bigfive-result' | 'attachment-result' | 'career-result' | 'selfesteem-result' | 'child-result' | 'infant-result' | 'adult-result' | 'ai-chat' | 'realtime-chat' | 'developmental-delay-test' | 'sensory-integration-test' | 'learning-disability-test' | 'social-development-test' | 'developmental-delay-result' | 'sensory-integration-result' | 'learning-disability-result' | 'social-development-result' | 'challenging-behavior-test' | 'challenging-behavior-result' | 'adaptive-behavior-test' | 'adaptive-behavior-result'>('test-type');
  
  // setCurrentStep wrapper: 브라우저 히스토리에 상태 push
  const setCurrentStep = useCallback((step: typeof currentStep) => {
    if (!isPopstateRef.current) {
      window.history.pushState({ assessmentStep: step }, '', window.location.pathname + window.location.search);
    }
    setCurrentStepRaw(step);
  }, []);

  // 브라우저 뒤로가기 버튼 감지
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.assessmentStep) {
        isPopstateRef.current = true;
        setCurrentStepRaw(e.state.assessmentStep);
        isPopstateRef.current = false;
      } else {
        // state가 없으면 assessment 밖으로 나가는 것이므로 브라우저 기본 동작
      }
    };

    window.addEventListener('popstate', handlePopState);
    // 현재 상태를 히스토리에 replace (초기 상태 기록)
    window.history.replaceState({ assessmentStep: currentStep }, '', window.location.pathname + window.location.search);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [testType, setTestType] = useState<'psychological' | 'language' | 'panic' | 'depression' | 'adhd' | 'stress' | 'bigfive' | 'attachment' | 'career' | 'selfesteem' | 'dream' | 'saju' | 'developmental-delay' | 'sensory-integration' | 'learning-disability' | 'social-development' | 'challenging-behavior' | 'adaptive-behavior' | 'parent-child-play' | 'resilience' | null>(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'infant' | 'child' | 'adult' | null>(null);
  const [selectedAge, setSelectedAge] = useState<number>(0);
  const [assessmentResults, setAssessmentResults] = useState<Record<string, number>>({});
  const [languageResults, setLanguageResults] = useState<{answers: number[], total: number, average: number, ageGroup: string, age: number} | null>(null);
  const [panicResults, setPanicResults] = useState<{answers: number[], total: number, average: number, severity: string} | null>(null);
  const [depressionResults, setDepressionResults] = useState<{answers: number[], total: number, average: number, severity: string, ageGroup?: string} | null>(null);
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
  const [challengingBehaviorResults, setChallengingBehaviorResults] = useState<{answers: number[], total: number, average: number, severity: string} | null>(null);
  const [adaptiveBehaviorResults, setAdaptiveBehaviorResults] = useState<{answers: number[], total: number, average: number, level: string} | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [selectedExpert, setSelectedExpert] = useState<ExpertProfile | null>(null);
  const [currentAssessmentResults, setCurrentAssessmentResults] = useState<any>(null);
  const [expandedSimpleTest, setExpandedSimpleTest] = useState<string | null>(null);
  
  // 게스트 결과 저장 및 가입 유도 헬퍼
  const handleGuestResultComplete = (testType: string, testTitle: string, results: any, ageGroup?: string) => {
    if (isGuest) {
      saveGuestResult(testType, testTitle, results, ageGroup);
      setLastCompletedResult({
        testTitle,
        score: results.total,
        level: results.severity || results.level
      });
      // 결과 표시 후 2초 뒤에 가입 유도 모달
      setTimeout(() => {
        setShowSignupPrompt(true);
      }, 2000);
    }
  };

  // URL 파라미터 및 location state에 따른 초기 설정
  useEffect(() => {
    // URL에서 ?type=fun인 경우 새로운 페이지로 리다이렉트
    if (urlTestType === 'fun') {
      navigate('/fun-tests', { replace: true });
      return;
    }
    
    // location.state에서 testType 확인 (3분 테스트에서 온 경우)
    const stateTestType = location.state?.testType;
    if (stateTestType) {
      console.log('🔍 Test type from state:', stateTestType);
      handleTestTypeSelect(stateTestType);
    }
    
    // location.state에서 selectedTest 확인 (추천 검사에서 온 경우)
    const selectedTest = location.state?.selectedTest;
    if (selectedTest) {
      console.log('🔍 Selected test from state:', selectedTest);
      // 테스트 ID를 적절한 단계로 매핑
      const testMapping: Record<string, string> = {
        'adaptive-behavior-test': 'adaptive-behavior-test',
        'challenging-behavior-test': 'challenging-behavior-test',
        'sensory-integration-test': 'sensory-integration-test',
        'social-development-test': 'social-development-test',
        'developmental-delay-test': 'developmental-delay-test',
        'learning-disability-test': 'learning-disability-test',
        'adhd-test': 'adhd-test',
        'self-esteem-test': 'selfesteem-test',
        'language-development-test': 'language-test',
        'autism-screening-test': 'developmental-delay-test',
        'parenting-style-test': 'test-type', // 양육방식 검사는 기본 화면으로
      };
      const targetStep = testMapping[selectedTest] || 'test-type';
      setCurrentStep(targetStep as any);
    }
    
    // URL 경로에 따른 자동 테스트 시작
    if (location.pathname === '/assessment/stress-test') {
      console.log('🔍 Stress test path detected, starting stress test...');
      setTestType('stress');
      setCurrentStep('stress-test');
    }
  }, [urlTestType, navigate, location.pathname, location.state]);

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
          title: t.assessment.testComplete,
          description: t.assessment.testSaved,
        });
      }
    } catch (error) {
      console.error('Timeline 저장 중 오류:', error);
    }
  };

  const getTestTitle = (testType: string) => {
    const titles = t.assessment.testTitles;
    switch (testType) {
      case 'adhd': return titles.adhd;
      case 'depression': return titles.depression;
      case 'panic': return titles.panic;
      case 'language': return titles.language;
      case 'stress': return titles.stress;
      case 'bigfive': return titles.bigfive;
      case 'attachment': return titles.attachment;
      case 'career': return titles.career;
      case 'selfesteem': return titles.selfesteem;
      case 'developmental-delay': return titles.developmentalDelay;
      case 'sensory-integration': return titles.sensoryIntegration;
      case 'learning-disability': return titles.learningDisability;
      case 'social-development': return titles.socialDevelopment;
      case 'challenging-behavior': return titles.challengingBehavior;
      case 'adaptive-behavior': return titles.adaptiveBehavior;
      default: return titles.default;
    }
  };

  const handleTestTypeSelect = async (type: 'psychological' | 'language' | 'panic' | 'depression' | 'adhd' | 'stress' | 'bigfive' | 'attachment' | 'career' | 'selfesteem' | 'dream' | 'saju' | 'developmental-delay' | 'sensory-integration' | 'learning-disability' | 'social-development' | 'challenging-behavior' | 'adaptive-behavior' | 'parent-child-play' | 'resilience') => {
    // 게스트 모드 허용 - 로그인 없이도 검사 진행 가능
    console.log('🎯 Test type selected:', type, isGuest ? '(게스트 모드)' : '(로그인됨)');

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
    } else if (type === 'language') {
      setCurrentStep('language-test');
    } else if (type === 'depression') {
      setCurrentStep('depression-test');
    } else if (type === 'panic') {
      setCurrentStep('panic-test');
    } else if (type === 'adhd') {
      setCurrentStep('adhd-test');
    } else if (type === 'selfesteem') {
      setCurrentStep('selfesteem-test');
    } else if (type === 'developmental-delay') {
      setCurrentStep('developmental-delay-test');
    } else if (type === 'sensory-integration') {
      setCurrentStep('sensory-integration-test');
    } else if (type === 'learning-disability') {
      setCurrentStep('learning-disability-test');
    } else if (type === 'social-development') {
      setCurrentStep('social-development-test');
    } else if (type === 'challenging-behavior') {
      setCurrentStep('challenging-behavior-test');
    } else if (type === 'adaptive-behavior') {
      setCurrentStep('adaptive-behavior-test');
    } else if (type === 'parent-child-play') {
      setCurrentStep('parent-child-play');
    } else if (type === 'resilience') {
      navigate('/assessment/resilience');
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
    
    // "연령별 맞춤체크"인 경우 검사 선택 단계로 이동
    if (testType === 'psychological' || !testType) {
      setCurrentStep('test-selection');
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

  const handleLanguageTestComplete = async (results: {answers: number[], total: number, average: number, ageGroup: string, age: number}) => {
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

  const handleDepressionTestComplete = async (results: {answers: number[], total: number, average: number, severity: string, ageGroup?: string}) => {
    console.log('Depression Test Results:', results);
    setDepressionResults(results);
    
    // Timeline에 검사 결과 저장
    await saveTestToTimeline('depression', results);
    
    setCurrentAssessmentResults({
      testType: 'depression',
      ageGroup: results.ageGroup || '성인',
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
    // 결과 페이지에서 뒤로가기 -> 검사 선택 화면으로 (결과 데이터 리셋)
    const resultSteps = [
      'depression-result', 'panic-result', 'adhd-result', 'stress-result', 
      'bigfive-result', 'attachment-result', 'career-result', 'selfesteem-result',
      'language-result', 'child-result', 'infant-result', 'adult-result',
      'developmental-delay-result', 'sensory-integration-result', 
      'learning-disability-result', 'social-development-result',
      'challenging-behavior-result', 'adaptive-behavior-result'
    ];
    
    // 검사 폼 페이지들
    const testFormSteps = [
      'depression-test', 'panic-test', 'adhd-test', 'stress-test',
      'bigfive-test', 'attachment-test', 'career-test', 'selfesteem-test',
      'language-test', 'developmental-delay-test', 'sensory-integration-test',
      'learning-disability-test', 'social-development-test',
      'challenging-behavior-test', 'adaptive-behavior-test',
      'dream-interpretation', 'saju-analysis', 'past-life-job', 
      'animal-face-match', 'inner-animal', 'grandma-relationship',
      'grandpa-marriage', 'mz-nagging', 'wisdom-advice', 'otrovert', 
      'life-achievement', 'parent-child-play'
    ];
    
    if (resultSteps.includes(currentStep)) {
      // 결과 페이지에서 뒤로가기 -> 검사 선택 화면으로
      setCurrentStep('test-type');
      setTestType(null);
    } else if (testFormSteps.includes(currentStep)) {
      // 검사 폼에서 뒤로가기 -> 검사 선택 화면으로
      setCurrentStep('test-type');
      setTestType(null);
    } else if (currentStep === 'test-selection') {
      // 검사 선택 단계에서 뒤로가기 -> 연령 선택으로
      setCurrentStep('age-select');
    } else if (currentStep === 'analysis' || currentStep === 'matching' || currentStep === 'consultation' || currentStep === 'ai-chat' || currentStep === 'realtime-chat') {
      setCurrentStep('test-type');
      setTestType(null);
    } else if (currentStep === 'legal-notice') {
      setCurrentStep('test-type');
      setTestType(null);
      setSelectedAgeGroup(null);
      setSelectedAge(0);
    } else if (currentStep === 'age-select') {
      setCurrentStep('test-type');
      setTestType(null);
    } else if (currentStep === 'assessment') {
      setCurrentStep('age-select');
    } else if (currentStep === 'test-type') {
      // 메인 검사 목록에서 뒤로가기 -> 이전 페이지로
      navigate(-1);
    } else {
      // 기본적으로 검사 선택 화면으로
      setCurrentStep('test-type');
      setTestType(null);
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
        <div className="min-h-screen bg-background pt-4">
        {/* Clean subtle background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 md:px-6 pt-16 pb-16">

          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {t.assessment.pageTitle}
            </h1>
            <p className="text-muted-foreground">
              {t.assessment.pageSubtitle}
            </p>
          </div>

          {/* ========== 🟢 무료 기본검사 ========== */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
              <h2 className="text-lg font-bold text-foreground">{t.assessment.freeBasicSection}</h2>
              <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] border-0">{t.assessment.freeBadge}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-4 ml-5">{t.assessment.freeBasicDesc}</p>

            <div className="space-y-2">
              {[
                { key: 'depression', title: t.assessment.depressionTitle, duration: t.assessment.depressionDuration, questions: t.assessment.depressionQuestions, description: t.assessment.depressionDesc, features: t.assessment.depressionFeatures, gradient: 'from-blue-600/20 to-indigo-600/20', borderHover: 'hover:border-blue-400/50 hover:bg-blue-500/5', textHover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400', dotColor: 'bg-blue-500' },
                { key: 'panic', title: t.assessment.panicTitle, duration: t.assessment.panicDuration, questions: t.assessment.panicQuestions, description: t.assessment.panicDesc, features: t.assessment.panicFeatures, gradient: 'from-rose-600/20 to-pink-600/20', borderHover: 'hover:border-rose-400/50 hover:bg-rose-500/5', textHover: 'group-hover:text-rose-600 dark:group-hover:text-rose-400', dotColor: 'bg-rose-500' },
                { key: 'stress', title: t.assessment.stressTitle, duration: t.assessment.stressDuration, questions: t.assessment.stressQuestions, description: t.assessment.stressDesc, features: t.assessment.stressFeatures, gradient: 'from-amber-600/20 to-orange-600/20', borderHover: 'hover:border-amber-400/50 hover:bg-amber-500/5', textHover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400', dotColor: 'bg-amber-500' },
                { key: 'selfesteem', title: t.assessment.selfesteemTitle, duration: t.assessment.selfesteemDuration, questions: t.assessment.selfesteemQuestions, description: t.assessment.selfesteemDesc, features: t.assessment.selfesteemFeatures, gradient: 'from-violet-600/20 to-purple-600/20', borderHover: 'hover:border-violet-400/50 hover:bg-violet-500/5', textHover: 'group-hover:text-violet-600 dark:group-hover:text-violet-400', dotColor: 'bg-violet-500' },
                { key: 'adhd', title: t.assessment.adhdTitle, duration: t.assessment.adhdDuration, questions: t.assessment.adhdQuestions, description: t.assessment.adhdDesc, features: t.assessment.adhdFeatures, gradient: 'from-teal-600/20 to-emerald-600/20', borderHover: 'hover:border-teal-400/50 hover:bg-teal-500/5', textHover: 'group-hover:text-teal-600 dark:group-hover:text-teal-400', dotColor: 'bg-teal-500' },
              ].map((test) => {
                const isExpanded = expandedSimpleTest === test.key;
                return (
                  <Collapsible key={test.key} open={isExpanded} onOpenChange={() => setExpandedSimpleTest(isExpanded ? null : test.key)}>
                    <CollapsibleTrigger asChild>
                      <button className={`w-full group text-left p-3 md:p-4 rounded-xl border border-border ${test.borderHover} transition-all`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${test.gradient} flex items-center justify-center flex-shrink-0`}>
                              <div className={`w-2.5 h-2.5 rounded-full ${test.dotColor}`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 md:gap-2 mb-0.5">
                                <h3 className={`font-semibold text-sm md:text-base text-foreground ${test.textHover} truncate`}>{test.title}</h3>
                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] px-1 py-0 border-0 flex-shrink-0">{t.assessment.freeBadge}</Badge>
                              </div>
                              <p className="text-[11px] md:text-xs text-muted-foreground truncate">{test.duration} · {test.questions}</p>
                            </div>
                          </div>
                          <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 text-muted-foreground transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mx-2 p-4 bg-muted/30 rounded-b-xl border-x border-b border-border space-y-4">
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                        <div className="space-y-1.5">
                          {(test.features || []).map((feature: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                        <Button 
                          onClick={() => handleTestTypeSelect(test.key as any)}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                          {t.assessment.freeStartBtn}
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </section>

          {/* ========== 👑 프리미엄 전문검사 ========== */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 bg-primary rounded-full"></div>
              <h2 className="text-lg font-bold text-foreground">{t.assessment.premiumSection}</h2>
              <Badge className="bg-primary/20 text-primary text-[10px] border-0">
                <Crown className="w-3 h-3 mr-0.5" />
                {t.assessment.premiumBadge}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-4 ml-5">{t.assessment.premiumSectionDesc}</p>

            {/* 성격·심리 심층 */}
            <div className="space-y-2 mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground ml-1 flex items-center gap-2">
                <Brain className="w-4 h-4" /> {t.assessment.personalityPsychSection}
              </h3>
              {[
                { key: 'psychological', title: t.assessment.psychologicalTitle, duration: t.assessment.psychologicalDuration, questions: t.assessment.psychologicalQuestions, description: t.assessment.psychologicalDesc, features: t.assessment.psychologicalFeatures, gradient: 'from-indigo-600/20 to-blue-600/20', dotColor: 'bg-indigo-500' },
                { key: 'resilience', title: t.assessment.resilienceTitle, duration: t.assessment.resilienceDuration, questions: t.assessment.resilienceQuestions, badge: 'NEW', description: t.assessment.resilienceDesc, features: t.assessment.resilienceFeatures, gradient: 'from-emerald-600/20 to-green-600/20', dotColor: 'bg-emerald-500' },
                { key: 'attachment-deep', title: t.assessment.attachmentDeepTitle, duration: t.assessment.attachmentDeepDuration, questions: t.assessment.attachmentDeepQuestions, badge: 'NEW', description: t.assessment.attachmentDeepDesc, features: t.assessment.attachmentDeepFeatures, onClick: () => navigate('/assessment/attachment-style-test'), gradient: 'from-pink-600/20 to-rose-600/20', dotColor: 'bg-pink-500' },
                { key: 'bigfive', title: t.assessment.bigfiveTitle, duration: t.assessment.bigfiveDuration, questions: t.assessment.bigfiveQuestions, description: t.assessment.bigfiveDesc, features: t.assessment.bigfiveFeatures, onClick: () => setCurrentStep('bigfive-test'), gradient: 'from-cyan-600/20 to-sky-600/20', dotColor: 'bg-cyan-500' },
                { key: 'defense', title: t.assessment.defenseTitle, duration: t.assessment.defenseDuration, questions: t.assessment.defenseQuestions, badge: 'NEW', description: t.assessment.defenseDesc, features: t.assessment.defenseFeatures, onClick: () => navigate('/assessment/defense-mechanism-test'), gradient: 'from-slate-600/20 to-gray-600/20', dotColor: 'bg-slate-500' },
                { key: 'career', title: t.assessment.careerTitle, duration: t.assessment.careerDuration, questions: t.assessment.careerQuestions, description: t.assessment.careerDesc, features: t.assessment.careerFeatures, onClick: () => setCurrentStep('career-test'), gradient: 'from-amber-600/20 to-yellow-600/20', dotColor: 'bg-amber-500' },
              ].map((test) => {
                const isExpanded = expandedSimpleTest === test.key;
                return (
                  <Collapsible key={test.key} open={isExpanded} onOpenChange={() => setExpandedSimpleTest(isExpanded ? null : test.key)}>
                    <CollapsibleTrigger asChild>
                      <button className="w-full group text-left p-3 md:p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${test.gradient} flex items-center justify-center flex-shrink-0`}>
                              <div className={`w-2.5 h-2.5 rounded-full ${test.dotColor}`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 md:gap-2 mb-0.5">
                                <h3 className="font-semibold text-sm md:text-base text-foreground group-hover:text-primary truncate">{test.title}</h3>
                                {test.badge && (
                                  <Badge className="bg-primary text-primary-foreground text-[9px] px-1 py-0 flex-shrink-0">{test.badge}</Badge>
                                )}
                              </div>
                              <p className="text-[11px] md:text-xs text-muted-foreground truncate">{test.duration} · {test.questions}</p>
                            </div>
                          </div>
                          <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 text-muted-foreground transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mx-2 p-4 bg-muted/30 rounded-b-xl border-x border-b border-border space-y-4">
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                        <div className="space-y-1.5">
                          {(test.features || []).map((feature: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                        <Button 
                          onClick={test.onClick || (() => handleTestTypeSelect(test.key as any))}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          {t.assessment.startTest}
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>

            {/* 발달·아동 전문 */}
            <div className="space-y-2 mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground ml-1 flex items-center gap-2">
                <Heart className="w-4 h-4" /> {t.assessment.childDevSection}
              </h3>
              {[
                { key: 'developmental-delay', title: t.assessment.devDelayTitle, duration: t.assessment.devDelayDuration, questions: t.assessment.devDelayQuestions, description: t.assessment.devDelayDesc, features: t.assessment.devDelayFeatures, gradient: 'from-pink-500/20 to-rose-500/20', dotColor: 'bg-pink-500' },
                { key: 'language', title: t.assessment.infantLangTitle, duration: t.assessment.infantLangDuration, questions: t.assessment.infantLangQuestions, description: t.assessment.infantLangDesc, features: t.assessment.infantLangFeatures, gradient: 'from-sky-500/20 to-blue-500/20', dotColor: 'bg-sky-500' },
                { key: 'sensory-integration', title: t.assessment.sensoryTitle, duration: t.assessment.sensoryDuration, questions: t.assessment.sensoryQuestions, description: t.assessment.sensoryDesc, features: t.assessment.sensoryFeatures, gradient: 'from-fuchsia-500/20 to-purple-500/20', dotColor: 'bg-fuchsia-500' },
                { key: 'learning-disability', title: t.assessment.learningTitle, duration: t.assessment.learningDuration, questions: t.assessment.learningQuestions, description: t.assessment.learningDesc, features: t.assessment.learningFeatures, gradient: 'from-orange-500/20 to-amber-500/20', dotColor: 'bg-orange-500' },
                { key: 'social-development', title: t.assessment.socialTitle, duration: t.assessment.socialDuration, questions: t.assessment.socialQuestions, description: t.assessment.socialDesc, features: t.assessment.socialFeatures, gradient: 'from-teal-500/20 to-green-500/20', dotColor: 'bg-teal-500' },
                { key: 'challenging-behavior', title: t.assessment.challengingTitle, duration: t.assessment.challengingDuration, questions: t.assessment.challengingQuestions, description: t.assessment.challengingDesc, features: t.assessment.challengingFeatures, gradient: 'from-red-500/20 to-rose-500/20', dotColor: 'bg-red-500' },
                { key: 'adaptive-behavior', title: t.assessment.adaptiveTitle, duration: t.assessment.adaptiveDuration, questions: t.assessment.adaptiveQuestions, description: t.assessment.adaptiveDesc, features: t.assessment.adaptiveFeatures, gradient: 'from-lime-500/20 to-green-500/20', dotColor: 'bg-lime-500' },
                { key: 'parent-child-play', title: t.assessment.parentChildTitle, duration: t.assessment.parentChildDuration, questions: t.assessment.parentChildQuestions, description: t.assessment.parentChildDesc, features: t.assessment.parentChildFeatures, onClick: () => handleTestTypeSelect('parent-child-play'), gradient: 'from-violet-500/20 to-indigo-500/20', dotColor: 'bg-violet-500' },
              ].map((test) => {
                const isExpanded = expandedSimpleTest === test.key;
                return (
                  <Collapsible key={test.key} open={isExpanded} onOpenChange={() => setExpandedSimpleTest(isExpanded ? null : test.key)}>
                    <CollapsibleTrigger asChild>
                      <button className="w-full group text-left p-3 md:p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${test.gradient} flex items-center justify-center flex-shrink-0`}>
                              <div className={`w-2.5 h-2.5 rounded-full ${test.dotColor}`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 md:gap-2 mb-0.5">
                                <h3 className="font-semibold text-sm md:text-base text-foreground group-hover:text-primary truncate">{test.title}</h3>
                              </div>
                              <p className="text-[11px] md:text-xs text-muted-foreground truncate">{test.duration} · {test.questions}</p>
                            </div>
                          </div>
                          <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 text-muted-foreground transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mx-2 p-4 bg-muted/30 rounded-b-xl border-x border-b border-border space-y-4">
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                        <div className="space-y-1.5">
                          {(test.features || []).map((feature: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                        <Button 
                          onClick={test.onClick || (() => handleTestTypeSelect(test.key as any))}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          {t.assessment.startTest}
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>

            {/* 인지·기타 전문 */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground ml-1 flex items-center gap-2">
                <Zap className="w-4 h-4" /> {t.assessment.specializedSection}
              </h3>
              {[
                { key: 'pattern-iq', title: t.assessment.patternIQTitle, duration: t.assessment.patternIQDuration, questions: t.assessment.patternIQQuestions, badge: 'NEW', description: t.assessment.patternIQDesc, features: t.assessment.patternIQFeatures, onClick: () => navigate('/assessment/pattern-iq-test'), gradient: 'from-blue-500/20 to-indigo-500/20', dotColor: 'bg-blue-500' },
                { key: 'han-medicine', title: t.assessment.hanMedicineTitle, duration: t.assessment.hanMedicineDuration, questions: t.assessment.hanMedicineQuestions, description: t.assessment.hanMedicineDesc, features: t.assessment.hanMedicineFeatures, onClick: () => navigate('/han-medicine-test'), gradient: 'from-green-500/20 to-emerald-500/20', dotColor: 'bg-green-600' },
              ].map((test) => {
                const isExpanded = expandedSimpleTest === test.key;
                return (
                  <Collapsible key={test.key} open={isExpanded} onOpenChange={() => setExpandedSimpleTest(isExpanded ? null : test.key)}>
                    <CollapsibleTrigger asChild>
                      <button className="w-full group text-left p-3 md:p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${test.gradient} flex items-center justify-center flex-shrink-0`}>
                              <div className={`w-2.5 h-2.5 rounded-full ${test.dotColor}`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 md:gap-2 mb-0.5">
                                <h3 className="font-semibold text-sm md:text-base text-foreground group-hover:text-primary truncate">{test.title}</h3>
                                {test.badge && (
                                  <Badge className="bg-primary text-primary-foreground text-[9px] px-1 py-0 flex-shrink-0">{test.badge}</Badge>
                                )}
                              </div>
                              <p className="text-[11px] md:text-xs text-muted-foreground truncate">{test.duration} · {test.questions}</p>
                            </div>
                          </div>
                          <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 text-muted-foreground transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mx-2 p-4 bg-muted/30 rounded-b-xl border-x border-b border-border space-y-4">
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                        <div className="space-y-1.5">
                          {(test.features || []).map((feature: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                        <Button 
                          onClick={test.onClick}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          {t.assessment.startTest}
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </section>

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

  // 재미있는 AI 테스트들
  const handleFunTestComplete = (result: any, testType: string) => {
    navigate('/fun-test-result', { 
      state: { result, testType } 
    });
  };

  if (currentStep === 'past-life-job') {
    return <PastLifeJobTest onComplete={handleFunTestComplete} onBack={handleBack} />;
  }

  if (currentStep === 'animal-face-match') {
    return <AnimalFaceTest onComplete={handleFunTestComplete} onBack={handleBack} />;
  }

  // 삭제된 재미 검사 step handlers: inner-animal, grandma-relationship, grandpa-marriage, mz-nagging, wisdom-advice, otrovert, life-achievement

  if (currentStep === 'parent-child-play') {
    return <ParentChildPlayTest onComplete={handleFunTestComplete} onBack={handleBack} />;
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

  // 연령별 검사 선택 단계
  if (currentStep === 'test-selection') {
    const getRecommendedTests = () => {
      if (selectedAgeGroup === 'infant') {
        return [
          {
            id: 'language',
            title: t.assessment.testTitles.language,
            description: t.assessment.infantLangDesc,
            icon: '🗣️',
            items: [t.assessment.infantLangQuestions, t.assessment.infantLangDuration, t.assessment.infantLangFeatures[0]]
          },
          {
            id: 'selfesteem',
            title: t.assessment.emotionalDevTitle,
            description: t.assessment.emotionalArea1Desc,
            icon: '💝',
            items: [t.assessment.selfesteemQuestions, t.assessment.selfesteemDuration, t.assessment.selfesteemFeatures[0]]
          },
          {
            id: 'developmental-delay',
            title: t.assessment.devDelayTitle,
            description: t.assessment.devDelayDesc,
            icon: '🧠',
            items: t.assessment.devDelayFeatures
          }
        ];
      } else if (selectedAgeGroup === 'child') {
        return [
          {
            id: 'adhd',
            title: t.assessment.testTitles.adhd,
            description: t.assessment.adhdDesc,
            icon: '🎯',
            items: [t.assessment.adhdQuestions, t.assessment.adhdDuration, t.assessment.adhdFeatures[0]]
          },
          {
            id: 'depression',
            title: t.assessment.testTitles.depression,
            description: t.assessment.depressionDesc,
            icon: '😔',
            items: [t.assessment.depressionQuestions, t.assessment.depressionDuration, t.assessment.depressionFeatures[0]]
          },
          {
            id: 'panic',
            title: t.assessment.testTitles.panic,
            description: t.assessment.panicDesc,
            icon: '😰',
            items: [t.assessment.panicQuestions, t.assessment.panicDuration, t.assessment.panicFeatures[0]]
          },
          {
            id: 'social-development',
            title: t.assessment.socialTitle,
            description: t.assessment.socialDesc,
            icon: '👥',
            items: t.assessment.socialFeatures
          }
        ];
      } else {
        return [
          {
            id: 'depression',
            title: t.assessment.testTitles.depression,
            description: t.assessment.depressionDesc,
            icon: '😔',
            items: [t.assessment.depressionQuestions, t.assessment.depressionDuration, t.assessment.depressionFeatures[0]]
          },
          {
            id: 'panic',
            title: t.assessment.testTitles.panic,
            description: t.assessment.panicDesc,
            icon: '😰',
            items: [t.assessment.panicQuestions, t.assessment.panicDuration, t.assessment.panicFeatures[0]]
          },
          {
            id: 'stress',
            title: t.assessment.stressTitle,
            description: t.assessment.stressDesc,
            icon: '😫',
            items: [t.assessment.stressQuestions, t.assessment.stressDuration, t.assessment.stressFeatures[0]]
          },
          {
            id: 'adhd',
            title: t.assessment.testTitles.adhd,
            description: t.assessment.adhdDesc,
            icon: '🎯',
            items: [t.assessment.adhdQuestions, t.assessment.adhdDuration, t.assessment.adhdFeatures[0]]
          }
        ];
      }
    };

    const recommendedTests = getRecommendedTests();

    return (
      <div>
        <UnifiedNavigation />
        <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 relative overflow-hidden pt-4">
          <div className="relative z-10 container mx-auto px-6 pt-20 pb-16">
            <div className="text-center mb-12">
              <button
                onClick={handleBack}
                className="mb-6 text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
              >
                ← {t.common.back}
              </button>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="block text-foreground mb-2">{t.assessment.testSelectionTitle}</span>
                <span className="block text-brand-gradient text-2xl">
                  {selectedAgeGroup === 'infant' ? t.assessment.infantAgeGroup : 
                   selectedAgeGroup === 'child' ? t.assessment.childAgeGroup : 
                   t.assessment.adultAgeGroup} — {t.assessment.recommendedTests}
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t.assessment.testSelectionHint}
              </p>
            </div>

            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
              {recommendedTests.map((test) => (
                <div
                  key={test.id}
                  onClick={() => {
                    setTestType(test.id as any);
                    if (test.id === 'language') setCurrentStep('language-test');
                    else if (test.id === 'depression') setCurrentStep('depression-test');
                    else if (test.id === 'panic') setCurrentStep('panic-test');
                    else if (test.id === 'adhd') setCurrentStep('adhd-test');
                    else if (test.id === 'stress') setCurrentStep('stress-test');
                    else if (test.id === 'selfesteem') setCurrentStep('selfesteem-test');
                    else if (test.id === 'emotional-development') setCurrentStep('emotional-development-test');
                    else if (test.id === 'developmental-delay') setCurrentStep('developmental-delay-test');
                    else if (test.id === 'social-development') setCurrentStep('social-development-test');
                  }}
                  className="bg-white dark:bg-card hover-glow border-2 border-primary/20 rounded-2xl p-8 cursor-pointer transition-all hover:scale-105 hover:border-primary/40 relative group"
                >
                  <div className="absolute top-4 right-4 text-4xl opacity-20 group-hover:opacity-40 transition-opacity">
                    {test.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-brand-gradient mb-3">
                    {test.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {test.description}
                  </p>
                  <ul className="space-y-2 text-sm">
                    {test.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-primary">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground">
                 💡 {t.assessment.multiTestHint || 'Taking multiple tests enables more accurate analysis'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  if (currentStep === 'language-test') {
    return (
      <InfantLanguageTestForm 
        onComplete={handleLanguageTestComplete}
        onBack={handleBack}
      />
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
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-4">
              <span className="text-sm font-semibold text-primary">💜 {t.assessment.panicEvalTitle}</span>
            </div>
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">{t.assessment.panicTestTitle}</h1>
            <p className="text-muted-foreground mb-6">{t.assessment.panicTestSubtitle}</p>
            
            <div className="bg-white dark:bg-card rounded-xl p-6 max-w-2xl mx-auto mb-8">
              <h3 className="font-bold text-lg mb-4">{t.assessment.panicEvalTitle}</h3>
              <div className="space-y-2 text-left">
                <p className="text-sm text-muted-foreground font-semibold">{t.assessment.panicEvalAreas}</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{t.assessment.panicArea1}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{t.assessment.panicArea2}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{t.assessment.panicArea3}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{t.assessment.panicArea4}</span>
                  </li>
                </ul>
              </div>
            </div>
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
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">{t.assessment.depressionTestTitle}</h1>
            <p className="text-muted-foreground">{t.assessment.depressionTestSubtitle}</p>
          </div>
          <DepressionTestForm 
            ageGroup={selectedAgeGroup === 'infant' ? 'child' : selectedAgeGroup === 'child' ? 'adolescent' : 'adult'}
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
            onBack={() => setCurrentStep('depression-test')}
            onRestart={() => {
              setDepressionResults(null);
              setCurrentStep('depression-test');
            }}
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
            onBack={() => setCurrentStep('panic-test')}
            onRestart={() => {
              setPanicResults(null);
              setCurrentStep('panic-test');
            }}
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
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">{t.assessment.adhdTestTitle}</h1>
            <p className="text-muted-foreground">{t.assessment.adhdTestSubtitle}</p>
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
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">{t.assessment.stressTestTitle}</h1>
            <p className="text-muted-foreground">{t.assessment.stressTestSubtitle}</p>
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
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">{t.assessment.bigfiveTestTitle}</h1>
            <p className="text-muted-foreground">{t.assessment.bigfiveTestSubtitle}</p>
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
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">{t.assessment.attachmentTestTitle}</h1>
            <p className="text-muted-foreground">{t.assessment.attachmentTestSubtitle}</p>
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
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">{t.assessment.careerTestTitle}</h1>
            <p className="text-muted-foreground">{t.assessment.careerTestSubtitle}</p>
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
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">{t.assessment.selfesteemTestTitle}</h1>
            <p className="text-muted-foreground">{t.assessment.selfesteemTestSubtitle}</p>
          </div>
          <SelfEsteemTestForm 
            onComplete={handleSelfesteemTestComplete}
            onBack={handleBack}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'emotional-development-test') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">{t.assessment.emotionalDevTitle}</h1>
            <p className="text-muted-foreground">{t.assessment.emotionalDevSubtitle}</p>
          </div>
          <div className="bg-white dark:bg-card rounded-2xl p-8 shadow-lg border">
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 px-4 py-2 rounded-full mb-4">
                  <span className="text-2xl">💖</span>
                  <span className="font-semibold">{t.assessment.emotionalDevSection}</span>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl border border-rose-200 dark:border-rose-800">
                   <h3 className="font-semibold mb-2 flex items-center gap-2">
                     <span>😊</span> {t.assessment.emotionalArea1Title}
                   </h3>
                   <p className="text-sm text-muted-foreground">{t.assessment.emotionalArea1Desc}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                   <h3 className="font-semibold mb-2 flex items-center gap-2">
                     <span>🤝</span> {t.assessment.emotionalArea2Title}
                   </h3>
                   <p className="text-sm text-muted-foreground">{t.assessment.emotionalArea2Desc}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                   <h3 className="font-semibold mb-2 flex items-center gap-2">
                     <span>🎭</span> {t.assessment.emotionalArea3Title}
                   </h3>
                   <p className="text-sm text-muted-foreground">{t.assessment.emotionalArea3Desc}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                   <h3 className="font-semibold mb-2 flex items-center gap-2">
                     <span>💝</span> {t.assessment.emotionalArea4Title}
                   </h3>
                   <p className="text-sm text-muted-foreground">{t.assessment.emotionalArea4Desc}</p>
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                 <p className="text-sm text-muted-foreground">
                   <strong className="text-foreground">💡</strong> {t.assessment.emotionalDevNotice}
                 </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1"
                >
                  ← {t.common.back}
                </Button>
                <Button 
                  onClick={() => {
                    // 정서발달 검사 시작 - 자존감 검사 재사용
                    setCurrentStep('selfesteem-test');
                  }}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                >
                  {t.assessment.startTest} →
                </Button>
              </div>
            </div>
          </div>
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

  // 도전행동 및 적응행동 검사 렌더링
  if (currentStep === 'challenging-behavior-test') {
    return <ChallengingBehaviorForm onComplete={(results) => {
      setChallengingBehaviorResults(results);
      saveTestToTimeline('challenging-behavior', results);
      setCurrentStep('challenging-behavior-result');
    }} onBack={handleBack} />;
  }

  if (currentStep === 'adaptive-behavior-test') {
    return <AdaptiveBehaviorForm onComplete={(results) => {
      setAdaptiveBehaviorResults(results);
      saveTestToTimeline('adaptive-behavior', results);
      setCurrentStep('adaptive-behavior-result');
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

  // 도전행동 및 적응행동 결과 렌더링
  if (currentStep === 'challenging-behavior-result' && challengingBehaviorResults) {
    return <ChallengingBehaviorResult results={challengingBehaviorResults} />;
  }

  if (currentStep === 'adaptive-behavior-result' && adaptiveBehaviorResults) {
    return <AdaptiveBehaviorResult results={adaptiveBehaviorResults} />;
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
        <div className="container mx-auto max-w-6xl px-4 mb-6">
          <BetaBanner />
        </div>
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
        
        {/* Legal Disclaimer */}
        <div className="container mx-auto max-w-6xl px-4 py-8 mt-12">
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
            <h3 className="font-bold text-lg text-yellow-900 mb-4 flex items-center gap-2">
              <span>⚠️</span> {t.assessment.legalTitle}
            </h3>
            <div className="space-y-3 text-sm text-yellow-900">
              <p className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{t.assessment.legal1}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{t.assessment.legal2}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{t.assessment.legal3}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{t.assessment.legal4}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessment;