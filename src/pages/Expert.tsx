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
        <link rel="canonical" href="https://aihpro.app/expert" />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
          <ExpertList />
        </div>
      </div>
    </>
  );
};

export default Expert;
