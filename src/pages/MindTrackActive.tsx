import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, ArrowRight, CheckCircle2, Circle, HelpCircle, Phone, Calendar,
  PlayCircle, Loader2,
} from "lucide-react";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import Footer from "@/components/ui/footer";
import SEOHead from "@/components/common/SEOHead";
import { MedicalDisclaimer } from "@/components/legal/MedicalDisclaimer";
import { supabase } from "@/integrations/supabase/client";
import { getDayCopy, calcMindTrackCurrentDay } from "@/lib/mindTrackDayCopy";
import MindTrackFirstTimeOnboarding from "@/components/mind-track/MindTrackFirstTimeOnboarding";

interface Enrollment {
  id: string;
  started_at: string;
  current_day: number;
  status: string;
  goal_focus: string | null;
  payment_status: string;
}

interface Props {
  enrollment: Enrollment;
}

/**
 * 결제 완료 사용자 전용 단순 대시보드.
 * 마케팅/목표선택/무료리포트/아동발달 위젯은 모두 제거.
 * "오늘 할 일 한 가지" + 진행률 + 지난 체크인 요약만 노출.
 */
export default function MindTrackActive({ enrollment }: Props) {
  const navigate = useNavigate();
  const day = useMemo(() => calcMindTrackCurrentDay(enrollment.started_at), [enrollment.started_at]);
  const copy = getDayCopy(day);
  const progressPct = Math.round((day / 30) * 100);

  const [recentCheckins, setRecentCheckins] = useState<Array<{ day_number: number; completed: boolean; reflection_note?: string | null; created_at: string }>>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [todayMission, setTodayMission] = useState<{ mission_title?: string; mission_description?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // 첫 진입 1회 온보딩
  useEffect(() => {
    const key = `mind_track_onboarded_${enrollment.id}`;
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(key)) {
      // 한 프레임 뒤 띄워서 페이지 깜빡임 방지
      setTimeout(() => setShowOnboarding(true), 300);
    }
  }, [enrollment.id]);

  const closeOnboarding = () => {
    localStorage.setItem(`mind_track_onboarded_${enrollment.id}`, new Date().toISOString());
    setShowOnboarding(false);
  };

  const startTodayMission = () => {
    closeOnboarding();
    navigate(`/mind-track/workbook?day=${day}&openMission=1`);
  };

  // 데이터 로드
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data: missions }, { data: checkins }] = await Promise.all([
        supabase
          .from("mind_track_daily_missions")
          .select("mission_title, mission_description")
          .eq("enrollment_id", enrollment.id)
          .eq("day_number", day)
          .maybeSingle(),
        supabase
          .from("mind_track_checkins")
          .select("day_number, completed, reflection_note, created_at")
          .eq("enrollment_id", enrollment.id)
          .order("day_number", { ascending: false })
          .limit(20),
      ]);
      if (cancelled) return;
      setTodayMission(missions ?? null);
      const list = (checkins ?? []) as any[];
      setRecentCheckins(list.slice(0, 4));
      setCompletedCount(list.filter((c) => c.completed).length);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [enrollment.id, day]);

  return (
    <>
      <SEOHead
        title="30일 마음 트랙 · 진행 중"
        description="오늘의 미션과 진행률을 한눈에 확인하세요."
        canonicalUrl="https://aihpro.app/mind-track"
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/20">
        <UnifiedNavigation />

        <MindTrackFirstTimeOnboarding
          open={showOnboarding}
          onClose={closeOnboarding}
          onStart={startTodayMission}
        />

        {/* 헤더 — Day N/30 + 진행률 */}
        <section className="px-4 pt-24 pb-4">
          <div className="max-w-2xl mx-auto">
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
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{completedCount}일 체크인 완료</span>
                <span>{progressPct}% 진행</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 오늘의 미션 — 단 하나의 큰 카드 */}
        <section className="px-4 pb-6">
          <div className="max-w-2xl mx-auto">
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

        {/* 지난 체크인 — 미니 리스트 */}
        {!loading && recentCheckins.length > 0 && (
          <section className="px-4 pb-10">
            <div className="max-w-2xl mx-auto">
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
