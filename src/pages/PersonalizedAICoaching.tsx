import React from 'react';
import ComingSoonWrapper from '@/components/ComingSoonWrapper';
import SEOHead from '@/components/common/SEOHead';

const PersonalizedAICoaching = () => {
  return (
    <>
      <SEOHead 
        title="개인 맞춤 AI 코칭 - AIHumanPro | 준비 중"
        description="개인의 생활 패턴을 분석하여 맞춤형 코칭을 제공하는 AI 서비스를 개발 중입니다. 2025년 11월 출시 예정."
        keywords="AI코칭,맞춤코칭,생활패턴분석,개인화서비스"
        canonicalUrl="https://aihpro.app/personalized-ai-coaching"
      />
      <ComingSoonWrapper 
        title="개인 맞춤 AI 코칭"
        description="개인의 생활 패턴을 분석하여 맞춤형 코칭을 제공하는 AI 서비스를 개발 중입니다."
        expectedDate="2025년 11월"
        additionalInfo="매분기 트렌드에 맞는 새로운 AI 기능을 공개 테스트합니다. 매분기 업데이트되는 기능들을 기대하세요!"
      />
    </>
  );
};

export default PersonalizedAICoaching;