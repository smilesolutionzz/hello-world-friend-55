import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AgeSelector from "./AgeSelector";
import LegalSafetyNotice from "@/components/LegalSafetyNotice";

// 기존 컴포넌트들 import
import InfantAssessment from "./InfantAssessment";
import ChildAssessmentSimplified from "./ChildAssessmentSimplified";
import AdultAssessment from "./AdultAssessment";
import LanguageTestForm from "./LanguageTestForm";
import PanicTestForm from "./PanicTestForm";
import DepressionTestForm from "./DepressionTestForm";
import AdhdTestForm from "./AdhdTestForm";
import StressTestForm from "./StressTestForm";
import BigFiveTestForm from "./BigFiveTestForm";
import AttachmentStyleForm from "./AttachmentStyleForm";
import CareerInterestForm from "./CareerInterestForm";
import SelfEsteemTestForm from "./SelfEsteemTestForm";
import DreamInterpretation from "./DreamInterpretation";
import SajuAnalysis from "./SajuAnalysis";

type TestType = 'psychological' | 'language' | 'panic' | 'depression' | 'adhd' | 'stress' | 'bigfive' | 'attachment' | 'career' | 'selfesteem' | 'dream' | 'saju';
type FlowStep = 'legal' | 'age' | 'test';

interface AssessmentState {
  step: 'selector' | 'flow' | 'results';
  testType: TestType | null;
  ageGroup: 'infant' | 'child' | 'adult' | null;
  age: number;
  results: any;
}

interface AssessmentFlowProps {
  testType: TestType;
  onComplete: (results: any) => void;
  onBack: () => void;
  state: AssessmentState;
  setState: (state: AssessmentState | ((prev: AssessmentState) => AssessmentState)) => void;
}

export const AssessmentFlow = ({ testType, onComplete, onBack, state, setState }: AssessmentFlowProps) => {
  const [flowStep, setFlowStep] = useState<FlowStep>(() => {
    // 일부 테스트는 연령 선택 불필요
    if (['dream', 'saju', 'stress', 'bigfive', 'attachment', 'career', 'selfesteem'].includes(testType)) {
      return 'test';
    }
    return 'legal';
  });

  const handleLegalAccept = () => {
    setFlowStep('age');
  };

  const handleAgeSelect = (ageGroup: 'infant' | 'child' | 'adult', age: number) => {
    setState(prev => ({
      ...prev,
      ageGroup,
      age
    }));
    setFlowStep('test');
  };

  const handleBackNavigation = () => {
    if (flowStep === 'test' && !['dream', 'saju', 'stress', 'bigfive', 'attachment', 'career', 'selfesteem'].includes(testType)) {
      setFlowStep('age');
    } else if (flowStep === 'age') {
      setFlowStep('legal');
    } else {
      onBack();
    }
  };

  // 법적 고지사항 단계
  if (flowStep === 'legal') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/20 to-blue-50/20">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              뒤로가기
            </Button>
          </div>
          
          <LegalSafetyNotice onAccept={handleLegalAccept} testType={testType} />
        </div>
      </div>
    );
  }

  // 연령 선택 단계
  if (flowStep === 'age') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/20 to-blue-50/20">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={handleBackNavigation}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              뒤로가기
            </Button>
          </div>
          
          <AgeSelector 
            onAgeGroupSelect={handleAgeSelect}
            testType={testType as 'psychological' | 'language' | 'panic' | 'depression' | 'adhd'}
          />
        </div>
      </div>
    );
  }

  // 테스트 실행 단계
  const renderTestComponent = () => {
    switch (testType) {
      case 'psychological':
        if (state.ageGroup === 'infant') {
          return <InfantAssessment onComplete={onComplete} onBack={handleBackNavigation} age={state.age} />;
        } else if (state.ageGroup === 'child') {
          return <ChildAssessmentSimplified onComplete={onComplete} onBack={handleBackNavigation} age={state.age} />;
        } else {
          return <AdultAssessment onComplete={onComplete} onBack={handleBackNavigation} age={state.age} />;
        }
      
      case 'language':
        return <LanguageTestForm onComplete={onComplete} onBack={handleBackNavigation} ageGroup={state.ageGroup === 'adult' ? 'child' : state.ageGroup || 'infant'} age={state.age} />;
      
      case 'panic':
        return <PanicTestForm onComplete={onComplete} onBack={handleBackNavigation} />;
      
      case 'depression':
        return <DepressionTestForm onComplete={onComplete} onBack={handleBackNavigation} />;
      
      case 'adhd':
        return <AdhdTestForm onComplete={onComplete} onBack={handleBackNavigation} ageGroup={state.ageGroup === 'infant' ? 'child' : state.ageGroup || 'adult'} />;
      
      case 'stress':
        return <StressTestForm onComplete={onComplete} onBack={handleBackNavigation} />;
      
      case 'bigfive':
        return <BigFiveTestForm onComplete={onComplete} onBack={handleBackNavigation} />;
      
      case 'attachment':
        return <AttachmentStyleForm onComplete={onComplete} onBack={handleBackNavigation} />;
      
      case 'career':
        return <CareerInterestForm onComplete={onComplete} onBack={handleBackNavigation} />;
      
      case 'selfesteem':
        return <SelfEsteemTestForm onComplete={onComplete} onBack={handleBackNavigation} />;
      
      case 'dream':
        return <DreamInterpretation onBack={handleBackNavigation} />;
      
      case 'saju':
        return <SajuAnalysis onBack={handleBackNavigation} />;
      
      default:
        return <div>지원하지 않는 테스트입니다.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/20 to-blue-50/20">
      {renderTestComponent()}
    </div>
  );
};