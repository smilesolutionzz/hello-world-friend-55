import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Save, Loader2, Sparkles } from "lucide-react";

type Props = {
  centerId: string;
  clientId: string;
  weekKey: string; // ISO week e.g. 2026-W26
};

type StatusCode = "scheduled" | "completed" | "cancelled" | "cancelled_makeup" | "cancelled_carry";

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  scheduled: { label: "예정", tone: "text-amber-700 bg-amber-50 border-amber-200" },
  completed: { label: "완료", tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  cancelled: { label: "취소", tone: "text-rose-700 bg-rose-50 border-rose-200" },
  cancelled_makeup: { label: "취소(보강)", tone: "text-violet-700 bg-violet-50 border-violet-200" },
  cancelled_carry: { label: "취소(이월)", tone: "text-neutral-700 bg-neutral-100 border-neutral-200" },
};

function weekRangeFromKey(weekKey: string): [string, string] {
  const m = weekKey.match(/^(\d{4})-W(\d{2})$/);
  if (!m) { const t = new Date().toISOString().slice(0,10); return [t, t]; }
  const y = parseInt(m[1]); const w = parseInt(m[2]);
  const jan4 = new Date(Date.UTC(y, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Mon = new Date(jan4); week1Mon.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));
  const start = new Date(week1Mon); start.setUTCDate(week1Mon.getUTCDate() + (w - 1) * 7);
  const end = new Date(start); end.setUTCDate(start.getUTCDate() + 6);
  return [start.toISOString().slice(0,10), end.toISOString().slice(0,10)];
}

export default function WeeklySessionRecords({ centerId, clientId, weekKey }: Props) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [edits, setEdits] = useState<Record<string, { consult: string; record: string; special: string; keywords?: string; dirty?: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expandingId, setExpandingId] = useState<string | null>(null);
  const range = useMemo(() => weekRangeFromKey(weekKey), [weekKey]);

  useEffect(() => {
    if (!centerId || !clientId) { setSessions([]); setEdits({}); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [s, t, p] = await Promise.all([
        supabase.from("center_sessions").select("*")
          .eq("center_id", centerId).eq("client_id", clientId)
          .gte("session_date", range[0]).lte("session_date", range[1])
          .order("session_date").order("start_time", { nullsFirst: true }),
        supabase.from("center_therapists").select("id,name,title").eq("center_id", centerId),
        supabase.from("center_programs").select("id,name,category").eq("center_id", centerId),
      ]);
      if (cancelled) return;
      setSessions(s.data ?? []);
      setTherapists(t.data ?? []);
      setPrograms(p.data ?? []);
      const seed: Record<string, any> = {};
      for (const r of s.data ?? []) {
        const m = (r as any).meta?.records ?? {};
        seed[r.id] = { consult: m.consult ?? "", record: m.record ?? "", special: m.special ?? "" };
      }
      setEdits(seed);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [centerId, clientId, range[0], range[1]]);

  const updateEdit = (id: string, key: "consult" | "record" | "special", value: string) => {
    setEdits((p) => ({ ...p, [id]: { ...p[id], [key]: value, dirty: true } }));
  };

  const saveOne = async (id: string) => {
    const e = edits[id]; if (!e) return;
    setSavingId(id);
    const session = sessions.find((s) => s.id === id);
    const nextMeta = { ...(session?.meta ?? {}), records: { consult: e.consult, record: e.record, special: e.special } };
    const { error } = await supabase.from("center_sessions").update({ meta: nextMeta }).eq("id", id);
    if (error) { toast({ title: "저장 실패", description: error.message, variant: "destructive" }); setSavingId(null); return; }
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, meta: nextMeta } : s)));
    setEdits((p) => ({ ...p, [id]: { ...p[id], dirty: false } }));
    setSavingId(null);
    toast({ title: "기록이 저장됐어요" });
  };

  if (!clientId) return null;

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 p-6">
      <div className="mb-4">
        <h2 className="font-semibold">이번 주 회기 기록 ({sessions.length}건)</h2>
        <p className="text-xs text-neutral-500 mt-0.5">회기마다 상담/기록/특이사항을 입력하면 주간 AI 노트 생성에 자동 반영됩니다.</p>
      </div>
      {loading ? (
        <p className="text-sm text-neutral-400 py-6 text-center">불러오는 중…</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-neutral-400 py-6 text-center">이번 주 잡힌 회기가 없어요.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const e = edits[s.id] ?? { consult: "", record: "", special: "" };
            const status = STATUS_LABEL[s.status];
            const th = therapists.find((t) => t.id === s.therapist_id);
            const pg = programs.find((p) => p.id === s.program_id);
            return (
              <div key={s.id} className="border border-neutral-100 rounded-2xl p-4 bg-neutral-50/40">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="text-sm">
                    <span className="font-medium">{s.session_date}</span>
                    <span className="text-neutral-500 ml-2">{s.start_time?.slice(0,5) ?? "—"}{s.end_time ? ` ~ ${s.end_time.slice(0,5)}` : ""}</span>
                    {pg && <span className="text-neutral-500 ml-2">· {pg.name}</span>}
                    {th && <span className="text-neutral-500 ml-2">· {th.name}{th.title ? `/${th.title}` : ""}</span>}
                  </div>
                  {status && <span className={`text-[11px] px-2 py-0.5 rounded-full border ${status.tone}`}>{status.label}</span>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <textarea value={e.consult} onChange={(ev) => updateEdit(s.id, "consult", ev.target.value)} placeholder="상담내용" rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400 resize-y bg-white" />
                  <textarea value={e.record} onChange={(ev) => updateEdit(s.id, "record", ev.target.value)} placeholder="기록내용" rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400 resize-y bg-white" />
                  <textarea value={e.special} onChange={(ev) => updateEdit(s.id, "special", ev.target.value)} placeholder="특이사항" rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400 resize-y bg-white" />
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => saveOne(s.id)}
                    disabled={savingId === s.id || !edits[s.id]?.dirty}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition ${
                      edits[s.id]?.dirty ? "bg-neutral-900 text-white hover:bg-neutral-800" : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    }`}
                  >
                    {savingId === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    {savingId === s.id ? "저장 중…" : edits[s.id]?.dirty ? "저장" : "저장됨"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
