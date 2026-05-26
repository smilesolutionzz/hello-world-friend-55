import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_ASSESSMENTS, DEMO_CLIENTS, DEMO_THERAPISTS } from "@/lib/b2bCenter/demoData";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Ctx = { centerId: string; demo?: boolean };

export default function AssessmentsPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const [rows, setRows] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client_id: "", therapist_id: "", assessment_date: new Date().toISOString().slice(0, 10), assessment_type: "초기상담", content: "" });

  const load = async () => {
    setLoading(true);
    if (demo) {
      setRows(DEMO_ASSESSMENTS);
      setClients(DEMO_CLIENTS.map((c) => ({ id: c.id, name: c.display_name })));
      setTherapists(DEMO_THERAPISTS);
      setLoading(false);
      return;
    }
    const [a, c, t] = await Promise.all([
      supabase.from("center_assessments").select("*").eq("center_id", centerId).order("assessment_date", { ascending: false }).limit(200),
      supabase.from("center_clients").select("id, name").eq("center_id", centerId),
      supabase.from("center_therapists").select("id, name").eq("center_id", centerId),
    ]);
    setRows(a.data ?? []);
    setClients(c.data ?? []);
    setTherapists(t.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [centerId, demo]);

  const submit = async () => {
    if (demo) { toast({ title: "데모 모드에서는 저장되지 않아요" }); setShowForm(false); return; }
    if (!form.client_id) { toast({ title: "이용자를 선택해주세요" }); return; }
    const { error } = await supabase.from("center_assessments").insert({ center_id: centerId, ...form, status: "scheduled" } as any);
    if (error) { toast({ title: "저장 실패", description: error.message, variant: "destructive" }); return; }
    toast({ title: "상담·평가 일정이 등록되었어요" });
    setShowForm(false);
    setForm({ client_id: "", therapist_id: "", assessment_date: new Date().toISOString().slice(0, 10), assessment_type: "초기상담", content: "" });
    load();
  };

  const name = (id: string, arr: any[]) => arr.find((x) => x.id === id)?.name ?? "—";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">상담·평가 관리</h1>
          <p className="text-sm text-neutral-500 mt-1">회기 외 상담·평가 기록을 별도로 관리합니다.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 text-white text-sm"><Plus className="w-4 h-4" /> 새 일정</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 mb-4 grid grid-cols-2 gap-3">
          <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="border border-neutral-200 rounded-lg px-3 py-2 text-sm">
            <option value="">이용자 선택</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={form.therapist_id} onChange={(e) => setForm({ ...form, therapist_id: e.target.value })} className="border border-neutral-200 rounded-lg px-3 py-2 text-sm">
            <option value="">담당자 선택</option>
            {therapists.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input type="date" value={form.assessment_date} onChange={(e) => setForm({ ...form, assessment_date: e.target.value })} className="border border-neutral-200 rounded-lg px-3 py-2 text-sm" />
          <select value={form.assessment_type} onChange={(e) => setForm({ ...form, assessment_type: e.target.value })} className="border border-neutral-200 rounded-lg px-3 py-2 text-sm">
            <option>초기상담</option><option>재평가</option><option>부모상담</option><option>종결상담</option>
          </select>
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="메모" className="col-span-2 border border-neutral-200 rounded-lg px-3 py-2 text-sm h-20" />
          <div className="col-span-2 flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-neutral-600">취소</button>
            <button onClick={submit} className="px-4 py-2 rounded-full bg-neutral-900 text-white text-sm">저장</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr><th className="text-left p-3">날짜</th><th className="text-left p-3">이용자</th><th className="text-left p-3">담당자</th><th className="text-left p-3">유형</th><th className="text-left p-3">상태</th><th className="text-left p-3">메모</th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="p-8 text-center text-neutral-400">불러오는 중…</td></tr> :
             rows.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-neutral-400">등록된 상담·평가가 없어요</td></tr> :
             rows.map((r) => (
              <tr key={r.id} className="border-t border-neutral-100">
                <td className="p-3 font-medium">{r.assessment_date}</td>
                <td className="p-3">{name(r.client_id, clients)}</td>
                <td className="p-3 text-neutral-600">{name(r.therapist_id, therapists)}</td>
                <td className="p-3">{r.assessment_type}</td>
                <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${r.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-600"}`}>{r.status === "completed" ? "완료" : "예정"}</span></td>
                <td className="p-3 text-neutral-500 max-w-md truncate">{r.content || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
