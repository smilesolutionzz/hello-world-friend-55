import { useState } from "react";
import AdvancedAdhdForm from "@/components/assessment/AdvancedAdhdForm";
import AdvancedAdhdResult from "@/components/assessment/AdvancedAdhdResult";

const AdvancedAdhdTest = () => {
  const [results, setResults] = useState<any>(null);

  const handleComplete = (testResults: any) => {
    setResults(testResults);
  };

  const handleBack = () => {
    window.history.back();
  };

  if (results) {
    return <AdvancedAdhdResult results={results} />;
  }

  return <AdvancedAdhdForm onComplete={handleComplete} onBack={handleBack} />;
};

export default AdvancedAdhdTest;
