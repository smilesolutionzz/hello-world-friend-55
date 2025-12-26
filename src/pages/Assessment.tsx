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
import { Sparkles, Crown, Camera, Heart, Zap, Brain, Target, MessageCircle, Coins, ChevronDown, CheckCircle } from "lucide-react";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
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
  const [expandedSimpleTest, setExpandedSimpleTest] = useState<string | null>(null);

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
          {/* 베타 기간 무료 안내 배너 */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20">
                <Sparkles className="w-4 h-4 text-green-500" />
              </span>
              <div className="text-left">
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  🎁 2026년 새해 선물
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  소중한 골든타임을 위해<br className="sm:hidden" />
                  <span className="hidden sm:inline"> </span>3개월간 모든 검사 무료
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              간편테스트
            </h1>
            <p className="text-muted-foreground">
              부담 없이 시작하는 첫 걸음 · AI가 빠르게 분석해드려요
            </p>
          </div>

          {/* ========== 이번 달 신규 검사 배너 ========== */}
          <section className="mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 p-4 md:p-6">
              <div className="absolute inset-0 opacity-20" style={{backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px"}}></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span className="text-xs font-bold text-white/90 bg-white/20 px-2 py-0.5 rounded-full">2025년 1월 신규</span>
                </div>
                <h2 className="text-lg md:text-xl font-bold text-white mb-3">새로 추가된 검사</h2>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => navigate('/assessment/attachment-style-test')}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-2 rounded-lg transition-all"
                  >
                    <span className="text-lg">💜</span>
                    <span className="text-sm font-medium text-white">애착 유형 심층분석</span>
                    <Badge className="bg-yellow-400 text-yellow-900 text-[10px]">NEW</Badge>
                  </button>
                  <button 
                    onClick={() => navigate('/assessment/defense-mechanism-test')}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-2 rounded-lg transition-all"
                  >
                    <span className="text-lg">🛡️</span>
                    <span className="text-sm font-medium text-white">방어기제 분석</span>
                    <Badge className="bg-yellow-400 text-yellow-900 text-[10px]">NEW</Badge>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ========== 전문 심리검사 ========== */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-6 bg-primary rounded-full"></div>
              <h2 className="text-lg font-bold text-foreground">전문 심리검사</h2>
              <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded font-medium">베타 무료</span>
            </div>

            <div className="space-y-2">
              {[
                { key: 'psychological', icon: '🧠', title: '마음상태 체크', duration: '약 5-10분', questions: '연령별 맞춤', description: '연령대에 따라 맞춤형 심리상태를 종합적으로 점검합니다.', features: ['영유아/아동/성인 연령별 맞춤', '발달단계별 특화 문항', 'AI 기반 심리상태 분석'] },
                { key: 'panic', icon: '😰', title: '불안감 수준 확인', duration: '약 5분', questions: '21문항', description: '일상에서 느끼는 불안 증상과 그 정도를 체계적으로 측정합니다.', features: ['불안장애 선별 문항', '신체적/심리적 증상 분석', '위험도 수준 평가'] },
                { key: 'depression', icon: '😔', title: '우울감 자가체크', duration: '약 5분', questions: '21문항', description: '우울감의 깊이와 일상 영향도를 정밀 측정합니다.', features: ['우울증 선별 기준', '인지/정서/행동 증상 분석', '전문가 상담 권고 기준'] },
                { key: 'adhd', icon: '🎯', title: '주의집중력 자가체크', duration: '약 3분', questions: '18문항', description: 'ADHD 관련 증상의 유무와 정도를 빠르게 확인합니다.', features: ['주의력결핍 증상 체크', '과잉행동 증상 체크', '일상생활 영향도 평가'] },
              ].map((test) => {
                const isExpanded = expandedSimpleTest === test.key;
                return (
                  <Collapsible key={test.key} open={isExpanded} onOpenChange={() => setExpandedSimpleTest(isExpanded ? null : test.key)}>
                    <CollapsibleTrigger asChild>
                      <button className="w-full group text-left p-3 md:p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-xl">{test.icon}</span>
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
                          {test.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                        <Button 
                          onClick={() => handleTestTypeSelect(test.key as any)}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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

          {/* ========== 발달검사 섹션 ========== */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
              <h2 className="text-lg font-bold text-foreground">아동·청소년 발달검사</h2>
              <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded font-medium">베타 무료</span>
            </div>

            <div className="space-y-2">
              {[
                { key: 'developmental-delay', icon: '👶', title: '발달지연 검사', duration: '약 5분', questions: '20문항', description: '전반적인 발달 영역(운동, 언어, 인지, 사회성)의 지연 여부를 선별합니다.', features: ['전반적 발달 영역 평가', '연령별 발달 기준 비교', '조기 개입 필요성 확인'] },
                { key: 'language', icon: '🗣️', title: '영유아 언어발달', duration: '약 2분', questions: '10문항', description: '영유아의 언어 표현 및 이해 능력을 빠르게 점검합니다.', features: ['표현언어 발달 체크', '수용언어 발달 체크', '언어치료 필요성 평가'] },
                { key: 'sensory-integration', icon: '🎨', title: '감각통합장애', duration: '약 5분', questions: '18문항', description: '시각, 청각, 촉각 등 감각 처리 능력의 이상 여부를 확인합니다.', features: ['감각 과민/둔감 체크', '일상생활 영향도 평가', '감각통합치료 필요성 확인'] },
                { key: 'learning-disability', icon: '📚', title: '학습장애 검사', duration: '약 5분', questions: '20문항', description: '읽기, 쓰기, 수학 등 학습 영역의 어려움을 평가합니다.', features: ['학습 영역별 능력 평가', '학습 전략 분석', '학습 지원 필요성 확인'] },
                { key: 'social-development', icon: '👥', title: '사회성 발달', duration: '약 5분', questions: '18문항', description: '또래 관계, 사회적 상호작용 능력을 평가합니다.', features: ['또래 관계 능력 평가', '사회적 상황 이해력', '사회성 발달 지원 방향'] },
                { key: 'challenging-behavior', icon: '⚠️', title: '도전행동 평가', duration: '약 5분', questions: '15문항', description: '공격성, 자해, 파괴적 행동 등 문제행동을 평가합니다.', features: ['문제행동 유형 분석', '행동 발생 빈도 평가', '중재 전략 제안'] },
                { key: 'adaptive-behavior', icon: '🏠', title: '적응행동 평가', duration: '약 5분', questions: '20문항', description: '일상생활 자립 능력과 독립성을 평가합니다.', features: ['자조 기술 평가', '가정생활 기술 평가', '지역사회 기술 평가'] },
              ].map((test) => {
                const isExpanded = expandedSimpleTest === test.key;
                return (
                  <Collapsible key={test.key} open={isExpanded} onOpenChange={() => setExpandedSimpleTest(isExpanded ? null : test.key)}>
                    <CollapsibleTrigger asChild>
                      <button className="w-full group text-left p-3 md:p-4 rounded-xl border border-border hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-xl">{test.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 md:gap-2 mb-0.5">
                                <h3 className="font-semibold text-sm md:text-base text-foreground group-hover:text-emerald-600 truncate">{test.title}</h3>
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
                          {test.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                        <Button 
                          onClick={() => handleTestTypeSelect(test.key as any)}
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

          {/* ========== 성격·진로 검사 섹션 ========== */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
              <h2 className="text-lg font-bold text-foreground">성격·진로 검사</h2>
              <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded font-medium">베타 무료</span>
            </div>

            <div className="space-y-2">
              {[
                { key: 'attachment-deep', icon: '💜', title: '애착 유형 심층분석', duration: '약 8분', questions: '30문항', badge: 'NEW', description: '성인 애착 유형을 심층 분석하여 관계 패턴을 이해합니다.', features: ['불안-회피 차원 분석', 'AI 기반 심층 해석', '관계 개선 가이드'], onClick: () => navigate('/assessment/attachment-style-test') },
                { key: 'bigfive', icon: '🌟', title: '5차원 성격 분석', duration: '약 5분', questions: '25문항', badge: '인기', description: '개방성, 성실성, 외향성, 친화성, 신경성 5가지 성격 특성을 분석합니다.', features: ['Big Five 성격 모델 기반', '성격 강점/약점 분석', '대인관계 스타일 이해'], onClick: () => setCurrentStep('bigfive-test') },
                { key: 'attachment', icon: '🤝', title: '관계유형 진단', duration: '약 4분', questions: '20문항', description: '대인 관계에서의 애착 스타일과 관계 패턴을 진단합니다.', features: ['안정/불안/회피 유형 분류', '관계 강점 발견', '건강한 관계 팁 제공'], onClick: () => setCurrentStep('attachment-test') },
                { key: 'stress', icon: '🔥', title: '스트레스 지수', duration: '약 4분', questions: '12문항', description: '현재 스트레스 수준과 대처 능력을 측정합니다.', features: ['스트레스 수준 정량화', '스트레스 유형 분석', '맞춤형 해소법 제안'], onClick: () => setCurrentStep('stress-test') },
                { key: 'career', icon: '🎯', title: '진로흥미 탐색', duration: '약 6분', questions: '30문항', description: '홀랜드 이론 기반으로 적합한 직업 분야를 탐색합니다.', features: ['6가지 직업 흥미 유형', '적성 분야 추천', '진로 방향 가이드'], onClick: () => setCurrentStep('career-test') },
                { key: 'selfesteem', icon: '💎', title: '자아가치 측정', duration: '약 4분', questions: '15문항', description: '자존감 수준과 자기 가치감을 객관적으로 측정합니다.', features: ['자존감 수준 평가', '자기 인식 분석', '자존감 향상 방법'], onClick: () => setCurrentStep('selfesteem-test') },
                { key: 'defense', icon: '🛡️', title: '방어기제 분석', duration: '약 5분', questions: '24문항', badge: 'NEW', description: '무의식적 심리 방어 메커니즘을 분석합니다.', features: ['주요 방어기제 유형 분석', '스트레스 대처 패턴 이해', '성숙한 방어기제 개발'], onClick: () => navigate('/assessment/defense-mechanism-test') },
                { key: 'parent-child-play', icon: '👨‍👧', title: '부모아동 놀이성향', duration: '약 3분', questions: '8문항', description: '부모와 자녀 간의 놀이 상호작용 스타일을 분석합니다.', features: ['놀이 상호작용 패턴', '부모 놀이 참여도', '놀이 활동 추천'], onClick: () => handleTestTypeSelect('parent-child-play') },
              ].map((test) => {
                const isExpanded = expandedSimpleTest === test.key;
                return (
                  <Collapsible key={test.key} open={isExpanded} onOpenChange={() => setExpandedSimpleTest(isExpanded ? null : test.key)}>
                    <CollapsibleTrigger asChild>
                      <button className="w-full group text-left p-3 md:p-4 rounded-xl border border-border hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-xl">{test.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 md:gap-2 mb-0.5">
                                <h3 className="font-semibold text-sm md:text-base text-foreground group-hover:text-purple-600 truncate">{test.title}</h3>
                                {test.badge && (
                                  <Badge className={`${test.badge === 'NEW' ? 'bg-purple-500' : 'bg-orange-500'} text-white text-[9px] md:text-[10px] px-1 md:px-1.5 py-0 flex-shrink-0`}>{test.badge}</Badge>
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
                          {test.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                        <Button 
                          onClick={test.onClick}
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

          {/* ========== 재미용 검사 (축소/회색) ========== */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-6 bg-muted-foreground/30 rounded-full"></div>
              <h2 className="text-lg font-medium text-muted-foreground">재미용 AI 검사</h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">무료</span>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              <button 
                className="group text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                onClick={() => handleTestTypeSelect('dream')}
              >
                <div className="text-xl mb-1">🌙</div>
                <p className="text-xs text-muted-foreground group-hover:text-foreground">꿈 해몽</p>
              </button>

              <button 
                className="group text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                onClick={() => handleTestTypeSelect('saju')}
              >
                <div className="text-xl mb-1">🔮</div>
                <p className="text-xs text-muted-foreground group-hover:text-foreground">사주풀이</p>
              </button>

              <button 
                className="group text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                onClick={() => setCurrentStep('past-life-job')}
              >
                <div className="text-xl mb-1">👑</div>
                <p className="text-xs text-muted-foreground group-hover:text-foreground">전생 직업</p>
              </button>

              <button 
                className="group text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                onClick={() => setCurrentStep('animal-face-match')}
              >
                <div className="text-xl mb-1">🐾</div>
                <p className="text-xs text-muted-foreground group-hover:text-foreground">닮은 동물</p>
              </button>

              <button 
                className="group text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                onClick={() => setCurrentStep('inner-animal')}
              >
                <div className="text-xl mb-1">💚</div>
                <p className="text-xs text-muted-foreground group-hover:text-foreground">내면 동물</p>
              </button>

              <button 
                className="group text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                onClick={() => setCurrentStep('grandma-relationship')}
              >
                <div className="text-xl mb-1">👵</div>
                <p className="text-xs text-muted-foreground group-hover:text-foreground">연애 진단</p>
              </button>

              <button 
                className="group text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                onClick={() => setCurrentStep('grandpa-marriage')}
              >
                <div className="text-xl mb-1">👴</div>
                <p className="text-xs text-muted-foreground group-hover:text-foreground">부부 진단</p>
              </button>

              <button 
                className="group text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                onClick={() => setCurrentStep('mz-nagging')}
              >
                <div className="text-xl mb-1">🍲</div>
                <p className="text-xs text-muted-foreground group-hover:text-foreground">MZ 잔소리</p>
              </button>

              <button 
                className="group text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                onClick={() => navigate('/joseon-name-test')}
              >
                <div className="text-xl mb-1">🏯</div>
                <p className="text-xs text-muted-foreground group-hover:text-foreground">조선 이름</p>
              </button>

              <button 
                className="group text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                onClick={() => navigate('/joseon-job-test')}
              >
                <div className="text-xl mb-1">⚔️</div>
                <p className="text-xs text-muted-foreground group-hover:text-foreground">조선 직업</p>
              </button>

              <button 
                className="group text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                onClick={() => navigate('/joseon-status-test')}
              >
                <div className="text-xl mb-1">🎭</div>
                <p className="text-xs text-muted-foreground group-hover:text-foreground">조선 신분</p>
              </button>

              <button 
                className="group text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                onClick={() => setCurrentStep('wisdom-advice')}
              >
                <div className="text-xl mb-1">🌟</div>
                <p className="text-xs text-muted-foreground group-hover:text-foreground">인생 조언</p>
              </button>

              <button 
                className="group text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                onClick={() => setCurrentStep('otrovert')}
              >
                <div className="text-xl mb-1">🎪</div>
                <p className="text-xs text-muted-foreground group-hover:text-foreground">오트로버트</p>
              </button>

              <button 
                className="group text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                onClick={() => setCurrentStep('life-achievement')}
              >
                <div className="text-xl mb-1">🏆</div>
                <p className="text-xs text-muted-foreground group-hover:text-foreground">인생 업적</p>
              </button>

              <button 
                className="group text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                onClick={() => navigate('/han-medicine-test')}
              >
                <div className="text-xl mb-1">🌿</div>
                <p className="text-xs text-muted-foreground group-hover:text-foreground">한의학 체질</p>
              </button>
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