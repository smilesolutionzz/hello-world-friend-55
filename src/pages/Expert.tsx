import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ExpertList } from '@/components/expert/ExpertList';

const Expert = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "전문가 상담 서비스",
    "provider": {
      "@type": "Organization",
      "name": "AIHumanPro"
    },
    "serviceType": "전문가 심리상담 및 발달평가",
    "areaServed": "KR"
  };

  return (
    <>
      <Helmet>
        <title>전문가 목록 - AIHumanPro | 검증된 전문가 상담</title>
        <meta name="description" content="검증된 전문가들이 제공하는 심리상담, 발달평가, 언어치료 서비스. 경력과 전문성을 갖춘 전문가와 함께하세요." />
        <meta name="keywords" content="전문가 상담, 심리상담사, 발달전문가, 언어치료사, 온라인 상담" />
        <link rel="canonical" href="https://aihpro.com/expert" />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            전문 에이전트와 함께하는
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            검증된 전문가들이 당신의 성장과 발달을 지원합니다
          </p>
        </div>

        {/* Expert List Component */}
        <ExpertList />
      </div>
    </div>
    </>
  );
};

export default Expert;