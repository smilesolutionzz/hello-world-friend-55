import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Sparkles, MessageCircle, Award, ShieldCheck, Crown, ClipboardCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const OFFERING_INFO: Record<string, { label: string; price: number; icon: any; color: string; topic: string }> = {
  text_review: { label: "Day 7 텍스트 점검 (₩9,900)", price: 9900, icon: MessageCircle, color: "from-blue-500 to-cyan-500", topic: "7일 마음 트랙 중간 점검을 받고 싶어요. 지금까지의 체크인 데이터를 검토해주세요." },
  midcheck: { label: "Day 14 미드체크 (₩29,000)", price: 29000, icon: Award, color: "from-primary to-purple-600", topic: "마음 트랙 절반 지점에서 1:1 미드체크 상담을 받고 싶어요. 변화 그래프를 함께 보고 싶습니다." },
  urgent: { label: "Day 21 심화 케어 (시간권 1h · ₩39,000)", price: 39000, icon: ShieldCheck, color: "from-rose-500 to-orange-500", topic: "마음 트랙 후반부를 위한 심화 케어 우선 매칭이 필요해요." },
  premium_60: { label: "Day 30 프리미엄 트랙 (₩99,000)", price: 99000, icon: Crown, color: "from-amber-500 to-yellow-500", topic: "마음 트랙을 완료했어요. 다음 60일 프리미엄 트랙에 등록하고 싶어요." },
};

const GOAL_LABEL: Record<string, string> = {
  sleep: "수면 회복", stress: "스트레스 케어", mood: "감정 안정", focus: "집중력",
  relationship: "관계", self: "자기 이해", parenting: "육아 번아웃",
  family_communication: "아이와의 소통", child_development: "아이 발달 걱정",
};

const LEVEL_LABEL: Record<string, string> = {
  calm: "안정권", watch: "주의권", support: "도움 권장",
};

interface PrefilledContext {
  from: string | null;
  day: string | null;
  offering: string | null;
  intervention: string | null;
  topic: string;
  badge: string;
  icon: any;
  color: string;
  /** 폼 메모에 추가할 점수/링크 정보 */
  scoreLine?: string;
}

/**
 * ExpertHiring 페이지에서 ?from=mission_difficult / ?intervention=... 등이 있을 때
 * 상단에 컨텍스트 배너를 표시하고, 예약 폼에 주제를 자동 프리필합니다.
 */
export function useMindTrackPrefill(): PrefilledContext | null {
  const [params] = useSearchParams();
  const from = params.get("from");
  const day = params.get("day") || params.get("intervention")?.replace("day", "") || null;
  const offering = params.get("offering");
  const intervention = params.get("intervention");

  const goal = params.get("goal");
  const level = params.get("level");
  const score = params.get("score");
  const max = params.get("max");
  const checkId = params.get("check");
  const via = params.get("via");

  if (!from && !offering && !intervention) return null;

  let topic = "";
  let badge = "";
  let Icon: any = Sparkles;
  let color = "from-primary to-purple-600";
  let scoreLine: string | undefined;

  if (from === "mission_difficult") {
    topic = `오늘의 마음 트랙 미션(Day ${day ?? "?"})이 어렵게 느껴져요. 어떻게 풀어가면 좋을지 도와주세요.`;
    badge = `Day ${day ?? "?"} 미션 어려움`;
    Icon = AlertCircle;
    color = "from-amber-500 to-orange-500";
  } else if (from === "risk_alert") {
    topic = "마음 트랙 진행 중 어려움이 감지되어 무료 케어 전문가 매칭을 요청합니다.";
    badge = "위험 감지 케어콜";
    Icon = AlertCircle;
    color = "from-rose-500 to-red-500";
  } else if (from === "self_check" || (from === "smart_suggest" && goal)) {
    const goalLabel = goal ? (GOAL_LABEL[goal] ?? goal) : "선택 목표";
    const levelLabel = level ? (LEVEL_LABEL[level] ?? level) : "";
    topic = `[${goalLabel}] 셀프체크 결과 ${levelLabel}${score && max ? ` (${score}/${max})` : ""}로 측정되어, 1:1로 점검과 다음 단계 안내를 받고 싶어요.`;
    badge = `${goalLabel} · ${levelLabel || "셀프체크"}`;
    Icon = ClipboardCheck;
    color = level === "support"
      ? "from-rose-500 to-orange-500"
      : level === "watch"
        ? "from-amber-500 to-yellow-500"
        : "from-emerald-500 to-cyan-500";
    if (score && max) {
      const url = checkId ? `${typeof window !== "undefined" ? window.location.origin : ""}/mind-track/check/${checkId}` : null;
      scoreLine = `[self_check] goal=${goal} level=${level} score=${score}/${max}${url ? ` link=${url}` : ""}${via ? ` via=${via}` : ""}`;
    }
  } else if (offering && OFFERING_INFO[offering]) {
    const info = OFFERING_INFO[offering];
    topic = info.topic;
    badge = info.label;
    Icon = info.icon;
    color = info.color;
  }

  return { from, day, offering, intervention, topic, badge, icon: Icon, color, scoreLine };
}

interface Props {
  ctx: PrefilledContext;
}

export default function MindTrackContextBanner({ ctx }: Props) {
  const Icon = ctx.icon;
  const [tracked, setTracked] = useState(false);

  // intervention id가 있으면 클릭 추적 (clicked 상태로 보장)
  useEffect(() => {
    if (tracked) return;
    if (!ctx.offering && !ctx.day) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const dayNum = ctx.day ? Number(ctx.day) : null;
      if (!dayNum) return;
      // 가장 최근 해당 day 개입 행을 clicked로 업데이트
      const { data: rows } = await supabase
        .from("mind_track_interventions")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("trigger_day", dayNum)
        .order("created_at", { ascending: false })
        .limit(1);
      const row = rows?.[0];
      if (row && !["purchased", "completed"].includes(row.status)) {
        await supabase
          .from("mind_track_interventions")
          .update({ status: "clicked", acted_at: new Date().toISOString() })
          .eq("id", row.id);
        // 결제 매칭용으로 sessionStorage에 저장
        sessionStorage.setItem("mind_track_intervention_id", row.id);
      } else if (row) {
        sessionStorage.setItem("mind_track_intervention_id", row.id);
      }
      setTracked(true);
    })();
  }, [ctx.offering, ctx.day, tracked]);

  return (
    <Card className={`p-4 mb-4 border-2 border-primary/30 bg-gradient-to-br ${ctx.color} text-white shadow-lg`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge className="bg-white/25 text-white border-0 text-[10px]">마음 트랙</Badge>
            <Badge className="bg-white text-slate-900 border-0 text-[10px] font-bold">{ctx.badge}</Badge>
          </div>
          <p className="text-sm font-medium break-keep leading-snug">{ctx.topic}</p>
          <p className="text-[11px] opacity-90 mt-1 break-keep">
            ↓ 아래에서 전문가를 선택하면 예약 메모에 자동으로 위 내용이 채워져요.
          </p>
        </div>
      </div>
    </Card>
  );
}
