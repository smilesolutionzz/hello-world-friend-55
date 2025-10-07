import React from 'react';
import { Helmet } from 'react-helmet-async';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { ExpertApplicationForm } from '@/components/expert/ExpertApplicationForm';
import AuthenticationGuard from '@/components/observation/AuthenticationGuard';

const ExpertApplicationPage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": "전문가 모집",
    "description": "AI하이라이트PRO와 함께 전문가로 활동하세요",
    "hiringOrganization": {
      "@type": "Organization",
      "name": "AI하이라이트PRO"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "KR"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>전문가 신청 - AI하이라이트PRO | 전문가 모집</title>
        <meta name="description" content="AI하이라이트PRO 전문가로 지원하세요. 심리상담, 발달평가, 언어치료 등 전문 분야에서 활동하며 수익을 창출하세요." />
        <meta name="keywords" content="전문가 신청, 전문가 모집, 심리상담사 모집, 발달전문가 채용" />
        <link rel="canonical" href="https://aihpro.com/expert-application" />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      <AuthenticationGuard fallbackMessage="전문가 신청을 위해서는 로그인이 필요합니다.">
        <div className="container mx-auto py-8">
          <ExpertApplicationForm />
        </div>
      </AuthenticationGuard>
    </div>
    </>
  );
};

export default ExpertApplicationPage;