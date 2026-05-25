import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Ctx = { centerId: string };

export default function ByTherapistPage() {
  const { centerId } = useOutletContext<Ctx>();
  const [data, setData] = useState<Array<{ therapist: any; clients: any[] }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: ts } = await supabase.from("center_therapists").select("*").eq("center_id", centerId);
      const { data: sessions } = await supabase.from("center_sessions")
        .select("therapist_id, client:center_clients(id,name,gender,birth_date)")
        .eq("center_id", centerId);
      const map: Record<string, Map<string, any>> = {};
      (sessions ?? []).forEach((s: any) => {
        if (!s.therapist_id || !s.client) return;
        (map[s.therapist_id] ||= new Map()).set(s.client.id, s.client);
      });
      setData((ts ?? []).map((t: any) => ({ therapist: t, clients: Array.from(map[t.id]?.values() ?? []) })));
      setLoading(false);
    })();
  }, [centerId]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-1">선생님별 이용자 현황</h1>
      <p className="text-sm text-neutral-500 mb-6">선생님 {data.length}명</p>
      {loading ? <p className="text-neutral-400">불러오는 중…</p> : (
        <div className="grid md:grid-cols-2 gap-4">
          {data.map(({ therapist, clients }) => (
            <div key={therapist.id} className="bg-white rounded-2xl border border-neutral-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 rounded" style={{ backgroundColor: therapist.calendar_color || "#94a3b8" }} />
                  <div>
                    <p className="font-semibold">{therapist.name}</p>
                    <p className="text-xs text-neutral-500">{therapist.specialty ?? "—"}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-neutral-500">{clients.length}명</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {clients.length === 0 ? <span className="text-xs text-neutral-400">담당 없음</span> :
                  clients.map((c) => (
                    <span key={c.id} className="px-3 py-1 text-xs rounded-full bg-neutral-100">
                      {c.name} <span className="text-neutral-400 ml-1">{c.gender ?? ""}</span>
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
