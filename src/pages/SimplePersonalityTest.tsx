import React, { useState } from 'react';
import { SimplePersonalityForm } from '@/components/assessment/SimplePersonalityForm';
import SimplePersonalityResult from '@/components/assessment/SimplePersonalityResult';

const SimplePersonalityTest = () => {
  const [result, setResult] = useState<any>(null);

  const handleComplete = (testResult: any) => {
    setResult(testResult);
  };

  const handleBack = () => {
    setResult(null);
  };

  if (result) {
    return <SimplePersonalityResult result={result} />;
  }

  return <SimplePersonalityForm onComplete={handleComplete} onBack={() => window.history.back()} />;
};

export default SimplePersonalityTest;