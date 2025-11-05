import React, { useState } from 'react';
import StressTestForm from '@/components/assessment/StressTestForm';
import StressTestResult from '@/components/assessment/StressTestResult';

const StressTest = () => {
  const [result, setResult] = useState<any>(null);
  const [showForm, setShowForm] = useState(true);

  const handleComplete = (testResult: any) => {
    setResult(testResult);
    setShowForm(false);
  };

  const handleBack = () => {
    setShowForm(true);
  };

  const handleRestart = () => {
    setResult(null);
    setShowForm(true);
  };

  if (result && !showForm) {
    return <StressTestResult result={result} onRestart={handleRestart} />;
  }

  return <StressTestForm onComplete={handleComplete} onBack={() => window.history.back()} />;
};

export default StressTest;