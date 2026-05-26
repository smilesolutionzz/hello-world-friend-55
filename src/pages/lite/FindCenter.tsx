/**
 * /find-center — Day 4 화면 3: 기관 연결 (B2B 유입 지점)
 *
 * 결과 리포트에서 '우리 동네 기관 찾기'를 누르면 도달하는 라이트 B2C→B2B 연결 화면.
 * - 사용자가 입력한 지역(query: region) 기준으로 center_directory 목록 표시
 * - 카드: 이름, 지역, 전문영역 태그, 한 줄 소개
 * - '상담 문의하기' 누르면 인라인 폼 노출 → center_inquiries 저장
 * - (보조) '리포트 PDF 받기' = window.print
 *
 * SaaS 본체는 만들지 않고 최소 연결 구조만.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Printer, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Center = {
  id: string;
  name: string;
  type: 'dev_center' | 'counseling_center';
  region: string;
  address: string | null;
  specialties: string[];
  phone: string | null;
  intro: string | null;
  is_partner: boolean;
  slug: string;
};

const typeLabel = (t: Center['type']) =>
  t === 'dev_center' ? '아동발달센터' : '심리상담센터';

const FindCenter = () => {
  const [params] = useSearchParams();
  const requestedRegion = params.get('region') || '';
  const checkSummary = useMemo(() => {
    const raw = params.get('summary');
    try {
      return raw ? JSON.parse(decodeURIComponent(raw)) : null;
    } catch {
      return null;
    }
  }, [params]);

  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(requestedRegion);
  const [openInquiry, setOpenInquiry] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      let query = supabase
        .from('center_directory' as any)
        .select('*')
        .eq('is_active', true)
        .order('is_partner', { ascending: false })
        .order('name', { ascending: true });

      if (region.trim()) {
        query = query.ilike('region', `%${region.trim()}%`);
      }
      const { data } = await query;
      if (!cancelled) {
        setCenters((data as unknown as Center[]) || []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [region]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[640px] px-5 pt-6 pb-24">
        <Link
          to="/check/done"
          className="inline-flex items-center gap-1 text-[12px] text-slate-500 hover:text-slate-800 mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          결과 화면으로
        </Link>

        <h1 className="text-[22px] font-semibold tracking-tight text-slate-900 break-keep">
          우리 동네 기관 찾기
        </h1>
        <p className="mt-2 text-[13px] text-slate-500 break-keep leading-relaxed">
          체크 결과를 토대로, 가까운 발달·상담 기관을 안내해 드립니다. 카드 하단의
          ‘상담 문의하기’를 누르면 기관에서 직접 연락드립니다.
        </p>

        <div className="mt-5 flex items-center gap-2">
          <div className="flex-1 relative">
            <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="예: 서울 강남구"
              className="w-full pl-8 pr-3 py-2.5 text-[13px] rounded-2xl border border-slate-200 bg-white outline-none focus:border-slate-400"
            />
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1 px-3 py-2.5 text-[12px] rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <Printer className="w-3.5 h-3.5" />
            리포트 PDF
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {loading && (
            <div className="text-center text-[12px] text-slate-400 py-8">
              기관 목록 불러오는 중…
            </div>
          )}

          {!loading && centers.length === 0 && (
            <div className="text-center text-[13px] text-slate-500 py-10 rounded-3xl border border-dashed border-slate-200">
              해당 지역의 등록된 기관이 아직 없습니다.
              <br />
              지역을 비우면 전체 기관을 볼 수 있어요.
            </div>
          )}

          {!loading &&
            centers.map((c) => (
              <CenterCard
                key={c.id}
                center={c}
                isOpen={openInquiry === c.id}
                onToggle={() =>
                  setOpenInquiry((prev) => (prev === c.id ? null : c.id))
                }
                checkSummary={checkSummary}
              />
            ))}
        </div>

        {/* 센터 운영자용 진입 (B2B 브릿지) */}
        <div className="mt-10 text-center text-[12px] text-slate-500">
          센터를 운영하고 계신가요?{" "}
          <a href="/b2b-center" className="text-[#C8B88A] font-medium hover:underline">
            발달치료센터 운영 솔루션 보기 →
          </a>
        </div>
      </div>
    </div>
  );
};

