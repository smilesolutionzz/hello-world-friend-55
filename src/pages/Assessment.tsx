import { useState } from "react";
import AgeSelector from "@/components/assessment/AgeSelector";
import InfantAssessment from "@/components/assessment/InfantAssessment";
import ChildAssessment from "@/components/assessment/ChildAssessment";
import AdultAssessment from "@/components/assessment/AdultAssessment";
import AnalysisScreen from "@/components/analysis/AnalysisScreen";
import ExpertMatching from "@/components/analysis/ExpertMatching";
import ConsultationRoom from "@/components/consultation/ConsultationRoom";
import { ExpertProfile } from "@/types/assessment";

const Assessment = () => {
  const [currentStep, setCurrentStep] = useState<'age-select' | 'assessment' | 'analysis' | 'matching' | 'consultation'>('age-select');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'infant' | 'child' | 'adult' | null>(null);
  const [selectedAge, setSelectedAge] = useState<number>(0);
  const [assessmentResults, setAssessmentResults] = useState<Record<string, number>>({});
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [selectedExpert, setSelectedExpert] = useState<ExpertProfile | null>(null);

  const handleAgeGroupSelect = (ageGroup: 'infant' | 'child' | 'adult', age: number) => {
    setSelectedAgeGroup(ageGroup);
    setSelectedAge(age);
    setCurrentStep('assessment');
  };

  const handleAssessmentComplete = (results: Record<string, number>) => {
    console.log('Assessment Results:', results);
    setAssessmentResults(results);
    setCurrentStep('analysis');
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
    if (currentStep === 'analysis' || currentStep === 'matching' || currentStep === 'consultation') {
      // 분석/매칭/상담 단계에서는 처음부터 다시 시작
      setCurrentStep('age-select');
      setSelectedAgeGroup(null);
      setSelectedAge(0);
      setAssessmentResults({});
      setAnalysisResult("");
      setSelectedExpert(null);
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

  if (currentStep === 'age-select') {
    return <AgeSelector onAgeGroupSelect={handleAgeGroupSelect} />;
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