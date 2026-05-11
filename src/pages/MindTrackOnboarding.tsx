/**
 * 30일 마음 트랙 온보딩 위저드 — 결제 완료 후 60초 안에 첫 가치 경험까지 데려가는 5단계 흐름.
 * STEP 0 환영 → 1 대상 분기(나/아이/가족) → 1a 닉네임+생일 → 1b/2 페인포인트 → 3 목표 → 4 개인화 생성 → 5 트랙 미리보기
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowRight, ArrowLeft, Sparkles, User, Baby, Users,
  CheckCircle2, Loader2, Calendar, Target, Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PAIN_POINT_OPTIONS, getAgeBucket, getAgeYears, AGE_BUCKET_LABEL } from "@/lib/mindTrackChildMissions";
import { personalizeWithRetry, describePersonalizeError } from "@/lib/personalizeChildMission";

type Audience = "self" | "child" | "family";
type Stage = "welcome" | "audience" | "child_basics" | "pain_points" | "goal" | "personalize" | "preview";

const STAGES: Stage[] = ["welcome", "audience", "child_basics", "pain_points", "goal", "personalize", "preview"];

const ADULT_PAIN_POINTS = [
  "수면", "스트레스", "불안", "우울감", "번아웃",
  "관계 갈등", "집중력", "자존감", "감정 기복", "미루기",
] as const;

function logEvent(stage: Stage, event: string, meta: Record<string, unknown> = {}) {
  // Fire-and-forget; RLS는 본인만 insert
  supabase.auth.getUser().then(({ data }) => {
    const uid = data.user?.id;
    if (!uid) return;
    supabase.from("mind_track_onboarding_events").insert([
      { user_id: uid, stage, event, meta: meta as never },
    ]).then(() => {/* noop */});
  });
}

