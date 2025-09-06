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
import { Sparkles, Crown, Camera, Heart, Zap, Brain, Target } from "lucide-react";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Assessment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // URL 파라미터에서 테스트 타입 확인
  const urlTestType = searchParams.get('type');
  const urlTest = searchParams.get('test');
  
  const [currentStep, setCurrentStep] = useState<'test-type' | 'legal-notice' | 'age-select' | 'assessment' | 'language-test' | 'panic-test' | 'depression-test' | 'adhd-test' | 'stress-test' | 'bigfive-test' | 'attachment-test' | 'career-test' | 'selfesteem-test' | 'dream-interpretation' | 'saju-analysis' | 'analysis' | 'matching' | 'consultation' | 'language-result' | 'panic-result' | 'depression-result' | 'adhd-result' | 'stress-result' | 'bigfive-result' | 'attachment-result' | 'career-result' | 'selfesteem-result' | 'child-result' | 'infant-result' | 'adult-result' | 'ai-chat' | 'realtime-chat'>('test-type');
  const [testType, setTestType] = useState<'psychological' | 'language' | 'panic' | 'depression' | 'adhd' | 'stress' | 'bigfive' | 'attachment' | 'career' | 'selfesteem' | 'dream' | 'saju' | null>(null);
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
      default: return '심리상태 체크';
    }
  };

  const handleTestTypeSelect = (type: 'psychological' | 'language' | 'panic' | 'depression' | 'adhd' | 'stress' | 'bigfive' | 'attachment' | 'career' | 'selfesteem' | 'dream' | 'saju') => {
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
    if (testType === 'language') {
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
    console.log('Assessment Results:', results);
    setAssessmentResults(results);
    
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
    if (currentStep === 'dream-interpretation' || currentStep === 'saju-analysis' || currentStep === 'analysis' || currentStep === 'matching' || currentStep === 'consultation' || currentStep === 'language-result' || currentStep === 'panic-result' || currentStep === 'depression-result' || currentStep === 'adhd-result' || currentStep === 'stress-result' || currentStep === 'bigfive-result' || currentStep === 'attachment-result' || currentStep === 'career-result' || currentStep === 'child-result' || currentStep === 'infant-result' || currentStep === 'adult-result' || currentStep === 'ai-chat' || currentStep === 'realtime-chat') {
      // 분석/매칭/상담/결과 단계에서는 처음부터 다시 시작
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
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 relative overflow-hidden">
        {/* 최상단 법적 안전 공지 */}
        <div className="bg-blue-600 text-white py-3 px-4 text-center text-sm">
          <span className="font-semibold">⚠️ 중요 안내:</span> 본 서비스는 참고용 자가체크 및 심리상담 연결 서비스입니다. 
          의학적 진단이나 치료행위는 포함되지 않습니다. 정확한 진단은 의료기관에서 받으세요. 
          <span className="font-semibold ml-2">🚨 응급상황: 119 / 자살예방: 1577-0199</span>
        </div>
        
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


          {/* 전문 심리검사 섹션 */}
          <div className="mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">전문 심리검사</h2>
              <p className="text-muted-foreground">
                AHI 독창적 도구로 정확한 진단을 받아보세요
              </p>
            </div>

            <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
              <div 
                className="bg-card hover-glow border border-border rounded-2xl p-8 cursor-pointer transition-all hover:scale-105 relative"
                onClick={() => handleTestTypeSelect('psychological')}
              >
                <div className="absolute top-4 right-4">
                  <Badge className="bg-orange-500 text-white">3토큰</Badge>
                </div>
                <h3 className="text-2xl font-bold text-brand-gradient mb-4">마음상태 체크</h3>
                <p className="text-muted-foreground mb-4">연령별 맞춤 심리상태 참고 분석 (진단 아님)</p>
                <ul className="space-y-2 text-sm">
                  <li>• 연령별 맞춤 체크</li>
                  <li>• AI 참고 분석 + 상담사 연결</li>
                  <li>• 종합적인 마음상태 확인</li>
                </ul>
              </div>
              
              <div 
                className="bg-card hover-glow border border-border rounded-2xl p-8 cursor-pointer transition-all hover:scale-105 relative"
                onClick={() => handleTestTypeSelect('language')}
              >
                <div className="absolute top-4 right-4">
                  <Badge className="bg-blue-500 text-white">2토큰</Badge>
                </div>
                <h3 className="text-2xl font-bold text-brand-gradient mb-4">영유아언어발달체크</h3>
                <p className="text-muted-foreground mb-4">연령에 맞춤 20문항으로 간단 확인 (참고용)</p>
                <ul className="space-y-2 text-sm">
                  <li>• 연령대별 20문항</li>
                  <li>• 3분 간단 체크</li>
                  <li>• 즉시 참고결과 확인</li>
                </ul>
              </div>

              <div 
                className="bg-card hover-glow border border-border rounded-2xl p-8 cursor-pointer transition-all hover:scale-105 relative"
                onClick={() => handleTestTypeSelect('panic')}
              >
                <div className="absolute top-4 right-4">
                  <Badge className="bg-blue-500 text-white">2토큰</Badge>
                </div>
                <h3 className="text-2xl font-bold text-brand-gradient mb-4">불안감 수준 확인</h3>
                <p className="text-muted-foreground mb-4">불안감 증상 자가체크 (참고용)</p>
                <ul className="space-y-2 text-sm">
                  <li>• AHI-ANXIETY 21문항</li>
                  <li>• 신속한 현재상태 확인</li>
                  <li>• 수준별 참고 분석</li>
                </ul>
              </div>

              <div 
                className="bg-card hover-glow border border-border rounded-2xl p-8 cursor-pointer transition-all hover:scale-105 relative"
                onClick={() => handleTestTypeSelect('depression')}
              >
                <div className="absolute top-4 right-4">
                  <Badge className="bg-blue-500 text-white">2토큰</Badge>
                </div>
                <h3 className="text-2xl font-bold text-brand-gradient mb-4">우울감 자가체크</h3>
                <p className="text-muted-foreground mb-4">우울감 수준 확인 (참고용)</p>
                <ul className="space-y-2 text-sm">
                  <li>• AHI-MOOD 21문항</li>
                  <li>• AI 참고 분석</li>
                  <li>• 전문적 해석 제공</li>
                </ul>
              </div>

              <div 
                className="bg-card hover-glow border border-border rounded-2xl p-8 cursor-pointer transition-all hover:scale-105 relative"
                onClick={() => handleTestTypeSelect('adhd')}
              >
                <div className="absolute top-4 right-4">
                  <Badge className="bg-blue-500 text-white">2토큰</Badge>
                </div>
                <h3 className="text-2xl font-bold text-brand-gradient mb-4">주의집중력 자가체크</h3>
                <p className="text-muted-foreground mb-4">연령별 ADHD 증상 확인 (참고용)</p>
                <ul className="space-y-2 text-sm">
                  <li>• 아동청소년/성인 구분</li>
                  <li>• 주의집중력 증상 체크 18문항</li>
                  <li>• 증상 영역별 분석</li>
                </ul>
              </div>
              
              <div 
                className="bg-gradient-to-br from-indigo-500 to-purple-600 hover-glow border border-purple-300 rounded-2xl p-8 cursor-pointer transition-all hover:scale-105 text-white relative"
                onClick={() => handleTestTypeSelect('dream')}
              >
                <div className="absolute top-4 right-4">
                  <Badge className="bg-purple-700 text-white">5토큰</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-4">🌙 AI 꿈 해몽</h3>
                <p className="text-purple-100 mb-4">당신의 꿈이 담고 있는 의미를 AI가 해석 (재미용)</p>
                <ul className="space-y-2 text-sm text-purple-100">
                  <li>• 꿈 내용 입력</li>
                  <li>• AI 즉시 해몽</li>
                  <li>• 심리적 의미 해석</li>
                </ul>
              </div>
              
              <div 
                className="bg-gradient-to-br from-orange-500 to-red-600 hover-glow border border-orange-300 rounded-2xl p-8 cursor-pointer transition-all hover:scale-105 text-white relative"
                onClick={() => handleTestTypeSelect('saju')}
              >
                <div className="absolute top-4 right-4">
                  <Badge className="bg-red-700 text-white">8토큰</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-4">🔮 AI 사주풀이</h3>
                <p className="text-orange-100 mb-4">생년월일시로 당신의 운세와 사주를 AI가 분석 (재미용)</p>
                <ul className="space-y-2 text-sm text-orange-100">
                  <li>• 생년월일시 입력</li>
                  <li>• AI 즉시 사주분석</li>
                  <li>• 운세와 성향 해석</li>
                </ul>
              </div>

              {/* 재미있는 테스트 3개 추가 */}
              <div 
                className="bg-gradient-to-br from-purple-500 to-pink-600 hover-glow border border-purple-300 rounded-2xl p-8 cursor-pointer transition-all hover:scale-105 text-white relative"
                onClick={() => navigate('/fun-tests?type=past-life-job')}
              >
                <div className="absolute top-4 right-4">
                  <Badge className="bg-pink-700 text-white">🔥 HOT</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-4">👑 내 전생은 어떤 직업?</h3>
                <p className="text-purple-100 mb-4">AI가 분석하는 나의 전생 직업과 운명! MZ세대가 가장 좋아하는 신비로운 테스트</p>
                <ul className="space-y-2 text-sm text-purple-100">
                  <li>• MZ세대</li>
                  <li>• AI 즉시 해석</li>
                  <li>• 심리적 의미 해석</li>
                </ul>
              </div>

              <div 
                className="bg-gradient-to-br from-orange-500 to-yellow-600 hover-glow border border-orange-300 rounded-2xl p-8 cursor-pointer transition-all hover:scale-105 text-white relative"
                onClick={() => navigate('/fun-tests?type=animal-face-match')}
              >
                <div className="absolute top-4 right-4">
                  <Badge className="bg-yellow-700 text-white">📈 TREND</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-4">📸 내 얼굴 닮은 동물 찾기</h3>
                <p className="text-orange-100 mb-4">카메라로 얼굴을 찍으면 AI가 닮은 동물을 찾아줘! 친구들과 비교해보며 웃음폭탄</p>
                <ul className="space-y-2 text-sm text-orange-100">
                  <li>• 초등·청소년</li>
                  <li>• AI 즉시 해석</li>
                  <li>• 운세와 성향 해석</li>
                </ul>
              </div>

              <div 
                className="bg-gradient-to-br from-green-500 to-blue-600 hover-glow border border-green-300 rounded-2xl p-8 cursor-pointer transition-all hover:scale-105 text-white relative"
                onClick={() => navigate('/fun-tests?type=inner-animal')}
              >
                <div className="absolute top-4 right-4">
                  <Badge className="bg-blue-700 text-white">✨ NEW</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-4">💚 나의 내면 동물 찾기</h3>
                <p className="text-green-100 mb-4">깊은 심리 분석으로 알아보는 나의 진짜 성격! 40대 이상이 가장 많이 하는 인기 테스트</p>
                <ul className="space-y-2 text-sm text-green-100">
                  <li>• 40대+</li>
                  <li>• AI 즉시 해석</li>
                  <li>• 심리적 의미 해석</li>
                </ul>
              </div>
            </div>

            {/* AIH 전문가 창작 검사 섹션 */}
            <div className="mt-12">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-foreground mb-2">AIH 전문가 창작 검사</h3>
                <p className="text-muted-foreground">
                  심리전문가가 직접 개발한 신뢰도 높은 창작 검사
                </p>
              </div>
              
              <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {/* 🔥 TOP 인기 3분 테스트 1위 */}
                <div 
                  className="bg-card hover-glow border border-border rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative"
                  onClick={() => setCurrentStep('bigfive-test')}
                >
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-red-500 text-white font-bold">
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
                  className="bg-card hover-glow border border-border rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative"
                  onClick={() => setCurrentStep('attachment-test')}
                >
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-orange-500 text-white font-bold">
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
                  className="bg-card hover-glow border border-border rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative"
                  onClick={() => setCurrentStep('stress-test')}
                >
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-500 text-white font-bold">
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
                  className="bg-card hover-glow border border-border rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative"
                  onClick={() => setCurrentStep('career-test')}
                >
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-blue-500 text-white font-bold">
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
                  className="bg-card hover-glow border border-border rounded-2xl p-6 cursor-pointer transition-all hover:scale-105 relative"
                  onClick={() => setCurrentStep('selfesteem-test')}
                >
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-purple-500 text-white font-bold">
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
      </div>
    );
  }


  if (currentStep === 'dream-interpretation') {
    return <DreamInterpretation onBack={handleBack} />;
  }
  
  if (currentStep === 'saju-analysis') {
    return <SajuAnalysis onBack={handleBack} />;
  }

  if (currentStep === 'legal-notice' && testType && testType !== 'dream') {
    return <LegalSafetyNotice onAccept={handleLegalNoticeAccept} testType={testType} />;
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
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <StressTestResult 
            result={stressResults}
            onRestart={() => setCurrentStep('stress-test')}
          />
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

  if (currentStep === 'selfesteem-result' && selfesteemResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <SelfEsteemTestResult 
            result={selfesteemResults}
            onRestart={() => setCurrentStep('selfesteem-test')}
          />
        </div>
      </div>
    );
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
  );
};

export default Assessment;