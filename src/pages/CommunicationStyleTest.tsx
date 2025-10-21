import React, { useState } from 'react';
import { CommunicationStyleForm } from '@/components/assessment/CommunicationStyleForm';
import { RelationshipStyleResult } from '@/components/assessment/RelationshipStyleResult';
import { useNavigate } from 'react-router-dom';

const CommunicationStyleTest = () => {
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

  return <CommunicationStyleForm onComplete={handleComplete} onBack={handleBack} />;
};

export default CommunicationStyleTest;