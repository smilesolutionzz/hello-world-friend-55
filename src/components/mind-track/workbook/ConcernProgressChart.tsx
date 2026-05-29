import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { listSnapshots, type ConcernThread, type ProgressSnapshot } from "@/lib/mindTrackConcernThread";

interface Props { thread: ConcernThread; }

export default function ConcernProgressChart({ thread }: Props) {
  const [snaps, setSnaps] = useState<ProgressSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await listSnapshots(thread.id);
      if (!cancelled) {
        setSnaps(list);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [thread.id]);

  const data = [
    { day: 0, score: thread.baseline_score, label: "시작" },
    ...snaps.map((s) => ({
      day: s.day_number,
      score: s.self_score,
      label: `Day ${s.day_number}`,
    })),
  ];

  return (
    <Card className="p-5 sm:p-6 bg-white border border-slate-200 rounded-3xl">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs tracking-wider text-[#8a7a4d] font-semibold">진행 그래프</p>
          <p className="text-sm text-slate-600 mt-0.5">점수가 낮아질수록 고민이 가벼워진 거예요.</p>
        </div>
        <div className="text-xs text-slate-400">{snaps.length}회 기록</div>
      </div>
      <div className="h-44">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-400">불러오는 중…</div>
        ) : data.length < 2 ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-400">
            세션이 끝나면 첫 점수가 그래프에 찍혀요.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis domain={[1, 10]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                formatter={(v: any) => [`${v} / 10`, "자기점수"]}
              />
              <ReferenceLine y={thread.target_score} stroke="#C8B88A" strokeDasharray="4 4" label={{ value: "목표", fontSize: 10, fill: "#8a7a4d" }} />
              <Line type="monotone" dataKey="score" stroke="#0f172a" strokeWidth={2.5} dot={{ r: 4, fill: "#0f172a" }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
