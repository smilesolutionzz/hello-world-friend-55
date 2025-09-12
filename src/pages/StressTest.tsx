import React, { useState } from 'react';
import StressTestForm from '@/components/assessment/StressTestForm';
import StressTestResult from '@/components/assessment/StressTestResult';

const StressTest = () => {
  const [result, setResult] = useState<any>(null);

  const handleComplete = (testResult: any) => {
    setResult(testResult);
  };

  const handleBack = () => {
    setResult(null);
  };

  if (result) {
    return <StressTestResult result={result} onRestart={handleBack} />;
  }

  return <StressTestForm onComplete={handleComplete} onBack={() => window.history.back()} />;
};

export default StressTest;