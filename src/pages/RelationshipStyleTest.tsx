import React, { useState, useEffect } from 'react';
import { RelationshipStyleForm } from '@/components/assessment/RelationshipStyleForm';
import { RelationshipStyleResult } from '@/components/assessment/RelationshipStyleResult';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'relationshipStyleTestResult';

const RelationshipStyleTest = () => {
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();

  // 페이지 로드 시 저장된 결과 복원
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

  return <RelationshipStyleForm onComplete={handleComplete} onBack={handleBack} />;
};

export default RelationshipStyleTest;