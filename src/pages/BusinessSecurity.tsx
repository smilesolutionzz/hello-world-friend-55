import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Lock,
  ShieldCheck,
  Users,
  EyeOff,
  Database,
  KeySquare,
  FileText,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import BusinessSEO from '@/components/b2b/BusinessSEO';
import BusinessBreadcrumb from '@/components/b2b/BusinessBreadcrumb';

const GOLD = '#C8B88A';

const principles = [
  {
    n: '01',
    icon: EyeOff,
    title: '개인 응답은 회사가 열람할 수 없습니다',
    body:
      '직원이 작성한 마음 트랙 응답·코칭 대화 원문은 어떠한 경우에도 HR·임원·관리자에게 노출되지 않습니다. 회사가 확인할 수 있는 것은 익명·집계된 부서 단위 지표뿐입니다.',
  },
  {
    n: '02',
    icon: Users,
    title: '5명 미만 그룹은 자동 마스킹',
    body:
      '부서·직군·연령대 등 어떤 차원으로 집계하든 표본 수가 5명 미만이면 통계에서 자동 제외됩니다. 소규모 팀이라는 이유로 개인이 식별되는 일이 구조적으로 발생하지 않습니다.',
  },
  {
    n: '03',
    icon: ShieldCheck,
    title: '직원 동의 기반 옵트인',
    body:
      '모든 데이터 수집은 직원 본인의 명시적 동의에서 시작됩니다. 동의는 언제든 철회할 수 있으며, 철회 시 이후 응답은 더 이상 집계에 포함되지 않습니다.',
  },
  {
    n: '04',
    icon: Database,
    title: '응답은 닉네임으로만 저장',
    body:
      '시스템 내부에서도 실명 대신 닉네임(display_name)이 1차 식별자입니다. 응답·리포트·내보내기 어디에도 본명이 함께 표시되지 않습니다.',
  },
  {
    n: '05',
    icon: KeySquare,
    title: '데이터베이스 행 단위 접근 제어',
    body:
      '모든 데이터는 행 단위 접근 정책(RLS) 하에 저장되며, 본인·권한이 부여된 전문가·시스템 외에는 어떤 계정도 직접 조회할 수 없습니다. 관리자 계정 역시 집계 뷰만 사용합니다.',
  },
  {
    n: '06',
    icon: AlertTriangle,
    title: '의료 진단·치료가 아닌 발달적 코칭',
    body:
      'AIHPRO는 발달적 코칭과 의사결정 지원을 위한 도구이며, 의료적 진단·치료를 제공하지 않습니다. 결과는 의료 행위로 사용될 수 없습니다.',
  },
];

const dataFlow = [
  {
    n: '01',
    title: '직원 동의',
    body: '회사 단위 도입 → 직원 개별 옵트인 → 닉네임 기반 계정 생성',
  },
  {
    n: '02',
    title: '익명 코칭 진행',
    body: '마음 트랙·코칭 대화는 직원 개인 계정에만 귀속, 원문 비공개',
  },
  {
    n: '03',
    title: '집계 처리',
    body: '부서·기간 단위 집계 → 5명 미만 자동 제외 → 식별 불가능한 지표만 산출',
  },
  {
    n: '04',
    title: 'HR 리포트',
    body: 'HR/관리자는 집계 대시보드와 리포트만 열람, 개별 응답은 영구 비접근',
  },
];

const faqs = [
  {
    q: '회사 관리자가 특정 직원의 응답을 볼 수 있나요?',
    a: '없습니다. 시스템 구조상 관리자 권한으로도 개인 응답에 직접 접근할 수 없으며, 모든 화면은 집계 뷰로만 구성되어 있습니다.',
  },
  {
    q: '5명 미만 부서는 어떻게 처리되나요?',
    a: '집계에서 자동으로 제외되어 지표가 생성되지 않습니다. "표본 부족"으로 표시되며 강제 조회 수단은 제공되지 않습니다.',
  },
  {
    q: '직원이 동의를 철회하면 기존 데이터는 어떻게 되나요?',
    a: '동의 철회 시 이후 수집은 즉시 중단되며, 기존 데이터의 삭제 요청 시 정해진 절차에 따라 처리합니다. 집계 결과에는 더 이상 포함되지 않습니다.',
  },
  {
    q: '외부 위탁이나 제3자에게 데이터가 공유되나요?',
    a: '도입 기관과의 명시적 합의 및 직원 동의 범위를 벗어난 제3자 공유는 없습니다. 분석은 시스템 내부에서 수행됩니다.',
  },
  {
    q: '의료적 진단으로 사용해도 되나요?',
    a: '안 됩니다. AIHPRO는 발달적 코칭·의사결정 지원 도구이며, 진단·치료·처방의 근거로 사용될 수 없습니다.',
  },
];

