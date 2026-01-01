import React, { useState, useEffect } from 'react';
import { CommunicationStyleForm } from '@/components/assessment/CommunicationStyleForm';
import { RelationshipStyleResult } from '@/components/assessment/RelationshipStyleResult';
import { useNavigate } from 'react-router-dom';
import { useGuestSession } from '@/hooks/useGuestSession';
import SignupPromptModal from '@/components/guest/SignupPromptModal';

const STORAGE_KEY = 'communicationStyleTestResult';

const CommunicationStyleTest = () => {
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
      saveGuestResult('communication_style', '의사소통 유형 검사', testResult);
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
          currentResult={{ testTitle: '의사소통 유형 검사' }}
        />
      </>
    );
  }

  return <CommunicationStyleForm onComplete={handleComplete} onBack={handleBack} />;
};

export default CommunicationStyleTest;