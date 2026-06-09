import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_SESSIONS, DEMO_THERAPISTS, DEMO_CLIENTS, DEMO_PROGRAMS } from "@/lib/b2bCenter/demoData";
import { ChevronLeft, ChevronRight, X, Calendar as CalIcon, Grid3x3, Users, Upload, Plus, Trash2, Filter, Check, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import ImportWizard from "@/components/b2b-center/ImportWizard";
import ImportHistoryPanel from "@/components/b2b-center/ImportHistoryPanel";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const SIDEBAR_OPEN_KEY = "b2b_schedule_sidebar_open_v1";

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
// 채도/명도 차이를 둔 팔레트 (색각이상에도 구분 가능)
const PALETTE = ["#E63946", "#1D7874", "#F4A261", "#264653", "#9D4EDD", "#0077B6", "#FB8500", "#2A9D8F", "#7209B7", "#BC4749", "#3A86FF", "#8AB17D", "#D62828", "#06A77D", "#F77F00", "#52B788", "#B5179E", "#3F88C5", "#E76F51", "#118AB2"];
const DEFAULT_GRAY = "#94a3b8";
function isDefaultOrEmpty(c?: string | null) {
  if (!c) return true;
  const v = c.trim().toLowerCase();
  return v === "" || v === DEFAULT_GRAY.toLowerCase();
}
function hashIdx(s: string): number {
  let h = 0; for (let i = 0; i < (s ?? "").length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function therapistVisual(t: any, fallbackKey?: string) {
  if (!t) {
    const fk = fallbackKey ?? "";
    const i = hashIdx(fk);
    return { color: fk ? PALETTE[i % PALETTE.length] : "#9ca3af" };
  }
  const i = t._idx ?? hashIdx(t.id ?? t.name ?? "");
  const raw = t.calendar_color || t.color;
  const color = isDefaultOrEmpty(raw) ? PALETTE[i % PALETTE.length] : raw;
  return { color };
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [statusFilter, setStatusFilter] = useState<Record<StatusCode, boolean>>({
    scheduled: true, completed: true, cancelled: true, cancelled_makeup: true, cancelled_carry: true,
  });
  const [selected, setSelected] = useState<any | null>(null);
  const [createAt, setCreateAt] = useState<{ date: string; hour: number } | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importRefresh, setImportRefresh] = useState(0);
  const [therapistFilter, setTherapistFilter] = useState<Record<string, boolean>>({});
  const [showTFilter, setShowTFilter] = useState(false);
  const soloSnapshotRef = useRef<Record<string, boolean> | null>(null);
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const v = window.localStorage.getItem(SIDEBAR_OPEN_KEY);
    return v === null ? true : v === "1";
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SIDEBAR_OPEN_KEY, sidebarOpen ? "1" : "0");
    }
  }, [sidebarOpen]);

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

  async function handleUpdate(form: { client_id: string; therapist_id: string; program_id: string; start_time: string; end_time: string; note: string }) {
    if (!editing) return;
    const patch = {
      start_time: form.start_time,
      end_time: form.end_time || null,
      client_id: form.client_id,
      therapist_id: form.therapist_id || null,
      program_id: form.program_id || null,
      price_krw: programs.find((p) => p.id === form.program_id)?.price_krw ?? editing.price_krw ?? 0,
      is_voucher: programs.find((p) => p.id === form.program_id)?.is_voucher ?? editing.is_voucher ?? false,
      note: form.note || null,
    };
    if (demo) {
      setSessions((prev) => prev.map((x) => (x.id === editing.id ? { ...x, ...patch } : x)));
    } else {
      const { data, error } = await supabase.from("center_sessions").update(patch).eq("id", editing.id).select().single();
      if (error) { toast({ title: "수정 실패", description: error.message, variant: "destructive" }); return; }
      setSessions((prev) => prev.map((x) => (x.id === editing.id ? data : x)));
    }
    toast({ title: "일정이 수정됐어요" });
    setEditing(null);
    setSelected(null);
  }

  async function handleDelete(s: any) {
    const hasRecur = !!s.recurrence_key;
    const msg = hasRecur
      ? "이 일정과 이후의 모든 반복 일정을 함께 삭제할까요?"
      : "이 일정을 삭제할까요?";
    if (!window.confirm(msg)) return;
    if (demo) {
      setSessions((prev) => prev.filter((x) =>
        hasRecur
          ? !(x.recurrence_key === s.recurrence_key && x.session_date >= s.session_date)
          : x.id !== s.id
      ));
    } else {
      let q = supabase.from("center_sessions").delete().eq("center_id", centerId);
      if (hasRecur) {
        q = q.eq("recurrence_key", s.recurrence_key).gte("session_date", s.session_date);
      } else {
        q = q.eq("id", s.id);
      }
      const { error } = await q;
      if (error) { toast({ title: "삭제 실패", description: error.message, variant: "destructive" }); return; }
      setSessions((prev) => prev.filter((x) =>
        hasRecur
          ? !(x.recurrence_key === s.recurrence_key && x.session_date >= s.session_date)
          : x.id !== s.id
      ));
    }
    toast({ title: hasRecur ? "반복 일정이 삭제됐어요" : "일정이 삭제됐어요" });
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
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      if (demo) {
        setSessions(DEMO_SESSIONS);
        setTherapists(DEMO_THERAPISTS.map((x: any, i: number) => ({ ...x, _idx: i, color: isDefaultOrEmpty(x.color) ? PALETTE[i % PALETTE.length] : x.color })));
        setClients(DEMO_CLIENTS.map((c) => ({ id: c.id, name: c.display_name })));
        setPrograms(DEMO_PROGRAMS);
        setLoading(false); return;
      }
      try {
        const [s, t, c, p] = await Promise.all([
          supabase.from("center_sessions").select("*").eq("center_id", centerId)
            .gte("session_date", fmt(range.start)).lte("session_date", fmt(range.end)),
          supabase.from("center_therapists").select("*").eq("center_id", centerId),
          supabase.from("center_clients").select("id, name").eq("center_id", centerId),
          supabase.from("center_programs").select("*").eq("center_id", centerId),
        ]);
        if (cancelled) return;
        const firstErr = s.error ?? t.error ?? c.error ?? p.error;
        if (firstErr) {
          setLoadError(firstErr.message ?? "일정을 불러오지 못했어요.");
          setLoading(false);
          return;
        }
        setSessions(s.data ?? []);
        setTherapists((t.data ?? []).map((x: any, i: number) => {
          const raw = x.calendar_color ?? x.color;
          return { ...x, _idx: i, color: isDefaultOrEmpty(raw) ? PALETTE[i % PALETTE.length] : raw };
        }));
        setClients(c.data ?? []);
        setPrograms(p.data ?? []);
      } catch (err: any) {
        if (!cancelled) setLoadError(err?.message ?? "네트워크 오류로 일정을 불러오지 못했어요.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [centerId, demo, range.start.getTime(), range.end.getTime(), reloadKey]);

  // 치료사 목록/세션 바뀌면 필터 키 동기화 — 등록된 치료사 + 세션에만 있는 orphan id 모두 포함.
  // 더 이상 존재하지 않는 키는 제거해 사이드바 상태와 표시 데이터 불일치를 방지한다.
  useEffect(() => {
    setTherapistFilter((prev) => {
      const next: Record<string, boolean> = { __none: prev.__none ?? true };
      const validIds = new Set<string>();
      for (const t of therapists) validIds.add(t.id);
      for (const s of sessions) if (s.therapist_id) validIds.add(s.therapist_id);
      for (const id of validIds) next[id] = prev[id] ?? true;
      // 솔로 스냅샷 키도 정리
      if (soloSnapshotRef.current) {
        const snap: Record<string, boolean> = { __none: soloSnapshotRef.current.__none ?? true };
        for (const id of validIds) snap[id] = soloSnapshotRef.current[id] ?? true;
        soloSnapshotRef.current = snap;
      }
      return next;
    });
  }, [therapists, sessions]);

  // 솔로 토글: 한 명만 보이게 / 다시 누르면 직전 상태 복원
  const soloTherapist = useCallback((id: string) => {
    setTherapistFilter((p) => {
      const onlyThis = p[id] === true
        && Object.entries(p).every(([k, v]) => (k === id ? v === true : v === false));
      if (onlyThis) {
        // 직전 스냅샷이 있고, 그 안에 의미있는 true가 1개 이상 있으면 복원, 아니면 전부 true
        const snap = soloSnapshotRef.current;
        soloSnapshotRef.current = null;
        if (snap && Object.values(snap).some(Boolean)) {
          // 현재 키와 일치시킨다 (새 키는 true 기본)
          const restored: Record<string, boolean> = {};
          for (const k of Object.keys(p)) restored[k] = snap[k] ?? true;
          return restored;
        }
        return Object.fromEntries(Object.keys(p).map((k) => [k, true]));
      }
      // 솔로 진입: 첫 진입이면 현재 상태 스냅샷
      if (!soloSnapshotRef.current) soloSnapshotRef.current = { ...p };
      return Object.fromEntries(Object.keys(p).map((k) => [k, k === id]));
    });
  }, []);

  // 사용자 직접 체크박스 토글 → 스냅샷 무효화 (의도가 바뀐 것으로 간주)
  const toggleTherapist = useCallback((id: string, value: boolean) => {
    soloSnapshotRef.current = null;
    setTherapistFilter((p) => ({ ...p, [id]: value }));
  }, []);

  const setAllTherapists = useCallback((value: boolean) => {
    soloSnapshotRef.current = null;
    setTherapistFilter((p) => Object.fromEntries(Object.keys(p).map((k) => [k, value])));
  }, []);

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

  // 선생님별 가시 세션 카운트 (필터 토글과 관계없이 "현재 보이는 합" 기준 — 필터 OFF 행은 0)
  const countByT = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of visibleSessions) {
      const k = s.therapist_id ?? "__none";
      m[k] = (m[k] ?? 0) + 1;
    }
    return m;
  }, [visibleSessions]);

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
    <div className="p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-4 items-start">
      {/* 좌측 사이드바: 접고/펴기 가능 (케어플 스타일) */}
      {sidebarOpen ? (
        <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white rounded-2xl border border-neutral-200 p-3 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-neutral-700">선생님별 일정</p>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md hover:bg-neutral-100 text-neutral-500"
              title="사이드바 접기"
              aria-label="사이드바 접기"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setImportOpen(true)}
            className="w-full inline-flex items-center justify-center gap-1.5 text-sm px-3 py-2.5 rounded-xl bg-[#FAF6E8] border border-[#C8B88A]/40 text-neutral-900 hover:bg-[#F3EBD0] transition mb-3"
          >
            <Upload className="w-4 h-4" /> 일정 엑셀 등록
          </button>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] text-neutral-400">표시 중 {visibleSessions.length}건</p>
            <div className="flex gap-1 text-[10px]">
              <button onClick={() => setAllTherapists(true)} className="text-neutral-500 hover:text-neutral-900">전체</button>
              <span className="text-neutral-200">|</span>
              <button onClick={() => setAllTherapists(false)} className="text-neutral-500 hover:text-neutral-900">해제</button>
            </div>
          </div>
          <div className="space-y-0.5 mt-1">
            {therapists.map((t) => {
              const on = therapistFilter[t.id] !== false;
              const isSolo = therapistFilter[t.id] === true
                && Object.entries(therapistFilter).every(([k, v]) => k === t.id ? v === true : v === false);
              const count = on ? (countByT[t.id] ?? 0) : 0;
              return (
                <div
                  key={t.id}
                  className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition ${isSolo ? "bg-neutral-900/5 ring-1 ring-neutral-200" : "hover:bg-neutral-50"}`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={(e) => toggleTherapist(t.id, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    className="accent-neutral-900 cursor-pointer"
                    aria-label={`${t.name} 표시 토글`}
                  />
                  <button
                    type="button"
                    onClick={() => soloTherapist(t.id)}
                    className="flex-1 min-w-0 flex items-center gap-2 text-left cursor-pointer"
                    title="이 선생님만 보기 (다시 누르면 직전 상태로 복원)"
                  >
                    <span className="w-3.5 h-3.5 rounded shrink-0 border" style={{ background: t.color, borderColor: t.color }} />
                    <span className={`flex-1 min-w-0 truncate ${isSolo ? "font-semibold text-neutral-900" : on ? "text-neutral-800" : "text-neutral-400 line-through"}`}>{t.name}</span>
                    <span className={`text-[10px] tabular-nums shrink-0 ${on ? "text-neutral-500" : "text-neutral-300"}`}>{count}</span>
                  </button>
                </div>
              );
            })}
            <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-50 cursor-pointer text-xs border-t border-neutral-100 mt-1.5 pt-2">
              <input
                type="checkbox"
                checked={therapistFilter.__none !== false}
                onChange={(e) => toggleTherapist("__none", e.target.checked)}
                className="accent-neutral-900"
              />
              <span className="w-3.5 h-3.5 rounded shrink-0 border border-dashed border-neutral-400 bg-neutral-100" />
              <span className="flex-1 text-neutral-500">미배정</span>
              <span className="text-[10px] tabular-nums text-neutral-400">{therapistFilter.__none !== false ? (countByT["__none"] ?? 0) : 0}</span>
            </label>
          </div>
          {loading && (
            <p className="text-[10px] text-neutral-400 text-center py-3">불러오는 중…</p>
          )}
          {loadError && !loading && (
            <div className="mt-2 text-[10px] text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-2">
              {loadError}
              <button onClick={() => setReloadKey((k) => k + 1)} className="ml-1 underline hover:text-rose-800">다시 시도</button>
            </div>
          )}
          {!loading && !loadError && therapists.length === 0 && (
            <p className="text-xs text-neutral-400 text-center py-6">선생님 등록 후 일정이 색상으로 분류돼요.</p>
          )}
        </aside>
      ) : (
        <aside className="hidden lg:flex flex-col items-center w-10 shrink-0 bg-white rounded-2xl border border-neutral-200 p-2 sticky top-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-600"
            title="선생님 사이드바 펼치기"
            aria-label="선생님 사이드바 펼치기"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* 본문 */}
      <div className="flex-1 min-w-0 w-full">

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
                  <span>선생님 필터 · 표시 {visibleSessions.length}건</span>
                  <div className="flex gap-2">
                    <button onClick={() => setAllTherapists(true)} className="hover:text-neutral-700">전체</button>
                    <button onClick={() => setAllTherapists(false)} className="hover:text-neutral-700">해제</button>
                  </div>
                </div>
                {therapists.map((t) => {
                  const on = therapistFilter[t.id] !== false;
                  const isSolo = therapistFilter[t.id] === true
                    && Object.entries(therapistFilter).every(([k, v]) => k === t.id ? v === true : v === false);
                  const count = on ? (countByT[t.id] ?? 0) : 0;
                  return (
                    <div key={t.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs ${isSolo ? "bg-neutral-900/5" : "hover:bg-neutral-50"}`}>
                      <input type="checkbox" checked={on} onChange={(e) => toggleTherapist(t.id, e.target.checked)} onClick={(e) => e.stopPropagation()} className="accent-neutral-900 cursor-pointer" />
                      <button
                        type="button"
                        onClick={() => soloTherapist(t.id)}
                        className="flex-1 min-w-0 flex items-center gap-2 text-left cursor-pointer"
                        title="이 선생님만 보기 (다시 누르면 직전 상태로 복원)"
                      >
                        <span className="w-4 h-4 rounded-sm shrink-0" style={{ background: t.color }} />
                        <span className={`flex-1 truncate ${isSolo ? "font-semibold" : on ? "" : "text-neutral-400 line-through"}`}>{t.name}</span>
                        <span className={`text-[10px] tabular-nums shrink-0 ${on ? "text-neutral-500" : "text-neutral-300"}`}>{count}</span>
                      </button>
                    </div>
                  );
                })}
                <label className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-neutral-50 cursor-pointer text-xs border-t border-neutral-100 mt-1 pt-2">
                  <input type="checkbox" checked={therapistFilter.__none !== false} onChange={(e) => toggleTherapist("__none", e.target.checked)} className="accent-neutral-900" />
                  <span className="w-4 h-4 rounded-sm shrink-0 border border-dashed border-neutral-400 bg-neutral-100" />
                  <span className="flex-1 text-neutral-500">미배정</span>
                  <span className="text-[10px] tabular-nums text-neutral-400">{therapistFilter.__none !== false ? (countByT["__none"] ?? 0) : 0}</span>
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
          <div className="p-12 text-center text-neutral-400 inline-flex items-center justify-center gap-2 w-full">
            <span className="inline-block w-3 h-3 rounded-full border-2 border-neutral-300 border-t-neutral-700 animate-spin" />
            일정을 불러오는 중…
          </div>
        ) : loadError ? (
          <div className="p-12 text-center">
            <p className="text-sm text-rose-600 mb-3">⚠ {loadError}</p>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="text-xs px-4 py-2 rounded-full bg-neutral-900 text-white hover:bg-neutral-700"
            >다시 시도</button>
          </div>
        ) : view === "month" ? (
          <MonthView cursor={cursor} sessions={visibleSessions} onPick={setSelected} therapist={therapist} clientName={clientName} programName={programName} />
        ) : view === "list" ? (
          visibleSessions.length === 0
            ? <div className="p-12 text-center text-neutral-400">표시할 일정이 없습니다.</div>
            : <ListView dayList={dayList} sessions={visibleSessions} onPick={setSelected} therapist={therapist} clientName={clientName} programName={programName} />
        ) : group === "timetable" ? (
          <TimetableView dayList={dayList} sessions={visibleSessions} onPick={setSelected} therapist={therapist} clientName={clientName} programName={programName}
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

      {/* 치료사 범례 (색상 클릭 → 컬러 피커) */}
      <div className="flex flex-wrap gap-2 mt-4">
        {therapists.map((t) => (
          <div key={t.id} className="group inline-flex items-center gap-2 text-xs bg-white border border-neutral-200 rounded-full pl-1 pr-3 py-1">
            <label className="relative w-5 h-5 rounded-full cursor-pointer shrink-0 overflow-hidden ring-1 ring-neutral-200 hover:ring-neutral-400 transition" style={{ background: t.color }} title="색상 변경">
              <input
                type="color"
                value={t.color}
                onChange={(e) => handleColorChange(t.id, e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
            <span className="text-neutral-800 font-medium">{t.name}</span>
            <span className="text-neutral-400">{t.role ?? t.title ?? ""}</span>
          </div>
        ))}
        {therapists.length > 0 && (
          <p className="w-full text-[10px] text-neutral-400 mt-1">색상 원을 클릭하면 색이 바뀌고 자동 저장돼요.</p>
        )}
      </div>


      {/* 상세 팝업 */}
      {selected && (
        <SessionDetail s={selected} onClose={() => setSelected(null)} onDelete={() => handleDelete(selected)} onEdit={() => { setEditing(selected); setSelected(null); }} therapist={therapist} clientName={clientName} programName={programName} />
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

      {/* 일정 수정 다이얼로그 */}
      {editing && (
        <CreateSessionDialog
          at={{ date: editing.session_date, hour: parseInt(editing.start_time?.slice(0, 2) ?? "10", 10) }}
          clients={clients}
          therapists={therapists}
          programs={programs}
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={handleUpdate}
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
    </div>
  );
}

// ===== 시간표(주/일 그리드) =====
function TimetableView({ dayList, sessions, onPick, therapist, clientName, programName, onCreate }: any) {
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
                      <SessionChip s={s} therapist={therapist} clientName={clientName} programName={programName} onPick={onPick} compact={slot.length > 1} />
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

// ===== 세션 호버 카드 내용 =====
function SessionHoverDetail({ s, therapist, clientName, programName }: any) {
  const th = therapist(s.therapist_id);
  const meta = STATUS_META[s.status as StatusCode];
  const { color } = therapistVisual(th, s.therapist_id ?? s.therapist_name ?? s.id);
  return (
    <div className="text-xs space-y-1.5">
      <div className="flex items-center gap-2 pb-1.5 border-b border-neutral-100">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
        <p className="font-semibold text-sm text-neutral-900 truncate">{clientName(s.client_id)}</p>
        {meta && (
          <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full border ${meta.tone}`}>{meta.label}</span>
        )}
      </div>
      <p className="text-neutral-600">
        <span className="text-neutral-400 mr-1">선생님</span>
        {th?.name ?? "미배정"}{th?.role || th?.title ? ` · ${th.role ?? th.title}` : ""}
      </p>
      <p className="text-neutral-600">
        <span className="text-neutral-400 mr-1">프로그램</span>
        {programName ? programName(s.program_id) : "—"}
      </p>
      <p className="text-neutral-600 tabular-nums">
        <span className="text-neutral-400 mr-1">일시</span>
        {s.session_date} {s.start_time?.slice(0, 5) ?? ""}{s.end_time ? `–${s.end_time.slice(0, 5)}` : ""}
      </p>
      {s.note && (
        <p className="text-neutral-500 pt-1 border-t border-neutral-100">
          <span className="text-neutral-400 mr-1">메모</span>{s.note}
        </p>
      )}
      <p className="text-[10px] text-neutral-400 pt-1">클릭하면 상세보기 / 삭제</p>
    </div>
  );
}



// ===== 일정 등록 다이얼로그 =====
function CreateSessionDialog({ at, clients, therapists, programs, initial, onClose, onSubmit }: any) {
  const isEdit = !!initial;
  const [therapistId, setTherapistId] = useState(initial?.therapist_id ?? therapists[0]?.id ?? "");
  const [clientId, setClientId] = useState(initial?.client_id ?? clients[0]?.id ?? "");
  const [programId, setProgramId] = useState(initial?.program_id ?? programs[0]?.id ?? "");
  const [startTime, setStartTime] = useState(initial?.start_time?.slice(0, 5) ?? `${String(at.hour).padStart(2, "0")}:00`);
  const [endTime, setEndTime] = useState(initial?.end_time?.slice(0, 5) ?? `${String(at.hour).padStart(2, "0")}:40`);
  const [note, setNote] = useState(initial?.note ?? "");
  const canSubmit = !!clientId && !!startTime;
  const selectedTh = therapists.find((t: any) => t.id === therapistId);
  const visual = therapistVisual(selectedTh);

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-neutral-200 w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs tracking-widest text-[#C8B88A]">{isEdit ? "EDIT SESSION" : "NEW SESSION"}</p>
            <h3 className="text-lg font-semibold mt-1">{isEdit ? "일정 수정" : "일정 등록"} · {at.date}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-full"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3 text-sm">
          {/* 1. 선생님(색상 자동 적용) — 카드 그리드로 시각적 선택 */}
          <Field label="선생님 (먼저 선택하면 색상이 자동 적용돼요)">
            <div className="grid grid-cols-3 gap-1.5 mb-1.5">
              {therapists.map((t: any) => {
                const v = therapistVisual(t);
                const on = therapistId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTherapistId(t.id)}
                    className={`relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition ${on ? "ring-2 ring-neutral-900" : "hover:ring-1 hover:ring-neutral-300"}`}
                    style={{
                      background: `${v.color}1f`,
                      borderLeft: `4px solid ${v.color}`,
                    }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: v.color }} />
                    <span className="truncate text-neutral-800">{t.name}</span>
                    {on && <Check className="w-3 h-3 ml-auto text-neutral-900" />}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setTherapistId("")}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs border border-dashed border-neutral-300 transition ${therapistId === "" ? "ring-2 ring-neutral-900 bg-neutral-50" : "hover:bg-neutral-50"}`}
              >
                <span className="text-neutral-500">미배정</span>
                {therapistId === "" && <Check className="w-3 h-3 ml-auto text-neutral-900" />}
              </button>
            </div>
            {selectedTh && (
              <div className="text-[10px] text-neutral-500 inline-flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: `${visual.color}1f` }}>
                <span className="w-2 h-2 rounded-full" style={{ background: visual.color }} />
                <span>{selectedTh.name} 색상으로 표시돼요</span>
              </div>
            )}
          </Field>
          <Field label="이용자">
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400">
              {clients.length === 0 && <option value="">이용자가 없어요. 먼저 등록하세요.</option>}
              {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
            {isEdit ? "수정 저장" : "등록"}
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
  // 등록된 치료사 + orphan(세션에만 존재하는 id) + 미배정 모두 그룹으로 표시
  const knownIds = new Set<string>(therapists.map((t: any) => t.id));
  const orphanIds: string[] = Array.from(
    new Set<string>(
      sessions
        .filter((s: any) => s.therapist_id && !knownIds.has(s.therapist_id))
        .map((s: any) => String(s.therapist_id))
    )
  );
  const groups: Array<{ id: string; name: string; color: string; role: string; list: any[] }> = [];
  for (const t of therapists) {
    const list = sessions.filter((s: any) => s.therapist_id === t.id)
      .sort((a: any, b: any) => (a.session_date + (a.start_time ?? "")).localeCompare(b.session_date + (b.start_time ?? "")));
    groups.push({ id: t.id, name: t.name, color: t.color, role: t.role ?? t.title ?? "", list });
  }
  for (const oid of orphanIds) {
    const sample = sessions.find((s: any) => s.therapist_id === oid);
    const list = sessions.filter((s: any) => s.therapist_id === oid)
      .sort((a: any, b: any) => (a.session_date + (a.start_time ?? "")).localeCompare(b.session_date + (b.start_time ?? "")));
    const i = hashIdx(oid);
    groups.push({
      id: oid,
      name: sample?.therapist_name ?? `미연결 (${String(oid).slice(0, 6)})`,
      color: PALETTE[i % PALETTE.length],
      role: "엑셀에서만 발견",
      list,
    });
  }
  const unassigned = sessions.filter((s: any) => !s.therapist_id)
    .sort((a: any, b: any) => (a.session_date + (a.start_time ?? "")).localeCompare(b.session_date + (b.start_time ?? "")));
  if (unassigned.length > 0) {
    groups.push({ id: "__none", name: "미배정", color: "#9ca3af", role: "", list: unassigned });
  }
  return (
    <div className="divide-y divide-neutral-100">
      {groups.map((g) => {
        if (g.list.length === 0) return null;
        return (
          <div key={g.id} className="px-5 py-4">
            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: g.color }} />
              {g.name} <span className="text-xs text-neutral-400">{g.role}</span>
              <span className="ml-2 text-xs text-neutral-400">{g.list.length}건</span>
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
              {g.list.map((s: any) => (
                <button key={s.id} onClick={() => onPick(s)} className="text-left rounded-lg border border-neutral-200 p-2 hover:border-neutral-400 transition">
                  <div className={`text-xs ${s.status?.startsWith("cancelled") ? "line-through text-neutral-400" : ""}`}>
                    <span className="font-medium">{s.session_date.slice(5)}</span> {s.start_time?.slice(0, 5) ?? ""} · <span className="font-semibold text-neutral-900">{clientName(s.client_id)}</span>
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
function MonthView({ cursor, sessions, onPick, therapist, clientName, programName }: any) {
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
        const list = sessions
          .filter((s: any) => s.session_date === ds)
          .sort((a: any, b: any) => (a.start_time ?? "").localeCompare(b.start_time ?? ""));
        return (
          <div key={ds} className={`border-b border-r border-neutral-100 min-h-[110px] p-1.5 ${inMonth ? "" : "bg-neutral-50/40"}`}>
            <p className={`text-[11px] mb-1 ${inMonth ? "text-neutral-700" : "text-neutral-300"}`}>{d.getDate()}</p>
            <div className="space-y-0.5">
              {list.slice(0, 4).map((s: any) => {
                const th = therapist(s.therapist_id);
                const cancelled = s.status?.startsWith("cancelled");
                return (
                  <HoverCard key={s.id} openDelay={120} closeDelay={60}>
                    <HoverCardTrigger asChild>
                      <button
                        onClick={() => onPick(s)}
                        className={`w-full text-left rounded px-1 py-0.5 text-[10px] truncate ${cancelled ? "line-through opacity-50" : ""}`}
                        style={{ background: (th?.color ?? "#eee") + "55", borderLeft: `2px solid ${th?.color ?? "#999"}` }}
                      >
                        {s.start_time?.slice(0, 5) ?? ""} {clientName(s.client_id)}
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent side="top" align="start" className="w-72 p-3">
                      <SessionHoverDetail s={s} therapist={therapist} clientName={clientName} programName={programName} />
                    </HoverCardContent>
                  </HoverCard>
                );
              })}
              {list.length > 4 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="w-full text-left text-[10px] text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 rounded px-1 py-0.5 font-medium"
                      title={`이 날 일정 ${list.length}건 모두 보기`}
                    >
                      + {list.length - 4}건 더보기
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="right" align="start" className="w-80 p-0 max-h-[400px] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-neutral-100 px-3 py-2">
                      <p className="text-sm font-semibold">
                        {d.getMonth() + 1}월 {d.getDate()}일 ({DAY_LABELS[(d.getDay() + 6) % 7]})
                        <span className="ml-2 text-xs text-neutral-400">{list.length}건</span>
                      </p>
                    </div>
                    <div className="divide-y divide-neutral-100">
                      {list.map((s: any) => {
                        const th = therapist(s.therapist_id);
                        const cancelled = s.status?.startsWith("cancelled");
                        const meta = STATUS_META[s.status as StatusCode];
                        return (
                          <button
                            key={s.id}
                            onClick={() => onPick(s)}
                            className="w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-center gap-2"
                          >
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: th?.color ?? "#999" }} />
                            <span className="text-[11px] text-neutral-500 tabular-nums w-20 shrink-0">
                              {s.start_time?.slice(0, 5) ?? "--:--"}{s.end_time ? `–${s.end_time.slice(0, 5)}` : ""}
                            </span>
                            <span className={`text-xs flex-1 min-w-0 truncate ${cancelled ? "line-through text-neutral-400" : "text-neutral-800"}`}>
                              <span className="font-medium">{clientName(s.client_id)}</span>
                              <span className="text-neutral-400"> · {th?.name ?? "미배정"}</span>
                              {programName && (
                                <span className="text-neutral-400"> · {programName(s.program_id)}</span>
                              )}
                            </span>
                            {meta && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border shrink-0 ${meta.tone}`}>{meta.label}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
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
function SessionChip({ s, therapist, clientName, programName, onPick, compact }: any) {
  const th = therapist(s.therapist_id);
  const cancelled = s.status?.startsWith("cancelled");
  const { color } = therapistVisual(th, s.therapist_id ?? s.therapist_name ?? s.id);
  // 치료사 색을 강하게 노출 — 배경을 치료사 색으로 채우고 텍스트는 명도에 맞춰 자동 조정
  const safeColor = color || "#9ca3af";
  const textColor = readableTextColor(safeColor);
  const subTextColor = textColor === "#ffffff" ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.6)";
  return (
    <HoverCard openDelay={120} closeDelay={60}>
      <HoverCardTrigger asChild>
        <button
          onClick={() => onPick(s)}
          className={`w-full h-full text-left rounded-md px-1.5 py-1 leading-tight hover:ring-2 hover:ring-neutral-900 transition shadow-sm ${cancelled ? "opacity-40 line-through" : ""}`}
          style={{
            background: safeColor,
            borderLeft: `3px solid ${shadeColor(safeColor, -25)}`,
            color: textColor,
          }}
        >
          <p className={`font-bold truncate ${compact ? "text-[11px]" : "text-[13px]"}`}>
            {clientName(s.client_id)}
          </p>
          {!compact && (
            <p className="truncate" style={{ color: subTextColor }}>
              {th?.name ?? "미배정"} · {s.start_time?.slice(0, 5) ?? ""}{s.end_time ? `–${s.end_time.slice(0, 5)}` : ""}
            </p>
          )}
          {compact && (
            <p className="truncate text-[10px]" style={{ color: subTextColor }}>{s.start_time?.slice(0, 5) ?? ""}</p>
          )}
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="top" align="start" className="w-72 p-3">
        <SessionHoverDetail s={s} therapist={therapist} clientName={clientName} programName={programName} />
      </HoverCardContent>
    </HoverCard>
  );
}

function readableTextColor(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length < 6) return "#000000";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? "#111111" : "#ffffff";
}

function shadeColor(hex: string, percent: number): string {
  const h = hex.replace("#", "");
  if (h.length < 6) return hex;
  const num = parseInt(h, 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0xff) + amt));
  return `#${((R << 16) | (G << 8) | B).toString(16).padStart(6, "0")}`;
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

