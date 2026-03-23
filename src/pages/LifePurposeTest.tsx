import { useState } from "react";
import LifePurposeTestForm from "@/components/assessment/LifePurposeTestForm";
import LifePurposeTestResult from "@/components/assessment/LifePurposeTestResult";
import { useNavigate } from "react-router-dom";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";

const LifePurposeTestInner = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);

  if (results) {
    return <LifePurposeTestResult results={results} onBack={() => setResults(null)} />;
  }

  return (
    <LifePurposeTestForm 
      onComplete={(res) => setResults(res)} 
      onBack={() => navigate('/assessment')} 
    />
  );
};

const LifePurposeTest = () => (
  <SubscriptionGuard consumeAt="result" featureName="삶의 의미 및 목적 탐색 검사" trialKey="PREMIUM_ASSESSMENT">
    <LifePurposeTestInner />
  </SubscriptionGuard>
);

export default LifePurposeTest;