export default function MindTrackOnboarding() {
  const nav = useNavigate();
  const { toast } = useToast();

  const [stage, setStage] = useState<Stage>("welcome");
  const [audience, setAudience] = useState<Audience | null>(null);
  const [nickname, setNickname] = useState("");
  const [birth, setBirth] = useState("");
  const [pains, setPains] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [childProfileId, setChildProfileId] = useState<string | null>(null);
  const [personalLine, setPersonalLine] = useState<string | null>(null);
  const [personalizeError, setPersonalizeError] = useState<string | null>(null);
  const personalizeRan = useRef(false);

  // Resume — restore stage + form fields from localStorage. Server-side: latest stage_enter event as authoritative source if newer than local.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mt_onboarding_state");
      if (raw) {
        const s = JSON.parse(raw) as Partial<{
          stage: Stage; audience: Audience; nickname: string; birth: string;
          pains: string[]; goal: string; childProfileId: string;
        }>;
        if (s.stage && STAGES.includes(s.stage)) setStage(s.stage);
        if (s.audience) setAudience(s.audience);
        if (s.nickname) setNickname(s.nickname);
        if (s.birth) setBirth(s.birth);
        if (Array.isArray(s.pains)) setPains(s.pains);
        if (s.goal) setGoal(s.goal);
        if (s.childProfileId) setChildProfileId(s.childProfileId);
      }
    } catch { /* ignore */ }

    // Server-side resume — restore furthest stage from event log if user re-enters on a fresh device
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("mind_track_onboarding_events")
        .select("stage, created_at")
        .eq("user_id", user.id)
        .eq("event", "stage_enter")
        .order("created_at", { ascending: false })
        .limit(1);
      const last = (data?.[0] as { stage?: string } | undefined)?.stage as Stage | undefined;
      if (last && STAGES.includes(last)) {
        // 로컬에 더 최근 진행이 없을 때만 서버 값으로 설정
        const localStage = localStorage.getItem("mt_onboarding_stage") as Stage | null;
        if (!localStage) setStage(last);
      }
    })();

    logEvent("welcome", "wizard_open", {});
  }, []);

  // 매 변경마다 진행 상태 저장
  useEffect(() => {
    localStorage.setItem("mt_onboarding_stage", stage);
    localStorage.setItem(
      "mt_onboarding_state",
      JSON.stringify({ stage, audience, nickname, birth, pains, goal, childProfileId }),
    );
    logEvent(stage, "stage_enter", { audience });
  }, [stage, audience, nickname, birth, pains, goal, childProfileId]); // eslint-disable-line react-hooks/exhaustive-deps

  const stageIdx = STAGES.indexOf(stage);
  const progress = Math.round(((stageIdx + 1) / STAGES.length) * 100);

  const ageInfo = useMemo(() => {
    if (!birth) return null;
    try {
      const yrs = getAgeYears(birth);
      const bucket = getAgeBucket(birth);
      return { yrs, bucket, label: AGE_BUCKET_LABEL[bucket] };
    } catch {
      return null;
    }
  }, [birth]);

  const painOptions = audience === "child" ? PAIN_POINT_OPTIONS : ADULT_PAIN_POINTS;

  const togglePain = (p: string) => {
    setPains((prev) => {
      if (prev.includes(p)) return prev.filter((x) => x !== p);
      // 6번째: 가장 오래된 항목을 빼고 새 항목 추가
      return prev.length >= 5 ? [...prev.slice(1), p] : [...prev, p];
    });
  };

  const goNext = () => {
    const i = STAGES.indexOf(stage);
    if (i < 0) return;
    let next: Stage = STAGES[i + 1];
    // self/family branch — child_basics 건너뛰기
    if (next === "child_basics" && audience !== "child") next = "pain_points";
    if (next) setStage(next);
  };
  const goPrev = () => {
    const i = STAGES.indexOf(stage);
    if (i <= 0) return;
    let prev: Stage = STAGES[i - 1];
    if (prev === "child_basics" && audience !== "child") prev = "audience";
    setStage(prev);
  };

  // STEP 1 → 1a/2 검증
  const canLeaveBasics = () => {
    const nick = nickname.trim();
    if (nick.length < 1 || nick.length > 20) {
      toast({ title: "닉네임은 1~20자로 입력해 주세요", variant: "destructive" });
      return false;
    }
    if (audience === "child") {
      if (!birth) { toast({ title: "생년월일을 선택해 주세요", variant: "destructive" }); return false; }
      const bd = new Date(birth);
      if (isNaN(bd.getTime()) || bd.getTime() > Date.now()) {
        toast({ title: "올바른 생년월일을 입력해 주세요", variant: "destructive" });
        return false;
      }
    }
    return true;
  };

  // STEP 4: 페이로드 저장 + 개인화 호출
  const runPersonalize = async () => {
    if (personalizeRan.current) return;
    personalizeRan.current = true;
    setPersonalizeError(null);
    setPersonalLine(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다");

      // 1) 아이 분기는 user_child_profiles에 저장
      let cpid = childProfileId;
      if (audience === "child" && !cpid) {
        const { data: row, error } = await supabase
          .from("user_child_profiles")
          .insert({
            user_id: user.id,
            child_nickname: nickname.trim(),
            birth_date: birth,
            pain_points: pains,
            goal_text: goal.trim() || null,
          })
          .select()
          .single();
        if (error) throw error;
        cpid = (row as { id: string }).id;
        setChildProfileId(cpid);
      }

      logEvent("personalize", "save_profile_done", { audience, painCount: pains.length, hasGoal: !!goal.trim() });

      // 2) Day 1 personal line — 아이 분기에만 edge function 호출
      if (audience === "child" && cpid) {
        const { data, error } = await supabase.functions.invoke("personalize-child-mission", {
          body: { childProfileId: cpid, day: 1, baseMission: "" },
        });
        if (error) throw error;
        const line = (data as { personalLine?: string })?.personalLine;
        if (line) setPersonalLine(line);
      } else {
        // 성인 분기 — 결정론적 한 줄
        const tag = pains[0] ? `‘${pains[0]}’` : "오늘의 마음";
        setPersonalLine(`${nickname.trim()}님, ${tag} 한 가지 신호를 1분만 적어보는 것으로 Day 1을 시작해요.`);
      }

      logEvent("personalize", "personal_line_ready", { audience });
      // 자동 진행
      setTimeout(() => setStage("preview"), 600);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "알 수 없는 오류";
      setPersonalizeError(msg);
      personalizeRan.current = false;
      logEvent("personalize", "personal_line_fail", { error: msg });
    }
  };

  useEffect(() => {
    if (stage === "personalize") runPersonalize();
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const finishToTrack = () => {
    logEvent("preview", "go_to_day1", { audience });
    localStorage.removeItem("mt_onboarding_stage");
    nav("/track-missions?day=1");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 진행률 */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center gap-3">
          <span className="text-[11px] tracking-widest font-semibold text-[#8a7a4d]">
            ONBOARDING · {String(stageIdx + 1).padStart(2, "0")}/{STAGES.length}
          </span>
          <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1a1a1a] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {stage !== "welcome" && stage !== "personalize" && stage !== "preview" && (
            <button onClick={() => nav("/track-missions")} className="text-xs text-slate-400 hover:text-slate-700">
              나중에
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8 md:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
          >
            {stage === "welcome" && (
              <div className="space-y-6 text-center pt-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FBF8EE] border border-[#E7DEC4]">
                  <Sparkles className="w-3.5 h-3.5 text-[#8a7a4d]" />
                  <span className="text-[11px] tracking-widest font-semibold text-[#8a7a4d]">30일 마음 트랙</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight break-keep text-slate-900">
                  결제하신 약속,<br /> 이제 30일을 우리가 책임질게요.
                </h1>
                <p className="text-slate-600 leading-relaxed break-keep">
                  60초 안에 당신만의 트랙을 만들어 드릴게요. 매일 3분, 한 줄 회고로 한 권의 워크북이 완성됩니다.
                </p>
                <Button
                  onClick={goNext}
                  className="bg-[#1a1a1a] text-white hover:bg-black rounded-2xl px-7 py-6 text-base"
                >
                  시작하기 <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {stage === "audience" && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-slate-900 break-keep">누구를 위한 트랙인가요?</h2>
                <p className="text-sm text-slate-500">선택에 따라 검사 세트와 매일 미션이 달라집니다.</p>
                <div className="grid gap-3">
                  {([
                    { key: "self", icon: User, title: "나 자신", desc: "스트레스·수면·번아웃 등 성인 마음 코칭" },
                    { key: "child", icon: Baby, title: "내 아이", desc: "연령별 발달 코칭 — 만 0~18세" },
                    { key: "family", icon: Users, title: "가족 / 배우자", desc: "관계·소통 중심 트랙 (성인 코칭과 동일 흐름)" },
                  ] as const).map(({ key, icon: Icon, title, desc }) => {
                    const active = audience === key;
                    return (
                      <button
                        key={key}
                        onClick={() => { setAudience(key); setPains([]); }}
                        className={`text-left p-5 rounded-2xl border-2 transition ${
                          active ? "border-[#1a1a1a] bg-slate-50" : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-xl bg-[#FBF8EE] flex items-center justify-center">
                            <Icon className="w-5 h-5 text-[#8a7a4d]" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{title}</p>
                            <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
                          </div>
                          {active && <CheckCircle2 className="w-5 h-5 text-[#1a1a1a]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <NavRow onPrev={goPrev} onNext={() => audience && goNext()} nextDisabled={!audience} />
              </div>
            )}

            {stage === "child_basics" && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-slate-900 break-keep">아이를 어떻게 부를까요?</h2>
                <p className="text-sm text-slate-500">별명만 사용합니다. 실명·민감정보는 저장하지 않아요.</p>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label htmlFor="nick">아이 닉네임</Label>
                    <Input id="nick" autoFocus placeholder="예: 민준이, 둘째"
                      value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={20} />
                  </div>
                  <div>
                    <Label htmlFor="bd">생년월일</Label>
                    <Input id="bd" type="date" value={birth}
                      max={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setBirth(e.target.value)} />
                    {ageInfo && (
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FBF8EE] border border-[#E7DEC4]">
                        <Calendar className="w-3.5 h-3.5 text-[#8a7a4d]" />
                        <span className="text-xs text-[#8a7a4d] font-medium">
                          만 {ageInfo.yrs}세 · {ageInfo.label} 트랙
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <NavRow onPrev={goPrev} onNext={() => canLeaveBasics() && goNext()} />
              </div>
            )}

            {stage === "pain_points" && (
              <div className="space-y-5">
                {audience !== "child" && (
                  <div>
                    <Label htmlFor="adult-nick">먼저, 닉네임을 알려주세요</Label>
                    <Input id="adult-nick" autoFocus placeholder="예: 지수, ◯◯의 보호자"
                      value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={20} />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 break-keep">
                    요즘 가장 신경 쓰이는 건 무엇인가요?
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">최대 5개. 0개여도 진행할 수 있어요.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {painOptions.map((p) => {
                    const active = pains.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => togglePain(p)}
                        className={`px-4 py-2 rounded-full text-sm border transition ${
                          active
                            ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-400">{pains.length}/5 선택됨</p>
                <NavRow onPrev={goPrev} onNext={() => {
                  if (audience !== "child" && nickname.trim().length < 1) {
                    toast({ title: "닉네임을 입력해 주세요", variant: "destructive" }); return;
                  }
                  goNext();
                }} />
              </div>
            )}

            {stage === "goal" && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-slate-900 break-keep">
                  30일 후, 어떤 변화가 보이면 좋을까요?
                </h2>
                <p className="text-sm text-slate-500">선택 사항입니다. 30일 리포트의 비교 기준이 돼요.</p>
                <Textarea
                  rows={4}
                  maxLength={200}
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="예: 아침에 덜 피곤했으면, 짜증 빈도가 줄었으면…"
                />
                <div className="flex flex-wrap gap-2">
                  {(audience === "child"
                    ? ["떼쓰는 빈도가 줄었으면", "감정을 말로 표현했으면", "수면이 안정됐으면"]
                    : ["퇴근 후 회복이 빨랐으면", "잠들기까지 30분 안", "사소한 일에 덜 흔들렸으면"]
                  ).map((s) => (
                    <button
                      key={s}
                      onClick={() => setGoal(s)}
                      className="px-3 py-1.5 rounded-full text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      <Target className="w-3 h-3 inline mr-1" /> {s}
                    </button>
                  ))}
                </div>
                <NavRow
                  onPrev={goPrev}
                  onNext={goNext}
                  nextLabel="맞춤 트랙 만들기"
                  secondaryLabel="목표 없이 진행"
                  onSecondary={() => { setGoal(""); goNext(); }}
                />
              </div>
            )}

            {stage === "personalize" && (
              <PersonalizingScreen
                nickname={nickname.trim()}
                audience={audience}
                ageLabel={ageInfo?.label}
                pains={pains}
                error={personalizeError}
                onRetry={() => { personalizeRan.current = false; runPersonalize(); }}
                onSkip={() => setStage("preview")}
              />
            )}

            {stage === "preview" && (
              <PreviewScreen
                nickname={nickname.trim()}
                audience={audience}
                personalLine={personalLine}
                onStart={finishToTrack}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function NavRow({
  onPrev, onNext, nextDisabled, nextLabel, secondaryLabel, onSecondary,
}: {
  onPrev: () => void; onNext: () => void;
  nextDisabled?: boolean; nextLabel?: string;
  secondaryLabel?: string; onSecondary?: () => void;
}) {
  return (
    <div className="flex items-center justify-between pt-4">
      <Button variant="ghost" onClick={onPrev} className="text-slate-500">
        <ArrowLeft className="w-4 h-4 mr-1" /> 이전
      </Button>
      <div className="flex items-center gap-2">
        {secondaryLabel && (
          <Button variant="ghost" onClick={onSecondary} className="text-slate-400 text-xs">
            {secondaryLabel}
          </Button>
        )}
        <Button
          onClick={onNext}
          disabled={nextDisabled}
          className="bg-[#1a1a1a] text-white hover:bg-black rounded-xl px-6"
        >
          {nextLabel || "다음"} <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function PersonalizingScreen({
  nickname, audience, ageLabel, pains, error, onRetry, onSkip,
}: {
  nickname: string;
  audience: Audience | null;
  ageLabel?: string;
  pains: string[];
  error: string | null;
  onRetry: () => void;
  onSkip: () => void;
}) {
  const lines = useMemo(() => {
    const subj = audience === "child" ? `${nickname || "아이"}` : `${nickname || "당신"}`;
    return [
      ageLabel ? `${ageLabel} 매칭 완료` : `${subj} 코칭 트랙 매칭 완료`,
      pains.length > 0 ? `페인포인트 ${pains.length}개 매핑: ${pains.slice(0, 3).join(" · ")}` : `기본 페인포인트 세트 적용`,
      `Day 1·2 베이스라인 검사 선정`,
      `${subj}에게 맞는 오늘의 한 줄 생성 중…`,
    ];
  }, [nickname, audience, ageLabel, pains]);

  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (error) return;
    if (shown >= lines.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), 1500);
    return () => clearTimeout(t);
  }, [shown, lines.length, error]);

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center gap-3">
        {error ? (
          <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-red-500" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-2xl bg-[#FBF8EE] flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-[#8a7a4d] animate-spin" />
          </div>
        )}
        <div>
          <p className="text-[11px] tracking-widest font-semibold text-[#8a7a4d]">개인화 생성</p>
          <h2 className="text-xl font-bold text-slate-900">
            {error ? "잠깐, 다시 시도가 필요해요" : `${nickname || "당신"}만의 30일을 짜고 있어요`}
          </h2>
        </div>
      </div>

      <Card className="p-5 rounded-2xl border border-slate-100 space-y-3">
        {lines.map((l, i) => (
          <div key={i} className="flex items-start gap-2">
            {i < shown ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-slate-300 mt-0.5 shrink-0 animate-spin" />
            )}
            <span className={`text-sm break-keep ${i < shown ? "text-slate-800" : "text-slate-400"}`}>{l}</span>
          </div>
        ))}
      </Card>

      {error && (
        <div className="space-y-3">
          <p className="text-sm text-red-600">{error}</p>
          <div className="flex gap-2">
            <Button onClick={onRetry} className="bg-[#1a1a1a] text-white hover:bg-black rounded-xl">
              다시 만들기
            </Button>
            <Button variant="outline" onClick={onSkip} className="rounded-xl">
              기본 트랙으로 시작
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewScreen({
  nickname, audience, personalLine, onStart,
}: {
  nickname: string;
  audience: Audience | null;
  personalLine: string | null;
  onStart: () => void;
}) {
  const subj = nickname || (audience === "child" ? "아이" : "당신");
  return (
    <div className="space-y-6 pt-4">
      <div className="text-center space-y-3">
        <Badge className="bg-emerald-100 text-emerald-700 border-0">준비 완료</Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 break-keep leading-tight">
          {subj}의 30일 트랙이<br /> 준비됐어요.
        </h1>
      </div>

      <Card className="p-5 rounded-2xl border-2 border-[#C8B88A] bg-[#FBF8EE]">
        <p className="text-[11px] tracking-widest font-semibold text-[#8a7a4d] flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> {subj} 맞춤 한 줄
        </p>
        <p className="text-base font-medium text-slate-900 mt-2 leading-relaxed break-keep">
          {personalLine || "오늘은 첫 체크인 한 줄로 시작해요."}
        </p>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        {[
          { day: 7, label: "1주차 자가진단" },
          { day: 14, label: "2주차 변화 체크" },
          { day: 30, label: "워크북 완성" },
        ].map((m) => (
          <div key={m.day} className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60 text-center">
            <Lock className="w-3.5 h-3.5 text-slate-300 mx-auto" />
            <p className="text-[10px] tracking-widest font-semibold text-slate-400 mt-1">DAY {m.day}</p>
            <p className="text-xs text-slate-600 mt-0.5 break-keep">{m.label}</p>
          </div>
        ))}
      </div>

      <Button
        onClick={onStart}
        className="w-full bg-[#1a1a1a] text-white hover:bg-black rounded-2xl py-6 text-base"
      >
        지금 Day 1 시작하기 <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
      <p className="text-center text-xs text-slate-400">언제든 다시 돌아와 이어서 할 수 있어요.</p>
    </div>
  );
}
