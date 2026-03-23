import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StressTestForm from '@/components/assessment/StressTestForm';
import StressTestResult from '@/components/assessment/StressTestResult';
import { useGuestSession } from '@/hooks/useGuestSession';
import SignupPromptModal from '@/components/guest/SignupPromptModal';
import { SubscriptionGuard } from '@/components/subscription/SubscriptionGuard';

const STORAGE_KEY = 'stressTestResult';

const StressTestInner = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [showForm, setShowForm] = useState(true);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const { isGuest, saveGuestResult, guestResults } = useGuestSession();

  useEffect(() => {
    const savedResult = sessionStorage.getItem(STORAGE_KEY);
    if (savedResult) {
      try {
        const parsed = JSON.parse(savedResult);
        setResult(parsed);
        setShowForm(false);
      } catch (e) {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const handleComplete = (testResult: any) => {
    setResult(testResult);
    setShowForm(false);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(testResult));
    if (isGuest) {
      saveGuestResult('stress', '스트레스 검사', testResult);
      setShowSignupPrompt(true);
    }
  };

  const handleBack = () => {
    if (result) {
      setResult(null);
      setShowForm(true);
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      navigate('/assessment');
    }
  };

  const handleRestart = () => {
    setResult(null);
    setShowForm(true);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  if (result && !showForm) {
    return (
      <>
        <StressTestResult result={result} onRestart={handleRestart} onBack={handleBack} />
        <SignupPromptModal 
          open={showSignupPrompt} 
          onClose={() => setShowSignupPrompt(false)}
          pendingResults={guestResults}
          currentResult={{ testTitle: '스트레스 검사' }}
        />
      </>
    );
  }

  return <StressTestForm onComplete={handleComplete} onBack={handleBack} />;
};

const StressTest = () => (
  <SubscriptionGuard consumeAt="result" featureName="스트레스 검사" trialKey="STRESS_INDEX">
    <StressTestInner />
  </SubscriptionGuard>
);

export default StressTest;
