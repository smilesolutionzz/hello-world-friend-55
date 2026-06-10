import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

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

export default function PartnerLeads() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setAuthed(false); return; }
      setAuthed(true);
      const { data } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      setLeads((data as Lead[]) || []);
      setLoading(false);
    })();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("leads").update({ status }).eq("id", id);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const todayCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return leads.filter((l) => l.created_at.slice(0, 10) === today).length;
  }, [leads]);

  if (authed === null) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (authed === false) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">상담 신청 리드</h1>
        <p className="text-sm text-gray-500 mb-6">우리 기관에 들어온 상담 문의입니다.</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border">
            <div className="text-sm text-gray-500">전체</div>
            <div className="text-3xl font-bold mt-1">{leads.length}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border">
            <div className="text-sm text-gray-500">오늘 신규</div>
            <div className="text-3xl font-bold mt-1">{todayCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center"><Loader2 className="animate-spin inline" /></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">일시</th>
                  <th className="p-3">보호자</th>
                  <th className="p-3">연락처</th>
                  <th className="p-3">아이 나이</th>
                  <th className="p-3">고민</th>
                  <th className="p-3">상태</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="p-3 whitespace-nowrap">{new Date(l.created_at).toLocaleString("ko-KR")}</td>
                    <td className="p-3">{l.parent_name}</td>
                    <td className="p-3">{l.phone}</td>
                    <td className="p-3">{l.child_age}</td>
                    <td className="p-3 max-w-xs">{l.concern}</td>
                    <td className="p-3">
                      <select
                        value={l.status || "new"}
                        onChange={(e) => updateStatus(l.id, e.target.value)}
                        className="border rounded-lg px-2 py-1 text-xs"
                      >
                        <option value="new">신규</option>
                        <option value="contacted">연락완료</option>
                        <option value="scheduled">상담예약</option>
                        <option value="closed">종료</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">아직 들어온 리드가 없습니다</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
