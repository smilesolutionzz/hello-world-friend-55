import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ShieldCheck, Download, Headphones, Clock, Check, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const FEARS = [
  {
    n: "01",
    fear: "15년치 데이터가 날아가면?",
    answer: "케어플 엑셀 5종을 그대로 인식. 이관 후 회기 수·매출·이용자 수 일치율 100% 인증서까지 자동 발급.",
    icon: ShieldCheck,
  },
  {
    n: "02",
    fear: "다음 달 전자청구 못 하면?",
    answer: "첫 두 달은 케어플과 동시 운영 가능. AIHPRO에서 .xlsx 청구 파일이 케어플 결과와 100% 일치하는지 매월 자동 비교.",
    icon: Clock,
  },
  {
    n: "03",
    fear: "다시 케어플로 못 돌아가면?",
    answer: "언제든 케어플 원본 포맷(.xlsx)으로 역수출. 잠금 없음, 위약금 없음.",
    icon: Download,
  },
  {
    n: "04",
    fear: "선생님들 다시 가르쳐야 하나?",
    answer: "전담 컨시어지가 줌으로 1:1 이관 + 직원 교육 60분. 무료. 케어플 약정 잔여기간 동안은 추가 비용 0원.",
    icon: Headphones,
  },
];

const COMPARE = [
  ["엑셀 이관", "수동 입력", "5종 자동 인식 · 5분"],
  ["모바일 입력", "사실상 불가", "음성 30초 일지"],
  ["부모 소통", "없음", "회기 종료 즉시 리포트"],
  ["청구 보험", "—", "케어플 결과와 자동 대조"],
  ["역수출", "—", "원본 포맷으로 언제든"],
  ["약정", "1년", "없음 · 60일 무료"],
];

