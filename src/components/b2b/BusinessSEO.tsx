import { Helmet } from 'react-helmet-async';
import ogBusiness from '@/assets/og-business.jpg';

interface BusinessSEOProps {
  title: string;        // Naver: 40자 이내 권장
  description: string;  // Naver: 80자 이내 권장
  path: string;         // e.g. "/business" or "/b2b-jobcoach"
}

/**
 * B2B 페이지 공통 SEO + Open Graph + Twitter Card.
 * - aihpro.app 도메인 표준
 * - 공통 OG 이미지(/src/assets/og-business.jpg)
 * - JSON-LD Organization 스키마
 */
export default function BusinessSEO({ title, description, path }: BusinessSEOProps) {
  const canonical = `https://aihpro.app${path}`;
  const ogUrl = `https://aihpro.app${ogBusiness}`; // 빌드 후 해시 path

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AIHPRO Business',
    url: canonical,
    logo: 'https://aihpro.app/favicon.ico',
    description,
    sameAs: ['https://aihpro.app'],
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogUrl} />
      <meta property="og:site_name" content="AIHPRO" />
      <meta property="og:locale" content="ko_KR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogUrl} />

      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
