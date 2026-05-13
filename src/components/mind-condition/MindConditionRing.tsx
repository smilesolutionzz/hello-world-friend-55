import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ScoreRow {
  score: number;
  dimensions: Record<string, number>;
  recorded_at: string;
}

interface Props {
  userId: string;
  className?: string;
  onDimensionClick?: (dimensionKey: string) => void;
}

const DIM_LABELS: Record<string, string> = {
  emotion: "정서",
  sleep: "수면",
  relation: "관계",
  focus: "집중",
  resilience: "회복탄력성",
};

/**
 * 마음 컨디션 점수 — 0~100 단일 숫자.
 * 첫 점수 vs 최근 점수 델타 표시. Noom 스타일 단일 결과 지표.
 */
export default function MindConditionRing({ userId, className, onDimensionClick }: Props) {
  const [latest, setLatest] = useState<ScoreRow | null>(null);
  const [first, setFirst] = useState<ScoreRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from("mind_condition_scores")
      .select("score, dimensions, recorded_at")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: true });

    if (rows && rows.length > 0) {
      setFirst(rows[0] as ScoreRow);
      setLatest(rows[rows.length - 1] as ScoreRow);
    } else {
      setFirst(null);
      setLatest(null);
    }
    setLoading(false);
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.rpc("calculate_mind_condition_score", {
        p_user_id: userId,
      });
      if (error) throw error;
      const payload = data as { score: number; dimensions: Record<string, number> };
      const { error: insErr } = await supabase.from("mind_condition_scores").insert({
        user_id: userId,
        score: payload.score,
        dimensions: payload.dimensions,
        source: "ai_inference",
      });
      if (insErr) throw insErr;
      toast.success(`오늘의 마음 컨디션: ${payload.score}점`);
      await load();
    } catch (e: any) {
      toast.error(e?.message || "점수 산출 실패");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userId) load();
  }, [userId]);

  if (loading) {
    return (
      <div className={cn("bg-white rounded-3xl border p-8 animate-pulse h-64", className)} />
    );
  }

  const score = latest?.score ?? null;
  const startScore = first?.score ?? null;
  const delta = score !== null && startScore !== null ? score - startScore : null;
  const dims = latest?.dimensions ?? {};

  // SVG ring math
  const size = 180;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score !== null ? (score / 100) * circumference : 0;

  return (
    <section className={cn("bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8", className)}>
      <header className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Mind Condition</p>
          <h2 className="text-xl sm:text-2xl font-semibold mt-1 text-neutral-900 break-keep">
            오늘의 마음 컨디션 점수
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={refreshing}
          className="text-xs text-neutral-600"
        >
          <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", refreshing && "animate-spin")} />
          {score === null ? "처음 산출" : "다시 산출"}
        </Button>
      </header>

      {score === null ? (
        <div className="text-center py-10">
          <p className="text-sm text-neutral-600 mb-4 break-keep">
            아직 점수가 없어요. 오늘의 컨디션을 산출해보세요.
          </p>
          <Button onClick={refresh} disabled={refreshing} className="bg-neutral-900 hover:bg-neutral-800">
            지금 산출하기
          </Button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
            style={{ width: size, height: size }}
          >
            <svg width={size} height={size} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="hsl(var(--muted))"
                strokeWidth={stroke}
                fill="none"
              />
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#C8B88A"
                strokeWidth={stroke}
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${progress} ${circumference}` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-light tracking-tight text-neutral-900 tabular-nums">
                {score}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mt-1">/ 100</span>
            </div>
          </motion.div>

          <div className="flex-1 w-full">
            {delta !== null && startScore !== null && (
              <div className="flex items-center gap-2 mb-4">
                {delta > 0 && <TrendingUp className="w-4 h-4 text-emerald-600" />}
                {delta < 0 && <TrendingDown className="w-4 h-4 text-rose-600" />}
                {delta === 0 && <Minus className="w-4 h-4 text-neutral-500" />}
                <span className="text-sm text-neutral-700 break-keep">
                  시작 <span className="font-medium tabular-nums">{startScore}</span> →
                  현재 <span className="font-medium tabular-nums">{score}</span>
                  <span
                    className={cn(
                      "ml-2 font-medium tabular-nums",
                      delta > 0 && "text-emerald-600",
                      delta < 0 && "text-rose-600",
                      delta === 0 && "text-neutral-500",
                    )}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </span>
                </span>
              </div>
            )}

            <div className="space-y-2.5">
              {Object.entries(DIM_LABELS).map(([key, label]) => {
                const v = Number(dims[key] ?? 0);
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-neutral-600 w-16 shrink-0">{label}</span>
                    <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-neutral-900 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${v}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-neutral-700 w-8 text-right">{v}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
