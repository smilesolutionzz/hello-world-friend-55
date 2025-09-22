import React from 'react';
import { useLocation } from 'react-router-dom';
import FreeTrialResult from '@/components/assessment/FreeTrialResult';

const FreeTrialResultPage = () => {
  const location = useLocation();
  const result = location.state?.testResult || {};

  return <FreeTrialResult result={result} />;
};

export default FreeTrialResultPage;