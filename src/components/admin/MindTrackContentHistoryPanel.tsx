/**
 * Mind Track Day별 콘텐츠 변경 이력 패널 — 관리자용
 *
 * 선택한 day의 변경 이력을 시간 역순으로 보여주고,
 * 각 항목을 "이 시점으로 되돌리기" 할 수 있습니다.
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Loader2, RotateCcw, History } from 'lucide-react';

interface HistoryRow {
  id: string;
  day_number: number;
  assessment: unknown;
  video: unknown;
  action: unknown;
  is_active: boolean;
  change_type: 'save' | 'delete' | 'restore';
  changed_by: string | null;
  created_at: string;
}

interface Props {
  day: number;
  /** 부모(편집 폼)가 새로고침해야 할 때 호출 */
  onRestored: () => void;
}

const TYPE_LABEL: Record<HistoryRow['change_type'], string> = {
  save: '저장',
  delete: '기본값 복원',
  restore: '되돌리기',
};
const TYPE_COLOR: Record<HistoryRow['change_type'], string> = {
  save: 'bg-blue-100 text-blue-800',
  delete: 'bg-slate-200 text-slate-700',
  restore: 'bg-amber-100 text-amber-800',
};

export default function MindTrackContentHistoryPanel({ day, onRestored }: Props) {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mind_track_daily_content_history')
        .select('*')
        .eq('day_number', day)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      setRows((data as unknown as HistoryRow[]) || []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: '이력 조회 실패', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [day]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRestore = async (row: HistoryRow) => {
    if (!confirm('이 시점의 콘텐츠로 되돌릴까요? 현재 값은 이력에 보관됩니다.')) return;
    setRestoringId(row.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // 1) 현재 활성 오버라이드 → 이력에 'restore' 기록 (현재 값 보존)
      const { data: current } = await supabase
        .from('mind_track_daily_content_overrides')
        .select('*')
        .eq('day_number', day)
        .maybeSingle();
      if (current) {
        await supabase.from('mind_track_daily_content_history').insert({
          day_number: day,
          assessment: (current as never as HistoryRow).assessment as never,
          video: (current as never as HistoryRow).video as never,
          action: (current as never as HistoryRow).action as never,
          is_active: (current as never as HistoryRow).is_active,
          change_type: 'restore',
          changed_by: user?.id ?? null,
        });
      }

      // 2) 선택한 이력으로 upsert
      const { error } = await supabase
        .from('mind_track_daily_content_overrides')
        .upsert(
          {
            day_number: day,
            assessment: row.assessment as never,
            video: row.video as never,
            action: row.action as never,
            is_active: true,
          },
          { onConflict: 'day_number' },
        );
      if (error) throw error;

      toast({ title: '되돌리기 완료', description: '대시보드에 즉시 반영됩니다.' });
      await load();
      onRestored();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: '되돌리기 실패', description: msg, variant: 'destructive' });
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-slate-500" />
        <h3 className="font-bold text-slate-900">변경 이력 (최근 20개)</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-500 py-6 text-center">
          아직 이 Day의 변경 이력이 없습니다.
        </p>
      ) : (
        <ul className="divide-y">
          {rows.map((r) => {
            const v = r.video as { title?: string } | null;
            const a = r.assessment as { title?: string } | null;
            const ts = new Date(r.created_at).toLocaleString('ko-KR');
            return (
              <li key={r.id} className="py-3 flex items-start gap-3">
                <Badge className={`${TYPE_COLOR[r.change_type]} border-0 shrink-0`}>
                  {TYPE_LABEL[r.change_type]}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">{ts}</p>
                  <p className="text-sm text-slate-800 truncate">
                    영상: <span className="font-medium">{v?.title ?? '-'}</span>
                  </p>
                  <p className="text-xs text-slate-600 truncate">
                    검사: {a?.title ?? '없음'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRestore(r)}
                  disabled={restoringId === r.id}
                >
                  {restoringId === r.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <RotateCcw className="w-3 h-3 mr-1" />
                      되돌리기
                    </>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
