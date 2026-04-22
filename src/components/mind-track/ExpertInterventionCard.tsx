import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ShieldCheck, ArrowRight, Award, MessageCircle, Crown, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Day 7 / 14 / 21 / 30 milestone에 자동 노출되는 전문가 개입 카드.
 * - Day 7: 전문가 텍스트 점검 ₩9,900 (소액 진입)
 * - Day 14: 1:1 미드체크 상담 ₩29,000 (핵심 전환점)
 * - Day 21: 위험 감지 시 긴급 매칭 ₩49,000
 * - Day 30: 다음 60일 프리미엄 트랙 ₩99,000 (졸업 업셀)
 */

export type InterventionDay = 7 | 14 | 21 | 30;

const OFFERINGS: Record<InterventionDay, {
  key: string;
  price: number;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  icon: typeof Sparkles;
  gradient: string;
  badge: string;
  benefits: string[];
  route: string;
}> = {
  7: {
    key: "text_review_9900",
    price: 9900,
    title: "1주차 적응 점검",
    subtitle: "전문가가 당신의 첫 7일을 직접 읽어드려요",
    description: "체크인 데이터를 전문가가 검토하고, 다음 3주를 위한 맞춤 조언을 텍스트로 전해드립니다. 24시간 내 답변.",
    cta: "₩9,900 전문가 점검 받기",
    icon: MessageCircle,
    gradient: "from-blue-500 to-cyan-500",
    badge: "Day 7 적응 점검",
    benefits: ["7일간의 체크인 데이터 분석", "맞춤 조언 텍스트 리포트", "24시간 내 회신 보장"],
    route: "/expert-hiring?intervention=day7&offering=text_review",
  },
  14: {
    key: "midcheck_29000",
    price: 29000,
    title: "절반 지점 1:1 미드체크",
    subtitle: "변화가 보이는 지금, 전문가와 40분 화상 상담",
    description: "지난 2주의 변화 그래프를 함께 보며 전문가가 남은 16일을 위한 개인 맞춤 전략을 설계해드립니다.",
    cta: "₩29,000 1:1 화상 상담 예약",
    icon: Award,
    gradient: "from-primary to-purple-600",
    badge: "🔥 Day 14 핵심 전환점",
    benefits: ["40분 1:1 화상 상담", "변화 그래프 함께 분석", "남은 16일 맞춤 로드맵"],
    route: "/expert-hiring?intervention=day14&offering=midcheck",
  },
  21: {
    key: "urgent_49000",
    price: 49000,
    title: "심화 단계 집중 케어",
    subtitle: "지금이 가장 중요한 시기에요",
    description: "마지막 9일을 가장 효과적으로 마무리할 수 있도록, 검증된 전문가 1:1 심화 상담을 우선 매칭해드립니다.",
    cta: "₩49,000 우선 매칭 신청",
    icon: ShieldCheck,
    gradient: "from-rose-500 to-orange-500",
    badge: "Day 21 심화 케어",
    benefits: ["검증 전문가 우선 매칭", "60분 심화 상담", "맞춤 마무리 가이드"],
    route: "/expert-hiring?intervention=day21&offering=urgent&urgent=true",
  },
  30: {
    key: "premium_track_99000",
    price: 99000,
    title: "다음 60일 프리미엄 트랙",
    subtitle: "30일 완주 회원 한정 30% 할인",
    description: "변화를 일상으로 정착시키는 60일 심화 프로그램. 전문가 매월 1회 화상 상담 + AI 맞춤 미션 + 종합 리포트 2회.",
    cta: "₩99,000 프리미엄 트랙 시작",
    icon: Crown,
    gradient: "from-amber-500 to-yellow-500",
    badge: "🎓 Day 30 졸업 특전",
    benefits: ["60일 심화 프로그램", "월 1회 전문가 상담 (총 2회)", "종합 변화 리포트 2회"],
    route: "/pricing?product=premium_60&from=mind_track_grad",
  },
};

interface Props {
  day: InterventionDay;
  enrollmentId: string;
}

