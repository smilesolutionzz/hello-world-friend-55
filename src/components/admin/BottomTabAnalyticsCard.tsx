import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, MousePointerClick } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BOTTOM_TAB_EVENT, type BottomTabId } from '@/lib/bottomTabAnalytics';

type RangeKey = '7d' | '30d' | 'all';

const RANGES: { key: RangeKey; label: string; days: number | null }[] = [
  { key: '7d', label: '최근 7일', days: 7 },
  { key: '30d', label: '최근 30일', days: 30 },
  { key: 'all', label: '전체', days: null },
];

const TAB_LABEL: Record<BottomTabId, string> = {
  quiz: 'AI 검사',
  journey: '나의 여정',
  track: '마음 트랙',
  expert: '전문가',
  profile: 'MY',
};

interface Row {
  event_properties: any;
  user_id: string | null;
  created_at: string;
}

/**
 * 하단바 탭 클릭 집계 — 탭별 클릭 수와 고유 사용자 수.
 */
export default function BottomTabAnalyticsCard() {
  const [range, setRange] = useState<RangeKey>('30d');
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const opt = RANGES.find((r) => r.key === range);
        let q: any = (supabase as any)
          .from('user_analytics_events')
          .select('user_id, event_properties, created_at')
          .eq('event_name', BOTTOM_TAB_EVENT)
          .order('created_at', { ascending: false })
          .limit(10000);
        if (opt?.days) {
          const since = new Date(Date.now() - opt.days * 86400_000).toISOString();
          q = q.gte('created_at', since);
        }
        const { data, error } = await q;
        if (error) throw error;
        if (!cancelled) setRows((data || []) as Row[]);
      } catch (e) {
        console.warn('[BottomTabAnalyticsCard] load error', e);
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [range]);

  const tabs: BottomTabId[] = ['quiz', 'journey', 'track', 'expert', 'profile'];
  const stats = tabs.map((t) => {
    const items = rows.filter((r) => r?.event_properties?.tab === t);
    const unique = new Set(items.map((r) => r.user_id).filter(Boolean)).size;
    return { tab: t, clicks: items.length, users: unique };
  });
  const totalClicks = stats.reduce((s, x) => s + x.clicks, 0);

  return (
    <Card className="p-5 bg-white border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MousePointerClick className="w-4 h-4 text-[#8a7a4d]" />
          <h3 className="text-sm font-bold text-gray-900">하단바 탭 유입 경로</h3>
        </div>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`text-[11px] px-2.5 py-1 rounded-full transition-colors ${
                range === r.key
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : totalClicks === 0 ? (
        <p className="text-xs text-gray-500 text-center py-6">
          아직 수집된 클릭이 없습니다.
        </p>
      ) : (
        <div className="space-y-2">
          {stats.map((s) => {
            const share = totalClicks > 0 ? (s.clicks / totalClicks) * 100 : 0;
            return (
              <div key={s.tab} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-800">{TAB_LABEL[s.tab]}</span>
                  <span className="text-gray-500">
                    <span className="font-bold text-gray-900">{s.clicks.toLocaleString()}</span> · {s.users}명
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C8B88A] transition-all"
                    style={{ width: `${share}%` }}
                  />
                </div>
              </div>
            );
          })}
          <div className="pt-2 mt-2 border-t border-gray-100 text-[11px] text-gray-500 text-right">
            총 {totalClicks.toLocaleString()}회 클릭
          </div>
        </div>
      )}
    </Card>
  );
}
