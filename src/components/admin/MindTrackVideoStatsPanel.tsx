/**
 * Mind Track 영상 이벤트 집계 패널 — 관리자용
 *
 * mind_track_video_event_stats 뷰를 읽어 day별/영상별 클릭·시작·완료 수와
 * 고유 사용자 수를 차트(BarChart)와 표로 보여줍니다.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Loader2 } from 'lucide-react';

interface StatRow {
  video_id: string;
  video_title: string;
  day_number: number | null;
  click_count: number;
  start_count: number;
  complete_count: number;
  unique_users: number;
  last_event_at: string | null;
}

export default function MindTrackVideoStatsPanel() {
  const [rows, setRows] = useState<StatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('mind_track_video_event_stats' as never)
          .select('*')
          .order('day_number', { ascending: true })
          .limit(500);
        if (cancelled) return;
        if (error) {
          setError(error.message);
        } else {
          setRows((data as unknown as StatRow[]) || []);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-sm text-rose-600">집계 로드 실패: {error}</p>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm text-slate-600">아직 집계할 영상 이벤트가 없습니다.</p>
      </Card>
    );
  }

  // Day 별 합산 (전체 영상)
  const byDayMap = new Map<number, { day: number; click: number; start: number; complete: number; users: number }>();
  for (const r of rows) {
    if (r.day_number == null) continue;
    const cur = byDayMap.get(r.day_number) ?? {
      day: r.day_number,
      click: 0,
      start: 0,
      complete: 0,
      users: 0,
    };
    cur.click += r.click_count;
    cur.start += r.start_count;
    cur.complete += r.complete_count;
    cur.users += r.unique_users;
    byDayMap.set(r.day_number, cur);
  }
  const byDay = Array.from(byDayMap.values()).sort((a, b) => a.day - b.day);

  // 영상별 Top 10 (클릭 기준)
  const topVideos = [...rows]
    .sort((a, b) => b.click_count - a.click_count)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h3 className="font-bold text-slate-900 mb-3">Day별 영상 이벤트 합계</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                label={{ value: 'Day', position: 'insideBottom', offset: -2, fontSize: 11 }}
              />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="click" name="클릭" fill="#3b82f6" />
              <Bar dataKey="start" name="시청 시작" fill="#10b981" />
              <Bar dataKey="complete" name="시청 완료" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold text-slate-900 mb-3">영상별 상위 10개 (클릭 기준)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-600">
                <th className="py-2 pr-3 font-medium">Day</th>
                <th className="py-2 pr-3 font-medium">videoId</th>
                <th className="py-2 pr-3 font-medium">제목</th>
                <th className="py-2 pr-3 font-medium text-right">클릭</th>
                <th className="py-2 pr-3 font-medium text-right">시작</th>
                <th className="py-2 pr-3 font-medium text-right">완료</th>
                <th className="py-2 pr-3 font-medium text-right">고유 사용자</th>
              </tr>
            </thead>
            <tbody>
              {topVideos.map((r) => {
                const completionRate =
                  r.start_count > 0
                    ? Math.round((r.complete_count / r.start_count) * 100)
                    : 0;
                return (
                  <tr key={`${r.video_id}-${r.day_number}`} className="border-b last:border-0">
                    <td className="py-2 pr-3 text-slate-600">{r.day_number ?? '-'}</td>
                    <td className="py-2 pr-3 font-mono text-xs text-slate-700">
                      <a
                        href={`https://youtu.be/${r.video_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {r.video_id}
                      </a>
                    </td>
                    <td className="py-2 pr-3 text-slate-800 max-w-[280px] truncate">
                      {r.video_title || '-'}
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold">{r.click_count}</td>
                    <td className="py-2 pr-3 text-right">{r.start_count}</td>
                    <td className="py-2 pr-3 text-right">
                      {r.complete_count}
                      <span className="text-[10px] text-slate-400 ml-1">({completionRate}%)</span>
                    </td>
                    <td className="py-2 pr-3 text-right">{r.unique_users}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
