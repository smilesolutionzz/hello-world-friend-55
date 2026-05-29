import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MindTrackWelcomeModal from "@/components/mind-track/MindTrackWelcomeModal";
import DashboardVsWorkbookHelp from "@/components/mind-track/DashboardVsWorkbookHelp";
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
  RotateCcw, Info, Video, Stethoscope, Mic, Sparkle, BarChart3, ShieldCheck
} from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

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
import SevenDayWorkbookView from "@/components/mind-track/seven-day/SevenDayWorkbookView";
import MindTrackRiskSimulator from "@/components/mind-track/MindTrackRiskSimulator";
import WeeklyMilestoneCards from "@/components/mind-track/WeeklyMilestoneCards";
import MilestoneProgressBar from "@/components/mind-track/MilestoneProgressBar";
import WorkbookPreviewCard from "@/components/mind-track/WorkbookPreviewCard";
import NextChapterTeaser from "@/components/mind-track/NextChapterTeaser";
import WeeklyChapterPreview from "@/components/mind-track/WeeklyChapterPreview";
import WorkbookCompletionCelebration from "@/components/mind-track/WorkbookCompletionCelebration";
import MindTrackWorkbookSkeleton from "@/components/mind-track/MindTrackWorkbookSkeleton";
import MissionLearningCard from "@/components/mind-track/MissionLearningCard";
import MissionAssessmentCard from "@/components/mind-track/MissionAssessmentCard";
import {
  getAssessmentForDay,
  isAssessmentMissionCompleted,
  extractUserReflection,
  stripAssessmentBlocks,
} from "@/lib/mindTrackAssessmentMissions";
import { useMindTrackRiskDetection } from "@/hooks/useMindTrackRiskDetection";
import { HelpCircle } from "lucide-react";

