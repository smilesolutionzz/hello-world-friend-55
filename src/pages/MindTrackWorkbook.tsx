import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MindTrackWelcomeModal from "@/components/mind-track/MindTrackWelcomeModal";
import DataAccumulationCounter from "@/components/mind-track/DataAccumulationCounter";
import NextActionCards from "@/components/mind-track/NextActionCards";
import ReportHubReadyBanner from "@/components/report/ReportHubReadyBanner";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  CheckCircle2, Circle, Loader2, Sparkles, TrendingUp, Calendar,
  Brain, Zap, Eye, Heart, Target, ChevronRight, Lock, ArrowLeft,
  Flame, Trophy, BookOpen, Wind, PenLine, Users, Activity, Award, Mail,
  RotateCcw, Info
} from "lucide-react";

// 미션 타입별 가이드 (라이브러리)
const MISSION_TYPE_GUIDE: Record<string, {
  icon: typeof Brain; label: string; color: string; steps: string[];
}> = {
  reflection: {
    icon: BookOpen, label: "회고 (Reflection)", color: "from-blue-500 to-cyan-500",
    steps: [
      "조용한 곳에서 1분간 호흡을 가다듬어요",
      "오늘 미션 질문을 천천히 읽고 떠오르는 생각을 적어요",
      "옳고 그름을 판단하지 말고, 그저 알아차려요",
    ],
  },
  action: {
    icon: Activity, label: "실천 (Action)", color: "from-emerald-500 to-teal-500",
    steps: [
      "지금 바로 할 수 있는 작은 행동 하나를 정해요",
      "5분 안에 끝낼 수 있는 단계로 쪼개요",
      "마치고 나서 어떤 느낌이었는지 짧게 메모해요",
    ],
  },
  breathing: {
    icon: Wind, label: "호흡 (Breathing)", color: "from-sky-500 to-indigo-500",
    steps: [
      "편안한 자세로 앉거나 누워요",
      "4초 들이마시고, 4초 멈추고, 6초 내쉬는 호흡을 5번 반복해요",
      "끝나고 어깨와 턱의 긴장을 풀어요",
    ],
  },
  journaling: {
    icon: PenLine, label: "기록 (Journaling)", color: "from-amber-500 to-orange-500",
    steps: [
      "타이머 5분을 맞춰요",
      "맞춤법·문법 신경 쓰지 말고 떠오르는 대로 적어요",
      "다 쓴 뒤 한 문장으로 핵심 감정을 요약해요",
    ],
  },
  connection: {
    icon: Users, label: "소통 (Connection)", color: "from-rose-500 to-pink-500",
    steps: [
      "오늘 안부를 전하고 싶은 한 사람을 떠올려요",
      "짧은 메시지나 전화로 마음을 전해요",
      "상대 반응에 집착하지 말고 보낸 것 자체에 의미를 둬요",
    ],
  },
};

const MISSION_CHECKIN_COPY: Record<string, { label: string; placeholder: string; error: string }> = {
  reflection: {
    label: "오늘 발견한 것",
    placeholder: "예: 오늘 나를 웃게 만든 순간 하나, 새롭게 알아차린 생각 하나",
    error: "오늘 발견한 것을 한 줄 이상 적어주세요",
  },
  action: {
    label: "오늘 실제로 한 행동",
    placeholder: "예: 5분 산책을 했다, 미뤘던 메시지를 보냈다",
    error: "오늘 실제로 한 행동을 한 줄 이상 적어주세요",
  },
  breathing: {
    label: "호흡 후 달라진 점",
    placeholder: "예: 어깨 힘이 조금 빠졌다, 생각 속도가 느려졌다",
    error: "호흡 후 달라진 점을 한 줄 이상 적어주세요",
  },
  journaling: {
    label: "오늘 적은 핵심 문장",
    placeholder: "예: 작은 기쁨은 퇴근길 바람이 시원했던 순간이었다",
    error: "오늘 적은 핵심 문장을 한 줄 이상 남겨주세요",
  },
  connection: {
    label: "오늘 전한 마음",
    placeholder: "예: 친구에게 고맙다고 보냈다, 가족에게 안부를 물었다",
    error: "오늘 누구에게 어떤 마음을 전했는지 적어주세요",
  },
};

const getMissionCheckinCopy = (missionType?: string) =>
  MISSION_CHECKIN_COPY[missionType || ""] ?? MISSION_CHECKIN_COPY.reflection;

