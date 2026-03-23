import React, { useState, useEffect } from 'react';
import { DefenseMechanismTest } from '@/components/assessment/DefenseMechanismTest';
import { DefenseMechanismResult } from '@/components/assessment/DefenseMechanismResult';
import { useNavigate } from 'react-router-dom';
import { useGuestSession } from '@/hooks/useGuestSession';
import SignupPromptModal from '@/components/guest/SignupPromptModal';
import { SubscriptionGuard } from '@/components/subscription/SubscriptionGuard';

const STORAGE_KEY = 'defenseMechanismTestResult';

const DefenseMechanismTestInner = () => {
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
      saveGuestResult('defense_mechanism', '방어기제 검사', testResult);
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
        <DefenseMechanismResult result={result} onBack={handleBack} />
        <SignupPromptModal 
          open={showSignupPrompt} 
          onClose={() => setShowSignupPrompt(false)}
          pendingResults={guestResults}
          currentResult={{ testTitle: '방어기제 검사' }}
        />
      </>
    );
  }

  return <DefenseMechanismTest onComplete={handleComplete} onBack={handleBack} />;
};

const DefenseMechanismTestPage = () => (
  <SubscriptionGuard consumeAt="result" featureName="방어기제 검사" trialKey="DEFENSE_MECHANISM">
    <DefenseMechanismTestInner />
  </SubscriptionGuard>
);

export default DefenseMechanismTestPage;
