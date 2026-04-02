import { useState } from "react";
import ResilienceTestForm from "@/components/assessment/ResilienceTestForm";
import ResilienceTestResult from "@/components/assessment/ResilienceTestResult";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/common/SEOHead";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";
import { useTranslation } from "@/i18n";

const ResilienceTestInner = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);
  const { t } = useTranslation();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalTest",
    "name": t.resilienceTest.structuredName,
    "description": t.resilienceTest.structuredDesc,
    "medicineSystem": "AI"
  };

  if (results) {
    return <ResultPaywall><ResilienceTestResult results={results} onBack={() => setResults(null)} /></ResultPaywall>;
  }

  return (
    <>
      <SEOHead 
        title={t.resilienceTest.seoTitle}
        description={t.resilienceTest.seoDesc}
        keywords="resilience,stress recovery,workplace psychology"
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

const ResilienceTest = () => {
  const { t } = useTranslation();
  return (
    <SubscriptionGuard consumeAt="result" featureName={t.testPages.resilience} trialKey="PSYCHOLOGICAL_TEST">
      <ResilienceTestInner />
    </SubscriptionGuard>
  );
};

export default ResilienceTest;
