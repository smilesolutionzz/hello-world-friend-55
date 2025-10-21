import React, { useState } from 'react';
import { DefenseMechanismTest } from '@/components/assessment/DefenseMechanismTest';
import { DefenseMechanismResult } from '@/components/assessment/DefenseMechanismResult';
import { useNavigate } from 'react-router-dom';

const DefenseMechanismTestPage = () => {
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();

  const handleComplete = (testResult: any) => {
    setResult(testResult);
  };

  const handleBack = () => {
    navigate('/assessment');
  };

  if (result) {
    return <DefenseMechanismResult result={result} onBack={handleBack} />;
  }

  return <DefenseMechanismTest onComplete={handleComplete} onBack={handleBack} />;
};

export default DefenseMechanismTestPage;
