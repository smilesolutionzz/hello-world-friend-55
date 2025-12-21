import { useState } from "react";
import EnergyFlowTestForm from "@/components/assessment/EnergyFlowTestForm";
import EnergyFlowTestResult from "@/components/assessment/EnergyFlowTestResult";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { useNavigate } from "react-router-dom";

const EnergyFlowTest = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);

  if (results) {
    return <EnergyFlowTestResult results={results} onBack={() => setResults(null)} />;
  }

  return (
    <>
      <UnifiedNavigation />
      <div className="pt-16">
        <EnergyFlowTestForm 
          onComplete={(res) => setResults(res)} 
          onBack={() => navigate(-1)} 
        />
      </div>
    </>
  );
};

export default EnergyFlowTest;
