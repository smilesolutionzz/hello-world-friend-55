import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Heart,
  TrendingDown,
  CheckCircle2,
  Calendar,
  Wand2,
  Phone,
  History,
  ArrowRight,
  LogIn,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// --- 5문항 자가체크 정의 ---
type QId = "communication" | "social" | "motor" | "cognitive" | "emotion";
interface Question {
  id: QId;
  label: string;
  desc: string;
}
const QUESTIONS: Question[] = [
  { id: "communication", label: "언어·표현", desc: "또래에 비해 말하기/듣기 발달이 걱정되는 정도" },
  { id: "social", label: "사회성·또래관계", desc: "친구·가족과 어울리는 방식이 걱정되는 정도" },
  { id: "motor", label: "운동·신체", desc: "대근육·소근육 발달이 또래보다 늦어 보이는 정도" },
  { id: "cognitive", label: "인지·집중", desc: "이해·집중·기억력에 대한 걱정 정도" },
  { id: "emotion", label: "정서·자기조절", desc: "감정 폭발·짜증·예민함에 대한 걱정 정도" },
];

// 0(전혀 걱정 없음) ~ 4(매우 걱정됨)
const SCALE_LABELS = ["전혀 없음", "거의 없음", "보통", "꽤 있음", "매우 큼"];

interface Responses {
  communication: number;
  social: number;
  motor: number;
  cognitive: number;
  emotion: number;
}

type RiskLevel = "low" | "medium" | "high";

const BASE_PLAN: { day: number; title: string; action: string; factor?: QId }[] = [
  { day: 1, title: "오늘의 출발선", action: "아이와 10분 눈맞춤 놀이를 합니다." },
  { day: 2, title: "언어 자극", action: "그림책 1권을 천천히 함께 읽고 한 단어를 따라 말해봅니다.", factor: "communication" },
  { day: 3, title: "사회성 연습", action: "가족 중 한 명과 차례 주고받기 놀이를 5분 합니다.", factor: "social" },
  { day: 4, title: "신체 활동", action: "공놀이·점프 등 큰 근육을 쓰는 놀이를 15분 합니다.", factor: "motor" },
  { day: 5, title: "집중 워밍업", action: "퍼즐·블록 등 5분 집중 놀이로 마무리감을 경험시킵니다.", factor: "cognitive" },
  { day: 6, title: "감정 라벨링", action: "오늘 아이의 감정 한 가지를 함께 이름 붙여줍니다.", factor: "emotion" },
  { day: 7, title: "한 주 돌아보기", action: "이번 주 가장 좋았던 순간 한 장면을 함께 떠올립니다." },
];

function computeScore(r: Responses): number {
  // 0~20 -> 0~100
  const sum = r.communication + r.social + r.motor + r.cognitive + r.emotion;
  return Math.round((sum / 20) * 100);
}

