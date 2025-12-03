import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StressTestForm from '@/components/assessment/StressTestForm';
import StressTestResult from '@/components/assessment/StressTestResult';

const StressTest = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [showForm, setShowForm] = useState(true);

  const handleComplete = (testResult: any) => {
    setResult(testResult);
    setShowForm(false);
  };

  const handleBack = () => {
    // 결과 화면에서는 폼으로, 폼에서는 assessment 페이지로
    if (result) {
      setResult(null);
      setShowForm(true);
    } else {
      navigate('/assessment');
    }
  };

  const handleRestart = () => {
    setResult(null);
    setShowForm(true);
  };

  if (result && !showForm) {
    return <StressTestResult result={result} onRestart={handleRestart} onBack={handleBack} />;
  }

  return <StressTestForm onComplete={handleComplete} onBack={handleBack} />;
};

export default StressTest;