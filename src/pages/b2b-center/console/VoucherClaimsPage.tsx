import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { FileSpreadsheet, Plus, Download, CheckCircle2, AlertTriangle, Send, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

type Ctx = { centerId: string; demo?: boolean };
type Claim = {
  id: string;
  period_yyyymm: string;
  status: string;
  total_amount_krw: number;
  total_count: number;
  submitted_at: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  created_at: string;
};
type ClaimItem = {
  id: string;
  service_date: string;
  voucher_no: string | null;
  amount_krw: number;
  copayment_krw: number;
  subsidy_krw: number;
  status: string;
  warning: string | null;
  client_id: string | null;
  therapist_id: string | null;
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  draft: { label: "대기", className: "bg-neutral-100 text-neutral-700" },
  reviewed: { label: "검토 완료", className: "bg-amber-100 text-amber-800" },
  submitted: { label: "제출", className: "bg-blue-100 text-blue-800" },
  approved: { label: "승인", className: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "반려", className: "bg-rose-100 text-rose-800" },
};

const KRW = (n: number) => `₩${(n || 0).toLocaleString("ko-KR")}`;
const todayMonth = () => new Date().toISOString().slice(0, 7);

export default function VoucherClaimsPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState<ClaimItem[]>([]);
  const [period, setPeriod] = useState<string>(todayMonth());
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Map<string, string>>(new Map());
  const [therapists, setTherapists] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (demo) { setLoading(false); return; }
    (async () => {
      const [c, t] = await Promise.all([
        supabase.from("center_clients").select("id,name").eq("center_id", centerId),
        supabase.from("center_therapists").select("id,name").eq("center_id", centerId),
      ]);
      setClients(new Map(((c.data ?? []) as any[]).map((r) => [r.id, r.name ?? "—"])));
      setTherapists(new Map(((t.data ?? []) as any[]).map((r) => [r.id, r.name ?? "—"])));
      await refreshClaims();
    })();
  }, [centerId, demo]);

  async function refreshClaims() {
    setLoading(true);
    const { data } = await supabase
      .from("center_voucher_claims")
      .select("id,period_yyyymm,status,total_amount_krw,total_count,submitted_at,approved_at,rejected_reason,created_at")
      .eq("center_id", centerId)
      .order("period_yyyymm", { ascending: false });
    setClaims((data ?? []) as Claim[]);
    setLoading(false);
  }

  async function loadItems(id: string) {
    setActiveId(id);
    const { data } = await supabase
      .from("center_voucher_claim_items")
      .select("id,service_date,voucher_no,amount_krw,copayment_krw,subsidy_krw,status,warning,client_id,therapist_id")
      .eq("claim_id", id)
      .order("service_date");
    setItems((data ?? []) as ClaimItem[]);
  }

  async function createClaim() {
    if (demo) { toast({ title: "데모 모드에서는 생성할 수 없어요" }); return; }
    if (!period) return;
    setCreating(true);
    try {
      // 1) 해당 월 바우처 회기 가져오기
      const start = `${period}-01`;
      const endDate = new Date(period + "-01");
      endDate.setMonth(endDate.getMonth() + 1);
      const end = endDate.toISOString().slice(0, 10);

      const { data: sessions, error: se } = await supabase
        .from("center_sessions")
        .select("id,client_id,therapist_id,session_date,price_krw,status,is_voucher,center_clients(name)")
        .eq("center_id", centerId)
        .eq("is_voucher", true)
        .gte("session_date", start)
        .lt("session_date", end);
      if (se) throw se;

      const ok = (sessions ?? []).filter((s: any) => s.status === "completed");
      if (ok.length === 0) {
        toast({ title: "청구 대상 없음", description: `${period} 월의 완료된 바우처 회기가 없습니다.`, variant: "destructive" });
        setCreating(false); return;
      }

      // 2) claim 헤더 생성
      const total = ok.reduce((s: number, x: any) => s + (x.price_krw ?? 0), 0);
      const { data: { user } } = await supabase.auth.getUser();
      const { data: claim, error: ce } = await supabase.from("center_voucher_claims").insert({
        center_id: centerId, period_yyyymm: period, status: "draft",
        total_amount_krw: total, total_count: ok.length, created_by: user?.id,
      }).select("id").single();
      if (ce) throw ce;

      // 3) 라인 아이템 적재
      const rows = ok.map((s: any) => {
        const copay = Math.round((s.price_krw ?? 0) * 0.1); // 본인부담금 기본 10%
        return {
          claim_id: claim.id,
          session_id: s.id, client_id: s.client_id, therapist_id: s.therapist_id,
          service_date: s.session_date,
          amount_krw: s.price_krw ?? 0,
          copayment_krw: copay,
          subsidy_krw: (s.price_krw ?? 0) - copay,
          status: s.price_krw && s.price_krw > 0 ? "ok" : "warning",
          warning: s.price_krw ? null : "단가 0원 — 프로그램 확인 필요",
        };
      });
      const { error: ie } = await supabase.from("center_voucher_claim_items").insert(rows);
      if (ie) throw ie;

      toast({ title: "청구 묶음 생성 완료", description: `${ok.length}건 · ${KRW(total)}` });
      await refreshClaims();
      loadItems(claim.id);
    } catch (e: any) {
      toast({ title: "생성 실패", description: e.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  }

  async function changeStatus(next: string) {
    if (!activeId) return;
    if (demo) { toast({ title: "데모 모드에서는 상태를 변경할 수 없어요" }); return; }
    const patch: any = { status: next };
    if (next === "submitted") patch.submitted_at = new Date().toISOString();
    if (next === "approved") patch.approved_at = new Date().toISOString();
    const { error } = await supabase.from("center_voucher_claims").update(patch).eq("id", activeId);
    if (error) { toast({ title: "변경 실패", description: error.message, variant: "destructive" }); return; }
    toast({ title: `${STATUS_BADGE[next]?.label ?? next}로 변경` });
    await refreshClaims();
  }

  function exportClaim() {
    if (!activeClaim) return;
    const rows = items.map((it, i) => ({
      "연번": i + 1,
      "서비스일자": it.service_date,
      "이용자명": clients.get(it.client_id ?? "") ?? "",
      "제공인력": therapists.get(it.therapist_id ?? "") ?? "",
      "바우처번호": it.voucher_no ?? "",
      "총금액": it.amount_krw,
      "정부지원금": it.subsidy_krw,
      "본인부담금": it.copayment_krw,
      "비고": it.warning ?? "",
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 6 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 24 }];
    XLSX.utils.book_append_sheet(wb, ws, `청구${activeClaim.period_yyyymm}`);
    XLSX.writeFile(wb, `전자바우처청구_${activeClaim.period_yyyymm}.xlsx`);
  }

  const activeClaim = useMemo(() => claims.find((c) => c.id === activeId) ?? null, [claims, activeId]);
  const warnings = useMemo(() => items.filter((i) => i.status !== "ok").length, [items]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Helmet><title>전자바우처 청구 — AIHPRO 센터</title></Helmet>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-widest text-neutral-500">VOUCHER CLAIMS</p>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><FileSpreadsheet className="w-5 h-5 text-[#C8B88A]" /> 월말 바우처 청구</h1>
          <p className="text-sm text-neutral-500 mt-1">대기 → 검토 → 제출 → 승인 워크플로우. 청구파일 엑셀을 자동 생성합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className="px-3 py-2 rounded-lg border border-neutral-200 text-sm" />
          <button onClick={createClaim} disabled={creating} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm hover:bg-neutral-800 disabled:opacity-50">
            <Plus className="w-4 h-4" /> {creating ? "생성 중…" : `${period} 청구묶음 생성`}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* 청구 묶음 리스트 */}
        <aside className="rounded-2xl bg-white border border-neutral-200 overflow-hidden">
          <div className="p-4 border-b border-neutral-200 bg-neutral-50">
            <p className="text-xs font-semibold text-neutral-700">청구 묶음 ({claims.length})</p>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {loading ? <p className="p-6 text-sm text-neutral-400 text-center">불러오는 중…</p> :
             claims.length === 0 ? <p className="p-6 text-sm text-neutral-400 text-center">청구 묶음이 없습니다.</p> :
             claims.map((c) => {
               const badge = STATUS_BADGE[c.status] ?? STATUS_BADGE.draft;
               return (
                 <button key={c.id} onClick={() => loadItems(c.id)} className={`w-full text-left p-4 border-b border-neutral-100 hover:bg-neutral-50 ${activeId === c.id ? "bg-amber-50" : ""}`}>
                   <div className="flex items-center justify-between mb-1">
                     <span className="font-mono text-sm">{c.period_yyyymm}</span>
                     <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badge.className}`}>{badge.label}</span>
                   </div>
                   <p className="text-xs text-neutral-500">{c.total_count}건 · {KRW(c.total_amount_krw)}</p>
                 </button>
               );
             })}
          </div>
        </aside>

        {/* 청구 상세 */}
        <section className="rounded-2xl bg-white border border-neutral-200 overflow-hidden">
          {!activeClaim ? (
            <div className="p-12 text-center text-neutral-400 text-sm">왼쪽에서 청구 묶음을 선택하거나 새로 생성하세요.</div>
          ) : (
            <>
              <div className="p-5 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-neutral-500">{activeClaim.period_yyyymm}</p>
                  <h2 className="text-lg font-semibold">{KRW(activeClaim.total_amount_krw)} · {activeClaim.total_count}건</h2>
                  {warnings > 0 && <p className="text-xs text-amber-700 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> 점검 필요 {warnings}건</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={exportClaim} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-sm hover:bg-neutral-50">
                    <Download className="w-4 h-4" /> 청구파일 (.xlsx)
                  </button>
                  {activeClaim.status === "draft" && (
                    <button onClick={() => changeStatus("reviewed")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-sm hover:bg-amber-600">
                      <CheckCircle2 className="w-4 h-4" /> 검토 완료
                    </button>
                  )}
                  {activeClaim.status === "reviewed" && (
                    <button onClick={() => changeStatus("submitted")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
                      <Send className="w-4 h-4" /> 제출 처리
                    </button>
                  )}
                  {activeClaim.status === "submitted" && (
                    <>
                      <button onClick={() => changeStatus("approved")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700">
                        <CheckCircle2 className="w-4 h-4" /> 승인 확인
                      </button>
                      <button onClick={() => { const r = prompt("반려 사유"); if (r) { changeStatus("rejected"); } }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 text-sm hover:bg-rose-50">
                        반려
                      </button>
                    </>
                  )}
                  {(activeClaim.status === "approved" || activeClaim.status === "rejected") && (
                    <button onClick={() => changeStatus("draft")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-sm hover:bg-neutral-50">
                      <RotateCcw className="w-4 h-4" /> 초기화
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto max-h-[520px]">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 text-neutral-500 text-xs sticky top-0">
                    <tr>
                      <th className="text-left p-3">일자</th>
                      <th className="text-left p-3">이용자</th>
                      <th className="text-left p-3">치료사</th>
                      <th className="text-right p-3">총금액</th>
                      <th className="text-right p-3">지원금</th>
                      <th className="text-right p-3">본인부담</th>
                      <th className="text-left p-3">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-neutral-400">라인이 없습니다.</td></tr> :
                     items.map((it) => (
                      <tr key={it.id} className="border-t border-neutral-100">
                        <td className="p-3 font-mono text-xs">{it.service_date}</td>
                        <td className="p-3">{clients.get(it.client_id ?? "") ?? "—"}</td>
                        <td className="p-3 text-neutral-600">{therapists.get(it.therapist_id ?? "") ?? "—"}</td>
                        <td className="p-3 text-right">{KRW(it.amount_krw)}</td>
                        <td className="p-3 text-right text-neutral-600">{KRW(it.subsidy_krw)}</td>
                        <td className="p-3 text-right text-neutral-600">{KRW(it.copayment_krw)}</td>
                        <td className="p-3">
                          {it.status === "ok" ? <span className="text-emerald-600 text-xs">정상</span> :
                           <span className="text-amber-700 text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {it.warning ?? "확인"}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
