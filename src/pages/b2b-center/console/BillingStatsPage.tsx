import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Lock, Download, AlertCircle, TrendingUp, Users, Sparkles, ChevronRight } from "lucide-react";
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
type Session = { id: string; client_id: string | null; therapist_id: string | null; price_krw: number | null; session_date: string | null; status?: string | null };
type Closing = { period_yyyymm: string; closed_at: string; total_charge_krw: number; total_payment_krw: number; total_ar_krw: number };

const dayKey = (d?: string | null) => (d ?? "").slice(0, 10);
const today = () => new Date().toISOString().slice(0, 10);
const monthOf = (d: string) => d.slice(0, 7);

export default function BillingStatsPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [closings, setClosings] = useState<Closing[]>([]);
  const [period, setPeriod] = useState<string>(today());
  const [tab, setTab] = useState<"today" | "daily" | "client" | "therapist" | "method" | "ar">("today");
  const [loading, setLoading] = useState(true);
  const [autoRegistering, setAutoRegistering] = useState(false);
  const [autoJumped, setAutoJumped] = useState(false);

  useEffect(() => {
    if (demo) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const [p, s, c, t, cl] = await Promise.all([
        supabase.from("center_payments").select("id,paid_at,amount_krw,voucher_amount,copayment,method,client_id,session_id,receipt_no").eq("center_id", centerId).limit(5000),
        supabase.from("center_sessions").select("id,client_id,therapist_id,price_krw,session_date,status").eq("center_id", centerId).limit(5000),
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

  // 오늘 회기가 없으면 가장 최근 회기 일자로 자동 이동 (최초 1회)
  useEffect(() => {
    if (loading || autoJumped || sessions.length === 0) return;
    const hasToday = sessions.some((s) => dayKey(s.session_date) === period);
    if (hasToday) { setAutoJumped(true); return; }
    const sorted = [...sessions]
      .map((s) => dayKey(s.session_date))
      .filter(Boolean)
      .sort((a, b) => b.localeCompare(a));
    // 오늘 이전(또는 같은) 가장 가까운 날짜 우선, 없으면 가장 가까운 미래
    const past = sorted.find((d) => d <= period);
    const next = past ?? sorted[sorted.length - 1];
    if (next && next !== period) {
      setPeriod(next);
      toast({ title: "오늘 회기가 없어 가장 가까운 일자로 이동했어요", description: next });
    }
    setAutoJumped(true);
  }, [loading, sessions, period, autoJumped]);

  const clientName = useMemo(() => new Map(clients.map((c) => [c.id, c.name ?? "—"])), [clients]);
  const therapistName = useMemo(() => new Map(therapists.map((t) => [t.id, t.name ?? "—"])), [therapists]);
  const sessionMap = useMemo(() => new Map(sessions.map((s) => [s.id, s])), [sessions]);

  // 일별 매출 (최근 14일)
  const daily = useMemo(() => {
    const m = new Map<string, { day: string; total: number; count: number }>();
    payments.forEach((p) => {
      const k = dayKey(p.paid_at);
      if (!k) return;
      const r = m.get(k) ?? { day: k, total: 0, count: 0 };
      r.total += p.amount_krw ?? 0;
      r.count++;
      m.set(k, r);
    });
    return Array.from(m.values()).sort((a, b) => b.day.localeCompare(a.day)).slice(0, 30);
  }, [payments]);

  // 선택 일자
  const dayPayments = useMemo(() => payments.filter((p) => dayKey(p.paid_at) === period), [payments, period]);
  const daySessions = useMemo(() => sessions.filter((s) => dayKey(s.session_date) === period), [sessions, period]);

  // 당일 이용자 (선택일 기준 회기 있는 이용자)
  const todayClients = useMemo(() => {
    const ids = new Set<string>();
    daySessions.forEach((s) => { if (s.client_id) ids.add(s.client_id); });
    return Array.from(ids).map((id) => {
      const sess = daySessions.filter((s) => s.client_id === id);
      const charge = sess.reduce((a, s) => a + (s.price_krw ?? 0), 0);
      const paid = dayPayments.filter((p) => p.client_id === id).reduce((a, p) => a + (p.amount_krw ?? 0), 0);
      const hasPayment = dayPayments.some((p) => p.client_id === id);
      return {
        id,
        name: clientName.get(id) ?? "미지정",
        sessionCount: sess.length,
        charge,
        paid,
        ar: charge - paid,
        hasPayment,
        sessions: sess,
      };
    }).sort((a, b) => Number(a.hasPayment) - Number(b.hasPayment) || b.charge - a.charge);
  }, [daySessions, dayPayments, clientName]);

  const byClient = useMemo(() => {
    const m = new Map<string, { name: string; total: number; count: number }>();
    dayPayments.forEach((p) => {
      const id = p.client_id ?? "unknown";
      const name = clientName.get(id) ?? "미지정";
      const r = m.get(id) ?? { name, total: 0, count: 0 };
      r.total += p.amount_krw ?? 0;
      r.count++;
      m.set(id, r);
    });
    return Array.from(m.values()).sort((a, b) => b.total - a.total);
  }, [dayPayments, clientName]);

  const byTherapist = useMemo(() => {
    const m = new Map<string, { name: string; total: number; count: number }>();
    dayPayments.forEach((p) => {
      const s = p.session_id ? sessionMap.get(p.session_id) : null;
      const tid = s?.therapist_id ?? "unknown";
      const name = therapistName.get(tid) ?? "미지정";
      const r = m.get(tid) ?? { name, total: 0, count: 0 };
      r.total += p.amount_krw ?? 0;
      r.count++;
      m.set(tid, r);
    });
    return Array.from(m.values()).sort((a, b) => b.total - a.total);
  }, [dayPayments, sessionMap, therapistName]);

  const byMethod = useMemo(() => {
    const m = new Map<string, { method: string; total: number; count: number }>();
    dayPayments.forEach((p) => {
      const k = p.method ?? "기타";
      const r = m.get(k) ?? { method: k, total: 0, count: 0 };
      r.total += p.amount_krw ?? 0;
      r.count++;
      m.set(k, r);
    });
    return Array.from(m.values()).sort((a, b) => b.total - a.total);
  }, [dayPayments]);

  const arRows = useMemo(() => todayClients.filter((c) => c.ar > 0), [todayClients]);

  const dayTotals = useMemo(() => {
    const charge = daySessions.reduce((s, x) => s + (x.price_krw ?? 0), 0);
    const paid = dayPayments.reduce((s, x) => s + (x.amount_krw ?? 0), 0);
    return { charge, paid, ar: charge - paid };
  }, [daySessions, dayPayments]);

  const isClosed = closings.some((c) => c.period_yyyymm === monthOf(period));
  const isToday = period === today();

  async function handleClose() {
    if (demo) { toast({ title: "데모 모드에서는 마감할 수 없어요" }); return; }
    const month = monthOf(period);
    if (!confirm(`${month} 월을 마감하시겠어요?\n마감 후 수정하려면 관리자가 해제해야 합니다.`)) return;
    // 월 전체 합산
    const monthSessions = sessions.filter((s) => monthOf(dayKey(s.session_date)) === month);
    const monthPays = payments.filter((p) => monthOf(dayKey(p.paid_at)) === month);
    const charge = monthSessions.reduce((s, x) => s + (x.price_krw ?? 0), 0);
    const paid = monthPays.reduce((s, x) => s + (x.amount_krw ?? 0), 0);
    const { error } = await supabase.from("center_billing_closings").insert({
      center_id: centerId, period_yyyymm: month,
      total_charge_krw: charge, total_payment_krw: paid, total_ar_krw: charge - paid,
    });
    if (error) { toast({ title: "마감 실패", description: error.message, variant: "destructive" }); return; }
    toast({ title: `${month} 마감 완료` });
    setClosings((cl) => [{ period_yyyymm: month, closed_at: new Date().toISOString(), total_charge_krw: charge, total_payment_krw: paid, total_ar_krw: charge - paid }, ...cl]);
  }

  // 당일 이용자 자동 등록: 결제 미등록 회기를 pending 청구건으로 일괄 생성
  async function autoRegisterToday() {
    if (demo) { toast({ title: "데모 모드에서는 등록할 수 없어요" }); return; }
    const targets = daySessions.filter((s) => {
      if (!s.client_id) return false;
      return !dayPayments.some((p) => p.session_id === s.id);
    });
    if (targets.length === 0) {
      toast({ title: "이미 모두 등록되었어요", description: `${period} 회기 ${daySessions.length}건은 전부 청구가 잡혀 있습니다.` });
      return;
    }
    if (!confirm(`${period} 회기 ${targets.length}건을 미수 청구로 자동 등록할까요?\n등록 후 수납 처리 화면에서 결제 받으시면 됩니다.`)) return;
    setAutoRegistering(true);
    const rows = targets.map((s) => ({
      center_id: centerId,
      client_id: s.client_id,
      session_id: s.id,
      amount_krw: 0,
      voucher_amount: 0,
      copayment: s.price_krw ?? 0,
      method: "미수" as const,
      paid_at: period,
    }));
    const { data, error } = await supabase.from("center_payments").insert(rows).select("id,paid_at,amount_krw,voucher_amount,copayment,method,client_id,session_id,receipt_no");
    setAutoRegistering(false);
    if (error) { toast({ title: "자동 등록 실패", description: error.message, variant: "destructive" }); return; }
    setPayments((prev) => [...prev, ...((data ?? []) as Payment[])]);
    toast({ title: `${targets.length}건 자동 등록 완료`, description: "수납 처리 화면에서 결제 받아주세요." });
  }

  function exportXlsx() {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(todayClients.map((r) => ({ 이용자: r.name, 회기수: r.sessionCount, 청구액: r.charge, 수납액: r.paid, 미수금: r.ar }))), `${period} 이용자`);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(daily.map((r) => ({ 일자: r.day, 건수: r.count, 합계: r.total }))), "일별");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(byTherapist.map((r) => ({ 선생님: r.name, 수납건수: r.count, 합계: r.total }))), "선생님별");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(byMethod.map((r) => ({ 결제수단: r.method, 건수: r.count, 합계: r.total }))), "결제수단별");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(arRows.map((r) => ({ 이용자: r.name, 청구액: r.charge, 수납액: r.paid, 미수금: r.ar }))), "미수금");
    XLSX.writeFile(wb, `수납통계_${period}.xlsx`);
  }

  const maxDaily = Math.max(...daily.map((m) => m.total), 1);
  const unregisteredCount = daySessions.filter((s) => !dayPayments.some((p) => p.session_id === s.id)).length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Helmet><title>수납 통계 — AIHPRO 센터</title></Helmet>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-widest text-neutral-500">BILLING</p>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><CreditCard className="w-5 h-5 text-[#C8B88A]" /> 일별 수납 · 미수금</h1>
          <p className="text-sm text-neutral-500 mt-1">당일 이용자 자동 등록 · 일별 매출 · 선생님 / 결제수단 분석.</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={period} onChange={(e) => setPeriod(e.target.value)} className="px-3 py-2 rounded-lg border border-neutral-200 text-sm" />
          {!isToday && (
            <button onClick={() => setPeriod(today())} className="px-3 py-2 rounded-lg border border-neutral-200 text-sm hover:bg-neutral-50">오늘</button>
          )}
          <button onClick={exportXlsx} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 text-sm hover:bg-neutral-50">
            <Download className="w-4 h-4" /> 엑셀
          </button>
          {isClosed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-100 text-neutral-500 text-sm"><Lock className="w-4 h-4" /> {monthOf(period)} 마감됨</span>
          ) : (
            <button onClick={handleClose} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 text-white text-sm hover:bg-neutral-800">
              <Lock className="w-4 h-4" /> {monthOf(period)} 마감
            </button>
          )}
        </div>
      </header>

      {/* 자동 등록 배너 */}
      {daySessions.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center"><Sparkles className="w-5 h-5 text-amber-700" /></div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">{period} 이용자 {todayClients.length}명 · 회기 {daySessions.length}건</p>
              <p className="text-xs text-neutral-600 mt-0.5">청구 미등록 {unregisteredCount}건 — 자동 등록하면 미수 목록에 즉시 잡힙니다.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/b2b-center/app/billing/process")} className="px-3 py-2 rounded-lg border border-neutral-200 text-sm hover:bg-white inline-flex items-center gap-1">
              수납 처리 <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={autoRegisterToday}
              disabled={autoRegistering || unregisteredCount === 0}
              className="px-3 py-2 rounded-lg bg-neutral-900 text-white text-sm hover:bg-neutral-800 disabled:opacity-40 inline-flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" /> 당일 이용자 자동 등록 ({unregisteredCount})
            </button>
          </div>
        </div>
      )}

      {/* 핵심 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-neutral-200 p-5">
          <p className="text-xs text-neutral-500">청구액 ({period})</p>
          <p className="text-2xl font-semibold mt-1">{KRW(dayTotals.charge)}</p>
          <p className="text-xs text-neutral-400 mt-1">회기 {daySessions.length}건 기준</p>
        </div>
        <div className="rounded-2xl bg-white border border-emerald-200 p-5">
          <p className="text-xs text-emerald-600">수납액</p>
          <p className="text-2xl font-semibold mt-1 text-emerald-700">{KRW(dayTotals.paid)}</p>
          <p className="text-xs text-neutral-400 mt-1">수납 {dayPayments.length}건</p>
        </div>
        <div className="rounded-2xl bg-white border border-rose-200 p-5">
          <p className="text-xs text-rose-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> 미수금</p>
          <p className="text-2xl font-semibold mt-1 text-rose-700">{KRW(Math.max(dayTotals.ar, 0))}</p>
          <p className="text-xs text-neutral-400 mt-1">이용자 {arRows.length}명</p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex flex-wrap gap-1 border-b border-neutral-200">
        {([
          ["today", `당일 이용자 (${todayClients.length})`],
          ["daily", "일별 매출"],
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
          {tab === "today" && (
            todayClients.length === 0 ? <p className="p-8 text-center text-neutral-400">{period} 예정된 회기가 없습니다.</p> : (
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 text-neutral-500 text-xs">
                  <tr>
                    <th className="p-3 text-left">이용자</th>
                    <th className="p-3 text-right">회기수</th>
                    <th className="p-3 text-right">청구액</th>
                    <th className="p-3 text-right">수납액</th>
                    <th className="p-3 text-right">미수금</th>
                    <th className="p-3 text-right">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {todayClients.map((c) => (
                    <tr key={c.id} className="border-t border-neutral-100 hover:bg-neutral-50 cursor-pointer" onClick={() => navigate("/b2b-center/app/billing/process")}>
                      <td className="p-3">{c.name}</td>
                      <td className="p-3 text-right">{c.sessionCount}건</td>
                      <td className="p-3 text-right">{KRW(c.charge)}</td>
                      <td className="p-3 text-right text-emerald-700">{KRW(c.paid)}</td>
                      <td className="p-3 text-right text-rose-700 font-medium">{c.ar > 0 ? KRW(c.ar) : "—"}</td>
                      <td className="p-3 text-right">
                        {c.hasPayment
                          ? <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs">등록됨</span>
                          : <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs">미등록</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
          {tab === "daily" && (
            daily.length === 0 ? <p className="p-8 text-center text-neutral-400">수납 데이터가 없습니다.</p> : (
              <div className="p-5 space-y-2">
                {daily.map((m) => (
                  <button key={m.day} onClick={() => setPeriod(m.day)} className={`w-full flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-neutral-50 ${m.day === period ? "bg-amber-50" : ""}`}>
                    <span className="text-xs font-mono w-24 text-neutral-500">{m.day}</span>
                    <div className="flex-1 bg-neutral-100 rounded-full h-5 relative overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-[#C8B88A]" style={{ width: `${(m.total / maxDaily) * 100}%` }} />
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
