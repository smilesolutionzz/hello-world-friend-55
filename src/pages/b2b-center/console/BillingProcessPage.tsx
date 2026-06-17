import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, X, Wallet, CreditCard, Banknote, ArrowLeftRight, Info, ChevronDown, Search } from "lucide-react";

type Ctx = { centerId: string; demo?: boolean };
const KRW = (n: number) => `${(n || 0).toLocaleString("ko-KR")}원`;
const todayMonth = () => new Date().toISOString().slice(0, 7);
const monthKey = (d?: string | null) => (d ?? "").slice(0, 7);

type Client = { id: string; name: string | null; birth_date: string | null; gender: string | null };
type Therapist = { id: string; name: string | null };
type Program = { id: string; name: string | null; price_krw: number | null };
type Session = {
  id: string;
  client_id: string | null;
  therapist_id: string | null;
  program_id: string | null;
  session_date: string | null;
  status: string | null;
  price_krw: number | null;
  is_voucher: boolean | null;
};
type Payment = {
  id: string;
  client_id: string | null;
  session_id: string | null;
  paid_at: string | null;
  amount_krw: number | null;
  method: string | null;
  meta: any;
};

type Group = {
  key: string; // therapist|program
  therapistId: string | null;
  programId: string | null;
  therapistName: string;
  programName: string;
  unitPrice: number;
  sessions: Session[];
  done: number;
  planned: number;
  totalCharge: number;
  paid: number;
};

