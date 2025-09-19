import React, { useState } from 'react';
import { CommunicationStyleForm } from '@/components/assessment/CommunicationStyleForm';
import { RelationshipStyleResult } from '@/components/assessment/RelationshipStyleResult';

const CommunicationStyleTest = () => {
  const [result, setResult] = useState<any>(null);

  const handleComplete = (testResult: any) => {
    setResult(testResult);
  };

  if (result) {
    return <RelationshipStyleResult result={result} />;
  }

  return <CommunicationStyleForm onComplete={handleComplete} />;
};

export default CommunicationStyleTest;