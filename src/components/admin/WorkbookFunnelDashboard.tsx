import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2, BookOpen, TrendingUp, MousePointerClick, Eye, Filter,
  Sparkles, ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";

type RangeKey = "7d" | "30d" | "all";
type CtaLocFilter = "all" | "lock_card_cta" | "sample_modal_cta";
type ViewedFullFilter = "all" | "yes" | "no";

const RANGE_OPTIONS: { key: RangeKey; label: string; days: number | null }[] = [
  { key: "7d", label: "최근 7일", days: 7 },
  { key: "30d", label: "최근 30일", days: 30 },
  { key: "all", label: "전체", days: null },
];

const EVENTS = {
  open: "mt_workbook_sample_open",
  complete: "mt_workbook_sample_complete",
  cta: "mt_workbook_sample_cta_click",
} as const;

interface RawEvent {
  user_id: string | null;
  session_id: string | null;
  event_name: string;
  event_properties: any;
  created_at: string;
}

interface SegmentStats {
  label: string;
  open: number;
  complete: number;
  cta: number;
  openToComplete: number;
  openToCta: number;
  completeToCta: number;
}

function emptySeg(label: string): SegmentStats {
  return { label, open: 0, complete: 0, cta: 0, openToComplete: 0, openToCta: 0, completeToCta: 0 };
}
const pct = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0);
const fillRates = (s: SegmentStats): SegmentStats => ({
  ...s,
  openToComplete: pct(s.complete, s.open),
  openToCta: pct(s.cta, s.open),
  completeToCta: pct(s.cta, s.complete),
});

