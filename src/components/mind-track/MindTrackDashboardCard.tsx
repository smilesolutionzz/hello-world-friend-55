import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ChevronRight, Target, PlayCircle, BookOpen, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type State =
  | { kind: "loading" }
  | { kind: "none" }
  | { kind: "needs_baseline"; enrollmentId: string }
  | { kind: "active"; workbook: any; currentDay: number; todayMission: any | null; completed: number };

export default function MindTrackDashboardCard() {
  const navigate = useNavigate();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setState({ kind: "none" });

      const { data: enrollments } = await supabase
        .from("mind_track_enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("payment_status", "completed")
        .order("created_at", { ascending: false })
        .limit(1);

      if (!enrollments || enrollments.length === 0) return setState({ kind: "none" });
      const en = enrollments[0] as any;

      const { data: wbs } = await supabase
        .from("mind_track_workbooks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!wbs || wbs.length === 0) {
        return setState({ kind: "needs_baseline", enrollmentId: en.id });
      }

      const wb = wbs[0] as any;
      const startedAt = en?.started_at ? new Date(en.started_at) : new Date();
      const currentDay = Math.min(Math.max(Math.floor((Date.now() - startedAt.getTime()) / 86400000) + 1, 1), 30);

      const [{ data: missions }, { data: checkins }] = await Promise.all([
        supabase.from("mind_track_daily_missions").select("*").eq("enrollment_id", en.id).eq("day_number", currentDay).maybeSingle(),
        supabase.from("mind_track_checkins").select("completed").eq("enrollment_id", en.id),
      ]);
      const completed = (checkins ?? []).filter((c: any) => c.completed).length;

      setState({ kind: "active", workbook: wb, currentDay, todayMission: missions, completed });
    })();
  }, []);

  if (state.kind === "loading" || state.kind === "none") return null;

  if (state.kind === "needs_baseline") {
    return (
      <Card className="p-5 border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-100 shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1 min-w-0">
            <Badge className="mb-2 bg-amber-100 text-amber-800 border-amber-200">
              <Sparkles className="w-3 h-3 mr-1" /> 30일 마음 트랙 결제 완료
            </Badge>
            <h3 className="font-bold text-slate-900 mb-1 break-keep">
              지금 바로 기초 진단을 시작하세요
            </h3>
            <p className="text-sm text-slate-600 mb-3 break-keep">
              결제가 확인되었습니다. 기초 진단을 완료하면 30일 맞춤 워크북이 생성됩니다.
            </p>
            <Button
              onClick={() => navigate("/mind-track/start")}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white"
            >
              <PlayCircle className="w-4 h-4 mr-1.5" /> 기초 진단 시작하기
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // active
  const { workbook, currentDay, todayMission, completed } = state;

  return (
    <Card className="p-5 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5 mb-6">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div className="min-w-0">
          <Badge className="mb-2 bg-amber-100 text-amber-800 border-amber-200">
            <Sparkles className="w-3 h-3 mr-1" /> 30일 마음 트랙
          </Badge>
          <h3 className="font-bold text-slate-900 break-keep">{workbook.challenge_theme}</h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">진행</div>
          <div className="text-xl font-bold text-primary">Day {currentDay}/30</div>
        </div>
      </div>
      <Progress value={(currentDay / 30) * 100} className="h-1.5 mb-2" />
      <div className="text-xs text-slate-600 mb-3">{completed}일 체크인 완료</div>

      {todayMission && (
        <div className="p-3 rounded-lg bg-white/80 border border-slate-200 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-primary font-bold mb-1">
            <Target className="w-3.5 h-3.5" /> 오늘의 미션
          </div>
          <div className="text-sm font-medium text-slate-900 break-keep">
            {todayMission.mission_title}
          </div>
          {todayMission.mission_description && (
            <div className="text-xs text-slate-600 mt-1 line-clamp-2 break-keep">
              {todayMission.mission_description}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button
          onClick={() => navigate("/mind-track/workbook")}
          className="w-full bg-gradient-to-r from-primary to-purple-600 text-white"
        >
          <BookOpen className="w-4 h-4 mr-1.5" /> 워크북 열기
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        <Button
          onClick={() => navigate("/mind-track/start")}
          variant="outline"
          className="w-full"
        >
          진단 다시 보기
        </Button>
      </div>
    </Card>
  );
}
