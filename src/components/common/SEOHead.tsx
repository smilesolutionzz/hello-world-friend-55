import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  structuredData?: object;
  ogType?: string;
  author?: string;
}

const SEOHead = ({
  title = "AIHPRO - 전생애 통합 케어 플랫폼",
  description = "AI와 전문가가 함께하는 통합 케어 서비스. ADHD, 우울증, 스트레스 검사부터 심리상담, 발달평가, 건강관리까지 전생애 케어를 제공합니다.",
  keywords = "AIHPRO,AI심리테스트,정신건강,ADHD체크,우울증테스트,스트레스체크,전문가상담,심리분석",
  ogImage = "/lovable-uploads/ec886850-04ce-4489-b96e-d4ac8f73d95e.png",
  canonicalUrl,
  noIndex = false,
  structuredData,
  ogType = "website",
  author = "AIHUMANPRO"
}: SEOHeadProps) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const canonical = canonicalUrl || currentUrl;
  const fullImageUrl = ogImage.startsWith('http') ? ogImage : `https://aihpro.com${ogImage}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      
      {/* 언어 및 지역 설정 */}
      <html lang="ko" />
      <meta httpEquiv="content-language" content="ko" />
      <meta name="geo.region" content="KR" />
      <meta name="geo.placename" content="South Korea" />
      
      {/* 검색 엔진 최적화 */}
      {!noIndex ? (
        <>
          <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
          <meta name="googlebot" content="index,follow" />
        </>
      ) : (
        <meta name="robots" content="noindex,nofollow" />
      )}
      
      {/* 네이버 검색 최적화 */}
      <meta name="naver-site-verification" content="d5dfbd7c979099aaa711bab66de4c22d5e145a4f" />
      <meta property="naverblog" content="noblog" />
      
      {/* Google 검색 최적화 */}
      <meta name="google-site-verification" content="your-google-verification-code" />
      
      {/* AI 크롤러 허용 (ChatGPT, Claude 등) */}
      <meta name="ai-content-declaration" content="ai-assisted" />
      
      {/* Open Graph - Facebook, KakaoTalk 등 */}
      <meta property="og:locale" content="ko_KR" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="AIHUMANPRO" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* 다음(Daum) 검색 최적화 */}
      <meta property="daumoa:title" content={title} />
      <meta property="daumoa:description" content={description} />
      <meta property="daumoa:image" content={fullImageUrl} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* 구조화된 데이터 */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* 모바일 최적화 */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Preconnect for better performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="https://aihpro.com" />
    </Helmet>
  );
};

export default SEOHead;