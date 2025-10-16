import React, { useState } from 'react';
import { DefenseMechanismTest } from '@/components/assessment/DefenseMechanismTest';
import { DefenseMechanismResult } from '@/components/assessment/DefenseMechanismResult';

const DefenseMechanismTestPage = () => {
  const [result, setResult] = useState<any>(null);

  const handleComplete = (testResult: any) => {
    setResult(testResult);
  };

  if (result) {
    return <DefenseMechanismResult result={result} />;
  }

  return <DefenseMechanismTest onComplete={handleComplete} />;
};

export default DefenseMechanismTestPage;
