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
    // 결과 화면에서는 폼으로, 폼에서는 assessment 페이지로
    if (result) {
      setResult(null);
    } else {
      navigate('/assessment');
    }
  };

  if (result) {
    return <RelationshipStyleResult result={result} onBack={handleBack} />;
  }

  return <RelationshipStyleForm onComplete={handleComplete} onBack={handleBack} />;
};

export default RelationshipStyleTest;