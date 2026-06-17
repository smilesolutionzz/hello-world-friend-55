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
      supabase.from("center_parent_reports").select("*").eq("center_id", centerId).eq("period_type", "monthly").order("period_end", { ascending: false }).limit(100),
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

    // 치료노트(주간) 가 있는 이용자만 대상으로 월간 리포트 초안 생성 — 정확도 향상
    const { data: notes, error: notesErr } = await supabase
      .from("center_parent_reports")
      .select("id, client_id, week_key, period_start, period_end, title, ai_summary, ai_draft_json, edited_html, html_content, published_at")
      .eq("center_id", centerId)
      .eq("period_type", "weekly")
      .gte("period_start", period_start)
      .lte("period_end", period_end)
      .order("period_start", { ascending: true });
    if (notesErr) { toast({ title: "치료노트 조회 실패", description: notesErr.message, variant: "destructive" }); return; }
    if (!notes?.length) {
      toast({ title: "이번 달 발행된 치료노트가 없어요", description: "치료노트 페이지에서 주간 노트를 먼저 작성/발행해주세요.", variant: "destructive" });
      return;
    }

    // 이용자별 그룹핑
    const byClient = new Map<string, any[]>();
    for (const n of notes) {
      if (!byClient.has(n.client_id)) byClient.set(n.client_id, []);
      byClient.get(n.client_id)!.push(n);
    }

    // 기존 같은 달 초안/발행 리포트 확인 (중복 방지)
    const clientIds = Array.from(byClient.keys());
    const { data: existing } = await supabase
      .from("center_parent_reports")
      .select("client_id")
      .eq("center_id", centerId)
      .eq("period_type", "monthly")
      .eq("period_start", period_start)
      .in("client_id", clientIds);
    const existingSet = new Set((existing ?? []).map((e: any) => e.client_id));

    const inserts = clientIds
      .filter((cid) => !existingSet.has(cid))
      .map((cid) => {
        const ns = byClient.get(cid)!;
        return {
          center_id: centerId,
          client_id: cid,
          period_start,
          period_end,
          period_type: "monthly",
          period_yyyymm: period,
          status: "draft",
          title: `${y}년 ${m}월 월간 리포트`,
          source_upload_ids: ns.map((n) => n.id),
          ai_draft_json: {
            generated_from: "weekly_therapy_notes",
            week_count: ns.length,
            weekly_notes: ns.map((n) => ({
              id: n.id,
              week_key: n.week_key,
              period_start: n.period_start,
              period_end: n.period_end,
              title: n.title,
              summary: n.ai_summary,
              draft: n.ai_draft_json,
            })),
          },
        };
      });

    const skipped = clientIds.length - inserts.length;
    if (!inserts.length) {
      toast({ title: "이미 모두 생성되어 있어요", description: `${clientIds.length}명 모두 이번 달 리포트가 있습니다.` });
      return;
    }
    const { error } = await supabase.from("center_parent_reports").insert(inserts as any);
    if (error) { toast({ title: "실패", description: error.message, variant: "destructive" }); return; }
    toast({
      title: `${inserts.length}건 초안 생성 완료`,
      description: `치료노트 ${notes.length}건을 ${inserts.length}명에게 묶었습니다.${skipped ? ` (중복 ${skipped}건 건너뜀)` : ""}`,
    });
    load();
  };

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? "—";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">부모 월간 리포트</h1>
          <p className="text-sm text-neutral-500 mt-1">발행된 주간 치료노트를 자동으로 묶어 월간 리포트 초안을 생성합니다. 치료노트가 있는 이용자만 대상으로 합니다.</p>
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

      <SampleParentReport open={!!sampleOpen} onClose={() => setSampleOpen(null)} clientId={sampleOpen?.clientId} clientName={sampleOpen?.name} period={sampleOpen?.period} periodKey={sampleOpen?.periodKey} />
    </div>
  );
}
