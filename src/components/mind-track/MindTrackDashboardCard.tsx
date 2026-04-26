import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, ChevronRight, Target, PlayCircle, BookOpen, AlertCircle,
  Coffee, RefreshCw, Info, CalendarClock,
} from "lucide-react";
import { useMindTrackDashboard } from "@/hooks/useMindTrackDashboard";

export default function MindTrackDashboardCard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, refresh } = useMindTrackDashboard();

  // 자동 리디렉트 가드
  const onMindTrackRoute = location.pathname.startsWith("/mind-track");

  const goWorkbook = (day?: number) => {
    if (onMindTrackRoute) return;
    navigate(day ? `/mind-track/workbook?day=${day}` : "/mind-track/workbook", {
      state: day ? { day } : undefined,
    });
  };
  const goMindTrackHome = () => {
    if (onMindTrackRoute) return;
    navigate("/mind-track");
  };
  const goStart = () => {
    if (onMindTrackRoute) return;
    navigate("/mind-track/start");
  };

  if (state.kind === "loading" || state.kind === "none") return null;

  // 공통 안내: 마음 트랙 페이지에 이미 있을 때
  const OnRouteNote = onMindTrackRoute ? (
    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-100 rounded-md px-2 py-1 mb-2">
      <Info className="w-3 h-3" /> 이미 마음 트랙 페이지에 있어 이동 버튼이 비활성화되었어요
    </div>
  ) : null;

  if (state.kind === "error") {
    return (
      <Card className="p-4 border-2 border-red-200 bg-red-50/60 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 mb-1">마음 트랙 정보를 불러오지 못했어요</div>
            <div className="text-xs text-slate-600 break-keep mb-2">{state.message}</div>
            <Button size="sm" variant="outline" onClick={refresh}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> 다시 불러오기
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (state.kind === "needs_baseline") {
    return (
      <Card className="p-5 border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 mb-6">
        {OnRouteNote}
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
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={goStart}
                disabled={onMindTrackRoute}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
              >
                <PlayCircle className="w-4 h-4 mr-1.5" /> 기초 진단 시작하기
              </Button>
              <Button variant="outline" onClick={refresh}>
                <RefreshCw className="w-4 h-4 mr-1.5" /> 진단 완료했어요
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // active
  const { workbook, currentDay, rawDay, hasStartedAt, todayMission, completed } = state;

  // Day가 1~30 범위를 벗어난 경우 (started_at 미설정 또는 30일 초과)
  if (rawDay < 1 || rawDay > 30 || !hasStartedAt) {
    const reason = !hasStartedAt
      ? "트랙 시작일(started_at)이 아직 설정되지 않았어요."
      : rawDay < 1
      ? "트랙 시작일이 미래로 설정되어 있어요."
      : "30일 트랙이 종료되었어요. 새 진단으로 다음 사이클을 시작해 보세요.";
    return (
      <Card className="p-5 border-2 border-slate-300 bg-slate-50 mb-6">
        {OnRouteNote}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-200 shrink-0">
            <CalendarClock className="w-5 h-5 text-slate-700" />
          </div>
          <div className="flex-1 min-w-0">
            <Badge className="mb-2 bg-slate-200 text-slate-800 border-slate-300">
              <Sparkles className="w-3 h-3 mr-1" /> 30일 마음 트랙
            </Badge>
            <h3 className="font-bold text-slate-900 mb-1 break-keep">
              현재 진행일을 계산할 수 없어요 (Day {rawDay})
            </h3>
            <p className="text-sm text-slate-600 mb-3 break-keep">{reason}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={goStart}
                disabled={onMindTrackRoute}
                className="bg-gradient-to-r from-primary to-purple-600 text-white"
              >
                <PlayCircle className="w-4 h-4 mr-1.5" /> 진단 다시 시작하기
              </Button>
              <Button variant="outline" onClick={refresh}>
                <RefreshCw className="w-4 h-4 mr-1.5" /> 새로고침
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5 mb-6">
      {OnRouteNote}
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

      {todayMission ? (
        <div className="p-3 rounded-lg bg-white/80 border border-slate-200 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-primary font-bold mb-1">
            <Target className="w-3.5 h-3.5" /> 오늘의 미션 · Day {currentDay}
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
      ) : (
        <div className="p-3 rounded-lg bg-slate-50 border border-dashed border-slate-300 mb-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
            <Coffee className="w-3.5 h-3.5" /> 오늘은 여유 있는 하루
          </div>
          <div className="text-sm text-slate-700 break-keep">
            오늘(Day {currentDay})의 미션이 아직 준비되지 않았어요. 워크북에서 지난 미션을 돌아보거나 짧은 호흡 한 번을 가져보세요.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Button
          onClick={goMindTrackHome}
          disabled={onMindTrackRoute}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white"
        >
          <Target className="w-4 h-4 mr-1.5" /> 오늘 미션 바로 보기
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        <Button
          onClick={() => goWorkbook(currentDay)}
          disabled={onMindTrackRoute}
          className="w-full bg-gradient-to-r from-primary to-purple-600 text-white"
        >
          <BookOpen className="w-4 h-4 mr-1.5" /> Day {currentDay} 워크북
        </Button>
        <Button onClick={refresh} variant="outline" className="w-full">
          <RefreshCw className="w-4 h-4 mr-1.5" /> 새로고침
        </Button>
      </div>
    </Card>
  );
}
