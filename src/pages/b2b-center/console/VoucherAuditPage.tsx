import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Upload, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Ctx = { centerId: string; demo?: boolean };
type AuditRow = { voucher_no: string; voucher_date: string; client_name: string; amount: number; matched: boolean; reason?: string };

const DEMO_AUDIT: AuditRow[] = [
  { voucher_no: "V20260512-0001", voucher_date: "2026-05-12", client_name: "민준", amount: 55000, matched: true },
  { voucher_no: "V20260513-0002", voucher_date: "2026-05-13", client_name: "서윤", amount: 60000, matched: true },
  { voucher_no: "V20260514-0003", voucher_date: "2026-05-14", client_name: "도윤", amount: 55000, matched: false, reason: "회기 데이터 없음" },
  { voucher_no: "V20260515-0004", voucher_date: "2026-05-15", client_name: "하준", amount: 70000, matched: false, reason: "금액 불일치 (회기: 55,000)" },
  { voucher_no: "V20260516-0005", voucher_date: "2026-05-16", client_name: "예준", amount: 58000, matched: true },
];

export default function VoucherAuditPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const [rows, setRows] = useState<AuditRow[]>(demo ? DEMO_AUDIT : []);
  const [running, setRunning] = useState(false);

  const handleFile = async (file: File) => {
    if (demo) { toast({ title: "데모 모드에서는 업로드되지 않아요" }); return; }
    setRunning(true);
    try {
      // 간이 파싱: csv 가정 (실제 엑셀 파싱은 추후 sheetjs로 교체)
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean).slice(1);
      const parsed: AuditRow[] = lines.map((l) => {
        const [voucher_no, voucher_date, client_name, amount] = l.split(",");
        return { voucher_no, voucher_date, client_name, amount: parseInt(amount, 10) || 0, matched: false };
      });

      const { data: sessions } = await supabase.from("center_sessions")
        .select("session_date, price_krw, client_id, center_clients(name)")
        .eq("center_id", centerId).eq("is_voucher", true).eq("status", "completed");

      const audited = parsed.map((p) => {
        const match = (sessions ?? []).find((s: any) =>
          s.session_date === p.voucher_date && (s.center_clients?.name?.includes(p.client_name) || p.client_name.includes(s.center_clients?.name ?? "")));
        if (!match) return { ...p, matched: false, reason: "회기 데이터 없음" };
        if (match.price_krw !== p.amount) return { ...p, matched: false, reason: `금액 불일치 (회기: ${match.price_krw.toLocaleString()})` };
        return { ...p, matched: true };
      });
      setRows(audited);
      toast({ title: `${audited.length}건 검사 완료`, description: `미일치 ${audited.filter((r) => !r.matched).length}건 발견` });
    } catch (e: any) {
      toast({ title: "파싱 실패", description: e.message, variant: "destructive" });
    } finally { setRunning(false); }
  };

  const mismatched = rows.filter((r) => !r.matched);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><ShieldAlert className="w-6 h-6 text-amber-500" /> 부정결제 찾기</h1>
          <p className="text-sm text-neutral-500 mt-1">전자바우처 청구 엑셀과 실제 회기 데이터를 자동 대조합니다.</p>
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 text-white text-sm cursor-pointer">
          <Upload className="w-4 h-4" /> 바우처 파일 업로드 (CSV)
          <input type="file" accept=".csv,.xlsx" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <p className="text-xs text-neutral-500">검사 건수</p>
          <p className="text-2xl font-semibold mt-1">{rows.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-200 p-5">
          <p className="text-xs text-emerald-600">일치</p>
          <p className="text-2xl font-semibold mt-1 text-emerald-700">{rows.length - mismatched.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-rose-200 p-5">
          <p className="text-xs text-rose-600">미일치</p>
          <p className="text-2xl font-semibold mt-1 text-rose-700">{mismatched.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr><th className="text-left p-3">바우처 번호</th><th className="text-left p-3">날짜</th><th className="text-left p-3">이용자</th><th className="text-right p-3">청구 금액</th><th className="text-left p-3">결과</th><th className="text-left p-3">사유</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={6} className="p-12 text-center text-neutral-400">바우처 청구 CSV를 업로드하면 회기 데이터와 자동 대조해드려요.</td></tr> :
             running ? <tr><td colSpan={6} className="p-8 text-center">검사 중…</td></tr> :
             rows.map((r) => (
              <tr key={r.voucher_no} className="border-t border-neutral-100">
                <td className="p-3 font-mono text-xs">{r.voucher_no}</td>
                <td className="p-3">{r.voucher_date}</td>
                <td className="p-3">{r.client_name}</td>
                <td className="p-3 text-right">{r.amount.toLocaleString()}</td>
                <td className="p-3">{r.matched ? <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> 일치</span> : <span className="inline-flex items-center gap-1 text-rose-600"><AlertTriangle className="w-4 h-4" /> 미일치</span>}</td>
                <td className="p-3 text-neutral-500 text-xs">{r.reason ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
