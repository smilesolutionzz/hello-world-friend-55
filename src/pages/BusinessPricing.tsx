import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, X, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import BusinessSEO from '@/components/b2b/BusinessSEO';
import { useB2BJobcoachPlans } from '@/hooks/useB2BJobcoachPlans';
import { trackB2BEvent } from '@/hooks/useB2BFunnelTracking';

const GOLD = '#C8B88A';
const PATH = '/b2b-pricing';

const trackCTA = (label: string, target: string) =>
  trackB2BEvent('cta_click', PATH, { label, target });

const fmtKRW = (v: number) => `₩${v.toLocaleString()}`;

const planCopy: Record<string, { tagline: string; features: string[] }> = {
  starter: {
    tagline: '스타트업·소규모 팀의 첫 도입',
    features: [
      '직원 익명 코칭 (마음 트랙 30일)',
      '월간 집계 리포트 (부서별)',
      '5명 미만 자동 마스킹',
      '이메일 도입 지원',
    ],
  },
  growth: {
    tagline: '성장기 조직을 위한 표준 플랜',
    features: [
      '스타터 모든 기능',
      '분기 1회 전문가 트렌드 브리핑',
      '위험 신호 자동 알림 (HR)',
      '도입 매니저 지정',
    ],
  },
  enterprise: {
    tagline: '기관·대기업 맞춤 운영',
    features: [
      '그로스 모든 기능',
      '맞춤 부서 구조 / SSO 연동',
      '오프라인 전문가 세션 (옵션)',
      '전담 CS · 보안 백서 제공',
    ],
  },
};

const compareRows: Array<{
  label: string;
  aihpro: 'yes' | 'no' | 'partial' | string;
  eap: 'yes' | 'no' | 'partial' | string;
  inhouse: 'yes' | 'no' | 'partial' | string;
}> = [
  { label: '직원 익명 보장', aihpro: 'yes', eap: 'partial', inhouse: 'no' },
  { label: '24/7 코칭 접근', aihpro: 'yes', eap: 'no', inhouse: 'no' },
  { label: '부서별 집계 리포트', aihpro: 'yes', eap: 'partial', inhouse: 'partial' },
  { label: '5명 미만 자동 마스킹', aihpro: 'yes', eap: 'no', inhouse: 'no' },
  { label: '도입 소요 기간', aihpro: '1-2주', eap: '4-8주', inhouse: '3-6개월' },
  { label: '연간 비용 (100명 기준)', aihpro: '플랜별 산정', eap: '5천만~1.5억', inhouse: '1억+' },
  { label: '전문가 1:1 상담 연계', aihpro: 'yes', eap: 'yes', inhouse: 'partial' },
  { label: '의료 진단 / 처방', aihpro: 'no', eap: 'partial', inhouse: 'no' },
];

function CompareCell({ value }: { value: string }) {
  if (value === 'yes') return <Check className="h-4 w-4 mx-auto" style={{ color: GOLD }} />;
  if (value === 'no') return <X className="h-4 w-4 mx-auto text-foreground/30" />;
  if (value === 'partial') return <Minus className="h-4 w-4 mx-auto text-foreground/40" />;
  return <span className="text-xs text-foreground/70">{value}</span>;
}

