import { useEffect, useState } from "react";
import { listRecentImports } from "@/lib/b2bCenter/excelImport";
import { Check, AlertTriangle, Loader2, FileSpreadsheet, RefreshCcw } from "lucide-react";

type Props = { centerId: string; refreshKey?: number };

export default function ImportHistoryPanel({ centerId, refreshKey = 0 }: Props) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try { setJobs(await listRecentImports(centerId, 5)); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [centerId, refreshKey]);

  const last = jobs[0];

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="min-w-0">
          <p className="text-[10px] tracking-widest text-neutral-400">IMPORT HISTORY</p>
          <h3 className="text-sm font-semibold">엑셀 가져오기 이력</h3>
        </div>
        <button onClick={load} className="p-1 hover:bg-neutral-100 rounded-full"><RefreshCcw className="w-3.5 h-3.5 text-neutral-400" /></button>
      </div>

      {loading ? (
        <div className="py-6 text-center text-xs text-neutral-400"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>
      ) : jobs.length === 0 ? (
        <p className="text-xs text-neutral-400 py-4 text-center">아직 가져오기 이력이 없어요.</p>
      ) : (
        <>
          {last && (
            <div className={`rounded-xl p-3 mb-3 ${last.status === "done" ? "bg-emerald-50 border border-emerald-200" : last.status === "failed" ? "bg-rose-50 border border-rose-200" : "bg-amber-50 border border-amber-200"}`}>
              <div className="flex items-center gap-2 mb-1">
                {last.status === "done" ? <Check className="w-4 h-4 text-emerald-600" /> : last.status === "failed" ? <AlertTriangle className="w-4 h-4 text-rose-600" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                <span className="text-xs font-semibold">최근 결과 · {labelFor(last.status)}</span>
                <span className="text-[10px] text-neutral-500 ml-auto">{relTime(last.completed_at ?? last.created_at)}</span>
              </div>
              <p className="text-[11px] text-neutral-600 truncate"><FileSpreadsheet className="w-3 h-3 inline mr-1" />{last.filename}</p>
              {last.summary && (
                <ul className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-[11px] text-neutral-700">
                  {Object.entries(last.summary as Record<string, number>).map(([k, v]) => (
                    <li key={k}><span className="text-neutral-400">{k}</span> <span className="font-semibold tabular-nums">{v}</span></li>
                  ))}
                </ul>
              )}
              {last.error_log?.message && <p className="text-[11px] text-rose-700 mt-1">⚠ {last.error_log.message}</p>}
            </div>
          )}
          {jobs.length > 1 && (
            <div className="divide-y divide-neutral-100 -mx-1">
              {jobs.slice(1).map((j) => (
                <div key={j.id} className="flex items-center gap-2 px-1 py-2 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${j.status === "done" ? "bg-emerald-500" : j.status === "failed" ? "bg-rose-500" : "bg-amber-500"}`} />
                  <span className="truncate flex-1 text-neutral-700">{j.filename}</span>
                  <span className="text-neutral-400 tabular-nums">{totalCount(j.summary)}</span>
                  <span className="text-[10px] text-neutral-400 w-16 text-right">{relTime(j.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function labelFor(s: string) { return s === "done" ? "성공" : s === "failed" ? "실패" : "진행 중"; }
function totalCount(summary: any) {
  if (!summary) return "—";
  const n = Object.values(summary).reduce((a: number, b: any) => a + (typeof b === "number" ? b : 0), 0);
  return `${n}건`;
}
function relTime(ts?: string | null) {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}
