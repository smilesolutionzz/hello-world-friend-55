import React from 'react';
import ComingSoonWrapper from '@/components/ComingSoonWrapper';
import SEOHead from '@/components/common/SEOHead';
import { useTranslation } from '@/i18n';

const PersonalizedAICoaching = () => {
  const { t } = useTranslation();
  const p = t.personalizedCoaching;

  return (
    <>
      <SEOHead 
        title={p.seoTitle}
        description={p.seoDesc}
        keywords="AI coaching,personalized coaching,life pattern analysis"
        canonicalUrl="https://aihpro.app/personalized-ai-coaching"
      />
      <ComingSoonWrapper 
        title={p.title}
        description={p.description}
        expectedDate={p.expectedDate}
        additionalInfo={p.additionalInfo}
      />
    </>
  );
};

export default PersonalizedAICoaching;
