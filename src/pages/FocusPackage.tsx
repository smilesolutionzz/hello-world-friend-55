import { FocusPackage } from '@/components/assessment/FocusPackage';
import SEOHead from '@/components/common/SEOHead';
import { useTranslation } from '@/i18n';

export default function FocusPackagePage() {
  const { t } = useTranslation();
  const fp = t.focusPackage;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalTest",
    "name": fp.structuredName,
    "description": fp.structuredDesc,
    "medicineSystem": "AI"
  };

  return (
    <>
      <SEOHead 
        title={fp.seoTitle}
        description={fp.seoDesc}
        keywords="ADHD,attention,focus,personality,stress"
        canonicalUrl="https://aihpro.app/focus-package"
        structuredData={structuredData}
      />
      <FocusPackage />
    </>
  );
}
