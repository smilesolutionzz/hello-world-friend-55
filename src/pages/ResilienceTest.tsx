import { useState } from "react";
import ResilienceTestForm from "@/components/assessment/ResilienceTestForm";
import ResilienceTestResult from "@/components/assessment/ResilienceTestResult";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/common/SEOHead";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "MedicalTest",
  "name": "회복탄력성 검사",
  "description": "직장인을 위한 38문항 회복탄력성 검사. 스트레스 회복력, 적응 유연성, 정서적 안정성, 사회적 지지망, 목적의식을 분석합니다.",
  "medicineSystem": "AI 기반 심리 분석"
};

const ResilienceTestInner = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);

  if (results) {
    return <ResilienceTestResult results={results} onBack={() => setResults(null)} />;
  }

  return (
    <>
      <SEOHead 
        title="회복탄력성 검사 - AIHumanPro | 직장인 스트레스 회복력 분석"
        description="직장인을 위한 AI 기반 회복탄력성 검사. 스트레스 회복력, 적응 유연성, 정서적 안정성, 사회적 지지망, 성장 마인드를 5개 영역 38문항으로 분석합니다."
        keywords="회복탄력성검사,레질리언스,스트레스회복,직장인심리검사,적응력검사,정서안정성"
        canonicalUrl="https://aihpro.app/assessment/resilience"
        structuredData={structuredData}
      />
      <ResilienceTestForm 
        onComplete={(res) => setResults(res)} 
        onBack={() => navigate('/assessment')} 
      />
    </>
  );
};

const ResilienceTest = () => (
  <SubscriptionGuard featureName="회복탄력성 검사" trialKey="PSYCHOLOGICAL_TEST">
    <ResilienceTestInner />
  </SubscriptionGuard>
);

export default ResilienceTest;