// 연속 체크인(streak) 계산: 가장 최근 체크인부터 거꾸로 연속된 일수
function calcStreak(checkins: any[], currentDay: number): number {
  let streak = 0;
  for (let d = currentDay; d >= 1; d--) {
    const c = checkins.find((x) => x.day_number === d);
    if (c?.completed) streak++;
    else if (d < currentDay) break; // 오늘은 아직 안했어도 어제까지 연속이면 인정
    else continue;
  }
  return streak;
}
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SEOHead from "@/components/common/SEOHead";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { useSmartBack } from "@/hooks/useSmartBack";
import InviteFriendsButton from "@/components/mind-track/InviteFriendsButton";
import ExpertInterventionCard, { RiskAlertCard, type InterventionDay } from "@/components/mind-track/ExpertInterventionCard";
import InterventionCalendar from "@/components/mind-track/InterventionCalendar";
import MindTrackRiskSimulator from "@/components/mind-track/MindTrackRiskSimulator";
import WeeklyMilestoneCards from "@/components/mind-track/WeeklyMilestoneCards";
import MilestoneProgressBar from "@/components/mind-track/MilestoneProgressBar";
import MindTrackWorkbookSkeleton from "@/components/mind-track/MindTrackWorkbookSkeleton";
import MissionLearningCard from "@/components/mind-track/MissionLearningCard";
import { useMindTrackRiskDetection } from "@/hooks/useMindTrackRiskDetection";
import { HelpCircle } from "lucide-react";

