import { useState } from "react";
import LifePurposeTestForm from "@/components/assessment/LifePurposeTestForm";
import LifePurposeTestResult from "@/components/assessment/LifePurposeTestResult";
import { useNavigate } from "react-router-dom";

const LifePurposeTest = () => {
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

export default LifePurposeTest;
