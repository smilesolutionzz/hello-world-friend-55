import NeedsBasedOnboarding from '@/components/onboarding/NeedsBasedOnboarding';
import SEOHead from '@/components/common/SEOHead';

export default function NeedsAssessment() {
  return (
    <>
      <SEOHead 
        title="맞춤 니즈 분석 - AI하이라이트PRO | 개인화된 심리검사 추천"
        description="당신에게 꼭 필요한 심리검사를 AI가 추천합니다. 개인의 상황과 고민에 맞춘 맞춤형 검사 패키지로 효과적인 솔루션을 찾아보세요."
        keywords="맞춤검사,심리검사추천,개인화분석,AI추천,니즈분석"
        canonicalUrl="https://aihpro.com/needs-assessment"
      />
      <NeedsBasedOnboarding />
    </>
  );
}