import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AlertType = "missed_3days" | "score_drop_30pct" | "low_engagement";

interface RiskAlert {
  id: string;
  alert_type: AlertType;
  severity: string;
  detected_at: string;
}

/**
 * 30일 트랙 위험 패턴 자동 감지 훅
 * - 3일 연속 미체크인
 * - 베이스라인 대비 30% 이상 점수 악화
 */
export function useMindTrackRiskDetection(
  enrollmentId: string | null,
  checkins: any[],
  baselines: any[],
  currentDay: number,
) {
  const [activeAlert, setActiveAlert] = useState<RiskAlert | null>(null);

  useEffect(() => {
    if (!enrollmentId || currentDay < 3) return;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 이미 미해결 알림이 있으면 그대로 표시
      const { data: existing } = await supabase
        .from("mind_track_risk_alerts")
        .select("*")
        .eq("user_id", user.id)
        .eq("enrollment_id", enrollmentId)
        .is("resolved_at", null)
        .order("detected_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        setActiveAlert(existing as RiskAlert);
        return;
      }

      // 패턴 1: 최근 3일 연속 미체크인
      const last3 = [currentDay - 1, currentDay - 2, currentDay - 3];
      const missed3 = last3.every((d) => {
        const c = checkins.find((x) => x.day_number === d);
        return !c?.completed;
      });

      let alertType: AlertType | null = null;
      let triggerData: any = {};

      if (missed3) {
        alertType = "missed_3days";
        triggerData = { missed_days: last3 };
      } else {
        // 패턴 2: 점수 30% 악화 (베이스라인 대비)
        const baseline = baselines.find((b) => b.measurement_point === "baseline");
        const recentCheckin = checkins
          .filter((c) => c.completed && c.mood_score != null)
          .sort((a, b) => b.day_number - a.day_number)[0];
        if (baseline && recentCheckin) {
          // mood/energy/clarity는 0-10, baseline은 0-100
          const baselineEnergy = baseline.energy_score ?? 50;
          const currentEnergy = (recentCheckin.energy_score ?? 5) * 10;
          const drop = baselineEnergy - currentEnergy;
          if (baselineEnergy > 0 && drop / baselineEnergy >= 0.3) {
            alertType = "score_drop_30pct";
            triggerData = { baseline_energy: baselineEnergy, current_energy: currentEnergy, drop_pct: Math.round((drop / baselineEnergy) * 100) };
          }
        }
      }

      if (alertType) {
        const { data: created } = await supabase
          .from("mind_track_risk_alerts")
          .insert({
            user_id: user.id,
            enrollment_id: enrollmentId,
            alert_type: alertType,
            severity: alertType === "score_drop_30pct" ? "high" : "medium",
            trigger_data: triggerData,
            notification_channel: "in_app",
            notification_sent: true,
          })
          .select()
          .single();
        if (created) setActiveAlert(created as RiskAlert);
      }
    })();
  }, [enrollmentId, currentDay, checkins.length, baselines.length]);

  const resolveAlert = async (response: "acknowledged" | "requested_help" | "ignored") => {
    if (!activeAlert) return;
    await supabase
      .from("mind_track_risk_alerts")
      .update({
        user_response: response,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", activeAlert.id);
    setActiveAlert(null);
  };

  return { activeAlert, resolveAlert };
}