export default function WorkbookFunnelDashboard() {
  const [range, setRange] = useState<RangeKey>("30d");
  const [ctaLoc, setCtaLoc] = useState<CtaLocFilter>("all");
  const [viewedFull, setViewedFull] = useState<ViewedFullFilter>("all");
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<RawEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const sb: any = supabase;
        let q = sb
          .from("user_analytics_events")
          .select("user_id, session_id, event_name, event_properties, created_at")
          .in("event_name", [EVENTS.open, EVENTS.complete, EVENTS.cta])
          .order("created_at", { ascending: false })
          .limit(10000);

        const opt = RANGE_OPTIONS.find((r) => r.key === range);
        if (opt?.days) {
          const since = new Date(Date.now() - opt.days * 24 * 60 * 60 * 1000).toISOString();
          q = q.gte("created_at", since);
        }

        const { data, error } = await q;
        if (error) throw error;
        if (!cancelled) setEvents((data || []) as RawEvent[]);
      } catch (e) {
        console.warn("[WorkbookFunnelDashboard] load error", e);
        if (!cancelled) setEvents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [range]);

  // ─── Filter events by cta_location & viewed_full ──────────────────────
  // cta_location filter only applies to cta events; for funnel rates we keep
  // open/complete events unfiltered (they have no cta_location).
  // viewed_full applies to complete + cta events.
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const props = ev.event_properties || {};
      if (ev.event_name === EVENTS.cta && ctaLoc !== "all") {
        if ((props.cta_location || "") !== ctaLoc) return false;
      }
      if (viewedFull !== "all" && ev.event_name !== EVENTS.open) {
        const vf = !!props.viewed_full;
        if (viewedFull === "yes" && !vf) return false;
        if (viewedFull === "no" && vf) return false;
      }
      return true;
    });
  }, [events, ctaLoc, viewedFull]);

  // ─── Segment stats ────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const all = emptySeg("전체");
    const loggedIn = emptySeg("로그인");
    const guest = emptySeg("비로그인");
    const mobile = emptySeg("모바일");
    const tablet = emptySeg("태블릿");
    const desktop = emptySeg("데스크톱");

    for (const ev of filteredEvents) {
      const props = ev.event_properties || {};
      const isLoggedIn = !!props.logged_in || !!ev.user_id;
      const device = (props.device as string) || "desktop";
      const inc = (seg: SegmentStats) => {
        if (ev.event_name === EVENTS.open) seg.open += 1;
        else if (ev.event_name === EVENTS.complete) seg.complete += 1;
        else if (ev.event_name === EVENTS.cta) seg.cta += 1;
      };
      inc(all);
      inc(isLoggedIn ? loggedIn : guest);
      if (device === "mobile") inc(mobile);
      else if (device === "tablet") inc(tablet);
      else inc(desktop);
    }
    return {
      all: fillRates(all),
      byLogin: [fillRates(loggedIn), fillRates(guest)],
      byDevice: [fillRates(mobile), fillRates(tablet), fillRates(desktop)],
    };
  }, [filteredEvents]);

  // ─── Daily series (Open / Complete / CTA + rate %) ────────────────────
  const dailySeries = useMemo(() => {
    const days = new Map<string, { date: string; open: number; complete: number; cta: number }>();
    for (const ev of filteredEvents) {
      const day = ev.created_at.slice(0, 10); // YYYY-MM-DD
      if (!days.has(day)) days.set(day, { date: day, open: 0, complete: 0, cta: 0 });
      const row = days.get(day)!;
      if (ev.event_name === EVENTS.open) row.open += 1;
      else if (ev.event_name === EVENTS.complete) row.complete += 1;
      else if (ev.event_name === EVENTS.cta) row.cta += 1;
    }
    return Array.from(days.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((r) => ({
        ...r,
        // 표시용 짧은 날짜
        label: r.date.slice(5),
        ctaRate: r.open ? Math.round((r.cta / r.open) * 1000) / 10 : 0,
        completeRate: r.open ? Math.round((r.complete / r.open) * 1000) / 10 : 0,
      }));
  }, [filteredEvents]);

  // ─── Statistical helpers ──────────────────────────────────────────────
  // Wilson score 95% CI for a binomial proportion.
  const wilson95 = (successes: number, n: number): { lo: number; hi: number } => {
    if (!n) return { lo: 0, hi: 0 };
    const z = 1.96;
    const p = successes / n;
    const denom = 1 + (z * z) / n;
    const center = (p + (z * z) / (2 * n)) / denom;
    const margin = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
    return {
      lo: Math.max(0, Math.round((center - margin) * 1000) / 10),
      hi: Math.min(100, Math.round((center + margin) * 1000) / 10),
    };
  };
  // Two-proportion z-test p-value (two-sided), normal approximation.
  const twoPropPValue = (s1: number, n1: number, s2: number, n2: number): number => {
    if (!n1 || !n2) return 1;
    const p1 = s1 / n1, p2 = s2 / n2;
    const p = (s1 + s2) / (n1 + n2);
    const se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2));
    if (!se) return 1;
    const z = Math.abs((p1 - p2) / se);
    // erfc approx → 2-sided p
    const t = 1 / (1 + 0.2316419 * z);
    const d = 0.3989422804 * Math.exp(-z * z / 2);
    const cdf = 1 - d * (0.319381530 * t - 0.356563782 * t ** 2 + 1.781477937 * t ** 3 - 1.821255978 * t ** 4 + 1.330274429 * t ** 5);
    return Math.max(0, Math.min(1, 2 * (1 - cdf)));
  };

  // ─── Personalization impact: opens with personalization flag → cta rate
  const personalizationImpact = useMemo(() => {
    const flagKeys = ["has_nickname", "has_track_theme", "has_checkins", "has_baselines"] as const;
    const result: {
      flag: string; label: string;
      with_open: number; with_cta: number;
      without_open: number; without_cta: number;
      uplift: number;
      withCi: { lo: number; hi: number };
      withoutCi: { lo: number; hi: number };
      pValue: number;
    }[] = [];

    for (const flag of flagKeys) {
      let withOpen = 0, withCta = 0, withoutOpen = 0, withoutCta = 0;
      for (const ev of filteredEvents) {
        const props = ev.event_properties || {};
        if (ev.event_name === EVENTS.complete) {
          if (props[flag]) withOpen += 1; else withoutOpen += 1;
        }
        if (ev.event_name === EVENTS.cta) {
          if (props[flag]) withCta += 1; else withoutCta += 1;
        }
      }
      const withRate = withOpen ? (withCta / withOpen) * 100 : 0;
      const withoutRate = withoutOpen ? (withoutCta / withoutOpen) * 100 : 0;
      result.push({
        flag,
        label: ({
          has_nickname: "닉네임 적용",
          has_track_theme: "목표 테마 적용",
          has_checkins: "실 체크인 데이터",
          has_baselines: "베이스라인 데이터",
        } as any)[flag],
        with_open: withOpen, with_cta: withCta,
        without_open: withoutOpen, without_cta: withoutCta,
        uplift: Math.round((withRate - withoutRate) * 10) / 10,
        withCi: wilson95(withCta, withOpen),
        withoutCi: wilson95(withoutCta, withoutOpen),
        pValue: twoPropPValue(withCta, withOpen, withoutCta, withoutOpen),
      });
    }
    return result;
  }, [filteredEvents]);

  // ─── Personalization SCORE buckets (0..4) ────────────────────────────
  // Buckets: Low (0-1), Mid (2), High (3-4)
  const scoreImpact = useMemo(() => {
    const bucketOf = (s: number): "low" | "mid" | "high" =>
      s >= 3 ? "high" : s === 2 ? "mid" : "low";
    const buckets: Record<"low" | "mid" | "high", { complete: number; cta: number; scoreSum: number; n: number }> = {
      low: { complete: 0, cta: 0, scoreSum: 0, n: 0 },
      mid: { complete: 0, cta: 0, scoreSum: 0, n: 0 },
      high: { complete: 0, cta: 0, scoreSum: 0, n: 0 },
    };
    for (const ev of filteredEvents) {
      const props = ev.event_properties || {};
      const score = Number(props.personalization_score);
      if (!Number.isFinite(score)) continue;
      const b = bucketOf(score);
      if (ev.event_name === EVENTS.complete) {
        buckets[b].complete += 1;
        buckets[b].scoreSum += score; buckets[b].n += 1;
      } else if (ev.event_name === EVENTS.cta) {
        buckets[b].cta += 1;
      }
    }
    const labels: Record<"low" | "mid" | "high", string> = {
      low: "낮음 (0-1)", mid: "중간 (2)", high: "높음 (3-4)",
    };
    const baseline = buckets.low; // compare to lowest bucket
    return (Object.keys(buckets) as Array<"low" | "mid" | "high">).map((k) => {
      const b = buckets[k];
      const rate = b.complete ? (b.cta / b.complete) * 100 : 0;
      const baseRate = baseline.complete ? (baseline.cta / baseline.complete) * 100 : 0;
      return {
        key: k,
        label: labels[k],
        n: b.complete,
        cta: b.cta,
        rate: Math.round(rate * 10) / 10,
        ci: wilson95(b.cta, b.complete),
        avgScore: b.n ? Math.round((b.scoreSum / b.n) * 10) / 10 : 0,
        upliftVsLow: k === "low" ? 0 : Math.round((rate - baseRate) * 10) / 10,
        pVsLow: k === "low" ? 1 : twoPropPValue(b.cta, b.complete, baseline.cta, baseline.complete),
      };
    });
  }, [filteredEvents]);

  const dwellAvg = useMemo(() => {
    const dwells = filteredEvents
      .filter((e) => e.event_name === EVENTS.complete)
      .map((e) => Number(e.event_properties?.dwell_seconds))
      .filter((n) => Number.isFinite(n) && n > 0);
    return dwells.length ? Math.round(dwells.reduce((a, b) => a + b, 0) / dwells.length) : 0;
  }, [filteredEvents]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#8a7a4d]" />
            워크북 미리보기 전환 퍼널
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            열기 → 완독 → 결제 클릭의 전환율을 로그인/디바이스/CTA 위치/완독 여부로 분석합니다.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-full p-1">
          <Filter className="w-3.5 h-3.5 text-muted-foreground ml-2" />
          {RANGE_OPTIONS.map((opt) => (
            <Button
              key={opt.key}
              variant={range === opt.key ? "default" : "ghost"}
              size="sm"
              onClick={() => setRange(opt.key)}
              className="rounded-full h-7 px-3 text-xs"
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Secondary filters */}
      <div className="flex items-center gap-3 flex-wrap text-xs">
        <FilterGroup
          label="CTA 위치"
          value={ctaLoc}
          onChange={(v) => setCtaLoc(v as CtaLocFilter)}
          options={[
            { v: "all", l: "전체" },
            { v: "lock_card_cta", l: "락 카드" },
            { v: "sample_modal_cta", l: "모달 내" },
          ]}
        />
        <FilterGroup
          label="완독 여부"
          value={viewedFull}
          onChange={(v) => setViewedFull(v as ViewedFullFilter)}
          options={[
            { v: "all", l: "전체" },
            { v: "yes", l: "완독" },
            { v: "no", l: "이탈" },
          ]}
        />
        <Badge variant="outline" className="text-[10px] ml-auto">
          이벤트 {filteredEvents.length.toLocaleString()}건 · 평균 체류 {dwellAvg}s
        </Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Overall funnel */}
          <Card className="bg-white rounded-2xl p-6 border">
            <h3 className="text-sm font-bold text-foreground mb-4">전체 퍼널</h3>
            <FunnelBar stats={stats.all} />
          </Card>

          {/* Daily trend chart */}
          <Card className="bg-white rounded-2xl p-6 border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#8a7a4d]" />
                일자별 추이 · 열기/완독/결제 클릭
              </h3>
              <Badge variant="outline" className="text-[10px]">
                {dailySeries.length}일
              </Badge>
            </div>
            <div className="h-64 -ml-2">
              {dailySeries.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  데이터 없음
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailySeries} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ fontSize: 11, borderRadius: 8 }}
                      labelFormatter={(l) => `${l} (이벤트 수)`}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="open" stroke="#C8B88A" strokeWidth={2} name="열기" dot={false} />
                    <Line type="monotone" dataKey="complete" stroke="#8a7a4d" strokeWidth={2} name="완독" dot={false} />
                    <Line type="monotone" dataKey="cta" stroke="#059669" strokeWidth={2} name="결제 클릭" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Conversion rate trend */}
            <div className="h-48 -ml-2 mt-4 pt-4 border-t">
              <p className="text-[11px] text-muted-foreground mb-2 ml-2">전환율 추이 (%)</p>
              {dailySeries.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  데이터 없음
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailySeries} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip
                      contentStyle={{ fontSize: 11, borderRadius: 8 }}
                      formatter={(v: any) => `${v}%`}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="completeRate" stroke="#8a7a4d" strokeWidth={2} name="열→완독 %" dot={false} />
                    <Line type="monotone" dataKey="ctaRate" stroke="#059669" strokeWidth={2} name="열→결제 %" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Personalization impact */}
          <Card className="bg-white rounded-2xl p-6 border">
            <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#8a7a4d]" />
              개인화 영향 분석
            </h3>
            <p className="text-[11px] text-muted-foreground mb-4">
              각 개인화 필드 적용 여부에 따른 결제 클릭률 차이 (완독 이벤트 모집단 기준).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {personalizationImpact.map((row) => {
                const withRate = row.with_open ? Math.round((row.with_cta / row.with_open) * 1000) / 10 : 0;
                const withoutRate = row.without_open ? Math.round((row.without_cta / row.without_open) * 1000) / 10 : 0;
                const positive = row.uplift > 0;
                return (
                  <div key={row.flag} className="rounded-xl border bg-muted/20 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-foreground">{row.label}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${positive ? "border-emerald-300 text-emerald-700 bg-emerald-50" : row.uplift < 0 ? "border-rose-300 text-rose-700 bg-rose-50" : ""}`}
                      >
                        {positive ? "+" : ""}{row.uplift}%p
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <Mini label="적용" rate={withRate} n={row.with_open} />
                      <Mini label="미적용" rate={withoutRate} n={row.without_open} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* By login */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">로그인 상태별</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stats.byLogin.map((s) => <SegmentCard key={s.label} stats={s} />)}
            </div>
          </div>

          {/* By device */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">디바이스별</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {stats.byDevice.map((s) => <SegmentCard key={s.label} stats={s} />)}
            </div>
          </div>

          {filteredEvents.length === 0 && (
            <Card className="bg-muted/30 rounded-2xl p-8 text-center text-sm text-muted-foreground">
              해당 조건에 수집된 이벤트가 없습니다.
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function FilterGroup({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{label}:</span>
      <div className="flex bg-muted rounded-full p-0.5">
        {options.map((o) => (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={`px-2.5 py-0.5 rounded-full text-[11px] transition ${
              value === o.v ? "bg-gray-900 text-white" : "text-foreground/70 hover:text-foreground"
            }`}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function FunnelBar({ stats }: { stats: SegmentStats }) {
  const max = Math.max(stats.open, 1);
  const steps = [
    { label: "열기", value: stats.open, icon: Eye, color: "bg-[#C8B88A]" },
    { label: "완독", value: stats.complete, icon: BookOpen, color: "bg-[#8a7a4d]" },
    { label: "결제 클릭", value: stats.cta, icon: MousePointerClick, color: "bg-emerald-600" },
  ];
  return (
    <div className="space-y-3">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const w = (s.value / max) * 100;
        const conv = i === 0 ? null : i === 1 ? stats.openToComplete : stats.openToCta;
        return (
          <div key={s.label}>
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-foreground/80">
                <Icon className="w-3.5 h-3.5" />
                <span className="font-medium">{s.label}</span>
                <span className="font-mono text-foreground/60">{s.value.toLocaleString()}</span>
              </div>
              {conv != null && (
                <span className="text-[11px] text-muted-foreground">
                  열기 대비 <span className="font-bold text-foreground">{conv}%</span>
                </span>
              )}
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${s.color} transition-all`}
                style={{ width: `${Math.max(w, s.value > 0 ? 4 : 0)}%` }}
              />
            </div>
          </div>
        );
      })}
      <div className="grid grid-cols-3 gap-2 pt-3 mt-3 border-t">
        <Metric label="열→완" value={`${stats.openToComplete}%`} />
        <Metric label="열→결제" value={`${stats.openToCta}%`} highlight />
        <Metric label="완→결제" value={`${stats.completeToCta}%`} />
      </div>
    </div>
  );
}

function SegmentCard({ stats }: { stats: SegmentStats }) {
  return (
    <Card className="bg-white rounded-2xl p-5 border">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-foreground">{stats.label}</span>
        <Badge variant="outline" className="text-[10px] font-mono">
          n={stats.open.toLocaleString()}
        </Badge>
      </div>
      <FunnelBar stats={stats} />
    </Card>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg py-2 px-2 text-center ${highlight ? "bg-emerald-50" : "bg-muted/40"}`}>
      <div className={`text-sm font-bold ${highlight ? "text-emerald-700" : "text-foreground"}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center justify-center gap-0.5">
        <ChevronRight className="w-2.5 h-2.5" />{label}
      </div>
    </div>
  );
}

function Mini({ label, rate, n }: { label: string; rate: number; n: number }) {
  return (
    <div className="bg-white rounded-lg p-2 border">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-sm font-bold text-foreground">{rate}%</div>
      <div className="text-[9px] font-mono text-muted-foreground">n={n}</div>
    </div>
  );
}
