import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_SESSIONS, DEMO_CLIENTS, DEMO_THERAPISTS, DEMO_PROGRAMS } from "@/lib/b2bCenter/demoData";
import { Calendar, Download, X, ChevronLeft, ChevronRight, Search } from "lucide-react";

type Ctx = { centerId: string; demo?: boolean };

type Session = {
  id: string;
  client_id: string | null;
  therapist_id: string | null;
  program_id: string | null;
  session_date: string;
  start_time?: string | null;
  status: string;
};

type Program = { id: string; name: string; category?: string | null };
type Client = { id: string; name: string; gender?: string | null; birth_date?: string | null };
type Therapist = { id: string; name: string };

const COUNSEL_KEYWORDS = ["상담", "평가", "검사", "면담", "초기"];

function isCounseling(p?: Program | null) {
  if (!p) return false;
  const hay = `${p.category ?? ""} ${p.name ?? ""}`;
  return COUNSEL_KEYWORDS.some((k) => hay.includes(k));
}

function fmt(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
const DOW = ["일", "월", "화", "수", "목", "금", "토"];
function dowOf(s: string) {
  const d = new Date(s + "T00:00:00");
  return DOW[d.getDay()];
}

function isAttended(status: string) {
  return status === "completed";
}
function isScheduledOnly(status: string) {
  return !["completed", "cancelled", "cancelled_carry", "cancelled_makeup", "no_show"].includes(status);
}

export default function AttendancePage() {
  const { centerId, demo } = useOutletContext<Ctx>();

  const today = useMemo(() => new Date(), []);
  const [mode, setMode] = useState<"range" | "month">("range");
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return fmt(d);
  });
  const [to, setTo] = useState(() => fmt(new Date()));
  const [monthVal, setMonthVal] = useState(() => `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`);
  const [therapistId, setTherapistId] = useState<string>("");

  const [sessions, setSessions] = useState<Session[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDate, setOpenDate] = useState<string | null>(null);

  // Resolve date range
  const range = useMemo(() => {
    if (mode === "month") {
      const [y, m] = monthVal.split("-").map(Number);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0);
      return { from: fmt(start), to: fmt(end) };
    }
    return { from, to };
  }, [mode, from, to, monthVal]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (demo) {
        setSessions(DEMO_SESSIONS as any);
        setClients(DEMO_CLIENTS.map((c: any) => ({ id: c.id, name: c.display_name, gender: c.gender ?? null, birth_date: c.birth_date ?? null })));
        setTherapists(DEMO_THERAPISTS.map((t) => ({ id: t.id, name: t.name })));
        setPrograms(DEMO_PROGRAMS as any);
        setLoading(false);
        return;
      }
      const [s, c, t, p] = await Promise.all([
        supabase.from("center_sessions").select("id, client_id, therapist_id, program_id, session_date, start_time, status").eq("center_id", centerId).gte("session_date", range.from).lte("session_date", range.to),
        supabase.from("center_clients").select("id, name, gender, birth_date").eq("center_id", centerId),
        supabase.from("center_therapists").select("id, name").eq("center_id", centerId),
        supabase.from("center_programs").select("id, name, category").eq("center_id", centerId),
      ]);
      setSessions((s.data ?? []) as any);
      setClients((c.data ?? []) as any);
      setTherapists((t.data ?? []) as any);
      setPrograms((p.data ?? []) as any);
      setLoading(false);
    })();
  }, [centerId, demo, range.from, range.to]);

  const progMap = useMemo(() => new Map(programs.map((p) => [p.id, p])), [programs]);
  const clientMap = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);

  // Filtered sessions
  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (s.session_date < range.from || s.session_date > range.to) return false;
      if (therapistId && s.therapist_id !== therapistId) return false;
      return true;
    });
  }, [sessions, range, therapistId]);

  // Build days array
  const days = useMemo(() => {
    const out: string[] = [];
    const start = new Date(range.from + "T00:00:00");
    const end = new Date(range.to + "T00:00:00");
    const cur = new Date(start);
    while (cur <= end) {
      out.push(fmt(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }, [range]);

  type Row = { date: string; rehab_total: number; counsel_total: number; rehab_done: number; counsel_done: number; users_total: number; users_done: number };

  const rows: Row[] = useMemo(() => {
    return days.map((d) => {
      const list = filtered.filter((s) => s.session_date === d);
      const usersTotal = new Set<string>();
      const usersDone = new Set<string>();
      let rehab_total = 0, counsel_total = 0, rehab_done = 0, counsel_done = 0;
      list.forEach((s) => {
        const isC = isCounseling(progMap.get(s.program_id ?? ""));
        if (isC) counsel_total++; else rehab_total++;
        if (s.client_id) usersTotal.add(s.client_id);
        if (isAttended(s.status)) {
          if (isC) counsel_done++; else rehab_done++;
          if (s.client_id) usersDone.add(s.client_id);
        }
      });
      return { date: d, rehab_total, counsel_total, rehab_done, counsel_done, users_total: usersTotal.size, users_done: usersDone.size };
    });
  }, [days, filtered, progMap]);

  const totals = useMemo(() => rows.reduce(
    (a, r) => ({
      rehab_total: a.rehab_total + r.rehab_total,
      counsel_total: a.counsel_total + r.counsel_total,
      rehab_done: a.rehab_done + r.rehab_done,
      counsel_done: a.counsel_done + r.counsel_done,
      users_total: a.users_total + r.users_total,
      users_done: a.users_done + r.users_done,
    }),
    { rehab_total: 0, counsel_total: 0, rehab_done: 0, counsel_done: 0, users_total: 0, users_done: 0 },
  ), [rows]);

  const todayStr = fmt(today);

  function downloadCSV() {
    const head = ["날짜", "재활(전체)", "상담/평가(전체)", "소계(전체)", "재활(진행)", "상담/평가(진행)", "소계(진행)", "전체이용자", "실제참석"];
    const lines = [head.join(",")];
    rows.forEach((r) => {
      lines.push([
        `${r.date} (${dowOf(r.date)})`,
        r.rehab_total, r.counsel_total, r.rehab_total + r.counsel_total,
        r.rehab_done, r.counsel_done, r.rehab_done + r.counsel_done,
        r.users_total, r.users_done,
      ].join(","));
    });
    const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `attendance_${range.from}_${range.to}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  // Modal data
  const modalData = useMemo(() => {
    if (!openDate) return null;
    const list = filtered.filter((s) => s.session_date === openDate);
    const byClient = new Map<string, { total: number; done: number; sessions: Session[] }>();
    list.forEach((s) => {
      const key = s.client_id ?? "_";
      const cur = byClient.get(key) ?? { total: 0, done: 0, sessions: [] };
      cur.total++;
      if (isAttended(s.status)) cur.done++;
      cur.sessions.push(s);
      byClient.set(key, cur);
    });
    const arr = Array.from(byClient.entries()).map(([cid, v]) => ({
      client: clientMap.get(cid),
      ...v,
      attended: v.done > 0,
    })).sort((a, b) => (a.client?.name ?? "").localeCompare(b.client?.name ?? "", "ko"));
    return arr;
  }, [openDate, filtered, clientMap]);

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs text-muted-foreground tracking-wide">재활서비스 / 일별 접수인원 현황</div>
        <h1 className="text-2xl font-semibold mt-1">일별 접수인원 현황</h1>
        <p className="text-sm text-muted-foreground mt-1">선택한 기간의 일정·참석 현황을 한눈에 확인하세요.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl border border-border p-5 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="radio" checked={mode === "range"} onChange={() => setMode("range")} className="accent-foreground" />
              기간별 검색
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="radio" checked={mode === "month"} onChange={() => setMode("month")} className="accent-foreground" />
              월별 검색
            </label>
          </div>

          {mode === "range" ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-white">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="text-sm bg-transparent outline-none" />
              </div>
              <span className="text-muted-foreground">~</span>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-white">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="text-sm bg-transparent outline-none" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-white">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <input type="month" value={monthVal} onChange={(e) => setMonthVal(e.target.value)} className="text-sm bg-transparent outline-none" />
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <select value={therapistId} onChange={(e) => setTherapistId(e.target.value)} className="px-3 py-2 rounded-xl border border-border bg-white text-sm">
              <option value="">전체 선생님</option>
              {therapists.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button onClick={downloadCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-white text-sm hover:bg-muted/40">
              <Download className="w-4 h-4" />
              다운로드
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted/30 text-xs text-muted-foreground">
                <th rowSpan={2} className="text-center px-4 py-3 border-b border-r border-border font-medium align-middle min-w-[160px]">날짜</th>
                <th colSpan={3} className="text-center px-4 py-2 border-b border-r border-border font-medium">전체 일정 (개)</th>
                <th colSpan={3} className="text-center px-4 py-2 border-b border-r border-border font-medium">실제 진행된 일정 (개)</th>
                <th rowSpan={2} className="text-center px-4 py-3 border-b border-r border-border font-medium align-middle">전체 이용자 (명)</th>
                <th rowSpan={2} className="text-center px-4 py-3 border-b border-border font-medium align-middle">실제 참석 이용자 (명)</th>
              </tr>
              <tr className="bg-muted/20 text-xs text-muted-foreground">
                <th className="text-center px-4 py-2 border-b border-border font-medium">재활</th>
                <th className="text-center px-4 py-2 border-b border-border font-medium">상담/평가</th>
                <th className="text-center px-4 py-2 border-b border-r border-border font-medium">소계</th>
                <th className="text-center px-4 py-2 border-b border-border font-medium">재활</th>
                <th className="text-center px-4 py-2 border-b border-border font-medium">상담/평가</th>
                <th className="text-center px-4 py-2 border-b border-r border-border font-medium">소계</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="p-12 text-center text-muted-foreground">불러오는 중…</td></tr>
              ) : (
                <>
                  {/* Total row */}
                  <tr className="bg-foreground/[0.03] font-semibold border-b border-border">
                    <td className="text-center px-4 py-3 border-r border-border">
                      <div>합계</div>
                      <div className="text-[11px] text-muted-foreground font-normal mt-0.5">({range.from} ~ {range.to})</div>
                    </td>
                    <td className="text-center px-4 py-3">{totals.rehab_total}</td>
                    <td className="text-center px-4 py-3">{totals.counsel_total}</td>
                    <td className="text-center px-4 py-3 border-r border-border">{totals.rehab_total + totals.counsel_total}</td>
                    <td className="text-center px-4 py-3">{totals.rehab_done}</td>
                    <td className="text-center px-4 py-3">{totals.counsel_done}</td>
                    <td className="text-center px-4 py-3 border-r border-border">{totals.rehab_done + totals.counsel_done}</td>
                    <td className="text-center px-4 py-3 border-r border-border">{totals.users_total}</td>
                    <td className="text-center px-4 py-3">{totals.users_done}</td>
                  </tr>

                  {rows.map((r) => {
                    const isToday = r.date === todayStr;
                    return (
                      <tr key={r.date} onClick={() => setOpenDate(r.date)} className={`cursor-pointer border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors ${isToday ? "bg-amber-50/40" : ""}`}>
                        <td className="text-center px-4 py-3 border-r border-border">
                          <div className="flex items-center justify-center gap-2">
                            {isToday && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-foreground text-background">오늘</span>}
                            <span className={isToday ? "font-semibold" : ""}>{r.date} ({dowOf(r.date)})</span>
                          </div>
                        </td>
                        <td className="text-center px-4 py-3 text-muted-foreground">{r.rehab_total || 0}</td>
                        <td className="text-center px-4 py-3 text-muted-foreground">{r.counsel_total || 0}</td>
                        <td className="text-center px-4 py-3 font-medium border-r border-border">{r.rehab_total + r.counsel_total}</td>
                        <td className="text-center px-4 py-3 text-muted-foreground">{r.rehab_done || 0}</td>
                        <td className="text-center px-4 py-3 text-muted-foreground">{r.counsel_done || 0}</td>
                        <td className="text-center px-4 py-3 font-medium border-r border-border">{r.rehab_done + r.counsel_done}</td>
                        <td className="text-center px-4 py-3 border-r border-border">{r.users_total}</td>
                        <td className="text-center px-4 py-3">
                          <span className={r.users_done > 0 ? "font-medium text-emerald-700" : "text-muted-foreground"}>{r.users_done}</span>
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">행을 클릭하면 해당 일자의 이용자별 참석 현황이 표시됩니다.</p>

      {/* Modal */}
      {openDate && modalData && (
        <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpenDate(null)}>
          <div className="bg-white rounded-3xl border border-border w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <div className="text-xs text-muted-foreground">일일 접수 인원 현황</div>
                <h2 className="text-lg font-semibold mt-0.5">{openDate} ({dowOf(openDate)}) 이용자 목록</h2>
              </div>
              <button onClick={() => setOpenDate(null)} className="p-2 hover:bg-muted rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-3 border-b border-border flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />참석 {modalData.filter((m) => m.attended).length}</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400" />미참석 {modalData.filter((m) => !m.attended).length}</span>
              <span className="ml-auto">총 {modalData.length}명</span>
            </div>

            <div className="overflow-y-auto flex-1">
              {modalData.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground text-sm">등록된 이용자가 없습니다.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 text-xs text-muted-foreground sticky top-0">
                    <tr>
                      <th className="text-left px-6 py-2.5 font-medium w-10">#</th>
                      <th className="text-left px-3 py-2.5 font-medium">이용자</th>
                      <th className="text-center px-3 py-2.5 font-medium w-24">참석 여부</th>
                      <th className="text-right px-6 py-2.5 font-medium w-24">참석 횟수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.map((m, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-6 py-3 text-muted-foreground">{i + 1}</td>
                        <td className="px-3 py-3">
                          <div className="font-medium">{m.client?.name ?? "(미배정)"}</div>
                          {m.client && (m.client.gender || m.client.birth_date) && (
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {m.client.gender === "M" || m.client.gender === "남" ? "남" : m.client.gender === "F" || m.client.gender === "여" ? "여" : m.client.gender}
                              {m.client.birth_date ? `, ${m.client.birth_date}` : ""}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {m.attended ? (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">참석</span>
                          ) : (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">미참석</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className={`text-sm ${m.attended ? "text-foreground" : "text-rose-600"}`}>({m.done}/{m.total})</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2">
              <button onClick={() => setOpenDate(null)} className="px-4 py-2 rounded-xl border border-border bg-white text-sm hover:bg-muted/40">닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
