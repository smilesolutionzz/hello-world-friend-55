/**
 * 3일 무료체험 인테이크 퍼널 (이탈 방지)
 * 5단계: Welcome → Concern → AI Polish → Day1-3 Preview → Email Subscribe
 *
 * 진입: /mind-track/start?intake=1 (&from=check&area=&audience=&age=&score=)
 * 출구: /mind-track/dashboard?welcome=1
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Mail,
  CheckCircle2,
  Heart,
  Wand2,
  Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type Audience = "child" | "parent" | "adult" | "teen";

interface Mission {
  day_number: number;
  mission_title: string;
  mission_description: string;
  estimated_minutes: number | null;
  action_steps: string[];
  why_it_matters: string | null;
}

interface Props {
  enrollment: any;
  audience: Audience;
  area: string;
  age?: string | null;
  score?: number | null;
}

const AREA_SEEDS: Record<string, Record<Audience, string>> = {
  language: {
    child: "아이가 또래보다 말이 늦은 것 같아 매일 걱정이 돼요.",
    parent: "아이의 언어 발달을 어떻게 도와줘야 할지 막막해요.",
    adult: "요즘 말이 잘 안 나오고 머리가 멍한 느낌이 자주 들어요.",
    teen: "수업 발표나 친구와의 대화가 너무 부담스러워요.",
  },
  emotion: {
    child: "아이가 감정이 폭발하는 순간을 어떻게 다뤄야 할지 모르겠어요.",
    parent: "아이의 감정을 받아주려다 제 마음이 먼저 무너져요.",
    adult: "사소한 일에도 감정 기복이 너무 커서 일상이 흔들려요.",
    teen: "기분이 자주 가라앉고 별일 아닌데도 눈물이 나요.",
  },
  social: {
    child: "아이가 친구 사귀는 걸 힘들어해서 마음이 쓰여요.",
    parent: "아이의 친구 관계를 어디까지 개입해야 할지 모르겠어요.",
    adult: "사람들과의 관계에서 늘 거리감을 느껴요.",
    teen: "친구들 사이에서 자꾸 눈치를 보게 돼요.",
  },
  focus: {
    child: "아이가 한 가지 일에 5분도 집중하지 못해요.",
    parent: "아이 공부 봐주는 시간이 매일 전쟁이에요.",
    adult: "해야 할 일이 산더미인데 자꾸 미루게 돼요.",
    teen: "공부할 때 집중이 안 돼서 시간만 흘러가요.",
  },
};

function seedConcernFor(area: string, audience: Audience): string {
  return AREA_SEEDS[area]?.[audience] ?? "";
}

export default function MindTrackIntakeFlow({ enrollment, audience, area, age, score }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [concern, setConcern] = useState(() => seedConcernFor(area, audience));
  const [polished, setPolished] = useState<string>("");
  const [polishLoading, setPolishLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const initRanRef = useRef(false);

  // Prefill email from auth
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user?.email) setEmail(data.user.email);
    })();
  }, []);

  const audienceLabel = useMemo(() => {
    return { child: "자녀", parent: "부모", adult: "성인", teen: "청소년" }[audience] ?? "";
  }, [audience]);

  // --------- Step actions ---------

  const goNext = () => setStep((s) => Math.min(4, (s + 1) as any));
  const goBack = () => setStep((s) => Math.max(0, (s - 1) as any));

  const handlePolish = async () => {
    if (!concern.trim()) {
      toast.error("고민을 한 줄 적어주세요");
      return;
    }
    setPolishLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mind-track-concern-polish", {
        body: { concern },
      });
      if (error) throw error;
      if (data?.polished) {
        setPolished(data.polished);
      } else {
        setPolished(concern);
      }
      goNext();
    } catch (e: any) {
      // 다듬기 실패해도 막지 않음 — 원문으로 진행
      console.warn("polish failed", e);
      setPolished(concern);
      goNext();
    } finally {
      setPolishLoading(false);
    }
  };

  const handleInit = async () => {
    if (initRanRef.current) {
      goNext();
      return;
    }
    setInitLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const baseline = (enrollment.baseline_data ?? {}) as Record<string, any>;
      const stress = typeof baseline.stress_score === "number" ? baseline.stress_score : 55;
      const energy = typeof baseline.energy_score === "number" ? baseline.energy_score : 50;
      const clarity = typeof baseline.clarity_score === "number" ? baseline.clarity_score : 50;

      const { data, error } = await supabase.functions.invoke("mind-track-init", {
        headers: { Authorization: `Bearer ${session.session?.access_token}` },
        body: {
          enrollmentId: enrollment.id,
          mode: "quick",
          goalFocus: enrollment.goal_focus,
          stressScore: stress,
          energyScore: energy,
          clarityScore: clarity,
          primaryConcern: polished || concern,
          rawResponses: { source: "intake_funnel", area, audience, age, score, concern, polished },
        },
      });
      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || "초기 워크북 생성 실패");
      }
      initRanRef.current = true;

      // Fetch the just-created Day 1-3 missions to preview
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: rows } = await supabase
          .from("mind_track_daily_missions")
          .select("day_number, mission_title, mission_description, estimated_minutes, action_steps, why_it_matters")
          .eq("user_id", user.id)
          .eq("enrollment_id", enrollment.id)
          .lte("day_number", 3)
          .order("day_number", { ascending: true });
        if (rows && rows.length > 0) {
          setMissions(
            rows.map((r: any) => ({
              day_number: r.day_number,
              mission_title: r.mission_title,
              mission_description: r.mission_description,
              estimated_minutes: r.estimated_minutes,
              action_steps: Array.isArray(r.action_steps) ? r.action_steps : [],
              why_it_matters: r.why_it_matters,
            }))
          );
        }
      }
      goNext();
    } catch (e: any) {
      toast.error(e.message || "워크북 생성 중 오류가 발생했어요");
    } finally {
      setInitLoading(false);
    }
  };

  const handleSubscribeAndFinish = async () => {
    setSubscribeLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요해요");

      if (emailOptIn) {
        // upsert coaching goal (one per user/category)
        const goalCategory = enrollment.goal_focus || "stress";
        const { data: existing } = await supabase
          .from("user_coaching_goals")
          .select("id")
          .eq("user_id", user.id)
          .eq("goal_category", goalCategory)
          .maybeSingle();

        const payload: any = {
          user_id: user.id,
          goal_category: goalCategory,
          goal_description: polished || concern,
          target_age_group: age || null,
          daily_email_opt_in: true,
          is_active: true,
          total_days: 7,
          preferred_send_hour: 8,
        };
        if (existing?.id) {
          await supabase.from("user_coaching_goals").update(payload).eq("id", existing.id);
        } else {
          await supabase.from("user_coaching_goals").insert(payload);
        }

        // Fire-and-forget welcome email — do not block UX if it fails.
        supabase.functions
          .invoke("send-daily-coaching-email", {
            body: { test_user_id: user.id, test_day: 1 },
          })
          .then(() => toast.success("첫 코칭 메일을 보냈어요. 받은 편지함을 확인해 보세요."))
          .catch((e) => {
            console.warn("welcome email failed (non-blocking)", e);
          });
      }

      navigate("/mind-track/dashboard?welcome=1");
    } catch (e: any) {
      toast.error(e.message || "구독 처리 중 오류가 발생했어요");
    } finally {
      setSubscribeLoading(false);
    }
  };

  // --------- UI ---------

  return (
    <div className="max-w-xl mx-auto px-4 pt-20 pb-24">
      {/* Stepper */}
      <div className="flex items-center gap-1.5 mb-6">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i <= step ? "bg-[#1a1a1a]" : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0 — Welcome */}
        {step === 0 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            <Badge className="bg-[#FBF8F1] text-[#8a7a4d] border-[#C8B88A]/40">
              <Sparkles className="w-3 h-3 mr-1" /> 3일 무료 체험 시작
            </Badge>
            <h1 className="text-3xl font-bold text-slate-900 break-keep leading-tight">
              당신을 위한
              <br />첫 3일을 짜드릴게요
            </h1>
            <p className="text-slate-600 break-keep leading-relaxed">
              짧게 고민을 적어주시면 AI 코치가 한 번 다듬어 보고,
              <br /> 그 자리에서 오늘·내일·모레 미션 3개를 만들어 드려요.
              <br /> 매일 아침에는 그날의 미션과 도움 영상을 이메일로 보내드립니다.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-2">
              <MiniStep icon={<Heart className="w-4 h-4" />} label="고민 적기" />
              <MiniStep icon={<Wand2 className="w-4 h-4" />} label="AI 다듬기" />
              <MiniStep icon={<Calendar className="w-4 h-4" />} label="Day 1-3" />
            </div>
            <Button onClick={goNext} className="w-full h-12 rounded-xl">
              시작하기 <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* Step 1 — Concern */}
        {step === 1 && (
          <motion.div
            key="concern"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-5"
          >
            <div>
              <p className="text-xs tracking-widest font-semibold text-[#8a7a4d] mb-2">01 · CONCERN</p>
              <h2 className="text-2xl font-bold text-slate-900 break-keep leading-snug">
                지금 가장 마음에 걸리는
                <br />한 가지를 알려주세요
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                완벽한 문장이 아니어도 괜찮아요. 한두 줄이면 충분합니다.
              </p>
            </div>
            <Textarea
              value={concern}
              onChange={(e) => setConcern(e.target.value.slice(0, 500))}
              placeholder={`예: ${audienceLabel} ${seedConcernFor(area, audience) || "요즘 마음이 자꾸 무거워요."}`}
              rows={5}
              className="resize-none rounded-2xl border-slate-200 text-base leading-relaxed"
            />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{concern.length}/500</span>
              <span>비공개 · 본인만 볼 수 있어요</span>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={goBack} className="rounded-xl">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={handlePolish}
                disabled={polishLoading || concern.trim().length < 2}
                className="flex-1 h-12 rounded-xl"
              >
                {polishLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> 다듬는 중…
                  </>
                ) : (
                  <>
                    AI로 다듬기 <Wand2 className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2 — AI Polish result */}
        {step === 2 && (
          <motion.div
            key="polish"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-5"
          >
            <div>
              <p className="text-xs tracking-widest font-semibold text-[#8a7a4d] mb-2">02 · AI EXPAND</p>
              <h2 className="text-2xl font-bold text-slate-900 break-keep leading-snug">
                이렇게 정리해 봤어요
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                이 문장을 바탕으로 Day 1-3 미션을 설계할게요. 어색하면 다시 다듬을 수 있어요.
              </p>
            </div>
            <Card className="p-5 rounded-2xl border border-[#C8B88A]/30 bg-[#FBF8F1]">
              <p className="text-[15px] leading-relaxed text-slate-800 whitespace-pre-line">
                {polished || concern}
              </p>
            </Card>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl">
                다시 적기
              </Button>
              <Button
                onClick={handleInit}
                disabled={initLoading}
                className="flex-1 h-12 rounded-xl"
              >
                {initLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> 미션 만드는 중…
                  </>
                ) : (
                  <>
                    Day 1-3 미션 받기 <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3 — Day 1-3 Preview */}
        {step === 3 && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-5"
          >
            <div>
              <p className="text-xs tracking-widest font-semibold text-[#8a7a4d] mb-2">03 · YOUR FIRST 3 DAYS</p>
              <h2 className="text-2xl font-bold text-slate-900 break-keep leading-snug">
                당신을 위한
                <br />Day 1·2·3 미션
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                각 미션은 5~10분이면 충분해요. 매일 아침 메일로도 다시 받게 됩니다.
              </p>
            </div>

            <div className="space-y-3">
              {(missions.length > 0
                ? missions
                : [
                    {
                      day_number: 1,
                      mission_title: "오늘의 마음 한 줄 기록",
                      mission_description:
                        "지금 떠오르는 감정 한 가지를 30초 동안 적어보세요.",
                      estimated_minutes: 5,
                      action_steps: ["조용한 자리 찾기", "감정 한 단어 적기", "왜 그런지 한 줄 덧붙이기"],
                      why_it_matters: "감정을 글로 옮기는 순간 거리감이 생겨요.",
                    },
                    {
                      day_number: 2,
                      mission_title: "5분 호흡 리셋",
                      mission_description: "5분 동안 들숨 4·날숨 6으로 호흡을 정돈해요.",
                      estimated_minutes: 5,
                      action_steps: ["타이머 5분", "코로 들숨 4초", "입으로 날숨 6초"],
                      why_it_matters: "긴 날숨이 자율신경을 진정시켜요.",
                    },
                    {
                      day_number: 3,
                      mission_title: "오늘 잘한 일 3가지",
                      mission_description: "오늘 한 일 중 3가지를 칭찬하듯 적어보세요.",
                      estimated_minutes: 7,
                      action_steps: ["메모장 열기", "사소한 것이라도 3개", "각 1줄 이유 적기"],
                      why_it_matters: "자기 비난 회로를 끊는 가장 빠른 길이에요.",
                    },
                  ]
              ).map((m) => (
                <Card key={m.day_number} className="p-5 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-[#1a1a1a] text-white border-none">Day {m.day_number}</Badge>
                    <span className="text-xs text-slate-400">{m.estimated_minutes ?? 5}분</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-[15px] mb-1.5 break-keep">
                    {m.mission_title}
                  </h3>
                  <p className="text-[13px] text-slate-600 leading-relaxed mb-3 break-keep">
                    {m.mission_description}
                  </p>
                  {m.action_steps && m.action_steps.length > 0 && (
                    <div className="space-y-1.5 pt-3 border-t border-slate-100">
                      {m.action_steps.slice(0, 4).map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-[13px] text-slate-700">
                          <span className="w-5 h-5 rounded-full bg-[#FBF8F1] text-[#8a7a4d] text-[11px] font-bold flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <span className="break-keep">{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            <Button onClick={goNext} className="w-full h-12 rounded-xl">
              이메일로 매일 받기 <Mail className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* Step 4 — Email Subscribe */}
        {step === 4 && (
          <motion.div
            key="email"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-5"
          >
            <div>
              <p className="text-xs tracking-widest font-semibold text-[#8a7a4d] mb-2">04 · DAILY EMAIL</p>
              <h2 className="text-2xl font-bold text-slate-900 break-keep leading-snug">
                매일 아침 8시,
                <br />그날 미션을 보내드릴게요
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                오늘의 미션 카드 + 관련 도움 영상 1편을 메일 한 통으로 받게 됩니다.
              </p>
            </div>

            <Card className="p-5 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">매일 코칭 메일 받기</p>
                  <p className="text-xs text-slate-500 mt-0.5">언제든 끌 수 있어요</p>
                </div>
                <Switch checked={emailOptIn} onCheckedChange={setEmailOptIn} />
              </div>

              {emailOptIn && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">받을 이메일</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="rounded-xl"
                    disabled
                  />
                  <p className="text-[11px] text-slate-400">
                    로그인 계정 메일로 보내드려요. 변경은 설정에서 가능합니다.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 text-[12px] text-slate-500 pt-2 border-t border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>구독 즉시 Day 1 미션 메일이 한 통 발송돼요.</span>
              </div>
            </Card>

            <Button
              onClick={handleSubscribeAndFinish}
              disabled={subscribeLoading}
              className="w-full h-12 rounded-xl"
            >
              {subscribeLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> 준비 중…
                </>
              ) : emailOptIn ? (
                <>
                  구독하고 대시보드로 <ArrowRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  메일 없이 진행 <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
            <button
              onClick={() => navigate("/mind-track/dashboard?welcome=1")}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-600 underline-offset-4 hover:underline"
            >
              나중에 설정할게요
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MiniStep({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 flex flex-col items-center gap-1">
      <div className="text-[#8a7a4d]">{icon}</div>
      <span className="text-[11px] text-slate-600 font-medium">{label}</span>
    </div>
  );
}
