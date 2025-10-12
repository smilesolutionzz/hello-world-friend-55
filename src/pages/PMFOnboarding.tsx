import React from 'react';
import PMFOnboardingFlow from '@/components/onboarding/PMFOnboardingFlow';
import SEOHead from '@/components/common/SEOHead';

const PMFOnboarding = () => {
  const handleComplete = (data: any) => {
    console.log('PMF 온보딩 완료:', data);
    // 온보딩 데이터는 PMFOnboardingFlow에서 localStorage에 저장됨
  };

  return (
    <>
      <SEOHead 
        title="시작하기 - AI하이라이트PRO | 맞춤형 케어 플랫폼 온보딩"
        description="AI하이라이트PRO와 함께 시작하세요. 간단한 설문으로 당신에게 딱 맞는 심리 케어 서비스를 추천해드립니다."
        keywords="온보딩,시작하기,맞춤추천,심리케어시작"
        canonicalUrl="https://aihpro.com/pmf-onboarding"
        noIndex={true}
      />
      <PMFOnboardingFlow onComplete={handleComplete} />
    </>
  );
};

export default PMFOnboarding;