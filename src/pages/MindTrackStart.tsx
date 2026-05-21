import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Loader2, Brain, Zap, Eye, Clock, Sparkles, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SEOHead from "@/components/common/SEOHead";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { useSmartBack } from "@/hooks/useSmartBack";
import MindTrackIntakeFlow from "@/components/mind-track/MindTrackIntakeFlow";

type Mode = "quick" | "precise" | null;


const QUICK_QUESTIONS = [
  { id: "stress_1", axis: "stress", text: "지난 한 주, 마음이 무거웠나요?" },
  { id: "stress_2", axis: "stress", text: "사소한 일에도 긴장하거나 짜증이 났나요?" },
  { id: "stress_3", axis: "stress", text: "잠에 들거나 깊게 자기 어려웠나요?" },
  { id: "energy_1", axis: "energy", text: "아침에 일어났을 때 개운한 느낌이 있었나요?", reverse: true },
  { id: "energy_2", axis: "energy", text: "하고 싶은 일을 시작할 힘이 있었나요?", reverse: true },
  { id: "energy_3", axis: "energy", text: "가까운 사람과 시간을 보낼 여유가 있었나요?", reverse: true },
  { id: "clarity_1", axis: "clarity", text: "내가 뭘 원하는지 분명하게 느꼈나요?", reverse: true },
  { id: "clarity_2", axis: "clarity", text: "중요한 일에 집중할 수 있었나요?", reverse: true },
  { id: "clarity_3", axis: "clarity", text: "감정에 휩쓸리지 않고 결정할 수 있었나요?", reverse: true },
  { id: "concern", axis: "concern", text: "지금 가장 신경 쓰이는 한 가지를 짧게 적어주세요." },
];

const SCALE_LABELS = ["전혀 아니에요", "거의 아니에요", "가끔 그래요", "자주 그래요", "거의 항상 그래요"];

