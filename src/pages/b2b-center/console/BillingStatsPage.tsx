import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Ctx = { centerId: string };
const KRW = (n: number) => `₩${n.toLocaleString("ko-KR")}`;

export default function BillingStatsPage() {
  const { centerId } = useOutletContext<Ctx>();
  const [monthly, setMonthly] = useState<Array<{ month: string; total: number; count: number }>>([]);
  const [totals, setTotals] = useState({ total: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("center_payments")
        .select("paid_at, amount_krw").eq("center_id", centerId).limit(5000);
      const agg = new Map<string, { month: string; total: number; count: number }>();
      let total = 0, count = 0;
      (data ?? []).forEach((p: any) => {
        const m = (p.paid_at ?? "").slice(0, 7);
        if (!m) return;
        const r = agg.get(m) ?? { month: m, total: 0, count: 0 };
        r.total += p.amount_krw || 0; r.count++;
        agg.set(m, r);
        total += p.amount_krw || 0; count++;
      });
      setMonthly(Array.from(agg.values()).sort((a, b) => b.month.localeCompare(a.month)));
      setTotals({ total, count });
      setLoading(false);
    })();
  }, [centerId]);

  const max = Math.max(...monthly.map(m => m.total), 1);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-1">수납 통계</h1>
      <p className="text-sm text-neutral-500 mb-6">총 매출 {KRW(totals.total)} · {totals.count}건</p>

      {loading ? <p className="text-neutral-400">불러오는 중…</p> : monthly.length === 0 ? (
        <p className="text-neutral-400">수납 데이터가 없습니다.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <p className="text-xs text-neutral-500 mb-4 uppercase tracking-widest">월별 매출</p>
          <div className="space-y-2">
            {monthly.map((m) => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="text-xs font-mono w-20 text-neutral-500">{m.month}</span>
                <div className="flex-1 bg-neutral-100 rounded-full h-6 relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-[#C8B88A] rounded-full" style={{ width: `${m.total / max * 100}%` }} />
                </div>
                <span className="text-sm font-medium w-32 text-right">{KRW(m.total)}</span>
                <span className="text-xs text-neutral-400 w-12 text-right">{m.count}건</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
