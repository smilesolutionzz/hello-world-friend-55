import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, TrendingUp, MousePointerClick, Eye, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type RangeKey = "7d" | "30d" | "all";

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
  openToComplete: number; // %
  openToCta: number; // %
  completeToCta: number; // %
}

function emptySeg(label: string): SegmentStats {
  return {
    label,
    open: 0,
    complete: 0,
    cta: 0,
    openToComplete: 0,
    openToCta: 0,
    completeToCta: 0,
  };
}

function pct(n: number, d: number) {
  if (!d) return 0;
  return Math.round((n / d) * 1000) / 10;
}

function fillRates(s: SegmentStats): SegmentStats {
  return {
    ...s,
    openToComplete: pct(s.complete, s.open),
    openToCta: pct(s.cta, s.open),
    completeToCta: pct(s.cta, s.complete),
  };
}

export default function WorkbookFunnelDashboard() {
  const [range, setRange] = useState<RangeKey>("30d");
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
          .limit(5000);

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
    return () => {
      cancelled = true;
    };
  }, [range]);

  const stats = useMemo(() => {
    const all = emptySeg("전체");
    const loggedIn = emptySeg("로그인");
    const guest = emptySeg("비로그인");
    const mobile = emptySeg("모바일");
    const tablet = emptySeg("태블릿");
    const desktop = emptySeg("데스크톱");

    for (const ev of events) {
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
  }, [events]);

  const dwellAvg = useMemo(() => {
    const dwells = events
      .filter((e) => e.event_name === EVENTS.complete)
      .map((e) => Number(e.event_properties?.dwell_seconds))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (!dwells.length) return 0;
    return Math.round(dwells.reduce((a, b) => a + b, 0) / dwells.length);
  }, [events]);

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
            열기 → 완독 → 결제 클릭의 전환율을 로그인 상태와 디바이스별로 추적합니다.
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Overall funnel */}
          <Card className="bg-white rounded-2xl p-6 border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">전체 퍼널</h3>
              <Badge variant="outline" className="text-[10px]">
                평균 체류 {dwellAvg}s
              </Badge>
            </div>
            <FunnelBar stats={stats.all} />
          </Card>

          {/* By login */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">로그인 상태별</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stats.byLogin.map((s) => (
                <SegmentCard key={s.label} stats={s} />
              ))}
            </div>
          </div>

          {/* By device */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">디바이스별</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {stats.byDevice.map((s) => (
                <SegmentCard key={s.label} stats={s} />
              ))}
            </div>
          </div>

          {events.length === 0 && (
            <Card className="bg-muted/30 rounded-2xl p-8 text-center text-sm text-muted-foreground">
              해당 기간에 수집된 이벤트가 없습니다. 사용자가 /mind-track 에서 워크북 샘플을 열면 자동으로 기록됩니다.
            </Card>
          )}

          <p className="text-[11px] text-muted-foreground">
            * 비로그인 사용자는 RLS 정책상 DB에 저장되지 않습니다 (GA4에는 별도 기록).
            전체 비로그인 트래픽은 GA에서 확인하세요.
          </p>
        </>
      )}
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
        const conv =
          i === 0
            ? null
            : i === 1
              ? stats.openToComplete
              : stats.openToCta;
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
      <div className={`text-sm font-bold ${highlight ? "text-emerald-700" : "text-foreground"}`}>
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center justify-center gap-0.5">
        <TrendingUp className="w-2.5 h-2.5" />
        {label}
      </div>
    </div>
  );
}
