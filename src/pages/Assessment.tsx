import { useState } from "react";
import AgeSelector from "@/components/assessment/AgeSelector";
import InfantAssessment from "@/components/assessment/InfantAssessment";
import ChildAssessment from "@/components/assessment/ChildAssessment";
import AdultAssessment from "@/components/assessment/AdultAssessment";
import LanguageTestForm from "@/components/assessment/LanguageTestForm";
import LanguageTestResult from "@/components/assessment/LanguageTestResult";
import AnalysisScreen from "@/components/analysis/AnalysisScreen";
import ExpertMatching from "@/components/analysis/ExpertMatching";
import ConsultationRoom from "@/components/consultation/ConsultationRoom";
import { ExpertProfile } from "@/types/assessment";

const Assessment = () => {
  const [currentStep, setCurrentStep] = useState<'test-type' | 'age-select' | 'assessment' | 'language-test' | 'analysis' | 'matching' | 'consultation' | 'language-result'>('test-type');
  const [testType, setTestType] = useState<'psychological' | 'language' | null>(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'infant' | 'child' | 'adult' | null>(null);
  const [selectedAge, setSelectedAge] = useState<number>(0);
  const [assessmentResults, setAssessmentResults] = useState<Record<string, number>>({});
  const [languageResults, setLanguageResults] = useState<{answers: number[], total: number, average: number, ageGroup: string} | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [selectedExpert, setSelectedExpert] = useState<ExpertProfile | null>(null);

  const handleTestTypeSelect = (type: 'psychological' | 'language') => {
    setTestType(type);
    setCurrentStep('age-select');
  };

  const handleAgeGroupSelect = (ageGroup: 'infant' | 'child' | 'adult', age: number) => {
    setSelectedAgeGroup(ageGroup);
    setSelectedAge(age);
    setCurrentStep(testType === 'language' ? 'language-test' : 'assessment');
  };

  const handleAssessmentComplete = (results: Record<string, number>) => {
    console.log('Assessment Results:', results);
    setAssessmentResults(results);
    setCurrentStep('analysis');
  };

  const handleLanguageTestComplete = (results: {answers: number[], total: number, average: number, ageGroup: string}) => {
    console.log('Language Test Results:', results);
    setLanguageResults(results);
    setCurrentStep('language-result');
  };

  const handleAnalysisComplete = (analysis: string) => {
    setAnalysisResult(analysis);
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
    if (currentStep === 'analysis' || currentStep === 'matching' || currentStep === 'consultation' || currentStep === 'language-result') {
      // 분석/매칭/상담/언어결과 단계에서는 처음부터 다시 시작
      setCurrentStep('test-type');
      setTestType(null);
      setSelectedAgeGroup(null);
      setSelectedAge(0);
      setAssessmentResults({});
      setLanguageResults(null);
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
        <div className="relative z-10 container mx-auto px-6 pt-20 pb-16">
          <div className="text-center mb-16 space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              <span className="block text-foreground mb-2">3분으로 시작하는</span>
              <span className="block text-brand-gradient">전문 검사</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              어떤 검사를 받고 싶으신가요?
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <div 
              className="bg-card hover-glow border border-border rounded-2xl p-8 cursor-pointer transition-all hover:scale-105"
              onClick={() => handleTestTypeSelect('psychological')}
            >
              <h3 className="text-2xl font-bold text-brand-gradient mb-4">심리발달 검사</h3>
              <p className="text-muted-foreground mb-4">전문가급 심리 상태 및 발달 수준 종합 분석</p>
              <ul className="space-y-2 text-sm">
                <li>• 연령별 맞춤 검사</li>
                <li>• AI 분석 + 전문가 매칭</li>
                <li>• 종합적인 심리상태 평가</li>
              </ul>
            </div>
            
            <div 
              className="bg-card hover-glow border border-border rounded-2xl p-8 cursor-pointer transition-all hover:scale-105"
              onClick={() => handleTestTypeSelect('language')}
            >
              <h3 className="text-2xl font-bold text-brand-gradient mb-4">언어발달 검사</h3>
              <p className="text-muted-foreground mb-4">연령에 맞춤 20문항으로 간단 진단</p>
              <ul className="space-y-2 text-sm">
                <li>• 연령대별 20문항</li>
                <li>• 3분 간단 테스트</li>
                <li>• 즉시 결과 확인</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'age-select') {
    return <AgeSelector onAgeGroupSelect={handleAgeGroupSelect} testType={testType} />;
  }

  if (currentStep === 'language-test') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">언어발달 자가검사 (3분)</h1>
            <p className="text-muted-foreground">연령에 맞춘 20문항</p>
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