export default function BusinessSecurity() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-foreground">
      <BusinessSEO
        title="보안·익명성 백서 — AIHPRO Business"
        description="개인 응답 비공개, 5명 미만 자동 마스킹, 동의 기반 옵트인. 조직 마음건강 데이터의 처리 원칙을 공개합니다."
        path="/business/security"
      />
      <BusinessBreadcrumb current="보안·익명성 백서" />

      {/* Hero */}
      <section className="px-6 pt-16 pb-14 md:pt-24">
        <div className="mx-auto max-w-3xl">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs tracking-wide text-foreground/70 mb-6"
            style={{ borderColor: `${GOLD}66` }}
          >
            <Lock className="h-3 w-3" />
            BUSINESS WHITEPAPER
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight break-keep leading-tight">
            직원은 안전하게, <br className="hidden md:block" />
            <span style={{ color: GOLD }}>회사는 신뢰할 수 있는 지표</span>로
          </h1>
          <p className="mt-6 text-base md:text-lg text-foreground/60 break-keep">
            AIHPRO Business가 직원 개인의 응답을 어떻게 보호하고, 회사에는 어떤 형태의 데이터를 제공하는지 그 원칙을 공개합니다.
          </p>
        </div>
      </section>

      {/* Principles */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs tracking-[0.2em] text-foreground/50 mb-3">PRINCIPLES</p>
          <h2 className="text-2xl md:text-3xl font-semibold mb-10 break-keep">
            6가지 안전 원칙
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {principles.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.n} className="rounded-3xl border bg-white p-7">
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-2xl"
                      style={{ background: `${GOLD}1A` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: GOLD }} />
                    </div>
                    <span className="text-sm font-mono tracking-wider" style={{ color: GOLD }}>
                      {p.n}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 break-keep">{p.title}</h3>
                  <p className="text-sm text-foreground/60 break-keep leading-relaxed">{p.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Data Flow */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs tracking-[0.2em] text-foreground/50 mb-3">DATA FLOW</p>
          <h2 className="text-2xl md:text-3xl font-semibold mb-10 break-keep">
            데이터는 이렇게 흐릅니다
          </h2>
          <div className="grid md:grid-cols-4 gap-5">
            {dataFlow.map((s, i) => (
              <div key={s.n} className="relative rounded-3xl border bg-white p-6">
                <span className="text-sm font-mono tracking-wider" style={{ color: GOLD }}>
                  {s.n}
                </span>
                <h3 className="mt-3 text-base font-semibold break-keep">{s.title}</h3>
                <p className="mt-2 text-sm text-foreground/60 break-keep leading-relaxed">{s.body}</p>
                {i < dataFlow.length - 1 && (
                  <ArrowRight
                    className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 h-4 w-4"
                    style={{ color: GOLD }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What HR sees vs not */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs tracking-[0.2em] text-foreground/50 mb-3">SCOPE</p>
          <h2 className="text-2xl md:text-3xl font-semibold mb-10 break-keep">
            HR이 볼 수 있는 것 / 볼 수 없는 것
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-3xl border bg-white p-7">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-5 w-5" style={{ color: GOLD }} />
                <h3 className="text-base font-semibold">볼 수 있는 것</h3>
              </div>
              <ul className="space-y-3 text-sm text-foreground/70">
                <li>• 부서·기간 단위 참여율과 추세</li>
                <li>• 익명 집계된 위험 신호 분포</li>
                <li>• 회복 루틴 정착률, 코칭 만족도</li>
                <li>• 조직 차원의 권장 액션 리포트</li>
              </ul>
            </div>
            <div className="rounded-3xl border bg-white p-7">
              <div className="flex items-center gap-2 mb-4">
                <EyeOff className="h-5 w-5" style={{ color: GOLD }} />
                <h3 className="text-base font-semibold">볼 수 없는 것</h3>
              </div>
              <ul className="space-y-3 text-sm text-foreground/70">
                <li>• 특정 직원의 마음 트랙 응답 원문</li>
                <li>• 코칭 대화 내용</li>
                <li>• 5명 미만 그룹의 세부 지표</li>
                <li>• 개인을 식별할 수 있는 어떤 형태의 raw 데이터</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs tracking-[0.2em] text-foreground/50 mb-3">FAQ</p>
          <h2 className="text-2xl md:text-3xl font-semibold mb-10 break-keep">
            자주 묻는 질문
          </h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="rounded-3xl border bg-white p-6">
                <h3 className="text-base font-semibold mb-2 break-keep">{f.q}</h3>
                <p className="text-sm text-foreground/60 break-keep leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <FileText className="h-5 w-5 mx-auto mb-4" style={{ color: GOLD }} />
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 break-keep">
            보안 검토용 자료가 더 필요하신가요?
          </h2>
          <p className="text-foreground/60 mb-8 break-keep">
            보안·법무 검토에 필요한 추가 자료(데이터 처리 위탁 계약서, 보안 점검 체크리스트 등)는 도입 상담 시 별도로 제공해드립니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="rounded-full px-8 h-12 bg-foreground text-background hover:bg-foreground/90"
              onClick={() => navigate('/b2b-proposal')}
            >
              <Building2 className="mr-2 h-4 w-4" />
              도입 상담 신청
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 h-12"
              onClick={() => navigate('/business')}
            >
              비즈니스 허브로
            </Button>
          </div>
          <p className="mt-6 text-xs text-foreground/40 break-keep">
            본 백서는 제품 운영 원칙에 대한 일반 설명이며, 도입 기관과의 개별 계약·법무 문서가 우선합니다.
          </p>
        </div>
      </section>
    </div>
  );
}
