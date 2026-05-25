import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Ctx = { centerId: string };
type Row = { date: string; total: number; completed: number; cancelled: number };

export default function AttendancePage() {
  const { centerId } = useOutletContext<Ctx>();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("center_sessions")
        .select("session_date, status")
        .eq("center_id", centerId)
        .order("session_date", { ascending: false })
        .limit(500);
      const agg = new Map<string, Row>();
      (data ?? []).forEach((s: any) => {
        const r = agg.get(s.session_date) ?? { date: s.session_date, total: 0, completed: 0, cancelled: 0 };
        r.total++;
        if (s.status === "completed") r.completed++;
        if (s.status?.startsWith("cancelled")) r.cancelled++;
        agg.set(s.session_date, r);
      });
      setRows(Array.from(agg.values()).sort((a, b) => b.date.localeCompare(a.date)));
      setLoading(false);
    })();
  }, [centerId]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">일별 접수인원 현황</h1>
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="text-left p-3">날짜</th>
              <th className="text-right p-3">총 회기</th>
              <th className="text-right p-3">완료</th>
              <th className="text-right p-3">취소</th>
              <th className="text-right p-3">완료율</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="p-8 text-center text-neutral-400">불러오는 중…</td></tr> :
             rows.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-neutral-400">데이터 없음</td></tr> :
             rows.map((r) => (
              <tr key={r.date} className="border-t border-neutral-100">
                <td className="p-3 font-medium">{r.date}</td>
                <td className="p-3 text-right">{r.total}</td>
                <td className="p-3 text-right text-emerald-600">{r.completed}</td>
                <td className="p-3 text-right text-neutral-400">{r.cancelled}</td>
                <td className="p-3 text-right">{r.total ? Math.round(r.completed / r.total * 100) : 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
