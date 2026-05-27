import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, MapPin, ExternalLink, BookOpen, Sparkles } from 'lucide-react';
import { PARTNER_INSTITUTIONS } from '@/data/partnerInstitutions';
import {
  fetchPartnerPrograms,
  fetchPartnerProducts,
  formatKRW,
  logPartnerClick,
} from '@/lib/partnerMarket';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import SEOHead from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';

// Reuse a deterministic facility cover for the hero
import facilityDev from '@/assets/facilities/facility-development-center.jpg';
import facilitySpeech from '@/assets/facilities/facility-speech-therapy.jpg';
import facilityCounseling from '@/assets/facilities/facility-counseling.jpg';
import facilityAba from '@/assets/facilities/facility-aba.jpg';
import facilityPlay from '@/assets/facilities/facility-play-therapy.jpg';
import facilityArt from '@/assets/facilities/facility-art.jpg';
const COVERS = [facilityDev, facilitySpeech, facilityCounseling, facilityAba, facilityPlay, facilityArt];

const PartnerDetail: React.FC = () => {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'programs' | 'products'>('programs');

  const institution = useMemo(() => PARTNER_INSTITUTIONS.find((p) => p.id === slug), [slug]);
  const coverIndex = useMemo(() => {
    const i = PARTNER_INSTITUTIONS.findIndex((p) => p.id === slug);
    return i >= 0 ? i % COVERS.length : 0;
  }, [slug]);

  const programsQ = useQuery({
    queryKey: ['partner_programs', slug],
    queryFn: () => fetchPartnerPrograms(slug),
    enabled: !!slug,
  });
  const productsQ = useQuery({
    queryKey: ['partner_products', slug],
    queryFn: () => fetchPartnerProducts(slug),
    enabled: !!slug,
  });

  if (!institution) {
    return (
      <div className="min-h-screen bg-white">
        <UnifiedNavigation />
        <div className="max-w-3xl mx-auto px-5 py-16 text-center">
          <h1 className="text-xl font-bold text-foreground">기관을 찾을 수 없습니다</h1>
          <Button className="mt-6" onClick={() => navigate('/expert-hiring')}>협력기관 목록으로</Button>
        </div>
      </div>
    );
  }

  const programs = programsQ.data ?? [];
  const products = productsQ.data ?? [];

  const handleExternal = (url: string | null, type: 'program' | 'product', id: string) => {
    if (!url) return;
    logPartnerClick(slug, type, id);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <SEOHead
        title={`${institution.name} · 협력기관`}
        description={`${institution.name}의 운영 프로그램과 추천 도서를 확인하세요.`}
      />
      <UnifiedNavigation />

      {/* Hero */}
      <div className="relative h-48 sm:h-60 w-full overflow-hidden">
        <img src={COVERS[coverIndex]} alt={institution.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <button
            onClick={() => navigate('/expert-hiring')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> 협력기관
          </button>
        </div>
        <div className="absolute bottom-4 left-5 right-5">
          {institution.isVerified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-[11px] font-bold text-emerald-700 mb-2">
              <CheckCircle className="w-3 h-3" /> 인증기관
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-white break-keep">{institution.name}</h1>
          <div className="mt-1 flex items-center gap-3 text-white/85 text-xs">
            <span>{institution.type}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {institution.location}</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5">
        {/* Specialties */}
        <div className="mt-5 flex flex-wrap gap-1.5">
          {institution.specialties.map((s, i) => (
            <span
              key={i}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-primary/[0.06] text-primary/80 border border-primary/10"
            >
              {s}
            </span>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-2 border-b border-border/60">
          {([
            { id: 'programs', label: `운영 프로그램 (${programs.length})`, icon: Sparkles },
            { id: 'products', label: `추천 도서·굿즈 (${products.length})`, icon: BookOpen },
          ] as const).map((t) => {
            const active = tab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  active
                    ? 'border-[#C8B88A] text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Empty state */}
        {tab === 'programs' && programs.length === 0 && (
          <EmptyState label="아직 등록된 프로그램이 없습니다." />
        )}
        {tab === 'products' && products.length === 0 && (
          <EmptyState label="아직 등록된 도서·굿즈가 없습니다." />
        )}

        {/* Programs grid */}
        {tab === 'programs' && programs.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {programs.map((p) => (
              <article
                key={p.id}
                className="bg-white rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all"
              >
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  {p.thumbnail_url ? (
                    <img src={p.thumbnail_url} alt={p.title} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      썸네일 없음
                    </div>
                  )}
                </div>
                <div className="p-3">
                  {p.category && (
                    <span className="text-[10px] font-semibold text-[#8a7a4d]">{p.category}</span>
                  )}
                  <h3 className="mt-0.5 font-bold text-sm text-foreground line-clamp-2 break-keep">{p.title}</h3>
                  <div className="mt-1.5 flex flex-wrap gap-1 text-[10.5px] text-muted-foreground">
                    {p.target_age && <span>{p.target_age}</span>}
                    {p.duration_text && <span>· {p.duration_text}</span>}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">{formatKRW(p.price_krw)}</span>
                    <Button
                      size="sm"
                      onClick={() => handleExternal(p.cta_url, 'program', p.id)}
                      disabled={!p.cta_url}
                      className="h-7 px-2.5 text-[11px] rounded-lg"
                    >
                      {p.cta_label || '신청'} <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Products grid */}
        {tab === 'products' && products.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <article
                key={p.id}
                className="bg-white rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all"
              >
                <div className="aspect-[3/4] bg-muted overflow-hidden">
                  {p.thumbnail_url ? (
                    <img src={p.thumbnail_url} alt={p.title} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      썸네일 없음
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <span className="text-[10px] font-semibold text-[#8a7a4d]">
                    {p.kind === 'book' ? '도서' : p.kind === 'kit' ? '키트' : '굿즈'}
                  </span>
                  <h3 className="mt-0.5 font-bold text-sm text-foreground line-clamp-2 break-keep">{p.title}</h3>
                  {p.author && <p className="text-[11px] text-muted-foreground mt-0.5">{p.author}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">{formatKRW(p.price_krw)}</span>
                    <Button
                      size="sm"
                      onClick={() => handleExternal(p.external_buy_url, 'product', p.id)}
                      disabled={!p.external_buy_url}
                      className="h-7 px-2.5 text-[11px] rounded-lg"
                    >
                      구매 <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ label: string }> = ({ label }) => (
  <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

export default PartnerDetail;