export default function ExpertInterventionCard({ day, enrollmentId }: Props) {
  const navigate = useNavigate();
  const [intervention, setIntervention] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const offering = OFFERINGS[day];

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // 기존 개입 기록 확인
      const { data: existing } = await supabase
        .from("mind_track_interventions")
        .select("*")
        .eq("user_id", user.id)
        .eq("enrollment_id", enrollmentId)
        .eq("trigger_day", day)
        .maybeSingle();

      if (existing) {
        setIntervention(existing);
      } else {
        // suggested로 자동 생성
        const { data: created } = await supabase
          .from("mind_track_interventions")
          .insert({
            user_id: user.id,
            enrollment_id: enrollmentId,
            trigger_day: day,
            trigger_type: "day_milestone",
            offering_key: offering.key,
            offering_price: offering.price,
            status: "suggested",
          })
          .select()
          .single();
        setIntervention(created);
      }
      setLoading(false);
    })();
  }, [day, enrollmentId, offering.key, offering.price]);

  const trackAction = async (newStatus: "viewed" | "clicked" | "dismissed") => {
    if (!intervention) return;
    await supabase
      .from("mind_track_interventions")
      .update({ status: newStatus, acted_at: new Date().toISOString() })
      .eq("id", intervention.id);
  };

  // 첫 노출 시 viewed로 변경
  useEffect(() => {
    if (intervention?.status === "suggested") {
      trackAction("viewed");
    }
  }, [intervention?.id]);

  const handleClick = async () => {
    await trackAction("clicked");
    navigate(offering.route);
  };

  const handleDismiss = async () => {
    await trackAction("dismissed");
    toast.success("나중에 워크북 메뉴에서 다시 확인할 수 있어요");
  };

  if (loading || !intervention) return null;
  if (intervention.status === "dismissed" || intervention.status === "purchased" || intervention.status === "completed") {
    return null;
  }

  const Icon = offering.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="relative overflow-hidden border-2 border-primary/30 shadow-xl">
        <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${offering.gradient}`} />
        <div className="relative p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <Badge className={`bg-gradient-to-r ${offering.gradient} text-white border-0`}>
              {offering.badge}
            </Badge>
            <button
              onClick={handleDismiss}
              className="text-[11px] text-slate-400 hover:text-slate-600 underline shrink-0"
            >
              다음에
            </button>
          </div>

          <div className="flex items-start gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${offering.gradient} flex items-center justify-center shrink-0 shadow-md`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 break-keep leading-tight">
                {offering.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 break-keep">{offering.subtitle}</p>
            </div>
          </div>

          <p className="text-sm text-slate-700 mb-4 break-keep leading-relaxed">
            {offering.description}
          </p>

          <ul className="space-y-1.5 mb-4">
            {offering.benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                <span className="text-primary mt-0.5">✓</span>
                <span className="break-keep">{b}</span>
              </li>
            ))}
          </ul>

          <Button
            onClick={handleClick}
            size="lg"
            className={`w-full bg-gradient-to-r ${offering.gradient} text-white border-0 shadow-md hover:opacity-95 font-bold`}
          >
            {offering.cta}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>

          <p className="text-[10px] text-slate-500 text-center mt-2">
            <Sparkles className="w-3 h-3 inline mr-0.5" />
            검증된 전문가 매칭 · 안전결제 · 환불 보장
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

/**
 * 위험 패턴 감지 시 무료 케어 알림 카드
 */
export function RiskAlertCard({ alertType, onRequestHelp, onDismiss }: {
  alertType: "missed_3days" | "score_drop_30pct" | "low_engagement";
  onRequestHelp: () => void;
  onDismiss: () => void;
}) {
  const messages = {
    missed_3days: {
      title: "3일째 못 만났어요",
      desc: "괜찮으세요? 너무 무리하지 않으셔도 돼요. 어려운 점이 있다면 전문가가 도와드릴 수 있어요.",
    },
    score_drop_30pct: {
      title: "최근 점수가 많이 떨어졌어요",
      desc: "혼자 견디지 마세요. 전문가와 짧게 이야기 나눠보는 건 어떨까요?",
    },
    low_engagement: {
      title: "체크인이 짧아지고 있어요",
      desc: "프로그램이 잘 맞지 않을 수도 있어요. 전문가가 맞춤으로 조정해드릴 수 있어요.",
    },
  };
  const m = messages[alertType];

  return (
    <Card className="p-4 border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 text-sm break-keep">{m.title}</h4>
          <p className="text-xs text-slate-700 mt-1 break-keep">{m.desc}</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Button onClick={onRequestHelp} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
              전문가 도움 받기
            </Button>
            <Button onClick={onDismiss} size="sm" variant="ghost" className="text-slate-600">
              괜찮아요
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
