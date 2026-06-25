import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Lock, Save, ChevronLeft, Users } from "lucide-react";

export default function TherapistMyClients() {
  const nav = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { nav("/auth"); return; }
    const { data: ts } = await supabase.from("center_therapists").select("id").eq("linked_user_id", user.id);
    const tIds = (ts ?? []).map((t: any) => t.id);
    if (tIds.length === 0) { setLoading(false); return; }
    const { data: sess } = await supabase.from("center_sessions").select("client_id").in("therapist_id", tIds);
    const cIds = Array.from(new Set((sess ?? []).map((s: any) => s.client_id))).filter(Boolean);
    if (cIds.length === 0) { setClients([]); setLoading(false); return; }
    const { data: cs } = await supabase.from("center_clients").select("*").in("id", cIds).order("name");
    setClients(cs ?? []);
    if (id) {
      const found = (cs ?? []).find((c: any) => c.id === id);
      if (found) { setSelected(found); setForm(initForm(found)); }
    } else if ((cs ?? []).length > 0) {
      setSelected(cs![0]); setForm(initForm(cs![0]));
    }
    setLoading(false);
  }

  function initForm(c: any) {
    return {
      phone: c.phone ?? "",
      guardian_phone: c.guardian_phone ?? "",
      address: c.address ?? "",
      disability_info: c.disability_info ?? "",
      note: c.meta?.note ?? "",
    };
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  async function save() {
    if (!selected) return;
    setSaving(true);
    const newMeta = { ...(selected.meta ?? {}), note: form.note };
    const { error } = await supabase.from("center_clients").update({
      phone: form.phone || null,
      guardian_phone: form.guardian_phone || null,
      address: form.address || null,
      disability_info: form.disability_info || null,
      meta: newMeta,
    }).eq("id", selected.id);
    setSaving(false);
    if (error) {
      const msg = error.message.includes("THERAPIST_PROTECTED_FIELD_CHANGE")
        ? "이름·생년월일 등은 관리자만 수정할 수 있어요."
        : error.message;
      toast({ title: "저장 실패", description: msg, variant: "destructive" }); return;
    }
    toast({ title: "저장되었습니다" });
    setSelected({ ...selected, ...form, meta: newMeta });
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>;

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <Helmet><title>내 담당 아동 — 치료사</title></Helmet>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/therapist/my-schedule" className="p-1.5 rounded-full hover:bg-neutral-100"><ChevronLeft className="w-4 h-4" /></Link>
          <div>
            <p className="text-[10px] tracking-widest text-neutral-400">MY CLIENTS</p>
            <h1 className="text-base font-semibold flex items-center gap-1.5"><Users className="w-4 h-4" /> 내 담당 아동 {clients.length}명</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Link to="/therapist/my-schedule" className="px-2 py-1 rounded-full border border-neutral-200">일정</Link>
          <Link to="/therapist/my-notes" className="px-2 py-1 rounded-full border border-neutral-200">주간노트</Link>
        </div>
      </header>

      <div className="p-4 grid md:grid-cols-[260px_1fr] gap-4">
        <aside className="bg-white rounded-2xl border border-neutral-200 p-3 max-h-[70vh] overflow-y-auto">
          {clients.length === 0 ? <p className="text-xs text-neutral-400 px-1">담당 아동이 없습니다.</p> :
           clients.map((c) => (
            <button key={c.id} onClick={() => { setSelected(c); setForm(initForm(c)); }}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm mb-1 ${selected?.id === c.id ? "bg-neutral-900 text-white" : "hover:bg-neutral-100"}`}>
              {c.name} <span className={`text-[10px] ${selected?.id === c.id ? "text-neutral-300" : "text-neutral-400"}`}>{c.gender ?? ""} {c.birth_date ?? ""}</span>
            </button>
          ))}
        </aside>

        {selected && (
          <main className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
            <div className="border-b border-neutral-100 pb-3">
              <h2 className="text-lg font-semibold">{selected.name}</h2>
              <p className="text-xs text-neutral-500 mt-0.5">{selected.gender ?? "—"} · {selected.birth_date ?? "—"} · 회원번호 {selected.member_no ?? "—"}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ReadOnly label="이름" value={selected.name} />
              <ReadOnly label="생년월일" value={selected.birth_date ?? "—"} />
              <Field label="아동 연락처" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <Field label="보호자 연락처" value={form.guardian_phone} onChange={(v) => setForm({ ...form, guardian_phone: v })} />
              <Field className="col-span-2" label="주소" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
              <Field className="col-span-2" label="장애/주의사항" value={form.disability_info} onChange={(v) => setForm({ ...form, disability_info: v })} multiline />
              <Field className="col-span-2" label="치료 메모 (내부)" value={form.note} onChange={(v) => setForm({ ...form, note: v })} multiline />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
              <p className="text-[11px] text-neutral-400 flex items-center gap-1"><Lock className="w-3 h-3" /> 이름·생년월일·회원번호는 관리자만 수정 가능합니다.</p>
              <button onClick={save} disabled={saving} className="text-xs px-4 py-2 rounded-full bg-neutral-900 text-white inline-flex items-center gap-1 disabled:opacity-50">
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} 저장
              </button>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, multiline, className = "" }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; className?: string }) {
  return (
    <div className={className}>
      <label className="text-[11px] text-neutral-500 mb-1 block">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 min-h-[64px]" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 h-10" />
      )}
    </div>
  );
}
function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-[11px] text-neutral-500 mb-1 flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> {label}</label>
      <div className="w-full text-sm bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-2 h-10 flex items-center text-neutral-600">{value}</div>
    </div>
  );
}