export default function B2BCenterMigrate() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    organization_name: "",
    contact_person: "",
    phone: "",
    email: "",
    current_system: "케어플",
    contract_ends: "",
    note: "",
  });

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.organization_name || !form.contact_person || !form.phone) {
      toast({ title: "기관명·담당자·연락처는 필수입니다", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("b2b_inquiries").insert({
        organization_name: form.organization_name,
        organization_type: "therapy_center",
        contact_person: form.contact_person,
        phone: form.phone,
        email: form.email || "no-email@migrate.aihpro.app",
        service_interest: "center_migration",
        source: "/b2b-center/migrate",
        message: [
          `[이관 컨시어지 신청]`,
          `현재 시스템: ${form.current_system}`,
          `약정 만료: ${form.contract_ends || "미입력"}`,
          form.note ? `메모: ${form.note}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        status: "new",
      });
      if (error) throw error;
      setDone(true);
      toast({ title: "신청 완료", description: "1영업일 내 담당 컨시어지가 연락드립니다." });
    } catch (err: any) {
      console.error("[migrate-concierge]", err);
      toast({ title: "신청 실패", description: err?.message ?? String(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Helmet>
        <title>케어플에서 AIHPRO로 이관 | 1:1 컨시어지 · 60일 무료</title>
        <meta
          name="description"
          content="케어플 엑셀 5분 이관, 약정 잔여기간 무료, 청구 보험 모드, 역수출 보장. 1:1 컨시어지가 도와드립니다."
        />
        <link rel="canonical" href="https://aihpro.app/b2b-center/migrate" />
      </Helmet>

      {/* HERO */}
      <section className="px-6 py-24 md:py-32 max-w-5xl mx-auto">
        <p className="text-xs tracking-[0.3em] text-[#8B7A4A] mb-6">CAREPLE → AIHPRO MIGRATION</p>
        <h1 className="text-4xl md:text-6xl font-semibold leading-tight break-keep mb-6">
          케어플에서 옮겨오는<br />
          <span className="text-[#C8B88A]">단 하나의 안전한 길.</span>
        </h1>
        <p className="text-lg text-neutral-600 break-keep max-w-2xl mb-10">
          5분 안에 15년치 데이터를 그대로 옮기고, 두 달 동안 케어플과 나란히 돌려보고, 그래도 안 맞으면 원본 포맷으로 되돌릴 수 있습니다.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="#concierge"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-neutral-900 text-white font-medium hover:bg-neutral-800"
          >
            컨시어지 신청 <ArrowRight className="w-4 h-4" />
          </a>
          <Link
            to="/b2b-center/import"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl border border-neutral-300 hover:border-neutral-900"
          >
            지금 바로 셀프 이관
          </Link>
        </div>
      </section>

      {/* FEARS */}
      <section className="px-6 py-20 bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs tracking-widest text-neutral-500 mb-3">01 · 옮기지 못하는 진짜 이유</p>
          <h2 className="text-3xl md:text-4xl font-semibold mb-12 break-keep">
            기능 비교가 아니라, 네 가지 두려움을 푸는 일입니다.
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {FEARS.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.n} className="p-7 rounded-3xl bg-white border border-neutral-200">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#FBF8F1] border border-[#C8B88A]/40 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[#8B7A4A]" />
                    </div>
                    <div>
                      <p className="text-[10px] tracking-widest text-[#8B7A4A] mb-1">{f.n}</p>
                      <p className="font-semibold mb-2 break-keep">"{f.fear}"</p>
                      <p className="text-sm text-neutral-600 break-keep leading-relaxed">{f.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMPARE */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs tracking-widest text-neutral-500 mb-3">02 · 옆에 두고 보면</p>
          <h2 className="text-3xl md:text-4xl font-semibold mb-10 break-keep">같은 일을, 절반의 시간으로.</h2>
          <div className="rounded-3xl border border-neutral-200 overflow-hidden">
            <div className="grid grid-cols-[1.2fr_1fr_1.2fr] bg-neutral-50 text-xs tracking-widest text-neutral-500 px-6 py-4">
              <div>항목</div>
              <div className="text-center">케어플</div>
              <div className="text-right text-[#8B7A4A]">AIHPRO CENTER</div>
            </div>
            {COMPARE.map(([k, a, b], i) => (
              <div
                key={k}
                className={`grid grid-cols-[1.2fr_1fr_1.2fr] px-6 py-4 text-sm ${i % 2 ? "bg-neutral-50/40" : ""}`}
              >
                <div className="text-neutral-900 break-keep">{k}</div>
                <div className="text-center text-neutral-500">{a}</div>
                <div className="text-right font-medium text-neutral-900 break-keep">{b}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="px-6 py-20 bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs tracking-widest text-neutral-500 mb-3">03 · 이관 타임라인</p>
          <h2 className="text-3xl md:text-4xl font-semibold mb-12 break-keep">7일이면, 충분합니다.</h2>
          <ol className="space-y-5">
            {[
              ["Day 0", "컨시어지 신청 — 1영업일 내 담당자 배정"],
              ["Day 1", "줌 1:1 — 케어플 엑셀 5종 다운로드 안내"],
              ["Day 2", "이관 실행 — 5분 임포트, 일치율 100% 인증서 자동 발급"],
              ["Day 3–7", "직원 교육 60분 + 첫 회기 입력 코칭"],
              ["~ Day 60", "케어플 동시 운영 + 매월 청구 결과 자동 대조"],
              ["Day 60+", "케어플 해지 또는 약정 잔여기간 무료 연장"],
            ].map(([d, t]) => (
              <li key={d} className="flex gap-5 items-start">
                <div className="w-20 shrink-0 text-xs tracking-widest text-[#8B7A4A] pt-1">{d}</div>
                <div className="flex-1 text-neutral-700 break-keep">{t}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CONCIERGE FORM */}
      <section id="concierge" className="px-6 py-24 scroll-mt-20">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs tracking-widest text-neutral-500 mb-3">04 · 1:1 이관 컨시어지</p>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 break-keep">
            연락처만 남겨주시면 나머지는 저희가.
          </h2>
          <p className="text-neutral-600 mb-10 break-keep">
            전담 담당자가 1영업일 내 연락드려 케어플 엑셀 다운로드부터 첫 회기 입력까지 한 번에 안내합니다.
          </p>

          {done ? (
            <div className="p-8 rounded-3xl bg-[#FBF8F1] border border-[#C8B88A]/40 text-center">
              <div className="w-12 h-12 rounded-full bg-white border border-[#C8B88A]/60 flex items-center justify-center mx-auto mb-4">
                <Check className="w-5 h-5 text-[#8B7A4A]" />
              </div>
              <p className="font-semibold mb-2">신청이 접수되었습니다.</p>
              <p className="text-sm text-neutral-600 break-keep">
                1영업일 내 담당 컨시어지가 입력하신 연락처로 연락드립니다.
              </p>
              <Link
                to="/b2b-center/import"
                className="inline-block mt-6 px-5 py-3 rounded-2xl border border-neutral-300 text-sm hover:border-neutral-900"
              >
                기다리는 동안 셀프 이관 보기
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="기관명*" v={form.organization_name} on={(v) => update("organization_name", v)} />
                <Field label="담당자*" v={form.contact_person} on={(v) => update("contact_person", v)} />
                <Field label="연락처*" v={form.phone} on={(v) => update("phone", v)} placeholder="010-0000-0000" />
                <Field label="이메일" v={form.email} on={(v) => update("email", v)} type="email" />
                <Field label="현재 사용 시스템" v={form.current_system} on={(v) => update("current_system", v)} />
                <Field
                  label="약정 만료일 (대략)"
                  v={form.contract_ends}
                  on={(v) => update("contract_ends", v)}
                  placeholder="예: 2026년 8월"
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest text-neutral-500 mb-2">메모</label>
                <textarea
                  value={form.note}
                  onChange={(e) => update("note", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:border-neutral-900 focus:outline-none resize-none"
                  placeholder="센터 규모, 치료사 수, 궁금한 점 등"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-neutral-900 text-white font-medium hover:bg-neutral-800 disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Headphones className="w-4 h-4" />}
                컨시어지 신청
              </button>
              <p className="text-[11px] text-neutral-500 text-center break-keep">
                * 신청만으로는 비용이 발생하지 않습니다. 약정·결제는 60일 무료 체험 이후 별도 확인 후 진행됩니다.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  v,
  on,
  type = "text",
  placeholder,
}: {
  label: string;
  v: string;
  on: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs tracking-widest text-neutral-500 mb-2">{label}</label>
      <input
        type={type}
        value={v}
        onChange={(e) => on(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:border-neutral-900 focus:outline-none"
      />
    </div>
  );
}
