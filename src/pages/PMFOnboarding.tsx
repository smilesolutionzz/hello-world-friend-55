import React from 'react';
import PMFOnboardingFlow from '@/components/onboarding/PMFOnboardingFlow';

const PMFOnboarding = () => {
  const handleComplete = (data: any) => {
    console.log('PMF 온보딩 완료:', data);
    // 온보딩 데이터는 PMFOnboardingFlow에서 localStorage에 저장됨
  };

  return <PMFOnboardingFlow onComplete={handleComplete} />;
};

export default PMFOnboarding;