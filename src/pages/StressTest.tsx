import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StressTestForm from '@/components/assessment/StressTestForm';
import StressTestResult from '@/components/assessment/StressTestResult';

const STORAGE_KEY = 'stressTestResult';

const StressTest = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [showForm, setShowForm] = useState(true);

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
    return <StressTestResult result={result} onRestart={handleRestart} onBack={handleBack} />;
  }

  return <StressTestForm onComplete={handleComplete} onBack={handleBack} />;
};

export default StressTest;