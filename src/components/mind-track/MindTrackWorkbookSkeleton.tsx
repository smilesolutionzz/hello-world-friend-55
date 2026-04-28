import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, RotateCcw, CheckCircle2 } from "lucide-react";

interface Step {
  key: string;
  label: string;
  done: boolean;
}

interface Props {
  steps: Step[];
  error?: string | null;
  onRetry?: () => void;
}

/**
 * Step-based loading experience for MindTrackWorkbook.
 * Shows which data slice (workbook / missions / checkins / milestones) is
 * currently being fetched, plus a retry button when something fails.
 */
export default function MindTrackWorkbookSkeleton({ steps, error, onRetry }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30 px-4 pt-24 pb-16">
      <div className="max-w-2xl mx-auto space-y-5">
        <Card className="p-6 border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            {error ? (
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            ) : (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            )}
            <h2 className="text-base font-bold text-slate-900 break-keep">
              {error ? "데이터를 불러오지 못했어요" : "오늘의 워크북을 준비하고 있어요"}
            </h2>
          </div>

          <ul className="space-y-2 mb-4">
            {steps.map((s) => (
              <li key={s.key} className="flex items-center gap-2 text-sm">
                {s.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : error ? (
                  <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                )}
                <span className={s.done ? "text-slate-500 line-through" : "text-slate-700"}>
                  {s.label}
                </span>
              </li>
            ))}
          </ul>

          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 mb-3 break-keep">
              {error}
            </div>
          )}

          {error && onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm" className="gap-1.5">
              <RotateCcw className="w-4 h-4" />
              다시 시도
            </Button>
          )}
        </Card>

        {/* Skeleton blocks */}
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
