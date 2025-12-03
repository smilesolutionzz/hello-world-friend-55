import React, { useState, useEffect } from 'react';
import { CommunicationStyleForm } from '@/components/assessment/CommunicationStyleForm';
import { RelationshipStyleResult } from '@/components/assessment/RelationshipStyleResult';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'communicationStyleTestResult';

const CommunicationStyleTest = () => {
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
    return <RelationshipStyleResult result={result} onBack={handleBack} />;
  }

  return <CommunicationStyleForm onComplete={handleComplete} onBack={handleBack} />;
};

export default CommunicationStyleTest;