import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_PARENT_REPORTS, DEMO_CLIENTS } from "@/lib/b2bCenter/demoData";
import { FileText, Sparkles, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import SampleParentReport from "@/components/b2b-center/SampleParentReport";

type Ctx = { centerId: string; demo?: boolean };

export default function ParentReportsPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const [rows, setRows] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; });
  const [sampleOpen, setSampleOpen] = useState<{ clientId: string; name: string; period: string; periodKey: string } | null>(null);

  const load = async () => {
    setLoading(true);
    if (demo) {
      setRows(DEMO_PARENT_REPORTS);
      setClients(DEMO_CLIENTS.map((c) => ({ id: c.id, name: c.display_name })));
      setLoading(false);
      return;
    }
    const [r, c] = await Promise.all([
      supabase.from("center_parent_reports").select("*").eq("center_id", centerId).order("period_end", { ascending: false }).limit(100),
      supabase.from("center_clients").select("id, name").eq("center_id", centerId),
    ]);
    setRows(r.data ?? []);
    setClients(c.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [centerId, demo]);

  const generateBatch = async () => {
    if (demo) { toast({ title: "데모 모드에서는 생성되지 않아요" }); return; }
    const [y, m] = period.split("-").map(Number);
    const period_start = `${period}-01`;
    const period_end = new Date(y, m, 0).toISOString().slice(0, 10);

    const { data: cs } = await supabase.from("center_clients").select("id").eq("center_id", centerId).eq("status", "active");
    if (!cs?.length) { toast({ title: "활성 이용자가 없어요" }); return; }
    const inserts = cs.map((c) => ({ center_id: centerId, client_id: c.id, period_start, period_end, status: "draft" }));
    const { error } = await supabase.from("center_parent_reports").insert(inserts as any);
    if (error) { toast({ title: "실패", description: error.message, variant: "destructive" }); return; }
    toast({ title: `${cs.length}건 초안 생성 완료`, description: "각 리포트를 열어 검토 후 발행하세요." });
    load();
  };

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? "—";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">부모 월간 리포트</h1>
          <p className="text-sm text-neutral-500 mt-1">이용자별 월간 회기 기록을 묶어 보호자용 리포트를 자동 생성합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSampleOpen({ clientId: "c1", name: "민준 (5세)", period: "2026년 4월", periodKey: "2026-04" })} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C8B88A] text-neutral-800 text-sm hover:bg-[#FAF6E8]"><Eye className="w-4 h-4 text-[#C8B88A]" /> 샘플 리포트 보기</button>
          <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className="border border-neutral-200 rounded-lg px-3 py-2 text-sm" />
          <button onClick={generateBatch} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 text-white text-sm"><Sparkles className="w-4 h-4 text-[#C8B88A]" /> 이번 달 일괄 초안 생성</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr><th className="text-left p-3">기간</th><th className="text-left p-3">이용자</th><th className="text-left p-3">상태</th><th className="text-left p-3">발행일</th><th></th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="p-8 text-center text-neutral-400">불러오는 중…</td></tr> :
             rows.length === 0 ? <tr><td colSpan={5} className="p-12 text-center text-neutral-400">아직 생성된 리포트가 없어요. 상단에서 월을 선택하고 초안을 만들어주세요.</td></tr> :
             rows.map((r) => (
              <tr key={r.id} className="border-t border-neutral-100">
                <td className="p-3">{r.period_start} ~ {r.period_end}</td>
                <td className="p-3 font-medium">{clientName(r.client_id)}</td>
                <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${r.status === "issued" ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-600"}`}>{r.status === "issued" ? "발행됨" : "초안"}</span></td>
                <td className="p-3 text-neutral-500">{r.issued_at ?? "—"}</td>
                <td className="p-3 text-right"><button onClick={() => setSampleOpen({ clientId: r.client_id, name: clientName(r.client_id), period: (r.period_start?.slice(0, 7).replace("-", "년 ") + "월"), periodKey: r.period_start?.slice(0, 7) ?? "" })} className="inline-flex items-center gap-1 text-xs text-neutral-700 hover:text-neutral-900"><FileText className="w-3.5 h-3.5" /> 열기</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SampleParentReport open={!!sampleOpen} onClose={() => setSampleOpen(null)} clientName={sampleOpen?.name} period={sampleOpen?.period} />
    </div>
  );
}
