/**
 * AI 에이전트 결정 카드
 *
 * 두 번째 업로드 이미지("사용자 대신 의사결정")의 컨셉.
 * 오늘의 체크인을 기반으로 mind-track-agent-decide 함수가 단 1개의 행동을
 * 골라주고, 사용자는 한 번의 탭으로 실행하거나 무시할 수 있습니다.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, ArrowRight, RefreshCw, Loader2, ShieldAlert } from "lucide-react";

interface Decision {
  action: string;
  route: string;
  label: string;
  reason: string;
  autoExecute?: boolean;
  crisis?: boolean;
}

interface Props {
  enrollmentId: string;
  day: number;
  audience: string;
  lastCheckin: any | null;
}

export default function DailyAgentPanel({ enrollmentId, day, audience, lastCheckin }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<Decision | null>(null);

  const decide = async (force = false) => {
    if (loading) return;
    const cacheKey = `aihpro_agent_decision:${enrollmentId}:${day}`;
    if (!force) {
      try {
        const raw = sessionStorage.getItem(cacheKey);
        if (raw) {
          setDecision(JSON.parse(raw));
          return;
        }
      } catch {}
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mind-track-agent-decide", {
        body: {
          enrollmentId,
          day,
          audience,
          lastCheckin,
          recentNotes: lastCheckin?.reflection_note ?? "",
        },
      });
      if (error) throw error;
      setDecision(data as Decision);
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
      } catch {}
    } catch (e) {
      console.error("agent decide failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void decide(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentId, day]);

  const accent = decision?.crisis
    ? "border-rose-200 bg-rose-50/40"
    : "border-[#C8B88A]/40 bg-white";

  return (
    <div className={`rounded-3xl border ${accent} p-5 space-y-4 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-[#8a7a4d]">
          {decision?.crisis ? (
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          AIH<span className="text-[#8a7a4d]">PRO</span> Agent · 오늘의 결정
        </div>
        <button
          onClick={() => decide(true)}
          disabled={loading}
          className="text-[11px] text-slate-400 hover:text-slate-700 inline-flex items-center gap-1"
          aria-label="다시 결정"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          다시
        </button>
      </div>

      {loading && !decision ? (
        <div className="h-16 flex items-center text-sm text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin mr-2" /> 오늘 당신에게 필요한 한 가지를 고르는 중…
        </div>
      ) : decision ? (
        <>
          <div className="space-y-1.5">
            <p className="text-[11px] text-slate-400">당신을 위해 결정했습니다</p>
            <h3 className="text-lg font-bold text-slate-900 leading-snug break-keep">
              {decision.label}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed break-keep">
              {decision.reason}
            </p>
          </div>
          <button
            onClick={() => navigate(decision.route)}
            className={[
              "w-full h-12 rounded-2xl text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors",
              decision.crisis
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-slate-900 hover:bg-slate-800 text-white",
            ].join(" ")}
          >
            바로 실행 <ArrowRight className="w-4 h-4" />
          </button>
        </>
      ) : (
        <div className="h-16 flex items-center text-sm text-slate-400">추천을 불러오지 못했어요.</div>
      )}
    </div>
  );
}