export default function BillingProcessPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const [period, setPeriod] = useState(todayMonth());
  const [clients, setClients] = useState<Client[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [unpaidOnly, setUnpaidOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalGroup, setModalGroup] = useState<Group | null>(null);

  useEffect(() => {
    if (demo) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const [c, t, pr, s, p] = await Promise.all([
        supabase.from("center_clients").select("id,name,birth_date,gender").eq("center_id", centerId).eq("status", "active").order("name"),
        supabase.from("center_therapists").select("id,name").eq("center_id", centerId),
        supabase.from("center_programs").select("id,name,price_krw").eq("center_id", centerId),
        supabase.from("center_sessions").select("id,client_id,therapist_id,program_id,session_date,status,price_krw,is_voucher").eq("center_id", centerId).limit(10000),
        supabase.from("center_payments").select("id,client_id,session_id,paid_at,amount_krw,method,meta").eq("center_id", centerId).limit(10000),
      ]);
      setClients((c.data ?? []) as Client[]);
      setTherapists((t.data ?? []) as Therapist[]);
      setPrograms((pr.data ?? []) as Program[]);
      setSessions((s.data ?? []) as Session[]);
      setPayments((p.data ?? []) as Payment[]);
      setLoading(false);
    })();
  }, [centerId, demo]);

  const therapistName = useMemo(() => new Map(therapists.map((t) => [t.id, t.name ?? "—"])), [therapists]);
  const programName = useMemo(() => new Map(programs.map((p) => [p.id, p.name ?? "—"])), [programs]);

  // Per-client unpaid summary for the side list
  const clientSummary = useMemo(() => {
    const map = new Map<string, { charge: number; paid: number; planned: number; done: number }>();
    sessions.forEach((s) => {
      if (monthKey(s.session_date) !== period) return;
      const id = s.client_id ?? "—";
      const r = map.get(id) ?? { charge: 0, paid: 0, planned: 0, done: 0 };
      r.charge += s.price_krw ?? 0;
      if (s.status === "completed" || s.status === "done") r.done++;
      else r.planned++;
      map.set(id, r);
    });
    payments.forEach((p) => {
      if (monthKey(p.paid_at) !== period) return;
      const id = p.client_id ?? "—";
      const r = map.get(id) ?? { charge: 0, paid: 0, planned: 0, done: 0 };
      r.paid += p.amount_krw ?? 0;
      map.set(id, r);
    });
    return map;
  }, [sessions, payments, period]);

  const filteredClients = useMemo(() => {
    const q = search.trim();
    return clients.filter((c) => {
      if (q && !(c.name ?? "").includes(q)) return false;
      if (unpaidOnly) {
        const r = clientSummary.get(c.id);
        if (!r || r.charge - r.paid <= 0) return false;
      }
      return true;
    });
  }, [clients, search, unpaidOnly, clientSummary]);

  // Active client → group sessions by (therapist, program)
  const activeClient = clients.find((c) => c.id === selectedClient) ?? null;
  const groups: Group[] = useMemo(() => {
    if (!activeClient) return [];
    const list = sessions.filter((s) => s.client_id === activeClient.id && monthKey(s.session_date) === period);
    const map = new Map<string, Group>();
    list.forEach((s) => {
      const key = `${s.therapist_id ?? "-"}|${s.program_id ?? "-"}`;
      const g = map.get(key) ?? {
        key,
        therapistId: s.therapist_id,
        programId: s.program_id,
        therapistName: therapistName.get(s.therapist_id ?? "") ?? "미지정",
        programName: programName.get(s.program_id ?? "") ?? "미지정 프로그램",
        unitPrice: s.price_krw ?? 0,
        sessions: [],
        done: 0,
        planned: 0,
        totalCharge: 0,
        paid: 0,
      };
      g.sessions.push(s);
      if ((s.status === "completed" || s.status === "done")) g.done++;
      else g.planned++;
      g.totalCharge += s.price_krw ?? 0;
      if (!g.unitPrice && s.price_krw) g.unitPrice = s.price_krw;
      map.set(key, g);
    });
    // Sum payments per group: match by session_id when available, otherwise meta.group_key
    payments.forEach((p) => {
      if (p.client_id !== activeClient.id) return;
      if (monthKey(p.paid_at) !== period) return;
      const groupKey = p.meta?.group_key as string | undefined;
      if (groupKey && map.has(groupKey)) {
        map.get(groupKey)!.paid += p.amount_krw ?? 0;
        return;
      }
      if (p.session_id) {
        for (const g of map.values()) {
          if (g.sessions.some((s) => s.id === p.session_id)) { g.paid += p.amount_krw ?? 0; break; }
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => a.programName.localeCompare(b.programName));
  }, [activeClient, sessions, payments, period, therapistName, programName]);

  async function reload() {
    const [s, p] = await Promise.all([
      supabase.from("center_sessions").select("id,client_id,therapist_id,program_id,session_date,status,price_krw,is_voucher").eq("center_id", centerId).limit(10000),
      supabase.from("center_payments").select("id,client_id,session_id,paid_at,amount_krw,method,meta").eq("center_id", centerId).limit(10000),
    ]);
    setSessions((s.data ?? []) as Session[]);
    setPayments((p.data ?? []) as Payment[]);
  }

  return (
    <div className="max-w-[1400px] mx-auto p-6">
      <Helmet><title>수납처리 — AIHPRO 센터</title></Helmet>

      <header className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <p className="text-xs tracking-widest text-neutral-500">BILLING · 수납처리</p>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#C8B88A]" /> 월별 수납처리
          </h1>
          <p className="text-sm text-neutral-500 mt-1">이용자를 선택하고 회기별 청구·수납을 한 화면에서 처리해요.</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className="px-3 py-2 rounded-lg border border-neutral-200 text-sm" />
        </div>
      </header>

      {loading ? (
        <p className="text-neutral-400 p-8 text-center">불러오는 중…</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
          {/* 좌측 이용자 목록 */}
          <aside className="rounded-2xl bg-white border border-neutral-200 overflow-hidden self-start sticky top-4">
            <div className="p-3 border-b border-neutral-100 space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="이용자 검색" className="w-full pl-8 pr-2 py-2 rounded-lg border border-neutral-200 text-sm" />
              </div>
              <label className="flex items-center gap-1.5 text-xs text-neutral-600">
                <input type="checkbox" checked={unpaidOnly} onChange={(e) => setUnpaidOnly(e.target.checked)} />
                해당월 미수금만 표시
              </label>
            </div>
            <ul className="max-h-[70vh] overflow-y-auto text-sm">
              {filteredClients.length === 0 && <li className="p-4 text-neutral-400 text-xs text-center">이용자가 없습니다.</li>}
              {filteredClients.map((c) => {
                const r = clientSummary.get(c.id);
                const ar = r ? r.charge - r.paid : 0;
                const isSel = selectedClient === c.id;
                return (
                  <li key={c.id}>
                    <button onClick={() => setSelectedClient(c.id)}
                      className={`w-full text-left px-3 py-2 border-l-2 ${isSel ? "border-[#C8B88A] bg-amber-50/50" : "border-transparent hover:bg-neutral-50"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">{c.name ?? "—"}</span>
                        {ar > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 shrink-0">미수</span>}
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{c.birth_date ?? ""}</div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* 우측 본문 */}
          <main className="min-w-0">
            {!activeClient ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 p-16 text-center text-neutral-400">
                좌측에서 이용자를 선택해주세요.
              </div>
            ) : (
              <ClientBillingView
                client={activeClient}
                period={period}
                groups={groups}
                onAddPayment={(g) => setModalGroup(g)}
              />
            )}
          </main>
        </div>
      )}

      {modalGroup && activeClient && (
        <PaymentModal
          centerId={centerId}
          client={activeClient}
          group={modalGroup}
          period={period}
          onClose={() => setModalGroup(null)}
          onSaved={async () => { setModalGroup(null); await reload(); toast({ title: "수납 저장 완료" }); }}
        />
      )}
    </div>
  );
}

function ClientBillingView({ client, period, groups, onAddPayment }: {
  client: Client; period: string; groups: Group[]; onAddPayment: (g: Group) => void;
}) {
  const totalCharge = groups.reduce((s, g) => s + g.totalCharge, 0);
  const totalPaid = groups.reduce((s, g) => s + g.paid, 0);
  const ar = totalCharge - totalPaid;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white border border-neutral-200 p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-neutral-500">{period}</p>
          <h2 className="text-xl font-semibold">{client.name} <span className="text-xs text-neutral-400 ml-1">{client.gender ? `(${client.gender}, ` : "("}{client.birth_date ?? "—"})</span></h2>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <Stat label="총 청구액" value={KRW(totalCharge)} />
          <Stat label="수납액" value={KRW(totalPaid)} tone="emerald" />
          <Stat label="미수금" value={KRW(Math.max(ar, 0))} tone={ar > 0 ? "rose" : "neutral"} />
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 p-12 text-center text-neutral-400 text-sm">
          이번 달 회기가 없습니다. 일정에서 회기를 먼저 등록해주세요.
        </div>
      ) : (
        groups.map((g) => <GroupCard key={g.key} group={g} onAddPayment={() => onAddPayment(g)} />)
      )}
    </div>
  );
}

function Stat({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "emerald" | "rose" }) {
  const color = tone === "emerald" ? "text-emerald-700" : tone === "rose" ? "text-rose-700" : "text-neutral-900";
  return (
    <div className="text-right">
      <p className="text-[10px] text-neutral-500">{label}</p>
      <p className={`text-base font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function GroupCard({ group, onAddPayment }: { group: Group; onAddPayment: () => void }) {
  const ar = group.totalCharge - group.paid;
  const noPrice = group.unitPrice === 0;
  return (
    <div className="rounded-2xl bg-white border border-neutral-200 overflow-hidden">
      <div className="p-5 border-b border-neutral-100">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{group.programName}</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">{group.therapistName}</span>
              {noPrice && <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-600">가격 미설정</span>}
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">{group.unitPrice ? `${KRW(group.unitPrice)}/회` : "단가 미설정"}</p>
          </div>
          <div className="text-xs text-neutral-500">총 {group.sessions.length}회기 · 완료 {group.done}, 예정 {group.planned}</div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {group.sessions
            .slice()
            .sort((a, b) => (a.session_date ?? "").localeCompare(b.session_date ?? ""))
            .map((s, i) => {
              const done = s.status === "completed" || s.status === "done";
              return (
                <div key={s.id} className={`w-12 h-12 rounded-lg border text-center flex flex-col items-center justify-center ${done ? "border-blue-300 bg-blue-50 text-blue-700" : "border-emerald-300 bg-emerald-50 text-emerald-700"}`}>
                  <span className="text-sm font-semibold leading-none">{i + 1}</span>
                  <span className="text-[9px] mt-0.5">{done ? "완료" : "예정"}</span>
                </div>
              );
            })}
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-xs text-neutral-500">총 금액</p>
          <p className="text-lg font-semibold">{KRW(group.totalCharge)}</p>
          <p className="text-[11px] text-neutral-400">{group.sessions.length}회기 × {KRW(group.unitPrice)}</p>
        </div>
        <div>
          <p className="text-xs text-emerald-600">수납액</p>
          <p className="text-lg font-semibold text-emerald-700">{KRW(group.paid)}</p>
        </div>
        <div>
          <p className="text-xs text-rose-600">미수금</p>
          <p className="text-lg font-semibold text-rose-700">{KRW(Math.max(ar, 0))}</p>
        </div>
      </div>

      <div className="px-5 pb-5">
        <button onClick={onAddPayment} disabled={noPrice}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed">
          <Plus className="w-4 h-4" /> 수납 입력
        </button>
        {noPrice && <p className="text-[11px] text-rose-500 mt-2">단가가 없는 회기입니다. 일정에서 가격을 먼저 설정해주세요.</p>}
      </div>
    </div>
  );
}

function PaymentModal({ centerId, client, group, period, onClose, onSaved }: {
  centerId: string; client: Client; group: Group; period: string; onClose: () => void; onSaved: () => void;
}) {
  const expected = Math.max(group.totalCharge - group.paid, 0);
  const [card, setCard] = useState(0);
  const [cash, setCash] = useState(0);
  const [transfer, setTransfer] = useState(0);
  const [memo, setMemo] = useState("");
  const [paidAt, setPaidAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const total = (card || 0) + (cash || 0) + (transfer || 0);

  function quickFill(method: "card" | "cash" | "transfer") {
    if (method === "card") setCard(expected);
    if (method === "cash") setCash(expected);
    if (method === "transfer") setTransfer(expected);
  }

  async function save() {
    if (total <= 0) { toast({ title: "금액을 입력해주세요", variant: "destructive" }); return; }
    setSaving(true);
    const rows: any[] = [];
    const baseMeta = { group_key: group.key, program_id: group.programId, therapist_id: group.therapistId, period_yyyymm: period, memo: memo || null };
    if (card > 0) rows.push({ center_id: centerId, client_id: client.id, paid_at: paidAt, amount_krw: card, method: "카드", meta: baseMeta });
    if (cash > 0) rows.push({ center_id: centerId, client_id: client.id, paid_at: paidAt, amount_krw: cash, method: "현금", meta: baseMeta });
    if (transfer > 0) rows.push({ center_id: centerId, client_id: client.id, paid_at: paidAt, amount_krw: transfer, method: "계좌이체", meta: baseMeta });
    const { error } = await supabase.from("center_payments").insert(rows);
    setSaving(false);
    if (error) { toast({ title: "저장 실패", description: error.message, variant: "destructive" }); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">수납 입력 — 일반</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700"><X className="w-5 h-5" /></button>
        </div>

        <div className="text-sm space-y-1 mb-4">
          <p className="font-medium">{period} · {client.name}</p>
          <p className="text-xs text-neutral-500">{group.programName} · {group.therapistName}</p>
        </div>

        <div className="rounded-xl bg-sky-50 border border-sky-100 p-3 text-sm text-sky-900 mb-4 flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p>현재 미수납액은 <button onClick={() => quickFill("card")} className="font-semibold underline">{KRW(expected)}</button> 입니다.</p>
            <p className="text-[11px] text-sky-700 mt-0.5">결제수단 옆 라벨을 클릭하면 금액이 자동 입력됩니다.</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <Row label="납부일시">
            <input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm" />
          </Row>
          <Row label="수납예상금액">
            <p className="text-right font-semibold">{KRW(expected)}</p>
          </Row>

          <div className="border-t border-neutral-100 pt-3">
            <p className="text-xs text-neutral-500 mb-2">납부 (일반)</p>
            <MethodRow icon={<CreditCard className="w-4 h-4" />} label="카드" value={card} onChange={setCard} onQuick={() => quickFill("card")} />
            <MethodRow icon={<Banknote className="w-4 h-4" />} label="현금" value={cash} onChange={setCash} onQuick={() => quickFill("cash")} />
            <MethodRow icon={<ArrowLeftRight className="w-4 h-4" />} label="계좌이체" value={transfer} onChange={setTransfer} onQuick={() => quickFill("transfer")} />
          </div>

          <Row label="합계">
            <p className="text-right font-semibold text-lg">{total.toLocaleString("ko-KR")}</p>
          </Row>

          <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="메모를 입력하세요."
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm min-h-[72px]" />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-neutral-200 text-sm">취소</button>
          <button onClick={save} disabled={saving || total <= 0} className="px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm disabled:opacity-40">{saving ? "저장 중…" : "저장"}</button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[100px_1fr] items-center gap-3">
      <p className="text-xs text-neutral-500">{label}</p>
      <div>{children}</div>
    </div>
  );
}

function MethodRow({ icon, label, value, onChange, onQuick }: {
  icon: React.ReactNode; label: string; value: number; onChange: (n: number) => void; onQuick: () => void;
}) {
  return (
    <div className="grid grid-cols-[100px_1fr] items-center gap-3 py-1">
      <button onClick={onQuick} className="inline-flex items-center gap-1.5 text-xs text-neutral-700 hover:text-neutral-900">
        {icon} {label}
      </button>
      <input type="number" inputMode="numeric" value={value || ""} onChange={(e) => onChange(Number(e.target.value) || 0)}
        placeholder="0" className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm text-right" />
    </div>
  );
}
