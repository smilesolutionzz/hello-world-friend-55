import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, Printer, Save } from "lucide-react";

type Ctx = { centerId: string; demo?: boolean };
type StatusCode = "scheduled" | "completed" | "cancelled" | "cancelled_makeup" | "cancelled_carry";

const STATUS_LABEL: Record<StatusCode, { label: string; tone: string }> = {
  scheduled: { label: "예정", tone: "text-amber-700 bg-amber-50 border-amber-200" },
  completed: { label: "완료", tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  cancelled: { label: "취소", tone: "text-rose-700 bg-rose-50 border-rose-200" },
  cancelled_makeup: { label: "취소(보강)", tone: "text-violet-700 bg-violet-50 border-violet-200" },
  cancelled_carry: { label: "취소(이월)", tone: "text-neutral-700 bg-neutral-100 border-neutral-200" },
};
const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function thisWeekRange(): [string, string] {
  const d = new Date();
  const day = d.getDay();
  const monOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(d); start.setDate(d.getDate() + monOffset);
  const end = new Date(start); end.setDate(start.getDate() + 6);
  return [fmt(start), fmt(end)];
}
function thisMonthRange(): [string, string] {
  const d = new Date();
  const s = new Date(d.getFullYear(), d.getMonth(), 1);
  const e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return [fmt(s), fmt(e)];
}

export default function SessionRecordsPage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);

  // 필터
  const [mode, setMode] = useState<"range" | "month">("range");
  const [from, setFrom] = useState(thisWeekRange()[0]);
  const [to, setTo] = useState(thisWeekRange()[1]);
  const [monthCursor, setMonthCursor] = useState(() => `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`);
  const [statusFilter, setStatusFilter] = useState<Record<StatusCode, boolean>>({
    scheduled: true, completed: true, cancelled: true, cancelled_makeup: true, cancelled_carry: true,
  });
  const [clientId, setClientId] = useState("");
  const [therapistId, setTherapistId] = useState("");
  const [programId, setProgramId] = useState("");

  // 편집 버퍼 (id -> {consult, record, special})
  const [edits, setEdits] = useState<Record<string, { consult: string; record: string; special: string; dirty?: boolean }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const effectiveRange = useMemo<[string, string]>(() => {
    if (mode === "month") {
      const [y, m] = monthCursor.split("-").map(Number);
      const s = `${y}-${String(m).padStart(2, "0")}-01`;
      const last = new Date(y, m, 0).getDate();
      return [s, `${y}-${String(m).padStart(2, "0")}-${String(last).padStart(2, "0")}`];
    }
    return [from, to];
  }, [mode, from, to, monthCursor]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [s, c, t, p] = await Promise.all([
        supabase.from("center_sessions").select("*").eq("center_id", centerId)
          .gte("session_date", effectiveRange[0]).lte("session_date", effectiveRange[1])
          .order("session_date").order("start_time", { nullsFirst: true }),
        supabase.from("center_clients").select("id,name").eq("center_id", centerId).order("name"),
        supabase.from("center_therapists").select("id,name,title,specialty").eq("center_id", centerId).order("name"),
        supabase.from("center_programs").select("id,name,category").eq("center_id", centerId).order("name"),
      ]);
      setSessions(s.data ?? []);
      setClients(c.data ?? []);
      setTherapists(t.data ?? []);
      setPrograms(p.data ?? []);
      // 편집 버퍼 시드
      const seed: Record<string, any> = {};
      for (const r of s.data ?? []) {
        const m = (r as any).meta?.records ?? {};
        seed[r.id] = {
          consult: m.consult ?? "",
          record: m.record ?? "",
          special: m.special ?? "",
        };
      }
      setEdits(seed);
      setLoading(false);
    })();
  }, [centerId, effectiveRange[0], effectiveRange[1]]);

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (!statusFilter[s.status as StatusCode]) return false;
      if (clientId && s.client_id !== clientId) return false;
      if (therapistId && s.therapist_id !== therapistId) return false;
      if (programId && s.program_id !== programId) return false;
      return true;
    });
  }, [sessions, statusFilter, clientId, therapistId, programId]);

  function setQuick(kind: "today" | "week" | "month") {
    setMode("range");
    const d = new Date();
    if (kind === "today") {
      const s = fmt(d); setFrom(s); setTo(s);
    } else if (kind === "week") {
      const [s, e] = thisWeekRange(); setFrom(s); setTo(e);
    } else {
      const [s, e] = thisMonthRange(); setFrom(s); setTo(e);
    }
  }

  function updateEdit(id: string, key: "consult" | "record" | "special", value: string) {
    setEdits((p) => ({ ...p, [id]: { ...p[id], [key]: value, dirty: true } }));
  }

  async function saveOne(id: string) {
    const e = edits[id];
    if (!e) return;
    setSavingId(id);
    const session = sessions.find((s) => s.id === id);
    const nextMeta = { ...(session?.meta ?? {}), records: { consult: e.consult, record: e.record, special: e.special } };
    if (!demo) {
      const { error } = await supabase.from("center_sessions").update({ meta: nextMeta }).eq("id", id);
      if (error) { toast({ title: "저장 실패", description: error.message, variant: "destructive" }); setSavingId(null); return; }
    }
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, meta: nextMeta } : s)));
    setEdits((p) => ({ ...p, [id]: { ...p[id], dirty: false } }));
    setSavingId(null);
    toast({ title: "기록이 저장됐어요" });
  }

  function downloadCsv() {
    const rows = [["일자", "시작", "종료", "상태", "이용자", "선생님", "프로그램", "상담내용", "기록내용", "특이사항"]];
    for (const s of filtered) {
      const e = edits[s.id] ?? { consult: "", record: "", special: "" };
      rows.push([
        s.session_date,
        s.start_time ?? "",
        s.end_time ?? "",
        STATUS_LABEL[s.status as StatusCode]?.label ?? s.status,
        clients.find((c) => c.id === s.client_id)?.name ?? "",
        therapists.find((t) => t.id === s.therapist_id)?.name ?? "",
        programs.find((p) => p.id === s.program_id)?.name ?? "",
        e.consult,
        e.record,
        e.special,
      ]);
    }
    const csv = "\ufeff" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `회기기록_${effectiveRange[0]}_${effectiveRange[1]}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">일일 서비스 관리 · 회기기록</h1>
        <p className="text-sm text-neutral-500 mt-1">기간을 선택하면 해당 회기마다 상담내용 · 기록내용 · 특이사항을 바로 입력하고 저장할 수 있어요.</p>
      </div>

      {/* 필터 바 */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-5 mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-1.5 text-sm">
            <input type="radio" checked={mode === "range"} onChange={() => setMode("range")} className="accent-neutral-900" />
            기간별 검색
          </label>
          <label className="inline-flex items-center gap-1.5 text-sm">
            <input type="radio" checked={mode === "month"} onChange={() => setMode("month")} className="accent-neutral-900" />
            월별 검색
          </label>
          {mode === "range" ? (
            <>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-1.5 rounded-lg border border-neutral-200 text-sm" />
              <span className="text-neutral-400">~</span>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-1.5 rounded-lg border border-neutral-200 text-sm" />
              <button onClick={() => setQuick("today")} className="text-xs px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200">오늘</button>
              <button onClick={() => setQuick("week")} className="text-xs px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200">이번주</button>
              <button onClick={() => setQuick("month")} className="text-xs px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200">이번달</button>
            </>
          ) : (
            <input type="month" value={monthCursor} onChange={(e) => setMonthCursor(e.target.value)} className="px-3 py-1.5 rounded-lg border border-neutral-200 text-sm" />
          )}
          <div className="ml-auto flex items-center gap-2">
            <button onClick={downloadCsv} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-neutral-200 hover:border-neutral-400">
              <Download className="w-3.5 h-3.5" /> 전체 다운로드
            </button>
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-neutral-200 hover:border-neutral-400">
              <Printer className="w-3.5 h-3.5" /> 전체 출력
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-neutral-500">상태</span>
          {(Object.keys(STATUS_LABEL) as StatusCode[]).map((s) => (
            <label key={s} className="inline-flex items-center gap-1.5 text-xs">
              <input type="checkbox" checked={statusFilter[s]} onChange={(e) => setStatusFilter((p) => ({ ...p, [s]: e.target.checked }))} className="accent-neutral-900" />
              {STATUS_LABEL[s].label}
            </label>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="px-3 py-2 rounded-lg border border-neutral-200 text-sm">
            <option value="">이용자를 선택하세요…</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={therapistId} onChange={(e) => setTherapistId(e.target.value)} className="px-3 py-2 rounded-lg border border-neutral-200 text-sm">
            <option value="">선생님을 선택하세요…</option>
            {therapists.map((t) => <option key={t.id} value={t.id}>{t.name} {t.title ? `· ${t.title}` : ""}</option>)}
          </select>
          <select value={programId} onChange={(e) => setProgramId(e.target.value)} className="px-3 py-2 rounded-lg border border-neutral-200 text-sm">
            <option value="">프로그램을 선택하세요…</option>
            {programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* 회기 카드 리스트 */}
      {loading ? (
        <div className="p-12 text-center text-neutral-400">불러오는 중…</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-neutral-400 bg-white rounded-2xl border border-neutral-200">
          조건에 맞는 회기가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const e = edits[s.id] ?? { consult: "", record: "", special: "" };
            const date = new Date(s.session_date + "T00:00:00");
            const dayLabel = DAY_LABELS[date.getDay()];
            const dur = (s.start_time && s.end_time)
              ? Math.max(0, (parseInt(s.end_time.slice(0, 2)) * 60 + parseInt(s.end_time.slice(3, 5))) - (parseInt(s.start_time.slice(0, 2)) * 60 + parseInt(s.start_time.slice(3, 5))))
              : null;
            const status = STATUS_LABEL[s.status as StatusCode];
            const clientName = clients.find((c) => c.id === s.client_id)?.name ?? "—";
            const therapist = therapists.find((t) => t.id === s.therapist_id);
            const program = programs.find((p) => p.id === s.program_id);
            return (
              <div key={s.id} className="bg-white rounded-2xl border border-neutral-200 grid grid-cols-1 md:grid-cols-[200px_1fr_120px] gap-0">
                {/* Left: 일시 + 상태 */}
                <div className="p-4 md:p-5 md:border-r border-neutral-100">
                  <p className="text-[11px] text-neutral-400 mb-2">일시</p>
                  <p className="text-lg font-semibold leading-tight">{s.session_date} <span className="text-neutral-400 text-sm">({dayLabel})</span></p>
                  <p className="text-sm text-neutral-600 mt-1">
                    {s.start_time ?? "—"} {s.end_time ? `~ ${s.end_time}` : ""}
                    {dur != null ? <span className="text-neutral-400"> ({dur}분)</span> : null}
                  </p>
                  <div className="mt-3">
                    <span className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-full border ${status?.tone ?? ""}`}>
                      상태: {status?.label ?? s.status}
                    </span>
                  </div>
                </div>

                {/* Mid: 폼 */}
                <div className="p-4 md:p-5 space-y-3 min-w-0">
                  <div className="grid grid-cols-[64px_1fr] gap-x-3 gap-y-1 text-sm">
                    <span className="text-neutral-500">이용자:</span><span className="font-medium">{clientName}</span>
                    <span className="text-neutral-500">선생님:</span><span>{therapist ? `${therapist.name}${therapist.title ? ` / ${therapist.title}` : ""}` : "—"}</span>
                    <span className="text-neutral-500">프로그램:</span><span>{program ? `${program.name}${program.category ? ` [${program.category}]` : ""}` : "—"}</span>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">상담내용:</p>
                    <textarea
                      value={e.consult}
                      onChange={(ev) => updateEdit(s.id, "consult", ev.target.value)}
                      placeholder="등록된 내용이 없습니다."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400 resize-y"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">기록내용:</p>
                    <textarea
                      value={e.record}
                      onChange={(ev) => updateEdit(s.id, "record", ev.target.value)}
                      placeholder="등록된 내용이 없습니다."
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400 resize-y"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">특이사항:</p>
                    <textarea
                      value={e.special}
                      onChange={(ev) => updateEdit(s.id, "special", ev.target.value)}
                      placeholder="등록된 내용이 없습니다."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400 resize-y"
                    />
                  </div>
                </div>

                {/* Right: 등록 버튼 */}
                <div className="p-4 md:p-5 md:border-l border-neutral-100 flex md:flex-col items-end md:items-stretch gap-2">
                  <button
                    onClick={() => saveOne(s.id)}
                    disabled={savingId === s.id || !edits[s.id]?.dirty}
                    className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm transition ${
                      edits[s.id]?.dirty
                        ? "bg-neutral-900 text-white hover:bg-neutral-800"
                        : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingId === s.id ? "저장 중…" : edits[s.id]?.dirty ? "등록" : "저장됨"}
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