export default function MindTrackWorkbook() {
  const navigate = useNavigate();
  const goBack = useSmartBack('/mind-track');
  const [searchParams, setSearchParams] = useSearchParams();
  const showWelcome = searchParams.get("welcome") === "1";
  const rawDayParam = searchParams.get("day");
  const dayParam = parseInt(rawDayParam ?? "", 10);
  const dayParamValid = Number.isFinite(dayParam) && dayParam >= 1 && dayParam <= 30;

  // 잘못된 day 파라미터(범위 밖 또는 NaN이지만 값이 있는 경우) → day=1로 보정 + 토스트
  useEffect(() => {
    if (rawDayParam !== null && !dayParamValid) {
      toast.error(`Day ${rawDayParam}은(는) 유효하지 않아요. 1~30 범위만 가능해요. Day 1로 이동했어요.`);
      const params = new URLSearchParams(searchParams);
      params.set("day", "1");
      setSearchParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawDayParam]);

  // localStorage 우선순위: URL ?day → URL 없으면 저장된 값
  const storedDay = (() => {
    try {
      const v = parseInt(localStorage.getItem("mt_workbook_selected_day") ?? "", 10);
      return Number.isFinite(v) && v >= 1 && v <= 30 ? v : null;
    } catch { return null; }
  })();
  const initialSelectedDay = dayParamValid ? dayParam : storedDay;
  const filterParam = searchParams.get("filter");
  const storedFilter = (() => {
    try {
      const v = filterParam ?? localStorage.getItem("mt_workbook_filter");
      return v === "all" || v === "today" || v === "completed" || v === "remaining" ? v : "all";
    } catch { return "all"; }
  })();
  const [selectedDay, setSelectedDay] = useState<number | null>(initialSelectedDay);
  const [filter, setFilter] = useState<"all" | "today" | "completed" | "remaining">(storedFilter as any);

  // 필터/선택일 변경 시 localStorage + URL 저장
  useEffect(() => {
    try { localStorage.setItem("mt_workbook_filter", filter); } catch {}
    const params = new URLSearchParams(searchParams);
    if (filter === "all") params.delete("filter");
    else params.set("filter", filter);
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);
  useEffect(() => {
    try {
      if (selectedDay) localStorage.setItem("mt_workbook_selected_day", String(selectedDay));
    } catch {}
  }, [selectedDay]);
  const missionSectionRef = useRef<HTMLDivElement | null>(null);
  const reopenButtonRef = useRef<HTMLButtonElement | null>(null);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const dayButtonRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadSteps, setLoadSteps] = useState({
    auth: false,
    workbook: false,
    missions: false,
    checkins: false,
    baselines: false,
  });
  const [enrollment, setEnrollment] = useState<any>(null);
  const [workbook, setWorkbook] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [baselines, setBaselines] = useState<any[]>([]);
  const [activeMission, setActiveMission] = useState<any>(null);
  const [reflectionNote, setReflectionNote] = useState("");
  const [moodScore, setMoodScore] = useState(5);
  const [energyScore, setEnergyScore] = useState(5);
  const [clarityScore, setClarityScore] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    setLoadSteps({ auth: false, workbook: false, missions: false, checkins: false, baselines: false });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth?redirect=/mind-track/workbook"); return; }
      setLoadSteps((s) => ({ ...s, auth: true }));

      const { data: wbs, error: wbErr } = await supabase
        .from("mind_track_workbooks")
        .select("*, mind_track_enrollments(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      if (wbErr) throw wbErr;
      if (!wbs || wbs.length === 0) { navigate("/mind-track/start"); return; }

      const wb = wbs[0];
      setWorkbook(wb);
      setEnrollment(wb.mind_track_enrollments);
      setLoadSteps((s) => ({ ...s, workbook: true }));

      const [mRes, cRes, bRes] = await Promise.all([
        supabase.from("mind_track_daily_missions").select("*").eq("enrollment_id", wb.enrollment_id).order("day_number"),
        supabase.from("mind_track_checkins").select("*").eq("enrollment_id", wb.enrollment_id).order("day_number"),
        supabase.from("mind_track_baseline_assessments").select("*").eq("enrollment_id", wb.enrollment_id).order("created_at"),
      ]);
      if (mRes.error) throw mRes.error;
      if (cRes.error) throw cRes.error;
      if (bRes.error) throw bRes.error;
      setMissions(mRes.data ?? []);
      setLoadSteps((s) => ({ ...s, missions: true }));
      setCheckins(cRes.data ?? []);
      setLoadSteps((s) => ({ ...s, checkins: true }));
      setBaselines(bRes.data ?? []);
      setLoadSteps((s) => ({ ...s, baselines: true }));
    } catch (e: any) {
      console.error("workbook load failed:", e);
      setLoadError(e?.message ?? "데이터를 불러오는 중 문제가 발생했어요");
    } finally {
      setLoading(false);
    }
  };

  // Calculate current day from started_at
  const startedAt = enrollment?.started_at ? new Date(enrollment.started_at) : new Date();
  const daysSinceStart = Math.floor((Date.now() - startedAt.getTime()) / 86400000) + 1;
  const currentDay = Math.min(Math.max(daysSinceStart, 1), 30);

  const completedCount = checkins.filter((c) => c.completed).length;
  const completionRate = Math.round((completedCount / 30) * 100);

  const todayMission = missions.find((m) => m.day_number === currentDay);
  const todayCheckin = checkins.find((c) => c.day_number === currentDay);
  const activeMissionCheckinCopy = getMissionCheckinCopy(activeMission?.mission_type);

  // Trigger weekly refresh if needed
  useEffect(() => {
    const weekNum = Math.ceil(currentDay / 7);
    if (weekNum < 2 || !enrollment) return;
    const hasWeek = missions.some((m) => m.week_number === weekNum);
    if (!hasWeek) {
      (async () => {
        const { data: session } = await supabase.auth.getSession();
        await supabase.functions.invoke("mind-track-weekly-refresh", {
          headers: { Authorization: `Bearer ${session.session?.access_token}` },
          body: { enrollmentId: enrollment.id, weekNumber: weekNum },
        });
        load();
      })();
    }
  }, [currentDay, enrollment, missions]);

  // Day 30 도달 + 아직 완료처리 안된 경우 → 자동 finalize + 메일 발송
  useEffect(() => {
    if (!enrollment) return;
    if (currentDay < 30) return;
    if (enrollment.status === "completed" && enrollment.completed_at) return;
    (async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        const { data, error } = await supabase.functions.invoke("mind-track-finalize", {
          headers: { Authorization: `Bearer ${session.session?.access_token}` },
          body: { enrollmentId: enrollment.id },
        });
        if (error) throw error;
        if (data?.success && !data?.alreadyCompleted) {
          toast.success("30일 트랙 완료! 종합 리포트를 메일로도 보내드렸어요 🎉");
          load();
        }
      } catch (e: any) {
        console.error("finalize failed:", e);
      }
    })();
  }, [currentDay, enrollment?.id, enrollment?.status]);

  // Day 선택 시 → 캘린더 day 셀로 스크롤 + 미션 섹션으로도 스크롤·포커스
  useEffect(() => {
    if (loading || !selectedDay) return;
    const t = setTimeout(() => {
      // 오늘 선택 시: 미션 섹션을 최우선으로 스크롤·포커스
      if (selectedDay === currentDay && missionSectionRef.current) {
        missionSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        reopenButtonRef.current?.focus({ preventScroll: true });
      } else {
        const el = dayButtonRefs.current[selectedDay];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus({ preventScroll: true });
        } else {
          calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, selectedDay, currentDay]);

  // ?day=N 이 오늘이면 미션 다이얼로그 자동 열기
  // - 최초 1회는 항상 자동 (autoOpenedRef 가드)
  // - ?openMission=1 플래그가 있으면 명시적으로 다시 열기
  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (loading) return;
    const dp = parseInt(searchParams.get("day") ?? "", 10);
    const explicitOpen = searchParams.get("openMission") === "1";
    if (!Number.isFinite(dp)) return;
    if (dp !== currentDay) return;
    if (autoOpenedRef.current && !explicitOpen) return;
    const completed = checkins.some((c) => c.day_number === dp && c.completed);
    if (completed && !explicitOpen) return;
    const m = missions.find((mm) => mm.day_number === dp);
    if (m) {
      autoOpenedRef.current = true;
      openMission(m);
      if (explicitOpen) {
        // 플래그는 일회용 — 소비 후 제거
        const params = new URLSearchParams(searchParams);
        params.delete("openMission");
        setSearchParams(params, { replace: true });
      }
    }
  }, [loading, searchParams, currentDay, missions, checkins]);

  const openMission = (mission: any) => {
    const existing = checkins.find((c) => c.day_number === mission.day_number);
    setActiveMission(mission);
    setReflectionNote(existing?.reflection_note ?? "");
    setMoodScore(existing?.mood_score ?? 5);
    setEnergyScore(existing?.energy_score ?? 5);
    setClarityScore(existing?.clarity_score ?? 5);
  };

  const submitCheckin = async () => {
    if (!activeMission || !enrollment) return;

    // ── 영상 학습 미션이 있을 때 시청/느낀점 필수 검증 ──────────
    const candidates = Array.isArray(activeMission.youtube_candidates)
      ? activeMission.youtube_candidates
      : [];
    const videoReflectionEl = document.querySelector<HTMLTextAreaElement>(
      `textarea[data-mission-video-reflection="${activeMission.id}"]`,
    );
    const videoReflection = videoReflectionEl?.value?.trim() || "";

    if (candidates.length > 0) {
      // 최신 시청 상태를 DB에서 다시 읽어 검증 (다른 탭/새로고침 동기화 대응)
      const { data: missionRow } = await supabase
        .from("mind_track_daily_missions")
        .select("watched_video_ids")
        .eq("id", activeMission.id)
        .maybeSingle();
      const watchedIds = Array.isArray(missionRow?.watched_video_ids)
        ? (missionRow!.watched_video_ids as string[])
        : [];

      if (watchedIds.length === 0) {
        toast.error("영상을 1편 이상 시청 완료로 표시한 뒤 체크인해 주세요");
        return;
      }
      if (videoReflection.length < 10) {
        toast.error("영상을 본 뒤 느낀점을 10자 이상 적어주세요");
        videoReflectionEl?.focus();
        return;
      }
    }

    if (!reflectionNote.trim()) {
      toast.error(getMissionCheckinCopy(activeMission.mission_type).error);
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const existing = checkins.find((c) => c.day_number === activeMission.day_number);
      const payload = {
        user_id: user!.id,
        enrollment_id: enrollment.id,
        mission_id: activeMission.id,
        day_number: activeMission.day_number,
        completed: true,
        mood_score: moodScore,
        energy_score: energyScore,
        clarity_score: clarityScore,
        reflection_note: reflectionNote || null,
        video_reflection: videoReflection || null,
        checked_at: new Date().toISOString(),
      };
      if (existing) {
        await supabase.from("mind_track_checkins").update(payload).eq("id", existing.id);
      } else {
        await supabase.from("mind_track_checkins").insert(payload);
      }
      toast.success("체크인 완료! 🎉");
      setActiveMission(null);
      load();
    } catch (e: any) {
      toast.error(e.message || "오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadError) {
    return (
      <MindTrackWorkbookSkeleton
        steps={[
          { key: "auth", label: "로그인 확인", done: loadSteps.auth },
          { key: "workbook", label: "워크북 불러오기", done: loadSteps.workbook },
          { key: "missions", label: "오늘의 미션 준비", done: loadSteps.missions },
          { key: "checkins", label: "체크인 기록 정리", done: loadSteps.checkins },
          { key: "baselines", label: "마일스톤 데이터 정렬", done: loadSteps.baselines },
        ]}
        error={loadError}
        onRetry={load}
      />
    );
  }

  if (!workbook) return null;

  const baseline = baselines.find((b) => b.measurement_point === "baseline");
  const latest = baselines[baselines.length - 1];

  return (
    <>
      <SEOHead title="나의 30일 워크북" description="초기 진단 결과와 매일의 미션을 관리하세요." />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30">
        <UnifiedNavigation />
        <MindTrackWelcomeModal forceOpen={showWelcome} />
        <div className="max-w-4xl mx-auto px-4 pt-24 pb-16 space-y-6">

          {/* 데이터 누적 카운터 — 결제 후 가치 즉시 시각화 */}
          <DataAccumulationCounter />

          {/* 종합 리포트 타이밍 배너 — 데이터 ≥3건 시 자동 노출 */}
          <ReportHubReadyBanner />

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
              <Sparkles className="w-3 h-3 mr-1" /> 30일 마음 변화 트랙
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 break-keep leading-tight">
              {workbook.challenge_theme}
            </h1>
            <p className="text-slate-600 break-keep">{workbook.initial_summary}</p>
          </motion.div>

          {/* Progress + 내 진행상황 (streak, baseline vs latest) */}
          <Card className="p-5 bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div>
                <div className="text-xs text-slate-500">진행 중</div>
                <div className="text-xl font-bold text-slate-900">Day {currentDay} / 30</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">완료율</div>
                <div className="text-xl font-bold text-primary">{completionRate}%</div>
              </div>
            </div>
            <Progress value={(currentDay / 30) * 100} className="h-2" />

            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                <Flame className="w-4 h-4 text-orange-500 mx-auto mb-0.5" />
                <div className="text-[10px] text-slate-500">연속 체크인</div>
                <div className="text-base font-bold text-slate-900">{calcStreak(checkins, currentDay)}일</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-0.5" />
                <div className="text-[10px] text-slate-500">총 완료</div>
                <div className="text-base font-bold text-slate-900">{completedCount}일</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                <Trophy className="w-4 h-4 text-amber-500 mx-auto mb-0.5" />
                <div className="text-[10px] text-slate-500">남은 일수</div>
                <div className="text-base font-bold text-slate-900">{Math.max(0, 30 - currentDay)}일</div>
              </div>
            </div>

            {baseline && latest && baseline.id !== latest.id && (
              <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="text-[10px] font-bold text-emerald-700 mb-1">시작 → 최근 점수 변화</div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {[
                    { k: "stress_score", label: "스트레스", reverse: true },
                    { k: "energy_score", label: "에너지" },
                    { k: "clarity_score", label: "명료성" },
                  ].map((m) => {
                    const s = baseline[m.k] ?? 0; const n = latest[m.k] ?? s;
                    const diff = m.reverse ? s - n : n - s;
                    return (
                      <div key={m.k}>
                        <div className="text-slate-600">{m.label}</div>
                        <div className="font-bold text-slate-900">{s} → {n}</div>
                        <div className={diff > 0 ? "text-emerald-600 font-bold" : diff < 0 ? "text-rose-500" : "text-slate-400"}>
                          {diff > 0 ? "↑" : diff < 0 ? "↓" : "·"}{Math.abs(diff)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
              <div className="text-xs text-slate-500">{completedCount}일 체크인 완료</div>
              <InviteFriendsButton currentDay={currentDay} />
            </div>
          </Card>

          {/* 마일스톤 진행 현황 (어떤 7/14/21/28일 카드가 완료되었는지 + 다음 목표 강조) */}
          <MilestoneProgressBar currentDay={currentDay} checkins={checkins} />

          {/* 7/14/21/28일 자가진단 마일스톤 카드 */}
          <WeeklyMilestoneCards
            currentDay={currentDay}
            completedCount={completedCount}
            baseline={baselines.find((b) => b.measurement_point === "baseline") ?? null}
            latest={baselines[baselines.length - 1] ?? null}
          />

          {/* 위험 감지 무료 케어 알림 + Day 마일스톤 전문가 개입 카드 */}
          <InterventionSection
            enrollmentId={enrollment?.id}
            currentDay={currentDay}
            checkins={checkins}
            baselines={baselines}
          />

          {/* Day 30 완료 리포트 — 완료 시 자동 노출 */}
          {enrollment?.status === "completed" && enrollment?.completed_at && (
            <Card className="p-6 border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-6 h-6 text-amber-500" />
                <Badge className="bg-amber-500 text-white">30일 완료</Badge>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 break-keep">
                30일 마음 챌린지를 완주하셨어요! 🎉
              </h3>
              <p className="text-sm text-slate-600 mb-4 break-keep">
                완료일: {new Date(enrollment.completed_at).toLocaleDateString("ko-KR")} ·
                총 {completedCount}일 체크인
              </p>

              {baseline && latest && baseline.id !== latest.id && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { k: "stress_score", label: "스트레스", reverse: true, icon: Brain },
                    { k: "energy_score", label: "에너지", icon: Zap },
                    { k: "clarity_score", label: "명료성", icon: Eye },
                  ].map((m) => {
                    const s = baseline[m.k] ?? 0; const n = latest[m.k] ?? s;
                    const diff = m.reverse ? s - n : n - s;
                    return (
                      <div key={m.k} className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                        <m.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                        <div className="text-[11px] text-slate-500">{m.label}</div>
                        <div className="text-sm text-slate-700">{s} → <span className="font-bold text-slate-900">{n}</span></div>
                        <div className={`text-xs font-bold mt-0.5 ${diff > 0 ? "text-emerald-600" : diff < 0 ? "text-rose-500" : "text-slate-400"}`}>
                          {diff > 0 ? "↑" : diff < 0 ? "↓" : "·"}{Math.abs(diff)}점
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white/70 rounded-lg p-2.5 border border-amber-200">
                <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="break-keep">상세 종합 리포트는 가입 이메일로도 발송되었어요. 받은편지함을 확인해보세요.</span>
              </div>
            </Card>
          )}

          {/* Today's Mission + Check-in 통합 강조 영역 */}
          {todayMission && (() => {
            const guide = MISSION_TYPE_GUIDE[todayMission.mission_type] ?? MISSION_TYPE_GUIDE.reflection;
            const GuideIcon = guide.icon;
            const isHighlighted = selectedDay === currentDay;
            return (
              <div
                ref={missionSectionRef}
                tabIndex={-1}
                className={`rounded-2xl transition-all outline-none ${
                  isHighlighted ? "ring-4 ring-primary/40 ring-offset-2" : ""
                }`}
                aria-label={`Day ${currentDay} 미션 섹션`}
              >
              <Card className="p-5 border-2 border-primary shadow-lg transition-all">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span className="text-sm font-bold text-primary">오늘의 미션 · Day {currentDay}</span>
                  </div>
                  {todayCheckin?.completed && (
                    <Badge className="bg-emerald-500 text-white">✓ 완료</Badge>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 break-keep">{todayMission.mission_title}</h3>
                <p className="text-sm text-slate-600 mb-3 break-keep">{todayMission.mission_description}</p>

                {/* 미션 타입 라이브러리 가이드 */}
                <div className={`rounded-xl p-3 mb-4 bg-gradient-to-br ${guide.color} text-white`}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <GuideIcon className="w-4 h-4" />
                    <span className="text-xs font-bold">{guide.label}</span>
                  </div>
                  <ol className="text-xs space-y-1 list-decimal list-inside opacity-95">
                    {guide.steps.map((s, i) => <li key={i} className="break-keep">{s}</li>)}
                  </ol>
                </div>

                {/* 학습 영상 + 느낀점 — 추천 영상 여러 편 시청 + 한 줄 회고 */}
                {Array.isArray(todayMission.youtube_candidates) && todayMission.youtube_candidates.length > 0 && (
                  <MissionLearningCard
                    missionId={todayMission.id}
                    missionType={todayMission.mission_type}
                    candidates={todayMission.youtube_candidates as any}
                    initialWatched={Array.isArray((todayMission as any).watched_video_ids) ? (todayMission as any).watched_video_ids : []}
                    initialReflection={todayCheckin?.video_reflection ?? ""}
                    initialDraftReflection={(todayMission as any).video_reflection_draft ?? ""}
                    reflectionReadonly={!!todayCheckin?.completed}
                  />
                )}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>⏱ {todayMission.estimated_minutes}분</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      ref={reopenButtonRef}
                      variant="outline"
                      size="sm"
                      onClick={() => openMission(todayMission)}
                      className="text-xs"
                      aria-label="오늘의 미션 다이얼로그 다시 열기"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      다시 열기
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/expert-hiring?from=mission_difficult&day=${currentDay}`)}
                      className="text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <HelpCircle className="w-3.5 h-3.5 mr-1" />
                      어려워요
                    </Button>
                    <Button onClick={() => openMission(todayMission)} className="bg-gradient-to-r from-primary to-purple-600">
                      {todayCheckin?.completed ? "기록 수정" : "체크인하기"} <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>

                {/* 체크인 카드 — 오늘 선택 시 함께 강조 */}
                {todayCheckin && (
                  <div className={`mt-4 pt-4 border-t border-slate-200 transition-all ${isHighlighted ? "bg-primary/5 -mx-5 -mb-5 px-5 pb-5 rounded-b-xl" : ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 오늘의 체크인 기록
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {todayCheckin.checked_at ? new Date(todayCheckin.checked_at).toLocaleString("ko-KR") : ""}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <div className="text-slate-500 text-[10px]">기분</div>
                        <div className="font-bold text-slate-900">{todayCheckin.mood_score ?? "-"}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <div className="text-slate-500 text-[10px]">에너지</div>
                        <div className="font-bold text-slate-900">{todayCheckin.energy_score ?? "-"}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <div className="text-slate-500 text-[10px]">명료성</div>
                        <div className="font-bold text-slate-900">{todayCheckin.clarity_score ?? "-"}</div>
                      </div>
                    </div>
                    {todayCheckin.reflection_note && (
                      <p className="mt-2 text-xs text-slate-600 break-keep bg-white border border-slate-200 rounded-lg p-2">
                        {todayCheckin.reflection_note}
                      </p>
                    )}
                  </div>
                )}
              </Card>
              </div>
            );
          })()}

          {/* Initial Report */}
          <Card className="p-5">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" /> 초기 분석 리포트
            </h3>
            <div className="space-y-4">
              {baseline && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "스트레스", value: baseline.stress_score, icon: Brain, color: "text-rose-600", reverse: true },
                    { label: "에너지", value: baseline.energy_score, icon: Zap, color: "text-amber-600" },
                    { label: "명료성", value: baseline.clarity_score, icon: Eye, color: "text-blue-600" },
                  ].map((m) => (
                    <div key={m.label} className="p-3 rounded-xl bg-slate-50">
                      <m.icon className={`w-4 h-4 mx-auto mb-1 ${m.color}`} />
                      <div className="text-xs text-slate-500">{m.label}</div>
                      <div className="text-xl font-bold text-slate-900">{m.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {workbook.root_causes && workbook.root_causes.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-1">현재 마음을 무겁게 하는 것</div>
                  <ul className="space-y-1">
                    {workbook.root_causes.map((c: string, i: number) => (
                      <li key={i} className="text-sm text-slate-600 flex gap-2 break-keep">
                        <span className="text-primary">•</span><span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {workbook.strength_areas && workbook.strength_areas.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-1">이미 가진 힘</div>
                  <ul className="space-y-1">
                    {workbook.strength_areas.map((s: string, i: number) => (
                      <li key={i} className="text-sm text-slate-600 flex gap-2 break-keep">
                        <span className="text-emerald-500">✓</span><span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>

          {/* Weekly Themes */}
          {workbook.weekly_themes && (
            <Card className="p-5">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> 주차별 테마
              </h3>
              <div className="space-y-2">
                {workbook.weekly_themes.map((wt: any) => {
                  const isCurrent = Math.ceil(currentDay / 7) === wt.week;
                  const isPast = Math.ceil(currentDay / 7) > wt.week;
                  return (
                    <div
                      key={wt.week}
                      className={`p-3 rounded-xl border-2 ${
                        isCurrent ? "border-primary bg-primary/5" : isPast ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={isCurrent ? "default" : "outline"} className="text-[10px]">Week {wt.week}</Badge>
                          <span className="font-medium text-sm text-slate-900 break-keep">{wt.theme}</span>
                        </div>
                        {isPast && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 break-keep">{wt.focus}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* 전문가 개입 일정 캘린더 (Day 7/14/21/30) */}
          <InterventionCalendar currentDay={currentDay} />

          {/* 30-day Calendar */}
          <Card className="p-5" ref={calendarRef as any}>
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" /> 30일 챌린지 캘린더
              </h3>
              <TooltipProvider delayDuration={150}>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {([
                    { k: "all", label: "전체", tip: "30일 전체 캘린더를 보여줘요" },
                    { k: "today", label: `오늘 Day ${currentDay}`, tip: "현재 진행 중인 오늘 Day만 강조" },
                    { k: "completed", label: `완료 ${completedCount}`, tip: "체크인을 제출한(completed=true) Day 수" },
                    { k: "remaining", label: `남은 ${Math.max(0, currentDay - completedCount)}`, tip: "오늘까지 도달했지만 아직 체크인을 제출하지 않은 Day 수" },
                  ] as const).map((f) => (
                    <Tooltip key={f.k}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            setFilter(f.k);
                            if (f.k === "today") {
                              setSelectedDay(currentDay);
                              const params = new URLSearchParams(searchParams);
                              params.set("day", String(currentDay));
                              setSearchParams(params, { replace: true });
                            }
                          }}
                          className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                            filter === f.k
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-white text-slate-600 border-slate-200 hover:border-primary/50"
                          }`}
                          aria-label={f.tip}
                        >
                          {f.label}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[220px] text-xs break-keep">
                        {f.tip}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-start gap-1 break-keep">
              <Info className="w-3 h-3 mt-0.5 shrink-0" />
              <span>
                <strong className="text-slate-700">완료 기준</strong>은 체크인을 제출해 <code className="px-1 rounded bg-slate-100">completed=true</code>로 기록된 Day,
                <strong className="text-slate-700"> 남은</strong>은 오늘까지 도달했지만 아직 체크인을 제출하지 않은 Day입니다.
              </span>
            </p>

            {/* 빠른 점프 (Day 셀렉터) */}
            <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
                const isSel = selectedDay === d;
                const isTd = d === currentDay;
                return (
                  <button
                    key={d}
                    onClick={() => {
                      setSelectedDay(d);
                      const params = new URLSearchParams(searchParams);
                      params.set("day", String(d));
                      setSearchParams(params, { replace: true });
                      dayButtonRefs.current[d]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                    }}
                    className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-md border transition-all ${
                      isSel
                        ? "bg-primary text-primary-foreground border-primary"
                        : isTd
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-primary/40"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                const mission = missions.find((m) => m.day_number === day);
                const checkin = checkins.find((c) => c.day_number === day);
                const isFuture = day > currentDay;
                const isToday = day === currentDay;
                const isLocked = !mission;
                const isSelected = selectedDay === day;

                // 필터 적용 (시각적 dim 처리)
                const matchesFilter =
                  filter === "all" ||
                  (filter === "today" && isToday) ||
                  (filter === "completed" && checkin?.completed) ||
                  (filter === "remaining" && !checkin?.completed && !isFuture && !isLocked);
                const dimmed = !matchesFilter;

                return (
                  <button
                    key={day}
                    ref={(el) => { dayButtonRefs.current[day] = el; }}
                    onClick={() => {
                      setSelectedDay(day);
                      const params = new URLSearchParams(searchParams);
                      params.set("day", String(day));
                      setSearchParams(params, { replace: true });
                      if (mission && !isFuture) openMission(mission);
                    }}
                    disabled={isLocked || isFuture}
                    className={`relative aspect-square rounded-lg border-2 text-xs font-bold flex flex-col items-center justify-center transition-all ${
                      dimmed ? "opacity-30" : ""
                    } ${
                      isSelected ? "ring-2 ring-primary ring-offset-1" : ""
                    } ${
                      checkin?.completed
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : isToday
                        ? "bg-primary border-primary text-primary-foreground animate-pulse"
                        : isLocked
                        ? "border-slate-200 bg-slate-50 text-slate-300"
                        : isFuture
                        ? "border-slate-200 bg-white text-slate-400"
                        : "border-slate-300 bg-white text-slate-700 hover:border-primary"
                    }`}
                  >
                    {checkin?.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : isLocked && !isFuture ? <Lock className="w-3 h-3" /> : day}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">
              ✓ 완료 · 오늘은 강조 표시 · 자물쇠 = 다음주 미션 자동 생성 대기
            </p>
          </Card>

          {/* Variation tracking */}
          {baselines.length > 1 && (
            <Card className="p-5">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" /> 변화 추적
              </h3>
              <div className="space-y-3">
                {[
                  { key: "stress_score", label: "스트레스", reverse: true },
                  { key: "energy_score", label: "에너지" },
                  { key: "clarity_score", label: "명료성" },
                ].map((m) => {
                  const start = baseline?.[m.key] ?? 50;
                  const now = latest?.[m.key] ?? start;
                  const diff = m.reverse ? start - now : now - start;
                  const positive = diff > 0;
                  return (
                    <div key={m.key} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-700 w-20">{m.label}</span>
                      <div className="flex-1 flex items-center gap-2 text-sm">
                        <span className="text-slate-500">{start}</span>
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full">
                          <div className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full" style={{ width: `${now}%` }} />
                        </div>
                        <span className="font-bold text-slate-900">{now}</span>
                      </div>
                      <span className={`text-xs font-bold w-12 text-right ${positive ? "text-emerald-600" : diff < 0 ? "text-rose-500" : "text-slate-400"}`}>
                        {positive ? "↑" : diff < 0 ? "↓" : "·"}{Math.abs(diff)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* 다음 액션 추천 — 워크북 외부로 자연스럽게 연결 */}
          <NextActionCards />
        </div>
      </div>

      {/* 위험 감지 시뮬레이터 (검증용 플로팅 패널) */}
      <MindTrackRiskSimulator
        enrollmentId={enrollment?.id ?? null}
        onSimulated={() => load()}
      />

      {/* Check-in Dialog */}
      <Dialog open={!!activeMission} onOpenChange={(o) => !o && setActiveMission(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-left break-keep">{activeMission?.mission_title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <p className="text-sm text-slate-600 break-keep">{activeMission?.mission_description}</p>

            {[
              { state: moodScore, set: setMoodScore, label: "마음 상태", icon: Heart, low: "무거움", high: "편안함" },
              { state: energyScore, set: setEnergyScore, label: "몸의 여유", icon: Zap, low: "지침", high: "가벼움" },
              { state: clarityScore, set: setClarityScore, label: "생각 정리", icon: Eye, low: "복잡함", high: "선명함" },
            ].map((s) => (
              <div key={s.label} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <s.icon className="w-3.5 h-3.5" /> {s.label}
                  </div>
                  <span className="text-lg font-bold text-primary tabular-nums">{s.state}</span>
                </div>
                <Slider value={[s.state]} onValueChange={(v) => s.set(v[0])} min={0} max={10} step={1} />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>{s.low}</span>
                  <span>{s.high}</span>
                </div>
              </div>
            ))}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                {activeMissionCheckinCopy.label} <span className="text-rose-500">필수</span>
              </label>
              <Textarea
                value={reflectionNote}
                onChange={(e) => setReflectionNote(e.target.value)}
                placeholder={activeMissionCheckinCopy.placeholder}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={submitCheckin} disabled={submitting} className="w-full bg-gradient-to-r from-primary to-purple-600">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              체크인 완료
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 전문가 개입 섹션 (Day 7/14/21/30 마일스톤 + 위험 감지 무료 케어)
// ─────────────────────────────────────────────────────────────
function InterventionSection({
  enrollmentId,
  currentDay,
  checkins,
  baselines,
}: {
  enrollmentId: string | undefined;
  currentDay: number;
  checkins: any[];
  baselines: any[];
}) {
  const navigate = useNavigate();
  const { activeAlert, resolveAlert } = useMindTrackRiskDetection(
    enrollmentId ?? null,
    checkins,
    baselines,
    currentDay,
  );

  if (!enrollmentId) return null;

  // 현재 도달한 마일스톤 day 계산 (7/14/21/30)
  const milestones: InterventionDay[] = [7, 14, 21, 30];
  const activeMilestone = milestones
    .filter((d) => currentDay >= d)
    .sort((a, b) => b - a)[0]; // 가장 최근 마일스톤만 노출

  return (
    <div className="space-y-4">
      {activeAlert && (
        <RiskAlertCard
          alertType={activeAlert.alert_type as any}
          onRequestHelp={async () => {
            await resolveAlert("requested_help");
            navigate("/expert-hiring?from=risk_alert&urgent=true");
          }}
          onDismiss={() => resolveAlert("acknowledged")}
        />
      )}
      {activeMilestone && (
        <ExpertInterventionCard day={activeMilestone} enrollmentId={enrollmentId} />
      )}
    </div>
  );
}
