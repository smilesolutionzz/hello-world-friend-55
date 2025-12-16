import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { BetaBanner } from "@/components/BetaBanner";
import { MedicalDisclaimer } from "@/components/legal/MedicalDisclaimer";
import { useEventTracking } from "@/hooks/useEventTracking";
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
import InnerAnimalTest from "@/components/assessment/InnerAnimalTest";
import GrandmaRelationshipTest from "@/components/assessment/GrandmaRelationshipTest";
import GrandpaMarriageDiagnosis from "@/components/assessment/GrandpaMarriageDiagnosis";
import MZNaggingTest from "@/components/assessment/MZNaggingTest";
import WisdomAdviceTest from "@/components/assessment/WisdomAdviceTest";
import OtrovertTest from "@/components/assessment/OtrovertTest";
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
import { Sparkles, Crown, Camera, Heart, Zap, Brain, Target, MessageCircle, Coins } from "lucide-react";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";

const Assessment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { trackTestStart, trackTestComplete, trackPageView } = useEventTracking();
  
  // URL 파라미터에서 테스트 타입 확인
  const urlTestType = searchParams.get('type');
  const urlTest = searchParams.get('test');
  
  const [currentStep, setCurrentStep] = useState<'test-type' | 'legal-notice' | 'age-select' | 'test-selection' | 'assessment' | 'language-test' | 'panic-test' | 'depression-test' | 'adhd-test' | 'stress-test' | 'bigfive-test' | 'attachment-test' | 'career-test' | 'selfesteem-test' | 'emotional-development-test' | 'dream-interpretation' | 'saju-analysis' | 'past-life-job' | 'animal-face-match' | 'inner-animal' | 'grandma-relationship' | 'grandpa-marriage' | 'mz-nagging' | 'wisdom-advice' | 'otrovert' | 'life-achievement' | 'parent-child-play' | 'analysis' | 'matching' | 'consultation' | 'language-result' | 'panic-result' | 'depression-result' | 'adhd-result' | 'stress-result' | 'bigfive-result' | 'attachment-result' | 'career-result' | 'selfesteem-result' | 'child-result' | 'infant-result' | 'adult-result' | 'ai-chat' | 'realtime-chat' | 'developmental-delay-test' | 'sensory-integration-test' | 'learning-disability-test' | 'social-development-test' | 'developmental-delay-result' | 'sensory-integration-result' | 'learning-disability-result' | 'social-development-result' | 'challenging-behavior-test' | 'challenging-behavior-result' | 'adaptive-behavior-test' | 'adaptive-behavior-result'>('test-type');
  const [testType, setTestType] = useState<'psychological' | 'language' | 'panic' | 'depression' | 'adhd' | 'stress' | 'bigfive' | 'attachment' | 'career' | 'selfesteem' | 'dream' | 'saju' | 'developmental-delay' | 'sensory-integration' | 'learning-disability' | 'social-development' | 'challenging-behavior' | 'adaptive-behavior' | 'parent-child-play' | null>(null);
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
      case 'challenging-behavior': return '도전행동 평가';
      case 'adaptive-behavior': return '적응행동 평가';
      default: return '심리상태 체크';
    }
  };

  const handleTestTypeSelect = async (type: 'psychological' | 'language' | 'panic' | 'depression' | 'adhd' | 'stress' | 'bigfive' | 'attachment' | 'career' | 'selfesteem' | 'dream' | 'saju' | 'developmental-delay' | 'sensory-integration' | 'learning-disability' | 'social-development' | 'challenging-behavior' | 'adaptive-behavior' | 'parent-child-play') => {
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
    } else if (type === 'language') {
      setCurrentStep('language-test');
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
    
    // "마음상태 체크"인 경우 검사 선택 단계로 이동
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
    if (currentStep === 'depression-result' || currentStep === 'panic-result' || currentStep === 'adhd-result' || currentStep === 'stress-result' || currentStep === 'bigfive-result' || currentStep === 'attachment-result' || currentStep === 'career-result') {
      setCurrentStep('test-type');
    } else if (currentStep === 'test-selection') {
      // 검사 선택 단계에서 뒤로가기 -> 연령 선택으로
      setCurrentStep('age-select');
    } else if (currentStep === 'dream-interpretation' || currentStep === 'saju-analysis' || currentStep === 'analysis' || currentStep === 'matching' || currentStep === 'consultation' || currentStep === 'language-result' || currentStep === 'child-result' || currentStep === 'infant-result' || currentStep === 'adult-result' || currentStep === 'ai-chat' || currentStep === 'realtime-chat') {
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-100 to-pink-100 relative overflow-hidden pt-4">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating Gradient Orbs */}
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/40 to-purple-500/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-gradient-to-bl from-purple-400/40 to-pink-500/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
          <div className="absolute -bottom-32 left-1/4 w-[450px] h-[450px] bg-gradient-to-tr from-pink-400/40 to-orange-400/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
          
          {/* Moving Light Rays */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          
          {/* Decorative Circles */}
          <div className="absolute top-40 left-1/2 w-64 h-64 border-2 border-purple-300/30 rounded-full"></div>
          <div className="absolute bottom-40 right-1/3 w-80 h-80 border-2 border-blue-300/30 rounded-full"></div>
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(99, 102, 241, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(99, 102, 241, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}></div>
          
          {/* Dot Pattern */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6 pt-20 pb-16">
          {/* 캐시 이용 안내 배너 */}
          <Card className="mb-12 border-2 border-primary/30 bg-gradient-to-r from-primary/5 via-primary-glow/5 to-primary/5">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl font-bold text-brand-gradient mb-4">
                💎 이용 요금 안내
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                <div className="text-center p-6 bg-white dark:bg-card rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-3">🆓</div>
                  <h3 className="text-xl font-bold mb-2">재미있는 AI 검사</h3>
                  <p className="text-sm text-muted-foreground mb-3">무료로 무제한</p>
                  <ul className="text-sm space-y-1">
                    <li>• 꿈해석</li>
                    <li>• 사주분석</li>
                    <li>• 위기감지 등</li>
                  </ul>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-emerald-200 dark:border-emerald-800">
                  <div className="text-4xl mb-3">⭐</div>
                  <h3 className="text-xl font-bold mb-2">AIH 전문가 창작</h3>
                  <div className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-full font-bold text-lg mb-3">
                    500원
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• 5D 성격분석</li>
                    <li>• 관계유형 진단</li>
                    <li>• 스트레스 측정 등</li>
                  </ul>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-blue-200 dark:border-blue-800">
                  <div className="text-4xl mb-3">⚡</div>
                  <h3 className="text-xl font-bold mb-2">전문 심리·발달검사</h3>
                  <div className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-lg mb-3">
                    500원
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• 마음상태 체크</li>
                    <li>• 우울/불안 체크</li>
                    <li>• 아동·청소년 발달검사</li>
                  </ul>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-purple-200 dark:border-purple-800">
                  <div className="text-4xl mb-3">👑</div>
                  <h3 className="text-xl font-bold mb-2">심층테스트</h3>
                  <div className="inline-flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-full font-bold text-lg mb-3">
                    2,000원
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• 관찰일지 분석</li>
                    <li>• 전문가 리포트</li>
                    <li>• 프리미엄 종합테스트</li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center pt-4">
                <Button 
                  onClick={() => navigate('/token-subscription')}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  <Coins className="w-5 h-5 mr-2" />
                  캐시 충전하기
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mb-16 space-y-6">
            <h1 className="text-5xl md:text-7xl font-display font-black leading-tight text-gray-900 tracking-tight">
              <span className="block mb-3 animate-fade-in">3분으로 시작하는</span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm animate-scale-in">
                마음상태 체크
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-medium leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              어떤 체크를 받고 싶으신가요?<br />
              <span className="text-lg text-gray-600">(테스트 결과는 진단이 아닌 참고용입니다)</span>
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
                      <Badge className="bg-blue-500 text-white text-xs px-2 py-1 opacity-80">500원</Badge>
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
                      <Badge className="bg-blue-500 text-white text-xs px-2 py-1 opacity-80">500원</Badge>
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
                      <Badge className="bg-blue-500 text-white text-xs px-2 py-1 opacity-80">500원</Badge>
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
                      <Badge className="bg-blue-500 text-white text-xs px-2 py-1 opacity-80">500원</Badge>
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
                      <Badge className="bg-blue-500 text-white text-xs px-2 py-1 opacity-80">500원</Badge>
                    </div>
                     <h3 className="text-xl font-bold text-brand-gradient mb-3">정서발달 체크</h3>
                     <p className="text-muted-foreground mb-3 text-sm">영유아·아동·성인 연령별 정서 및 감정발달 확인 (참고용)</p>
                     <ul className="space-y-1 text-sm">
                       <li>• 연령대별 15문항</li>
                       <li>• 정서발달 상태 확인</li>
                       <li>• 감정표현 능력 평가</li>
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
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-600 text-white text-xs px-2 py-1 opacity-80">500원</Badge>
                    </div>
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
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-600 text-white text-xs px-2 py-1 opacity-80">500원</Badge>
                    </div>
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
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-600 text-white text-xs px-2 py-1 opacity-80">500원</Badge>
                    </div>
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
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-600 text-white text-xs px-2 py-1 opacity-80">500원</Badge>
                    </div>
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
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-600 text-white text-xs px-2 py-1 opacity-80">500원</Badge>
                    </div>
                    <h4 className="text-lg font-bold text-brand-gradient mb-3">사회성 발달 검사</h4>
                    <p className="text-muted-foreground text-sm mb-3">사회적 상호작용 및 적응 평가</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 사회적 기술</li>
                      <li>• 대인관계 능력</li>
                      <li>• 적응행동 평가</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-white dark:bg-card hover-glow border border-red-300 dark:border-red-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative shadow-md"
                    onClick={() => handleTestTypeSelect('challenging-behavior')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-red-600 text-white text-xs px-2 py-1 opacity-80">무료</Badge>
                    </div>
                    <h4 className="text-lg font-bold text-brand-gradient mb-3">도전행동 평가</h4>
                    <p className="text-muted-foreground text-sm mb-3">발달장애인 문제행동 평가</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 자해/공격행동</li>
                      <li>• 상동/파괴행동</li>
                      <li>• 행동 심각도 평가</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-white dark:bg-card hover-glow border border-blue-300 dark:border-blue-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative shadow-md"
                    onClick={() => handleTestTypeSelect('adaptive-behavior')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-blue-600 text-white text-xs px-2 py-1 opacity-80">무료</Badge>
                    </div>
                    <h4 className="text-lg font-bold text-brand-gradient mb-3">적응행동 평가</h4>
                    <p className="text-muted-foreground text-sm mb-3">일상생활 독립성 평가</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 일상생활 기술</li>
                      <li>• 사회적 기술</li>
                      <li>• 의사소통 능력</li>
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
                  <p className="text-muted-foreground flex items-center justify-center gap-2">
                    <span>발달 심리전문가가 직접 개발한 신뢰도 높은 창작 검사</span>
                    <Badge className="bg-emerald-500 text-white font-semibold">500원</Badge>
                  </p>
                </div>
                
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {/* 🔥 TOP 인기 3분 테스트 1위 */}
                  {/* 애착 유형 심층 분석 - 새로운 검사 */}
                  <div 
                    className="bg-white dark:bg-card hover-glow border-2 border-purple-300 dark:border-purple-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative shadow-lg"
                    onClick={() => navigate('/assessment/attachment-style-test')}
                  >
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-xs px-2 py-1 animate-pulse">
                        ✨ NEW
                      </Badge>
                      <Badge className="bg-purple-500 text-white text-xs px-2 py-1">프리미엄</Badge>
                    </div>
                    <div className="mb-3">
                      <span className="text-3xl">💞</span>
                    </div>
                    <h4 className="text-lg font-bold text-brand-gradient mb-2">애착 유형 심층 분석</h4>
                    <p className="text-muted-foreground text-sm mb-3">AI 전문가 분석 + 그래프</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 30문항 심층 분석</li>
                      <li>• OpenAI 전문가 해석</li>
                      <li>• 레이더/바 차트 시각화</li>
                      <li>• 4가지 애착 유형 분석</li>
                    </ul>
                  </div>

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

                  {/* 🆕 NEW 방어기제 테스트 */}
                  <div 
                    className="bg-white dark:bg-card hover-glow border-2 border-purple-400 dark:border-purple-600 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative shadow-xl"
                    onClick={() => navigate('/assessment/defense-mechanism-test')}
                  >
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs px-2 py-1 animate-pulse">
                        🆕 NEW
                      </Badge>
                    </div>
                    <h4 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                      방어기제 분석
                    </h4>
                    <p className="text-muted-foreground text-sm mb-3">무의식적 심리 패턴 발견</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 24문항 5분</li>
                      <li>• 8가지 방어기제</li>
                      <li>• 심층 AI 분석</li>
                    </ul>
                  </div>

                  {/* 부모아동 놀이평가 */}
                  <div 
                    className="bg-white dark:bg-card hover-glow border border-blue-300 dark:border-blue-700 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative shadow-md"
                    onClick={() => handleTestTypeSelect('parent-child-play')}
                  >
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-blue-500 text-white font-bold text-xs px-2 py-1">
                        👶 아동
                      </Badge>
                    </div>
                    <h4 className="text-lg font-bold text-brand-gradient mb-3">부모아동 놀이성향</h4>
                    <p className="text-muted-foreground text-sm mb-3">놀이 상호작용 스타일 체크</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 8문항 3분</li>
                      <li>• 4가지 놀이 스타일</li>
                      <li>• 맞춤 양육 조언</li>
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
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-bold">무료</Badge>
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
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-bold">무료</Badge>
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
                    onClick={() => setCurrentStep('past-life-job')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-bold">무료</Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-3">👑 내 전생은 어떤 직업?</h3>
                    <p className="text-purple-100 mb-3 text-sm">AI가 분석하는 나의 전생 직업과 운명!</p>
                    <ul className="space-y-1 text-sm text-purple-100">
                      <li>• 질문 기반 분석</li>
                      <li>• AI 즉시 해석</li>
                      <li>• 신비로운 결과</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-gradient-to-br from-orange-500 to-yellow-600 hover-glow border border-orange-300 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 text-white relative"
                    onClick={() => setCurrentStep('animal-face-match')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-bold">무료</Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-3">📸 내 얼굴 닮은 동물 찾기</h3>
                    <p className="text-orange-100 mb-3 text-sm">카메라로 얼굴을 찍으면 AI가 닮은 동물을 찾아줘!</p>
                    <ul className="space-y-1 text-sm text-orange-100">
                      <li>• 사진 업로드</li>
                      <li>• AI 즉시 분석</li>
                      <li>• 친구들과 비교</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-gradient-to-br from-green-500 to-blue-600 hover-glow border border-green-300 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 text-white relative"
                    onClick={() => setCurrentStep('inner-animal')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-bold">무료</Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-3">💚 나의 내면 동물 찾기</h3>
                    <p className="text-green-100 mb-3 text-sm">깊은 심리 분석으로 알아보는 나의 진짜 성격!</p>
                    <ul className="space-y-1 text-sm text-green-100">
                      <li>• 심리 분석</li>
                      <li>• AI 성격 진단</li>
                      <li>• 성격 탐구</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-gradient-to-br from-red-500 to-orange-600 hover-glow border border-red-300 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 text-white relative"
                    onClick={() => setCurrentStep('grandma-relationship')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-bold">무료</Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-3">👵 욕쟁이 할머니의 연애 진단</h3>
                    <p className="text-red-100 mb-3 text-sm">할머니가 직설적으로 당신들의 연애를 진단!</p>
                    <ul className="space-y-1 text-sm text-red-100">
                      <li>• 연애 고민 입력</li>
                      <li>• 할머니 독설</li>
                      <li>• 촌철살인 조언</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-gradient-to-br from-blue-500 to-indigo-600 hover-glow border border-blue-300 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 text-white relative"
                    onClick={() => setCurrentStep('grandpa-marriage')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-bold">무료</Badge>
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
                    onClick={() => setCurrentStep('mz-nagging')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-bold">무료</Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-3">🍲 국밥집 이모의 MZ잔소리</h3>
                    <p className="text-orange-100 mb-3 text-sm">이모가 요즘 애들 걱정해서 해주는 따뜻하고 현실적인 잔소리!</p>
                    <ul className="space-y-1 text-sm text-orange-100">
                      <li>• MZ 고민 입력</li>
                      <li>• 현실적인 조언</li>
                      <li>• 이모의 따뜻한 걱정</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-gradient-to-br from-amber-500 to-yellow-600 hover-glow border border-amber-300 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 text-white relative"
                    onClick={() => navigate('/joseon-name-test')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-bold">무료</Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-3">🏯 조선시대 내 이름은?</h3>
                    <p className="text-amber-100 mb-3 text-sm">태어난 월일로 알아보는 조선시대 나의 이름!</p>
                    <ul className="space-y-1 text-sm text-amber-100">
                      <li>• 생년월일 입력</li>
                      <li>• 조선시대 이름</li>
                      <li>• 친구와 비교</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-gradient-to-br from-emerald-500 to-green-600 hover-glow border border-emerald-300 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 text-white relative"
                    onClick={() => navigate('/joseon-job-test')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-bold">무료</Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-3">⚔️ 조선시대 내 직업은?</h3>
                    <p className="text-emerald-100 mb-3 text-sm">성격 테스트로 알아보는 조선시대 나의 직업!</p>
                    <ul className="space-y-1 text-sm text-emerald-100">
                      <li>• 성격 분석</li>
                      <li>• 조선시대 직업</li>
                      <li>• 상세한 설명</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-gradient-to-br from-purple-500 to-violet-600 hover-glow border border-purple-300 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 text-white relative"
                    onClick={() => navigate('/joseon-status-test')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-bold">무료</Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-3">👑 조선시대 내 신분은?</h3>
                    <p className="text-purple-100 mb-3 text-sm">라이프스타일로 알아보는 조선시대 나의 신분!</p>
                    <ul className="space-y-1 text-sm text-purple-100">
                      <li>• 생활 패턴 분석</li>
                      <li>• 신분 예측</li>
                      <li>• 신분상승 가능성</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-gradient-to-br from-amber-500 to-orange-600 hover-glow border border-amber-300 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 text-white relative"
                    onClick={() => setCurrentStep('wisdom-advice')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-bold">무료</Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-3">🌟 인생 지혜 조언</h3>
                    <p className="text-amber-100 mb-3 text-sm">AI가 당신에게 맞는 특별한 인생 조언을 드립니다!</p>
                    <ul className="space-y-1 text-sm text-amber-100">
                      <li>• 경험 기반 질문</li>
                      <li>• 맞춤 조언</li>
                      <li>• 삶의 지혜</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-gradient-to-br from-indigo-500 to-blue-600 hover-glow border border-indigo-300 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 text-white relative"
                    onClick={() => setCurrentStep('otrovert')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-bold">무료</Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-3">🎭 오트로버트 테스트</h3>
                    <p className="text-indigo-100 mb-3 text-sm">내향/외향도 아닌 나만의 독특한 성격 유형 발견!</p>
                    <ul className="space-y-1 text-sm text-indigo-100">
                      <li>• 심층 성격 분석</li>
                      <li>• 독특한 유형</li>
                      <li>• 그래프 시각화</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-gradient-to-br from-purple-500 to-pink-600 hover-glow border border-purple-300 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 text-white relative"
                    onClick={() => setCurrentStep('life-achievement')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-bold">무료</Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-3">🏆 인생 업적 달성률</h3>
                    <p className="text-purple-100 mb-3 text-sm">게임처럼 체크하는 나의 인생 목표 달성도!</p>
                    <ul className="space-y-1 text-sm text-purple-100">
                      <li>• 6가지 영역</li>
                      <li>• 달성률 분석</li>
                      <li>• 다음 목표 제안</li>
                    </ul>
                  </div>

                  <div 
                    className="bg-gradient-to-br from-emerald-500 to-teal-600 hover-glow border border-emerald-300 rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 text-white relative"
                    onClick={() => navigate('/han-medicine-test')}
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-bold">무료</Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-3">🌿 한의학 체질분석</h3>
                    <p className="text-emerald-100 mb-3 text-sm">한의학 기반으로 알아보는 나의 체질과 건강!</p>
                    <ul className="space-y-1 text-sm text-emerald-100">
                      <li>• 체질 진단</li>
                      <li>• 맞춤 건강 조언</li>
                      <li>• 한방 솔루션</li>
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

  if (currentStep === 'inner-animal') {
    return <InnerAnimalTest onComplete={handleFunTestComplete} onBack={handleBack} />;
  }

  if (currentStep === 'grandma-relationship') {
    return <GrandmaRelationshipTest onComplete={handleFunTestComplete} onBack={handleBack} />;
  }

  if (currentStep === 'grandpa-marriage') {
    return <GrandpaMarriageDiagnosis onComplete={handleFunTestComplete} onBack={handleBack} />;
  }

  if (currentStep === 'mz-nagging') {
    return <MZNaggingTest onComplete={handleFunTestComplete} onBack={handleBack} />;
  }

  if (currentStep === 'wisdom-advice') {
    return <WisdomAdviceTest onComplete={handleFunTestComplete} onBack={handleBack} />;
  }

  if (currentStep === 'otrovert') {
    return <OtrovertTest onComplete={handleFunTestComplete} onBack={handleBack} />;
  }

  if (currentStep === 'life-achievement') {
    return <LifeAchievementTest onComplete={handleFunTestComplete} onBack={handleBack} />;
  }

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
            title: '언어발달 체크',
            description: '표현어휘와 의사소통 발달 확인',
            icon: '🗣️',
            items: ['20문항', '2분 소요', '발달단계 분석']
          },
          {
            id: 'selfesteem',
            title: '정서발달 체크',
            description: '자존감 및 정서적 안정성 확인',
            icon: '💝',
            items: ['15문항', '3분 소요', '정서상태 분석']
          },
          {
            id: 'developmental-delay',
            title: '발달지연 체크',
            description: '전반적 발달 상태 선별',
            icon: '🧠',
            items: ['전문 검사', '발달 기준', '조기 선별']
          }
        ];
      } else if (selectedAgeGroup === 'child') {
        return [
          {
            id: 'adhd',
            title: 'ADHD 검사',
            description: 'ADHD 증상 자가체크',
            icon: '🎯',
            items: ['18문항', '3분 소요', '영역별 분석']
          },
          {
            id: 'depression',
            title: '우울 검사',
            description: '우울감 수준 확인',
            icon: '😔',
            items: ['21문항', '3분 소요', '심리상태 분석']
          },
          {
            id: 'panic',
            title: '불안 검사',
            description: '불안 증상 수준 확인',
            icon: '😰',
            items: ['21문항', '3분 소요', '불안도 측정']
          },
          {
            id: 'social-development',
            title: '사회성 발달 체크',
            description: '사회적 상호작용 평가',
            icon: '👥',
            items: ['전문 검사', '대인관계', '적응행동']
          }
        ];
      } else {
        return [
          {
            id: 'depression',
            title: '우울 검사',
            description: '우울감 수준 자가체크',
            icon: '😔',
            items: ['21문항', '3분 소요', '심리상태 분석']
          },
          {
            id: 'panic',
            title: '불안 검사',
            description: '불안 증상 수준 확인',
            icon: '😰',
            items: ['21문항', '3분 소요', '불안도 측정']
          },
          {
            id: 'stress',
            title: '스트레스 검사',
            description: '일상 스트레스 수준 측정',
            icon: '😫',
            items: ['12문항', '3분 소요', '스트레스 분석']
          },
          {
            id: 'adhd',
            title: 'ADHD 검사',
            description: 'ADHD 증상 자가체크',
            icon: '🎯',
            items: ['18문항', '3분 소요', '영역별 분석']
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
                ← 뒤로 가기
              </button>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="block text-foreground mb-2">어떤 검사를 받고 싶으신가요?</span>
                <span className="block text-brand-gradient text-2xl">
                  {selectedAgeGroup === 'infant' ? '영유아 (0-5세)' : 
                   selectedAgeGroup === 'child' ? '아동·청소년 (6-18세)' : 
                   '성인 (19-64세)'} 추천 검사
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                연령대에 맞는 심리 검사를 선택해주세요 (참고용)
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
                💡 여러 검사를 받으시면 더 정확한 분석이 가능합니다
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
              <span className="text-sm font-semibold text-primary">💜 전문 선별 평가 시스템</span>
            </div>
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">불안감 수준 확인 자가체크 (참고용)</h1>
            <p className="text-muted-foreground mb-6">불안감 증상 자가체크 (참고용)</p>
            
            <div className="bg-white dark:bg-card rounded-xl p-6 max-w-2xl mx-auto mb-8">
              <h3 className="font-bold text-lg mb-4">불안 검사</h3>
              <div className="space-y-2 text-left">
                <p className="text-sm text-muted-foreground font-semibold">평가 영역:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>불안 증상</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>심리적 불안</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>신체적 긴장</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>회피 행동</span>
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

  if (currentStep === 'emotional-development-test') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">영유아 정서발달 체크</h1>
            <p className="text-muted-foreground">정서 및 감정발달 확인 15문항 (참고용)</p>
          </div>
          <div className="bg-white dark:bg-card rounded-2xl p-8 shadow-lg border">
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 px-4 py-2 rounded-full mb-4">
                  <span className="text-2xl">💖</span>
                  <span className="font-semibold">정서발달 평가 영역</span>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl border border-rose-200 dark:border-rose-800">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span>😊</span> 감정 인식 및 표현
                  </h3>
                  <p className="text-sm text-muted-foreground">기쁨, 슬픔, 화남 등 기본 감정의 인식과 표현 능력</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span>🤝</span> 애착 및 관계형성
                  </h3>
                  <p className="text-sm text-muted-foreground">주 양육자와의 애착, 타인과의 관계 형성 능력</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span>🎭</span> 감정 조절
                  </h3>
                  <p className="text-sm text-muted-foreground">부정적 감정의 조절 및 자기진정 능력</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span>💝</span> 공감 능력
                  </h3>
                  <p className="text-sm text-muted-foreground">타인의 감정을 이해하고 반응하는 능력</p>
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">💡 안내:</strong> 이 검사는 영유아의 정서발달 상태를 참고용으로 확인하는 도구입니다. 
                  전문적인 진단이 필요한 경우 전문가와 상담하시기 바랍니다.
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1"
                >
                  ← 뒤로가기
                </Button>
                <Button 
                  onClick={() => {
                    // 정서발달 검사 시작 - 자존감 검사 재사용
                    setCurrentStep('selfesteem-test');
                  }}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                >
                  검사 시작하기 →
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
        
        {/* 법적 고지사항 */}
        <div className="container mx-auto max-w-6xl px-4 py-8 mt-12">
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
            <h3 className="font-bold text-lg text-yellow-900 mb-4 flex items-center gap-2">
              <span>⚠️</span> 법적 고지사항
            </h3>
            <div className="space-y-3 text-sm text-yellow-900">
              <p className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>본 서비스는 의료행위가 아니며, 질병의 진단, 치료, 예방을 목적으로 하지 않습니다.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>제공되는 모든 정보는 참고용이며, 전문적인 의학적 조언을 대체할 수 없습니다.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>의료 관련 의사결정은 반드시 의료기관 및 전문의와 상담 후 진행하시기 바랍니다.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>본 서비스 이용으로 인한 어떠한 결과에 대해서도 법적 책임을 지지 않습니다.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessment;