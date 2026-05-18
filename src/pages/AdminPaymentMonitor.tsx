import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Navigate } from "react-router-dom";
import { CheckCircle2, XCircle, Clock, RefreshCw, AlertTriangle } from "lucide-react";

interface PaymentRow {
  id: string;
  order_id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  approved_at: string | null;
  created_at: string;
}

interface Metrics {
  total: number;
  done: number;
  failed: number;
  cancelled: number;
  successRate: number;
  errorRate: number;
  avgProcessingMs: number;
}

const RANGE_HOURS = [
  { label: "24시간", value: 24 },
  { label: "7일", value: 24 * 7 },
  { label: "30일", value: 24 * 30 },
];

export default function AdminPaymentMonitor() {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [rangeH, setRangeH] = useState(24);
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const since = new Date(Date.now() - rangeH * 3600_000).toISOString();
    const { data } = await supabase
      .from("toss_payments")
      .select("id, order_id, amount, status, payment_method, approved_at, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(200);

    const list = (data ?? []) as PaymentRow[];
    setRows(list);

    const total = list.length;
    const done = list.filter((r) => r.status === "DONE").length;
    const failed = list.filter((r) => /FAIL|ERROR/i.test(r.status)).length;
    const cancelled = list.filter((r) => /CANCEL/i.test(r.status)).length;
    const processedMs = list
      .filter((r) => r.approved_at)
      .map((r) => new Date(r.approved_at!).getTime() - new Date(r.created_at).getTime())
      .filter((n) => n > 0 && n < 600_000);
    const avg = processedMs.length
      ? Math.round(processedMs.reduce((a, b) => a + b, 0) / processedMs.length)
      : 0;

    setMetrics({
      total,
      done,
      failed,
      cancelled,
      successRate: total ? Math.round((done / total) * 1000) / 10 : 0,
      errorRate: total ? Math.round(((failed + cancelled) / total) * 1000) / 10 : 0,
      avgProcessingMs: avg,
    });
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [isAdmin, rangeH]);

  if (adminLoading) return <div className="p-10 text-sm text-slate-500">권한 확인 중…</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const alert =
    metrics && metrics.total >= 5 && metrics.successRate < 90
      ? `⚠️ 성공률 ${metrics.successRate}% — 90% 미만, 즉시 확인 필요`
      : null;

  return (
    <div className="min-h-screen bg-white p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">결제 모니터링</h1>
          <p className="text-sm text-slate-500 mt-1">실시간 결제 성공률·오류율·처리 시간</p>
        </div>
        <div className="flex gap-2">
          {RANGE_HOURS.map((r) => (
            <Button
              key={r.value}
              size="sm"
              variant={rangeH === r.value ? "default" : "outline"}
              onClick={() => setRangeH(r.value)}
            >
              {r.label}
            </Button>
          ))}
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {alert && (
        <Card className="p-4 mb-4 border-red-200 bg-red-50 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-sm font-medium text-red-700">{alert}</span>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPI label="총 결제" value={metrics?.total ?? 0} />
        <KPI label="성공률" value={`${metrics?.successRate ?? 0}%`} tone="success" />
        <KPI label="오류·취소율" value={`${metrics?.errorRate ?? 0}%`} tone="danger" />
        <KPI
          label="평균 처리시간"
          value={metrics ? `${(metrics.avgProcessingMs / 1000).toFixed(1)}s` : "—"}
        />
      </div>

      <Card className="rounded-2xl">
        <div className="p-4 border-b text-sm font-semibold text-slate-700">최근 결제 50건</div>
        <div className="divide-y max-h-[500px] overflow-y-auto">
          {rows.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-400">아직 결제 내역이 없어요</div>
          )}
          {rows.slice(0, 50).map((r) => (
            <div key={r.id} className="p-3 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <StatusIcon status={r.status} />
                <div className="min-w-0">
                  <div className="font-mono text-xs text-slate-700 truncate">{r.order_id}</div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(r.created_at).toLocaleString("ko-KR")} ·{" "}
                    {r.payment_method ?? "—"}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0 pl-3">
                <div className="font-semibold">₩{r.amount.toLocaleString()}</div>
                <Badge variant="outline" className="text-[10px]">
                  {r.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function KPI({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "success" | "danger";
}) {
  const color =
    tone === "success" ? "text-emerald-600" : tone === "danger" ? "text-red-600" : "text-slate-900";
  return (
    <Card className="rounded-2xl p-4">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </Card>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "DONE") return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
  if (/CANCEL/i.test(status)) return <XCircle className="w-4 h-4 text-amber-500 shrink-0" />;
  if (/FAIL|ERROR/i.test(status)) return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
  return <Clock className="w-4 h-4 text-slate-400 shrink-0" />;
}
