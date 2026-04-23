import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface QualityStats {
  total: number;
  failed: number;
  failureRate: number;
  avgSections: number;
  recentFailures: Array<{ id: string; user_id: string; created_at: string; reason: string }>;
}

export function ReportQualityCard() {
  const [stats, setStats] = useState<QualityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('premium_report_history')
        .select('id, user_id, created_at, report_data')
        .gte('created_at', since)
        .order('created_at', { ascending: false });

      if (!data) {
        setStats({ total: 0, failed: 0, failureRate: 0, avgSections: 0, recentFailures: [] });
        setLoading(false);
        return;
      }

      let totalSections = 0;
      const failures: QualityStats['recentFailures'] = [];

      data.forEach((r: any) => {
        const rd = r.report_data || {};
        const sections = Array.isArray(rd.sections) ? rd.sections : [];
        const validCount = sections.filter((s: any) => {
          const c = typeof s?.content === 'string' ? s.content.replace(/<[^>]*>/g, '').trim() : '';
          return c.length > 20 && !c.includes('이 섹션의 분석이 생성되지 않았습니다');
        }).length;
        totalSections += validCount;

        if (rd.parseError === true || validCount === 0) {
          failures.push({
            id: r.id,
            user_id: r.user_id,
            created_at: r.created_at,
            reason: rd.parseError ? 'parseError' : 'empty sections',
          });
        }
      });

      setStats({
        total: data.length,
        failed: failures.length,
        failureRate: data.length > 0 ? Math.round((failures.length / data.length) * 100) : 0,
        avgSections: data.length > 0 ? Math.round((totalSections / data.length) * 10) / 10 : 0,
        recentFailures: failures.slice(0, 10),
      });
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <Card><CardContent className="p-6 text-sm text-gray-500">리포트 품질 데이터 로딩 중...</CardContent></Card>;
  }

  if (!stats) return null;

  const isHealthy = stats.failureRate < 5;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="h-4 w-4" />
          리포트 품질 (최근 7일)
          {isHealthy ? (
            <Badge variant="outline" className="ml-2 border-green-200 text-green-700 bg-green-50 text-[10px]">
              <CheckCircle2 className="h-3 w-3 mr-1" />정상
            </Badge>
          ) : (
            <Badge variant="destructive" className="ml-2 text-[10px]">
              <AlertTriangle className="h-3 w-3 mr-1" />주의 필요
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-[11px] text-gray-500">총 생성</div>
            <div className="text-xl font-semibold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-[11px] text-gray-500">실패</div>
            <div className="text-xl font-semibold text-red-600">{stats.failed}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-[11px] text-gray-500">실패율</div>
            <div className={`text-xl font-semibold ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
              {stats.failureRate}%
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-[11px] text-gray-500">평균 섹션</div>
            <div className="text-xl font-semibold text-gray-900">{stats.avgSections}</div>
          </div>
        </div>

        {stats.recentFailures.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-gray-700 mb-2">최근 실패 케이스</div>
            <div className="space-y-1.5">
              {stats.recentFailures.map(f => (
                <div key={f.id} className="flex items-center justify-between text-[11px] bg-red-50 px-3 py-2 rounded">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                    <span className="font-mono text-gray-600 truncate">{f.user_id.slice(0, 8)}…</span>
                    <Badge variant="outline" className="text-[10px] border-red-200 text-red-700">
                      {f.reason}
                    </Badge>
                  </div>
                  <span className="text-gray-500 flex-shrink-0">
                    {format(new Date(f.created_at), 'MM/dd HH:mm')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isHealthy && (
          <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            실패율이 5%를 초과합니다. 에지 함수 로그를 확인하고 입력 검증을 강화하세요.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
