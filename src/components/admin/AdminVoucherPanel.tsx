/**
 * Admin voucher tab — 한국사회보장정보원 전국 제공기관 동기화.
 * 버튼 한 번으로 17개 광역시도 전수 수집.
 */
import { useEffect, useState } from 'react';
import { Play, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type SyncLog = {
  id: string;
  run_at: string;
  total: number;
  matched: number;
  unmatched: number;
  duration_ms: number | null;
  errors: any;
};

export default function AdminVoucherPanel() {
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [lastResult, setLastResult] = useState<any>(null);

  useEffect(() => { loadLogs(); }, []);

  async function loadLogs() {
    const { data } = await supabase
      .from('voucher_sync_logs')
      .select('*')
      .order('run_at', { ascending: false })
      .limit(10);
    setLogs((data ?? []) as any);
  }

  async function runSync() {
    setRunning(true);
    setLastResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('voucher-sync', { body: {} });
      if (error) throw error;
      setLastResult(data);
      toast({ title: '동기화 완료', description: `전국 ${data?.total ?? 0}개 기관 수집, 파트너 매칭 ${data?.matched ?? 0}곳` });
      loadLogs();
    } catch (e: any) {
      toast({ title: '동기화 실패', description: e?.message ?? String(e), variant: 'destructive' });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h3 className="text-base font-semibold text-neutral-900 mb-1">전국 바우처 제공기관 동기화</h3>
        <p className="text-xs text-neutral-500 mb-4">
          한국사회보장정보원 사회서비스 제공기관 정보 API에서 17개 광역시도 전수 데이터를 한 번에 수집합니다.
          기존 데이터는 삭제 후 새로 채워집니다 (약 1~3분 소요).
        </p>

        <button
          onClick={runSync}
          disabled={running}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-semibold disabled:opacity-50"
        >
          {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {running ? '전국 수집 중…' : '전국 동기화 실행'}
        </button>

        {lastResult && (
          <div className="mt-4 text-xs bg-neutral-50 rounded-xl p-3 font-mono max-h-80 overflow-auto">
            <pre className="whitespace-pre-wrap break-all">{JSON.stringify(lastResult, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-neutral-900">최근 동기화 로그</h3>
          <button onClick={loadLogs} className="text-xs text-neutral-500 hover:text-neutral-900">
            <RefreshCw className="w-3 h-3 inline mr-1" /> 새로고침
          </button>
        </div>
        {logs.length === 0 ? (
          <p className="text-xs text-neutral-400">아직 실행 기록이 없어요.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {logs.map((l) => {
              const hasErrors = Array.isArray(l.errors) && l.errors.length > 0;
              return (
                <li key={l.id} className="py-3 flex items-center gap-3 text-sm">
                  {hasErrors
                    ? <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    : <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-neutral-900">
                      총 <b>{l.total.toLocaleString()}</b> · 매칭 <b className="text-emerald-700">{l.matched}</b> · 미매칭 <span className="text-neutral-500">{l.unmatched}</span>
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {new Date(l.run_at).toLocaleString('ko-KR')}
                      {l.duration_ms != null && <> · {(l.duration_ms / 1000).toFixed(1)}s</>}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
