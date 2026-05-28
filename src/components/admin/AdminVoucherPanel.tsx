/**
 * Admin voucher tab — odcloud.kr 동기화 실행 + 최근 로그
 *
 * Pre-PMF 단계: UDDI는 admin이 직접 입력해서 트리거 (data.go.kr 활용신청 화면에서 복사).
 * 자동 스케줄(pg_cron)은 다음 PR.
 */
import { useEffect, useState } from 'react';
import { Play, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Endpoint = { uddi: string; type: string; year: string };
type SyncLog = {
  id: string;
  run_at: string;
  total: number;
  matched: number;
  unmatched: number;
  duration_ms: number | null;
  errors: any;
};

const TYPES = ['발달재활', '지역사회', '장애인활동', '발달장애인주간'];
const YEARS = ['2021', '2022', '2023', '2024', '2025', '2026'];

const STORAGE_KEY = 'aihpro:voucher-sync:endpoints';

export default function AdminVoucherPanel() {
  const { toast } = useToast();
  const [endpoints, setEndpoints] = useState<Endpoint[]>([
    { uddi: '', type: '발달재활', year: '2024' },
  ]);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [lastResult, setLastResult] = useState<any>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setEndpoints(JSON.parse(saved));
    } catch {}
    loadLogs();
  }, []);

  async function loadLogs() {
    const { data } = await supabase
      .from('voucher_sync_logs')
      .select('*')
      .order('run_at', { ascending: false })
      .limit(10);
    setLogs((data ?? []) as any);
  }

  function persist(next: Endpoint[]) {
    setEndpoints(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }

  async function runSync() {
    const valid = endpoints.filter((e) => e.uddi.trim().length > 0);
    if (valid.length === 0) {
      toast({ title: 'UDDI 입력 필요', description: 'data.go.kr에서 발급받은 UDDI를 1개 이상 입력해 주세요.', variant: 'destructive' });
      return;
    }
    setRunning(true);
    setLastResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('voucher-sync', {
        body: { endpoints: valid },
      });
      if (error) throw error;
      setLastResult(data);
      toast({ title: '동기화 완료', description: `총 ${data?.total ?? 0}건, 매칭 ${data?.matched ?? 0}곳` });
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
        <h3 className="text-base font-semibold text-neutral-900 mb-1">바우처 데이터 동기화</h3>
        <p className="text-xs text-neutral-500 mb-4">
          공공데이터포털 → "사회서비스 전자바우처 제공기관 현황" → UDDI 복사 후 입력.
        </p>

        <div className="space-y-2">
          {endpoints.map((ep, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input
                value={ep.uddi}
                onChange={(e) => {
                  const next = [...endpoints];
                  next[i] = { ...ep, uddi: e.target.value.trim() };
                  persist(next);
                }}
                placeholder="UDDI (예: 12345678-abcd-...)"
                className="col-span-7 px-3 py-2 rounded-lg border border-neutral-200 text-sm font-mono"
              />
              <select
                value={ep.type}
                onChange={(e) => { const next = [...endpoints]; next[i] = { ...ep, type: e.target.value }; persist(next); }}
                className="col-span-3 px-2 py-2 rounded-lg border border-neutral-200 text-sm"
              >
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                value={ep.year}
                onChange={(e) => { const next = [...endpoints]; next[i] = { ...ep, year: e.target.value }; persist(next); }}
                className="col-span-1 px-1 py-2 rounded-lg border border-neutral-200 text-sm"
              >
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <button
                onClick={() => persist(endpoints.filter((_, j) => j !== i))}
                className="col-span-1 text-xs text-neutral-400 hover:text-red-500"
                aria-label="삭제"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => persist([...endpoints, { uddi: '', type: '발달재활', year: '2024' }])}
            className="text-xs text-neutral-600 hover:text-neutral-900 underline"
          >
            + 엔드포인트 추가
          </button>
          <div className="flex-1" />
          <button
            onClick={runSync}
            disabled={running}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 text-white text-sm font-semibold disabled:opacity-50"
          >
            {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {running ? '동기화 중…' : 'API 동기화 실행'}
          </button>
        </div>

        {lastResult && (
          <div className="mt-4 text-xs bg-neutral-50 rounded-xl p-3 font-mono">
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
