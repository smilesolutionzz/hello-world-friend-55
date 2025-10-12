import React from 'react';
import { useLocation } from 'react-router-dom';
import FreeTrialResult from '@/components/assessment/FreeTrialResult';
import SEOHead from '@/components/common/SEOHead';

const FreeTrialResultPage = () => {
  const location = useLocation();
  const result = location.state?.testResult || {};

  return (
    <>
      <SEOHead 
        title="검사 결과 - AI하이라이트PRO | 심리검사 분석 리포트"
        description="AI 기반 심리검사 결과를 확인하고 전문가의 해석을 받아보세요. 맞춤형 개선 방안과 추천 서비스를 제공합니다."
        keywords="검사결과,심리분석리포트,AI분석,전문가해석"
        canonicalUrl="https://aihpro.com/free-trial-result"
        noIndex={true}
      />
      <FreeTrialResult result={result} />
    </>
  );
};

export default FreeTrialResultPage;