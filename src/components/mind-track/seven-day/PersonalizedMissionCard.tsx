/**
 * 7일 트랙 — 사용자 고민으로 mind-track-init이 생성한 맞춤 미션 카드.
 * Day별로 mind_track_daily_missions에서 fetch 후 표시.
 * - 명확한 미션 제목
 * - 왜 중요한가 (why_it_matters)
 * - 행동 액션 1-2-3 (action_steps)
 * - 성공 기준 (success_criteria)
 *
 * 데이터가 없으면 렌더링하지 않음 (silent fallback to static mission).
 */
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, Target, ListChecks, Flag } from "lucide-react";

interface DailyMission {
  mission_title: string | null;
  mission_description: string | null;
  why_it_matters: string | null;
  action_steps: any;
  success_criteria: string | null;
  estimated_minutes: number | null;
}

export default function PersonalizedMissionCard({ mission, day }: { mission: DailyMission | null; day: number }) {
  if (!mission || !mission.mission_title) return null;
  const steps = Array.isArray(mission.action_steps) ? mission.action_steps.filter((s: any) => typeof s === "string" && s.trim()) : [];

  return (
    <Card className="bg-white rounded-3xl border-[#C8B88A]/40 ring-1 ring-[#C8B88A]/20 p-6 space-y-5 shadow-sm">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-[#C8B88A]/15 text-[#8a7a4d] border-[#C8B88A]/30 hover:bg-[#C8B88A]/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Day {day} · 당신의 고민에서 만든 미션
          </Badge>
          {mission.estimated_minutes ? (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" /> 약 {mission.estimated_minutes}분
            </span>
          ) : null}
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 break-keep leading-snug">
          {mission.mission_title}
        </h2>
        {mission.mission_description && (
          <p className="text-sm text-slate-600 leading-relaxed break-keep">{mission.mission_description}</p>
        )}
      </div>

      {mission.why_it_matters && (
        <div className="rounded-2xl bg-slate-50 px-4 py-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Target className="w-3.5 h-3.5" /> 왜 지금 이 미션인가
          </div>
          <p className="text-sm text-slate-700 leading-relaxed break-keep">{mission.why_it_matters}</p>
        </div>
      )}

      {steps.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <ListChecks className="w-3.5 h-3.5" /> 지금 할 일 (순서대로)
          </div>
          <ol className="space-y-2">
            {steps.map((s: string, i: number) => (
              <li key={i} className="flex gap-3 items-start rounded-2xl border border-slate-100 bg-white px-3 py-2.5">
                <span className="shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-slate-800 leading-relaxed break-keep">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {mission.success_criteria && (
        <div className="flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
          <Flag className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-emerald-800 mb-0.5">오늘의 완료 기준</div>
            <p className="text-sm text-emerald-900 leading-relaxed break-keep">{mission.success_criteria}</p>
          </div>
        </div>
      )}

      <p className="text-[11px] text-slate-400 text-center pt-1">
        아래 칸에 한 줄 기록하고 “완료”를 눌러주세요.
      </p>
    </Card>
  );
}
