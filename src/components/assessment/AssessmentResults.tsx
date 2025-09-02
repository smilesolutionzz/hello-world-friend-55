import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";

// 기존 결과 컴포넌트들 import
import InfantAssessmentResult from "./InfantAssessmentResult";
import ChildAssessmentResult from "./ChildAssessmentResult";
import AdultAssessmentResult from "./AdultAssessmentResult";
import LanguageTestResult from "./LanguageTestResult";
import PanicTestResult from "./PanicTestResult";
import DepressionTestResult from "./DepressionTestResult";
import AdhdTestResult from "./AdhdTestResult";
import StressTestResult from "./StressTestResult";
import BigFiveTestResult from "./BigFiveTestResult";
import AttachmentStyleResult from "./AttachmentStyleResult";
import CareerInterestResult from "./CareerInterestResult";
import SelfEsteemTestResult from "./SelfEsteemTestResult";

type TestType = 'psychological' | 'language' | 'panic' | 'depression' | 'adhd' | 'stress' | 'bigfive' | 'attachment' | 'career' | 'selfesteem' | 'dream' | 'saju';

interface AssessmentState {
  step: 'selector' | 'flow' | 'results';
  testType: TestType | null;
  ageGroup: 'infant' | 'child' | 'adult' | null;
  age: number;
  results: any;
}

interface AssessmentResultsProps {
  testType: TestType;
  results: any;
  onRestart: () => void;
  onBackToSelector: () => void;
  state: AssessmentState;
}

export const AssessmentResults = ({ testType, results, onRestart, onBackToSelector, state }: AssessmentResultsProps) => {
  
  const renderResultComponent = () => {
    switch (testType) {
      case 'psychological':
        if (state.ageGroup === 'infant') {
          return <InfantAssessmentResult results={results} onBack={onBackToSelector} />;
        } else if (state.ageGroup === 'child') {
          return <ChildAssessmentResult results={results} onBack={onBackToSelector} />;
        } else {
          return <AdultAssessmentResult results={results} onBack={onBackToSelector} />;
        }
      
      case 'language':
        return <LanguageTestResult results={results} onBack={onBackToSelector} />;
      
      case 'panic':
        return <PanicTestResult results={results} onBack={onBackToSelector} />;
      
      case 'depression':
        return <DepressionTestResult results={results} onBack={onBackToSelector} />;
      
      case 'adhd':
        return <AdhdTestResult results={results} onBack={onBackToSelector} />;
      
      case 'stress':
        return <StressTestResult result={results} onRestart={onRestart} />;
      
      case 'bigfive':
        return <BigFiveTestResult result={results} onRestart={onRestart} />;
      
      case 'attachment':
        return <AttachmentStyleResult result={results} onRestart={onRestart} />;
      
      case 'career':
        return <CareerInterestResult result={results} onRestart={onRestart} />;
      
      case 'selfesteem':
        return <SelfEsteemTestResult result={results} onRestart={onRestart} />;
      
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/20 to-blue-50/20">
            <div className="container mx-auto px-6 py-12">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">검사 완료</h2>
                <p className="text-muted-foreground mb-8">검사가 완료되었습니다.</p>
                
                <div className="flex gap-4 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={onRestart}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    다시 검사하기
                  </Button>
                  
                  <Button 
                    onClick={onBackToSelector}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    검사 목록으로
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return renderResultComponent();
};