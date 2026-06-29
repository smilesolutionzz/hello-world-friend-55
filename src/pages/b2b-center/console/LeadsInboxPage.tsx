import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getActiveCenterId } from "@/lib/b2bCenter/centerClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Inbox, Phone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ActiveCenterGuard from "@/components/b2b-center/ActiveCenterGuard";

interface Lead {
  id: string;
  parent_name: string | null;
  phone: string | null;
  concern: string | null;
  source: string;
  status: string;
  created_at: string;
}

const STATUS_OPTS = [
  { v: "new", label: "신규" },
  { v: "contacted", label: "연락완료" },
  { v: "scheduled", label: "상담예약" },
  { v: "closed", label: "종료" },
];

export default function LeadsInboxPage() {
  const { toast } = useToast();
  const centerId = getActiveCenterId();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!centerId) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("id, parent_name, phone, concern, source, status, created_at")
      .eq("center_id", centerId)
      .order("created_at", { ascending: false })
      .limit(500);
    if (!error) setLeads((data as any) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [centerId]);

  // Realtime: 새 문의 들어오면 자동 갱신 + 토스트
  useEffect(() => {
    if (!centerId) return;
    const channel = supabase
      .channel(`leads-${centerId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leads", filter: `center_id=eq.${centerId}` },
        (payload) => {
          setLeads((prev) => [payload.new as any, ...prev]);
          toast({ title: "새 문의가 도착했어요", description: (payload.new as any).parent_name ?? "익명" });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [centerId, toast]);

  const kpi = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: leads.length,
      today: leads.filter((l) => l.created_at.slice(0, 10) === today).length,
      landing: leads.filter((l) => l.source === "landing").length,
      newCount: leads.filter((l) => (l.status || "new") === "new").length,
    };
  }, [leads]);

  async function updateStatus(id: string, status: string) {
    setLeads((p) => p.map((l) => (l.id === id ? { ...l, status } : l)));
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) toast({ title: "상태 변경 실패", description: error.message, variant: "destructive" });
  }

  if (!centerId) {
    return <div className="p-8 text-sm text-neutral-500">먼저 활성 기관을 선택해주세요.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <div className="text-xs tracking-[0.18em] text-neutral-400">MARKETING STUDIO</div>
          <h1 className="text-2xl font-semibold">신규 문의함</h1>
          <p className="text-sm text-neutral-500">랜딩 페이지에서 들어온 상담 문의를 실시간으로 확인하세요.</p>
        </div>
        <Button variant="outline" onClick={load} className="rounded-2xl">
          <RefreshCw className="w-4 h-4 mr-2" /> 새로고침
        </Button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "전체 문의", value: kpi.total },
          { label: "오늘", value: kpi.today },
          { label: "랜딩 유입", value: kpi.landing },
          { label: "미처리 (신규)", value: kpi.newCount },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-neutral-100 bg-white p-4">
            <div className="text-xs text-neutral-400">{k.label}</div>
            <div className="text-2xl font-semibold mt-1">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-neutral-100 bg-white overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-neutral-400"><Loader2 className="animate-spin inline" /></div>
        ) : leads.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Inbox className="w-8 h-8 mx-auto text-neutral-300" />
            <div className="text-sm text-neutral-500">아직 들어온 문의가 없어요. 랜딩 페이지를 공유해 보세요.</div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs text-neutral-500">
              <tr>
                <th className="p-3 font-normal">일시</th>
                <th className="p-3 font-normal">이름</th>
                <th className="p-3 font-normal">연락처</th>
                <th className="p-3 font-normal">유입</th>
                <th className="p-3 font-normal">문의 내용</th>
                <th className="p-3 font-normal">상태</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-t border-neutral-100 align-top">
                  <td className="p-3 whitespace-nowrap text-neutral-500">{new Date(l.created_at).toLocaleString("ko-KR")}</td>
                  <td className="p-3 font-medium">{l.parent_name || "-"}</td>
                  <td className="p-3">
                    {l.phone ? (
                      <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1 text-neutral-800 hover:underline">
                        <Phone className="w-3.5 h-3.5" /> {l.phone}
                      </a>
                    ) : "-"}
                  </td>
                  <td className="p-3 text-xs">
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-600">{l.source}</span>
                  </td>
                  <td className="p-3 max-w-md text-neutral-700 break-keep">{l.concern || <span className="text-neutral-300">-</span>}</td>
                  <td className="p-3">
                    <select
                      value={l.status || "new"}
                      onChange={(e) => updateStatus(l.id, e.target.value)}
                      className="border border-neutral-200 rounded-lg px-2 py-1 text-xs bg-white"
                    >
                      {STATUS_OPTS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
