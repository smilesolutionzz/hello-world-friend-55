import React from 'react';
import { AIHighlightDashboard } from '@/components/highlight/AIHighlightDashboard';
import SEOHead from '@/components/common/SEOHead';

const HighlightAI = () => {
  return (
    <>
      <SEOHead 
        title="AI 하이라이트 분석 - AI하이라이트PRO | 실시간 심리 상태 모니터링"
        description="AI 기반 실시간 심리 상태 분석 및 모니터링. 감정 패턴, 스트레스 수준, 행동 변화를 추적하고 맞춤형 케어를 제공합니다."
        keywords="AI분석,심리모니터링,감정분석,스트레스추적,AI케어"
        canonicalUrl="https://aihpro.com/highlight-ai"
      />
      <AIHighlightDashboard />
    </>
  );
};

export default HighlightAI;