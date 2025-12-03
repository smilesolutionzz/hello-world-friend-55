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
    // 결과 화면에서는 폼으로, 폼에서는 assessment 페이지로
    if (result) {
      setResult(null);
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
