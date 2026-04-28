import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, ChevronRight, Sparkles, BarChart3, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  currentDay: number;
  completedCount: number;
  baseline: any | null;
  latest: any | null;
}

interface Milestone {
  day: number;
  label: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaPath: string;
  color: string;
}

const MILESTONES: Milestone[] = [
  {
    day: 7,
    label: "1주차 완주",
    title: "첫 주 인사이트가 준비됐어요",
    description: "지난 7일 체크인을 바탕으로 한 첫 주 변화 패턴을 확인해보세요.",
    ctaLabel: "1주차 인사이트 보기",
    ctaPath: "/my-journey",
    color: "from-blue-500 to-cyan-500",
  },
  {
    day: 14,
    label: "2주차 완주",
    title: "2주차 변화 점검",
    description: "시작 점수와 비교해 어떤 영역이 부드러워졌는지 자가진단을 받아보세요.",
    ctaLabel: "2주차 변화 보기",
    ctaPath: "/my-journey",
    color: "from-emerald-500 to-teal-500",
  },
  {
    day: 21,
    label: "3주차 완주",
    title: "3주차 코칭 인사이트",
    description: "RCI(신뢰변화지수) 기반의 깊이 있는 코칭 메시지가 도착했어요.",
    ctaLabel: "3주차 코칭 받기",
    ctaPath: "/my-journey",
    color: "from-amber-500 to-orange-500",
  },
  {
    day: 28,
    label: "4주차 완주",
    title: "4주차 깊이 있는 정리",
    description: "4주간의 변화 흐름을 한 문장으로 요약하고 종합 리포트를 준비해요.",
    ctaLabel: "변화 흐름 보기",
    ctaPath: "/my-journey",
    color: "from-purple-500 to-pink-500",
  },
];

export default function WeeklyMilestoneCards({ currentDay, completedCount, baseline, latest }: Props) {
  const navigate = useNavigate();
  // 도달한 마일스톤 중 가장 최근 1~2개만 노출 (UI 과밀 방지)
  const reached = MILESTONES.filter((m) => currentDay >= m.day).slice(-2);
  if (reached.length === 0) return null;

  return (
    <div className="space-y-3">
      {reached.map((m) => {
        // baseline vs latest 간단 변화량 (있을 때만)
        const stressDiff = baseline && latest ? (baseline.stress_score ?? 0) - (latest.stress_score ?? 0) : null;
        const energyDiff = baseline && latest ? (latest.energy_score ?? 0) - (baseline.energy_score ?? 0) : null;
        return (
          <Card
            key={m.day}
            className="p-5 border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50/40 shadow-md"
          >
            <div className="flex items-start gap-3 mb-3 flex-wrap">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} text-white flex items-center justify-center flex-shrink-0`}>
                <Award className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge className="bg-amber-500 text-white border-0">Day {m.day} 도달</Badge>
                  <span className="text-xs text-slate-500">{m.label}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 break-keep leading-snug">{m.title}</h3>
              </div>
            </div>
            <p className="text-sm text-slate-600 break-keep leading-relaxed mb-3">
              {m.description}
            </p>

            {(stressDiff !== null || energyDiff !== null) && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {stressDiff !== null && (
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-center">
                    <BarChart3 className="w-3.5 h-3.5 text-rose-500 mx-auto mb-0.5" />
                    <div className="text-[10px] text-slate-500">스트레스</div>
                    <div className={`text-sm font-bold ${stressDiff > 0 ? "text-emerald-600" : "text-slate-700"}`}>
                      {stressDiff > 0 ? "↓" : stressDiff < 0 ? "↑" : "·"}{Math.abs(stressDiff)}
                    </div>
                  </div>
                )}
                {energyDiff !== null && (
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-center">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-500 mx-auto mb-0.5" />
                    <div className="text-[10px] text-slate-500">에너지</div>
                    <div className={`text-sm font-bold ${energyDiff > 0 ? "text-emerald-600" : "text-slate-700"}`}>
                      {energyDiff > 0 ? "↑" : energyDiff < 0 ? "↓" : "·"}{Math.abs(energyDiff)}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] text-slate-500">
                지금까지 {completedCount}일 체크인 완료
              </span>
              <Button
                size="sm"
                onClick={() => navigate(m.ctaPath)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                {m.ctaLabel}
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
