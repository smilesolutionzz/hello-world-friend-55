import React, { useState, useEffect } from 'react';
import { AttachmentStyleDeepTest } from '@/components/assessment/AttachmentStyleDeepTest';
import AttachmentStyleDeepResult from '@/components/assessment/AttachmentStyleDeepResult';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'attachmentStyleTestResult';

const AttachmentStyleTestPage = () => {
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();

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
    return <AttachmentStyleDeepResult result={result} onBack={handleBack} />;
  }

  return <AttachmentStyleDeepTest onComplete={handleComplete} onBack={handleBack} />;
};

export default AttachmentStyleTestPage;
