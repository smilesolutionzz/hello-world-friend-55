import React, { useState } from 'react';
import { AttachmentStyleDeepTest } from '@/components/assessment/AttachmentStyleDeepTest';
import AttachmentStyleDeepResult from '@/components/assessment/AttachmentStyleDeepResult';
import { useNavigate } from 'react-router-dom';

const AttachmentStyleTestPage = () => {
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();

  const handleComplete = (testResult: any) => {
    setResult(testResult);
  };

  const handleBack = () => {
    if (result) {
      setResult(null);
    } else {
      navigate('/assessment');
    }
  };

  if (result) {
    return <AttachmentStyleDeepResult result={result} onBack={handleBack} />;
  }

  return <AttachmentStyleDeepTest onComplete={handleComplete} onBack={handleBack} />;
};

export default AttachmentStyleTestPage;
