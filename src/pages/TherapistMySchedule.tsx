import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Calendar, Check, X, RotateCcw, ChevronLeft, ChevronRight, LogOut, Building2, Loader2, FileText, Users } from "lucide-react";

type Session = {
  id: string;
  session_date: string;
  start_time: string | null;
  end_time: string | null;
  status: "scheduled" | "completed" | "cancelled" | "cancelled_makeup" | "cancelled_carry";
  client_id: string;
  program_id: string | null;
  note: string | null;
  center_id: string;
};

const STATUS_META = {
  scheduled: { label: "예정", tone: "text-amber-700 bg-amber-50 border-amber-200" },
  completed: { label: "완료", tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  cancelled: { label: "취소", tone: "text-rose-700 bg-rose-50 border-rose-200" },
  cancelled_makeup: { label: "취소(보강)", tone: "text-violet-700 bg-violet-50 border-violet-200" },
  cancelled_carry: { label: "취소(이월)", tone: "text-neutral-700 bg-neutral-100 border-neutral-200" },
} as const;

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

export default function TherapistMySchedule() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [view, setView] = useState<"day" | "week">("week");
  const [cursor, setCursor] = useState(new Date());
  const [claimCode, setClaimCode] = useState("");
  const [claiming, setClaiming] = useState(false);

  async function reload() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { nav("/auth"); return; }

    const [{ data: t }, { data: s }, { data: c }, { data: p }] = await Promise.all([
      supabase.from("center_therapists").select("*").eq("linked_user_id", user.id),
      supabase.from("center_sessions").select("*").order("session_date").order("start_time"),
      supabase.from("center_clients").select("id, name"),
      supabase.from("center_programs").select("id, name, category"),
    ]);
    setTherapists(t ?? []);
    setSessions((s ?? []) as Session[]);
    setClients(c ?? []);
    setPrograms(p ?? []);
    setLoading(false);
  }

  useEffect(() => { reload(); }, []);

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!claimAccount.trim()) return;
    setClaiming(true);
    try {
      const { error } = await supabase.rpc("claim_therapist_account", { _login_account: claimAccount.trim() });
      if (error) throw error;
      toast({ title: "계정 연결 완료", description: "내 일정을 불러옵니다." });
      setClaimAccount("");
      await reload();
    } catch (e: any) {
      const msg = e?.message?.includes("THERAPIST_NOT_FOUND")
        ? "해당 계정으로 등록된 치료사가 없거나 이미 다른 계정에 연결되어 있어요. 기관장에게 문의해주세요."
        : e?.message ?? "연결에 실패했어요.";
      toast({ title: "연결 실패", description: msg, variant: "destructive" });
    } finally { setClaiming(false); }
  }

  async function updateStatus(s: Session, status: Session["status"]) {
    const prev = sessions;
    setSessions((rows) => rows.map((r) => (r.id === s.id ? { ...r, status } : r)));
    const { error } = await supabase.from("center_sessions").update({ status }).eq("id", s.id);
    if (error) {
      setSessions(prev);
      toast({ title: "변경 실패", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "상태가 변경되었어요", description: STATUS_META[status].label });
    }
  }

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? "—";
  const programName = (id: string | null) => id ? (programs.find((p) => p.id === id)?.name ?? "—") : "—";

  const range = useMemo(() => {
    if (view === "day") return { start: cursor, end: cursor };
    const day = cursor.getDay();
    const start = addDays(cursor, day === 0 ? -6 : 1 - day);
    return { start, end: addDays(start, 6) };
  }, [view, cursor]);

  const days = useMemo(() => {
    const out: Date[] = [];
    let d = new Date(range.start);
    while (d <= range.end) { out.push(new Date(d)); d = addDays(d, 1); }
    return out;
  }, [range]);

  const visible = useMemo(() => {
    const s = fmt(range.start), e = fmt(range.end);
    return sessions.filter((x) => x.session_date >= s && x.session_date <= e);
  }, [sessions, range]);

  if (loading) {
    return <div className="min-h-screen bg-neutral-50 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>;
  }

  // 미연결 상태 → 계정 청구 화면
  if (therapists.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-neutral-200 w-full max-w-md p-6">
          <div className="flex items-center gap-2 mb-2"><Building2 className="w-5 h-5 text-neutral-500" /><span className="text-xs tracking-widest text-neutral-400">THERAPIST · CONNECT</span></div>
          <h1 className="text-xl font-semibold mb-1">기관 등록 계정 연결</h1>
          <p className="text-sm text-neutral-500 mb-4 break-keep">기관장이 등록해 둔 치료사 계정과 지금 로그인한 아이디를 연결하면, 내 일정이 자동으로 동기화돼요.</p>
          <form onSubmit={handleClaim} className="space-y-3">
            <input
              value={claimAccount}
              onChange={(e) => setClaimAccount(e.target.value)}
              placeholder="기관에서 받은 로그인 계정 (예: park.jiyoung)"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:border-neutral-400 outline-none"
            />
            <button type="submit" disabled={claiming || !claimAccount.trim()} className="w-full px-4 py-3 rounded-xl bg-neutral-900 text-white text-sm font-medium disabled:opacity-40 inline-flex items-center justify-center gap-2">
              {claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              내 계정에 연결
            </button>
          </form>
          <button onClick={() => supabase.auth.signOut().then(() => nav("/auth"))} className="mt-4 text-xs text-neutral-500 inline-flex items-center gap-1"><LogOut className="w-3 h-3" /> 다른 계정으로 로그인</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-neutral-200">
        <div className="px-4 py-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] tracking-widest text-neutral-400">MY SCHEDULE</p>
            <h1 className="text-base font-semibold">{therapists.map((t) => t.name).join(" · ")} 선생님</h1>
          </div>
          <div className="inline-flex rounded-full border border-neutral-200 p-0.5 bg-white">
            <button onClick={() => setView("day")} className={`px-3 py-1 text-xs rounded-full ${view === "day" ? "bg-neutral-900 text-white" : "text-neutral-600"}`}>일</button>
            <button onClick={() => setView("week")} className={`px-3 py-1 text-xs rounded-full ${view === "week" ? "bg-neutral-900 text-white" : "text-neutral-600"}`}>주</button>
          </div>
        </div>
        <div className="px-4 pb-3 flex items-center justify-between">
          <button onClick={() => setCursor(addDays(cursor, view === "day" ? -1 : -7))} className="p-2 rounded-full hover:bg-neutral-100"><ChevronLeft className="w-4 h-4" /></button>
          <p className="text-sm font-medium">
            {view === "day"
              ? `${cursor.getFullYear()}.${cursor.getMonth() + 1}.${cursor.getDate()}`
              : `${range.start.getMonth() + 1}.${range.start.getDate()} – ${range.end.getMonth() + 1}.${range.end.getDate()}`}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCursor(new Date())} className="text-[11px] px-2 py-1 rounded-full bg-neutral-900 text-white">오늘</button>
            <button onClick={() => setCursor(addDays(cursor, view === "day" ? 1 : 7))} className="p-2 rounded-full hover:bg-neutral-100"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {days.map((d) => {
          const ds = fmt(d);
          const list = visible.filter((s) => s.session_date === ds).sort((a, b) => (a.start_time ?? "").localeCompare(b.start_time ?? ""));
          if (list.length === 0 && view === "day") {
            return <div key={ds} className="text-center text-neutral-400 text-sm py-12">예정된 수업이 없어요.</div>;
          }
          if (list.length === 0) return null;
          return (
            <section key={ds}>
              <p className="text-xs font-semibold text-neutral-500 mb-2 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> {d.getMonth() + 1}월 {d.getDate()}일 ({["일", "월", "화", "수", "목", "금", "토"][d.getDay()]}) · {list.length}건
              </p>
              <div className="space-y-2">
                {list.map((s) => {
                  const meta = STATUS_META[s.status];
                  const cancelled = s.status.startsWith("cancelled");
                  return (
                    <div key={s.id} className={`bg-white rounded-2xl border border-neutral-200 p-3 ${cancelled ? "opacity-60" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium ${cancelled ? "line-through" : ""}`}>{clientName(s.client_id)}</p>
                          <p className="text-xs text-neutral-500 truncate">{programName(s.program_id)}</p>
                          <p className="text-[11px] text-neutral-400 mt-0.5 tabular-nums">{s.start_time?.slice(0, 5) ?? "--:--"}{s.end_time ? `–${s.end_time.slice(0, 5)}` : ""}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${meta.tone}`}>{meta.label}</span>
                      </div>
                      {s.note && <p className="text-xs text-neutral-600 mt-2 bg-neutral-50 rounded-lg px-2 py-1.5 break-keep">{s.note}</p>}
                      <div className="flex items-center gap-1.5 mt-3">
                        {s.status !== "completed" && (
                          <button onClick={() => updateStatus(s, "completed")} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-emerald-600 text-white">
                            <Check className="w-3 h-3" /> 완료
                          </button>
                        )}
                        {s.status !== "cancelled" && s.status !== "cancelled_makeup" && (
                          <button onClick={() => updateStatus(s, "cancelled")} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-neutral-200 text-neutral-700">
                            <X className="w-3 h-3" /> 취소
                          </button>
                        )}
                        {s.status !== "scheduled" && (
                          <button onClick={() => updateStatus(s, "scheduled")} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-neutral-200 text-neutral-500">
                            <RotateCcw className="w-3 h-3" /> 되돌리기
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
        {view === "week" && visible.length === 0 && (
          <div className="text-center text-neutral-400 text-sm py-16">이번 주에 예정된 수업이 없어요.</div>
        )}
      </div>
    </div>
  );
}
