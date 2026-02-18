import React, { useState, useEffect } from 'react';
import { RelationshipStyleForm } from '@/components/assessment/RelationshipStyleForm';
import { RelationshipStyleResult } from '@/components/assessment/RelationshipStyleResult';
import { useNavigate } from 'react-router-dom';
import { useGuestSession } from '@/hooks/useGuestSession';
import SignupPromptModal from '@/components/guest/SignupPromptModal';
import { SubscriptionGuard } from '@/components/subscription/SubscriptionGuard';

const STORAGE_KEY = 'relationshipStyleTestResult';

const RelationshipStyleTestInner = () => {
  const [result, setResult] = useState<any>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const navigate = useNavigate();
  const { isGuest, saveGuestResult, guestResults } = useGuestSession();

  useEffect(() => {
    const savedResult = sessionStorage.getItem(STORAGE_KEY);
    if (savedResult) {
      try {
        setResult(JSON.parse(savedResult));
      } catch (e) {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const handleComplete = (testResult: any) => {
    setResult(testResult);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(testResult));
    if (isGuest) {
      saveGuestResult('relationship_style', '관계유형 검사', testResult);
      setShowSignupPrompt(true);
    }
  };

  const handleBack = () => {
    if (result) {
      setResult(null);
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      navigate('/assessment');
    }
  };

  if (result) {
    return (
      <>
        <RelationshipStyleResult result={result} onBack={handleBack} />
        <SignupPromptModal 
          open={showSignupPrompt} 
          onClose={() => setShowSignupPrompt(false)}
          pendingResults={guestResults}
          currentResult={{ testTitle: '관계유형 검사' }}
        />
      </>
    );
  }

  return <RelationshipStyleForm onComplete={handleComplete} onBack={handleBack} />;
};

const RelationshipStyleTest = () => (
  <SubscriptionGuard featureName="관계유형 검사">
    <RelationshipStyleTestInner />
  </SubscriptionGuard>
);

export default RelationshipStyleTest;
