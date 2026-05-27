import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Phone, X, AlertTriangle, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/components/common/Analytics";
import {
  shouldShow,
  recordShown,
  softDismiss,
  hardDismiss,
  getHesitationMs,
  type Trigger,
} from "@/lib/smartExpertRules";
import { readLastSelfCheck } from "@/lib/mindTrackSelfCheck";

// 페이지 레벨 시그널을 모아 “타이밍에 맞게” 전문가 연결을 제안하는 플로팅 배너.
// 노출 규칙은 src/lib/smartExpertRules.ts 에서 관리:
//   - 목표별 hesitation 시간 / 일부 trigger disable
//   - 24h 최대 노출 횟수 (urgent 제외)
//   - trigger 별 쿨다운, 야간 quiet hours (urgent 제외)
//   - 영구/세션 dismiss

export interface SmartExpertSignals {
  selfCheckLevel?: "calm" | "watch" | "support" | null;
  selfCheckGoalId?: string | null;
  /** 사용자가 현재 선택한 목표(셀프체크 미진행 단계 포함) */
  activeGoalId?: string | null;
  reportRiskHigh?: boolean;
  ctaClicked?: boolean;
}

type Mode = "urgent" | "standard";

export default function SmartExpertSuggestion(props: SmartExpertSignals) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("standard");
  const [reason, setReason] = useState<string>("");
  const [trigger, setTrigger] = useState<Trigger>("hesitation");
  const shownRef = useRef<boolean>(false);

  const goalForRules = props.selfCheckGoalId ?? props.activeGoalId ?? null;

  const tryOpen = (nextTrigger: Trigger, nextMode: Mode, why: string) => {
    if (shownRef.current) return;
    const decision = shouldShow({ goalId: goalForRules, trigger: nextTrigger });
    if (!decision.allow) {
      trackEvent("mt_smart_expert_blocked", {
        trigger: nextTrigger,
        reason: decision.reason,
        goal_id: goalForRules,
      });
      return;
    }
    shownRef.current = true;
    setTrigger(nextTrigger);
    setMode(nextMode);
    setReason(why);
    setOpen(true);
    recordShown(nextTrigger);
    trackEvent("mt_smart_expert_open", {
      mode: nextMode,
      trigger: nextTrigger,
      goal_id: goalForRules,
    });
  };

  // hesitation 타이머 (목표별 시간)
  useEffect(() => {
    if (props.ctaClicked) return;
    const ms = getHesitationMs(goalForRules);
    const t = setTimeout(() => {
      tryOpen(
        "hesitation",
        "standard",
        "결정이 어려우신가요? 30분 무료 매칭 상담으로 가볍게 시작할 수 있어요.",
      );
    }, ms);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.ctaClicked, goalForRules]);

  // 시그널 변화에 따라 즉시/지연 발화
  useEffect(() => {
    if (props.selfCheckLevel === "support") {
      tryOpen("support", "urgent", "셀프체크 결과 ‘도움 권장’ 단계로 측정되었습니다.");
      return;
    }
    if (props.reportRiskHigh) {
      tryOpen(
        "report_high",
        "standard",
        "방금 작성한 고민 리포트에서 회복 자원이 낮게 측정되었습니다.",
      );
      return;
    }
    if (props.selfCheckLevel === "watch") {
      const t = setTimeout(
        () =>
          tryOpen(
            "watch",
            "standard",
            "셀프체크가 ‘주의권’으로 측정되었어요. 한 번 점검해 두면 좋아요.",
          ),
        5000,
      );
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selfCheckLevel, props.reportRiskHigh]);

  const handleSoftDismiss = () => {
    setOpen(false);
    softDismiss();
    trackEvent("mt_smart_expert_dismiss", { mode, trigger, kind: "soft" });
  };

  const handleHardDismiss = () => {
    setOpen(false);
    hardDismiss();
    trackEvent("mt_smart_expert_dismiss", { mode, trigger, kind: "hard" });
  };

  const handleConnect = () => {
    trackEvent("mt_smart_expert_cta", { mode, trigger, goal_id: goalForRules });

    // 셀프체크/리포트 점수를 전문가 폼에 자동 프리필
    const params = new URLSearchParams({
      from: "smart_suggest",
      via: trigger,
    });
    if (goalForRules) params.set("goal", goalForRules);
    if (props.selfCheckLevel) params.set("level", props.selfCheckLevel);
    const last = readLastSelfCheck();
    if (last) {
      if (!params.has("level")) params.set("level", last.level);
      params.set("score", String(last.score));
      params.set("max", String(last.maxScore));
      params.set("check", last.share_id);
    }
    if (mode === "urgent") params.set("urgent", "true");

    navigate(`/expert-hiring?${params.toString()}`);
  };

  const accent = useMemo(() => {
    return mode === "urgent"
      ? { ring: "ring-rose-200", icon: AlertTriangle, iconCls: "text-rose-600", title: "지금 바로 전문가 연결을 권해드려요" }
      : { ring: "ring-[#C8B88A]/40", icon: Sparkles, iconCls: "text-[#8a7a4d]", title: "전문가 1:1 코칭이 도움이 될 시점이에요" };
  }, [mode]);

  const Icon = accent.icon;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 28 }}
          className="fixed inset-x-3 bottom-[88px] z-40 mx-auto max-w-md"
        >
          <div className={`bg-white rounded-3xl shadow-2xl ring-1 ${accent.ring} p-4 md:p-5 overflow-hidden`}>
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center">
                <Icon className={`w-4 h-4 ${accent.iconCls}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 break-keep">{accent.title}</p>
                <p className="text-[12px] text-slate-500 mt-0.5 break-keep">{reason}</p>
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  <Button
                    size="sm"
                    onClick={handleConnect}
                    className={`rounded-full text-xs ${
                      mode === "urgent"
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : "bg-slate-900 hover:bg-black text-white"
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5 mr-1.5" />
                    {mode === "urgent" ? "긴급 전문가 연결" : "전문가 매칭 보기"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSoftDismiss}
                    className="rounded-full text-xs text-slate-500 hover:text-slate-700"
                  >
                    나중에
                  </Button>
                  {mode !== "urgent" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleHardDismiss}
                      className="rounded-full text-[11px] text-slate-400 hover:text-slate-600"
                    >
                      <BellOff className="w-3 h-3 mr-1" />
                      다시 보지 않기
                    </Button>
                  )}
                </div>
              </div>
              <button
                onClick={handleSoftDismiss}
                className="shrink-0 w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
