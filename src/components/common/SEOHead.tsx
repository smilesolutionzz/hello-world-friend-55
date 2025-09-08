import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

const SEOHead = ({
  title = "AI하이라이트PRO - AI 심리검사 및 정신건강 상담 플랫폼",
  description = "3분만에 확인하는 우리 가족 마음 건강. ADHD, 우울증, 스트레스 검사부터 전문가 상담까지, AI와 전문가가 함께하는 종합 심리검사 플랫폼입니다.",
  keywords = "AI심리검사,정신건강,ADHD검사,우울증테스트,스트레스검사,전문가상담,심리분석",
  ogImage = "/lovable-uploads/ec886850-04ce-4489-b96e-d4ac8f73d95e.png",
  canonicalUrl,
  noIndex = false
}: SEOHeadProps) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const canonical = canonicalUrl || currentUrl;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="AI하이라이트PRO" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Preconnect for better performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  );
};

export default SEOHead;