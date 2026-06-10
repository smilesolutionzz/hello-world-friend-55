import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Loader2, Download } from "lucide-react";

type Lead = {
  id: string;
  center_id: string | null;
  parent_name: string | null;
  phone: string | null;
  child_age: string | null;
  concern: string | null;
  status: string | null;
  created_at: string;
};

type Center = { id: string; name: string | null };

export default function AdminLeads() {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [centerFilter, setCenterFilter] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      setLoading(true);
      const [{ data: l }, { data: c }] = await Promise.all([
        supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(1000),
        supabase.from("centers").select("id, name"),
      ]);
      setLeads((l as Lead[]) || []);
      setCenters((c as Center[]) || []);
      setLoading(false);
    })();
  }, [isAdmin]);

  const centerMap = useMemo(() => Object.fromEntries(centers.map((c) => [c.id, c.name])), [centers]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (centerFilter !== "all" && l.center_id !== centerFilter) return false;
      if (from && new Date(l.created_at) < new Date(from)) return false;
      if (to && new Date(l.created_at) > new Date(to + "T23:59:59")) return false;
      return true;
    });
  }, [leads, centerFilter, from, to]);

  const kpi = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: filtered.length,
      centers: new Set(filtered.map((l) => l.center_id).filter(Boolean)).size,
      today: filtered.filter((l) => l.created_at.slice(0, 10) === today).length,
    };
  }, [filtered]);

  const exportCSV = () => {
    const headers = ["created_at", "center", "parent_name", "phone", "child_age", "concern", "status"];
    const rows = filtered.map((l) => [
      l.created_at,
      (l.center_id && centerMap[l.center_id]) || "",
      l.parent_name || "",
      l.phone || "",
      l.child_age || "",
      (l.concern || "").replace(/[\r\n,]/g, " "),
      l.status || "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (adminLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">리드 관리 (운영자)</h1>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "총 리드", value: kpi.total },
            { label: "기관 수", value: kpi.centers },
            { label: "오늘 신규", value: kpi.today },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl p-5 border">
              <div className="text-sm text-gray-500">{k.label}</div>
              <div className="text-3xl font-bold mt-1">{k.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 border mb-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-gray-500 block mb-1">기관</label>
            <select value={centerFilter} onChange={(e) => setCenterFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
              <option value="all">전체</option>
              {centers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">시작일</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">종료일</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
          </div>
          <button onClick={exportCSV} className="ml-auto bg-[#6A52C9] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> CSV 내보내기
          </button>
        </div>

        <div className="bg-white rounded-2xl border overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center"><Loader2 className="animate-spin inline" /></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">일시</th>
                  <th className="p-3">기관</th>
                  <th className="p-3">보호자</th>
                  <th className="p-3">연락처</th>
                  <th className="p-3">아이 나이</th>
                  <th className="p-3">고민</th>
                  <th className="p-3">상태</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="p-3 whitespace-nowrap">{new Date(l.created_at).toLocaleString("ko-KR")}</td>
                    <td className="p-3">{(l.center_id && centerMap[l.center_id]) || "-"}</td>
                    <td className="p-3">{l.parent_name}</td>
                    <td className="p-3">{l.phone}</td>
                    <td className="p-3">{l.child_age}</td>
                    <td className="p-3 max-w-xs truncate">{l.concern}</td>
                    <td className="p-3">{l.status || "new"}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-500">리드가 없습니다</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
