import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_PARENT_REPORTS, DEMO_CLIENTS } from "@/lib/b2bCenter/demoData";
import { FileText, Sparkles, Eye, Send, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import SampleParentReport from "@/components/b2b-center/SampleParentReport";
import ShareWithParentDialog from "@/components/b2b-center/ShareWithParentDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Ctx = { centerId: string; demo?: boolean };

export default function ParentReportsPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const [rows, setRows] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; });
  const [sampleOpen, setSampleOpen] = useState<{ clientId: string; name: string; period: string; periodKey: string } | null>(null);
  const [shareOpen, setShareOpen] = useState<{ reportId: string; clientId: string; childName: string } | null>(null);
  const [regenTarget, setRegenTarget] = useState<{ clientId: string; childName: string; status: string } | null>(null);
  const [regenLoading, setRegenLoading] = useState(false);

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
      supabase.from("center_clients").select("id, name, guardian_phone").eq("center_id", centerId),
    ]);
    setRows(r.data ?? []);
    setClients(c.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [centerId, demo]);

  // 실시간 자동 업데이트: 월간 리포트 테이블 변경 즉시 반영
  useEffect(() => {
    if (demo || !centerId) return;
    const channel = supabase
      .channel(`parent-reports-${centerId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "center_parent_reports", filter: `center_id=eq.${centerId}` },
        () => { load(); },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line
  }, [centerId, demo]);

  const generateBatch = async () => {
    if (demo) { toast({ title: "데모 모드에서는 생성되지 않아요" }); return; }
    const [y, m] = period.split("-").map(Number);
    const period_start = `${period}-01`;
    const period_end = new Date(y, m, 0).toISOString().slice(0, 10);

    // 치료노트(주간) 가 있는 이용자만 대상 — 데이터 근거 확보
    const { data: notes, error: notesErr } = await supabase
      .from("center_parent_reports")
      .select("client_id")
      .eq("center_id", centerId)
      .eq("period_type", "weekly")
      .gte("period_start", period_start)
      .lte("period_end", period_end);
    if (notesErr) { toast({ title: "치료노트 조회 실패", description: notesErr.message, variant: "destructive" }); return; }
    const clientIds = Array.from(new Set((notes ?? []).map((n: any) => n.client_id)));
    if (!clientIds.length) {
      toast({ title: "이번 달 발행된 치료노트가 없어요", description: "치료노트 페이지에서 주간 노트를 먼저 작성/발행해주세요.", variant: "destructive" });
      return;
    }

    // 이미 이 달에 월간 리포트가 존재하는 이용자는 제외 (AI 재호출 비용 방지)
    const { data: existing } = await supabase
      .from("center_parent_reports")
      .select("client_id, status")
      .eq("center_id", centerId)
      .eq("period_type", "monthly")
      .eq("period_start", period_start);
    const existingIds = new Set((existing ?? []).map((e: any) => e.client_id));
    const toGenerate = clientIds.filter((id) => !existingIds.has(id));
    const skipped = clientIds.length - toGenerate.length;

    if (!toGenerate.length) {
      toast({
        title: "새로 생성할 리포트가 없어요",
        description: `이번 달 대상 ${clientIds.length}명 모두 이미 리포트가 있어요. 다시 만들려면 각 행의 ‘재생성’ 버튼을 이용해주세요.`,
      });
      return;
    }

    toast({
      title: `${toGenerate.length}명에 대해 월간 리포트 생성 시작…`,
      description: skipped ? `이미 리포트가 있는 ${skipped}명은 건너뜁니다.` : undefined,
    });

    let ok = 0, fail = 0;
    const queue = [...toGenerate];
    const worker = async () => {
      while (queue.length) {
        const cid = queue.shift()!;
        try {
          const { error } = await supabase.functions.invoke("generate-monthly-parent-report", {
            body: { centerId, clientId: cid, period },
          });
          if (error) throw error;
          ok++;
          load(); // 한 명 끝날 때마다 즉시 화면 갱신
        } catch (e: any) {
          console.error("[monthly-report] client", cid, e);
          fail++;
        }
      }
    };
    await Promise.all([worker(), worker(), worker()]);

    toast({
      title: `월간 리포트 생성 완료`,
      description: `성공 ${ok}건${fail ? ` · 실패 ${fail}건` : ""}${skipped ? ` · 건너뜀 ${skipped}건` : ""}`,
    });
    load();
  };

  const regenerateOne = async () => {
    if (!regenTarget) return;
    setRegenLoading(true);
    try {
      const { error } = await supabase.functions.invoke("generate-monthly-parent-report", {
        body: { centerId, clientId: regenTarget.clientId, period, force: true },
      });
      if (error) throw error;
      toast({ title: `${regenTarget.childName} 리포트가 재생성되었어요` });
      setRegenTarget(null);
      load();
    } catch (e: any) {
      toast({ title: "재생성 실패", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setRegenLoading(false);
    }
  };

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? "—";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">부모 월간 리포트</h1>
          <p className="text-xs text-neutral-500 mt-1 whitespace-nowrap">발행된 주간 치료노트를 자동으로 묶어 월간 리포트 초안을 생성합니다. 이미 리포트가 있는 이용자는 건너뛰며, 다시 만들려면 행의 ‘재생성’을 사용하세요.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setSampleOpen({ clientId: "c1", name: "민준 (5세)", period: "2026년 4월", periodKey: "2026-04" })} className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[#C8B88A] text-neutral-800 text-xs whitespace-nowrap hover:bg-[#FAF6E8]"><Eye className="w-3.5 h-3.5 text-[#C8B88A]" /> 샘플 리포트 보기</button>
          <a href="./parent-reports/whitelabel" className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-neutral-300 text-neutral-800 text-xs whitespace-nowrap hover:bg-neutral-50"><Sparkles className="w-3.5 h-3.5 text-[#C8B88A]" /> 화이트라벨 미리보기</a>
          <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className="border border-neutral-200 rounded-lg px-3 py-2 text-xs" />
          <button onClick={generateBatch} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-neutral-900 text-white text-xs whitespace-nowrap"><Sparkles className="w-3.5 h-3.5 text-[#C8B88A]" /> 누락된 이용자만 생성</button>
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
                <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${r.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-600"}`}>{r.status === "published" ? "발행됨" : "초안"}</span></td>
                <td className="p-3 text-neutral-500">{r.published_at ? new Date(r.published_at).toLocaleDateString("ko-KR") : "—"}</td>
                <td className="p-3 text-right">
                  <div className="inline-flex items-center gap-3">
                    <button onClick={() => setRegenTarget({ clientId: r.client_id, childName: clientName(r.client_id), status: r.status })} className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800"><RefreshCw className="w-3.5 h-3.5" /> 재생성</button>
                    <button onClick={() => setShareOpen({ reportId: r.id, clientId: r.client_id, childName: clientName(r.client_id) })} className="inline-flex items-center gap-1 text-xs text-[#8a7544] hover:text-[#6b5a36]"><Send className="w-3.5 h-3.5" /> 부모 공유</button>
                    <button onClick={() => setSampleOpen({ clientId: r.client_id, name: clientName(r.client_id), period: (r.period_start?.slice(0, 7).replace("-", "년 ") + "월"), periodKey: r.period_start?.slice(0, 7) ?? "" })} className="inline-flex items-center gap-1 text-xs text-neutral-700 hover:text-neutral-900"><FileText className="w-3.5 h-3.5" /> 열기</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SampleParentReport open={!!sampleOpen} onClose={() => setSampleOpen(null)} clientId={sampleOpen?.clientId} clientName={sampleOpen?.name} period={sampleOpen?.period} periodKey={sampleOpen?.periodKey} />

      {shareOpen && (
        <ShareWithParentDialog
          open={!!shareOpen}
          onClose={() => { setShareOpen(null); load(); }}
          resourceType="parent_report"
          resourceId={shareOpen.reportId}
          childId={shareOpen.clientId}
          centerId={centerId}
          childName={shareOpen.childName}
          defaultPhone={clients.find((c) => c.id === shareOpen.clientId)?.guardian_phone ?? ""}
        />
      )}

      <AlertDialog open={!!regenTarget} onOpenChange={(o) => !o && !regenLoading && setRegenTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{regenTarget?.childName} 리포트를 다시 생성할까요?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">기존 리포트를 덮어씁니다. 계속하시겠어요?</span>
              {regenTarget?.status === "published" && (
                <span className="block text-rose-600 font-medium">
                  ⚠ 이미 학부모에게 공유된 리포트입니다. 다시 생성하면 학부모가 보는 내용도 바뀝니다.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={regenLoading}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); regenerateOne(); }} disabled={regenLoading}>
              {regenLoading ? "재생성 중…" : "재생성"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
