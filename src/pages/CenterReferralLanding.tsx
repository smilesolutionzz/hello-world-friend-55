import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface PartnerOrg {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  tagline: string | null;
  org_type: string;
}

export default function CenterReferralLanding() {
  const { slug } = useParams<{ slug: string }>();
  const [org, setOrg] = useState<PartnerOrg | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    // 1) localStorage에 referrer 저장 (결제 시점에 사용)
    try {
      localStorage.setItem('referrer_org_slug', slug);
      localStorage.setItem('referrer_captured_at', new Date().toISOString());
    } catch {
      /* ignore */
    }

    let cancelled = false;
    (async () => {
      const { data } = await supabase.rpc('get_partner_org_by_slug', { _slug: slug });
      if (cancelled) return;
      const row = Array.isArray(data) && data.length > 0 ? (data[0] as PartnerOrg) : null;
      setOrg(row);
      setLoading(false);

      // 2) 클릭 추적 (실패해도 무시)
      try {
        await supabase.rpc('track_partner_referral_click', {
          _slug: slug,
          _user_agent: navigator.userAgent.slice(0, 500),
          _referrer_url: document.referrer.slice(0, 500) || null,
        });
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-sm text-muted-foreground">불러오는 중...</div>
      </div>
    );
  }

  // 슬러그가 유효하지 않거나 비활성 — 그래도 마음트랙 일반 안내로 폴백
  const isValid = !!org;

  return (
    <div className="min-h-screen bg-white px-6 py-16 md:py-24">
      <Helmet>
        <title>{org ? `${org.name} 추천 · 마음트랙` : '발달센터 추천 · 마음트랙'}</title>
        <meta
          name="description"
          content={
            org
              ? `${org.name}에서 추천한 자녀 마음트랙 30일. 매일 1분 체크인 + 임상 검증 검사.`
              : '파트너 발달심리센터를 통해 마음트랙에 가입하세요.'
          }
        />
      </Helmet>

      <div className="max-w-2xl mx-auto space-y-10">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-foreground/5 px-4 py-1.5 text-xs tracking-[0.18em] text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5" />
            PARTNER REFERRAL
          </span>

          {isValid ? (
            <>
              <div className="flex items-center gap-4 pt-2">
                {org?.logo_url ? (
                  <img
                    src={org.logo_url}
                    alt={`${org.name} 로고`}
                    className="w-14 h-14 rounded-2xl object-cover border border-border"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground/40 text-xl font-semibold">
                    {org?.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground tracking-wider">파트너 센터</div>
                  <div className="text-lg font-semibold truncate">{org?.name}</div>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-semibold leading-tight break-keep pt-4">
                {org?.name}에서 추천한
                <br />
                자녀 마음트랙 30일
              </h1>
              {org?.tagline && (
                <p className="text-base text-muted-foreground break-keep pt-2">{org.tagline}</p>
              )}
            </>
          ) : (
            <>
              <h1 className="text-3xl md:text-5xl font-semibold leading-tight break-keep pt-4">
                마음트랙 30일을
                <br />
                안내해드립니다
              </h1>
              <p className="text-base text-muted-foreground break-keep pt-2">
                추천 코드를 확인할 수 없지만, 자녀 마음트랙은 누구나 시작할 수 있어요.
              </p>
            </>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-white p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground tracking-[0.18em]">
            <Sparkles className="w-3.5 h-3.5" />
            WHAT YOU GET
          </div>
          <h2 className="text-xl md:text-2xl font-semibold break-keep">자녀 마음트랙 30일</h2>
          <ul className="text-sm text-muted-foreground space-y-2 leading-relaxed break-keep">
            <li>· 매일 1분 체크인으로 가족의 마음 점수 추적</li>
            <li>· 임상 검증된 발달 코칭 미션 30일</li>
            <li>· 14년 발달 임상 전문가가 설계한 흐름</li>
            <li>· 30일 후 변화량을 숫자와 그래프로 확인</li>
          </ul>
          <Link
            to="/track/child"
            className="inline-block rounded-2xl bg-foreground text-background px-6 py-3.5 text-sm font-medium hover:opacity-90 transition"
          >
            자녀 트랙 시작하기
          </Link>
          {isValid && (
            <p className="text-xs text-muted-foreground/80 break-keep pt-1">
              결제 시 {org?.name} 추천이 자동으로 연결됩니다.
            </p>
          )}
        </div>

        <p className="text-xs text-muted-foreground/70 break-keep">
          본 서비스는 발달 코칭·의사결정 지원을 목적으로 하며, 의학적 진단·치료를 대체하지 않습니다.
        </p>
      </div>
    </div>
  );
}
