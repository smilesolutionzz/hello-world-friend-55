import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";

type Ctx = { centerId: string };

interface Client {
  id: string;
  name: string;
  gender: string | null;
  birth_date: string | null;
  phone: string | null;
  disability_info: string | null;
  status: string;
  created_at: string;
}

const statusLabel: Record<string, string> = { waiting: "대기", enrolled: "등록", terminated: "종결" };

export default function ClientsPage() {
  const { centerId } = useOutletContext<Ctx>();
  const [rows, setRows] = useState<Client[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase.from("center_clients").select("*").eq("center_id", centerId).order("created_at", { ascending: false })
      .then(({ data }) => { setRows((data ?? []) as Client[]); setLoading(false); });
  }, [centerId]);

  const filtered = rows.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (q && !r.name.includes(q)) return false;
    return true;
  });

  const counts = { waiting: rows.filter(r => r.status === "waiting").length, enrolled: rows.filter(r => r.status === "enrolled").length, terminated: rows.filter(r => r.status === "terminated").length };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-1">이용자 관리</h1>
      <p className="text-sm text-neutral-500 mb-6">총 {rows.length}명</p>

      <div className="flex gap-2 mb-6">
        {(["all", "waiting", "enrolled", "terminated"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm ${filter === s ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200"}`}>
            {s === "all" ? `전체 ${rows.length}` : `${statusLabel[s]} ${counts[s as keyof typeof counts]}`}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름으로 검색"
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 bg-white" />
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="text-left p-3 font-medium">이름</th>
              <th className="text-left p-3 font-medium">성별</th>
              <th className="text-left p-3 font-medium">생년월일</th>
              <th className="text-left p-3 font-medium">전화</th>
              <th className="text-left p-3 font-medium">장애정보</th>
              <th className="text-left p-3 font-medium">상태</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-neutral-400">불러오는 중…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-neutral-400">데이터가 없습니다. 엑셀 이관을 먼저 진행하세요.</td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id} className="border-t border-neutral-100">
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3">{r.gender ?? "—"}</td>
                <td className="p-3">{r.birth_date ?? "—"}</td>
                <td className="p-3">{r.phone ?? "—"}</td>
                <td className="p-3 text-neutral-600">{r.disability_info ?? "—"}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-neutral-100">{statusLabel[r.status] ?? r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