const CenterCard = ({
  center,
  isOpen,
  onToggle,
  checkSummary,
}: {
  center: Center;
  isOpen: boolean;
  onToggle: () => void;
  checkSummary: unknown;
}) => {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[15px] font-semibold text-slate-900 truncate">
              {center.name}
            </h3>
            {center.is_partner && (
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#C8B88A]/15 text-[#8a7a4a] border border-[#C8B88A]/40">
                파트너
              </span>
            )}
          </div>
          <div className="mt-1 text-[12px] text-slate-500">
            {typeLabel(center.type)} · {center.region}
          </div>
        </div>
      </div>

      {center.intro && (
        <p className="mt-3 text-[13px] text-slate-600 break-keep leading-relaxed">
          {center.intro}
        </p>
      )}

      {center.specialties?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {center.specialties.map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 text-[11px] rounded-full bg-slate-100 text-slate-600"
            >
              #{s}
            </span>
          ))}
        </div>
      )}

      {center.phone && (
        <div className="mt-3 flex items-center gap-1.5 text-[12px] text-slate-500">
          <Phone className="w-3 h-3" />
          {center.phone}
        </div>
      )}

      <button
        type="button"
        onClick={onToggle}
        className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-4 py-3 text-[13px] rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
      >
        {isOpen ? '문의 폼 닫기' : '상담 문의하기'}
      </button>

      {isOpen && <InquiryForm centerId={center.id} checkSummary={checkSummary} />}
    </article>
  );
};

const InquiryForm = ({
  centerId,
  checkSummary,
}: {
  centerId: string;
  checkSummary: unknown;
}) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [childAge, setChildAge] = useState('');
  const [memo, setMemo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!name.trim() || !contact.trim()) {
      toast({
        title: '이름과 연락처를 입력해 주세요',
        variant: 'destructive',
      });
      return;
    }
    if (name.length > 60 || contact.length > 60 || memo.length > 1000) {
      toast({ title: '입력값이 너무 깁니다', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from('center_inquiries' as any).insert({
        center_id: centerId,
        user_id: user?.id ?? null,
        name: name.trim(),
        contact: contact.trim(),
        child_age: childAge.trim() || null,
        memo: memo.trim() || null,
        check_summary: checkSummary ?? null,
        source_path: typeof window !== 'undefined' ? window.location.pathname + window.location.search : null,
      });

      if (error) throw error;
      setDone(true);
    } catch (e: any) {
      toast({
        title: '문의 전송 실패',
        description: e?.message || '잠시 후 다시 시도해 주세요.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center">
        <div className="text-[13px] font-semibold text-slate-900">
          문의가 접수되었습니다
        </div>
        <div className="mt-1 text-[12px] text-slate-500 break-keep">
          기관에서 곧 연락드릴 예정입니다. 체크 결과 요약본도 함께 전달돼요.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-2.5">
      <div className="grid grid-cols-2 gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
          className="px-3 py-2 text-[13px] rounded-xl border border-slate-200 bg-white outline-none focus:border-slate-400"
        />
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="연락처 (전화/이메일)"
          className="px-3 py-2 text-[13px] rounded-xl border border-slate-200 bg-white outline-none focus:border-slate-400"
        />
      </div>
      <input
        value={childAge}
        onChange={(e) => setChildAge(e.target.value)}
        placeholder="자녀 나이 (선택, 예: 만 5세)"
        className="w-full px-3 py-2 text-[13px] rounded-xl border border-slate-200 bg-white outline-none focus:border-slate-400"
      />
      <textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="간단 메모 (현재 가장 걱정되는 점 등)"
        rows={3}
        className="w-full px-3 py-2 text-[13px] rounded-xl border border-slate-200 bg-white outline-none focus:border-slate-400 resize-none"
      />
      <div className="text-[11px] text-slate-400">
        제출 시 체크 결과 요약이 자동으로 첨부됩니다.
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-[13px] rounded-2xl bg-[#C8B88A] text-white hover:opacity-90 disabled:opacity-50"
      >
        <Send className="w-3.5 h-3.5" />
        {submitting ? '전송 중…' : '문의 보내기'}
      </button>
    </div>
  );
};

export default FindCenter;
