import { FocusPackage } from '@/components/assessment/FocusPackage';
import SEOHead from '@/components/common/SEOHead';

export default function FocusPackagePage() {
  return (
    <>
      <SEOHead 
        title="집중력 검사 패키지 - AI하이라이트PRO | ADHD 및 주의력 집중 분석"
        description="AI 기반 ADHD 검사, 주의집중력 자가체크, 5차원 성격 분석으로 집중력 향상 전략을 제공합니다. 3분만에 확인하는 우리 아이 집중력."
        keywords="ADHD검사,주의력검사,집중력검사,성격분석,스트레스검사,집중력향상"
        canonicalUrl="https://aihpro.com/focus-package"
      />
      <FocusPackage />
    </>
  );
}