/**
 * 7일 트랙 — 맞춤 미션 카드 (강화판)
 *
 * mind-track-init이 채운 데이터(why/action_steps/success)를 우선 표시하되,
 * 누락된 필드는 Day별 안전한 기본값으로 보강해 항상 "완성된 미션"으로 보이게 합니다.
 * - Day x/7 진행 배지 + 예상 소요
 * - 왜 지금 / 지금 할 일 / 완료 기준 / 작은 보상
 */
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Clock,
  Target,
  ListChecks,
  Flag,
  Trophy,
  ChevronRight,
} from "lucide-react";

interface DailyMission {
  mission_title: string | null;
  mission_description: string | null;
  why_it_matters: string | null;
  action_steps: any;
  success_criteria: string | null;
  estimated_minutes: number | null;
}

const sevenDayText = (value?: string | null) =>
  value ? value.replace(/30일/g, "7일").replace(/한 달/g, "7일") : value;

// Day별 안전한 기본 보강 카피 (데이터 누락 시에만 사용)
const DEFAULT_BY_DAY: Record<
  number,
  { why: string; steps: string[]; success: string; reward: string }
> = {
  1: {
    why: "첫날의 한 줄이 7일 전체의 방향을 정합니다. 길게 적지 않아도 충분해요.",
    steps: ["조용한 곳에서 1분 호흡", "지금 느끼는 감정 한 단어 고르기", "오늘의 한 줄을 칸에 적기"],
    success: "한 줄이라도 적었다면 오늘의 미션은 성공입니다.",
    reward: "첫 기록 배지를 얻어요.",
  },
  2: {
    why: "이틀째는 '느낀 것'을 '본 것'으로 옮기는 단계예요. 관찰이 변화를 시작합니다.",
    steps: ["오늘 짜증/불안이 올라온 순간 1개 떠올리기", "그 때 몸의 신호 적기", "다음에 어떻게 반응하고 싶은지 한 줄"],
    success: "장면 1개를 짧게라도 기록했다면 완료.",
    reward: "관찰 일지 1칸이 채워집니다.",
  },
  3: {
    why: "감정에 이름을 붙이면 강도가 30%까지 줄어듭니다(정서 라벨링).",
    steps: ["오늘 가장 큰 감정 1개", "그 감정에 정확한 이름 붙이기", "0~10점으로 강도 적기"],
    success: "감정 이름 + 강도까지 적으면 성공.",
    reward: "감정 패턴 분석에 데이터가 쌓여요.",
  },
  4: {
    why: "중간 지점입니다. 혼자 끌고 가지 말고, 외부 시선을 한 번 빌려보세요.",
    steps: ["지금까지의 기록 빠르게 훑기", "가장 자주 등장한 단어 1개 찾기", "전문가에게 보여줄지 결정"],
    success: "패턴 단어 1개를 찾으면 완료.",
    reward: "맞춤 전문가 추천이 열려요.",
  },
  5: {
    why: "변화는 작은 행동의 반복에서 나옵니다. 오늘은 '한 번'에 집중하세요.",
    steps: ["오늘 시도할 작은 행동 1개 정하기", "언제 할지 시각 적기", "끝나면 한 줄 후기"],
    success: "행동 1개 + 후기 한 줄이면 성공.",
    reward: "실천 스트릭이 이어집니다.",
  },
  6: {
    why: "머릿속이 가장 복잡할 때입니다. 글로 꺼내면 길이 보입니다.",
    steps: ["가장 무거운 고민 한 문장으로 적기", "지금 통제할 수 있는 1가지에 동그라미", "오늘 끝낼 1가지만 남기기"],
    success: "고민 한 문장 + 통제 가능 1가지면 완료.",
    reward: "AI가 내일 미션을 더 정교하게 만들어요.",
  },
  7: {
    why: "한 주를 짧게 닫는 의식이 다음 주를 가볍게 시작하게 합니다.",
    steps: ["지난 한 주 잘한 점 1가지", "다음 주에 기대되는 점 1가지", "한 줄 다짐 적기"],
    success: "두 줄 + 한 줄 다짐이면 7일 완주입니다.",
    reward: "7일 완주 리포트가 생성됩니다.",
  },
};

export default function PersonalizedMissionCard({
  mission,
  day,
}: {
  mission: DailyMission | null;
  day: number;
}) {
  if (!mission || !mission.mission_title) return null;

  const fallback = DEFAULT_BY_DAY[day] ?? DEFAULT_BY_DAY[1];

  const rawSteps = Array.isArray(mission.action_steps)
    ? mission.action_steps
        .filter((s: any): s is string => typeof s === "string" && s.trim().length > 0)
        .map((s) => sevenDayText(s) ?? "")
    : [];
  const steps = rawSteps.length > 0 ? rawSteps : fallback.steps;

  const title = sevenDayText(mission.mission_title) ?? "";
  const description = sevenDayText(mission.mission_description);
  const why = sevenDayText(mission.why_it_matters) || fallback.why;
  const success = sevenDayText(mission.success_criteria) || fallback.success;
  const minutes = mission.estimated_minutes ?? 5;

  return (
    <Card className="relative bg-white rounded-3xl border-[#C8B88A]/40 ring-1 ring-[#C8B88A]/20 p-6 space-y-5 shadow-sm overflow-hidden">
      {/* 진행 스트립 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-[#C8B88A] to-[#8a7a4d]"
          style={{ width: `${(day / 7) * 100}%` }}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-[#C8B88A]/15 text-[#8a7a4d] border-[#C8B88A]/30 hover:bg-[#C8B88A]/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Day {day} · 당신의 고민에서 만든 미션
          </Badge>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3 h-3" /> 약 {minutes}분
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <ChevronRight className="w-3 h-3" /> {day}/7
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 break-keep leading-snug">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-slate-600 leading-relaxed break-keep">{description}</p>
        )}
      </div>

      <div className="rounded-2xl bg-slate-50 px-4 py-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Target className="w-3.5 h-3.5" /> 왜 지금 이 미션인가
        </div>
        <p className="text-sm text-slate-700 leading-relaxed break-keep">{why}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <ListChecks className="w-3.5 h-3.5" /> 지금 할 일 (순서대로)
        </div>
        <ol className="space-y-2">
          {steps.map((s: string, i: number) => (
            <li
              key={i}
              className="flex gap-3 items-start rounded-2xl border border-slate-100 bg-white px-3 py-2.5"
            >
              <span className="shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm text-slate-800 leading-relaxed break-keep">{s}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
          <Flag className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-emerald-800 mb-0.5">오늘의 완료 기준</div>
            <p className="text-sm text-emerald-900 leading-relaxed break-keep">{success}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-2xl border border-[#C8B88A]/30 bg-[#FBF8F0]/60 px-4 py-3">
          <Trophy className="w-4 h-4 text-[#8a7a4d] mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-[#8a7a4d] mb-0.5">오늘의 작은 보상</div>
            <p className="text-sm text-slate-800 leading-relaxed break-keep">{fallback.reward}</p>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 text-center pt-1">
        아래 칸을 채우고 "완료"를 눌러주세요.
      </p>
    </Card>
  );
}
