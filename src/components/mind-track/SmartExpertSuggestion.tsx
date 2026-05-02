import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Phone, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/components/common/Analytics";

// 페이지 레벨 시그널을 모아 “타이밍에 맞게” 전문가 연결을 제안하는 플로팅 배너.
// 트리거 우선순위:
//   1) selfCheckLevel === "support"  → 즉시 긴급 모드
//   2) selfCheckLevel === "watch"     → 5초 후 표준 모드
//   3) reportRiskHigh === true        → 즉시 표준 모드
//   4) hesitation (60초 이상 체류 + 결제 미클릭) → 표준 모드
// 한 세션 내에서 한 번 닫으면 다시 뜨지 않는다.

export interface SmartExpertSignals {
  /** 선택 목표 셀프체크 결과 */
  selfCheckLevel?: "calm" | "watch" | "support" | null;
  selfCheckGoalId?: string | null;
  /** 무료 고민 리포트의 risk 레벨이 ‘high’ 인 경우 */
  reportRiskHigh?: boolean;
  /** 사용자가 결제 CTA(트랙 시작/lock_card_cta)를 클릭한 적 있는가 */
  ctaClicked?: boolean;
}

const DISMISS_KEY = "mt_smart_expert_dismissed_v1";

type Mode = "urgent" | "standard";

export default function SmartExpertSuggestion(props: SmartExpertSignals) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("standard");
  const [reason, setReason] = useState<string>("");
  const dismissedRef = useRef<boolean>(false);
  const shownRef = useRef<boolean>(false);

  // 세션 내 dismiss 기억
  useEffect(() => {
    try {
      dismissedRef.current = sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      /* ignore */
    }
  }, []);

  // hesitation 타이머: 결제 CTA 미클릭 시 60초 후 발화
  const hesitationFiredRef = useRef(false);
  useEffect(() => {
    if (props.ctaClicked) return;
    const t = setTimeout(() => {
      hesitationFiredRef.current = true;
      maybeOpen();
    }, 60_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.ctaClicked]);

  // 시그널 변화에 따라 즉시/지연 발화
  useEffect(() => {
    if (props.selfCheckLevel === "support" || props.reportRiskHigh) {
      maybeOpen();
      return;
    }
    if (props.selfCheckLevel === "watch") {
      const t = setTimeout(() => maybeOpen(), 5000);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selfCheckLevel, props.reportRiskHigh]);

  function maybeOpen() {
    if (dismissedRef.current || shownRef.current) return;

    let nextMode: Mode = "standard";
    let why = "";
    if (props.selfCheckLevel === "support") {
      nextMode = "urgent";
      why = "셀프체크 결과 ‘도움 권장’ 단계로 측정되었습니다.";
    } else if (props.reportRiskHigh) {
      nextMode = "standard";
      why = "방금 작성한 고민 리포트에서 회복 자원이 낮게 측정되었습니다.";
    } else if (props.selfCheckLevel === "watch") {
      nextMode = "standard";
      why = "셀프체크가 ‘주의권’으로 측정되었어요. 한 번 점검해 두면 좋아요.";
    } else if (hesitationFiredRef.current) {
      nextMode = "standard";
      why = "결정이 어려우신가요? 30분 무료 매칭 상담으로 가볍게 시작할 수 있어요.";
    } else {
      return;
    }

    shownRef.current = true;
    setMode(nextMode);
    setReason(why);
    setOpen(true);
    trackEvent("mt_smart_expert_open", {
      mode: nextMode,
      goal_id: props.selfCheckGoalId ?? null,
      trigger: props.selfCheckLevel ?? (props.reportRiskHigh ? "report_high" : "hesitation"),
    });
  }

  const handleDismiss = () => {
    setOpen(false);
    try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
    trackEvent("mt_smart_expert_dismiss", { mode });
  };

  const handleConnect = () => {
    trackEvent("mt_smart_expert_cta", {
      mode,
      goal_id: props.selfCheckGoalId ?? null,
    });
    navigate(mode === "urgent" ? "/expert-hiring?urgent=true" : "/expert-hiring");
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
          className="fixed left-1/2 -translate-x-1/2 bottom-[88px] z-40 w-[calc(100%-24px)] max-w-md px-2"
        >
          <div className={`bg-white rounded-3xl shadow-2xl ring-1 ${accent.ring} p-4 md:p-5`}>
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center">
                <Icon className={`w-4.5 h-4.5 ${accent.iconCls}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 break-keep">{accent.title}</p>
                <p className="text-[12px] text-slate-500 mt-0.5 break-keep">{reason}</p>
                <div className="flex items-center gap-2 mt-3">
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
                    onClick={handleDismiss}
                    className="rounded-full text-xs text-slate-500 hover:text-slate-700"
                  >
                    나중에
                  </Button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
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
