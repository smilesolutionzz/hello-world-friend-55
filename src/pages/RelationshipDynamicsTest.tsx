import { useState } from "react";
import RelationshipDynamicsForm from "@/components/assessment/RelationshipDynamicsForm";
import RelationshipDynamicsResult from "@/components/assessment/RelationshipDynamicsResult";
import { useNavigate } from "react-router-dom";
import { useGuestSession } from "@/hooks/useGuestSession";
import SignupPromptModal from "@/components/guest/SignupPromptModal";

const RelationshipDynamicsTest = () => {
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
      onBack={() => navigate(-1)} 
    />
  );
};

export default RelationshipDynamicsTest;
