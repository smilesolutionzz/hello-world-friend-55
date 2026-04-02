import React, { useState, useEffect } from 'react';
import { AttachmentStyleDeepTest } from '@/components/assessment/AttachmentStyleDeepTest';
import AttachmentStyleDeepResult from '@/components/assessment/AttachmentStyleDeepResult';
import { useNavigate } from 'react-router-dom';
import { useGuestSession } from '@/hooks/useGuestSession';
import SignupPromptModal from '@/components/guest/SignupPromptModal';
import { SubscriptionGuard } from '@/components/subscription/SubscriptionGuard';
import { ResultPaywall } from '@/components/subscription/ResultPaywall';
import { useTranslation } from '@/i18n';

const STORAGE_KEY = 'attachmentStyleTestResult';

const AttachmentStyleTestInner = () => {
  const [result, setResult] = useState<any>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const navigate = useNavigate();
  const { isGuest, saveGuestResult, guestResults } = useGuestSession();
  const { t } = useTranslation();

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
      saveGuestResult('attachment_style', t.testPages.attachmentStyle, testResult);
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
        <AttachmentStyleDeepResult result={result} onBack={handleBack} />
        <SignupPromptModal 
          open={showSignupPrompt} 
          onClose={() => setShowSignupPrompt(false)}
          pendingResults={guestResults}
          currentResult={{ testTitle: t.testPages.attachmentStyle }}
        />
      </>
    );
  }

  return <AttachmentStyleDeepTest onComplete={handleComplete} onBack={handleBack} />;
};

const AttachmentStyleTestPage = () => {
  const { t } = useTranslation();
  return (
    <SubscriptionGuard consumeAt="result" featureName={t.testPages.attachmentStyle} trialKey="RELATIONSHIP_TYPE">
      <AttachmentStyleTestInner />
    </SubscriptionGuard>
  );
};

export default AttachmentStyleTestPage;