function riskOf(score: number): RiskLevel {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function topFactorsOf(r: Responses): { id: QId; label: string; value: number }[] {
  return QUESTIONS.map((q) => ({ id: q.id, label: q.label, value: r[q.id] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
}

const RISK_META: Record<RiskLevel, {
  label: string;
  desc: string;
  icon: any;
  cls: string;
  badge: string;
}> = {
  low: {
    label: "낮음",
    desc: "현재는 걱정 신호가 적은 편입니다. 일상 코칭을 유지하세요.",
    icon: ShieldCheck,
    cls: "text-emerald-700 bg-emerald-50 border-emerald-200",
    badge: "bg-emerald-500",
  },
  medium: {
    label: "주의",
    desc: "일부 영역에서 걱정 신호가 있어요. 7일 코칭으로 관찰을 시작해보세요.",
    icon: AlertTriangle,
    cls: "text-amber-700 bg-amber-50 border-amber-200",
    badge: "bg-amber-500",
  },
  high: {
    label: "높음",
    desc: "여러 영역에서 걱정이 큽니다. 7일 플랜과 함께 전문가 상담을 고려해보세요.",
    icon: AlertCircle,
    cls: "text-rose-700 bg-rose-50 border-rose-200",
    badge: "bg-rose-500",
  },
};

interface SnapshotMetric {
  label: string;
  value: number;
  color: string;
}

export default function ChildDevConcernSection() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "result">("form");
  const [ageMonths, setAgeMonths] = useState<string>("");
  const [responses, setResponses] = useState<Responses>({
    communication: 2,
    social: 2,
    motor: 2,
    cognitive: 2,
    emotion: 2,
  });
  const [userContext, setUserContext] = useState("");
  const [explainOpen, setExplainOpen] = useState(false);
  const [tuning, setTuning] = useState(false);
  const [tunedActions, setTunedActions] = useState<Record<number, string>>({});
  const [interpretation, setInterpretation] = useState<string>("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [aiAssisting, setAiAssisting] = useState(false);
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const loadHistory = async (uid: string) => {
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from("child_dev_concern_results")
        .select("id, created_at, score, risk_level, child_age_months, top_factors, interpretation, responses, seven_day_plan")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      setHistory(data ?? []);
    } catch (e: any) {
      console.warn("history load failed", e?.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthed(!!user);
      if (user) loadHistory(user.id);
    })();
  }, []);


  const handleAiAssist = async () => {
    if (aiAssisting) return;
    setAiAssisting(true);
    try {
      // 자가체크 응답을 짧은 시드 문장으로 변환
      const topConcerns = QUESTIONS
        .filter((q) => responses[q.id] >= 3)
        .map((q) => q.label);
      const seed = userContext.trim().length >= 5
        ? userContext.trim()
        : `아이 발달이 걱정돼요.${
            topConcerns.length ? ` 특히 ${topConcerns.join(", ")} 부분이 신경 쓰여요.` : ""
          }`;
      const prompt = seed.length >= 10 ? seed : seed + " 또래보다 늦은 것 같아요.";

      const { data, error } = await supabase.functions.invoke("expand-prompt", {
        body: { prompt, language: "ko" },
      });
      if (error) throw error;
      const expanded = (data?.expandedPrompt || "").slice(0, 500);
      if (!expanded) throw new Error("AI가 작성을 도와주지 못했어요.");
      setUserContext(expanded);
      toast.success("AI가 걱정되는 점을 정리했어요. 자유롭게 수정해도 돼요.");
    } catch (e: any) {
      console.error("AI assist error", e);
      toast.error(e?.message || "AI 작성 도움에 실패했어요.");
    } finally {
      setAiAssisting(false);
    }
  };

  // 비교 차트용 가짜 비교 지표 (실 사용자 다른 트랙 데이터가 있으면 차후 연동)
  const score = useMemo(() => computeScore(responses), [responses]);
  const risk = useMemo(() => riskOf(score), [score]);
  const factors = useMemo(() => topFactorsOf(responses), [responses]);

  const compareMetrics: SnapshotMetric[] = useMemo(
    () => [
      { label: "아이 발달 걱정도", value: score, color: "bg-violet-500" },
      // 다른 트랙 평균(시뮬레이션 — 실 사용자 데이터로 추후 대체)
      { label: "스트레스 지수", value: Math.min(100, Math.round(score * 0.85 + 10)), color: "bg-rose-400" },
      { label: "수면 부담", value: Math.min(100, Math.round(score * 0.7 + 8)), color: "bg-sky-400" },
      { label: "정서 안정성(역지표)", value: Math.max(0, 100 - score), color: "bg-emerald-500" },
    ],
    [score]
  );

  const handleSubmit = async () => {
    setStep("result");
    // 비로그인이면 결과만 보여주고 저장은 안함
    const { data: { user } } = await supabase.auth.getUser();
    setTuning(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "tune-dev-concern-plan",
        {
          body: {
            childAgeMonths: ageMonths ? Number(ageMonths) : null,
            score,
            riskLevel: risk,
            topFactors: factors.map((f) => f.label),
            userContext,
            basePlan: BASE_PLAN.map((p) => ({
              day: p.day,
              title: p.title,
              action: p.action,
            })),
          },
        }
      );
      if (error) throw error;
      const days = (data as any)?.days ?? [];
      const map: Record<number, string> = {};
      for (const d of days) map[d.day] = d.tunedAction;
      setTunedActions(map);
      setInterpretation((data as any)?.interpretation ?? "");

      if (user) {
        const { data: inserted, error: insErr } = await supabase
          .from("child_dev_concern_results")
          .insert({
            user_id: user.id,
            child_age_months: ageMonths ? Number(ageMonths) : null,
            responses: responses as any,
            score,
            risk_level: risk,
            top_factors: factors as any,
            interpretation: (data as any)?.interpretation ?? null,
            seven_day_plan: BASE_PLAN.map((p) => ({
              ...p,
              tunedAction: map[p.day] ?? p.action,
            })) as any,
          })
          .select("id")
          .single();
        if (insErr) {
          console.warn("save failed:", insErr.message);
          toast.error("결과 저장에 실패했어요. 잠시 후 다시 시도해주세요.");
        } else {
          setSavedId(inserted.id);
          loadHistory(user.id);
        }
      }
    } catch (e: any) {
      console.error(e);
      toast.error("코칭 문구 생성에 실패했어요. 기본 플랜으로 보여드릴게요.");
    } finally {
      setTuning(false);
    }
  };

  const handleLoadPast = (item: any) => {
    setResponses(item.responses as Responses);
    setAgeMonths(item.child_age_months?.toString() ?? "");
    setInterpretation(item.interpretation ?? "");
    const planMap: Record<number, string> = {};
    (item.seven_day_plan ?? []).forEach((p: any) => {
      if (p.tunedAction) planMap[p.day] = p.tunedAction;
    });
    setTunedActions(planMap);
    setSavedId(item.id);
    setStep("result");
    setHistoryOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setStep("form");
    setTunedActions({});
    setInterpretation("");
    setSavedId(null);
  };

  const RiskIcon = RISK_META[risk].icon;

  return (
    <Card className="border-2 border-violet-200/60 bg-gradient-to-br from-white to-violet-50/40">
      <CardContent className="p-5 md:p-7 space-y-5">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-violet-100 text-violet-700">
                <Heart className="w-4 h-4" />
              </div>
              <Badge variant="outline" className="text-[10px] border-violet-300 text-violet-700">
                NEW
              </Badge>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 break-keep">
              아이 발달 걱정도 자가체크
            </h3>
            <p className="text-xs md:text-sm text-slate-600 mt-1 break-keep">
              5문항 + 부모님이 직접 적은 걱정을 반영해 위험도와 7일 코칭 플랜을 만들어드려요.
            </p>
          </div>
          {isAuthed && history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHistoryOpen((o) => !o)}
              className="h-8 text-xs shrink-0"
            >
              <History className="w-3.5 h-3.5 mr-1" />
              지난 기록 {history.length}
              {historyOpen ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
            </Button>
          )}
        </div>

        {/* 지난 기록 패널 */}
        {historyOpen && isAuthed && (
          <div className="rounded-2xl border border-slate-200 bg-white p-3 space-y-2">
            <div className="text-xs font-bold text-slate-700 px-1">최근 자가체크 기록 (최신순)</div>
            {historyLoading ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 p-3">
                <Loader2 className="w-3 h-3 animate-spin" /> 불러오는 중…
              </div>
            ) : (
              <ul className="space-y-1.5">
                {history.map((h) => {
                  const meta = RISK_META[h.risk_level as RiskLevel];
                  return (
                    <li key={h.id}>
                      <button
                        onClick={() => handleLoadPast(h)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:border-violet-300 hover:bg-violet-50/50 transition-colors text-left"
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${meta.badge} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-900">
                            위험도 {meta.label} · {h.score}/100
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(h.created_at).toLocaleString("ko-KR", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {h.child_age_months ? ` · ${h.child_age_months}개월` : ""}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
        {step === "form" ? (
          <div className="space-y-4">
            {/* 개월수 */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                아이 개월수 (선택)
              </label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="예) 36"
                value={ageMonths}
                onChange={(e) => setAgeMonths(e.target.value.slice(0, 3))}
                className="h-9 text-sm"
              />
            </div>

            {/* 5문항 */}
            <div className="space-y-3">
              {QUESTIONS.map((q) => (
                <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{q.label}</div>
                      <div className="text-[11px] text-slate-500 break-keep">{q.desc}</div>
                    </div>
                    <div className="text-[11px] font-semibold text-violet-700 shrink-0">
                      {SCALE_LABELS[responses[q.id]]}
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {[0, 1, 2, 3, 4].map((v) => (
                      <button
                        key={v}
                        onClick={() => setResponses((r) => ({ ...r, [q.id]: v }))}
                        className={`h-8 rounded-md text-xs font-bold transition-all ${
                          responses[q.id] === v
                            ? "bg-violet-600 text-white shadow"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 자유 텍스트 — "현재 가장 걱정되는 점" */}
            <div>
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <label className="text-xs font-semibold text-slate-700">
                  현재 가장 걱정되는 점 (선택, 최대 500자)
                </label>
                <button
                  type="button"
                  onClick={handleAiAssist}
                  disabled={aiAssisting}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-600 hover:text-violet-700 disabled:opacity-60"
                >
                  {aiAssisting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      작성 중…
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3 h-3" />
                      AI 작성 도움
                    </>
                  )}
                </button>
              </div>
              <Textarea
                rows={3}
                maxLength={500}
                placeholder="예) 36개월인데 또래보다 말이 늦어요. 이름을 부르면 가끔 반응이 느려요."
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                className="text-sm resize-none"
              />
              <div className="text-[10px] text-slate-400 text-right mt-1">
                {userContext.length}/500
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full h-11 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              내 위험도와 7일 플랜 보기
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* 위험도 인디케이터 */}
            <div className={`rounded-2xl border-2 p-4 ${RISK_META[risk].cls}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${RISK_META[risk].badge} text-white`}>
                  <RiskIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold opacity-80">위험도</span>
                    <span className="text-xl font-black">{RISK_META[risk].label}</span>
                    <span className="text-xs font-bold ml-auto tabular-nums">
                      {score}/100
                    </span>
                  </div>
                  <p className="text-xs mt-1 break-keep">{RISK_META[risk].desc}</p>
                </div>
              </div>
              <Progress value={score} className="h-2 mt-3 bg-white/60" />
            </div>

            {/* 위험도 '높음' — 전문가 상담 연결 안내 */}
            {risk === "high" && (
              <div className="rounded-2xl border-2 border-rose-300 bg-gradient-to-br from-rose-50 to-orange-50 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-500 text-white shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-rose-900 break-keep">
                      지금은 전문가 상담을 권장드려요
                    </div>
                    <p className="text-xs text-rose-800/90 mt-1 break-keep leading-relaxed">
                      여러 발달 영역에서 걱정 신호가 함께 나타났어요. 자가체크는 진단이 아니므로,
                      면허 전문가(언어·작업·놀이치료, 발달심리)와의 상담으로 정확한 평가를 받아보시는 것이 안전해요.
                    </p>
                  </div>
                </div>
                <div className="bg-white/70 rounded-lg p-2.5 border border-rose-200/60">
                  <div className="text-[11px] font-bold text-rose-900 mb-1.5">먼저 해보면 좋은 행동 3가지</div>
                  <ul className="text-[11px] text-rose-900/90 space-y-1 list-disc pl-4 break-keep">
                    <li>최근 2주 일상 관찰을 메모로 정리해두세요 (놀이·말·잠·식사).</li>
                    <li>아이 영상 1~2분을 촬영해 상담 시 전문가와 함께 보세요.</li>
                    <li>아래 ‘긴급 전문가 매칭’으로 30분 내 자동 배정을 받을 수 있어요.</li>
                  </ul>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    onClick={() => navigate("/expert-hiring?urgent=true")}
                    className="h-10 bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    <AlertTriangle className="w-4 h-4 mr-1.5" />
                    긴급 전문가 매칭
                  </Button>
                  <Button
                    onClick={() => navigate("/expert-hiring")}
                    variant="outline"
                    className="h-10 border-rose-300 text-rose-800 hover:bg-rose-100"
                  >
                    <Phone className="w-4 h-4 mr-1.5" />
                    전문가 목록 둘러보기
                  </Button>
                </div>
              </div>
            )}

            {/* 비교 차트 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-slate-900">
                  지표별 비교
                </div>
                <Badge variant="outline" className="text-[10px]">
                  현재 시점
                </Badge>
              </div>
              <div className="space-y-2.5">
                {compareMetrics.map((m) => (
                  <div key={m.label}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-600 font-medium">{m.label}</span>
                      <span className="text-slate-900 font-bold tabular-nums">
                        {m.value}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${m.color} rounded-full transition-all duration-700`}
                        style={{ width: `${m.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-3 break-keep">
                * 발달 걱정도와 함께 보이는 다른 지표들은 같은 입력 패턴에서 계산된 추정치예요. 실제 트랙 진행 시 자동 갱신됩니다.
              </p>
            </div>

            {/* 설명 패널 */}
            <div className="rounded-2xl border border-slate-200 bg-white">
              <button
                onClick={() => setExplainOpen((o) => !o)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-bold text-slate-900">
                    내 점수가 의미하는 것 · 영향 요인
                  </span>
                </div>
                {explainOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>
              {explainOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-slate-100">
                  <p className="text-xs text-slate-700 mt-3 break-keep leading-relaxed">
                    {interpretation ||
                      "5가지 발달 영역에 대한 부모님의 걱정 정도를 0~100으로 환산한 값입니다. 의료 진단이 아닌, 코칭 시작점을 잡기 위한 셀프 체크예요."}
                  </p>
                  <div>
                    <div className="text-[11px] font-bold text-slate-700 mb-1.5">
                      가장 영향을 준 요인 TOP 3
                    </div>
                    <div className="space-y-1.5">
                      {factors.map((f, i) => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold flex items-center justify-center">
                              {i + 1}
                            </span>
                            <span className="font-semibold text-slate-900">
                              {f.label}
                            </span>
                          </div>
                          <span className="text-slate-500">
                            {SCALE_LABELS[f.value]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 7일 플랜 */}
            <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50/60 to-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-violet-700" />
                  <span className="text-sm font-bold text-slate-900">
                    맞춤 7일 코칭 플랜
                  </span>
                </div>
                {tuning && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-violet-700">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    AI 튜닝 중
                  </span>
                )}
              </div>
              <ol className="space-y-2">
                {BASE_PLAN.map((p) => {
                  const tuned = tunedActions[p.day];
                  return (
                    <li
                      key={p.day}
                      className="flex gap-3 p-2.5 rounded-lg bg-white border border-slate-100"
                    >
                      <div className="w-8 shrink-0 text-center">
                        <div className="text-[10px] text-slate-400">DAY</div>
                        <div className="text-sm font-black text-violet-700">
                          {p.day}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900">
                          {p.title}
                        </div>
                        <div className="text-xs text-slate-600 break-keep mt-0.5">
                          {tuned || p.action}
                        </div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                    </li>
                  );
                })}
              </ol>
              {savedId && (
                <p className="text-[10px] text-emerald-700 mt-3 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 결과가 내 기록에 저장되었어요
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1 h-10"
              >
                다시 체크
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
