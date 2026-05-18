import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ChevronRight, Target, TrendingUp, Heart, Brain, Zap, CalendarDays, ShieldCheck } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

type ProfileTrackState = {
  mode: "guest" | "pending" | "active";
  enrollment?: any;
  workbook?: any;
  todayMission?: any;
  currentDay?: number;
  completedCount?: number;
  latestCheckin?: any;
  baseline?: any;
  chartData?: Array<{ day: string; mood: number; energy: number; clarity: number }>;
};

const GOAL_LABELS: Record<string, string> = {
  sleep: "수면 회복",
  stress: "스트레스 다스리기",
  mood: "감정 안정",
  focus: "집중력 회복",
  relationship: "관계 개선",
  self: "자기 이해 심화",
  parenting: "육아 번아웃 회복",
  child_development: "아이 발달 코칭",
  family_communication: "아이와의 소통",
  anxiety: "불안 다스리기",
  selfworth: "자존감 회복",
};

export default function MindTrackProfileCard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<ProfileTrackState>({ mode: "guest" });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState({ mode: "guest" });
        setLoading(false);
        return;
      }

      const { data: enrollments } = await supabase
        .from("mind_track_enrollments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      const latestPaid = (enrollments ?? []).find((row) => row.payment_status === "completed");
      const latestPending = (enrollments ?? []).find((row) => row.payment_status === "pending");

      if (!latestPaid) {
        setState(latestPending ? { mode: "pending", enrollment: latestPending } : { mode: "guest" });
        setLoading(false);
        return;
      }

      const [{ data: workbook }, { data: missions }, { data: checkins }, { data: baselines }] = await Promise.all([
        supabase
          .from("mind_track_workbooks")
          .select("*")
          .eq("enrollment_id", latestPaid.id)
          .maybeSingle(),
        supabase
          .from("mind_track_daily_missions")
          .select("*")
          .eq("enrollment_id", latestPaid.id)
          .order("day_number"),
        supabase
          .from("mind_track_checkins")
          .select("*")
          .eq("enrollment_id", latestPaid.id)
          .order("day_number"),
        supabase
          .from("mind_track_baseline_assessments")
          .select("*")
          .eq("enrollment_id", latestPaid.id)
          .order("created_at"),
      ]);

      const startedAt = latestPaid.started_at ? new Date(latestPaid.started_at) : new Date(latestPaid.created_at);
      const currentDay = Math.min(Math.max(Math.floor((Date.now() - startedAt.getTime()) / 86400000) + 1, 1), 30);
      const todayMission = (missions ?? []).find((m) => m.day_number === currentDay);
      const completedCount = (checkins ?? []).filter((c) => c.completed).length;
      const latestCheckin = (checkins ?? []).filter((c) => c.completed).slice(-1)[0] ?? null;
      const baseline = (baselines ?? []).find((b) => b.measurement_point === "baseline") ?? (baselines ?? [])[0] ?? null;
      const chartData = (checkins ?? [])
        .filter((c) => c.completed)
        .slice(-7)
        .map((c) => ({
          day: `D${c.day_number}`,
          mood: c.mood_score ?? 0,
          energy: c.energy_score ?? 0,
          clarity: c.clarity_score ?? 0,
        }));

      setState({
        mode: "active",
        enrollment: latestPaid,
        workbook,
        todayMission,
        currentDay,
        completedCount,
        latestCheckin,
        baseline,
        chartData,
      });
      setLoading(false);
    };

    load();
  }, []);

  const comparison = useMemo(() => {
    if (!state.baseline || !state.latestCheckin) return null;
    const stressDiff = Math.round((state.baseline.stress_score ?? 0) - (state.latestCheckin.mood_score ?? 0));
    const energyDiff = Math.round((state.latestCheckin.energy_score ?? 0) - (state.baseline.energy_score ?? 0));
    const clarityDiff = Math.round((state.latestCheckin.clarity_score ?? 0) - (state.baseline.clarity_score ?? 0));
    return { stressDiff, energyDiff, clarityDiff };
  }, [state.baseline, state.latestCheckin]);

  if (loading) {
    return (
      <div className="px-5 mt-5">
        <Card className="p-5 border border-border animate-pulse">
          <div className="h-5 w-40 bg-muted rounded mb-3" />
          <div className="h-4 w-full bg-muted rounded mb-2" />
          <div className="h-4 w-2/3 bg-muted rounded" />
        </Card>
      </div>
    );
  }

  if (state.mode === "guest") {
    return (
      <div className="px-5 mt-5">
        <Card className="p-5 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <Badge className="mb-2 bg-primary text-primary-foreground">
                <Sparkles className="w-3 h-3 mr-1" /> 30일 마음 챌린지
              </Badge>
              <h3 className="text-base font-bold text-foreground">하루 5분, 30일 동안 나를 바꾸는 루틴</h3>
              <p className="text-sm text-muted-foreground mt-1 break-keep">
                오늘의 미션 · 체크인 · 변화 그래프로 마음 흐름을 추적해보세요.
              </p>
            </div>
            <CalendarDays className="w-5 h-5 text-primary flex-shrink-0" />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              "매일 5분 미션",
              "기분 체크인",
              "7일 변화 그래프",
              "30일 워크북",
            ].map((item) => (
              <div key={item} className="text-xs rounded-xl border border-border bg-card px-3 py-2 text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
          <Button onClick={() => navigate("/mind-track")} className="w-full">
            30일 챌린지 시작하기 <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Card>
      </div>
    );
  }

  if (state.mode === "pending") {
    return (
      <div className="px-5 mt-5">
        <Card className="p-5 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <Badge className="mb-2 bg-secondary text-secondary-foreground">챌린지 준비중</Badge>
          <h3 className="text-base font-bold text-foreground break-keep">
            {GOAL_LABELS[state.enrollment?.goal_focus || ""] || "맞춤 목표"} 30일 챌린지가 준비되어 있어요
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4 break-keep">
            결제를 마치면 마이페이지에서 오늘의 미션과 변화 그래프를 바로 볼 수 있어요.
          </p>
          <Button onClick={() => navigate("/pricing?product=mind_track_7")} className="w-full">
            결제 이어서 하기 <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-5 mt-5">
      <Card className="p-5 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
        <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
          <div>
            <Badge className="mb-2 bg-primary text-primary-foreground">
              <Sparkles className="w-3 h-3 mr-1" /> 30일 마음 챌린지 진행 중
            </Badge>
            <h3 className="font-bold text-foreground break-keep text-base">
              {state.workbook?.challenge_theme || `${GOAL_LABELS[state.enrollment?.goal_focus || ""] || "맞춤 목표"} 챌린지`}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Day {state.currentDay}/30 · {state.completedCount}일 체크인 완료
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">진행률</div>
            <div className="text-xl font-bold text-primary">{Math.round(((state.currentDay || 1) / 30) * 100)}%</div>
          </div>
        </div>

        <Progress value={((state.currentDay || 1) / 30) * 100} className="h-2 mb-4" />

        <div className="rounded-2xl border border-border bg-card p-4 mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1">
            <Target className="w-3.5 h-3.5" /> 오늘의 미션
          </div>
          <div className="text-sm font-semibold text-foreground break-keep">
            {state.todayMission?.mission_title || "오늘 미션이 준비 중이에요"}
          </div>
          {state.todayMission?.mission_description && (
            <p className="text-xs text-muted-foreground mt-1 break-keep">
              {state.todayMission.mission_description}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
            <div className="text-xs text-muted-foreground">
              {state.todayMission?.estimated_minutes ? `약 ${state.todayMission.estimated_minutes}분` : "하루 5분 루틴"}
            </div>
            <Button size="sm" onClick={() => navigate("/mind-track/workbook")}>
              오늘 체크인 하기 <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <Heart className="w-4 h-4 text-primary mx-auto mb-1" />
            <div className="text-lg font-bold text-foreground">{state.latestCheckin?.mood_score ?? "-"}</div>
            <div className="text-[10px] text-muted-foreground">최근 기분</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <Zap className="w-4 h-4 text-primary mx-auto mb-1" />
            <div className="text-lg font-bold text-foreground">{state.latestCheckin?.energy_score ?? "-"}</div>
            <div className="text-[10px] text-muted-foreground">최근 에너지</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <Brain className="w-4 h-4 text-primary mx-auto mb-1" />
            <div className="text-lg font-bold text-foreground">{state.latestCheckin?.clarity_score ?? "-"}</div>
            <div className="text-[10px] text-muted-foreground">최근 명료성</div>
          </div>
        </div>

        {comparison && (
          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
              <TrendingUp className="w-4 h-4 text-primary" /> 시작 대비 변화
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-sm font-bold text-primary">{comparison.stressDiff > 0 ? `-${comparison.stressDiff}` : `${comparison.stressDiff}`}</div>
                <div className="text-[10px] text-muted-foreground">부담감</div>
              </div>
              <div>
                <div className="text-sm font-bold text-primary">{comparison.energyDiff > 0 ? `+${comparison.energyDiff}` : comparison.energyDiff}</div>
                <div className="text-[10px] text-muted-foreground">에너지</div>
              </div>
              <div>
                <div className="text-sm font-bold text-primary">{comparison.clarityDiff > 0 ? `+${comparison.clarityDiff}` : comparison.clarityDiff}</div>
                <div className="text-[10px] text-muted-foreground">명료성</div>
              </div>
            </div>
          </div>
        )}

        {state.chartData && state.chartData.length > 1 && (
          <div className="rounded-2xl border border-border bg-card p-4 mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
              <TrendingUp className="w-4 h-4 text-primary" /> 최근 7일 변화 그래프
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={state.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} name="기분" />
                  <Line type="monotone" dataKey="energy" stroke="hsl(var(--accent-foreground))" strokeWidth={2} dot={{ r: 2 }} name="에너지" />
                  <Line type="monotone" dataKey="clarity" stroke="hsl(var(--secondary-foreground))" strokeWidth={2} dot={{ r: 2 }} name="명료성" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3 h-3" /> 내 기록은 본인만 볼 수 있어요
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/mind-track/workbook")}>워크북 열기</Button>
        </div>
      </Card>
    </div>
  );
}
