import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Quote, ShieldCheck, Building2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import BusinessSEO from '@/components/b2b/BusinessSEO';
import BusinessBreadcrumb from '@/components/b2b/BusinessBreadcrumb';
import { CASE_STUDIES, getCaseStudyBySlug } from '@/data/businessCaseStudies';

const GOLD = '#C8B88A';

function CaseStudyDetail({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const study = getCaseStudyBySlug(slug);

  if (!study) {
    return (
      <div className="min-h-screen bg-white px-6 py-24 text-center">
        <BusinessBreadcrumb current="사례를 찾을 수 없음" />
        <h1 className="text-2xl font-semibold mb-4">사례를 찾을 수 없습니다</h1>
        <Button onClick={() => navigate('/business/case-studies')} variant="outline" className="rounded-full">
          전체 사례 보기
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-foreground">
      <BusinessSEO
        title={`${study.title} — AIHPRO Business 사례`}
        description={study.summary}
        path={`/business/case-studies/${study.slug}`}
      />
      <BusinessBreadcrumb current={study.industry} />

      <article className="mx-auto max-w-3xl px-6 pt-16 pb-24">
        <div className="flex items-center gap-2 text-xs tracking-[0.2em] text-foreground/50 mb-4">
          <span>CASE STUDY</span>
          {study.isAnonymized && (
            <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5" style={{ borderColor: `${GOLD}66` }}>
              <Lock className="h-3 w-3" /> 익명 사례
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight break-keep leading-tight">
          {study.title}
        </h1>
        <p className="mt-5 text-base md:text-lg text-foreground/60 break-keep">{study.summary}</p>

        <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-2xl border bg-white p-4">
            <p className="text-foreground/50 text-xs mb-1">산업</p>
            <p className="font-medium break-keep">{study.industry}</p>
          </div>
          <div className="rounded-2xl border bg-white p-4">
            <p className="text-foreground/50 text-xs mb-1">규모</p>
            <p className="font-medium break-keep">{study.size}</p>
          </div>
        </div>

        <section className="mt-14">
          <p className="text-xs tracking-[0.2em] text-foreground/50 mb-3">CHALLENGE</p>
          <h2 className="text-xl font-semibold mb-3 break-keep">도입 배경</h2>
          <p className="text-foreground/70 leading-relaxed break-keep">{study.challenge}</p>
        </section>

        <section className="mt-12">
          <p className="text-xs tracking-[0.2em] text-foreground/50 mb-3">APPROACH</p>
          <h2 className="text-xl font-semibold mb-4 break-keep">도입 방식</h2>
          <ol className="space-y-3">
            {study.approach.map((step, i) => (
              <li key={i} className="flex gap-3 rounded-2xl border bg-white p-4">
                <span className="text-sm font-mono mt-0.5" style={{ color: GOLD }}>
                  0{i + 1}
                </span>
                <span className="text-sm text-foreground/80 break-keep leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <p className="text-xs tracking-[0.2em] text-foreground/50 mb-3">OUTCOMES</p>
          <h2 className="text-xl font-semibold mb-4 break-keep">결과 — {study.pilotMonths}개월 파일럿</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {study.outcomes.map((m) => (
              <div key={m.label} className="rounded-2xl border bg-white p-5">
                <p className="text-xs text-foreground/50 mb-2 break-keep">{m.label}</p>
                <p className="text-2xl font-semibold tracking-tight" style={{ color: GOLD }}>
                  {m.value}
                </p>
                {m.hint && <p className="mt-2 text-xs text-foreground/50 break-keep">{m.hint}</p>}
              </div>
            ))}
          </div>
        </section>

        {study.quote && (
          <section className="mt-12 rounded-3xl border bg-white p-7">
            <Quote className="h-5 w-5 mb-3" style={{ color: GOLD }} />
            <p className="text-lg font-serif leading-relaxed break-keep">{study.quote.text}</p>
            <p className="mt-3 text-sm text-foreground/50">— {study.quote.author}</p>
          </section>
        )}

        <section className="mt-14 rounded-3xl border bg-white p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 mt-0.5" style={{ color: GOLD }} />
            <p className="text-sm text-foreground/70 break-keep">
              모든 사례는 도입 기관 동의 하에 익명 처리되어 공개됩니다.
            </p>
          </div>
          <Button
            onClick={() => navigate('/b2b-proposal')}
            className="rounded-full bg-foreground text-background hover:bg-foreground/90"
          >
            우리 조직에도 적용
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </section>
      </article>
    </div>
  );
}

function CaseStudyList() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white text-foreground">
      <BusinessSEO
        title="도입 사례 — AIHPRO Business"
        description="제조·교육·유아교육 등 다양한 조직의 익명 사례로 도입 효과를 확인하세요."
        path="/business/case-studies"
      />
      <BusinessBreadcrumb current="도입 사례" />

      <section className="px-6 pt-16 pb-12 md:pt-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs tracking-[0.2em] text-foreground/50 mb-3">CASE STUDIES</p>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight break-keep leading-tight">
            조직마다 다른 출발점, <br className="hidden md:block" />
            <span style={{ color: GOLD }}>같은 안전 기준</span>으로
          </h1>
          <p className="mt-5 text-base md:text-lg text-foreground/60 break-keep max-w-2xl">
            모든 사례는 도입 기관 동의 하에 익명 처리되었으며, 5명 미만 데이터는 자동 마스킹된 집계만 공개합니다.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-5">
          {CASE_STUDIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => navigate(`/business/case-studies/${c.slug}`)}
              className="group text-left rounded-3xl border bg-white p-7 hover:border-foreground/30 transition-all"
            >
              <div className="flex items-center justify-between mb-5">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-2xl"
                  style={{ background: `${GOLD}1A` }}
                >
                  <Building2 className="h-4 w-4" style={{ color: GOLD }} />
                </div>
                {c.isAnonymized && (
                  <span className="inline-flex items-center gap-1 text-xs text-foreground/50">
                    <Lock className="h-3 w-3" /> 익명
                  </span>
                )}
              </div>
              <p className="text-xs text-foreground/50 mb-2">{c.industry} · {c.size}</p>
              <h2 className="text-lg font-semibold mb-2 break-keep leading-snug">{c.title}</h2>
              <p className="text-sm text-foreground/60 break-keep leading-relaxed">{c.summary}</p>
              <div className="mt-5 flex items-center gap-2 text-sm" style={{ color: GOLD }}>
                자세히 보기
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border bg-zinc-50 p-8 text-center">
          <p className="text-xs tracking-[0.2em] mb-2" style={{ color: GOLD }}>RESOURCES</p>
          <h3 className="text-xl font-semibold mb-2">전체 케이스 PDF · 보안 백서</h3>
          <p className="text-sm text-foreground/60 mb-5 break-keep">회사 이메일을 입력하시면 자료를 보내드립니다.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <LeadCaptureGate
              assetKey="case_studies_pdf"
              assetTitle="AIHPRO 도입 케이스 스터디 모음 (PDF)"
              triggerLabel="케이스 PDF 받기"
              onUnlock={() => window.open('/sample-report', '_blank')}
            />
            <LeadCaptureGate
              assetKey="security_whitepaper"
              assetTitle="AIHPRO 보안 백서 (Security Whitepaper)"
              triggerLabel="보안 백서 받기"
              triggerVariant="outline"
              onUnlock={() => window.open('/sample-report', '_blank')}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default function BusinessCaseStudies() {
  const { slug } = useParams<{ slug?: string }>();
  return slug ? <CaseStudyDetail slug={slug} /> : <CaseStudyList />;
}
