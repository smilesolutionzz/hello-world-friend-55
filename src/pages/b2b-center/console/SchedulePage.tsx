import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_SESSIONS, DEMO_THERAPISTS, DEMO_CLIENTS, DEMO_PROGRAMS } from "@/lib/b2bCenter/demoData";
import { ChevronLeft, ChevronRight, X, Calendar as CalIcon, Grid3x3, Users, Upload, Plus, Trash2, Circle, Square, Triangle, Diamond, Filter, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import ImportWizard from "@/components/b2b-center/ImportWizard";
import ImportHistoryPanel from "@/components/b2b-center/ImportHistoryPanel";

type Ctx = { centerId: string; demo?: boolean };

type ViewMode = "day" | "week" | "fourDay" | "month" | "list";
type GroupMode = "date" | "therapist" | "timetable";
type StatusCode = "scheduled" | "completed" | "cancelled" | "cancelled_makeup" | "cancelled_carry";

const STATUS_META: Record<StatusCode, { label: string; tone: string }> = {
  scheduled: { label: "예정", tone: "text-amber-700 bg-amber-50 border-amber-200" },
  completed: { label: "완료", tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  cancelled: { label: "취소", tone: "text-rose-700 bg-rose-50 border-rose-200" },
  cancelled_makeup: { label: "취소(보강)", tone: "text-violet-700 bg-violet-50 border-violet-200" },
  cancelled_carry: { label: "취소(이월)", tone: "text-neutral-700 bg-neutral-100 border-neutral-200" },
};

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const HOURS = Array.from({ length: 12 }, (_, i) => 9 + i); // 09~20시
// 색각이상에도 구분되도록 채도/명도 차이를 둔 팔레트
const PALETTE = ["#E63946", "#1D7874", "#F4A261", "#264653", "#9D4EDD", "#0077B6", "#FB8500", "#2A9D8F", "#7209B7", "#BC4749", "#3A86FF", "#8AB17D"];
// 색 이외에 형태/테두리로도 구분 (색각이상 보조)
const SHAPES = [Circle, Square, Triangle, Diamond];
const BORDER_STYLES = ["solid", "dashed", "dotted", "double"] as const;
function therapistVisual(t: any) {
  const i = t?._idx ?? 0;
  return {
    Icon: SHAPES[i % SHAPES.length],
    borderStyle: BORDER_STYLES[Math.floor(i / SHAPES.length) % BORDER_STYLES.length],
    color: t?.color ?? "#9ca3af",
  };
}

function startOfWeek(d: Date): Date {
  const x = new Date(d); const day = x.getDay();
  x.setDate(x.getDate() + (day === 0 ? -6 : 1 - day));
  x.setHours(0, 0, 0, 0); return x;
}
function startOfMonth(d: Date): Date { const x = new Date(d.getFullYear(), d.getMonth(), 1); return x; }
function addDays(d: Date, n: number): Date { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function fmt(d: Date): string {
  const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function isSameDate(a: string, b: string) { return a === b; }

export default function SchedulePage() {
  const { centerId, demo } = useOutletContext<Ctx>();

  const [view, setView] = useState<ViewMode>("week");
  const [group, setGroup] = useState<GroupMode>("timetable");
  const { toast } = useToast();
  const [cursor, setCursor] = useState<Date>(new Date());

  const [sessions, setSessions] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<Record<StatusCode, boolean>>({
    scheduled: true, completed: true, cancelled: true, cancelled_makeup: true, cancelled_carry: true,
  });
  const [selected, setSelected] = useState<any | null>(null);
  const [createAt, setCreateAt] = useState<{ date: string; hour: number } | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importRefresh, setImportRefresh] = useState(0);
  const [therapistFilter, setTherapistFilter] = useState<Record<string, boolean>>({});
  const [showTFilter, setShowTFilter] = useState(false);
  const isMobile = useIsMobile();

  // 치료사 색상 화면에서 수정 → 저장
  async function handleColorChange(tid: string, color: string) {
    setTherapists((prev) => prev.map((t) => (t.id === tid ? { ...t, color } : t)));
    if (demo) return;
    const { error } = await supabase.from("center_therapists").update({ calendar_color: color }).eq("id", tid);
    if (error) {
      toast({ title: "색상 저장 실패", description: error.message, variant: "destructive" });
    }
  }

  async function handleCreate(form: { client_id: string; therapist_id: string; program_id: string; start_time: string; end_time: string; note: string }) {
    if (!createAt) return;
    const base = {
      session_date: createAt.date,
      start_time: form.start_time,
      end_time: form.end_time || null,
      client_id: form.client_id,
      therapist_id: form.therapist_id || null,
      program_id: form.program_id || null,
      status: "scheduled" as StatusCode,
      price_krw: programs.find((p) => p.id === form.program_id)?.price_krw ?? 0,
      is_voucher: programs.find((p) => p.id === form.program_id)?.is_voucher ?? false,
      note: form.note || null,
    };
    if (demo) {
      setSessions((prev) => [...prev, { id: `is-${Date.now()}`, ...base }]);
    } else {
      const { data, error } = await supabase.from("center_sessions").insert({ ...base, center_id: centerId }).select().single();
      if (error) { toast({ title: "일정 추가 실패", description: error.message, variant: "destructive" }); return; }
      setSessions((prev) => [...prev, data]);
    }
    toast({ title: "일정이 추가됐어요" });
    setCreateAt(null);
  }

  async function handleDelete(s: any) {
    if (!window.confirm("이 일정을 삭제할까요?")) return;
    if (demo) {
      setSessions((prev) => prev.filter((x) => x.id !== s.id));
    } else {
      const { error } = await supabase.from("center_sessions").delete().eq("id", s.id);
      if (error) { toast({ title: "삭제 실패", description: error.message, variant: "destructive" }); return; }
      setSessions((prev) => prev.filter((x) => x.id !== s.id));
    }
    toast({ title: "일정이 삭제됐어요" });
    setSelected(null);
  }

  useEffect(() => { if (isMobile) { setView("day"); setGroup("date"); } }, [isMobile]);

  // 가시 범위 계산
  const range = useMemo(() => {
    if (view === "day") return { start: cursor, end: cursor };
    if (view === "fourDay") return { start: cursor, end: addDays(cursor, 3) };
    if (view === "week") { const s = startOfWeek(cursor); return { start: s, end: addDays(s, 6) }; }
    if (view === "month") {
      const s = startOfMonth(cursor);
      const e = new Date(s.getFullYear(), s.getMonth() + 1, 0);
      return { start: s, end: e };
    }
    // list: ±30일
    return { start: addDays(cursor, -7), end: addDays(cursor, 30) };
  }, [view, cursor]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (demo) {
        setSessions(DEMO_SESSIONS);
        setTherapists(DEMO_THERAPISTS.map((x: any, i: number) => ({ ...x, _idx: i, color: x.color ?? PALETTE[i % PALETTE.length] })));
        setClients(DEMO_CLIENTS.map((c) => ({ id: c.id, name: c.display_name })));
        setPrograms(DEMO_PROGRAMS);
        setLoading(false); return;
      }
      const [s, t, c, p] = await Promise.all([
        supabase.from("center_sessions").select("*").eq("center_id", centerId)
          .gte("session_date", fmt(range.start)).lte("session_date", fmt(range.end)),
        supabase.from("center_therapists").select("*").eq("center_id", centerId),
        supabase.from("center_clients").select("id, name").eq("center_id", centerId),
        supabase.from("center_programs").select("*").eq("center_id", centerId),
      ]);
      setSessions(s.data ?? []);
      setTherapists((t.data ?? []).map((x: any, i: number) => ({ ...x, _idx: i, color: x.calendar_color ?? x.color ?? PALETTE[i % PALETTE.length] })));
      setClients(c.data ?? []);
      setPrograms(p.data ?? []);
      setLoading(false);
    })();
  }, [centerId, demo, range.start.getTime(), range.end.getTime()]);

  // 치료사 목록 바뀌면 필터 키 동기화 (새로 들어온 치료사는 기본 ON, "미배정"=__none도 포함)
  useEffect(() => {
    setTherapistFilter((prev) => {
      const next: Record<string, boolean> = { __none: prev.__none ?? true };
      for (const t of therapists) next[t.id] = prev[t.id] ?? true;
      return next;
    });
  }, [therapists]);

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? "—";
  const programName = (id: string) => programs.find((p) => p.id === id)?.name ?? "—";
  const therapist = (id: string) => therapists.find((t) => t.id === id);

  // 가시 세션 (날짜 + 상태 + 치료사 필터)
  const visibleSessions = useMemo(() => {
    const startStr = fmt(range.start); const endStr = fmt(range.end);
    return sessions.filter((s) => {
      if (s.session_date < startStr || s.session_date > endStr) return false;
      if (!statusFilter[s.status as StatusCode]) return false;
      const key = s.therapist_id ?? "__none";
      if (therapistFilter[key] === false) return false;
      return true;
    });
  }, [sessions, range, statusFilter, therapistFilter]);

  // 일자 배열
  const dayList = useMemo(() => {
    const days: Date[] = [];
    let d = new Date(range.start);
    while (d <= range.end) { days.push(new Date(d)); d = addDays(d, 1); }
    return days;
  }, [range]);

  function nav(dir: number) {
    const d = new Date(cursor);
    if (view === "day") d.setDate(d.getDate() + dir);
    else if (view === "week") d.setDate(d.getDate() + 7 * dir);
    else if (view === "fourDay") d.setDate(d.getDate() + 4 * dir);
    else if (view === "month") d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + 14 * dir);
    setCursor(d);
  }

  const headerLabel = useMemo(() => {
    if (view === "month") return `${cursor.getFullYear()}년 ${cursor.getMonth() + 1}월`;
    if (view === "day") return `${cursor.getFullYear()}년 ${cursor.getMonth() + 1}월 ${cursor.getDate()}일`;
    return `${range.start.getMonth() + 1}.${range.start.getDate()} – ${range.end.getMonth() + 1}.${range.end.getDate()}`;
  }, [view, cursor, range]);

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">일정</h1>
          <p className="text-sm text-neutral-500 mt-1">일·주·월·4일·목록 + 날짜별/선생님별/시간표 보기. 엑셀 한 파일로 일·주·월 일정을 한 번에 채워보세요.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setImportOpen(true)} className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-full bg-white border border-neutral-200 hover:border-neutral-400 transition">
            <Upload className="w-3.5 h-3.5" /> 엑셀 가져오기
          </button>
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-full px-3 py-1.5">
            <button onClick={() => nav(-1)} className="p-1 hover:bg-neutral-100 rounded-full"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm font-medium px-2 min-w-[140px] text-center">{headerLabel}</span>
            <button onClick={() => nav(1)} className="p-1 hover:bg-neutral-100 rounded-full"><ChevronRight className="w-4 h-4" /></button>
            <button onClick={() => setCursor(new Date())} className="text-xs px-2 py-1 rounded-full bg-neutral-900 text-white ml-1">오늘</button>
          </div>
        </div>
      </div>

      {/* 컨트롤 바 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* View modes */}
        <div className="inline-flex rounded-full border border-neutral-200 bg-white p-0.5">
          {([
            { k: "day", l: "일" }, { k: "week", l: "주" }, { k: "month", l: "월" }, { k: "fourDay", l: "4일" }, { k: "list", l: "목록" },
          ] as Array<{ k: ViewMode; l: string }>).map((v) => (
            <button key={v.k} onClick={() => setView(v.k)}
              className={`px-3 py-1.5 text-xs rounded-full transition ${view === v.k ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-50"}`}>{v.l}</button>
          ))}
        </div>
        {/* Group mode */}
        <div className="inline-flex rounded-full border border-neutral-200 bg-white p-0.5">
          {([
            { k: "date", l: "날짜별", I: CalIcon },
            { k: "therapist", l: "선생님별", I: Users },
            { k: "timetable", l: "시간표", I: Grid3x3 },
          ] as Array<{ k: GroupMode; l: string; I: any }>).map(({ k, l, I }) => (
            <button key={k} onClick={() => setGroup(k)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-full transition ${group === k ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-50"}`}>
              <I className="w-3 h-3" /> {l}
            </button>
          ))}
        </div>
        {/* Therapist filter */}
        <div className="relative ml-auto">
          <button onClick={() => setShowTFilter((v) => !v)} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white border border-neutral-200 hover:border-neutral-400 transition">
            <Filter className="w-3 h-3" />
            선생님 {Object.values(therapistFilter).filter(Boolean).length}/{Object.keys(therapistFilter).length}
          </button>
          {showTFilter && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowTFilter(false)} />
              <div className="absolute right-0 mt-1 z-40 bg-white border border-neutral-200 rounded-xl shadow-lg p-2 min-w-[220px] max-h-[320px] overflow-auto">
                <div className="flex items-center justify-between px-2 py-1 text-[10px] text-neutral-400">
                  <span>선생님 필터</span>
                  <div className="flex gap-2">
                    <button onClick={() => setTherapistFilter((p) => Object.fromEntries(Object.keys(p).map((k) => [k, true])))} className="hover:text-neutral-700">전체</button>
                    <button onClick={() => setTherapistFilter((p) => Object.fromEntries(Object.keys(p).map((k) => [k, false])))} className="hover:text-neutral-700">해제</button>
                  </div>
                </div>
                {therapists.map((t) => {
                  const { Icon, borderStyle } = therapistVisual(t);
                  const on = therapistFilter[t.id] !== false;
                  return (
                    <label key={t.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-neutral-50 cursor-pointer text-xs">
                      <input type="checkbox" checked={on} onChange={(e) => setTherapistFilter((p) => ({ ...p, [t.id]: e.target.checked }))} className="accent-neutral-900" />
                      <span className="w-4 h-4 rounded-sm shrink-0" style={{ background: t.color, border: `2px ${borderStyle} ${t.color}` }} />
                      <Icon className="w-3 h-3 shrink-0" style={{ color: t.color }} />
                      <span className="flex-1 truncate">{t.name}</span>
                    </label>
                  );
                })}
                <label className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-neutral-50 cursor-pointer text-xs border-t border-neutral-100 mt-1 pt-2">
                  <input type="checkbox" checked={therapistFilter.__none !== false} onChange={(e) => setTherapistFilter((p) => ({ ...p, __none: e.target.checked }))} className="accent-neutral-900" />
                  <span className="w-4 h-4 rounded-sm shrink-0 border border-dashed border-neutral-400 bg-neutral-100" />
                  <span className="flex-1 text-neutral-500">미배정</span>
                </label>
              </div>
            </>
          )}
        </div>
        {/* Status filter */}
        <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 rounded-full px-3 py-1.5">
          {(Object.keys(STATUS_META) as StatusCode[]).map((s) => (
            <label key={s} className="inline-flex items-center gap-1 text-xs cursor-pointer">
              <input type="checkbox" checked={statusFilter[s]} onChange={(e) => setStatusFilter((p) => ({ ...p, [s]: e.target.checked }))} className="accent-neutral-900" />
              {STATUS_META[s].label}
            </label>
          ))}
        </div>
      </div>

      {/* 본문 */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-400">불러오는 중…</div>
        ) : view === "month" ? (
          <MonthView cursor={cursor} sessions={visibleSessions} onPick={setSelected} therapist={therapist} clientName={clientName} />
        ) : view === "list" ? (
          visibleSessions.length === 0
            ? <div className="p-12 text-center text-neutral-400">표시할 일정이 없습니다.</div>
            : <ListView dayList={dayList} sessions={visibleSessions} onPick={setSelected} therapist={therapist} clientName={clientName} programName={programName} />
        ) : group === "timetable" ? (
          <TimetableView dayList={dayList} sessions={visibleSessions} onPick={setSelected} therapist={therapist} clientName={clientName}
            onCreate={(date, hour) => setCreateAt({ date, hour })} />
        ) : group === "therapist" ? (
          visibleSessions.length === 0
            ? <div className="p-12 text-center text-neutral-400">표시할 일정이 없습니다.</div>
            : <TherapistGroupView dayList={dayList} sessions={visibleSessions} therapists={therapists} onPick={setSelected} clientName={clientName} programName={programName} />
        ) : (
          visibleSessions.length === 0
            ? <div className="p-12 text-center text-neutral-400">표시할 일정이 없습니다.</div>
            : <DateGroupView dayList={dayList} sessions={visibleSessions} onPick={setSelected} therapist={therapist} clientName={clientName} programName={programName} />
        )}
      </div>

      {/* 치료사 범례 (색상 클릭 → 컬러 피커, 형태/테두리는 색각 보조) */}
      <div className="flex flex-wrap gap-3 mt-4">
        {therapists.map((t) => {
          const { Icon, borderStyle } = therapistVisual(t);
          return (
            <div key={t.id} className="group inline-flex items-center gap-2 text-xs bg-white border border-neutral-200 rounded-full pl-1 pr-3 py-1">
              <label className="relative w-5 h-5 rounded-full cursor-pointer shrink-0 overflow-hidden ring-1 ring-neutral-200 hover:ring-neutral-400 transition" style={{ background: t.color, borderStyle, borderWidth: 2, borderColor: t.color }} title="색상 변경">
                <input
                  type="color"
                  value={t.color}
                  onChange={(e) => handleColorChange(t.id, e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
              <Icon className="w-3 h-3 shrink-0" style={{ color: t.color }} />
              <span className="text-neutral-800 font-medium">{t.name}</span>
              <span className="text-neutral-400">{t.role ?? t.title ?? ""}</span>
            </div>
          );
        })}
        {therapists.length > 0 && (
          <p className="w-full text-[10px] text-neutral-400 mt-1">색상 원을 클릭하면 색이 바뀌고 자동 저장돼요. 도형·테두리(점선/실선/이중선)는 색각이상 보조 표시예요.</p>
        )}
      </div>

      {/* 상세 팝업 */}
      {selected && (
        <SessionDetail s={selected} onClose={() => setSelected(null)} onDelete={() => handleDelete(selected)} therapist={therapist} clientName={clientName} programName={programName} />
      )}

      {/* 일정 등록 다이얼로그 */}
      {createAt && (
        <CreateSessionDialog
          at={createAt}
          clients={clients}
          therapists={therapists}
          programs={programs}
          onClose={() => setCreateAt(null)}
          onSubmit={handleCreate}
        />
      )}


      {/* 가져오기 이력 (실제 기관 모드) */}
      {!demo && <ImportHistoryPanel centerId={centerId} refreshKey={importRefresh} />}

      {/* 엑셀 가져오기 위저드 */}
      {importOpen && (
        <ImportWizard
          demo={!!demo}
          centerId={centerId}
          onClose={() => setImportOpen(false)}
          onImported={() => setImportRefresh((x) => x + 1)}
          onMergeDemo={(extra) => {
            const cMap = new Map(clients.map((c: any) => [c.name, c.id]));
            const tMap = new Map(therapists.map((t: any) => [t.name, t.id]));
            const pMap = new Map(programs.map((p: any) => [p.name, p.id]));
            const newClients = [...clients];
            const newTherapists = [...therapists];
            const newPrograms = [...programs];
            const newSessions = [...sessions];
            let cidx = newClients.length, tidx = newTherapists.length, pidx = newPrograms.length, sidx = newSessions.length;
            for (const row of extra) {
              const cname = row.client_name?.toString().trim();
              const tname = row.therapist_name?.toString().trim();
              const pname = row.program_name?.toString().trim();
              if (!cname || !row.session_date) continue;
              if (!cMap.has(cname)) { const id = `ic${++cidx}`; cMap.set(cname, id); newClients.push({ id, name: cname }); }
              if (tname && !tMap.has(tname)) { const id = `it${++tidx}`; tMap.set(tname, id); newTherapists.push({ id, name: tname, role: row.therapist_title ?? "", color: PALETTE[tidx % PALETTE.length] }); }
              if (pname && !pMap.has(pname)) { const id = `ip${++pidx}`; pMap.set(pname, id); newPrograms.push({ id, name: pname, duration_min: 40, price_krw: row.price_krw ?? 0, is_voucher: !!row.is_voucher }); }
              newSessions.push({
                id: `is${++sidx}`,
                session_date: row.session_date,
                start_time: row.start_time ?? "10:00",
                end_time: row.end_time ?? null,
                client_id: cMap.get(cname),
                therapist_id: tname ? tMap.get(tname) : null,
                program_id: pname ? pMap.get(pname) : null,
                status: row.status ?? "scheduled",
                price_krw: row.price_krw ?? 0,
                is_voucher: !!row.is_voucher,
                note: row.note ?? null,
              });
            }
            setClients(newClients);
            setTherapists(newTherapists);
            setPrograms(newPrograms);
            setSessions(newSessions);
          }}
        />
      )}
    </div>
  );
}

