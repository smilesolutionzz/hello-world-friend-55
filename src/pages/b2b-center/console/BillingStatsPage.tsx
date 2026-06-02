import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Lock, Download, AlertCircle, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

type Ctx = { centerId: string; demo?: boolean };
const KRW = (n: number) => `₩${(n || 0).toLocaleString("ko-KR")}`;

type Payment = {
  id: string;
  paid_at: string | null;
  amount_krw: number | null;
  voucher_amount: number | null;
  copayment: number | null;
  method: string | null;
  client_id: string | null;
  session_id: string | null;
  receipt_no: string | null;
};
type Client = { id: string; name: string | null };
type Therapist = { id: string; name: string | null };
type Session = { id: string; client_id: string | null; therapist_id: string | null; price_krw: number | null; session_date: string | null };
type Closing = { period_yyyymm: string; closed_at: string; total_charge_krw: number; total_payment_krw: number; total_ar_krw: number };

const monthKey = (d?: string | null) => (d ?? "").slice(0, 7);
const todayMonth = () => new Date().toISOString().slice(0, 7);

export default function BillingStatsPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [closings, setClosings] = useState<Closing[]>([]);
  const [period, setPeriod] = useState<string>(todayMonth());
  const [tab, setTab] = useState<"month" | "client" | "therapist" | "method" | "ar">("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (demo) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const [p, s, c, t, cl] = await Promise.all([
        supabase.from("center_payments").select("id,paid_at,amount_krw,voucher_amount,copayment,method,client_id,session_id,receipt_no").eq("center_id", centerId).limit(5000),
        supabase.from("center_sessions").select("id,client_id,therapist_id,price_krw,session_date").eq("center_id", centerId).limit(5000),
        supabase.from("center_clients").select("id,name").eq("center_id", centerId),
        supabase.from("center_therapists").select("id,name").eq("center_id", centerId),
        supabase.from("center_billing_closings").select("period_yyyymm,closed_at,total_charge_krw,total_payment_krw,total_ar_krw").eq("center_id", centerId).order("period_yyyymm", { ascending: false }),
      ]);
      setPayments((p.data ?? []) as Payment[]);
      setSessions((s.data ?? []) as Session[]);
      setClients((c.data ?? []) as Client[]);
      setTherapists((t.data ?? []) as Therapist[]);
      setClosings((cl.data ?? []) as Closing[]);
      setLoading(false);
    })();
  }, [centerId, demo]);

  const clientName = useMemo(() => new Map(clients.map((c) => [c.id, c.name ?? "—"])), [clients]);
  const therapistName = useMemo(() => new Map(therapists.map((t) => [t.id, t.name ?? "—"])), [therapists]);
  const sessionMap = useMemo(() => new Map(sessions.map((s) => [s.id, s])), [sessions]);

  // 월별 집계
  const monthly = useMemo(() => {
    const m = new Map<string, { period: string; total: number; voucher: number; copay: number; count: number }>();
    payments.forEach((p) => {
      const k = monthKey(p.paid_at);
      if (!k) return;
      const r = m.get(k) ?? { period: k, total: 0, voucher: 0, copay: 0, count: 0 };
      r.total += p.amount_krw ?? 0;
      r.voucher += p.voucher_amount ?? 0;
      r.copay += p.copayment ?? 0;
      r.count++;
      m.set(k, r);
    });
    return Array.from(m.values()).sort((a, b) => b.period.localeCompare(a.period));
  }, [payments]);

  // 선택 월
  const monthPayments = useMemo(() => payments.filter((p) => monthKey(p.paid_at) === period), [payments, period]);
  const monthSessions = useMemo(() => sessions.filter((s) => monthKey(s.session_date) === period), [sessions, period]);

  const byClient = useMemo(() => {
    const m = new Map<string, { name: string; total: number; count: number }>();
    monthPayments.forEach((p) => {
      const id = p.client_id ?? "unknown";
      const name = clientName.get(id) ?? "미지정";
      const r = m.get(id) ?? { name, total: 0, count: 0 };
      r.total += p.amount_krw ?? 0;
      r.count++;
      m.set(id, r);
    });
    return Array.from(m.values()).sort((a, b) => b.total - a.total);
  }, [monthPayments, clientName]);

  const byTherapist = useMemo(() => {
    const m = new Map<string, { name: string; total: number; count: number }>();
    monthPayments.forEach((p) => {
      const s = p.session_id ? sessionMap.get(p.session_id) : null;
      const tid = s?.therapist_id ?? "unknown";
      const name = therapistName.get(tid) ?? "미지정";
      const r = m.get(tid) ?? { name, total: 0, count: 0 };
      r.total += p.amount_krw ?? 0;
      r.count++;
      m.set(tid, r);
    });
    return Array.from(m.values()).sort((a, b) => b.total - a.total);
  }, [monthPayments, sessionMap, therapistName]);

  const byMethod = useMemo(() => {
    const m = new Map<string, { method: string; total: number; count: number }>();
    monthPayments.forEach((p) => {
      const k = p.method ?? "기타";
      const r = m.get(k) ?? { method: k, total: 0, count: 0 };
      r.total += p.amount_krw ?? 0;
      r.count++;
      m.set(k, r);
    });
    return Array.from(m.values()).sort((a, b) => b.total - a.total);
  }, [monthPayments]);

  // AR(미수금): 해당 월 회기 합 - 해당 월 수납 합 (이용자별)
  const arRows = useMemo(() => {
    const charge = new Map<string, number>();
    monthSessions.forEach((s) => {
      const id = s.client_id ?? "unknown";
      charge.set(id, (charge.get(id) ?? 0) + (s.price_krw ?? 0));
    });
    const paid = new Map<string, number>();
    monthPayments.forEach((p) => {
      const id = p.client_id ?? "unknown";
      paid.set(id, (paid.get(id) ?? 0) + (p.amount_krw ?? 0));
    });
    const ids = new Set<string>([...charge.keys(), ...paid.keys()]);
    return Array.from(ids).map((id) => ({
      name: clientName.get(id) ?? "미지정",
      charge: charge.get(id) ?? 0,
      paid: paid.get(id) ?? 0,
      ar: (charge.get(id) ?? 0) - (paid.get(id) ?? 0),
    })).filter((r) => r.ar > 0).sort((a, b) => b.ar - a.ar);
  }, [monthSessions, monthPayments, clientName]);

  const monthTotals = useMemo(() => {
    const charge = monthSessions.reduce((s, x) => s + (x.price_krw ?? 0), 0);
    const paid = monthPayments.reduce((s, x) => s + (x.amount_krw ?? 0), 0);
    return { charge, paid, ar: charge - paid };
  }, [monthSessions, monthPayments]);

  const isClosed = closings.some((c) => c.period_yyyymm === period);

  async function handleClose() {
    if (demo) { toast({ title: "데모 모드에서는 마감할 수 없어요" }); return; }
    if (!confirm(`${period} 월을 마감하시겠어요?\n마감 후 수정하려면 관리자가 해제해야 합니다.`)) return;
    const { error } = await supabase.from("center_billing_closings").insert({
      center_id: centerId, period_yyyymm: period,
      total_charge_krw: monthTotals.charge,
      total_payment_krw: monthTotals.paid,
      total_ar_krw: monthTotals.ar,
    });
    if (error) { toast({ title: "마감 실패", description: error.message, variant: "destructive" }); return; }
    toast({ title: `${period} 마감 완료` });
    setClosings((cl) => [{ period_yyyymm: period, closed_at: new Date().toISOString(), total_charge_krw: monthTotals.charge, total_payment_krw: monthTotals.paid, total_ar_krw: monthTotals.ar }, ...cl]);
  }

  function exportXlsx() {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(byClient.map((r) => ({ 이용자: r.name, 수납건수: r.count, 합계: r.total }))), "이용자별");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(byTherapist.map((r) => ({ 선생님: r.name, 수납건수: r.count, 합계: r.total }))), "선생님별");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(byMethod.map((r) => ({ 결제수단: r.method, 건수: r.count, 합계: r.total }))), "결제수단별");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(arRows.map((r) => ({ 이용자: r.name, 청구액: r.charge, 수납액: r.paid, 미수금: r.ar }))), "미수금");
    XLSX.writeFile(wb, `수납통계_${period}.xlsx`);
  }

  const maxMonthly = Math.max(...monthly.map((m) => m.total), 1);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Helmet><title>수납 통계 — AIHPRO 센터</title></Helmet>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-widest text-neutral-500">BILLING</p>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><CreditCard className="w-5 h-5 text-[#C8B88A]" /> 수납 통계 · 미수금</h1>
          <p className="text-sm text-neutral-500 mt-1">월별 · 이용자별 · 선생님별 · 결제수단별 매출과 미수금을 한눈에.</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className="px-3 py-2 rounded-lg border border-neutral-200 text-sm" />
          <button onClick={exportXlsx} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 text-sm hover:bg-neutral-50">
            <Download className="w-4 h-4" /> 엑셀
          </button>
          {isClosed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-100 text-neutral-500 text-sm"><Lock className="w-4 h-4" /> 마감됨</span>
          ) : (
            <button onClick={handleClose} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 text-white text-sm hover:bg-neutral-800">
              <Lock className="w-4 h-4" /> {period} 마감
            </button>
          )}
        </div>
      </header>

      {/* 핵심 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-neutral-200 p-5">
          <p className="text-xs text-neutral-500">청구액 ({period})</p>
          <p className="text-2xl font-semibold mt-1">{KRW(monthTotals.charge)}</p>
          <p className="text-xs text-neutral-400 mt-1">회기 {monthSessions.length}건 기준</p>
        </div>
        <div className="rounded-2xl bg-white border border-emerald-200 p-5">
          <p className="text-xs text-emerald-600">수납액</p>
          <p className="text-2xl font-semibold mt-1 text-emerald-700">{KRW(monthTotals.paid)}</p>
          <p className="text-xs text-neutral-400 mt-1">수납 {monthPayments.length}건</p>
        </div>
        <div className="rounded-2xl bg-white border border-rose-200 p-5">
          <p className="text-xs text-rose-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> 미수금</p>
          <p className="text-2xl font-semibold mt-1 text-rose-700">{KRW(Math.max(monthTotals.ar, 0))}</p>
          <p className="text-xs text-neutral-400 mt-1">이용자 {arRows.length}명</p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex flex-wrap gap-1 border-b border-neutral-200">
        {([
          ["month", "월별 매출"],
          ["client", "이용자별"],
          ["therapist", "선생님별"],
          ["method", "결제수단별"],
          ["ar", `미수금 (${arRows.length})`],
        ] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 text-sm border-b-2 -mb-px ${tab === k ? "border-neutral-900 text-neutral-900 font-medium" : "border-transparent text-neutral-500 hover:text-neutral-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-neutral-400 p-8 text-center">불러오는 중…</p>
      ) : (
        <div className="rounded-2xl bg-white border border-neutral-200 overflow-hidden">
          {tab === "month" && (
            monthly.length === 0 ? <p className="p-8 text-center text-neutral-400">수납 데이터가 없습니다.</p> : (
              <div className="p-5 space-y-2">
                {monthly.map((m) => (
                  <button key={m.period} onClick={() => setPeriod(m.period)} className={`w-full flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-neutral-50 ${m.period === period ? "bg-amber-50" : ""}`}>
                    <span className="text-xs font-mono w-20 text-neutral-500">{m.period}</span>
                    <div className="flex-1 bg-neutral-100 rounded-full h-5 relative overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-[#C8B88A]" style={{ width: `${(m.total / maxMonthly) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium w-32 text-right">{KRW(m.total)}</span>
                    <span className="text-xs text-neutral-400 w-12 text-right">{m.count}건</span>
                  </button>
                ))}
              </div>
            )
          )}
          {tab === "client" && <SimpleTable rows={byClient.map((r) => [r.name, `${r.count}건`, KRW(r.total)])} headers={["이용자", "건수", "합계"]} />}
          {tab === "therapist" && <SimpleTable rows={byTherapist.map((r) => [r.name, `${r.count}건`, KRW(r.total)])} headers={["선생님", "건수", "합계"]} />}
          {tab === "method" && <SimpleTable rows={byMethod.map((r) => [r.method, `${r.count}건`, KRW(r.total)])} headers={["결제수단", "건수", "합계"]} />}
          {tab === "ar" && (
            arRows.length === 0 ? <p className="p-8 text-center text-neutral-400">미수금이 없습니다. 잘하고 계세요.</p> :
              <SimpleTable rows={arRows.map((r) => [r.name, KRW(r.charge), KRW(r.paid), <span key="ar" className="text-rose-700 font-semibold">{KRW(r.ar)}</span>])} headers={["이용자", "청구액", "수납액", "미수금"]} />
          )}
        </div>
      )}

      {closings.length > 0 && (
        <section className="rounded-2xl bg-white border border-neutral-200 p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#C8B88A]" /> 정산 마감 이력</h3>
          <div className="text-xs text-neutral-600 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {closings.slice(0, 6).map((c) => (
              <div key={c.period_yyyymm} className="flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-50">
                <span className="font-mono">{c.period_yyyymm}</span>
                <span>수납 {KRW(c.total_payment_krw)} · 미수 {KRW(c.total_ar_krw)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  if (rows.length === 0) return <p className="p-8 text-center text-neutral-400">데이터가 없습니다.</p>;
  return (
    <table className="w-full text-sm">
      <thead className="bg-neutral-50 text-neutral-500 text-xs">
        <tr>{headers.map((h, i) => <th key={i} className={`p-3 ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-neutral-100">
            {r.map((cell, j) => <td key={j} className={`p-3 ${j === 0 ? "text-left" : "text-right"}`}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
