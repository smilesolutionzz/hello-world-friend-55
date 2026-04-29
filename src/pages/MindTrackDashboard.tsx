import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, ArrowRight, CheckCircle2, Circle, HelpCircle, Phone, Calendar,
  PlayCircle, Loader2, BookOpen, BarChart3, MessageSquareHeart, Target,
  TrendingUp, Award, Flame,
} from "lucide-react";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import Footer from "@/components/ui/footer";
import SEOHead from "@/components/common/SEOHead";
import { MedicalDisclaimer } from "@/components/legal/MedicalDisclaimer";
import { supabase } from "@/integrations/supabase/client";
import { getDayCopy, calcMindTrackCurrentDay } from "@/lib/mindTrackDayCopy";
import MindTrackFirstTimeOnboarding from "@/components/mind-track/MindTrackFirstTimeOnboarding";
import { toast } from "sonner";

interface Enrollment {
  id: string;
  started_at: string;
  current_day: number;
  status: string;
  goal_focus: string | null;
  payment_status: string;
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
  const [authChecking, setAuthChecking] = useState(true);

  const [recentCheckins, setRecentCheckins] = useState<
    Array<{ day_number: number; completed: boolean; reflection_note?: string | null; created_at: string; mood_score?: number | null }>
  >([]);
  const [allCheckins, setAllCheckins] = useState<Array<{ day_number: number; completed: boolean }>>([]);
  const [todayMission, setTodayMission] = useState<{ mission_title?: string; mission_description?: string } | null>(null);
  const [baseline, setBaseline] = useState<{ stress?: number; energy?: number; clarity?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

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
        .select("id, started_at, current_day, status, goal_focus, payment_status")
        .eq("user_id", user.id)
        .in("status", ["active", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data || (data.payment_status !== "paid" && data.payment_status !== "completed")) {
        toast.info("아직 30일 마음 트랙에 등록되지 않았어요");
        navigate("/mind-track", { replace: true });
        return;
      }
      setEnrollment(data as Enrollment);
      setAuthChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const day = useMemo(
    () => (enrollment ? calcMindTrackCurrentDay(enrollment.started_at) : 1),
    [enrollment]
  );
  const copy = getDayCopy(day);
  const progressPct = Math.round((day / 30) * 100);

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

  // 데이터 로드
  useEffect(() => {
    if (!enrollment) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data: missions }, { data: checkins }, { data: enr }] = await Promise.all([
        supabase
          .from("mind_track_daily_missions")
          .select("mission_title, mission_description")
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
      if (cancelled) return;
      setTodayMission(missions ?? null);
      const list = (checkins ?? []) as any[];
      setRecentCheckins(list.slice(0, 5));
      setAllCheckins(list.map((c) => ({ day_number: c.day_number, completed: c.completed })));
      const bl = (enr?.baseline_data as any) ?? null;
      if (bl?.currentState) setBaseline(bl.currentState);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
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

  return (
    <>
      <SEOHead
        title="30일 마음 트랙 · 내 대시보드"
        description="오늘의 미션과 진행률, 변화 추이를 한눈에 확인하세요."
        canonicalUrl="https://aihpro.app/mind-track/dashboard"
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/20">
        <UnifiedNavigation />

        <MindTrackFirstTimeOnboarding
          open={showOnboarding}
          onClose={closeOnboarding}
          onStart={startTodayMission}
          onSnoozeToday={snoozeOnboardingToday}
        />

        {/* 헤더 — Day N/30 + 진행률 + 스트릭 */}
        <section className="px-4 pt-24 pb-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl border border-[#C8B88A]/40 ring-1 ring-[#C8B88A]/15 shadow-sm p-6 md:p-7 space-y-4"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-emerald-500/15 text-emerald-700 border-0 text-xs">진행 중</Badge>
                  <span className="text-[11px] font-semibold tracking-wider text-[#8a7a4d] uppercase">
                    Day {String(day).padStart(2, "0")} / 30 · {copy.phase}
                  </span>
                </div>
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="text-[11px] text-slate-500 hover:text-slate-900 underline underline-offset-2 inline-flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  이용 방법 다시 보기
                </button>
              </div>
              <Progress value={progressPct} className="h-1.5" />

              <div className="grid grid-cols-3 gap-3 pt-1">
                <Stat icon={<CheckCircle2 className="w-4 h-4" />} label="완료" value={`${completedCount}일`} />
                <Stat icon={<Flame className="w-4 h-4 text-orange-500" />} label="연속" value={`${streak}일`} />
                <Stat icon={<TrendingUp className="w-4 h-4" />} label="진행률" value={`${progressPct}%`} />
              </div>
            </motion.div>
          </div>
        </section>

        {/* 오늘의 미션 — 메인 CTA */}
        <section className="px-4 pb-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-5"
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[#1a1a1a] text-white flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                    오늘의 미션
                  </p>
                  <p className="text-sm text-slate-900 font-bold">
                    Day {String(day).padStart(2, "0")} · {copy.title}
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="py-8 flex items-center justify-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  <h2 className="text-lg md:text-xl font-bold text-slate-900 break-keep leading-snug">
                    {todayMission?.mission_title || copy.title}
                  </h2>
                  <p className="text-sm md:text-base text-slate-600 break-keep leading-relaxed">
                    {todayMission?.mission_description || copy.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                <Button
                  onClick={() => navigate(`/mind-track/workbook?day=${day}&openMission=1`)}
                  className="h-12 text-base font-bold bg-[#1a1a1a] text-white hover:bg-black rounded-xl"
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Day {String(day).padStart(2, "0")} 미션 시작
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/expert-hiring?from=mission_difficult&day=${day}`)}
                  className="h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  막혔어요 · 도움받기
                </Button>
              </div>

              <p className="text-[11px] text-slate-400 text-center break-keep">
                시작일 {new Date(enrollment.started_at).toLocaleDateString("ko-KR")} 기준 · 매일 자정에 다음 일차로 자동 이동
              </p>
            </motion.div>
          </div>
        </section>

        {/* 빠른 메뉴 */}
        <section className="px-4 pb-6">
          <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
            <QuickLink icon={<BookOpen className="w-5 h-5" />} title="워크북" desc="전체 일차 보기" onClick={() => navigate(`/mind-track/workbook?day=${day}`)} />
            <QuickLink icon={<BarChart3 className="w-5 h-5" />} title="진행 리포트" desc="나의 변화 추이" onClick={() => navigate("/my-journey")} />
            <QuickLink icon={<MessageSquareHeart className="w-5 h-5" />} title="AI 코파일럿" desc="고민 빠른 정리" onClick={() => navigate("/ai-copilot")} />
            <QuickLink icon={<Phone className="w-5 h-5" />} title="전문가 상담" desc="1:1 매칭" onClick={() => navigate("/expert-hiring")} />
          </div>
        </section>

        {/* 30일 미니 그리드 — 한눈에 진행 상황 */}
        <section className="px-4 pb-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900">30일 진행 현황</h3>
              </div>
              <div className="grid grid-cols-10 gap-1.5">
                {Array.from({ length: 30 }, (_, i) => {
                  const d = i + 1;
                  const c = allCheckins.find((x) => x.day_number === d);
                  const isToday = d === day;
                  const isPast = d < day;
                  const isFuture = d > day;
                  return (
                    <button
                      key={d}
                      onClick={() => navigate(`/mind-track/workbook?day=${d}`)}
                      className={`aspect-square rounded-md text-[10px] font-bold flex items-center justify-center transition-all ${
                        c?.completed
                          ? "bg-emerald-500 text-white"
                          : isToday
                          ? "bg-[#1a1a1a] text-white ring-2 ring-offset-1 ring-[#C8B88A]"
                          : isPast
                          ? "bg-slate-100 text-slate-400"
                          : isFuture
                          ? "bg-slate-50 text-slate-300"
                          : "bg-slate-50 text-slate-400"
                      }`}
                      title={`Day ${d}`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
                <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />완료</span>
                <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#1a1a1a]" />오늘</span>
                <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-slate-100" />지난 일차</span>
              </div>
            </div>
          </div>
        </section>

        {/* 베이스라인 지표 */}
        {baseline && (
          <section className="px-4 pb-6">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-900">시작 시점 지표</h3>
                  <span className="text-[10px] text-slate-400">· 30일 후 비교 예정</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <BaselineBar label="스트레스" value={baseline.stress ?? 0} color="bg-rose-400" />
                  <BaselineBar label="에너지" value={baseline.energy ?? 0} color="bg-amber-400" />
                  <BaselineBar label="명료도" value={baseline.clarity ?? 0} color="bg-sky-400" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 최근 체크인 */}
        {!loading && recentCheckins.length > 0 && (
          <section className="px-4 pb-10">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-900">최근 체크인</h3>
                </div>
                <ul className="space-y-2">
                  {recentCheckins.map((c) => (
                    <li
                      key={c.day_number}
                      className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-b-0"
                    >
                      {c.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-semibold">Day {String(c.day_number).padStart(2, "0")}</span>
                          <span>·</span>
                          <span>{new Date(c.created_at).toLocaleDateString("ko-KR")}</span>
                          {typeof c.mood_score === "number" && (
                            <>
                              <span>·</span>
                              <span>기분 {c.mood_score}/10</span>
                            </>
                          )}
                        </div>
                        {c.reflection_note && (
                          <p className="text-sm text-slate-700 break-keep mt-0.5 line-clamp-2">
                            {c.reflection_note}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        <section className="px-4 py-8 max-w-3xl mx-auto">
          <MedicalDisclaimer variant="compact" />
        </section>

        <Footer />
      </div>
    </>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-2xl px-3 py-2.5 flex items-center gap-2">
      {icon}
      <div className="leading-tight">
        <div className="text-[10px] text-slate-500">{label}</div>
        <div className="text-sm font-bold text-slate-900">{value}</div>
      </div>
    </div>
  );
}

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
