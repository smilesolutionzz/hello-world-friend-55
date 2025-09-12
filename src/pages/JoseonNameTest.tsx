import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JoseonNameForm from '@/components/assessment/JoseonNameForm';
import FunTestResult from '@/components/assessment/FunTestResult';

const JoseonNameTest: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = (testResult: any) => {
    navigate('/fun-test-result', { 
      state: { 
        result: testResult, 
        testType: 'joseon_name' 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="container mx-auto py-8">
        <JoseonNameForm onComplete={handleComplete} />
      </div>
    </div>
  );
};

export default JoseonNameTest;