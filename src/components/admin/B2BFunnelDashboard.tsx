import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Users, MousePointerClick, Send } from 'lucide-react';

interface FunnelRow {
  page_path: string;
  event_type: string;
  event_count: number;
  unique_sessions: number;
}

const RANGE_OPTIONS = [
  { value: '7', label: '최근 7일' },
  { value: '30', label: '최근 30일' },
  { value: '90', label: '최근 90일' },
];

const PAGE_LABELS: Record<string, string> = {
  '/business': '비즈니스 허브',
  '/b2b-jobcoach': '잡코치',
  '/b2b-proposal': '도입 문의',
  '/b2b-hr-dashboard': 'HR 대시보드',
  '/b2b-demo-report': '데모 리포트',
  '/business-case-studies': '도입 사례',
  '/business-security': '보안 백서',
};

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  page_view: { label: '페이지뷰', color: 'text-gray-700' },
  cta_click: { label: 'CTA 클릭', color: 'text-blue-700' },
  form_start: { label: '폼 시작', color: 'text-amber-700' },
  form_submit: { label: '폼 제출', color: 'text-emerald-700' },
};

export default function B2BFunnelDashboard() {
  const [rows, setRows] = useState<FunnelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState('30');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const end = new Date();
      const start = new Date(end.getTime() - parseInt(days) * 24 * 60 * 60 * 1000);
      const { data, error } = await supabase.rpc('get_b2b_funnel_summary' as never, {
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      } as never);
      if (cancelled) return;
      if (error) {
        console.error('[b2b-funnel]', error);
        setRows([]);
      } else {
        setRows((data as FunnelRow[]) ?? []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [days]);

  const byPage = rows.reduce<Record<string, Record<string, FunnelRow>>>((acc, r) => {
    if (!acc[r.page_path]) acc[r.page_path] = {};
    acc[r.page_path][r.event_type] = r;
    return acc;
  }, {});

  const totals = rows.reduce(
    (acc, r) => {
      if (r.event_type === 'page_view') acc.views += Number(r.unique_sessions);
      if (r.event_type === 'cta_click') acc.ctas += Number(r.event_count);
      if (r.event_type === 'form_start') acc.starts += Number(r.unique_sessions);
      if (r.event_type === 'form_submit') acc.submits += Number(r.event_count);
      return acc;
    },
    { views: 0, ctas: 0, starts: 0, submits: 0 },
  );

  const conversionRate = totals.views > 0
    ? ((totals.submits / totals.views) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">B2B 전환 퍼널</h2>
          <p className="text-xs text-gray-500 mt-0.5">방문 → CTA 클릭 → 폼 시작 → 제출</p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <SummaryCard icon={<Users className="h-4 w-4" />} label="고유 방문자" value={totals.views} />
            <SummaryCard icon={<MousePointerClick className="h-4 w-4" />} label="CTA 클릭" value={totals.ctas} />
            <SummaryCard icon={<TrendingUp className="h-4 w-4" />} label="폼 시작" value={totals.starts} />
            <SummaryCard icon={<Send className="h-4 w-4" />} label="폼 제출" value={totals.submits} highlight={`${conversionRate}%`} />
          </div>

          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-900">페이지별 상세</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {Object.keys(byPage).length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-10">데이터가 없습니다</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {Object.entries(byPage)
                    .sort(([, a], [, b]) => (b.page_view?.unique_sessions ?? 0) - (a.page_view?.unique_sessions ?? 0))
                    .map(([path, events]) => {
                      const views = Number(events.page_view?.unique_sessions ?? 0);
                      const submits = Number(events.form_submit?.event_count ?? 0);
                      const rate = views > 0 ? ((submits / views) * 100).toFixed(1) : '0.0';
                      return (
                        <div key={path} className="px-4 py-3">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="text-xs font-semibold text-gray-900">{PAGE_LABELS[path] ?? path}</div>
                              <div className="text-[10px] text-gray-400 font-mono">{path}</div>
                            </div>
                            <div className="text-xs font-semibold text-gray-900">전환 {rate}%</div>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {(['page_view', 'cta_click', 'form_start', 'form_submit'] as const).map((et) => {
                              const r = events[et];
                              const meta = EVENT_LABELS[et];
                              return (
                                <div key={et} className="bg-gray-50 rounded-lg px-2 py-1.5">
                                  <div className="text-[10px] text-gray-500">{meta.label}</div>
                                  <div className={`text-sm font-semibold ${meta.color}`}>
                                    {r ? Number(et === 'cta_click' || et === 'form_submit' ? r.event_count : r.unique_sessions).toLocaleString() : 0}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: number; highlight?: string }) {
  return (
    <Card className="rounded-2xl border-gray-100 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 text-gray-500 text-[11px] mb-1">
          {icon}
          {label}
        </div>
        <div className="text-xl font-semibold text-gray-900">{value.toLocaleString()}</div>
        {highlight && <div className="text-[10px] text-emerald-600 mt-0.5 font-medium">전환율 {highlight}</div>}
      </CardContent>
    </Card>
  );
}
