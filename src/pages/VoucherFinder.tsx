/**
 * /voucher-finder — 보호자용 우리 동네 바우처 지원 기관 찾기
 *
 * - voucher_directory(전국 캐시, anon SELECT 공개)에서 시/군구·바우처 유형 필터
 * - 우리 협력기관(partner_institutions.voucher_source = api_matched/self_reported_verified)은 상단 고정 + 금색 배지
 * - 하단 sticky CTA: 전문가 매칭 받기 → /expert-hiring
 *
 * SEO 목적의 공개 페이지. 로그인 불필요.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, ShieldCheck, Search, ArrowRight, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const VOUCHER_TYPES = [
  { key: '발달재활', label: '발달재활' },
  { key: '지역사회', label: '지역사회서비스' },
  { key: '장애인활동', label: '장애인활동지원' },
  { key: '발달장애인주간', label: '발달장애인 주간활동' },
] as const;

const CITIES = [
  '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시',
  '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원특별자치도',
  '충청북도', '충청남도', '전북특별자치도', '전라남도', '경상북도', '경상남도', '제주특별자치도',
];

type DirectoryRow = {
  id: string;
  business_no: string | null;
  org_name: string;
  address: string | null;
  city: string | null;
  district: string | null;
  voucher_type: string;
};

type PartnerRow = {
  id: string;
  name: string;
  slug: string | null;
  location: string | null;
  voucher_programs: string[] | null;
  voucher_source: string | null;
};

export default function VoucherFinder() {
  const [city, setCity] = useState<string>('서울특별시');
  const [district, setDistrict] = useState<string>('');
  const [type, setType] = useState<string>('발달재활');
  const [query, setQuery] = useState<string>('');
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [dir, setDir] = useState<DirectoryRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const partnerQ = supabase
          .from('partner_institutions')
          .select('id, name, slug, location, voucher_programs, voucher_source')
          .not('voucher_programs', 'is', null)
          .contains('voucher_programs', [type])
          .in('voucher_source', ['api_matched', 'self_reported_verified'])
          .limit(50);

        let dirQ = supabase
          .from('voucher_directory')
          .select('id, business_no, org_name, address, city, district, voucher_type')
          .eq('voucher_type', type)
          .limit(200);

        if (city) dirQ = dirQ.ilike('city', `${city.slice(0, 2)}%`);
        if (district) dirQ = dirQ.ilike('district', `${district}%`);
        if (query) dirQ = dirQ.ilike('org_name', `%${query}%`);

        const [{ data: pData }, { data: dData }] = await Promise.all([partnerQ, dirQ]);
        if (!cancelled) {
          setPartners((pData ?? []) as any);
          setDir((dData ?? []) as any);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [city, district, type, query]);

  const typeLabel = useMemo(
    () => VOUCHER_TYPES.find((t) => t.key === type)?.label ?? type,
    [type]
  );

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{`${typeLabel} 바우처 지원 기관 찾기 | AIHPRO`}</title>
        <meta
          name="description"
          content={`${city} ${district} 지역의 ${typeLabel} 바우처 제공 기관을 한눈에. AIHPRO 검증 협력기관 우선 안내.`}
        />
        <link rel="canonical" href="https://aihpro.app/voucher-finder" />
      </Helmet>

      {/* Header */}
      <header className="border-b border-neutral-100">
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
          <p className="text-xs font-medium tracking-[0.18em] text-[#C8B88A] uppercase mb-3">
            Voucher Directory
          </p>
          <h1 className="text-2xl md:text-4xl font-semibold text-neutral-900 break-keep leading-tight">
            우리 동네 바우처 지원 기관 찾기
          </h1>
          <p className="mt-3 text-sm md:text-base text-neutral-600 break-keep max-w-2xl">
            보건복지부 공공데이터(사회서비스 전자바우처 제공기관)를 바탕으로,
            전국 바우처 지원 가능 기관을 지역별로 안내합니다.
          </p>
        </div>
      </header>

      {/* Filters */}
      <section className="border-b border-neutral-100 bg-neutral-50/50">
        <div className="max-w-5xl mx-auto px-4 py-5 space-y-4">
          {/* Type tabs */}
          <div className="flex flex-wrap gap-2">
            {VOUCHER_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  type === t.key
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Region + search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <select
              value={city}
              onChange={(e) => { setCity(e.target.value); setDistrict(''); }}
              className="px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm"
            >
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="시군구 (예: 강남구)"
              className="px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm"
            />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="기관명 검색"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Verified partners */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-[#C8B88A]" />
          <h2 className="text-sm font-semibold text-neutral-900 tracking-tight">
            AIHPRO 검증 파트너 <span className="text-neutral-400 font-normal">({partners.length})</span>
          </h2>
        </div>
        {partners.length === 0 ? (
          <div className="text-sm text-neutral-500 bg-neutral-50 rounded-2xl px-5 py-6">
            이 지역에 등록된 검증 파트너가 아직 없어요. 아래 일반 기관 목록을 참고하세요.
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {partners.map((p) => (
              <li key={p.id} className="rounded-2xl border-2 border-[#C8B88A]/40 bg-white p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-neutral-900 truncate">{p.name}</h3>
                    {p.location && (
                      <p className="mt-1 text-xs text-neutral-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {p.location}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-[#C8B88A]/10 text-[#8a7a4a] border border-[#C8B88A]/30">
                    <ShieldCheck className="w-3 h-3" /> 검증
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(p.voucher_programs ?? []).map((v) => (
                    <span key={v} className="px-2 py-0.5 rounded-md text-[11px] bg-neutral-100 text-neutral-700">
                      {v}
                    </span>
                  ))}
                </div>
                {p.slug && (
                  <Link
                    to={`/partner/${p.slug}`}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-neutral-900 hover:text-[#C8B88A]"
                  >
                    상세 보기 <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* General directory */}
      <section className="max-w-5xl mx-auto px-4 pb-32">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-neutral-400" />
          <h2 className="text-sm font-semibold text-neutral-900 tracking-tight">
            전체 바우처 제공 기관 <span className="text-neutral-400 font-normal">({dir.length}{dir.length >= 200 ? '+' : ''})</span>
          </h2>
        </div>
        {loading ? (
          <div className="text-sm text-neutral-400 py-8 text-center">불러오는 중…</div>
        ) : dir.length === 0 ? (
          <div className="text-sm text-neutral-500 bg-neutral-50 rounded-2xl px-5 py-6">
            검색 결과가 없습니다. 지역이나 검색어를 조정해 보세요.
            <br />
            <span className="text-xs text-neutral-400">
              (관리자 동기화가 아직 실행되지 않았다면 데이터가 비어 있을 수 있어요)
            </span>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-white">
            {dir.map((d) => (
              <li key={d.id} className="px-4 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{d.org_name}</p>
                  {d.address && (
                    <p className="text-xs text-neutral-500 mt-0.5 truncate">{d.address}</p>
                  )}
                </div>
                <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600">
                  {d.voucher_type}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-[11px] text-neutral-400 leading-relaxed">
          출처: 공공데이터포털 보건복지부 사회서비스 전자바우처 제공기관 현황.
          기관 운영 상태는 변동될 수 있으니 방문/이용 전 해당 기관에 직접 확인해 주세요.
        </p>
      </section>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-neutral-100 bg-white/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-xs md:text-sm text-neutral-600 break-keep">
            어떤 기관이 맞을지 모르겠다면, 전문가 매칭을 받아보세요
          </p>
          <Link
            to="/expert-hiring"
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800"
          >
            전문가 매칭 받기 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
