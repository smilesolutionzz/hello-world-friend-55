/**
 * AI 에이전트 결정 카드 — 강화판
 *
 * - 오늘 체크인(mood/energy/clarity)을 칩으로 노출
 * - "왜 이 행동인가" 인사이트 박스
 * - Day x/7 진행 배지 + 신뢰도 점
 * - 메인 CTA + 보조(다른 선택지 / 다시 결정) 동선
 * - 위기 신호 감지 시 rose 톤으로 즉시 전환
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  Loader2,
  ShieldAlert,
  Activity,
  Battery,
  Compass,
  Lightbulb,
  Shuffle,
} from "lucide-react";

interface Decision {
  action: string;
  route: string;
  label: string;
  reason: string;
  autoExecute?: boolean;
  crisis?: boolean;
  source?: string;
}

interface Props {
  enrollmentId: string;
  day: number;
  audience: string;
  lastCheckin: any | null;
}

const ALT_ROUTE = "/mind-track/dashboard?from=agent_alt";

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

  const mood = lastCheckin?.mood_score as number | undefined;
  const energy = lastCheckin?.energy_score as number | undefined;
  const clarity = lastCheckin?.clarity_score as number | undefined;

  const confidence = useMemo(() => {
    if (!decision) return 0;
    if (decision.crisis) return 3;
    if (decision.source === "ai") return 3;
    if (decision.source === "fallback") return 2;
    return 2;
  }, [decision]);

  const confidenceLabel = ["", "낮음", "보통", "높음"][confidence] || "보통";

  const crisis = !!decision?.crisis;

  return (
    <div
      className={[
        "relative rounded-3xl border p-5 sm:p-6 space-y-5 shadow-sm overflow-hidden",
        crisis
          ? "border-rose-200 bg-gradient-to-br from-rose-50/70 to-white"
          : "border-[#C8B88A]/40 bg-gradient-to-br from-[#FBF8F0]/60 to-white",
      ].join(" ")}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2">
          <span
            className={[
              "inline-flex items-center justify-center w-7 h-7 rounded-full",
              crisis ? "bg-rose-100 text-rose-600" : "bg-[#C8B88A]/20 text-[#8a7a4d]",
            ].join(" ")}
          >
            {crisis ? <ShieldAlert className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#8a7a4d]">
              AIH<span>PRO</span> Agent
            </span>
            <span className="text-[11px] text-slate-500">오늘의 결정 · Day {day}/7</span>
          </div>
        </div>
        <button
          onClick={() => decide(true)}
          disabled={loading}
          className="text-[11px] text-slate-400 hover:text-slate-700 inline-flex items-center gap-1 disabled:opacity-50"
          aria-label="다시 결정"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          다시
        </button>
      </div>

      {/* 오늘의 상태 칩 */}
      {(mood != null || energy != null || clarity != null) && (
        <div className="flex flex-wrap gap-1.5">
          {mood != null && <StateChip icon={<Activity className="w-3 h-3" />} label="기분" value={mood} />}
          {energy != null && <StateChip icon={<Battery className="w-3 h-3" />} label="에너지" value={energy} />}
          {clarity != null && <StateChip icon={<Compass className="w-3 h-3" />} label="명료도" value={clarity} />}
        </div>
      )}

      {loading && !decision ? (
        <div className="h-20 flex items-center text-sm text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin mr-2" /> 오늘 당신에게 필요한 한 가지를 고르는 중…
        </div>
      ) : decision ? (
        <>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-[11px] text-slate-400">당신을 위해 결정했습니다</p>
              <span
                className={[
                  "inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                  crisis
                    ? "bg-rose-100 text-rose-700"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-100",
                ].join(" ")}
              >
                <ConfidenceDots level={confidence} crisis={crisis} />
                신뢰도 {confidenceLabel}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug break-keep">
              {decision.label}
            </h3>
            <div
              className={[
                "flex items-start gap-2 rounded-2xl px-4 py-3",
                crisis ? "bg-rose-50 border border-rose-100" : "bg-white border border-[#C8B88A]/25",
              ].join(" ")}
            >
              <Lightbulb className={`w-4 h-4 mt-0.5 shrink-0 ${crisis ? "text-rose-500" : "text-[#8a7a4d]"}`} />
              <p className="text-sm text-slate-700 leading-relaxed break-keep">{decision.reason}</p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => navigate(decision.route)}
              className={[
                "w-full h-12 rounded-2xl text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors",
                crisis
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-slate-900 hover:bg-slate-800 text-white",
              ].join(" ")}
            >
              바로 실행 <ArrowRight className="w-4 h-4" />
            </button>
            {!crisis && (
              <button
                onClick={() => navigate(ALT_ROUTE)}
                className="w-full h-10 rounded-2xl text-xs font-medium text-slate-600 hover:text-slate-900 inline-flex items-center justify-center gap-1.5 border border-slate-200 hover:border-slate-300 bg-white"
              >
                <Shuffle className="w-3.5 h-3.5" />
                다른 선택지 보기
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="h-16 flex items-center text-sm text-slate-400">추천을 불러오지 못했어요.</div>
      )}
    </div>
  );
}

function StateChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  const tone =
    value <= 3
      ? "bg-rose-50 text-rose-700 border-rose-100"
      : value <= 6
      ? "bg-amber-50 text-amber-700 border-amber-100"
      : "bg-emerald-50 text-emerald-700 border-emerald-100";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full border ${tone}`}
    >
      {icon}
      {label} {value}
    </span>
  );
}

function ConfidenceDots({ level, crisis }: { level: number; crisis: boolean }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={[
            "w-1 h-1 rounded-full",
            i <= level
              ? crisis
                ? "bg-rose-600"
                : "bg-emerald-600"
              : "bg-slate-300",
          ].join(" ")}
        />
      ))}
    </span>
  );
}
