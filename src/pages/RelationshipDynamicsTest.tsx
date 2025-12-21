import { useState } from "react";
import RelationshipDynamicsForm from "@/components/assessment/RelationshipDynamicsForm";
import RelationshipDynamicsResult from "@/components/assessment/RelationshipDynamicsResult";
import { useNavigate } from "react-router-dom";

const RelationshipDynamicsTest = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);

  if (results) {
    return <RelationshipDynamicsResult results={results} onBack={() => setResults(null)} />;
  }

  return (
    <RelationshipDynamicsForm 
      onComplete={(res) => setResults(res)} 
      onBack={() => navigate(-1)} 
    />
  );
};

export default RelationshipDynamicsTest;
