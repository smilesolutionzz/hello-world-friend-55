import { useMemo, useRef, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CheckCircle2, Circle, Share2, Download, Link as LinkIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  enrollmentId: string;
  userId: string;
  startedAt: string;
  currentDay: number;
  totalDays: number;
  checkins: Array<{ day_number: number; completed: boolean }>;
  onChanged?: () => void;
}

/**
 * Week 1 요약 그래프 + Day별 완료 토글 + 공유/캡처 위젯.
 * - 진행률은 mind_track_checkins.completed 기준으로 즉시 갱신 (낙관적 업데이트 + DB 반영)
 * - 공유: 링크 복사 / PNG 캡처 저장
 */
export default function WeekProgressDashboard({
  enrollmentId,
  userId,
  startedAt,
  currentDay,
  totalDays,
  checkins,
  onChanged,
}: Props) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [optimistic, setOptimistic] = useState<Record<number, boolean>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [capturing, setCapturing] = useState(false);

  const merged = useMemo(() => {
    const map = new Map<number, boolean>();
    checkins.forEach((c) => map.set(c.day_number, !!c.completed));
    Object.entries(optimistic).forEach(([d, v]) => map.set(Number(d), v));
    return Array.from({ length: totalDays }, (_, i) => ({
      day: i + 1,
      label: `D${i + 1}`,
      done: map.get(i + 1) ? 1 : 0,
      isToday: i + 1 === currentDay,
      reachable: i + 1 <= currentDay,
    }));
  }, [checkins, optimistic, totalDays, currentDay]);

  const completedCount = merged.filter((m) => m.done).length;
  const progressPct = Math.round((completedCount / totalDays) * 100);
  const startedLabel = new Date(startedAt).toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric",
  });

  const toggleDay = async (day: number, nextDone: boolean) => {
    setBusy(day);
    setOptimistic((p) => ({ ...p, [day]: nextDone }));
    try {
      const { data: existing } = await supabase
        .from("mind_track_checkins")
        .select("id")
        .eq("enrollment_id", enrollmentId)
        .eq("day_number", day)
        .maybeSingle();
      if (existing?.id) {
        const { error } = await supabase
          .from("mind_track_checkins")
          .update({ completed: nextDone, checked_at: new Date().toISOString() })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("mind_track_checkins")
          .insert({
            user_id: userId,
            enrollment_id: enrollmentId,
            day_number: day,
            completed: nextDone,
            checked_at: new Date().toISOString(),
          });
        if (error) throw error;
      }
      toast.success(nextDone ? `Day ${day} 미션 완료 처리했어요` : `Day ${day} 완료를 해제했어요`);
      onChanged?.();
      window.dispatchEvent(new CustomEvent("mt:checkin-updated"));
    } catch (e: any) {
      setOptimistic((p) => {
        const n = { ...p };
        delete n[day];
        return n;
      });
      toast.error(e?.message || "저장에 실패했어요");
    } finally {
      setBusy(null);
    }
  };

  const copyShareLink = async () => {
    const url = `${window.location.origin}/mind-track/dashboard`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("대시보드 링크를 복사했어요");
    } catch {
      toast.error("링크 복사에 실패했어요");
    }
  };

  const downloadCapture = async () => {
    if (!captureRef.current) return;
    setCapturing(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: "#ffffff", scale: 2, useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `mind-track-week1-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("진행률 이미지를 저장했어요");
    } catch (e: any) {
      toast.error(e?.message || "캡처에 실패했어요");
    } finally {
      setCapturing(false);
    }
  };

  return (
    <section className="mb-4">
      <div
        ref={captureRef}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5"
      >
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="text-[15px] font-extrabold text-slate-900">Week 1 진행 요약</h2>
          <span className="text-[11px] text-slate-500 tabular-nums">
            {completedCount}/{totalDays}일 · {progressPct}%
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mb-3">시작일 {startedLabel}</p>

        <div className="h-[140px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={merged} margin={{ top: 8, right: 8, bottom: 0, left: -28 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#94a3b8"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide domain={[0, 1]} />
              <Tooltip
                cursor={{ fill: "rgba(15,23,42,0.04)" }}
                contentStyle={{
                  background: "#0f172a", border: "none", borderRadius: 8,
                  color: "#fff", fontSize: 12, padding: "6px 10px",
                }}
                formatter={(v: number) => [v ? "완료" : "미완료", "상태"]}
                labelFormatter={(l) => `${l}`}
              />
              <Bar dataKey="done" radius={[6, 6, 0, 0]}>
                {merged.map((m) => (
                  <Cell
                    key={m.day}
                    fill={m.done ? "#10b981" : m.isToday ? "#0f172a" : "#e2e8f0"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3">
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#8a7a4d] mb-2">
            Day별 완료 체크
          </p>
          <ul className="grid grid-cols-1 gap-1.5">
            {merged.map((m) => {
              const isDone = !!m.done;
              const disabled = !m.reachable || busy === m.day;
              return (
                <li key={m.day}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleDay(m.day, !isDone)}
                    aria-pressed={isDone}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-left transition ${
                      isDone
                        ? "bg-emerald-50 border-emerald-200"
                        : m.isToday
                        ? "bg-white border-[#C8B88A]"
                        : "bg-white border-slate-100"
                    } ${disabled && !busy ? "opacity-60" : "hover:border-slate-300"}`}
                  >
                    <span className="flex items-center gap-2">
                      {busy === m.day ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      ) : isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300" />
                      )}
                      <span className="text-[13px] font-semibold text-slate-800 tabular-nums">
                        Day {String(m.day).padStart(2, "0")}
                      </span>
                      {m.isToday && (
                        <span className="text-[10px] font-bold tracking-wider uppercase text-[#8a7a4d]">
                          오늘
                        </span>
                      )}
                    </span>
                    <span className={`text-[11px] font-bold ${isDone ? "text-emerald-600" : "text-slate-400"}`}>
                      {isDone ? "완료" : m.reachable ? "체크" : "잠금"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button
          variant="outline"
          onClick={copyShareLink}
          className="flex-1 h-10 rounded-xl border-slate-200 text-[12px] font-semibold"
        >
          <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
          링크 복사
        </Button>
        <Button
          variant="outline"
          onClick={downloadCapture}
          disabled={capturing}
          className="flex-1 h-10 rounded-xl border-slate-200 text-[12px] font-semibold"
        >
          {capturing ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5 mr-1.5" />
          )}
          이미지 저장
        </Button>
        <Button
          onClick={async () => {
            const url = `${window.location.origin}/mind-track/dashboard`;
            const text = `7일 마음 트랙 · ${completedCount}/${totalDays}일 완료 (${progressPct}%)`;
            if ((navigator as any).share) {
              try {
                await (navigator as any).share({ title: "마음 트랙 진행률", text, url });
              } catch {/* user cancelled */}
            } else {
              copyShareLink();
            }
          }}
          className="h-10 rounded-xl bg-slate-900 hover:bg-black text-white text-[12px] font-semibold px-4"
        >
          <Share2 className="w-3.5 h-3.5 mr-1.5" />
          공유
        </Button>
      </div>
    </section>
  );
}
