import { useState } from "react";
import AgeSelector from "@/components/assessment/AgeSelector";
import InfantAssessment from "@/components/assessment/InfantAssessment";
import ChildAssessment from "@/components/assessment/ChildAssessment";
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
import AIChatInterface from "@/components/counseling/AIChatInterface";
import RealTimeChat from "@/components/counseling/RealTimeChat";
import LegalSafetyNotice from "@/components/LegalSafetyNotice";
import AnalysisScreen from "@/components/analysis/AnalysisScreen";
import ExpertMatching from "@/components/analysis/ExpertMatching";
import ConsultationRoom from "@/components/consultation/ConsultationRoom";
import { ExpertProfile } from "@/types/assessment";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Assessment = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<'test-type' | 'legal-notice' | 'age-select' | 'assessment' | 'language-test' | 'panic-test' | 'depression-test' | 'adhd-test' | 'analysis' | 'matching' | 'consultation' | 'language-result' | 'panic-result' | 'depression-result' | 'adhd-result' | 'child-result' | 'infant-result' | 'adult-result' | 'ai-chat' | 'realtime-chat'>('test-type');
  const [testType, setTestType] = useState<'psychological' | 'language' | 'panic' | 'depression' | 'adhd' | null>(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'infant' | 'child' | 'adult' | null>(null);
  const [selectedAge, setSelectedAge] = useState<number>(0);
  const [assessmentResults, setAssessmentResults] = useState<Record<string, number>>({});
  const [languageResults, setLanguageResults] = useState<{answers: number[], total: number, average: number, ageGroup: string} | null>(null);
  const [panicResults, setPanicResults] = useState<{answers: number[], total: number, average: number, severity: string} | null>(null);
  const [depressionResults, setDepressionResults] = useState<{answers: number[], total: number, average: number, severity: string} | null>(null);
  const [adhdResults, setAdhdResults] = useState<{answers: number[], total: number, average: number, ageGroup: string, severity: string} | null>(null);
  const [childResults, setChildResults] = useState<{answers: Record<string, number>, total: number, average: number, ageGroup: string, gameScores: Record<string, number>} | null>(null);
  const [infantResults, setInfantResults] = useState<{answers: Record<string, number>, total: number, average: number, ageGroup: string, categoryScores: Record<string, number>} | null>(null);
  const [adultResults, setAdultResults] = useState<{answers: Record<string, number>, total: number, average: number, ageGroup: string, categoryScores: Record<string, number>} | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [selectedExpert, setSelectedExpert] = useState<ExpertProfile | null>(null);
  const [currentAssessmentResults, setCurrentAssessmentResults] = useState<any>(null);

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
      const { data: familyMember } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('profile_id', profile.id)
        .single();

      const family_id = familyMember?.family_id || null;

      // Timeline에 검사 기록 저장
      const { error } = await supabase
        .from('timeline_activities')
        .insert({
          family_id,
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
      case 'adhd': return 'ADHD 자가체크';
      case 'depression': return '우울감 자가체크';
      case 'panic': return '불안감 수준 확인';
      case 'language': return '언어발달 자가체크';
      default: return '심리상태 체크';
    }
  };

  const handleTestTypeSelect = (type: 'psychological' | 'language' | 'panic' | 'depression' | 'adhd') => {
    setTestType(type);
    setCurrentStep('legal-notice');
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
    } else {
      setCurrentStep('assessment');
    }
  };

  const handleAssessmentComplete = (results: Record<string, number>) => {
    console.log('Assessment Results:', results);
    setAssessmentResults(results);
    
    // 결과 형식에 따라 적절한 단계로 이동
    if (selectedAgeGroup === 'child') {
      // 아동청소년 게임검사 결과 처리
      const gameScores = results;
      const total = Object.values(gameScores).reduce((sum, score) => sum + score, 0);
      const average = total / Object.keys(gameScores).length;
      
      const childResults = {
        answers: results,
        total,
        average,
        ageGroup: `${selectedAge}세`,
        gameScores
      };
      
      setChildResults(childResults);
      setCurrentStep('child-result');
    } else if (selectedAgeGroup === 'infant') {
      // 영유아 발달검사 결과 처리
      const categoryScores = results;
      const total = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
      const average = total / Object.keys(categoryScores).length;
      
      const infantResults = {
        answers: results,
        total,
        average,
        ageGroup: `${selectedAge}세`,
        categoryScores
      };
      
      setInfantResults(infantResults);
      setCurrentStep('infant-result');
    } else if (selectedAgeGroup === 'adult') {
      // 성인 심리평가 결과 처리
      const categoryScores = results;
      const total = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
      const average = total / Object.keys(categoryScores).length;
      
      const adultResults = {
        answers: results,
        total,
        average,
        ageGroup: `${selectedAge}세`,
        categoryScores
      };
      
      setAdultResults(adultResults);
      setCurrentStep('adult-result');
    } else {
      setCurrentStep('analysis');
    }
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

  const handleStartAIChat = () => {
    setCurrentStep('ai-chat');
  };

  const handleStartRealTimeChat = () => {
    setCurrentStep('realtime-chat');
  };
    const handleAnalysisComplete = (analysis: string) => {
    setCurrentStep('matching');
  };

  const handleExpertSelect = (expert: ExpertProfile) => {
    console.log('Selected Expert:', expert);
    setSelectedExpert(expert);
    setCurrentStep('consultation');
  };

  const handleEndSession = () => {
    // 상담 종료 후 홈으로 돌아가기
    window.location.href = '/';
  };

  const handleBack = () => {
    if (currentStep === 'analysis' || currentStep === 'matching' || currentStep === 'consultation' || currentStep === 'language-result' || currentStep === 'panic-result' || currentStep === 'depression-result' || currentStep === 'adhd-result' || currentStep === 'child-result' || currentStep === 'infant-result' || currentStep === 'adult-result' || currentStep === 'ai-chat' || currentStep === 'realtime-chat') {
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
            <p className="text-xl text-muted-foreground">
              어떤 체크를 받고 싶으신가요? (참고용)
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            <div 
              className="bg-card hover-glow border border-border rounded-2xl p-8 cursor-pointer transition-all hover:scale-105"
              onClick={() => handleTestTypeSelect('psychological')}
            >
              <h3 className="text-2xl font-bold text-brand-gradient mb-4">마음상태 체크</h3>
              <p className="text-muted-foreground mb-4">연령별 맞춤 심리상태 참고 분석 (진단 아님)</p>
              <ul className="space-y-2 text-sm">
                <li>• 연령별 맞춤 체크</li>
                <li>• AI 참고 분석 + 상담사 연결</li>
                <li>• 종합적인 마음상태 확인</li>
              </ul>
            </div>
            
            <div 
              className="bg-card hover-glow border border-border rounded-2xl p-8 cursor-pointer transition-all hover:scale-105"
              onClick={() => handleTestTypeSelect('language')}
            >
              <h3 className="text-2xl font-bold text-brand-gradient mb-4">언어발달 자가체크</h3>
              <p className="text-muted-foreground mb-4">연령에 맞춤 20문항으로 간단 확인 (참고용)</p>
              <ul className="space-y-2 text-sm">
                <li>• 연령대별 20문항</li>
                <li>• 3분 간단 체크</li>
                <li>• 즉시 참고결과 확인</li>
              </ul>
            </div>

            <div 
              className="bg-card hover-glow border border-border rounded-2xl p-8 cursor-pointer transition-all hover:scale-105"
              onClick={() => handleTestTypeSelect('panic')}
            >
              <h3 className="text-2xl font-bold text-brand-gradient mb-4">불안감 수준 확인</h3>
              <p className="text-muted-foreground mb-4">불안감 증상 자가체크 (참고용)</p>
              <ul className="space-y-2 text-sm">
                <li>• 표준화된 21문항</li>
                <li>• 신속한 현재상태 확인</li>
                <li>• 수준별 참고 분석</li>
              </ul>
            </div>

            <div 
              className="bg-card hover-glow border border-border rounded-2xl p-8 cursor-pointer transition-all hover:scale-105"
              onClick={() => handleTestTypeSelect('depression')}
            >
              <h3 className="text-2xl font-bold text-brand-gradient mb-4">우울감 자가체크</h3>
              <p className="text-muted-foreground mb-4">우울감 수준 확인 (참고용)</p>
              <ul className="space-y-2 text-sm">
                <li>• 표준화된 21문항</li>
                <li>• AI 참고 분석</li>
                <li>• 전문적 해석 제공</li>
              </ul>
            </div>

            <div 
              className="bg-card hover-glow border border-border rounded-2xl p-8 cursor-pointer transition-all hover:scale-105"
              onClick={() => handleTestTypeSelect('adhd')}
            >
              <h3 className="text-2xl font-bold text-brand-gradient mb-4">ADHD 자가체크</h3>
              <p className="text-muted-foreground mb-4">연령별 ADHD 증상 확인 (참고용)</p>
              <ul className="space-y-2 text-sm">
                <li>• 아동청소년/성인 구분</li>
                <li>• DSM-5 기반 18문항</li>
                <li>• 증상 영역별 분석</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'legal-notice' && testType) {
    return <LegalSafetyNotice onAccept={handleLegalNoticeAccept} testType={testType} />;
  }
  
  if (currentStep === 'age-select') {
    return <AgeSelector onAgeGroupSelect={handleAgeGroupSelect} testType={testType} />;
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
            <p className="text-muted-foreground">DSM-5 기반 21문항 (참고용)</p>
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
            <p className="text-muted-foreground">Beck 우울척도 기반 21문항 (참고용)</p>
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
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">ADHD 자가체크 (3분)</h1>
            <p className="text-muted-foreground">DSM-5 기반 18문항 (참고용)</p>
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
        <ChildAssessment 
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