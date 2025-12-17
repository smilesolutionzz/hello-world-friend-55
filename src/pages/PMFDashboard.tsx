import React from 'react';
import PMFMetricsDashboard from '@/components/pmf/PMFMetricsDashboard';
import SEOHead from '@/components/common/SEOHead';

const PMFDashboard = () => {
  return (
    <>
      <SEOHead 
        title="PMF 대시보드 - AIHumanPro"
        description="Product-Market Fit 핵심 지표 대시보드"
        noIndex={true}
      />
      <PMFMetricsDashboard />
    </>
  );
};

export default PMFDashboard;
