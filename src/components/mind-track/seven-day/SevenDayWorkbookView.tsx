/**
 * 7일 트랙 — 워크북 메인 뷰 (orchestrator)
 *
 * MindTrackWorkbook.tsx에서 track_type === 'mind_7day' 일 때 이 뷰로 분기.
 * - 자체 데이터 로딩 (enrollment + checkins)
 * - Day 1·4·7 = 무거운 화면, Day 2·3·5·6 = 가벼운 미션
 * - audience(child/adult/parent) 분기 카피
 * - 상단 7일 진행 스트립 + 단일 컬럼
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SEOHead from "@/components/common/SEOHead";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";

import { calcMindTrackCurrentDay, getDayCopy, type MindTrackAudience } from "@/lib/mindTrackDayCopy";
import { get7DayScreenKind } from "@/lib/mindTrack7DayResolver";
import { getSevenDayLightMission } from "@/lib/mindTrack7DayMissions";

import LightMissionScreen from "./LightMissionScreen";
import Day1DiagnosisScreen from "./Day1DiagnosisScreen";
import Day4ExpertMatchScreen from "./Day4ExpertMatchScreen";
import Day7ReportScreen from "./Day7ReportScreen";
import PersonalizedMissionCard from "./PersonalizedMissionCard";
import DailyResourcePanel from "./DailyResourcePanel";
import ConcernRefineCard from "./ConcernRefineCard";
import DailyAgentPanel from "./DailyAgentPanel";

interface DailyMissionRow {
  day_number: number;
  mission_title: string | null;
  mission_description: string | null;
  why_it_matters: string | null;
  action_steps: any;
  success_criteria: string | null;
  estimated_minutes: number | null;
}

interface EnrollmentRow {
  id: string;
  user_id: string;
  audience: string;
  started_at: string;
  baseline_data: Record<string, any> | null;
  status: string;
}

interface CheckinRow {
  day_number: number;
  completed: boolean | null;
  reflection_note: string | null;
  reflection_payload: any | null;
  mood_score: number | null;
  energy_score: number | null;
  clarity_score: number | null;
}

export default function SevenDayWorkbookView({
  enrollmentId,
}: {
  enrollmentId: string;
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<EnrollmentRow | null>(null);
  const [checkins, setCheckins] = useState<CheckinRow[]>([]);
  const [dailyMissions, setDailyMissions] = useState<DailyMissionRow[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const { data: enr, error: e1 } = await supabase
        .from("mind_track_enrollments")
        .select("id, user_id, audience, started_at, baseline_data, status")
        .eq("id", enrollmentId)
        .maybeSingle();
      if (e1) throw e1;
      if (!enr) throw new Error("워크북을 찾을 수 없어요");
      setEnrollment(enr as EnrollmentRow);

      const [{ data: ci, error: e2 }, { data: dm }] = await Promise.all([
        supabase
          .from("mind_track_checkins")
          .select("day_number, completed, reflection_note, reflection_payload, mood_score, energy_score, clarity_score")
          .eq("enrollment_id", enrollmentId)
          .order("day_number", { ascending: true }),
        supabase
          .from("mind_track_daily_missions")
          .select("day_number, mission_title, mission_description, why_it_matters, action_steps, success_criteria, estimated_minutes")
          .eq("enrollment_id", enrollmentId)
          .order("day_number", { ascending: true }),
      ]);
      if (e2) throw e2;
      setCheckins((ci ?? []) as CheckinRow[]);
      setDailyMissions((dm ?? []) as DailyMissionRow[]);
    } catch (e: any) {
      toast.error(e?.message ?? "워크북 로드 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentId]);

  const currentDay = useMemo(
    () => calcMindTrackCurrentDay(enrollment?.started_at, 7),
    [enrollment?.started_at],
  );

  const dayParam = Number(searchParams.get("day") ?? "");
  const selectedDay =
    Number.isFinite(dayParam) && dayParam >= 1 && dayParam <= 7
      ? Math.min(dayParam, currentDay)
      : currentDay;

  const audience: MindTrackAudience = ((enrollment?.audience as MindTrackAudience) ?? "child");
  const copy = getDayCopy(selectedDay, 7, audience);
  const kind = get7DayScreenKind(selectedDay);
  const ci = checkins.find((c) => c.day_number === selectedDay);

  const setDay = (d: number) => {
    if (d < 1 || d > 7 || d > currentDay) return;
    const next = new URLSearchParams(searchParams);
    next.set("day", String(d));
    setSearchParams(next, { replace: true });
  };

  if (loading || !enrollment) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEOHead title="7일 마음 트랙 워크북" description="7일간의 마음 변화 트랙을 매일 진행하세요." />
      <div className="min-h-screen bg-white">
        <UnifiedNavigation />

        <div className="max-w-xl mx-auto px-4 pt-20 pb-32 space-y-6">
          <button
            onClick={() => navigate("/mind-track/dashboard")}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            대시보드로
          </button>

          {/* 7일 진행 스트립 */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 7 }, (_, i) => i + 1).map((d) => {
              const done = checkins.some((c) => c.day_number === d && c.completed);
              const locked = d > currentDay;
              const active = d === selectedDay;
              return (
                <button
                  key={d}
                  onClick={() => setDay(d)}
                  disabled={locked}
                  className={[
                    "flex-1 h-12 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center justify-center gap-0.5",
                    active
                      ? "bg-slate-900 text-white border-slate-900"
                      : done
                      ? "bg-white text-emerald-600 border-emerald-200"
                      : locked
                      ? "bg-slate-50 text-slate-300 border-slate-100"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-400",
                  ].join(" ")}
                  aria-label={`Day ${d}${locked ? " (잠김)" : done ? " (완료)" : ""}`}
                >
                  <span>D{d}</span>
                  {done && <CheckCircle2 className="w-3 h-3" />}
                  {locked && !done && <Lock className="w-3 h-3" />}
                </button>
              );
            })}
          </div>

          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* AI 에이전트 — 오늘의 한 가지 행동을 대신 결정 */}
            <DailyAgentPanel
              enrollmentId={enrollment.id}
              day={selectedDay}
              audience={audience}
              lastCheckin={ci ?? null}
            />

            {/* 사용자 고민으로 만든 맞춤 미션 (mind-track-init 결과) */}
            <PersonalizedMissionCard
              mission={dailyMissions.find((m) => m.day_number === selectedDay) ?? null}
              day={selectedDay}
            />

            {/* 진짜 고민 다시 적기 → Day 1~7 맞춤 미션 재생성 */}
            <ConcernRefineCard
              enrollmentId={enrollment.id}
              currentConcern={
                (enrollment.baseline_data as any)?.primary_concern ?? null
              }
              onRegenerated={load}
            />

            {/* 오늘의 자체 검사 + 유튜브 영상 + 이론 근거 + 5분 실천 */}
            <DailyResourcePanel enrollmentId={enrollment.id} day={selectedDay} />

            {(() => {
              const dm = dailyMissions.find((m) => m.day_number === selectedDay) ?? null;
              const actionSteps: string[] = Array.isArray(dm?.action_steps)
                ? (dm!.action_steps as any[])
                    .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
                : [];
              const initialPayload = (ci?.reflection_payload as any) ?? null;

              if (kind === "diagnosis") {
                return (
                  <Day1DiagnosisScreen
                    enrollmentId={enrollment.id}
                    userId={enrollment.user_id}
                    phaseLabel={copy.phase}
                    baselineData={enrollment.baseline_data}
                    initialNote={ci?.reflection_note ?? null}
                    initialPayload={initialPayload}
                    actionSteps={actionSteps}
                    alreadyCompleted={!!ci?.completed}
                    onCompleted={load}
                  />
                );
              }
              if (kind === "light") {
                const m = getSevenDayLightMission(audience, selectedDay);
                if (!m) return null;
                return (
                  <LightMissionScreen
                    enrollmentId={enrollment.id}
                    userId={enrollment.user_id}
                    day={selectedDay}
                    mission={m}
                    phaseLabel={copy.phase}
                    initialNote={ci?.reflection_note ?? null}
                    initialPayload={initialPayload}
                    actionSteps={actionSteps}
                    alreadyCompleted={!!ci?.completed}
                    onCompleted={load}
                  />
                );
              }
              if (kind === "expert") {
                return (
                  <Day4ExpertMatchScreen
                    enrollmentId={enrollment.id}
                    userId={enrollment.user_id}
                    audience={audience}
                    phaseLabel={copy.phase}
                    initialNote={ci?.reflection_note ?? null}
                    initialPayload={initialPayload}
                    actionSteps={actionSteps}
                    alreadyCompleted={!!ci?.completed}
                    onCompleted={load}
                  />
                );
              }
              if (kind === "report") {
                return (
                  <Day7ReportScreen
                    enrollmentId={enrollment.id}
                    userId={enrollment.user_id}
                    phaseLabel={copy.phase}
                    baselineData={enrollment.baseline_data}
                    day7Checkin={ci ?? null}
                    alreadyCompleted={!!ci?.completed}
                    onCompleted={load}
                  />
                );
              }
              return null;
            })()}
          </motion.div>
        </div>
      </div>
    </>
  );
}
