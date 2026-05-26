import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_SESSIONS, DEMO_CLIENTS } from "@/lib/b2bCenter/demoData";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Ctx = { centerId: string; demo?: boolean };

const STATUS_COLOR: Record<string, string> = {
  completed: "bg-emerald-400",
  scheduled: "bg-neutral-300",
  cancelled: "bg-rose-300",
  cancelled_carry: "bg-amber-300",
  cancelled_makeup: "bg-sky-300",
};

const STATUS_LABEL: Record<string, string> = {
  completed: "완료", scheduled: "예정", cancelled: "취소", cancelled_carry: "이월", cancelled_makeup: "보강",
};

export default function MonthlyServicesPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [sessions, setSessions] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (demo) {
        setSessions(DEMO_SESSIONS);
        setClients(DEMO_CLIENTS.map((c) => ({ id: c.id, name: c.display_name })));
        setLoading(false);
        return;
      }
      const first = month.toISOString().slice(0, 10);
      const last = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().slice(0, 10);
      const [s, c] = await Promise.all([
        supabase.from("center_sessions").select("*").eq("center_id", centerId).gte("session_date", first).lte("session_date", last),
        supabase.from("center_clients").select("id, name").eq("center_id", centerId),
      ]);
      setSessions(s.data ?? []);
      setClients(c.data ?? []);
      setLoading(false);
    })();
  }, [centerId, demo, month]);

  const daysInMonth = useMemo(() => new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate(), [month]);

  const rowsWithSessions = clients.filter((c) => sessions.some((s) => s.client_id === c.id));

  const cellAt = (cid: string, day: number) => {
    const d = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return sessions.filter((s) => s.client_id === cid && s.session_date === d);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">월 서비스 관리</h1>
          <p className="text-sm text-neutral-500 mt-1">이용자별 월별 회기 현황 (완료·예정·취소·이월·보강).</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-full px-3 py-1.5">
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="p-1 hover:bg-neutral-100 rounded-full"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm font-medium px-2">{month.getFullYear()}.{String(month.getMonth() + 1).padStart(2, "0")}</span>
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="p-1 hover:bg-neutral-100 rounded-full"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex gap-3 mb-4 text-xs">
        {Object.entries(STATUS_LABEL).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded ${STATUS_COLOR[k]}`} /><span className="text-neutral-600">{v}</span></div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-auto">
        {loading ? <div className="p-12 text-center text-neutral-400">불러오는 중…</div> : (
          <table className="w-full text-xs">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left p-2 sticky left-0 bg-neutral-50 min-w-[120px]">이용자</th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => <th key={d} className="p-1 text-neutral-500 font-normal w-8">{d}</th>)}
                <th className="p-2 text-neutral-500">합계</th>
              </tr>
            </thead>
            <tbody>
              {rowsWithSessions.map((c) => {
                const total = sessions.filter((s) => s.client_id === c.id).length;
                return (
                  <tr key={c.id} className="border-t border-neutral-100">
                    <td className="p-2 font-medium sticky left-0 bg-white">{c.name}</td>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                      const ss = cellAt(c.id, d);
                      return <td key={d} className="p-1 text-center">
                        {ss.map((s) => <span key={s.id} className={`inline-block w-2.5 h-2.5 rounded ${STATUS_COLOR[s.status] ?? "bg-neutral-200"} mx-0.5`} title={`${s.start_time?.slice(0, 5)} · ${STATUS_LABEL[s.status]}`} />)}
                      </td>;
                    })}
                    <td className="p-2 text-right font-medium">{total}</td>
                  </tr>
                );
              })}
              {rowsWithSessions.length === 0 && <tr><td colSpan={daysInMonth + 2} className="p-8 text-center text-neutral-400">데이터 없음</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
