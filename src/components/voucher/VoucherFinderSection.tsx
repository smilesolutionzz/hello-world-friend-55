/**
 * VoucherFinderSection — 전국 바우처 제공기관 검색 (재사용 가능 섹션)
 * /voucher-finder 페이지의 코어 검색/리스트만 분리해 다른 페이지에 embed 가능
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Search, ArrowRight, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const VOUCHER_TYPES = [
  { key: 'all', label: '전체' },
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
  org_name: string;
  address: string | null;
  city: string | null;
  district: string | null;
  voucher_type: string;
  raw?: { telNumber?: string } | null;
};

type PartnerRow = {
  id: string;
  name: string;
  address: string | null;
  voucher_programs: string[] | null;
};

export default function VoucherFinderSection() {
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [type, setType] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [dir, setDir] = useState<DirectoryRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        let partnerQ = supabase
          .from('partner_institutions')
          .select('id, name, address, voucher_programs, voucher_source')
          .not('voucher_programs', 'is', null)
          .in('voucher_source', ['api_matched', 'self_reported_verified'])
          .limit(50);

        let dirQ = supabase
          .from('voucher_directory')
          .select('id, org_name, address, city, district, voucher_type, raw')
          .order('city', { ascending: true })
          .order('district', { ascending: true })
          .order('org_name', { ascending: true })
          .limit(200);

        if (type === '발달장애인주간') dirQ = dirQ.ilike('voucher_type', '%발달장애인%주간%');
        else if (type !== 'all') dirQ = dirQ.ilike('voucher_type', `%${type}%`);
        if (city) dirQ = dirQ.ilike('city', `${city.slice(0, 2)}%`);
        if (district) dirQ = dirQ.ilike('district', `${district}%`);
        if (query) dirQ = dirQ.ilike('org_name', `%${query}%`);

        const [{ data: pData }, { data: dData }] = await Promise.all([partnerQ, dirQ]);
        if (!cancelled) {
          const partnerRows = (pData ?? []) as PartnerRow[];
          setPartners(type === 'all' ? partnerRows : partnerRows.filter((p) => (p.voucher_programs ?? []).some((v) => v.includes(type))));
          setDir((dData ?? []) as unknown as DirectoryRow[]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [city, district, type, query]);

  const typeLabel = useMemo(
    () => VOUCHER_TYPES.find((t) => t.key === type)?.label ?? type,
    [type],
  );

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-5">
        <p className="text-xs font-medium tracking-[0.18em] text-[#C8B88A] uppercase mb-1.5">
          Voucher Directory
        </p>
        <h2 className="text-lg md:text-xl font-semibold text-neutral-900 tracking-tight">
          전국 바우처 지원 기관 찾기
        </h2>
        <p className="mt-1.5 text-xs md:text-sm text-neutral-600 break-keep">
          보건복지부 공공데이터(사회서비스 전자바우처 제공기관)에서 우리 동네 {typeLabel} 바우처 제공 기관을 안내합니다.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <select
            value={city}
            onChange={(e) => { setCity(e.target.value); setDistrict(''); }}
            className="px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm"
          >
            <option value="">전국</option>
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

      {/* Verified partners */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-[#C8B88A]" />
          <h3 className="text-sm font-semibold text-neutral-900 tracking-tight">
            AIHPRO 검증 파트너 <span className="text-neutral-400 font-normal">({partners.length})</span>
          </h3>
        </div>
        {partners.length === 0 ? (
          <div className="text-sm text-neutral-500 bg-neutral-50 rounded-2xl px-5 py-5">
            이 지역에 등록된 검증 파트너가 아직 없어요. 아래 일반 기관 목록을 참고하세요.
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {partners.map((p) => (
              <li key={p.id} className="rounded-2xl border-2 border-[#C8B88A]/40 bg-white p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-neutral-900 truncate">{p.name}</h4>
                    {p.address && (
                      <p className="mt-1 text-xs text-neutral-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {p.address}
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
                <Link
                  to={`/partner/${p.id}`}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-neutral-900 hover:text-[#C8B88A]"
                >
                  상세 보기 <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* General directory */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4 text-neutral-400" />
          <h3 className="text-sm font-semibold text-neutral-900 tracking-tight">
            전체 바우처 제공 기관 <span className="text-neutral-400 font-normal">({dir.length}{dir.length >= 200 ? '+' : ''})</span>
          </h3>
        </div>
        {loading ? (
          <div className="text-sm text-neutral-400 py-8 text-center">불러오는 중…</div>
        ) : dir.length === 0 ? (
          <div className="text-sm text-neutral-500 bg-neutral-50 rounded-2xl px-5 py-5">
            검색 결과가 없습니다. 지역이나 검색어를 조정해 보세요.
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
                  {d.raw?.telNumber && (
                    <p className="text-xs text-neutral-400 mt-0.5">{d.raw.telNumber}</p>
                  )}
                </div>
                <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600">
                  {d.voucher_type}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[11px] text-neutral-400 leading-relaxed">
          출처: 공공데이터포털 보건복지부 사회서비스 전자바우처 제공기관 현황.
          기관 운영 상태는 변동될 수 있으니 방문/이용 전 해당 기관에 직접 확인해 주세요.
        </p>
      </div>
    </div>
  );
}
