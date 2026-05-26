import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_SESSIONS, DEMO_CLIENTS, DEMO_STATS, DEMO_THERAPISTS } from "@/lib/b2bCenter/demoData";
import { TrendingUp, Users, AlertCircle, Activity, Calendar } from "lucide-react";

type Ctx = { centerId: string; demo?: boolean };

function fmtKRW(n: number) { return n.toLocaleString() + "원"; }

export default function OpsDashboardPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (demo) {
        const sessions = DEMO_SESSIONS;
        const completed = sessions.filter((s) => s.status === "completed");
        const cancelled = sessions.filter((s) => s.status?.startsWith("cancelled"));
        const revenue = completed.reduce((sum, s) => sum + s.price_krw, 0);
        const byTherapist = DEMO_THERAPISTS.map((t) => ({
          name: t.name,
          color: t.color,
          sessions: sessions.filter((s) => s.therapist_id === t.id && s.status === "completed").length,
        }));
        setData({
          revenue: DEMO_STATS.monthlyRevenue,
          weekRevenue: revenue,
          sessions: DEMO_STATS.monthlySessions,
          weekSessions: sessions.length,
          attendance: DEMO_STATS.attendance,
          activeClients: DEMO_STATS.activeClients,
          pendingClients: DEMO_STATS.pendingClients,
          cancelRate: cancelled.length / Math.max(sessions.length, 1),
          byTherapist,
          riskSignals: [
            { type: "취소율 급증", desc: "이번 주 취소율 9.1% (지난주 대비 +3.2%p)", level: "warning" },
            { type: "대기 이용자", desc: "2명이 3주 이상 대기 중 — 일정 배정 필요", level: "info" },
          ],
        });
        setLoading(false);
        return;
      }

      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
      const monthStartStr = monthStart.toISOString().slice(0, 10);

      const [sessRes, payRes, clientRes, therRes] = await Promise.all([
        supabase.from("center_sessions").select("status, price_krw, therapist_id").eq("center_id", centerId).gte("session_date", monthStartStr),
        supabase.from("center_payments").select("amount_krw").eq("center_id", centerId).gte("paid_at", monthStartStr),
        supabase.from("center_clients").select("status").eq("center_id", centerId),
        supabase.from("center_therapists").select("id, name"),
      ]);
      const sessions = sessRes.data ?? [];
      const completed = sessions.filter((s: any) => s.status === "completed");
      const cancelled = sessions.filter((s: any) => s.status?.startsWith("cancelled"));
      const revenue = (payRes.data ?? []).reduce((s: number, p: any) => s + (p.amount_krw ?? 0), 0);
      const palette = ["#FFB4A2", "#B8E0D2", "#FFD6A5", "#CAFFBF", "#A0C4FF", "#FFC8DD"];
      const byTherapist = (therRes.data ?? []).map((t: any, i: number) => ({
        name: t.name,
        color: palette[i % palette.length],
        sessions: completed.filter((s: any) => s.therapist_id === t.id).length,
      }));
      const clients = clientRes.data ?? [];
      setData({
        revenue,
        weekRevenue: 0,
        sessions: sessions.length,
        weekSessions: 0,
        attendance: sessions.length ? completed.length / sessions.length : 0,
        activeClients: clients.filter((c: any) => c.status === "active").length,
        pendingClients: clients.filter((c: any) => c.status === "waiting").length,
        cancelRate: sessions.length ? cancelled.length / sessions.length : 0,
        byTherapist,
        riskSignals: [],
      });
      setLoading(false);
    })();
  }, [centerId, demo]);

  if (loading || !data) return <div className="p-12 text-center text-neutral-400">불러오는 중…</div>;

  const maxSessions = Math.max(...data.byTherapist.map((t: any) => t.sessions), 1);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-1">운영 KPI 대시보드</h1>
      <p className="text-sm text-neutral-500 mb-6">North Star Metric · 위험신호 · 치료사별 가동률을 한눈에.</p>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPI icon={TrendingUp} label="이번 달 매출" value={fmtKRW(data.revenue)} color="#C8B88A" />
        <KPI icon={Calendar} label="이번 달 회기" value={data.sessions.toString()} color="#A0C4FF" />
        <KPI icon={Activity} label="출석률" value={`${Math.round(data.attendance * 100)}%`} color="#B8E0D2" />
        <KPI icon={Users} label="활성/대기" value={`${data.activeClients} / ${data.pendingClients}`} color="#FFB4A2" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h3 className="font-semibold mb-4">치료사별 회기 수 (이번 달)</h3>
          <div className="space-y-3">
            {data.byTherapist.map((t: any) => (
              <div key={t.name}>
                <div className="flex justify-between text-xs mb-1"><span>{t.name}</span><span className="text-neutral-500">{t.sessions}</span></div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(t.sessions / maxSessions) * 100}%`, background: t.color }} />
                </div>
              </div>
            ))}
            {data.byTherapist.length === 0 && <p className="text-sm text-neutral-400">데이터 없음</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-500" /> 위험신호</h3>
          <div className="space-y-3">
            {data.riskSignals.length === 0 ? (
              <p className="text-sm text-neutral-400">현재 감지된 위험신호가 없어요.</p>
            ) : data.riskSignals.map((r: any, i: number) => (
              <div key={i} className={`rounded-xl border p-3 ${r.level === "warning" ? "bg-amber-50 border-amber-200" : "bg-sky-50 border-sky-200"}`}>
                <p className="text-sm font-medium">{r.type}</p>
                <p className="text-xs text-neutral-600 mt-0.5">{r.desc}</p>
              </div>
            ))}
            <div className="pt-3 mt-3 border-t border-neutral-100">
              <p className="text-xs text-neutral-500">취소율</p>
              <p className="text-lg font-semibold">{(data.cancelRate * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-neutral-500">{label}</p>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: color + "33" }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
