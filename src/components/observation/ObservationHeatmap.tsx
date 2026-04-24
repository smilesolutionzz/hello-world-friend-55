import { useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, eachDayOfInterval, subDays, startOfWeek, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";

interface Props {
  dates: string[]; // ISO created_at strings
}

export default function ObservationHeatmap({ dates }: Props) {
  const { weeks, max, total } = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(subDays(today, 7 * 14), { weekStartsOn: 1 }); // ~15주
    const days = eachDayOfInterval({ start, end: today });

    const counts = new Map<string, number>();
    dates.forEach((d) => {
      const k = format(new Date(d), "yyyy-MM-dd");
      counts.set(k, (counts.get(k) || 0) + 1);
    });

    const weeksArr: { date: Date; count: number }[][] = [];
    let cur: { date: Date; count: number }[] = [];
    days.forEach((day, i) => {
      cur.push({ date: day, count: counts.get(format(day, "yyyy-MM-dd")) || 0 });
      if (cur.length === 7) {
        weeksArr.push(cur);
        cur = [];
      }
    });
    if (cur.length) weeksArr.push(cur);

    const maxCount = Math.max(1, ...Array.from(counts.values()));
    const totalCount = Array.from(counts.values()).reduce((a, b) => a + b, 0);
    return { weeks: weeksArr, max: maxCount, total: totalCount };
  }, [dates]);

  const intensity = (c: number) => {
    if (c === 0) return "bg-amber-100/40";
    const ratio = c / max;
    if (ratio > 0.75) return "bg-amber-600";
    if (ratio > 0.5) return "bg-amber-500";
    if (ratio > 0.25) return "bg-amber-400";
    return "bg-amber-300";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-amber-200/50 shadow-sm mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-semibold text-amber-900">기록 활동 (최근 15주)</h3>
        </div>
        <span className="text-xs text-amber-600">총 {total}회 기록</span>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-fit">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((d, di) => (
                <div
                  key={di}
                  title={`${format(d.date, "M월 d일 (E)", { locale: ko })} · ${d.count}회`}
                  className={`w-3 h-3 rounded-sm ${intensity(d.count)} hover:ring-2 hover:ring-amber-500 transition-all cursor-pointer`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 mt-3 text-xs text-amber-600">
        <span>적음</span>
        <div className="w-3 h-3 rounded-sm bg-amber-100/40" />
        <div className="w-3 h-3 rounded-sm bg-amber-300" />
        <div className="w-3 h-3 rounded-sm bg-amber-400" />
        <div className="w-3 h-3 rounded-sm bg-amber-500" />
        <div className="w-3 h-3 rounded-sm bg-amber-600" />
        <span>많음</span>
      </div>
    </motion.div>
  );
}