export default function BusinessPricing() {
  const navigate = useNavigate();
  const { plans, loading } = useB2BJobcoachPlans();

  return (
    <div className="min-h-screen bg-white text-foreground">
      <BusinessSEO
        title="AIHPRO 비즈니스 가격 — 조직 마음건강 플랜"
        description="직원 규모에 맞춘 3개 플랜과 기존 EAP 대비 비교. 1-2주 도입, 5명 미만 자동 마스킹."
        path={PATH}
      />

      {/* Hero */}
      <section className="px-6 pt-20 pb-12 md:pt-28">
        <div className="mx-auto max-w-5xl text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs tracking-wide text-foreground/70 mb-6"
            style={{ borderColor: `${GOLD}66` }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: GOLD }} />
            Business Pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight break-keep leading-tight">
            조직 규모에 맞는 <span style={{ color: GOLD }}>투명한 가격</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-foreground/60 break-keep max-w-2xl mx-auto">
            모든 플랜은 직원 1인당 월 단가로 산정됩니다. 연간 계약 시 2개월 무상 제공.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl grid md:grid-cols-3 gap-5">
          {loading && [0, 1, 2].map((i) => (
            <Card key={i} className="rounded-3xl border bg-white p-7 h-80 animate-pulse" />
          ))}

          {!loading && plans.length === 0 && (
            <div className="md:col-span-3 rounded-3xl border bg-white p-10 text-center text-foreground/60">
              플랜 정보를 불러오는 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.
            </div>
          )}

          {!loading && plans.map((plan) => {
            const copy = planCopy[plan.plan_key] ?? planCopy[plan.tier] ?? {
              tagline: '맞춤 도입 플랜',
              features: ['직원 익명 코칭', '집계 리포트', '도입 지원'],
            };
            const recommended = plan.is_recommended;
            return (
              <Card
                key={plan.id}
                className="rounded-3xl border bg-white p-7 shadow-none flex flex-col relative"
                style={recommended ? { borderColor: GOLD, borderWidth: 2 } : {}}
              >
                {recommended && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-medium"
                    style={{ background: GOLD, color: 'white' }}
                  >
                    가장 인기
                  </span>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">{plan.plan_name}</h3>
                  <p className="text-xs text-foreground/55 break-keep">{copy.tagline}</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold tabular-nums">
                      {fmtKRW(plan.price_per_employee_monthly)}
                    </span>
                    <span className="text-sm text-foreground/50">/인 · 월</span>
                  </div>
                  <p className="text-[11px] text-foreground/40 mt-1">
                    최소 {plan.min_employees}명
                    {plan.max_employees ? ` · 최대 ${plan.max_employees}명` : ' 이상'}
                  </p>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {copy.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground/75 break-keep">
                      <Check className="h-4 w-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full rounded-full h-11 ${
                    recommended
                      ? 'bg-foreground text-background hover:bg-foreground/90'
                      : 'bg-white text-foreground border hover:bg-foreground/5'
                  }`}
                  variant={recommended ? 'default' : 'outline'}
                  onClick={() => {
                    trackCTA(`plan_${plan.plan_key}`, '/b2b-proposal');
                    navigate(`/b2b-proposal?plan=${plan.plan_key}`);
                  }}
                >
                  도입 상담 신청
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Comparison */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs tracking-[0.2em] text-foreground/50 mb-3 text-center">COMPARE</p>
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12 break-keep">
            기존 EAP 대비 무엇이 다른가
          </h2>
          <div className="rounded-3xl border bg-white overflow-hidden">
            <div className="grid grid-cols-4 px-6 py-4 border-b text-xs text-foreground/50 tracking-wider">
              <div>항목</div>
              <div className="text-center font-semibold" style={{ color: GOLD }}>AIHPRO</div>
              <div className="text-center">기존 EAP</div>
              <div className="text-center">사내 운영</div>
            </div>
            {compareRows.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-4 px-6 py-4 items-center text-sm ${
                  i % 2 === 0 ? 'bg-foreground/[0.015]' : ''
                }`}
              >
                <div className="text-foreground/80 break-keep">{row.label}</div>
                <div className="text-center"><CompareCell value={row.aihpro} /></div>
                <div className="text-center"><CompareCell value={row.eap} /></div>
                <div className="text-center"><CompareCell value={row.inhouse} /></div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-foreground/40 text-center mt-4 break-keep">
            ※ EAP·사내 운영 비교는 업계 통상 자료를 바탕으로 한 일반 추정치이며, 실제 조건은 공급사·운영 방식에 따라 다릅니다.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl md:text-2xl font-semibold mb-8 text-center break-keep">
            자주 묻는 질문
          </h2>
          <div className="space-y-3">
            {[
              { q: '연간 계약 할인이 있나요?', a: '네, 연간 결제 시 2개월 무상 제공됩니다. 견적 요청 시 자동 반영해 드립니다.' },
              { q: 'HR이 직원 응답을 볼 수 있나요?', a: '아니요. HR은 부서·기간 단위 집계 지표만 열람합니다. 5명 미만 그룹은 자동 마스킹되어 개인 식별이 불가합니다.' },
              { q: '기존 EAP와 병행 사용이 가능한가요?', a: '가능합니다. 많은 도입 기관이 EAP는 위기 대응, AIHPRO는 일상 코칭으로 분리 운영합니다.' },
              { q: '의료 행위인가요?', a: '아니요. AIHPRO는 비의료 발달 코칭·의사결정 지원 도구입니다. 임상 진단·처방을 대체하지 않습니다.' },
            ].map((item) => (
              <details key={item.q} className="group rounded-2xl border bg-white p-5">
                <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-medium">
                  <span className="break-keep">{item.q}</span>
                  <span className="text-foreground/40 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-foreground/65 break-keep leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 break-keep">
            우리 조직 견적이 궁금하신가요?
          </h2>
          <p className="text-foreground/60 mb-8 break-keep">
            직원 규모와 도입 시점을 알려주시면 24시간 내 맞춤 견적을 보내드립니다.
          </p>
          <Button
            size="lg"
            className="rounded-full px-10 h-12 bg-foreground text-background hover:bg-foreground/90"
            onClick={() => { trackCTA('footer_cta', '/b2b-proposal'); navigate('/b2b-proposal'); }}
          >
            맞춤 견적 요청
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="mt-6 text-xs text-foreground/40">
            본 서비스는 의료적 진단·치료가 아닌 발달적 코칭 및 의사결정 지원 도구입니다.
          </p>
        </div>
      </section>
    </div>
  );
}
