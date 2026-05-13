import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import MindConditionRing from "./MindConditionRing";

interface ScoreRow {
  id: string;
  score: number;
  dimensions: Record<string, number>;
  recorded_at: string;
  note?: string | null;
}

interface Props {
  userId: string;
  className?: string;
}

const DIM_LABELS: Record<string, string> = {
  emotion: "정서",
  sleep: "수면",
  relation: "관계",
  focus: "집중",
  resilience: "회복탄력성",
};

const DIM_DESCRIPTIONS: Record<string, string> = {
  emotion:
    "최근의 평균적인 기분과 감정의 안정성. 점수가 높을수록 긍정 정서가 자주 머무르고 정서 기복이 적은 상태를 의미합니다.",
  sleep:
    "수면의 양과 질, 그리고 깨어났을 때의 회복감. 점수가 높을수록 충분히 자고 깨어났을 때 개운한 상태가 많다는 뜻입니다.",
  relation:
    "가까운 사람들과의 연결감과 안전한 소통의 빈도. 점수가 높을수록 외롭지 않고 마음을 나눌 사람이 곁에 있다고 느끼는 정도가 큽니다.",
  focus:
    "일상에서 한 가지에 주의를 모으고 마무리하는 능력. 점수가 높을수록 주의 분산이 적고 일과를 매듭짓는 감각이 좋습니다.",
  resilience:
    "스트레스 사건에서 평소 상태로 돌아오는 힘. 점수가 높을수록 작은 좌절에서 빠르게 회복하고 다시 시도할 수 있습니다.",
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("ko-KR", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

export default function MindConditionPanel({ userId, className }: Props) {
  const [rows, setRows] = useState<ScoreRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDim, setActiveDim] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("mind_condition_scores")
      .select("id, score, dimensions, recorded_at, note")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: true });
    setRows((data as ScoreRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (userId) load();
  }, [userId]);

  // 점수가 0건이면 1회 자동 안내
  useEffect(() => {
    if (!loading && rows && rows.length === 0) {
      const seenKey = `mind-condition-onboard-seen:${userId}`;
      if (!sessionStorage.getItem(seenKey)) {
        setShowOnboarding(true);
        sessionStorage.setItem(seenKey, "1");
      }
    }
  }, [loading, rows, userId]);

  const createFirstScore = async () => {
    setCreating(true);
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
      toast.success(`첫 마음 컨디션: ${payload.score}점`);
      setShowOnboarding(false);
      await load();
    } catch (e: any) {
      toast.error(e?.message || "산출 실패");
    } finally {
      setCreating(false);
    }
  };

  // 14일 추이 — 일별 마지막 점수 사용
  const trend = useMemo(() => {
    if (!rows || rows.length === 0) return [];
    const map = new Map<string, ScoreRow>();
    rows.forEach((r) => {
      const key = new Date(r.recorded_at).toISOString().slice(0, 10);
      map.set(key, r); // 정렬이 오름차순이므로 자동으로 마지막 값 유지
    });
    const today = new Date();
    const out: Array<{ date: string; label: string; score: number | null }> = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const row = map.get(key);
      out.push({
        date: key,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        score: row ? row.score : null,
      });
    }
    return out;
  }, [rows]);

  const dimHistory = useMemo(() => {
    if (!activeDim || !rows) return [];
    return rows
      .slice()
      .reverse()
      .map((r) => ({
        id: r.id,
        recorded_at: r.recorded_at,
        value: Number(r.dimensions?.[activeDim] ?? 0),
      }));
  }, [activeDim, rows]);

  return (
    <div className={cn("space-y-6", className)}>
      <MindConditionRing
        userId={userId}
        onDimensionClick={(key) => setActiveDim(key)}
      />

      {/* 14일 추이 차트 */}
      <section className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8">
        <header className="mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">14-Day Trend</p>
          <h3 className="text-lg sm:text-xl font-semibold mt-1 text-neutral-900 break-keep">
            최근 14일 마음 컨디션 흐름
          </h3>
        </header>
        {loading ? (
          <div className="h-56 animate-pulse bg-neutral-100 rounded-xl" />
        ) : trend.every((t) => t.score === null) ? (
          <div className="h-56 flex items-center justify-center text-sm text-neutral-500 break-keep">
            아직 기록이 없어요. 첫 점수를 산출하면 흐름이 그려집니다.
          </div>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#737373" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#737373" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, fontSize: 12,
                  }}
                  formatter={(v: any) => [v ?? "—", "점수"]}
                  labelFormatter={(l) => `${l}`}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#C8B88A"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#C8B88A", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* 전체 기록 타임라인 */}
      <section className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8">
        <header className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Timeline</p>
            <h3 className="text-lg sm:text-xl font-semibold mt-1 text-neutral-900 break-keep">
              모든 기록
            </h3>
          </div>
          <span className="text-xs text-neutral-500 tabular-nums">
            총 {rows?.length ?? 0}건
          </span>
        </header>

        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !rows || rows.length === 0 ? (
          <div className="text-center py-8 text-sm text-neutral-500 break-keep">
            아직 기록이 없어요.
          </div>
        ) : (
          <ScrollArea className="max-h-[420px] pr-3">
            <ul className="space-y-2">
              {rows
                .slice()
                .reverse()
                .map((r) => (
                  <motion.li
                    key={r.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-neutral-200 rounded-2xl p-4 hover:border-neutral-300 transition-colors"
                  >
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-xs text-neutral-500 tabular-nums">
                        {fmtDateTime(r.recorded_at)}
                      </span>
                      <span className="text-2xl font-light tabular-nums text-neutral-900">
                        {r.score}
                        <span className="text-xs text-neutral-400 ml-1">/100</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {Object.keys(DIM_LABELS).map((k) => {
                        const v = Number(r.dimensions?.[k] ?? 0);
                        return (
                          <button
                            key={k}
                            type="button"
                            onClick={() => setActiveDim(k)}
                            className="text-left group"
                          >
                            <div className="text-[10px] text-neutral-500 mb-1 group-hover:text-neutral-900 transition-colors">
                              {DIM_LABELS[k]}
                            </div>
                            <div className="h-1 bg-neutral-100 rounded-full overflow-hidden mb-1">
                              <div
                                className="h-full bg-neutral-900 rounded-full"
                                style={{ width: `${v}%` }}
                              />
                            </div>
                            <div className="text-[11px] tabular-nums text-neutral-700">{v}</div>
                          </button>
                        );
                      })}
                    </div>
                    {r.note && (
                      <p className="text-xs text-neutral-600 mt-2 break-keep">{r.note}</p>
                    )}
                  </motion.li>
                ))}
            </ul>
          </ScrollArea>
        )}
      </section>

      {/* 차원 상세 모달 */}
      <Dialog open={!!activeDim} onOpenChange={(o) => !o && setActiveDim(null)}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-neutral-900">
              {activeDim ? DIM_LABELS[activeDim] : ""} 자세히 보기
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-600 break-keep pt-1">
              {activeDim ? DIM_DESCRIPTIONS[activeDim] : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2">기록 추이</p>
            {dimHistory.length === 0 ? (
              <p className="text-sm text-neutral-500 py-6 text-center">아직 기록이 없어요.</p>
            ) : (
              <ScrollArea className="max-h-[320px] pr-3">
                <ul className="space-y-2">
                  {dimHistory.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center gap-3 border border-neutral-100 rounded-xl p-3"
                    >
                      <span className="text-[11px] text-neutral-500 tabular-nums w-20 shrink-0">
                        {fmtDate(d.recorded_at)}
                      </span>
                      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neutral-900 rounded-full"
                          style={{ width: `${d.value}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-neutral-700 w-8 text-right">
                        {d.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 첫 산출 안내 */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="max-w-sm bg-white text-center">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-[#C8B88A]/15 flex items-center justify-center mb-2">
              <Sparkles className="w-5 h-5 text-[#C8B88A]" />
            </div>
            <DialogTitle className="text-xl text-neutral-900">
              첫 마음 컨디션 점수를 만들어 보세요
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-600 break-keep pt-1">
              지금 한 번 산출하면 매일의 흐름과 5가지 차원이 기록되기 시작합니다.
              30초도 걸리지 않아요.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-2">
            <Button
              onClick={createFirstScore}
              disabled={creating}
              className="bg-neutral-900 hover:bg-neutral-800 text-white"
            >
              {creating ? "산출 중..." : "지금 첫 점수 산출하기"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowOnboarding(false)}
              className="text-neutral-600"
            >
              나중에 할게요
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
