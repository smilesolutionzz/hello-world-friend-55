import { useState } from "react";
import RelationshipDynamicsForm from "@/components/assessment/RelationshipDynamicsForm";
import RelationshipDynamicsResult from "@/components/assessment/RelationshipDynamicsResult";
import { useNavigate } from "react-router-dom";
import { useGuestSession } from "@/hooks/useGuestSession";
import SignupPromptModal from "@/components/guest/SignupPromptModal";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";
import { ResultPaywall } from "@/components/subscription/ResultPaywall";
import { useTranslation } from "@/i18n";

const RelationshipDynamicsTestInner = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const { isGuest, saveGuestResult, guestResults } = useGuestSession();
  const { t } = useTranslation();

  const handleComplete = (res: any) => {
    setResults(res);
    if (isGuest) {
      saveGuestResult('relationship_dynamics', t.testPages.relationshipDynamics, res);
      setShowSignupPrompt(true);
    }
  };

  if (results) {
    return (
      <ResultPaywall>
        <RelationshipDynamicsResult results={results} onBack={() => setResults(null)} />
        <SignupPromptModal
          open={showSignupPrompt} 
          onClose={() => setShowSignupPrompt(false)}
          pendingResults={guestResults}
          currentResult={{ testTitle: t.testPages.relationshipDynamics }}
        />
      </ResultPaywall>
    );
  }

  return (
    <RelationshipDynamicsForm
      onComplete={handleComplete} 
      onBack={() => navigate('/assessment')} 
    />
  );
};

const RelationshipDynamicsTest = () => {
  const { t } = useTranslation();
  return (
    <SubscriptionGuard consumeAt="result" featureName={t.testPages.relationshipDynamics} trialKey="PREMIUM_ASSESSMENT">
      <RelationshipDynamicsTestInner />
    </SubscriptionGuard>
  );
};

export default RelationshipDynamicsTest;
