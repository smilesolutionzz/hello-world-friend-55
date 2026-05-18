/**
 * B2B ABA 전시 대시보드 — 임원 데모 화면
 * ────────────────────────────────────────
 * 30-45 부모 ICP 의 7일 ABA 트랙 핵심 지표를 익명화·마스킹된 코호트 형태로
 * 임원/파트너에게 보여주는 데모. 본인 인스티튜션(있다면)의 실데이터를 우선 사용하고
 * 데이터가 없으면 데모 mock 으로 대체한다.
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ShieldCheck, Activity, Timer, ListTree, Sparkles, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  getAnonymizedABASummariesForInstitution,
  type ABACohortAggregate,
  type AnonymizedABARow,
  ABA_PIPELINE_MASKING,
} from "@/lib/abaPipeline";

const DEMO_FALLBACK: ABACohortAggregate = {
  totalConsented: 18,
  meanFrequencyDeltaPct: -42,
  meanScriptConsistencyPct: 73,
  meanReinforcerCoveragePct: 61,
  completionRatePct: 78,
  topTriggersAcrossCohort: [
    { trigger: "스크린타임 종료 직후", count: 9 },
    { trigger: "형제와 장난감 공유", count: 6 },
    { trigger: "저녁 식사 시작 5분 전", count: 5 },
    { trigger: "등원 준비 중 옷 갈아입기", count: 4 },
  ],
  suppressedDueToSmallN: false,
  visibleRows: [
    {
      anonId: "aba_demo_001", nickname: "김**", daysLogged: 7,
      frequencyDeltaPct: -58, baselineFrequency: 14, finalFrequency: 6,
      baselineDurationSec: 320, finalDurationSec: 110,
      scriptConsistencyPct: 86, reinforcerCoveragePct: 71,
      topTriggers: ["스크린타임 종료", "형제 갈등"], completed: true,
    },
    {
      anonId: "aba_demo_002", nickname: "이**", daysLogged: 6,
      frequencyDeltaPct: -33, baselineFrequency: 9, finalFrequency: 6,
      baselineDurationSec: 240, finalDurationSec: 160,
      scriptConsistencyPct: 67, reinforcerCoveragePct: 50,
      topTriggers: ["식사 시작 직전"], completed: true,
    },
    {
      anonId: "aba_demo_003", nickname: "박**", daysLogged: 7,
      frequencyDeltaPct: -49, baselineFrequency: 11, finalFrequency: 5,
      baselineDurationSec: 280, finalDurationSec: 130,
      scriptConsistencyPct: 79, reinforcerCoveragePct: 64,
      topTriggers: ["등원 옷 갈아입기"], completed: true,
    },
  ],
};

function HeroMetric({
  label, value, hint, tone = "default", icon,
}: {
  label: string; value: string; hint?: string;
  tone?: "default" | "good" | "warn"; icon?: React.ReactNode;
}) {
  const toneClass =
    tone === "good" ? "text-emerald-700" : tone === "warn" ? "text-amber-700" : "text-foreground";
  return (
    <Card className="bg-white border-border/60 rounded-2xl">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          {icon}
          <span>{label}</span>
        </div>
        <div className={`text-3xl font-semibold tracking-tight ${toneClass}`}>{value}</div>
        {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function ClientRow({ row }: { row: AnonymizedABARow }) {
  const delta = row.frequencyDeltaPct;
  const deltaLabel = delta == null ? "–" : `${delta > 0 ? "+" : ""}${delta}%`;
  const deltaTone =
    delta == null ? "text-muted-foreground" : delta < 0 ? "text-emerald-700" : "text-amber-700";
  return (
    <div className="grid grid-cols-12 gap-2 items-center py-3 text-sm border-b border-border/40 last:border-0">
      <div className="col-span-3">
        <div className="font-medium">{row.nickname}</div>
        <div className="text-[11px] text-muted-foreground font-mono">{row.anonId}</div>
      </div>
      <div className="col-span-2 text-xs">{row.daysLogged} / 7일</div>
      <div className={`col-span-2 font-semibold ${deltaTone}`}>{deltaLabel}</div>
      <div className="col-span-2 text-xs">
        {row.baselineDurationSec ?? "–"}s → {row.finalDurationSec ?? "–"}s
      </div>
      <div className="col-span-3 text-xs text-muted-foreground line-clamp-2">
        {row.topTriggers.join(" · ") || "기록된 ABC 없음"}
      </div>
    </div>
  );
}

const B2BABADemoDashboard = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const explicitInst = params.get("institution_id") || undefined;

  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [institutionName, setInstitutionName] = useState<string | null>(null);
  const [cohort, setCohort] = useState<ABACohortAggregate>(DEMO_FALLBACK);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let instId = explicitInst;
        if (!instId) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: own } = await supabase
              .from("b2b_partner_institutions")
              .select("id, institution_name")
              .eq("user_id", user.id)
              .maybeSingle();
            instId = own?.id;
            if (own?.institution_name) setInstitutionName(own.institution_name);
          }
        } else {
          const { data: inst } = await supabase
            .from("b2b_partner_institutions")
            .select("institution_name")
            .eq("id", instId)
            .maybeSingle();
          if (inst?.institution_name) setInstitutionName(inst.institution_name);
        }

        if (!instId) {
          setCohort(DEMO_FALLBACK);
          setUsingFallback(true);
          return;
        }

        const result = await getAnonymizedABASummariesForInstitution(instId);
        if (result.totalConsented === 0) {
          setCohort(DEMO_FALLBACK);
          setUsingFallback(true);
        } else {
          setCohort(result);
          setUsingFallback(false);
        }
      } catch (e) {
        console.warn("[B2BABADemoDashboard] fallback to demo data", e);
        setCohort(DEMO_FALLBACK);
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [explicitInst]);

  const meanDeltaTxt = useMemo(() => {
    const d = cohort.meanFrequencyDeltaPct;
    if (d == null) return "데이터 부족";
    return `${d > 0 ? "+" : ""}${d}%`;
  }, [cohort.meanFrequencyDeltaPct]);

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                B2B Executive Demo · ABA 7-Day Track
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                부모 코칭 코호트 성과 대시보드
              </h1>
              <div className="text-xs text-muted-foreground mt-1">
                {institutionName ? (
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> {institutionName}
                  </span>
                ) : (
                  "기관 미연결 — 데모 데이터 표시"
                )}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="bg-white">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-emerald-700" />
            익명화·N≥{ABA_PIPELINE_MASKING.minCohortForIndividualDisplay} 마스킹 적용
          </Badge>
        </div>

        {/* Banner */}
        {usingFallback && (
          <Card className="mb-6 border-amber-200 bg-amber-50/60 rounded-2xl">
            <CardContent className="p-4 text-xs text-amber-900">
              현재 화면은 데모 데이터입니다. 실제 기관 동의자가 5명 이상 확보되면
              자동으로 익명화된 실데이터로 전환됩니다.
            </CardContent>
          </Card>
        )}

        {/* Hero KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <HeroMetric
            label="코호트 규모"
            value={`${cohort.totalConsented}명`}
            hint="ABA 데이터 공유 동의자"
            icon={<Sparkles className="h-3.5 w-3.5" />}
          />
          <HeroMetric
            label="표적행동 빈도 변화"
            value={meanDeltaTxt}
            hint="Day1 → Day6 평균"
            tone={cohort.meanFrequencyDeltaPct != null && cohort.meanFrequencyDeltaPct < 0 ? "good" : "default"}
            icon={<Activity className="h-3.5 w-3.5" />}
          />
          <HeroMetric
            label="7일 완주율"
            value={`${cohort.completionRatePct}%`}
            hint="5일+ 기록 기준"
            tone={cohort.completionRatePct >= 60 ? "good" : "warn"}
            icon={<Timer className="h-3.5 w-3.5" />}
          />
          <HeroMetric
            label="부모 스크립트 일관성"
            value={`${cohort.meanScriptConsistencyPct}%`}
            hint={`강화 적용률 ${cohort.meanReinforcerCoveragePct}%`}
            tone="default"
            icon={<ListTree className="h-3.5 w-3.5" />}
          />
        </div>

        {/* ABC triggers */}
        <Card className="mb-8 bg-white rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">코호트 ABC 트리거 Top</CardTitle>
          </CardHeader>
          <CardContent>
            {cohort.topTriggersAcrossCohort.length === 0 ? (
              <p className="text-sm text-muted-foreground">아직 집계할 ABC 기록이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {cohort.topTriggersAcrossCohort.map((t) => (
                  <div key={t.trigger} className="flex items-center gap-3">
                    <div className="flex-1 text-sm">{t.trigger}</div>
                    <div className="h-2 bg-muted rounded-full flex-1 overflow-hidden">
                      <div
                        className="h-full bg-[#C8B88A]"
                        style={{
                          width: `${Math.min(100, (t.count / cohort.topTriggersAcrossCohort[0].count) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground w-10 text-right">{t.count}건</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Per-client (masked) */}
        <Card className="bg-white rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>개별 코호트 · 익명화 표시</span>
              <Badge variant="secondary" className="text-[10px]">
                실명·이메일·전화 제거 · 닉네임 마스킹
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cohort.suppressedDueToSmallN ? (
              <div className="text-sm text-muted-foreground p-6 text-center">
                동의자 수가 {ABA_PIPELINE_MASKING.minCohortForIndividualDisplay}명 미만이라
                개별 행은 숨김 처리되었습니다. 평균 지표만 노출됩니다.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/60">
                  <div className="col-span-3">대상</div>
                  <div className="col-span-2">기록일</div>
                  <div className="col-span-2">빈도 Δ</div>
                  <div className="col-span-2">지속(s)</div>
                  <div className="col-span-3">상위 ABC</div>
                </div>
                {cohort.visibleRows.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-6 text-center">
                    표시할 코호트 행이 없습니다.
                  </div>
                ) : (
                  cohort.visibleRows.map((row) => <ClientRow key={row.anonId} row={row} />)
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Separator className="my-8" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          본 화면은 개발적 코칭·의사결정 지원 데이터이며 의료 진단이 아닙니다.
          모든 데이터는 사용자 동의(client_data_consents) 기반으로만 집계되며,
          기관 접근은 institution_data_access_logs 에 감사 기록됩니다.
        </p>
        <div className="text-[11px] text-muted-foreground mt-1">
          {loading ? "로딩 중…" : ""}
        </div>
      </div>
    </div>
  );
};

export default B2BABADemoDashboard;