export default function MindTrackStart() {
  const navigate = useNavigate();
  const goBack = useSmartBack('/mind-track');
  const [mode, setMode] = useState<Mode>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [concern, setConcern] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth?redirect=/mind-track/start");
        return;
      }
      // Find latest active enrollment (paid OR 3-day trial) without workbook
      const { data: enrollments } = await supabase
        .from("mind_track_enrollments")
        .select("*")
        .eq("user_id", user.id)
        .in("payment_status", ["completed", "paid", "trial"])
        .in("status", ["active", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (!enrollments || enrollments.length === 0) {
        toast.error("진행 중인 트랙이 없어요. 3일 무료 체험부터 시작해 주세요.");
        navigate("/mind-track");
        return;
      }


      // Pick the one without a workbook yet
      const { data: workbooks } = await supabase
        .from("mind_track_workbooks")
        .select("enrollment_id")
        .in("enrollment_id", enrollments.map((e) => e.id));
      const workbookIds = new Set((workbooks ?? []).map((w) => w.enrollment_id));
      const target = enrollments.find((e) => !workbookIds.has(e.id));

      if (!target) {
        // All have workbooks already - go to the latest workbook
        navigate("/mind-track/workbook");
        return;
      }
      setEnrollment(target);

      // 🚀 Skip the 12-question diagnostic if Quiz already provided baseline scores.
      const baseline = (target.baseline_data ?? {}) as Record<string, any>;
      const hasSeed =
        typeof baseline.stress_score === "number" &&
        typeof baseline.energy_score === "number" &&
        typeof baseline.clarity_score === "number";
      if (hasSeed) {
        await runInitFromSeed(target, baseline);
      }
    })();
  }, [navigate]);

  // Direct init when Quiz baseline data is already present.
  const runInitFromSeed = async (target: any, baseline: Record<string, any>) => {
    setSubmitting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("mind-track-init", {
        headers: { Authorization: `Bearer ${session.session?.access_token}` },
        body: {
          enrollmentId: target.id,
          mode: "quick",
          goalFocus: target.goal_focus,
          stressScore: baseline.stress_score,
          energyScore: baseline.energy_score,
          clarityScore: baseline.clarity_score,
          primaryConcern: baseline.primary_concern || null,
          rawResponses: { source: "quiz_seed", ...baseline },
        },
      });
      if (error || !data?.success) throw new Error(data?.error || error?.message || "워크북 생성 실패");
      toast.success("Quiz 답변으로 워크북을 바로 만들었어요!");
      navigate("/mind-track/workbook?welcome=1");
    } catch (e: any) {
      // If auto-init fails, fall back to manual diagnostic UI (don't block user).
      console.warn("auto-init failed, showing manual flow", e);
      toast.error(e.message || "자동 시작에 실패했어요. 직접 진행해주세요.");
      setSubmitting(false);
    }
  };

  const questions = QUICK_QUESTIONS;
  const totalSteps = mode === "quick" ? questions.length : 3; // precise = 3 separate scores
  const progress = mode ? ((step + 1) / totalSteps) * 100 : 0;

  const submit = async () => {
    if (!enrollment) return;
    setSubmitting(true);
    try {
      let stressScore = 50, energyScore = 50, clarityScore = 50;

      if (mode === "quick") {
        // Convert 0-4 → 0-100, average per axis (reverse for energy/clarity)
        const score = (axis: string) => {
          const items = questions.filter((q) => q.axis === axis);
          if (items.length === 0) return 50;
          const sum = items.reduce((acc, q) => {
            const v = responses[q.id] ?? 2;
            const norm = q.reverse ? (4 - v) : v;
            return acc + (norm / 4) * 100;
          }, 0);
          return Math.round(sum / items.length);
        };
        stressScore = score("stress");
        energyScore = 100 - score("energy"); // higher = more energy
        clarityScore = 100 - score("clarity");
      } else {
        stressScore = responses["stress"] ?? 50;
        energyScore = responses["energy"] ?? 50;
        clarityScore = responses["clarity"] ?? 50;
      }

      const { data: session } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("mind-track-init", {
        headers: { Authorization: `Bearer ${session.session?.access_token}` },
        body: {
          enrollmentId: enrollment.id,
          mode,
          goalFocus: enrollment.goal_focus,
          stressScore,
          energyScore,
          clarityScore,
          primaryConcern: concern || null,
          rawResponses: responses,
        },
      });
      if (error || !data?.success) throw new Error(data?.error || error?.message || "초기 진단 처리 실패");
      toast.success("초기 리포트와 맞춤 워크북이 준비됐어요!");
      const sp = new URLSearchParams(window.location.search);
      const welcome = sp.get("welcome");
      navigate(welcome ? "/mind-track/workbook?welcome=1" : "/mind-track/workbook");
    } catch (e: any) {
      toast.error(e.message || "오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  if (!enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SEOHead title="초기 진단 · 마음 트랙" description="결제 직후 받는 5분 초기 진단으로 나만의 워크북을 만들어요." />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30">
        <UnifiedNavigation />
        <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
          {!mode && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="text-center space-y-3">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                  <Sparkles className="w-3 h-3 mr-1" /> 결제 완료 · 1단계
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 break-keep">
                  지금 마음 상태를 짧게 알려주세요
                </h1>
                <p className="text-slate-600 break-keep">
                  이 데이터로 맞춤 워크북과 매일 미션이 만들어져요. 어떤 방식으로 시작할까요?
                </p>
              </div>

              <div className="grid gap-4">
                <Card
                  className="p-5 cursor-pointer hover:shadow-lg hover:border-primary/50 border-2 transition-all"
                  onClick={() => setMode("quick")}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900">간편 모드</h3>
                        <Badge variant="secondary" className="text-[10px]">3분 · 추천</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mt-1 break-keep">
                        한 화면에서 10문항으로 스트레스 · 에너지 · 명료성 3가지 지표를 한 번에 측정합니다.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className="p-5 cursor-pointer hover:shadow-lg hover:border-primary/50 border-2 transition-all"
                  onClick={() => {
                    setMode("precise");
                    setResponses({ stress: 50, energy: 50, clarity: 50 });
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center shrink-0">
                      <Brain className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900">정밀 모드</h3>
                        <Badge variant="secondary" className="text-[10px]">5분</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mt-1 break-keep">
                        3개 영역(스트레스 · 에너지 · 명료성)을 직접 슬라이더로 정밀하게 측정합니다.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-2">
                <ShieldCheck className="w-3.5 h-3.5" /> 기록은 본인만 볼 수 있어요
              </div>
            </motion.div>
          )}

          {mode === "quick" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                  <span>간편 모드</span>
                  <span>{step + 1} / {questions.length}</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-5 break-keep leading-snug">
                      {questions[step].text}
                    </h3>

                    {questions[step].axis === "concern" ? (
                      <Textarea
                        value={concern}
                        onChange={(e) => setConcern(e.target.value)}
                        placeholder="예: 요즘 아이 등원 문제로 매일 아침이 전쟁 같아요…"
                        rows={4}
                        className="resize-none"
                      />
                    ) : (
                      <div className="space-y-2">
                        {SCALE_LABELS.map((label, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setResponses((prev) => ({ ...prev, [questions[step].id]: idx }));
                              if (step < questions.length - 1) {
                                setTimeout(() => setStep((s) => s + 1), 200);
                              }
                            }}
                            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                              responses[questions[step].id] === idx
                                ? "border-primary bg-primary/5 text-slate-900"
                                : "border-slate-200 hover:border-slate-300 text-slate-700"
                            }`}
                          >
                            <span className="text-sm font-medium">{label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </Card>
                </motion.div>
              </AnimatePresence>

              <div className="flex gap-2">
                {step > 0 && (
                  <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1">
                    이전
                  </Button>
                )}
                {step < questions.length - 1 ? (
                  <Button
                    onClick={() => setStep((s) => s + 1)}
                    className="flex-1"
                    disabled={questions[step].axis !== "concern" && responses[questions[step].id] === undefined}
                  >
                    다음 <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={submit} disabled={submitting} className="flex-1 bg-gradient-to-r from-primary to-purple-600">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    워크북 만들기
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {mode === "precise" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Card className="p-6 space-y-6">
                <h3 className="text-lg font-bold text-slate-900 break-keep">3개 지표를 직접 평가해주세요</h3>

                {[
                  { key: "stress", icon: Brain, label: "스트레스 정도", color: "from-rose-500 to-pink-500", help: "0=전혀 없음, 100=극심함" },
                  { key: "energy", icon: Zap, label: "에너지·활력", color: "from-amber-500 to-orange-500", help: "0=완전 소진, 100=최상" },
                  { key: "clarity", icon: Eye, label: "마음의 명료성", color: "from-blue-500 to-cyan-500", help: "0=혼란스러움, 100=또렷함" },
                ].map(({ key, icon: Icon, label, color, help }) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} text-white flex items-center justify-center`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-900">{label}</span>
                      </div>
                      <span className="text-2xl font-bold text-slate-900 tabular-nums">{responses[key] ?? 50}</span>
                    </div>
                    <Slider
                      value={[responses[key] ?? 50]}
                      onValueChange={(v) => setResponses((prev) => ({ ...prev, [key]: v[0] }))}
                      min={0}
                      max={100}
                      step={1}
                    />
                    <p className="text-xs text-slate-500">{help}</p>
                  </div>
                ))}

                <div className="space-y-2 pt-2 border-t">
                  <label className="text-sm font-medium text-slate-700">지금 가장 신경 쓰이는 한 가지</label>
                  <Textarea
                    value={concern}
                    onChange={(e) => setConcern(e.target.value)}
                    placeholder="짧게 적어주세요"
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </Card>

              <Button onClick={submit} disabled={submitting} className="w-full h-12 bg-gradient-to-r from-primary to-purple-600">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                워크북 만들기 →
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
