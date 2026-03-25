import React from 'react';
import { useLocation } from 'react-router-dom';
import FreeTrialResult from '@/components/assessment/FreeTrialResult';
import SEOHead from '@/components/common/SEOHead';
import { useLanguage } from '@/i18n/LanguageContext';

const FreeTrialResultPage = () => {
  const location = useLocation();
  const result = location.state?.testResult || {};
  const { isEnglish } = useLanguage();

  return (
    <>
      <SEOHead 
        title={isEnglish ? "Assessment Results - AIHumanPro" : "검사 결과 - AIHumanPro | 심리검사 분석 리포트"}
        description={isEnglish ? "View your AI-powered assessment results and get expert interpretation with personalized recommendations." : "AI 기반 심리검사 결과를 확인하고 전문가의 해석을 받아보세요. 맞춤형 개선 방안과 추천 서비스를 제공합니다."}
        keywords={isEnglish ? "assessment results,AI analysis,expert interpretation" : "검사결과,심리분석리포트,AI분석,전문가해석"}
        canonicalUrl="https://aihpro.app/free-trial-result"
        noIndex={true}
      />
      <FreeTrialResult result={result} />
    </>
  );
};

export default FreeTrialResultPage;
