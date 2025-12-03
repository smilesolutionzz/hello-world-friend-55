import React, { useState, useEffect } from 'react';
import { DefenseMechanismTest } from '@/components/assessment/DefenseMechanismTest';
import { DefenseMechanismResult } from '@/components/assessment/DefenseMechanismResult';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'defenseMechanismTestResult';

const DefenseMechanismTestPage = () => {
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
    return <DefenseMechanismResult result={result} onBack={handleBack} />;
  }

  return <DefenseMechanismTest onComplete={handleComplete} onBack={handleBack} />;
};

export default DefenseMechanismTestPage;
