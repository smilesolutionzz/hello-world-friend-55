import { useState } from "react";
import EnergyFlowTestForm from "@/components/assessment/EnergyFlowTestForm";
import EnergyFlowTestResult from "@/components/assessment/EnergyFlowTestResult";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { useNavigate } from "react-router-dom";
import { useGuestSession } from "@/hooks/useGuestSession";
import SignupPromptModal from "@/components/guest/SignupPromptModal";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";

const EnergyFlowTestInner = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const { isGuest, saveGuestResult, guestResults } = useGuestSession();

  const handleComplete = (res: any) => {
    setResults(res);
    if (isGuest) {
      saveGuestResult('energy_flow', '에너지 흐름 검사', res);
      setShowSignupPrompt(true);
    }
  };

  if (results) {
    return (
      <>
        <EnergyFlowTestResult results={results} onBack={() => setResults(null)} />
        <SignupPromptModal 
          open={showSignupPrompt} 
          onClose={() => setShowSignupPrompt(false)}
          pendingResults={guestResults}
          currentResult={{ testTitle: '에너지 흐름 검사' }}
        />
      </>
    );
  }

  return (
    <>
      <UnifiedNavigation />
      <div className="pt-16">
        <EnergyFlowTestForm 
          onComplete={handleComplete} 
          onBack={() => navigate('/assessment')} 
        />
      </div>
    </>
  );
};

const EnergyFlowTest = () => (
  <SubscriptionGuard consumeAt="result" featureName="에너지 흐름 검사" trialKey="PSYCHOLOGICAL_TEST">
    <EnergyFlowTestInner />
  </SubscriptionGuard>
);

export default EnergyFlowTest;
