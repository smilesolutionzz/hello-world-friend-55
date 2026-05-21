import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MindTrackTrialPaywall from "@/components/mind-track/MindTrackTrialPaywall";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, ArrowRight, CheckCircle2, Circle, HelpCircle, Phone, Calendar,
  PlayCircle, Loader2, BookOpen, BarChart3, MessageSquareHeart, Target, Flame,
  RefreshCw,
} from "lucide-react";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import Footer from "@/components/ui/footer";
import SEOHead from "@/components/common/SEOHead";
import { MedicalDisclaimer } from "@/components/legal/MedicalDisclaimer";
import { supabase } from "@/integrations/supabase/client";
import { getDayCopy, calcMindTrackCurrentDay } from "@/lib/mindTrackDayCopy";
import MindTrackFirstTimeOnboarding from "@/components/mind-track/MindTrackFirstTimeOnboarding";
import MindTrackFocusSwitcher from "@/components/mind-track/MindTrackFocusSwitcher";
import { getFocus } from "@/lib/mindTrackFocusTracks";
import { toast } from "sonner";

interface Enrollment {
  id: string;
  started_at: string;
  current_day: number;
  status: string;
  goal_focus: string | null;
  payment_status: string;
  track_type: string | null;
}

/**
 * /mind-track/dashboard — 결제자 전용 풀 대시보드
 *
 * 비결제자/비로그인은 자동으로 /mind-track(랜딩)으로 리다이렉트.
 * 마케팅/가격/목표선택/무료리포트/아동발달 위젯은 일절 노출되지 않음.
 *
 * 구성:
 *  - Day N/30 헤더 + 진행률 + 연속 체크인(스트릭)
 *  - 오늘의 미션 카드 (큰 CTA)
 *  - 빠른 메뉴 (워크북 / 주간 리포트 / 코파일럿 / 전문가)
 *  - 주간 진행 미니 그리드
 *  - 베이스라인 지표 추이 (스트레스/에너지/명료도)
 *  - 최근 체크인 히스토리
 */
