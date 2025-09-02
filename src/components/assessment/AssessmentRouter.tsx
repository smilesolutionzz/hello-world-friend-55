import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AssessmentSelector } from "./AssessmentSelector";
import { AssessmentFlow } from "./AssessmentFlow";
import { AssessmentResults } from "./AssessmentResults";

type AssessmentStep = 'selector' | 'flow' | 'results';
type TestType = 'psychological' | 'language' | 'panic' | 'depression' | 'adhd' | 'stress' | 'bigfive' | 'attachment' | 'career' | 'selfesteem' | 'dream' | 'saju';

export interface AssessmentState {
  step: AssessmentStep;
  testType: TestType | null;
  ageGroup: 'infant' | 'child' | 'adult' | null;
  age: number;
  results: any;
}

export const AssessmentRouter = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [state, setState] = useState<AssessmentState>({
    step: 'selector',
    testType: null,
    ageGroup: null,
    age: 0,
    results: null
  });

  // URL 파라미터 처리
  useEffect(() => {
    const urlTestType = searchParams.get('type');
    if (urlTestType === 'fun') {
      navigate('/fun-tests', { replace: true });
      return;
    }
    
    if (urlTestType && isValidTestType(urlTestType)) {
      setState(prev => ({
        ...prev,
        testType: urlTestType as TestType,
        step: 'flow'
      }));
    }
  }, [searchParams, navigate]);

  const isValidTestType = (type: string): boolean => {
    const validTypes = ['psychological', 'language', 'panic', 'depression', 'adhd', 'stress', 'bigfive', 'attachment', 'career', 'selfesteem', 'dream', 'saju'];
    return validTypes.includes(type);
  };

  const handleTestSelect = (testType: TestType) => {
    setState(prev => ({
      ...prev,
      testType,
      step: 'flow'
    }));
  };

  const handleFlowComplete = (results: any) => {
    setState(prev => ({
      ...prev,
      results,
      step: 'results'
    }));
  };

  const handleBackToSelector = () => {
    setState({
      step: 'selector',
      testType: null,
      ageGroup: null,
      age: 0,
      results: null
    });
  };

  const handleRestartTest = () => {
    setState(prev => ({
      ...prev,
      step: 'flow',
      results: null
    }));
  };

  // 단계별 렌더링
  switch (state.step) {
    case 'selector':
      return (
        <AssessmentSelector 
          onTestSelect={handleTestSelect}
        />
      );
    
    case 'flow':
      return (
        <AssessmentFlow
          testType={state.testType!}
          onComplete={handleFlowComplete}
          onBack={handleBackToSelector}
          state={state}
          setState={setState}
        />
      );
    
    case 'results':
      return (
        <AssessmentResults
          testType={state.testType!}
          results={state.results}
          onRestart={handleRestartTest}
          onBackToSelector={handleBackToSelector}
          state={state}
        />
      );
    
    default:
      return (
        <AssessmentSelector 
          onTestSelect={handleTestSelect}
        />
      );
  }
};