import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_PROGRAMS } from "@/lib/b2bCenter/demoData";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Ctx = { centerId: string; demo?: boolean };

export default function ProgramsPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ category: "언어", name: "", duration_min: 40, price_krw: 55000, is_voucher: false });

  const load = async () => {
    setLoading(true);
    if (demo) { setRows(DEMO_PROGRAMS); setLoading(false); return; }
    const { data } = await supabase.from("center_programs").select("*").eq("center_id", centerId).order("category");
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [centerId, demo]);

  const add = async () => {
    if (demo) { toast({ title: "데모 모드에서는 저장되지 않아요" }); return; }
    if (!form.name) { toast({ title: "이름을 입력해주세요" }); return; }
    const { error } = await supabase.from("center_programs").insert({ center_id: centerId, ...form } as any);
    if (error) { toast({ title: "실패", description: error.message, variant: "destructive" }); return; }
    setForm({ category: "언어", name: "", duration_min: 40, price_krw: 55000, is_voucher: false });
    load();
  };

  const remove = async (id: string) => {
    if (demo) { toast({ title: "데모 모드에서는 삭제할 수 없어요" }); return; }
    if (!confirm("삭제하시겠어요?")) return;
    await supabase.from("center_programs").delete().eq("id", id);
    load();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-1">프로그램 관리</h1>
      <p className="text-sm text-neutral-500 mb-6">치료 프로그램·단가·바우처 여부를 관리합니다.</p>

      <div className="bg-white rounded-2xl border border-neutral-200 p-5 mb-4">
        <div className="grid grid-cols-6 gap-3 items-end">
          <div><label className="text-xs text-neutral-500">카테고리</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm">
              <option>언어</option><option>감각통합</option><option>놀이</option><option>행동</option><option>인지</option><option>음악</option><option>미술</option>
            </select></div>
          <div className="col-span-2"><label className="text-xs text-neutral-500">프로그램명</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="예) 언어치료 40분" className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="text-xs text-neutral-500">시간(분)</label>
            <input type="number" value={form.duration_min} onChange={(e) => setForm({ ...form, duration_min: +e.target.value })} className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="text-xs text-neutral-500">단가(원)</label>
            <input type="number" value={form.price_krw} onChange={(e) => setForm({ ...form, price_krw: +e.target.value })} className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="text-xs text-neutral-500 block mb-1">바우처</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_voucher} onChange={(e) => setForm({ ...form, is_voucher: e.target.checked })} /> 사용</label></div>
        </div>
        <div className="flex justify-end mt-3"><button onClick={add} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 text-white text-sm"><Plus className="w-4 h-4" /> 추가</button></div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr><th className="text-left p-3">카테고리</th><th className="text-left p-3">이름</th><th className="text-right p-3">시간</th><th className="text-right p-3">단가</th><th className="text-left p-3">바우처</th><th></th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="p-8 text-center text-neutral-400">불러오는 중…</td></tr> :
             rows.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-neutral-400">등록된 프로그램이 없어요</td></tr> :
             rows.map((r) => (
              <tr key={r.id} className="border-t border-neutral-100">
                <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-neutral-100 text-xs">{r.category}</span></td>
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3 text-right">{r.duration_min}분</td>
                <td className="p-3 text-right">{r.price_krw.toLocaleString()}원</td>
                <td className="p-3">{r.is_voucher ? <span className="text-xs text-[#C8B88A]">바우처</span> : <span className="text-xs text-neutral-400">자비</span>}</td>
                <td className="p-3 text-right"><button onClick={() => remove(r.id)} className="text-neutral-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
