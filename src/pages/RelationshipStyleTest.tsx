import React, { useState } from 'react';
import { RelationshipStyleForm } from '@/components/assessment/RelationshipStyleForm';
import { RelationshipStyleResult } from '@/components/assessment/RelationshipStyleResult';
import { useNavigate } from 'react-router-dom';

const RelationshipStyleTest = () => {
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();

  const handleComplete = (testResult: any) => {
    setResult(testResult);
  };

  const handleBack = () => {
    navigate('/assessment');
  };

  if (result) {
    return <RelationshipStyleResult result={result} onBack={handleBack} />;
  }

  return <RelationshipStyleForm onComplete={handleComplete} onBack={handleBack} />;
};

export default RelationshipStyleTest;