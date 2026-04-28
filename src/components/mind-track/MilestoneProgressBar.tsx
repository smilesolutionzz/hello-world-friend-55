import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Sparkles, Trophy } from "lucide-react";

interface Props {
  currentDay: number;
  checkins: any[];
}

const MILESTONES = [
  { day: 7, label: "1주차", color: "from-blue-500 to-cyan-500" },
  { day: 14, label: "2주차", color: "from-emerald-500 to-teal-500" },
  { day: 21, label: "3주차", color: "from-amber-500 to-orange-500" },
  { day: 28, label: "4주차", color: "from-purple-500 to-pink-500" },
];

/**
 * Compact horizontal progress strip showing which milestone cards
 * (Day 7/14/21/28) the user has reached + which is the next one.
 *
 * Completion rule: every check-in within the milestone window is marked
 * `completed`, OR the user has passed the milestone day. Whichever happens
 * first counts as "도달".
 */
export default function MilestoneProgressBar({ currentDay, checkins }: Props) {
  const completedSet = new Set(checkins.filter((c) => c.completed).map((c) => c.day_number));

  const status = MILESTONES.map((m) => {
    const reached = currentDay >= m.day;
    const inWindowCompleted = Array.from({ length: m.day }, (_, i) => i + 1).every((d) =>
      completedSet.has(d),
    );
    const done = reached && (inWindowCompleted || completedSet.size >= m.day);
    return { ...m, reached, done };
  });

  // Next milestone = first not-yet-reached, else last unfinished
  const next = status.find((s) => !s.done) ?? status[status.length - 1];
  const reachedCount = status.filter((s) => s.done).length;
  const overallPct = Math.round((Math.min(currentDay, 28) / 28) * 100);

  return (
    <Card className="p-5 bg-white border-slate-200">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900">마일스톤 진행도</h3>
          <Badge variant="outline" className="text-[10px]">{reachedCount}/4 완료</Badge>
        </div>
        <span className="text-[11px] text-slate-500">
          다음 목표 · <strong className="text-primary">Day {next.day}</strong>
        </span>
      </div>

      <Progress value={overallPct} className="h-1.5 mb-4" />

      <div className="grid grid-cols-4 gap-2">
        {status.map((s) => {
          const isNext = s.day === next.day && !s.done;
          return (
            <div
              key={s.day}
              className={`relative rounded-xl border-2 p-2.5 text-center transition-all ${
                s.done
                  ? "border-emerald-300 bg-emerald-50"
                  : isNext
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              {s.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
              ) : isNext ? (
                <Sparkles className="w-4 h-4 text-primary mx-auto mb-1 animate-pulse" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300 mx-auto mb-1" />
              )}
              <div className="text-[10px] text-slate-500">{s.label}</div>
              <div
                className={`text-xs font-bold ${
                  s.done ? "text-emerald-700" : isNext ? "text-primary" : "text-slate-400"
                }`}
              >
                Day {s.day}
              </div>
              {isNext && (
                <div className="text-[9px] text-primary font-bold mt-0.5">
                  {Math.max(0, s.day - currentDay)}일 남음
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