export default function MindTrackDashboard() {
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [recentCheckins, setRecentCheckins] = useState<
    Array<{ day_number: number; completed: boolean; reflection_note?: string | null; created_at: string; mood_score?: number | null }>
  >([]);
  const [allCheckins, setAllCheckins] = useState<Array<{ day_number: number; completed: boolean }>>([]);
  const [todayMission, setTodayMission] = useState<{
    mission_title?: string;
    mission_description?: string;
    why_it_matters?: string | null;
    action_steps?: string[] | null;
    success_criteria?: string | null;
    deeper_prompts?: string[] | null;
    estimated_minutes?: number | null;
    difficulty?: string | null;
    mission_type?: string | null;
    youtube_video_id?: string | null;
    youtube_title?: string | null;
    youtube_thumbnail?: string | null;
  } | null>(null);
  const [baseline, setBaseline] = useState<{ stress?: number; energy?: number; clarity?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [arrivedFromVideo, setArrivedFromVideo] = useState(false);
  const [reflectionRefreshKey, setReflectionRefreshKey] = useState(0);
  const [focusSwitcherOpen, setFocusSwitcherOpen] = useState(false);

  // 인증 + enrollment 조회 → 결제자 아니면 랜딩으로 보냄
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) {
        if (!cancelled) navigate("/auth?redirect=/mind-track/dashboard", { replace: true });
        return;
      }
      const { data, error } = await supabase
        .from("mind_track_enrollments")
        .select("id, started_at, current_day, status, goal_focus, payment_status, track_type")
        .eq("user_id", user.id)
        .in("status", ["active", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      const allowed = data && ['paid', 'completed', 'trial'].includes(data.payment_status);
      if (error || !allowed) {
        toast.info("아직 마음 트랙에 등록되지 않았어요");
        navigate("/mind-track", { replace: true });
        return;
      }
      setEnrollment(data as Enrollment);
      setUserId(user.id);
      setAuthChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // ────────────────────────────────────────────────────────────
  // UTM ingestion — record arrivals from daily-coaching email so
  // dashboard analytics can confirm the link wired up correctly.
  // Triggers a soft toast if the user just came back from watching a video.
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source");
    if (!utmSource) return;

    const utm = {
      source: utmSource,
      medium: params.get("utm_medium"),
      campaign: params.get("utm_campaign"),
      content: params.get("utm_content"),
      day: params.get("day"),
      after_video: params.get("after_video"),
      arrived_at: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem("mind_track_last_utm", JSON.stringify(utm));
      // Lightweight client analytics breadcrumb (PostHog/GA pickup if present)
      (window as any).dataLayer?.push?.({ event: "mind_track_utm_arrival", ...utm });
    } catch {
      /* noop */
    }

    if (utm.after_video) {
      setArrivedFromVideo(true);
      toast.success("영상은 어떠셨나요? 아래에 한 줄로 남겨보세요 ✍️");
      // 폼으로 자동 스크롤
      setTimeout(() => {
        document.querySelector('[data-testid="quick-reflection-form"]')
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 400);
    }
  }, []);


  const totalDays = useMemo(() => {
    const t = (enrollment?.track_type || "mind_7day").toLowerCase();
    return t.includes("30") ? 30 : 7;
  }, [enrollment?.track_type]);

  const day = useMemo(
    () => (enrollment ? calcMindTrackCurrentDay(enrollment.started_at, totalDays) : 1),
    [enrollment, totalDays]
  );
  const audience = ((enrollment as any)?.audience || 'child') as 'child' | 'adult' | 'parent' | 'teen';
  const copy = getDayCopy(day, totalDays, audience);
  const progressPct = Math.round((day / totalDays) * 100);
  const trackLabel = totalDays === 7 ? "7일 마음 트랙" : "30일 마음 트랙";
  const isShortTrack = totalDays === 7;
  const isFinalDay = day >= totalDays;

  // 첫 진입 1회 온보딩 + "오늘 다시 보지 않기" 지원
  const todayKey = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD (local-ish)
  useEffect(() => {
    if (!enrollment) return;
    if (typeof window === "undefined") return;
    const onboardedKey = `mind_track_onboarded_${enrollment.id}`;
    const snoozeKey = `mind_track_onboarding_snooze_${enrollment.id}`;
    const alreadyOnboarded = localStorage.getItem(onboardedKey);
    const snoozedDate = localStorage.getItem(snoozeKey);
    if (alreadyOnboarded) return;
    if (snoozedDate === todayKey()) return;
    setTimeout(() => setShowOnboarding(true), 300);
  }, [enrollment?.id]);

  const closeOnboarding = () => {
    if (!enrollment) return;
    localStorage.setItem(`mind_track_onboarded_${enrollment.id}`, new Date().toISOString());
    setShowOnboarding(false);
  };

  const snoozeOnboardingToday = () => {
    if (!enrollment) return;
    localStorage.setItem(`mind_track_onboarding_snooze_${enrollment.id}`, todayKey());
    setShowOnboarding(false);
    toast.success("오늘은 더 이상 보이지 않을게요");
  };

  const startTodayMission = () => {
    closeOnboarding();
    navigate(`/mind-track/workbook?day=${day}&openMission=1`);
  };

  // 데이터 로드 — realtime/이벤트에서도 다시 호출할 수 있도록 함수로 추출
  const loadDashboard = async (opts?: { silent?: boolean }) => {
    if (!enrollment) return;
    if (!opts?.silent) setLoading(true);
    const [{ data: missions }, { data: checkins }, { data: enr }] = await Promise.all([
      supabase
        .from("mind_track_daily_missions")
        .select("mission_title, mission_description, why_it_matters, action_steps, success_criteria, deeper_prompts, estimated_minutes, difficulty, mission_type, youtube_video_id, youtube_title, youtube_thumbnail")
        .eq("enrollment_id", enrollment.id)
        .eq("day_number", day)
        .maybeSingle(),
      supabase
        .from("mind_track_checkins")
        .select("day_number, completed, reflection_note, created_at, mood_score")
        .eq("enrollment_id", enrollment.id)
        .order("day_number", { ascending: false })
        .limit(50),
      supabase
        .from("mind_track_enrollments")
        .select("baseline_data")
        .eq("id", enrollment.id)
        .maybeSingle(),
    ]);
    setTodayMission((missions as any) ?? null);
    const list = (checkins ?? []) as any[];
    setRecentCheckins(list.slice(0, 5));
    setAllCheckins(list.map((c) => ({ day_number: c.day_number, completed: c.completed })));
    const bl = (enr?.baseline_data as any) ?? null;
    if (bl?.currentState) setBaseline(bl.currentState);
    if (!opts?.silent) setLoading(false);
  };

  useEffect(() => {
    if (!enrollment) return;
    let cancelled = false;
    (async () => {
      await loadDashboard();
      if (cancelled) return;
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollment?.id, day]);

  // Realtime — 체크인 변경 시 즉시 반영
  useEffect(() => {
    if (!enrollment?.id) return;
    const channel = supabase
      .channel(`mt-dashboard-checkins-${enrollment.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mind_track_checkins", filter: `enrollment_id=eq.${enrollment.id}` },
        () => { loadDashboard({ silent: true }); }
      )
      .subscribe();
    const onLocal = () => { loadDashboard({ silent: true }); };
    window.addEventListener("mt:checkin-updated", onLocal);
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("mt:checkin-updated", onLocal);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollment?.id, day]);


  // 연속 체크인(스트릭) 계산 — 오늘부터 거꾸로 끊김 없이 완료된 일수
  const streak = useMemo(() => {
    if (!allCheckins.length) return 0;
    const map = new Map(allCheckins.map((c) => [c.day_number, c.completed]));
    let s = 0;
    for (let d = day; d >= 1; d--) {
      if (map.get(d)) s++;
      else break;
    }
    return s;
  }, [allCheckins, day]);

  const completedCount = allCheckins.filter((c) => c.completed).length;

  if (authChecking || !enrollment) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  // 3일 무료 체험 게이트 — Day 4부터 결제 필요
  const isTrial = enrollment.payment_status === 'trial';
  if (isTrial && day >= 4) {
    return <MindTrackTrialPaywall currentDay={day} totalDays={totalDays} />;
  }

  // SEO — 트랙별 og:title/description + FAQPage 구조화 데이터
  const seoTitle = isShortTrack
    ? "7일 마음 트랙 · 내 대시보드 | AIHPRO"
    : "30일 마음 트랙 · 내 대시보드 | AIHPRO";
  const seoDesc = isShortTrack
    ? "7일 안에 진단·자기관찰·전문가 개입·회복 루틴까지 완주하는 압축 마음 변화 트랙. 오늘의 미션과 변화 추이를 한눈에."
    : "30일 마음 변화 트랙 대시보드 — 매주 단계별 미션과 변화 추이, 코칭 인사이트를 한눈에 확인하세요.";
  const faqList = isShortTrack ? FAQ_7 : FAQ_30;
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqList.map((q) => ({
      "@type": "Question",
      "name": q.q,
      "acceptedAnswer": { "@type": "Answer", "text": q.a },
    })),
  };

  const todayDone = allCheckins.find((c) => c.day_number === day)?.completed ?? false;
  const upsell = isShortTrack && day >= 3 ? getUpsellCopy(day, isFinalDay) : null;
  const focusInfo = getFocus(enrollment.goal_focus);
  const missionTitle = todayMission?.mission_title || copy.title;
  const missionDesc = todayMission?.mission_description || copy.description;

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDesc}
        canonicalUrl="https://aihpro.app/mind-track/dashboard"
        structuredData={faqStructuredData}
      />
      <div className="min-h-screen bg-white">
        <UnifiedNavigation />

        <MindTrackFirstTimeOnboarding
          open={showOnboarding}
          onClose={closeOnboarding}
          onStart={startTodayMission}
          onSnoozeToday={snoozeOnboardingToday}
          totalDays={totalDays}
          audience={audience}
          goalFocus={(enrollment as any)?.goal_focus ?? null}
          checkArea={
            (new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('area') as
              | 'language'
              | 'emotion'
              | 'social'
              | 'focus'
              | null) || null
          }
        />


        <main className="max-w-md mx-auto px-5 pt-20 pb-32 break-keep">
          {/* 1) 미니멀 진행 헤더 */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Day</span>
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums leading-none">{day}</span>
              <span className="text-sm text-slate-400 tabular-nums">/ {totalDays}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                연속 {streak}일
              </span>
              <span>·</span>
              <span>완료 {completedCount}일</span>
            </div>
          </div>
          <Progress value={progressPct} className="h-1 mb-6" />

          {/* 2) 오늘의 미션 — 단 하나의 명확한 액션 */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-4"
          >
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#8a7a4d]" />
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#8a7a4d]">
                오늘 할 일 · {copy.phase}
              </span>
            </div>

            {loading ? (
              <div className="py-10 flex items-center justify-center text-slate-300">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : (
              <>
                <h1 className="text-[22px] font-extrabold text-slate-900 leading-tight mb-2">
                  {missionTitle}
                </h1>
                <p className="text-[14px] text-slate-600 leading-relaxed mb-4">
                  {missionDesc}
                </p>

                <div className="flex items-center gap-1.5 flex-wrap mb-5">
                  {todayMission?.estimated_minutes ? (
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 rounded-full px-2.5 py-1">
                      약 {todayMission.estimated_minutes}분
                    </span>
                  ) : null}
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 rounded-full px-2.5 py-1">
                    {focusInfo.icon} {focusInfo.label}
                  </span>
                  {todayDone && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-1 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> 완료됨
                    </span>
                  )}
                </div>

                {/* 지금 할 일 1-2-3 — 단계별 체크리스트 */}
                {(() => {
                  const steps =
                    todayMission?.action_steps && todayMission.action_steps.length > 0
                      ? todayMission.action_steps.slice(0, 3)
                      : [
                          '조용한 자리를 잡고 휴대폰 알림을 잠깐 꺼 주세요.',
                          `미션 카드를 열고 안내대로 ${todayMission?.estimated_minutes ?? 5}분 진행해요.`,
                          '끝나면 오늘 느낀 점을 한 줄로 기록해요.',
                        ];
                  return (
                    <div className="mb-5 rounded-2xl bg-[#FBF8F1] border border-[#C8B88A]/40 px-4 py-4">
                      <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#8a7a4d] mb-2.5">
                        지금 할 일 · {steps.length}단계
                      </p>
                      <ol className="flex flex-col gap-2.5">
                        {steps.map((s, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span
                              className={`shrink-0 mt-0.5 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center tabular-nums ${
                                todayDone
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-white border border-[#C8B88A]/60 text-[#8a7a4d]'
                              }`}
                            >
                              {todayDone ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                            </span>
                            <p
                              className={`text-[14px] leading-relaxed ${
                                todayDone ? 'text-slate-500 line-through' : 'text-slate-800'
                              }`}
                            >
                              {s}
                            </p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  );
                })()}

                <Button
                  onClick={() => navigate(`/mind-track/workbook?day=${day}&openMission=1`)}
                  className="w-full h-14 text-[16px] font-bold bg-slate-900 hover:bg-black text-white rounded-2xl"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  {todayDone ? '오늘 미션 다시 보기' : '지금 시작하기'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-[11px] text-slate-400 text-center mt-3">
                  자정에 다음 일차로 자동 이동 · 놓친 일차도 언제든 가능
                </p>
              </>
            )}
          </motion.section>

          {/* 3) 막혔어요 — 보조 1회 */}
          <button
            onClick={() => navigate(`/expert-hiring?from=mission_difficult&day=${day}`)}
            className="w-full text-[13px] text-slate-500 underline underline-offset-2 hover:text-slate-900 mb-8"
          >
            막혔어요 · 전문가에게 5분만 물어보기
          </button>

          {/* 4) 진행 현황 — 펼침 */}
          <details className="bg-white border border-slate-100 rounded-2xl mb-3 group">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
              <span className="text-[14px] font-bold text-slate-900 inline-flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-400" />
                {totalDays}일 진행 현황
              </span>
              <span className="text-[12px] text-slate-400 group-open:rotate-90 transition-transform">▸</span>
            </summary>
            <div className="px-5 pb-5 space-y-4">
              <div className={isShortTrack ? "grid grid-cols-7 gap-2" : "grid grid-cols-10 gap-1.5"}>
                {Array.from({ length: totalDays }, (_, i) => {
                  const d = i + 1;
                  const c = allCheckins.find((x) => x.day_number === d);
                  const isToday = d === day;
                  const isCompleted = !!c?.completed;
                  return (
                    <button
                      key={d}
                      onClick={() => navigate(`/mind-track/workbook?day=${d}`)}
                      className={`aspect-square rounded-md text-[11px] font-bold flex items-center justify-center transition ${
                        isCompleted
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          : isToday
                          ? "bg-slate-900 text-white ring-2 ring-offset-1 ring-[#C8B88A]"
                          : "bg-slate-50 text-slate-400"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
              {baseline && (
                <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-3">
                  <BaselineBar label="스트레스" value={baseline.stress ?? 0} color="bg-rose-400" />
                  <BaselineBar label="에너지" value={baseline.energy ?? 0} color="bg-amber-400" />
                  <BaselineBar label="명료도" value={baseline.clarity ?? 0} color="bg-sky-400" />
                </div>
              )}
            </div>
          </details>

          {/* 5) 도움 메뉴 — 펼침 */}
          <details className="bg-white border border-slate-100 rounded-2xl mb-3 group">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
              <span className="text-[14px] font-bold text-slate-900 inline-flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-400" />
                다른 도움 메뉴
              </span>
              <span className="text-[12px] text-slate-400 group-open:rotate-90 transition-transform">▸</span>
            </summary>
            <div className="px-5 pb-5 grid grid-cols-2 gap-2">
              <QuickLink icon={<BookOpen className="w-4 h-4" />} title="워크북" desc="전체 일차" onClick={() => navigate(`/mind-track/workbook?day=${day}`)} />
              <QuickLink icon={<BarChart3 className="w-4 h-4" />} title="변화 추이" desc="My Journey" onClick={() => navigate("/my-journey")} />
              <QuickLink icon={<MessageSquareHeart className="w-4 h-4" />} title="AI 코파일럿" desc="고민 정리" onClick={() => navigate("/ai-copilot")} />
              <QuickLink icon={<Phone className="w-4 h-4" />} title="전문가 상담" desc="1:1 매칭" onClick={() => navigate("/expert-hiring")} />
            </div>
          </details>

          {/* 6) 최근 체크인 — 있을 때만 */}
          {!loading && recentCheckins.length > 0 && (
            <details className="bg-white border border-slate-100 rounded-2xl mb-3 group">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                <span className="text-[14px] font-bold text-slate-900 inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  최근 체크인
                </span>
                <span className="text-[12px] text-slate-400 group-open:rotate-90 transition-transform">▸</span>
              </summary>
              <ul className="px-5 pb-5 space-y-2">
                {recentCheckins.map((c) => (
                  <li key={c.day_number} className="flex items-start gap-2 py-1.5 border-b border-slate-50 last:border-b-0">
                    {c.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> : <Circle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-slate-500 font-semibold">Day {String(c.day_number).padStart(2, "0")} · {new Date(c.created_at).toLocaleDateString("ko-KR")}</div>
                      {c.reflection_note && <p className="text-[13px] text-slate-700 mt-0.5 line-clamp-2">{c.reflection_note}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </details>
          )}

          {/* 7) 업셀 — 7일 트랙 Day3+ 일 때만, 조용히 한 카드 */}
          {upsell && (
            <div className="mt-6 bg-[#1a1a1a] text-white rounded-2xl p-5">
              <div className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#C8B88A] mb-2">{upsell.eyebrow}</div>
              <h3 className="text-[16px] font-extrabold leading-snug mb-1.5">{upsell.headline}</h3>
              <p className="text-[12px] text-white/70 leading-relaxed mb-4">{upsell.body}</p>
              <Button
                onClick={() => navigate(`/mind-track?plan=extend_23&from=dashboard_day${day}`)}
                className="w-full h-11 bg-white text-black hover:bg-white/90 rounded-xl font-bold text-[13px]"
              >
                {upsell.primaryCta} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          )}

          {/* 8) FAQ + 트랙 변경/이용방법 — 최하단 작은 링크 */}
          <details className="mt-6 group">
            <summary className="text-[12px] text-slate-400 underline underline-offset-2 cursor-pointer list-none text-center">
              자주 묻는 질문 보기
            </summary>
            <div className="mt-3 bg-white border border-slate-100 rounded-2xl p-5">
              {(isShortTrack ? FAQ_7 : FAQ_30).map((q, i) => (
                <details key={i} className="group border-b border-slate-100 last:border-b-0 py-2.5">
                  <summary className="text-[13px] font-semibold text-slate-800 cursor-pointer list-none">{q.q}</summary>
                  <p className="text-[12px] text-slate-600 leading-relaxed mt-1.5">{q.a}</p>
                </details>
              ))}
            </div>
          </details>

          <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <button onClick={() => setFocusSwitcherOpen(true)} className="underline underline-offset-2 inline-flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> 트랙 변경
            </button>
            <span>·</span>
            <button onClick={() => setShowOnboarding(true)} className="underline underline-offset-2 inline-flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> 이용 방법
            </button>
          </div>

          <div className="mt-8">
            <MedicalDisclaimer variant="compact" />
          </div>
        </main>

        <MindTrackFocusSwitcher
          open={focusSwitcherOpen}
          onOpenChange={setFocusSwitcherOpen}
          enrollmentId={enrollment.id}
          currentFocusId={enrollment.goal_focus}
          currentDay={day}
          onSwitched={(newFocusId) =>
            setEnrollment((prev) => (prev ? { ...prev, goal_focus: newFocusId } : prev))
          }
        />

        <Footer />
      </div>
    </>
  );
}


// 7일 트랙 진행 중 업셀 카피 — Day별 톤 다르게
function getUpsellCopy(day: number, isFinal: boolean) {
  if (isFinal || day >= 7) {
    return {
      eyebrow: "7일 완주 · 다음 단계",
      headline: "7일이 끝났어요. 이제 진짜 변화를 굳힐 시간",
      body: "7일은 패턴을 발견하는 단계, 30일은 그 패턴을 뇌에 새기는 단계예요. 지금까지 쌓은 데이터·진단·전문가 피드백을 그대로 이어받아 23일을 추가합니다.",
      primaryCta: "+23일 연장권 보기 (₩12,900)",
      secondaryCta: "전문가 1:1 이어가기",
    };
  }
  if (day === 6) {
    return {
      eyebrow: "내일이면 완주 · 미리보기",
      headline: "내일 7일이 끝나요. 30일까지 이어갈까요?",
      body: "지금까지 쌓은 6일치 데이터가 가장 비싸요. 끊기지 말고 +23일로 패턴을 뇌에 새기세요. 결제 없이도 변화 리포트는 받을 수 있어요.",
      primaryCta: "+23일 연장권 미리 잡기",
      secondaryCta: "전문가에게 마무리 점검 받기",
    };
  }
  if (day === 5) {
    return {
      eyebrow: "회복 루틴 단계 · 굳히기",
      headline: "여기까지 왔다면, 이제 뇌에 새겨야 해요",
      body: "Day 5에 만든 회복 루틴은 21일 이상 반복해야 자동화돼요. 7일 트랙으로는 이제 막 심은 단계 — +23일 연장으로 진짜 내 것으로 만드세요.",
      primaryCta: "+23일 연장으로 굳히기",
      secondaryCta: "전문가 1:1로 점검 받기",
    };
  }
  if (day === 4) {
    return {
      eyebrow: "전문가 개입의 날",
      headline: "오늘 전문가가 짚어준 부분, 1:1로 더 깊이 가볼래요?",
      body: "Day 4 매칭은 15분 무료. 더 길게 다루고 싶다면 1:1 정식 상담으로 이어갈 수 있어요. 마음 트랙 결제자에게는 상담료 할인이 자동 적용됩니다.",
      primaryCta: "+23일 연장 + 상담 묶음 보기",
      secondaryCta: "1:1 상담 정식 예약",
    };
  }
  // Day 3
  return {
    eyebrow: "뿌리 진단 완료 · 한 발 더",
    headline: "패턴이 보이기 시작했나요? 여기서 멈추면 다시 돌아가요",
    body: "Day 3는 인사이트가 가장 강한 날이에요. 4일치만 더 쌓으면 변화 리포트가 나오지만, +23일로 가면 그 패턴을 진짜 바꿀 수 있어요.",
    primaryCta: "+23일 연장권 미리 보기",
    secondaryCta: "전문가에게 패턴 검토 받기",
  };
}

const FAQ_7: { q: string; a: string }[] = [
  { q: "왜 7일인가요? 너무 짧지 않나요?", a: "7일은 패턴을 발견하고 첫 변화를 체감하기에 충분한 시간입니다. 우리는 매일 진단·미션·전문가 개입·회복 루틴까지 압축해서 제공해요. 더 깊은 고착화를 원하시면 +23일 연장권으로 풀 30일까지 이어갈 수 있습니다." },
  { q: "7일 안에 정말 변화가 일어나나요?", a: "Day 1 기초 진단 → Day 2 자기관찰 → Day 3 뿌리 패턴 분석 → Day 4 전문가 무료 매칭 → Day 5-6 회복 루틴 실전 적용 → Day 7 변화 리포트로 이어지는 구조라, 단순 일기 앱보다 훨씬 빠르게 '발가벗겨진 기분'과 '내가 좋아질 수 있겠다'는 확신이 옵니다." },
  { q: "오늘 미션을 못 했어요. 어떻게 하나요?", a: "괜찮아요. 워크북에서 지난 일차로 돌아가 언제든 완료할 수 있습니다. 7일 트랙은 시작일 기준으로 자동 진행되지만, 미션 자체는 평생 열람 가능해요." },
  { q: "전문가 상담은 어떻게 받나요?", a: "Day 4에 자동으로 매칭 카드가 뜹니다. 7일 트랙 결제자에게는 첫 15분 무료 상담 크레딧이 포함돼 있어요. 대시보드 빠른 메뉴의 '전문가 상담'에서도 언제든 매칭 가능합니다." },
  { q: "7일이 끝나면 어떻게 되나요?", a: "Day 7에 종합 변화 리포트(PDF)와 다음 30일 셀프 코칭 가이드를 받습니다. 더 깊이 가고 싶다면 +23일 연장권(₩12,900)으로 30일 풀 트랙으로 자연스럽게 이어집니다." },
];

const FAQ_30: { q: string; a: string }[] = [
  { q: "30일 동안 매일 뭘 하나요?", a: "주차별로 정렬·루틴·패턴 전환·깊이 코칭·리포트 단계가 있고, 매일 5분 안에 끝나는 미션이 자동으로 배정됩니다." },
  { q: "오늘 미션을 못 했어요. 어떻게 하나요?", a: "워크북에서 지난 일차로 돌아가 언제든 완료할 수 있어요. 진행률은 자동으로 업데이트됩니다." },
  { q: "전문가 상담은 어떻게 받나요?", a: "대시보드 빠른 메뉴의 '전문가 상담'에서 언제든 매칭 가능하며, 30일 구독자에게는 매월 무료 상담 크레딧이 자동 지급됩니다." },
];


function QuickLink({
  icon, title, desc, onClick,
}: { icon: React.ReactNode; title: string; desc: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-100 hover:border-[#C8B88A]/50 hover:shadow-sm transition-all p-4 text-left"
    >
      <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-2">
        {icon}
      </div>
      <div className="text-sm font-bold text-slate-900">{title}</div>
      <div className="text-[11px] text-slate-500">{desc}</div>
    </button>
  );
}

function BaselineBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, value * 10));
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600">{label}</span>
        <span className="font-bold text-slate-900">{value}/10</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
