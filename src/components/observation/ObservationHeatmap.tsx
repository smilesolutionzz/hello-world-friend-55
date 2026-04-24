import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, eachDayOfInterval, subDays, startOfWeek } from "date-fns";
import { ko } from "date-fns/locale";

interface Props {
  dates: string[]; // ISO created_at strings
}

type RangeKey = "7" | "30" | "90";

const RANGE_OPTIONS: { key: RangeKey; label: string; days: number }[] = [
  { key: "7", label: "7일", days: 7 },
  { key: "30", label: "30일", days: 30 },
  { key: "90", label: "90일", days: 90 },
];

export default function ObservationHeatmap({ dates }: Props) {
  const [range, setRange] = useState<RangeKey>("30");

  const { weeks, max, total, days } = useMemo(() => {
    const today = new Date();
    const opt = RANGE_OPTIONS.find((r) => r.key === range)!;
    const start = startOfWeek(subDays(today, opt.days - 1), { weekStartsOn: 1 });
    const dayList = eachDayOfInterval({ start, end: today });

    const counts = new Map<string, number>();
    const cutoff = subDays(today, opt.days - 1);
    cutoff.setHours(0, 0, 0, 0);

    dates.forEach((d) => {
      const dt = new Date(d);
      if (dt < cutoff) return;
      const k = format(dt, "yyyy-MM-dd");
      counts.set(k, (counts.get(k) || 0) + 1);
    });

    const weeksArr: { date: Date; count: number; inRange: boolean }[][] = [];
    let cur: { date: Date; count: number; inRange: boolean }[] = [];
    dayList.forEach((day) => {
      cur.push({
        date: day,
        count: counts.get(format(day, "yyyy-MM-dd")) || 0,
        inRange: day >= cutoff,
      });
      if (cur.length === 7) {
        weeksArr.push(cur);
        cur = [];
      }
    });
    if (cur.length) weeksArr.push(cur);

    const maxCount = Math.max(1, ...Array.from(counts.values()));
    const totalCount = Array.from(counts.values()).reduce((a, b) => a + b, 0);
    return { weeks: weeksArr, max: maxCount, total: totalCount, days: opt.days };
  }, [dates, range]);

  const intensity = (c: number, inRange: boolean) => {
    if (!inRange) return "bg-amber-50/40";
    if (c === 0) return "bg-amber-100/50";
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
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-semibold text-amber-900">기록 활동 (최근 {days}일)</h3>
        </div>
        <div className="flex items-center gap-1 p-0.5 bg-amber-100/60 rounded-lg">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setRange(opt.key)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                range === opt.key
                  ? "bg-white text-amber-800 shadow-sm"
                  : "text-amber-600 hover:text-amber-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-fit">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((d, di) => (
                <div
                  key={di}
                  title={`${format(d.date, "M월 d일 (E)", { locale: ko })} · ${d.count}회`}
                  className={`w-3 h-3 rounded-sm ${intensity(d.count, d.inRange)} hover:ring-2 hover:ring-amber-500 transition-all cursor-pointer`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-amber-600">
        <span>총 {total}회 기록</span>
        <div className="flex items-center gap-1.5">
          <span>적음</span>
          <div className="w-3 h-3 rounded-sm bg-amber-100/50" />
          <div className="w-3 h-3 rounded-sm bg-amber-300" />
          <div className="w-3 h-3 rounded-sm bg-amber-400" />
          <div className="w-3 h-3 rounded-sm bg-amber-500" />
          <div className="w-3 h-3 rounded-sm bg-amber-600" />
          <span>많음</span>
        </div>
      </div>
    </motion.div>
  );
}
