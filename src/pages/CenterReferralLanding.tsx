import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function CenterReferralLanding() {
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    if (slug) {
      try {
        localStorage.setItem('referrer_org_slug', slug);
        localStorage.setItem('referrer_captured_at', new Date().toISOString());
      } catch {
        // ignore
      }
    }
  }, [slug]);

  return (
    <div className="min-h-screen bg-white px-6 py-16 md:py-24">
      <Helmet>
        <title>{slug ? `${slug} 추천 · 마음트랙` : '발달센터 추천'}</title>
        <meta name="description" content="파트너 발달센터를 통해 마음트랙에 가입하세요." />
      </Helmet>
      <div className="max-w-2xl mx-auto space-y-8">
        <p className="text-sm tracking-[0.2em] text-muted-foreground">PARTNER REFERRAL</p>
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight break-keep">
          파트너 발달센터를 통해 추천받으셨습니다
        </h1>
        <p className="text-base text-muted-foreground break-keep">
          센터 코드 <span className="font-mono text-foreground">{slug}</span> 가 적용되었습니다.
          가입 후 결제 시 자동으로 추천이 연결돼요.
        </p>
        <div className="rounded-3xl border border-border bg-white p-6 md:p-8 space-y-4">
          <h2 className="text-xl font-semibold">자녀 마음트랙 30일</h2>
          <p className="text-sm text-muted-foreground break-keep">
            매일 1분 체크인 · 임상 검증 검사 기반 · 14년 임상 전문가 설계
          </p>
          <Link
            to="/track/child"
            className="inline-block rounded-2xl bg-foreground text-background px-6 py-3 text-sm font-medium"
          >
            자녀 트랙 시작하기
          </Link>
        </div>
      </div>
    </div>
  );
}
