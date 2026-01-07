import { useState } from "react";
import PatternIQTestForm from "@/components/assessment/PatternIQTestForm";
import PatternIQTestResult from "@/components/assessment/PatternIQTestResult";
import { PatternIQResult } from "@/data/patternIQTestQuestions";
import { useNavigate } from "react-router-dom";
import { useGuestSession } from "@/hooks/useGuestSession";
import SignupPromptModal from "@/components/guest/SignupPromptModal";

const PatternIQTest = () => {
  const navigate = useNavigate();
  const { isGuest, saveGuestResult } = useGuestSession();
  const [result, setResult] = useState<PatternIQResult | null>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  const handleComplete = (res: PatternIQResult) => {
    setResult(res);
    
    // 게스트 결과 저장
    if (isGuest) {
      saveGuestResult('pattern-iq', '패턴 인지력 테스트', res, 'adult');
      setTimeout(() => {
        setShowSignupPrompt(true);
      }, 2000);
    }
  };

  const handleRestart = () => {
    setResult(null);
  };

  if (result) {
    return (
      <>
        <PatternIQTestResult 
          result={result} 
          onBack={() => navigate('/assessment')} 
          onRestart={handleRestart}
        />
        <SignupPromptModal
          open={showSignupPrompt}
          onClose={() => setShowSignupPrompt(false)}
          currentResult={{
            testTitle: "패턴 인지력 테스트",
            score: result.totalScore,
            level: result.cognitiveType
          }}
        />
      </>
    );
  }

  return (
    <PatternIQTestForm 
      onComplete={handleComplete} 
      onBack={() => navigate('/assessment')} 
    />
  );
};

export default PatternIQTest;