export default function MindTrackWorkbook() {
  const navigate = useNavigate();
  const goBack = useSmartBack('/mind-track');
  const [searchParams, setSearchParams] = useSearchParams();
  const showWelcome = searchParams.get("welcome") === "1";
  const rawDayParam = searchParams.get("day");
  const dayParam = parseInt(rawDayParam ?? "", 10);
  const dayParamValid = Number.isFinite(dayParam) && dayParam >= 1 && dayParam <= 7;

  // 잘못된 day 파라미터(범위 밖 또는 NaN이지만 값이 있는 경우) → day=1로 보정 + 토스트
  useEffect(() => {
    if (rawDayParam !== null && !dayParamValid) {
      toast.error(`Day ${rawDayParam}은(는) 유효하지 않아요. 7일 트랙은 Day 1~7까지만 가능해요. Day 1로 이동했어요.`);
      const params = new URLSearchParams(searchParams);
      params.set("day", "1");
      setSearchParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawDayParam]);

  // ✅ UX 단순화: day 파라미터 없이 들어왔고 환영/필터 의도도 없으면 → 대시보드(단일 홈)로 보냄
  // "/mind-track/workbook"과 "/mind-track/dashboard"가 둘 다 진입 가능해서 혼란스러웠던 문제 해결
  useEffect(() => {
    if (rawDayParam !== null) return;
    if (showWelcome) return;
    if (filterParam) return;
    if (searchParams.get("openMission") === "1") return;
    navigate("/mind-track/dashboard", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // localStorage 우선순위: URL ?day → URL 없으면 저장된 값
  const storedDay = (() => {
    try {
      const v = parseInt(localStorage.getItem("mt_workbook_selected_day") ?? "", 10);
      return Number.isFinite(v) && v >= 1 && v <= 7 ? v : null;
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
  const [showCelebration, setShowCelebration] = useState(false);
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
      const enrollmentRow = wb.mind_track_enrollments;
      const isTwoWeek = enrollmentRow?.track_type === 'mind_2week';
      const maxDay = isTwoWeek ? 14 : 7;
      const normalizedEnrollment = enrollmentRow
        ? { ...enrollmentRow, track_type: isTwoWeek ? 'mind_2week' : 'mind_7day', current_day: Math.min(Number(enrollmentRow.current_day ?? 1), maxDay) }
        : enrollmentRow;
      if (enrollmentRow && !isTwoWeek && enrollmentRow.track_type !== "mind_7day") {
        supabase
          .from("mind_track_enrollments")
          .update({ track_type: "mind_7day", current_day: normalizedEnrollment.current_day })
          .eq("id", enrollmentRow.id)
          .then(({ error }) => {
            if (error) console.warn("[MindTrackWorkbook] 7-day normalization failed", error);
          });
      }
      setWorkbook(wb);
      setEnrollment(normalizedEnrollment);
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

  // 미래 Day 딥링크 보정: ?day=N 이 currentDay 보다 미래면 currentDay 로 redirect
  useEffect(() => {
    if (loading) return;
    if (!dayParamValid) return;
    if (dayParam <= currentDay) return;
    toast.info(`Day ${dayParam}은(는) 아직 열리지 않았어요. 오늘 Day ${currentDay}로 이동했어요.`);
    setSelectedDay(currentDay);
    const params = new URLSearchParams(searchParams);
    params.set("day", String(currentDay));
    params.delete("openMission");
    params.delete("checkin");
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, dayParam, dayParamValid, currentDay]);

  // 키보드 ←/→ 로 selectedDay 이동 (Dialog 열려있거나 input focus 일 땐 무시)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (activeMission) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const cur = selectedDay ?? currentDay;
      const next = e.key === "ArrowLeft" ? cur - 1 : cur + 1;
      if (next < 1 || next > 30) return;
      if (next > currentDay) return; // 미래 Day 차단
      e.preventDefault();
      setSelectedDay(next);
      const params = new URLSearchParams(searchParams);
      params.set("day", String(next));
      setSearchParams(params, { replace: true });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay, currentDay, activeMission]);


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

  // Day 30 도달 + 아직 완료처리 안된 경우 → 자동 finalize + 메일 발송 + 축하 모달
  // + 완주 후 ‘완성된 워크북’ 페이지로 자동 이동 (1회만)
  useEffect(() => {
    if (!enrollment) return;
    if (currentDay < 30) return;

    // 한 번 본 사용자에게는 다시 자동으로 띄우지 않음 (수동으로 다시 열 수 있는 버튼은 있음)
    const seenKey = `mt-celebrated-${enrollment.id}`;
    if (!sessionStorage.getItem(seenKey)) {
      setShowCelebration(true);
      sessionStorage.setItem(seenKey, "1");
    }

    // 자동 이동: enrollment가 완료 처리된 직후 1회만 완성 워크북 페이지로 점프
    const navKey = `mt-auto-nav-final-${enrollment.id}`;
    const maybeAutoNavigate = () => {
      if (typeof window === "undefined") return;
      if (sessionStorage.getItem(navKey)) return;
      sessionStorage.setItem(navKey, "1");
      // 축하 모달이 잠깐 보이도록 살짝 지연
      setTimeout(() => {
        navigate(`/mind-track/workbook-preview?enrollmentId=${enrollment.id}`);
      }, 2200);
    };

    if (enrollment.status === "completed" && enrollment.completed_at) {
      maybeAutoNavigate();
      return;
    }
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
        // 완주(또는 이미 완주) 케이스 모두 한 번 자동 이동
        maybeAutoNavigate();
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
  // - ?openMission=1 또는 ?mtOnce=<token> 플래그가 있으면 명시적으로 다시 열기
  // - mtOnce는 토큰 1개당 단 한 번만 동작 (sessionStorage로 중복 방지) → 새로고침/뒤로가기 재진입 시에도 추가 오픈 없음
  const autoOpenedRef = useRef(false);
  const consumedOnceTokensRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (loading) return;
    const dp = parseInt(searchParams.get("day") ?? "", 10);
    // checkin=1 은 openMission=1 의 사용자 친화 별칭
    const explicitFlag = searchParams.get("openMission") === "1" || searchParams.get("checkin") === "1";
    const onceToken = searchParams.get("mtOnce");
    let onceValid = false;
    if (onceToken) {
      const sessionKey = `mt-once:${onceToken}`;
      const alreadyConsumed =
        consumedOnceTokensRef.current.has(onceToken) ||
        (typeof window !== "undefined" && window.sessionStorage.getItem(sessionKey) === "1");
      if (!alreadyConsumed) onceValid = true;
    }
    const explicitOpen = explicitFlag || onceValid;

    if (!Number.isFinite(dp)) return;
    if (dp !== currentDay) return;

    const cleanupParams = () => {
      const params = new URLSearchParams(searchParams);
      let changed = false;
      if (params.has("openMission")) { params.delete("openMission"); changed = true; }
      if (params.has("checkin")) { params.delete("checkin"); changed = true; }
      if (params.has("mtOnce")) { params.delete("mtOnce"); changed = true; }
      if (changed) setSearchParams(params, { replace: true });
    };

    // 완료된 미션은 자동 오픈 금지
    const completed = checkins.some((c) => c.day_number === dp && c.completed);
    if (completed) {
      if (explicitFlag || onceToken) cleanupParams();
      return;
    }
    if (autoOpenedRef.current && !explicitOpen) return;

    const m = missions.find((mm) => mm.day_number === dp);
    if (m) {
      // 추천 베이스라인 검사가 있는데 아직 안 했으면 체크인 다이얼로그를 자동으로 띄우지 않음
      // (검사부터 하지 않으면 체크인을 제출해도 막혀버려 플로우가 이상하게 보임)
      const rec = getAssessmentForDay(dp);
      if (rec && !isAssessmentMissionCompleted(enrollment?.id, dp)) {
        if (explicitFlag || onceToken) cleanupParams();
        return;
      }
      autoOpenedRef.current = true;
      // mtOnce 토큰 소비 마킹 (같은 토큰으로 다시 열리지 않게)
      if (onceToken && onceValid) {
        consumedOnceTokensRef.current.add(onceToken);
        try { window.sessionStorage.setItem(`mt-once:${onceToken}`, "1"); } catch {}
      }
      openMission(m);
      cleanupParams();
    }
  }, [loading, searchParams, currentDay, missions, checkins, enrollment]);


  const openMission = (mission: any) => {
    const existing = checkins.find((c) => c.day_number === mission.day_number);
    setActiveMission(mission);
    // 검사 자동 prepend 블록은 제외하고 사용자 회고만 에디터에 노출
    setReflectionNote(extractUserReflection(existing?.reflection_note));
    setMoodScore(existing?.mood_score ?? 5);
    setEnergyScore(existing?.energy_score ?? 5);
    setClarityScore(existing?.clarity_score ?? 5);
  };

  const submitCheckin = async () => {
    if (!activeMission || !enrollment) return;

    // ── Day 1·2 추천 검사 미션 검증 ──────────────────────────
    const recommendedAssessment = getAssessmentForDay(activeMission.day_number);
    if (
      recommendedAssessment &&
      !isAssessmentMissionCompleted(enrollment.id, activeMission.day_number)
    ) {
      toast.error(
        `'${recommendedAssessment.title}'을(를) 먼저 완료해 주세요. 미션 카드에서 시작할 수 있어요.`,
      );
      return;
    }

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

    // 회고는 선택 입력. 비어 있어도 체크인 진행

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const existing = checkins.find((c) => c.day_number === activeMission.day_number);
      // 검사 자동 블록(<!--mt:assessment ...-->)은 사용자가 회고를 저장해도 보존되어야 함
      const existingNote = existing?.reflection_note ?? "";
      const userClean = reflectionNote.trim();
      const autoBlock = existingNote.replace(stripAssessmentBlocks(existingNote), "").trim();
      const mergedReflection = autoBlock
        ? (userClean ? `${autoBlock}\n${userClean}` : autoBlock)
        : (userClean || null);
      const payload = {
        user_id: user!.id,
        enrollment_id: enrollment.id,
        mission_id: activeMission.id,
        day_number: activeMission.day_number,
        completed: true,
        mood_score: moodScore,
        energy_score: energyScore,
        clarity_score: clarityScore,
        reflection_note: mergedReflection,
        video_reflection: videoReflection || null,
        checked_at: new Date().toISOString(),
      };
      if (existing) {
        await supabase.from("mind_track_checkins").update(payload).eq("id", existing.id);
      } else {
        await supabase.from("mind_track_checkins").insert(payload);
      }
      toast.success("체크인 완료");
      setActiveMission(null);
      load();
      // 대시보드/위젯 즉시 갱신을 위해 캐시 무효화 + 커스텀 이벤트 브로드캐스트
      try {
        const { clearMindTrackDashboardCache } = await import("@/hooks/useMindTrackDashboard");
        clearMindTrackDashboardCache();
      } catch {}
      try {
        window.dispatchEvent(new CustomEvent("mt:checkin-updated"));
      } catch {}
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

  // 현재 상품의 기본 워크북은 7일 트랙으로 고정한다.
  // 기존 사용자에게 남아있는 mind_30day enrollment도 여기서는 7일 워크북으로 보여주고,
  // 30일 확장은 Day 7 이후 제안 카드/랜딩에서만 다룬다.
  if (enrollment?.id) {
    return <SevenDayWorkbookView enrollmentId={enrollment.id} />;
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

          {/* ✅ 단일 홈으로 돌아가는 명확한 경로 — UX 단순화 */}
          <button
            onClick={() => navigate("/mind-track/dashboard")}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            오늘 한눈에 보기 (대시보드)
          </button>

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

          {/* 내가 정한 트랙 — 한글 라벨화 + 고급 미니멀 카드 */}
          {enrollment && (() => {
            const trackTypeLabel: Record<string, { label: string; icon: typeof Brain; tint: string; ring: string }> = {
              stress:        { label: "스트레스 완화",   icon: Wind,     tint: "bg-sky-50 text-sky-700",         ring: "ring-sky-200/60" },
              anxiety:       { label: "불안 다스리기",   icon: Heart,    tint: "bg-rose-50 text-rose-700",       ring: "ring-rose-200/60" },
              depression:    { label: "우울감 회복",     icon: Sparkle,  tint: "bg-violet-50 text-violet-700",   ring: "ring-violet-200/60" },
              focus:         { label: "집중력 회복",     icon: Target,   tint: "bg-emerald-50 text-emerald-700", ring: "ring-emerald-200/60" },
              relationship:  { label: "관계 회복",       icon: Users,    tint: "bg-amber-50 text-amber-700",     ring: "ring-amber-200/60" },
              sleep:         { label: "수면 개선",       icon: Brain,    tint: "bg-blue-50 text-blue-700",       ring: "ring-blue-200/60" },
              selfesteem:    { label: "자존감 회복",     icon: Trophy,   tint: "bg-yellow-50 text-yellow-700",   ring: "ring-yellow-200/60" },
              burnout:       { label: "번아웃 회복",     icon: Activity, tint: "bg-orange-50 text-orange-700",   ring: "ring-orange-200/60" },
              mind_30day:    { label: "30일 마음 트랙",  icon: Sparkles, tint: "bg-[#C8B88A]/15 text-[#8a7a4d]", ring: "ring-[#C8B88A]/40" },
              child_development: { label: "자녀 발달 케어", icon: Heart, tint: "bg-pink-50 text-pink-700",       ring: "ring-pink-200/60" },
            };
            // 영문 raw 키 → 한글 라벨 사전
            const KO_LABEL: Record<string, string> = {
              child_development: "자녀 발달 케어",
              mind_30day: "30일 마음 트랙",
              stress: "스트레스 완화",
              anxiety: "불안 다스리기",
              depression: "우울감 회복",
              focus: "집중력 회복",
              relationship: "관계 회복",
              sleep: "수면 개선",
              selfesteem: "자존감 회복",
              burnout: "번아웃 회복",
              parenting: "육아 스트레스",
              work_stress: "업무 스트레스",
              study: "학업 집중",
              // life_stage
              adult: "성인", student: "학생", parent: "부모", senior: "시니어", teen: "청소년",
              // duration
              less_than_month: "한 달 미만",
              one_to_three_months: "1~3개월",
              three_to_six_months: "3~6개월",
              six_to_twelve_months: "6개월~1년",
              over_year: "1년 이상",
              recent: "최근 시작",
            };
            const toKo = (v: any): string => {
              if (v == null) return "";
              const s = String(v);
              return KO_LABEL[s] ?? KO_LABEL[s.toLowerCase()] ?? s.replace(/_/g, " ");
            };

            const tType = (enrollment.track_type || "").toLowerCase();
            const trackInfo = trackTypeLabel[tType] || { label: toKo(enrollment.track_type) || "맞춤 트랙", icon: Sparkles, tint: "bg-[#C8B88A]/15 text-[#8a7a4d]", ring: "ring-[#C8B88A]/40" };
            const TIcon = trackInfo.icon;
            const rawGoal = enrollment.goal_focus || enrollment.baseline_data?.primary_goal || enrollment.baseline_data?.goal;
            const rawConcern = enrollment.baseline_data?.primary_concern || enrollment.baseline_data?.free_text_concern;
            const goal = rawGoal ? toKo(rawGoal) : "";
            const concern = rawConcern ? toKo(rawConcern) : "";
            const lifeStage = enrollment.baseline_data?.life_stage ? toKo(enrollment.baseline_data.life_stage) : "";
            const duration = enrollment.baseline_data?.issue_duration ? toKo(enrollment.baseline_data.issue_duration) : "";
            const moodScore = enrollment.baseline_data?.current_mood_score;

            // 자연스러운 문장형 다듬기
            const hasJongseong = (ch: string) => {
              const code = ch.charCodeAt(0);
              if (code < 0xAC00 || code > 0xD7A3) return false;
              return (code - 0xAC00) % 28 !== 0;
            };
            const eulReul = (s: string) => (s && hasJongseong(s.slice(-1)) ? "을" : "를");
            const polishGoal = (s: string) => {
              if (!s) return "";
              const t = s.trim().replace(/[.!~。]+$/, "");
              if (/(요|다|함|기|음|죠|네|까|니다)$/.test(t)) return t + ".";
              return `${t}${eulReul(t)} 바라고 있어요.`;
            };
            const polishConcern = (s: string) => {
              if (!s) return "";
              const t = s.trim().replace(/[.!~。]+$/, "");
              if (/(요|다|함|기|음|죠|네|까|니다)$/.test(t)) return t + ".";
              return `요즘 ${t} 때문에 마음이 무거워요.`;
            };
            const startedDate = new Date(enrollment.started_at);
            const startedSentence = `${startedDate.getFullYear()}년 ${startedDate.getMonth() + 1}월 ${startedDate.getDate()}일에 시작했어요`;

            return (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="track-detail" className="border-0">
                  <Card className={`overflow-hidden bg-white border border-[#C8B88A]/30 ring-1 ${trackInfo.ring} shadow-[0_2px_24px_-12px_rgba(200,184,138,0.35)] rounded-2xl`}>
                    <AccordionTrigger className="hover:no-underline px-5 py-4 [&[data-state=open]>div>svg.chevron]:rotate-180">
                      <div className="flex items-center gap-3.5 w-full text-left">
                        <div className={`w-11 h-11 rounded-xl ${trackInfo.tint} flex items-center justify-center shrink-0 ring-1 ${trackInfo.ring}`}>
                          <TIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold tracking-[0.14em] text-[#8a7a4d]">
                              ◆ 내가 정한 목표
                            </span>
                          </div>
                          <div className="text-[15px] font-bold text-slate-900 truncate leading-tight">
                            {trackInfo.label}
                          </div>
                          <div className="text-xs text-slate-500 truncate mt-1">
                            {goal
                              ? `${goal}${eulReul(goal)} 함께 만들어가요`
                              : concern
                                ? `${concern}, 30일 동안 차근차근`
                                : "30일 동안 마음을 차근차근 다져가요"}
                          </div>
                        </div>
                        <ChevronRight className="chevron w-4 h-4 text-slate-400 transition-transform shrink-0" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-5 pt-0">
                      <div className="space-y-4 pt-3 border-t border-[#C8B88A]/20">
                        {goal && (
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-bold tracking-[0.14em] text-[#8a7a4d]">
                              ✦ 이번 30일, 이렇게 달라지고 싶어요
                            </div>
                            <p className="text-sm text-slate-800 break-keep leading-relaxed">
                              {polishGoal(goal)}
                            </p>
                          </div>
                        )}
                        {concern && (
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-bold tracking-[0.14em] text-[#8a7a4d]">
                              ✦ 지금 마음에 걸리는 것
                            </div>
                            <p className="text-sm text-slate-700 break-keep leading-relaxed">
                              {polishConcern(concern)}
                            </p>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {lifeStage && (
                            <Badge variant="outline" className="text-[10px] bg-slate-50 font-medium">
                              ◇ {lifeStage}으로 살아가는 중
                            </Badge>
                          )}
                          {duration && (
                            <Badge variant="outline" className="text-[10px] bg-slate-50 font-medium">
                              ◷ {duration}째 이어진 고민
                            </Badge>
                          )}
                          {typeof moodScore === "number" && (
                            <Badge variant="outline" className="text-[10px] bg-slate-50 font-medium">
                              ❖ 출발할 때 기분은 {moodScore}점이었어요
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[10px] bg-[#FAF8F2] border-[#C8B88A]/40 text-[#8a7a4d] font-medium">
                            ☘ {startedSentence}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs h-9 rounded-full border-[#C8B88A]/40 hover:bg-[#FAF8F2]"
                          onClick={() => navigate("/coaching-goals")}
                        >
                          목표 다시 설정하기
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              </Accordion>
            );
          })()}


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

            {currentDay >= 30 && enrollment && (
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => navigate(`/mind-track/workbook-preview?enrollmentId=${enrollment.id}`)}
                  className="flex-1 h-10 rounded-xl bg-[#8a7a4d] hover:bg-[#6f6240] text-white font-bold text-[12px]"
                >
                  완성된 워크북 보기 · PDF 받기
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCelebration(true)}
                  className="h-10 rounded-xl border-[#C8B88A]/50 text-[#8a7a4d] hover:bg-[#C8B88A]/10 hover:text-[#8a7a4d] font-bold text-[12px]"
                >
                  완주 배지 다시 보기
                </Button>
              </div>
            )}
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

          {/* "오늘 Day에 맞춘" 다음 추가 예고 미니카드 */}
          <NextChapterTeaser currentDay={currentDay} />

          {/* "내 워크북" 미리보기 — 30일 후 손에 남는 결과물을 시각화 (동기부여) */}
          {(() => {
            const nextMission =
              todayMission ?? missions.find((m) => m.day_number > currentDay) ?? null;
            const nextLabel = nextMission ? `Day ${nextMission.day_number} 미션` : undefined;
            return (
              <WorkbookPreviewCard
                currentDay={currentDay}
                completedCount={completedCount}
                trackTheme={workbook?.challenge_theme}
                nickname={enrollment?.baseline_data?.nickname || enrollment?.baseline_data?.display_name}
                checkins={checkins}
                baselines={baselines}
                enrollmentId={enrollment?.id}
                celebrationDisplayPolicy="session"
                nextMissionLabel={nextLabel}
                hasTodayMission={!!todayMission}
                onContinueCheckin={() => {
                  // 오늘 미션 우선, 없으면 가장 가까운 다음 미션으로 자동 이동
                  if (todayMission) {
                    setActiveMission(todayMission);
                  } else if (nextMission) {
                    setActiveMission(nextMission);
                  } else {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
              />
            );
          })()}

          {/* 1/2/3/4주차 챕터 예고 카드 */}
          <WeeklyChapterPreview currentDay={currentDay} />

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

                {/* 미션 상세 — 아코디언으로 정리해서 한눈에 보이고 필요할 때만 펼치기 */}
                {(() => {
                  const hasContext =
                    todayMission.why_it_matters ||
                    (Array.isArray(todayMission.action_steps) && todayMission.action_steps.length > 0) ||
                    todayMission.success_criteria ||
                    (Array.isArray(todayMission.deeper_prompts) && todayMission.deeper_prompts.length > 0);
                  const hasVideos =
                    Array.isArray(todayMission.youtube_candidates) && todayMission.youtube_candidates.length > 0;
                  const hasAssessment = !!(enrollment && getAssessmentForDay(currentDay));

                  return (
                    <Accordion
                      type="multiple"
                      defaultValue={hasAssessment ? ["assessment"] : hasVideos ? ["video"] : ["context"]}
                      className="mb-4 rounded-xl border border-slate-200 bg-white divide-y divide-slate-100"
                    >
                      {hasContext && (
                        <AccordionItem value="context" className="border-b-0 px-3">
                          <AccordionTrigger className="py-3 text-sm font-bold text-slate-800 hover:no-underline">
                            <span className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-[#8a7a4d]" />
                              미션 가이드 · 왜 / 단계 / 완료 기준
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="pb-3">
                            <div className="space-y-3">
                              {todayMission.why_it_matters && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                                  <div className="text-[11px] font-bold text-amber-800 mb-1">왜 이 미션인가</div>
                                  <p className="text-sm text-amber-900 break-keep leading-relaxed">{todayMission.why_it_matters}</p>
                                </div>
                              )}
                              {Array.isArray(todayMission.action_steps) && todayMission.action_steps.length > 0 && (
                                <div className="rounded-xl border border-slate-200 bg-white p-3">
                                  <div className="text-[11px] font-bold text-slate-700 mb-2">오늘 할 일 단계</div>
                                  <ol className="space-y-1.5">
                                    {todayMission.action_steps.map((step: string, i: number) => (
                                      <li key={i} className="flex items-start gap-2 text-sm text-slate-800 break-keep">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center">{i + 1}</span>
                                        <span className="leading-relaxed">{step}</span>
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                              {todayMission.success_criteria && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                                  <div className="text-[11px] font-bold text-emerald-800 mb-1">완료 기준</div>
                                  <p className="text-sm text-emerald-900 break-keep leading-relaxed">{todayMission.success_criteria}</p>
                                </div>
                              )}
                              {Array.isArray(todayMission.deeper_prompts) && todayMission.deeper_prompts.length > 0 && (
                                <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3">
                                  <div className="text-[11px] font-bold text-indigo-800 mb-2">체크인 때 함께 생각해볼 질문</div>
                                  <ul className="space-y-1 text-sm text-indigo-900">
                                    {todayMission.deeper_prompts.map((q: string, i: number) => (
                                      <li key={i} className="break-keep leading-relaxed">· {q}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {/* 미션 타입 라이브러리 가이드 */}
                              <div className={`rounded-xl p-3 bg-gradient-to-br ${guide.color} text-white`}>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <GuideIcon className="w-4 h-4" />
                                  <span className="text-xs font-bold">{guide.label}</span>
                                </div>
                                <ol className="text-xs space-y-1 list-decimal list-inside opacity-95">
                                  {guide.steps.map((s, i) => <li key={i} className="break-keep">{s}</li>)}
                                </ol>
                              </div>
                              {todayMission.difficulty && (
                                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 font-semibold">
                                    난이도 · {todayMission.difficulty === 'deep' ? '깊은 작업' : todayMission.difficulty === 'easy' ? '가볍게' : '보통'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}

                      {hasAssessment && (
                        <AccordionItem value="assessment" className="border-b-0 px-3">
                          <AccordionTrigger className="py-3 text-sm font-bold text-slate-800 hover:no-underline">
                            <span className="flex items-center gap-2">
                              <Stethoscope className="w-4 h-4 text-[#8a7a4d]" />
                              추천 자가검사 · 미션 연동
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="pb-3">
                            <MissionAssessmentCard
                              recommendation={getAssessmentForDay(currentDay)!}
                              enrollmentId={enrollment!.id}
                              day={currentDay}
                              onChanged={() => setMissions((prev) => [...prev])}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      )}

                      {hasVideos && (
                        <AccordionItem value="video" className="border-b-0 px-3">
                          <AccordionTrigger className="py-3 text-sm font-bold text-slate-800 hover:no-underline">
                            <span className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-[#8a7a4d]" />
                              학습 영상 + 한 줄 회고
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="pb-3">
                            <MissionLearningCard
                              missionId={todayMission.id}
                              missionType={todayMission.mission_type}
                              candidates={todayMission.youtube_candidates as any}
                              initialWatched={Array.isArray((todayMission as any).watched_video_ids) ? (todayMission as any).watched_video_ids : []}
                              initialReflection={todayCheckin?.video_reflection ?? ""}
                              initialDraftReflection={(todayMission as any).video_reflection_draft ?? ""}
                              reflectionReadonly={!!todayCheckin?.completed}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </Accordion>
                  );
                })()}
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
                    {extractUserReflection(todayCheckin.reflection_note) && (
                      <p className="mt-2 text-xs text-slate-600 break-keep bg-white border border-slate-200 rounded-lg p-2">
                        {extractUserReflection(todayCheckin.reflection_note)}
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

          {/* 한눈에 보는 30일 로드맵: 주차별 테마 + 전문가 개입 (아코디언) */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> 30일 로드맵 한눈에 보기
              </h3>
              <Badge variant="outline" className="text-[10px]">현재 Day {currentDay}</Badge>
            </div>

            {/* 미니 타임라인: 4주 + 마일스톤 점 */}
            <div className="relative mb-3">
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all"
                  style={{ width: `${Math.min(100, (currentDay / 30) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                <span>D1</span><span>D7</span><span>D14</span><span>D21</span><span>D30</span>
              </div>
            </div>

            {/* 4주 + 4개 개입 마일스톤 — 한 줄 그리드 */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {[1, 2, 3, 4].map((wk) => {
                const wt = workbook.weekly_themes?.find((w: any) => w.week === wk);
                const isCurrent = Math.ceil(currentDay / 7) === wk;
                const isPast = Math.ceil(currentDay / 7) > wk;
                const milestoneDay = wk * 7;
                const milestoneReached = currentDay >= milestoneDay;
                return (
                  <div
                    key={wk}
                    className={`p-2 rounded-lg border text-center ${
                      isCurrent ? "border-primary bg-primary/5" :
                      isPast ? "border-emerald-200 bg-emerald-50/40" :
                      "border-slate-200 bg-slate-50/40"
                    }`}
                  >
                    <div className="text-[9px] text-slate-500 font-semibold">W{wk}</div>
                    <div className="text-[10px] font-bold text-slate-900 break-keep leading-tight mt-0.5 line-clamp-2 min-h-[24px]">
                      {wt?.theme || "—"}
                    </div>
                    <div className="mt-1 flex items-center justify-center">
                      <Stethoscope className={`w-3 h-3 ${milestoneReached ? "text-amber-500" : "text-slate-300"}`} />
                      <span className={`text-[9px] ml-0.5 ${milestoneReached ? "text-amber-600 font-semibold" : "text-slate-400"}`}>D{milestoneDay}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 상세는 아코디언으로 */}
            <Accordion type="single" collapsible className="w-full">
              {workbook.weekly_themes && (
                <AccordionItem value="themes" className="border-b">
                  <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-primary" /> 주차별 테마 자세히 보기
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-1">
                      {workbook.weekly_themes.map((wt: any) => {
                        const isCurrent = Math.ceil(currentDay / 7) === wt.week;
                        return (
                          <div
                            key={wt.week}
                            className={`p-2.5 rounded-lg border ${isCurrent ? "border-primary bg-primary/5" : "border-slate-200"}`}
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={isCurrent ? "default" : "outline"} className="text-[10px]">Week {wt.week}</Badge>
                              <span className="font-semibold text-sm text-slate-900 break-keep">{wt.theme}</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 break-keep">{wt.focus}</p>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              <AccordionItem value="intervention" className="border-b-0">
                <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">
                  <span className="flex items-center gap-2">
                    <Stethoscope className="w-3.5 h-3.5 text-amber-500" /> 전문가 개입 일정 자세히 보기
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <InterventionCalendar currentDay={currentDay} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          {/* AI 프리미엄 부가가치 — 트랙 안에서 제공되는 것들 */}
          <Card className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkle className="w-4 h-4 text-amber-300" />
              <h3 className="font-bold">트랙에 포함된 AI 가치</h3>
              <Badge className="bg-amber-400/20 text-amber-200 border-amber-400/30 text-[10px] ml-auto">PREMIUM</Badge>
            </div>
            <p className="text-xs text-slate-300 mb-4 break-keep">
              30일 동안 매일 쌓이는 데이터를 분석해 단순 일기 앱이 아닌 진짜 변화를 만드는 도구로 작동합니다.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Brain, title: "개인 맞춤 미션 생성", desc: "당신의 검사 결과 + 지난 체크인을 학습해 매주 미션 자동 재설계" },
                { icon: BarChart3, title: "감정 추적 분석", desc: "매일 기분/에너지 점수를 시계열로 분석, 패턴과 트리거 자동 추출" },
                { icon: Mic, title: "AI 음성 코치 (예정)", desc: "ElevenLabs 기반 호흡·이완 음성 가이드 — 5월 오픈" },
                { icon: ShieldCheck, title: "위기 자동 감지", desc: "체크인 텍스트에서 위험 신호 감지 시 즉시 전문가 매칭 제안" },
                { icon: Award, title: "마일스톤 리포트", desc: "Day 7/14/21/30에 자동 PhD급 분석 리포트 생성" },
                { icon: Video, title: "맞춤 영상 큐레이션", desc: "오늘의 미션·기분에 맞춰 YouTube 영상 매일 자동 추천" },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                    <Icon className="w-4 h-4 text-amber-300 mb-1" />
                    <div className="text-xs font-bold break-keep">{f.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 break-keep leading-tight">{f.desc}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Day 네비게이션 — 이전/다음/오늘 미션 점프 */}
          {(() => {
            const sd = selectedDay ?? currentDay;
            const canPrev = sd > 1;
            const nextDay = sd + 1;
            const canNext = nextDay <= 30 && nextDay <= currentDay;
            const showJumpToday = sd !== currentDay;
            const goDay = (d: number, opts?: { openMission?: boolean }) => {
              setSelectedDay(d);
              const params = new URLSearchParams(searchParams);
              params.set("day", String(d));
              if (opts?.openMission) params.set("openMission", "1");
              else params.delete("openMission");
              setSearchParams(params, { replace: true });
              dayButtonRefs.current[d]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            };
            return (
              <Card className="p-3 sm:p-4 flex items-center gap-2 flex-wrap justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!canPrev}
                    onClick={() => goDay(sd - 1)}
                    aria-label="이전 Day"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> 이전 Day
                  </Button>
                  <div className="text-xs sm:text-sm font-bold text-slate-700">
                    Day {String(sd).padStart(2, "0")} / 30
                    {sd === currentDay && (
                      <span className="ml-1.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">오늘</span>
                    )}
                  </div>
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!canNext}
                            onClick={() => goDay(sd + 1)}
                            aria-label="다음 Day"
                          >
                            다음 Day <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {!canNext && (
                        <TooltipContent side="bottom" className="text-xs">
                          {sd >= 30 ? "마지막 Day 입니다" : "아직 잠긴 미래 Day 예요"}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {showJumpToday && (
                  <Button
                    size="sm"
                    onClick={() => goDay(currentDay, { openMission: true })}
                    className="bg-[#1a1a1a] text-white hover:bg-black"
                  >
                    <Target className="w-3.5 h-3.5" /> 오늘 미션으로 점프
                  </Button>
                )}
              </Card>
            );
          })()}

          {/* 대시보드 vs 워크북 안내 */}
          <DashboardVsWorkbookHelp mode="workbook" />

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

            {/* 트랙이 제공하는 것 — 범례 */}
            <div className="mt-3 mb-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <div className="text-[11px] font-bold text-slate-700 mb-2">이 30일 트랙이 제공하는 것</div>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1"><Brain className="w-3 h-3 text-indigo-500" /> 자기 탐색</span>
                <span className="inline-flex items-center gap-1"><Wind className="w-3 h-3 text-sky-500" /> 호흡 가이드</span>
                <span className="inline-flex items-center gap-1"><PenLine className="w-3 h-3 text-amber-600" /> 저널링</span>
                <span className="inline-flex items-center gap-1"><Activity className="w-3 h-3 text-rose-500" /> 행동 미션</span>
                <span className="inline-flex items-center gap-1"><Users className="w-3 h-3 text-emerald-600" /> 관계 연습</span>
                <span className="inline-flex items-center gap-1"><Video className="w-3 h-3 text-purple-500" /> 추천 영상</span>
                <span className="inline-flex items-center gap-1"><Stethoscope className="w-3 h-3 text-amber-600" /> 전문가 개입(Day 7·14·21·30)</span>
                <span className="inline-flex items-center gap-1"><Award className="w-3 h-3 text-amber-500" /> 마일스톤 리포트</span>
              </div>
            </div>

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
                const isMilestone = day === 7 || day === 14 || day === 21 || day === 30;
                const hasVideo = Array.isArray(mission?.youtube_candidates) && mission!.youtube_candidates.length > 0;

                // 미션 타입별 셀 안 작은 아이콘
                const TypeIcon =
                  mission?.mission_type === "breathing" ? Wind :
                  mission?.mission_type === "journaling" ? PenLine :
                  mission?.mission_type === "action" ? Activity :
                  mission?.mission_type === "connection" ? Users :
                  mission?.mission_type === "reflection" ? Brain :
                  null;

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
                    title={mission?.mission_title ?? (isLocked ? "다음주 미션 자동 생성 대기" : "")}
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
                    {/* 마일스톤 표식 (왼쪽 위 작은 점) */}
                    {isMilestone && !isLocked && (
                      <span
                        className={`absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm ${
                          checkin?.completed ? "bg-amber-300 text-amber-900" : "bg-amber-400 text-white"
                        }`}
                        aria-label="전문가 개입 마일스톤"
                      >
                        <Stethoscope className="w-2 h-2" />
                      </span>
                    )}
                    {/* 영상 보유 표식 (오른쪽 위) */}
                    {hasVideo && !isLocked && (
                      <span
                        className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm ${
                          checkin?.completed ? "bg-white/90 text-emerald-700" : "bg-purple-500 text-white"
                        }`}
                        aria-label="추천 영상 포함"
                      >
                        <Video className="w-2 h-2" />
                      </span>
                    )}

                    {/* 메인: 완료/잠금/Day 숫자 */}
                    {checkin?.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : isLocked && !isFuture ? (
                      <Lock className="w-3 h-3" />
                    ) : (
                      <span className="leading-none">{day}</span>
                    )}

                    {/* 미션 타입 아이콘 (셀 하단, 잠금 아닐 때만) */}
                    {TypeIcon && !isLocked && (
                      <TypeIcon
                        className={`w-2.5 h-2.5 mt-0.5 ${
                          checkin?.completed
                            ? "text-white/80"
                            : isToday
                            ? "text-white/80"
                            : "text-slate-400"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center break-keep">
              ✓ 완료 · 오늘은 강조 · 자물쇠 = 다음주 미션 자동 생성 대기 ·
              <Stethoscope className="inline w-3 h-3 mx-0.5 text-amber-500" />전문가 개입일 ·
              <Video className="inline w-3 h-3 mx-0.5 text-purple-500" />영상 포함
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

      {/* Check-in Dialog — 단계형 가이드 */}
      <Dialog open={!!activeMission} onOpenChange={(o) => !o && setActiveMission(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-left break-keep">{activeMission?.mission_title}</DialogTitle>
          </DialogHeader>
          {(() => {
            const pendingAssessment = activeMission
              ? (() => {
                  const rec = getAssessmentForDay(activeMission.day_number);
                  if (!rec) return null;
                  if (isAssessmentMissionCompleted(enrollment?.id, activeMission.day_number)) return null;
                  return rec;
                })()
              : null;

            if (pendingAssessment) {
              return (
                <div className="space-y-4 pt-2">
                  {activeMission?.mission_description && (
                    <p className="text-sm text-slate-600 break-keep leading-relaxed">
                      {activeMission.mission_description}
                    </p>
                  )}
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 space-y-2">
                    <div className="text-[12px] font-bold text-amber-800">먼저 베이스라인 진단부터</div>
                    <div className="text-sm font-semibold text-slate-900 break-keep">{pendingAssessment.title}</div>
                    <p className="text-[12px] text-slate-600 leading-relaxed break-keep">
                      {pendingAssessment.why} 약 {pendingAssessment.minutes}분이면 끝나고, 끝나면 자동으로 워크북으로 돌아와 오늘의 체크인을 이어갈 수 있어요.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      const rec = pendingAssessment;
                      setActiveMission(null);
                      navigate(rec.route, {
                        state: {
                          from: "mind-track-mission",
                          enrollmentId: enrollment?.id,
                          day: activeMission!.day_number,
                          missionId: activeMission!.id,
                        },
                      });
                    }}
                    className="w-full bg-[#1a1a1a] text-white hover:bg-black rounded-xl"
                  >
                    지금 {pendingAssessment.minutes}분 진단 시작하기
                  </Button>
                  <button
                    type="button"
                    onClick={() => setActiveMission(null)}
                    className="w-full text-[12px] text-slate-500 hover:text-slate-700"
                  >
                    나중에 할게요
                  </button>
                </div>
              );
            }

            return (
              <div className="space-y-5 pt-2">
                {activeMission?.mission_description && (
                  <p className="text-sm text-slate-600 break-keep leading-relaxed">
                    {activeMission.mission_description}
                  </p>
                )}

                {/* 컨디션 슬라이더 */}
                <div className="space-y-2 rounded-2xl bg-slate-50 p-4">
                  <div className="space-y-0.5">
                    <div className="text-[13px] font-semibold text-slate-900">미션을 마친 지금, 컨디션을 살짝 기록해 주세요</div>
                    <p className="text-[11px] text-slate-500 leading-relaxed break-keep">
                      점수는 평가가 아니라 "지금 내 상태" 표시예요. 0에 가까울수록 힘들고, 10에 가까울수록 편해요. 매일 기록하면 7일 뒤 변화 그래프로 보여드려요.
                    </p>
                  </div>
                  {[
                    { state: moodScore, set: setMoodScore, label: "지금 마음이 얼마나 편한가요?", icon: Heart, low: "많이 무거움", high: "꽤 편안함" },
                    { state: energyScore, set: setEnergyScore, label: "지금 몸이 얼마나 가벼운가요?", icon: Zap, low: "많이 지침", high: "꽤 가벼움" },
                    { state: clarityScore, set: setClarityScore, label: "지금 생각이 얼마나 정리됐나요?", icon: Eye, low: "많이 복잡함", high: "꽤 선명함" },
                  ].map((s) => (
                    <div key={s.label} className="space-y-1 pt-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-700 break-keep">
                          <s.icon className="w-3.5 h-3.5 shrink-0" /> {s.label}
                        </div>
                        <span className="text-base font-bold text-slate-900 tabular-nums">{s.state}<span className="text-[11px] font-normal text-slate-400">/10</span></span>
                      </div>
                      <Slider value={[s.state]} onValueChange={(v) => s.set(v[0])} min={0} max={10} step={1} />
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>0 · {s.low}</span>
                        <span>{s.high} · 10</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 오늘의 한 줄 (선택) */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    오늘의 한 줄 <span className="text-slate-400 text-xs font-normal">(선택)</span>
                  </label>
                  <Textarea
                    value={reflectionNote}
                    onChange={(e) => setReflectionNote(e.target.value)}
                    placeholder="한 문장이면 충분해요. 예) 호흡 5분 뒤 어깨가 한결 가벼워졌어요."
                    rows={2}
                    className="resize-none"
                  />
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            {(() => {
              const blocked = activeMission
                ? !!getAssessmentForDay(activeMission.day_number) &&
                  !isAssessmentMissionCompleted(enrollment?.id, activeMission.day_number)
                : false;
              if (blocked) return null;
              return (
                <Button onClick={submitCheckin} disabled={submitting} className="w-full bg-[#1a1a1a] text-white hover:bg-black rounded-xl">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  체크인 완료
                </Button>
              );
            })()}
          </DialogFooter>

        </DialogContent>
      </Dialog>

      {/* 30일 완주 축하 — 배지/공유 이미지 */}
      {enrollment && (
        <WorkbookCompletionCelebration
          open={showCelebration}
          onOpenChange={setShowCelebration}
          nickname={enrollment?.baseline_data?.nickname || enrollment?.baseline_data?.display_name || "당신"}
          trackTheme={workbook?.challenge_theme || "30일 마음 트랙"}
          startedAt={enrollment?.started_at}
          completedAt={enrollment?.completed_at}
          totalCheckins={completedCount}
          onDownloadWorkbook={() =>
            navigate(`/mind-track/workbook-preview?enrollmentId=${enrollment.id}`)
          }
        />
      )}
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