// ===== 시간표(주/일 그리드) =====
function TimetableView({ dayList, sessions, onPick, therapist, clientName, onCreate }: any) {
  const cols = dayList.length;
  return (
    <div className="grid" style={{ gridTemplateColumns: `60px repeat(${cols}, minmax(120px, 1fr))` }}>
      <div className="bg-neutral-50 border-b border-r border-neutral-200" />
      {dayList.map((d: Date) => (
        <div key={fmt(d)} className="bg-neutral-50 border-b border-neutral-200 p-2 text-center">
          <p className="text-xs text-neutral-500">{DAY_LABELS[(d.getDay() + 6) % 7]}</p>
          <p className="text-sm font-medium">{d.getMonth() + 1}.{d.getDate()}</p>
        </div>
      ))}
      {HOURS.map((h) => (
        <div key={`row-${h}`} className="contents">
          <div className="border-b border-r border-neutral-100 text-[10px] text-neutral-400 p-1 text-right">{h}:00</div>
          {dayList.map((d: Date) => {
            const ds = fmt(d);
            const slot = sessions.filter((s: any) => isSameDate(s.session_date, ds) && parseInt(s.start_time?.slice(0, 2) ?? "0", 10) === h);
            return (
              <div
                key={`${h}-${ds}`}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("button")) return;
                  onCreate?.(ds, h);
                }}
                className="group relative border-b border-r border-neutral-100 min-h-[60px] p-1 cursor-pointer hover:bg-[#FAF6E8]/40 transition"
              >
                {slot.length === 0 && (
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none">
                    <Plus className="w-4 h-4 text-[#C8B88A]" />
                  </span>
                )}
                {slot.length > 1 && (
                  <span className="absolute top-0.5 right-0.5 z-10 text-[9px] font-semibold px-1 py-px rounded-full bg-neutral-900 text-white pointer-events-none">
                    {slot.length}
                  </span>
                )}
                <div className={`h-full ${slot.length > 1 ? "flex gap-0.5" : "space-y-1"}`}>
                  {slot.map((s: any) => (
                    <div key={s.id} className={slot.length > 1 ? "flex-1 min-w-0" : ""}>
                      <SessionChip s={s} therapist={therapist} clientName={clientName} onPick={onPick} compact={slot.length > 1} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ===== 일정 등록 다이얼로그 =====
function CreateSessionDialog({ at, clients, therapists, programs, onClose, onSubmit }: any) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [therapistId, setTherapistId] = useState(therapists[0]?.id ?? "");
  const [programId, setProgramId] = useState(programs[0]?.id ?? "");
  const [startTime, setStartTime] = useState(`${String(at.hour).padStart(2, "0")}:00`);
  const [endTime, setEndTime] = useState(`${String(at.hour).padStart(2, "0")}:40`);
  const [note, setNote] = useState("");
  const canSubmit = !!clientId && !!startTime;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-neutral-200 w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs tracking-widest text-[#C8B88A]">NEW SESSION</p>
            <h3 className="text-lg font-semibold mt-1">일정 등록 · {at.date}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-full"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3 text-sm">
          <Field label="이용자">
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400">
              {clients.length === 0 && <option value="">이용자가 없어요. 먼저 등록하세요.</option>}
              {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="선생님">
            <select value={therapistId} onChange={(e) => setTherapistId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400">
              <option value="">— 미배정 —</option>
              {therapists.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
          <Field label="프로그램">
            <select value={programId} onChange={(e) => setProgramId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400">
              <option value="">— 미지정 —</option>
              {programs.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="시작">
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400" />
            </Field>
            <Field label="종료">
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400" />
            </Field>
          </div>
          <Field label="메모">
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="선택" className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400" />
          </Field>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-full border border-neutral-200 text-sm hover:bg-neutral-50">취소</button>
          <button
            onClick={() => canSubmit && onSubmit({ client_id: clientId, therapist_id: therapistId, program_id: programId, start_time: startTime, end_time: endTime, note })}
            disabled={!canSubmit}
            className="flex-1 px-4 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-neutral-500 mb-1">{label}</span>
      {children}
    </label>
  );
}


// ===== 날짜별 그룹 =====
function DateGroupView({ dayList, sessions, onPick, therapist, clientName, programName }: any) {
  return (
    <div className="divide-y divide-neutral-100">
      {dayList.map((d: Date) => {
        const ds = fmt(d);
        const list = sessions.filter((s: any) => s.session_date === ds)
          .sort((a: any, b: any) => (a.start_time ?? "").localeCompare(b.start_time ?? ""));
        if (list.length === 0) return null;
        return (
          <div key={ds} className="px-5 py-4">
            <p className="text-sm font-semibold text-neutral-900 mb-2">
              {d.getMonth() + 1}월 {d.getDate()}일 ({DAY_LABELS[(d.getDay() + 6) % 7]}) <span className="text-neutral-400 text-xs ml-2">{list.length}건</span>
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
              {list.map((s: any) => <SessionRow key={s.id} s={s} therapist={therapist} clientName={clientName} programName={programName} onPick={onPick} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===== 선생님별 그룹 =====
function TherapistGroupView({ dayList, sessions, therapists, onPick, clientName, programName }: any) {
  return (
    <div className="divide-y divide-neutral-100">
      {therapists.map((t: any) => {
        const list = sessions.filter((s: any) => s.therapist_id === t.id)
          .sort((a: any, b: any) => (a.session_date + (a.start_time ?? "")).localeCompare(b.session_date + (b.start_time ?? "")));
        if (list.length === 0) return null;
        return (
          <div key={t.id} className="px-5 py-4">
            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: t.color }} />
              {t.name} <span className="text-xs text-neutral-400">{t.role ?? t.title ?? ""}</span>
              <span className="ml-2 text-xs text-neutral-400">{list.length}건</span>
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
              {list.map((s: any) => (
                <button key={s.id} onClick={() => onPick(s)} className="text-left rounded-lg border border-neutral-200 p-2 hover:border-neutral-400 transition">
                  <div className={`text-xs ${s.status?.startsWith("cancelled") ? "line-through text-neutral-400" : ""}`}>
                    <span className="font-medium">{s.session_date.slice(5)}</span> {s.start_time?.slice(0, 5) ?? ""} · {clientName(s.client_id)}
                  </div>
                  <div className="text-[11px] text-neutral-500 truncate">{programName(s.program_id)}</div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===== 월간 그리드 =====
function MonthView({ cursor, sessions, onPick, therapist, clientName }: any) {
  const first = startOfMonth(cursor);
  const startGrid = startOfWeek(first);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) cells.push(addDays(startGrid, i));
  return (
    <div className="grid grid-cols-7">
      {DAY_LABELS.map((d) => <div key={d} className="bg-neutral-50 border-b border-neutral-200 p-2 text-center text-xs text-neutral-500">{d}</div>)}
      {cells.map((d) => {
        const ds = fmt(d);
        const inMonth = d.getMonth() === cursor.getMonth();
        const list = sessions.filter((s: any) => s.session_date === ds);
        return (
          <div key={ds} className={`border-b border-r border-neutral-100 min-h-[110px] p-1.5 ${inMonth ? "" : "bg-neutral-50/40"}`}>
            <p className={`text-[11px] mb-1 ${inMonth ? "text-neutral-700" : "text-neutral-300"}`}>{d.getDate()}</p>
            <div className="space-y-0.5">
              {list.slice(0, 4).map((s: any) => {
                const th = therapist(s.therapist_id);
                const cancelled = s.status?.startsWith("cancelled");
                return (
                  <button key={s.id} onClick={() => onPick(s)} className={`w-full text-left rounded px-1 py-0.5 text-[10px] truncate ${cancelled ? "line-through opacity-50" : ""}`}
                    style={{ background: (th?.color ?? "#eee") + "55", borderLeft: `2px solid ${th?.color ?? "#999"}` }}>
                    {s.start_time?.slice(0, 5) ?? ""} {clientName(s.client_id)}
                  </button>
                );
              })}
              {list.length > 4 && <p className="text-[10px] text-neutral-400">+{list.length - 4}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===== 목록 뷰 =====
function ListView({ dayList, sessions, onPick, therapist, clientName, programName }: any) {
  return (
    <div className="divide-y divide-neutral-100">
      {dayList.map((d: Date) => {
        const ds = fmt(d);
        const list = sessions.filter((s: any) => s.session_date === ds)
          .sort((a: any, b: any) => (a.start_time ?? "").localeCompare(b.start_time ?? ""));
        if (list.length === 0) return null;
        return (
          <div key={ds}>
            <p className="px-5 py-2 bg-neutral-50 text-xs text-neutral-500">{d.getMonth() + 1}월 {d.getDate()}일 ({DAY_LABELS[(d.getDay() + 6) % 7]})</p>
            {list.map((s: any) => {
              const th = therapist(s.therapist_id);
              const cancelled = s.status?.startsWith("cancelled");
              const meta = STATUS_META[s.status as StatusCode];
              return (
                <button key={s.id} onClick={() => onPick(s)} className="w-full text-left px-5 py-3 hover:bg-neutral-50 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: th?.color ?? "#999" }} />
                  <span className="text-xs text-neutral-600 w-28 tabular-nums">{s.start_time?.slice(0, 5) ?? "--:--"}{s.end_time ? `–${s.end_time.slice(0, 5)}` : ""}</span>
                  <span className={`text-sm flex-1 ${cancelled ? "line-through text-neutral-400" : ""}`}>
                    [{clientName(s.client_id)}] {programName(s.program_id)}
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border ${meta?.tone ?? ""}`}>{meta?.label}</span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ===== 공통 카드 =====
function SessionChip({ s, therapist, clientName, onPick }: any) {
  const th = therapist(s.therapist_id);
  const cancelled = s.status?.startsWith("cancelled");
  return (
    <button onClick={() => onPick(s)} className={`w-full text-left rounded-md px-2 py-1 text-[11px] leading-tight hover:ring-1 hover:ring-neutral-300 ${cancelled ? "opacity-40 line-through" : ""}`}
      style={{ background: (th?.color ?? "#e5e7eb") + "33", borderLeft: `4px solid ${th?.color ?? "#9ca3af"}` }}>
      <p className="font-medium truncate">{clientName(s.client_id)}</p>
      <p className="text-neutral-500 truncate flex items-center gap-1">
        <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: th?.color ?? "#9ca3af" }} />
        <span className="truncate">{th?.name ?? "미배정"} · {s.start_time?.slice(0, 5) ?? ""}{s.end_time ? `–${s.end_time.slice(0, 5)}` : ""}</span>
      </p>
    </button>
  );
}

function SessionRow({ s, therapist, clientName, programName, onPick }: any) {
  const th = therapist(s.therapist_id);
  const cancelled = s.status?.startsWith("cancelled");
  const meta = STATUS_META[s.status as StatusCode];
  return (
    <button onClick={() => onPick(s)} className="text-left rounded-lg border border-neutral-200 p-2 hover:border-neutral-400 transition flex items-start gap-2">
      <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: th?.color ?? "#999" }} />
      <div className="flex-1 min-w-0">
        <div className={`text-xs ${cancelled ? "line-through text-neutral-400" : ""}`}>
          <span className="tabular-nums">{s.start_time?.slice(0, 5) ?? "--:--"}</span> · {clientName(s.client_id)}
        </div>
        <div className="text-[11px] text-neutral-500 truncate">{programName(s.program_id)} · {th?.name ?? "—"}</div>
      </div>
      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${meta?.tone ?? ""}`}>{meta?.label}</span>
    </button>
  );
}

// ===== 상세 팝업 =====
function SessionDetail({ s, onClose, onDelete, therapist, clientName, programName }: any) {
  const th = therapist(s.therapist_id);
  const meta = STATUS_META[s.status as StatusCode];
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-neutral-200 w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs tracking-widest text-neutral-400">SESSION</p>
            <h3 className="text-lg font-semibold mt-1">{clientName(s.client_id)}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-full"><X className="w-4 h-4" /></button>
        </div>
        <dl className="space-y-2 text-sm">
          <Row k="일시" v={`${s.session_date} ${s.start_time?.slice(0, 5) ?? ""}${s.end_time ? `–${s.end_time.slice(0, 5)}` : ""}`} />
          <Row k="프로그램" v={programName(s.program_id)} />
          <Row k="선생님" v={th ? `${th.name} · ${th.role ?? th.title ?? ""}` : "—"} />
          <Row k="상태" v={<span className={`text-xs px-2 py-0.5 rounded-full border ${meta?.tone ?? ""}`}>{meta?.label}</span>} />
          <Row k="단가" v={`₩${(s.price_krw ?? 0).toLocaleString()}`} />
          <Row k="바우처" v={s.is_voucher ? "Y" : "N"} />
          {s.note && <Row k="메모" v={s.note} />}
        </dl>
        {onDelete && (
          <div className="flex gap-2 mt-5">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-full border border-neutral-200 text-sm hover:bg-neutral-50">닫기</button>
            <button onClick={onDelete} className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-rose-600 text-white text-sm font-medium hover:bg-rose-700">
              <Trash2 className="w-3.5 h-3.5" /> 일정 삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


function Row({ k, v }: { k: string; v: any }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-neutral-100 last:border-0">
      <dt className="text-neutral-500 text-xs w-16 shrink-0">{k}</dt>
      <dd className="text-neutral-900 text-sm text-right break-keep">{v}</dd>
    </div>
  );
}

