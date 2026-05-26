import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_SESSIONS, DEMO_THERAPISTS, DEMO_CLIENTS } from "@/lib/b2bCenter/demoData";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Ctx = { centerId: string; demo?: boolean };

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
const HOURS = Array.from({ length: 11 }, (_, i) => 9 + i); // 9시~19시

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function fmt(d: Date): string { return d.toISOString().slice(0, 10); }

export default function SchedulePage() {
  const { centerId, demo } = useOutletContext<Ctx>();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [sessions, setSessions] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (demo) {
        setSessions(DEMO_SESSIONS);
        setTherapists(DEMO_THERAPISTS);
        setClients(DEMO_CLIENTS.map((c) => ({ id: c.id, name: c.display_name })));
        setLoading(false);
        return;
      }
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const [s, t, c] = await Promise.all([
        supabase.from("center_sessions").select("*").eq("center_id", centerId).gte("session_date", fmt(weekStart)).lte("session_date", fmt(weekEnd)),
        supabase.from("center_therapists").select("*").eq("center_id", centerId),
        supabase.from("center_clients").select("id, name").eq("center_id", centerId),
      ]);
      const palette = ["#FFB4A2", "#B8E0D2", "#FFD6A5", "#CAFFBF", "#A0C4FF", "#FFC8DD", "#BDB2FF"];
      setSessions(s.data ?? []);
      setTherapists((t.data ?? []).map((x: any, i: number) => ({ ...x, color: x.color ?? palette[i % palette.length] })));
      setClients(c.data ?? []);
      setLoading(false);
    })();
  }, [centerId, demo, weekStart]);

  const days = useMemo(() => DAYS.map((label, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return { label, date: fmt(d), display: `${d.getMonth() + 1}.${d.getDate()}` };
  }), [weekStart]);

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? "—";
  const therapist = (id: string) => therapists.find((t) => t.id === id);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">주간 일정</h1>
          <p className="text-sm text-neutral-500 mt-1">치료사별 회기를 색상으로 구분해서 한눈에 확인하세요.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-full px-3 py-1.5">
          <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }} className="p-1 hover:bg-neutral-100 rounded-full"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm font-medium px-2">{days[0].display} – {days[6].display}</span>
          <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }} className="p-1 hover:bg-neutral-100 rounded-full"><ChevronRight className="w-4 h-4" /></button>
          <button onClick={() => setWeekStart(startOfWeek(new Date()))} className="text-xs px-2 py-1 rounded-full bg-neutral-900 text-white ml-1">오늘</button>
        </div>
      </div>

      {/* 치료사 범례 */}
      <div className="flex flex-wrap gap-3 mb-4">
        {therapists.map((t) => (
          <div key={t.id} className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full" style={{ background: t.color }} />
            <span className="text-neutral-700">{t.name}</span>
            <span className="text-neutral-400">{t.role}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-400">불러오는 중…</div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
            <div className="bg-neutral-50 border-b border-r border-neutral-200" />
            {days.map((d) => (
              <div key={d.date} className="bg-neutral-50 border-b border-neutral-200 p-2 text-center">
                <p className="text-xs text-neutral-500">{d.label}</p>
                <p className="text-sm font-medium">{d.display}</p>
              </div>
            ))}
            {HOURS.map((h) => (
              <div key={`row-${h}`} className="contents">
                <div className="border-b border-r border-neutral-100 text-[10px] text-neutral-400 p-1 text-right">{h}:00</div>
                {days.map((d) => {
                  const slot = sessions.filter((s) => s.session_date === d.date && parseInt(s.start_time?.slice(0, 2) ?? "0", 10) === h);
                  return (
                    <div key={`${h}-${d.date}`} className="border-b border-r border-neutral-100 min-h-[60px] p-1 space-y-1">
                      {slot.map((s) => {
                        const th = therapist(s.therapist_id);
                        const cancelled = s.status?.startsWith("cancelled");
                        return (
                          <div key={s.id} className={`rounded-md px-2 py-1 text-[11px] leading-tight ${cancelled ? "opacity-40 line-through" : ""}`} style={{ background: (th?.color ?? "#eee") + "55", borderLeft: `3px solid ${th?.color ?? "#999"}` }}>
                            <p className="font-medium truncate">{clientName(s.client_id)}</p>
                            <p className="text-neutral-500 truncate">{s.start_time?.slice(0, 5)}–{s.end_time?.slice(0, 5)}</p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
