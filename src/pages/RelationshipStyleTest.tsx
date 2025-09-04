import React, { useState } from 'react';
import { RelationshipStyleForm } from '@/components/assessment/RelationshipStyleForm';
import { RelationshipStyleResult } from '@/components/assessment/RelationshipStyleResult';

const RelationshipStyleTest = () => {
  const [result, setResult] = useState<any>(null);

  const handleComplete = (testResult: any) => {
    setResult(testResult);
  };

  if (result) {
    return <RelationshipStyleResult result={result} />;
  }

  return <RelationshipStyleForm onComplete={handleComplete} />;
};

export default RelationshipStyleTest;