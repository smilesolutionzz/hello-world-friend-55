import { useState } from "react";
import RelationshipDynamicsForm from "@/components/assessment/RelationshipDynamicsForm";
import RelationshipDynamicsResult from "@/components/assessment/RelationshipDynamicsResult";
import { useNavigate } from "react-router-dom";
import { useGuestSession } from "@/hooks/useGuestSession";
import SignupPromptModal from "@/components/guest/SignupPromptModal";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";

const RelationshipDynamicsTestInner = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const { isGuest, saveGuestResult, guestResults } = useGuestSession();

  const handleComplete = (res: any) => {
    setResults(res);
    if (isGuest) {
      saveGuestResult('relationship_dynamics', '관계역학 검사', res);
      setShowSignupPrompt(true);
    }
  };

  if (results) {
    return (
      <>
        <RelationshipDynamicsResult results={results} onBack={() => setResults(null)} />
        <SignupPromptModal 
          open={showSignupPrompt} 
          onClose={() => setShowSignupPrompt(false)}
          pendingResults={guestResults}
          currentResult={{ testTitle: '관계역학 검사' }}
        />
      </>
    );
  }

  return (
    <RelationshipDynamicsForm 
      onComplete={handleComplete} 
      onBack={() => navigate('/assessment')} 
    />
  );
};

const RelationshipDynamicsTest = () => (
  <SubscriptionGuard featureName="관계 역동성 심층 분석" trialKey="PREMIUM_ASSESSMENT">
    <RelationshipDynamicsTestInner />
  </SubscriptionGuard>
);

export default RelationshipDynamicsTest;
