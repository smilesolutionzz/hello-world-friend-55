import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdvancedAdhdForm from "@/components/assessment/AdvancedAdhdForm";
import AdvancedAdhdResult from "@/components/assessment/AdvancedAdhdResult";
import { supabase } from "@/integrations/supabase/client";
import { useGuestSession } from "@/hooks/useGuestSession";
import SignupPromptModal from "@/components/guest/SignupPromptModal";

const AdvancedAdhdTest = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const { isGuest, saveGuestResult, guestResults } = useGuestSession();

  useEffect(() => {
    const savedResults = sessionStorage.getItem('adhdTestResults');
    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch (error) {
        console.error('결과 로드 실패:', error);
      }
    }
  }, []);

  const handleComplete = async (testResults: any) => {
    sessionStorage.setItem('adhdTestResults', JSON.stringify(testResults));
    setResults(testResults);

    if (isGuest) {
      saveGuestResult('adhd', 'ADHD 검사', testResults);
      setShowSignupPrompt(true);
      return;
    }

    try {
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user;
      
      if (currentUser) {
        await supabase
          .from('test_results')
          .insert({
            user_id: currentUser.id,
            test_type_id: 'adhd',
            scores: testResults as any
          });
        console.log('✅ ADHD 검사 결과 저장 완료');
      }
    } catch (error) {
      console.error('검사 결과 저장 중 오류:', error);
    }
  };

  const handleBack = () => {
    if (results) {
      sessionStorage.removeItem('adhdTestResults');
      setResults(null);
    } else {
      navigate('/assessment');
    }
  };

  const handleResetTest = () => {
    sessionStorage.removeItem('adhdTestResults');
    setResults(null);
  };

  if (results) {
    return (
      <>
        <AdvancedAdhdResult results={results} onBack={handleBack} onRestart={handleResetTest} />
        <SignupPromptModal 
          open={showSignupPrompt} 
          onClose={() => setShowSignupPrompt(false)}
          pendingResults={guestResults}
          currentResult={{ testTitle: 'ADHD 검사' }}
        />
      </>
    );
  }

  return <AdvancedAdhdForm onComplete={handleComplete} onBack={handleBack} />
};

export default AdvancedAdhdTest;
